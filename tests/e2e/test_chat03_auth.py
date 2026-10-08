from __future__ import annotations
import base64
import pytest
from fastapi.testclient import TestClient
from bp_api.app import create_app
from bp_api.config import Settings
from bp_api.composition import Services
from bp_application import TrustedContextService, AuthorizationService, SessionAuthority, AuthService, PasswordPolicy, PasswordCodec, SetWeakPasswordChecker
from bp_application.security import totp
from bp_adapters.security_store import InMemorySecurityStateStore
from bp_adapters.secrets import LocalEnvelopeSecretProvider
from bp_adapters.mail import RecordingMailAdapter
from bp_domain.security import AdminPrincipal,AccountState,CredentialRecord,MfaRecord
from tests.fixtures.chat03_fakes import FakeSites,FakeIdentities,FakeAudit,FakePublic,FakeGlobals,SiteContextPayload
from datetime import UTC, datetime

PASSWORD='correct horse battery staple'

def build(super_admin=False,mfa=False,require_mfa_on_login=True):
    codec=PasswordCodec(); p=AdminPrincipal('admin-1','admin@example.test',AccountState.ACTIVE,super_admin,mfa,frozenset({'sites.view'}),{'SITE-01':frozenset({'posts.view'})})
    ids=FakeIdentities(p,codec.hash(PASSWORD)); state=InMemorySecurityStateStore(); audit=FakeAudit(); mail=RecordingMailAdapter(); secrets=LocalEnvelopeSecretProvider()
    import asyncio
    asyncio.run(state.put_credential(CredentialRecord('admin-1',ids.verifier,'argon2id',{'memory_kib':65536,'iterations':3,'parallelism':1,'salt_bytes':16,'hash_bytes':32},datetime.now(UTC))))
    auth=AuthService(ids,state,secrets,audit,mail,PasswordPolicy(SetWeakPasswordChecker({'password12345'})),codec,require_mfa_on_login=require_mfa_on_login)
    services=Services(TrustedContextService(FakeSites()),AuthorizationService(ids),SessionAuthority(state,ids),auth,FakePublic(),FakeGlobals(),audit,site_context_payload=SiteContextPayload())
    app=create_app(settings=Settings('test','contracts/http/BLOG-DOC-15_openapi_v1.0-RC10.yaml',('https://admin.test',),'https://admin.test/reset',False),services=services)
    return app,services,ids,state,audit,mail,secrets

def test_login_is_enumeration_safe_and_sets_host_only_session():
    app,*_=build(); c=TestClient(app,base_url='https://admin.test')
    r=c.post('/api/v1/auth/login',json={'email':'admin@example.test','password':PASSWORD})
    assert r.status_code==200 and r.json()['state']=='AUTHENTICATED'
    assert '__Host-bp_admin_session=' in r.headers['set-cookie']
    assert 'HttpOnly' in r.headers['set-cookie'] and 'Secure' in r.headers['set-cookie']
    bad=c.post('/api/v1/auth/login',json={'email':'nobody@example.test','password':PASSWORD})
    assert bad.status_code==401 and bad.json()['error']['message']=='Authentication required.'

def test_csrf_and_origin_required_for_unsafe_session_action():
    app,*_=build(); c=TestClient(app,base_url='https://admin.test')
    assert c.post('/api/v1/auth/login',json={'email':'admin@example.test','password':PASSWORD}).status_code==200
    denied=c.post('/api/v1/auth/logout')
    assert denied.status_code==403
    csrf=c.cookies.get('__Host-bp_csrf')
    ok=c.post('/api/v1/auth/logout',headers={'Origin':'https://admin.test','X-CSRF-Token':csrf})
    assert ok.status_code==204

def test_ordinary_account_cannot_use_legacy_global_permission():
    app,services,*_=build(); c=TestClient(app,base_url='https://admin.test')
    c.post('/api/v1/auth/login',json={'email':'admin@example.test','password':PASSWORD})
    r=c.get('/api/v1/admin/context')
    assert r.status_code==403
    assert services.global_operations.calls == []

def test_development_policy_allows_super_admin_password_login_and_global_context():
    app,services,*_=build(super_admin=True,require_mfa_on_login=False); c=TestClient(app,base_url='https://admin.test')
    login=c.post('/api/v1/auth/login',json={'email':'admin@example.test','password':PASSWORD})
    assert login.status_code==200 and login.json()['state']=='AUTHENTICATED'
    r=c.get('/api/v1/admin/context')
    assert r.status_code==200
    assert services.global_operations.calls[-1][0]=='API15-G-001'

def test_super_admin_password_login_remains_available_when_mfa_not_enrolled():
    app,services,*_=build(super_admin=True,require_mfa_on_login=True); c=TestClient(app,base_url='https://admin.test')
    login=c.post('/api/v1/auth/login',json={'email':'admin@example.test','password':PASSWORD})
    assert login.status_code==200 and login.json()['state']=='AUTHENTICATED'
    r=c.get('/api/v1/admin/context')
    assert r.status_code==200

def test_site_context_wrong_assignment_is_404_not_disclosure():
    app,services,ids,*_=build(); c=TestClient(app,base_url='https://admin.test')
    c.post('/api/v1/auth/login',json={'email':'admin@example.test','password':PASSWORD})
    assert c.get('/api/v1/admin/sites/SITE-01/context').status_code==200
    ids.principal=AdminPrincipal('admin-1','admin@example.test',AccountState.ACTIVE,False,False,frozenset({'sites.view'}),{})
    assert c.get('/api/v1/admin/sites/SITE-01/context').status_code==404

def test_mfa_login_verification_replay_protected():
    app,services,ids,state,audit,mail,secrets=build(super_admin=True,mfa=True)
    secret=b'12345678901234567890'
    import asyncio
    enc=asyncio.run(secrets.encrypt(secret,'MFA_TOTP')); asyncio.run(state.put_mfa(MfaRecord('admin-1',enc,True)))
    c=TestClient(app,base_url='https://admin.test')
    r=c.post('/api/v1/auth/login',json={'email':'admin@example.test','password':PASSWORD}); assert r.status_code==200 and r.json()['state']=='MFA_REQUIRED'
    code=totp(secret,int(datetime.now(UTC).timestamp())//30)
    vr=c.post('/api/v1/auth/mfa/verify',json={'challenge_id':r.json()['mfa_challenge_id'],'code':code})
    assert vr.status_code==200 and vr.json()['result']=='VERIFIED'
    replay=c.post('/api/v1/auth/mfa/verify',json={'challenge_id':r.json()['mfa_challenge_id'],'code':code})
    assert replay.status_code==401

def test_reset_request_is_neutral():
    app,services,ids,state,audit,mail,secrets=build(); c=TestClient(app,base_url='https://admin.test')
    a=c.post('/api/v1/auth/password-reset/request',json={'email':'admin@example.test'}); b=c.post('/api/v1/auth/password-reset/request',json={'email':'missing@example.test'})
    assert a.status_code==b.status_code==202
    assert a.json()['accepted'] is True and b.json()['accepted'] is True
