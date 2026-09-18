// GENERATED FILE — DO NOT EDIT.
// Source: contracts/http/BLOG-DOC-15_openapi_v1.0-RC8.yaml
// Source SHA-256: bf577a463b4c5d8fdceddc2087f53216426ef88d67d8e1a0d22ccf819751cd00

export const operationRegistry = {
  "API15-AUTH-001": {
    "authContext": "NONE",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/login",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_LOGIN",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 200
  },
  "API15-AUTH-002": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/logout",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_SESSION",
    "requestContentType": null,
    "siteContext": "AUTH",
    "successStatus": 204
  },
  "API15-AUTH-003": {
    "authContext": "INVITE_SETUP_TOKEN",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/invitations/accept",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_TOKEN",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 200
  },
  "API15-AUTH-004": {
    "authContext": "INVITE_SETUP_TOKEN_OR_ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/password/setup",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_TOKEN",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 200
  },
  "API15-AUTH-005": {
    "authContext": "NONE",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/password-reset/request",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_RESET_REQUEST",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 202
  },
  "API15-AUTH-006": {
    "authContext": "RESET_TOKEN",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/password-reset/complete",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_TOKEN",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 204
  },
  "API15-AUTH-007": {
    "authContext": "ADMIN_SESSION_OR_INVITE_SETUP_TOKEN",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/mfa/enrollment",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_SESSION",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 200
  },
  "API15-AUTH-008": {
    "authContext": "MFA_CHALLENGE",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/mfa/verify",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_TOKEN",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 200
  },
  "API15-AUTH-009": {
    "authContext": "MFA_CHALLENGE",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/mfa/recovery",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_TOKEN",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 200
  },
  "API15-AUTH-010": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/sessions/terminate",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_SESSION",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 204
  },
  "API15-AUTH-011": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "POST",
    "path": "/api/v1/auth/step-up",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [],
    "rateLimitClass": "AUTH_SESSION",
    "requestContentType": "application/json",
    "siteContext": "AUTH",
    "successStatus": 200
  },
  "API15-AUTH-012": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/auth/selectable-sites",
    "pathParameters": [],
    "permissions": "authenticated ACTIVE Admin; no additional permission; result limited to authoritative current site assignments (or ACTIVE Sites for designated Super Admin)",
    "queryParameters": [],
    "rateLimitClass": "AUTH_SESSION",
    "requestContentType": null,
    "siteContext": "AUTH",
    "successStatus": 200
  },
  "API15-G-001": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/context",
    "pathParameters": [],
    "permissions": "authenticated ACTIVE Admin with at least one explicit GLOBAL permission",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-002": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/network/dashboard",
    "pathParameters": [],
    "permissions": "network_dashboard.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-003": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/network/posts",
    "pathParameters": [],
    "permissions": "network_dashboard.view + per-row site assignment + posts.view",
    "queryParameters": [
      "site_key",
      "status",
      "search",
      "page",
      "page_size"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-010": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites",
    "pathParameters": [],
    "permissions": "sites.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-011": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites",
    "pathParameters": [],
    "permissions": "sites.view + sites.create",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 201
  },
  "API15-G-012": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "sites.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-013": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "sites.view + sites.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-014": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/enable",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "sites.view + sites.enable",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-015": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/disable",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "sites.view + sites.disable",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-016": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/archive",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "sites.view + sites.archive",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-017": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/deletion-requests",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "sites.view + sites.deletion_request",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 201
  },
  "API15-G-018": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/domains",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "sites.view + sites.manage_domains",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-019": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/domains",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "sites.view + sites.manage_domains",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 201
  },
  "API15-G-020": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}/domains/{domain_id}",
    "pathParameters": [
      "site_key",
      "domain_id"
    ],
    "permissions": "sites.view + sites.manage_domains",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-021": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "DELETE",
    "path": "/api/v1/admin/sites/{site_key}/domains/{domain_id}",
    "pathParameters": [
      "site_key",
      "domain_id"
    ],
    "permissions": "sites.view + sites.manage_domains",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 204
  },
  "API15-G-022": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/domains/{domain_id}/make-canonical",
    "pathParameters": [
      "site_key",
      "domain_id"
    ],
    "permissions": "sites.view + sites.manage_domains",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-030": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/admin-users",
    "pathParameters": [],
    "permissions": "admin_users.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-031": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/admin-users/invitations",
    "pathParameters": [],
    "permissions": "admin_users.view + admin_users.invite",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 201
  },
  "API15-G-032": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/admin-users/{admin_user_id}",
    "pathParameters": [
      "admin_user_id"
    ],
    "permissions": "admin_users.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-033": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/admin-users/{admin_user_id}",
    "pathParameters": [
      "admin_user_id"
    ],
    "permissions": "admin_users.view + admin_users.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-034": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/admin-users/{admin_user_id}/enable",
    "pathParameters": [
      "admin_user_id"
    ],
    "permissions": "admin_users.view + admin_users.enable",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-035": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/admin-users/{admin_user_id}/disable",
    "pathParameters": [
      "admin_user_id"
    ],
    "permissions": "admin_users.view + admin_users.disable",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-036": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PUT",
    "path": "/api/v1/admin/admin-users/{admin_user_id}/site-assignments",
    "pathParameters": [
      "admin_user_id"
    ],
    "permissions": "admin_users.view + admin_users.manage_site_assignments",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-037": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PUT",
    "path": "/api/v1/admin/admin-users/{admin_user_id}/role-assignments",
    "pathParameters": [
      "admin_user_id"
    ],
    "permissions": "admin_users.view + roles.view + roles.assign",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-040": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/roles",
    "pathParameters": [],
    "permissions": "roles.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-041": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/roles",
    "pathParameters": [],
    "permissions": "roles.view + roles.create",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 201
  },
  "API15-G-042": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/roles/{role_id}",
    "pathParameters": [
      "role_id"
    ],
    "permissions": "roles.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-043": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/roles/{role_id}",
    "pathParameters": [
      "role_id"
    ],
    "permissions": "roles.view + roles.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-044": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/roles/{role_id}/retire",
    "pathParameters": [
      "role_id"
    ],
    "permissions": "roles.view + roles.retire",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-045": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/roles/{role_id}/duplicate",
    "pathParameters": [
      "role_id"
    ],
    "permissions": "roles.view + roles.create",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 201
  },
  "API15-G-046": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/permissions",
    "pathParameters": [],
    "permissions": "permissions.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-050": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/audit",
    "pathParameters": [],
    "permissions": "audit.view",
    "queryParameters": [
      "actor_id",
      "site_key",
      "event_type",
      "from",
      "to",
      "page",
      "page_size"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-051": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/audit/{audit_id}",
    "pathParameters": [
      "audit_id"
    ],
    "permissions": "audit.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-052": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/audit/export",
    "pathParameters": [],
    "permissions": "audit.view + audit.export",
    "queryParameters": [],
    "rateLimitClass": "AUDIT_EXPORT",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 202
  },
  "API15-G-060": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/platform-settings",
    "pathParameters": [],
    "permissions": "platform_settings.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-G-061": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/platform-settings",
    "pathParameters": [],
    "permissions": "platform_settings.view + platform_settings.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "GLOBAL",
    "successStatus": 200
  },
  "API15-PUB-001": {
    "authContext": "NONE",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/public/page",
    "pathParameters": [],
    "permissions": "NONE",
    "queryParameters": [
      "path",
      "q",
      "page",
      "page_size"
    ],
    "rateLimitClass": "PUBLIC_READ",
    "requestContentType": null,
    "siteContext": "PUBLIC",
    "successStatus": 200
  },
  "API15-PUB-002": {
    "authContext": "PREVIEW_AUTHORITY",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/public/preview/posts/{post_id}",
    "pathParameters": [
      "post_id"
    ],
    "permissions": "PREVIEW_AUTHORITY",
    "queryParameters": [],
    "rateLimitClass": "PREVIEW_READ",
    "requestContentType": null,
    "siteContext": "PREVIEW",
    "successStatus": 200
  },
  "API15-S-001": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/context",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "authenticated + active assignment",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-002": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/dashboard",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "dashboard.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-010": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/posts",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "posts.view",
    "queryParameters": [
      "status",
      "search",
      "author_id",
      "category_id",
      "tag_id",
      "page",
      "page_size",
      "sort"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-011": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "posts.view + posts.create",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 201
  },
  "API15-S-012": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-013": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "expected_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-014": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "base_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/autosaves",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 201
  },
  "API15-S-015": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/autosaves/latest",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.edit",
    "queryParameters": [
      "editor_instance_id"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-016": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "base_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/preview-handoff",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.preview",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 201
  },
  "API15-S-017": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "expected_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/schedule",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.edit + posts.schedule",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-018": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "expected_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/unschedule",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.edit + posts.schedule",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-019": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "expected_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/publish",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.edit + posts.publish",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-020": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "expected_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/archive",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.archive",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-021": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "expected_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/trash",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.trash",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-022": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "expected_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/restore",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.restore",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-023": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "expected_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/permanent-delete",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.delete",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 204
  },
  "API15-S-024": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/duplicate",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.duplicate",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 201
  },
  "API15-S-025": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "per-target expected_version where applicable",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/bulk",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "action-specific Post permission; security prevalidation for all targets",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-026": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/revisions",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view + posts.revisions.view",
    "queryParameters": [
      "page",
      "page_size"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-027": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "expected_version",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/revisions/{revision_id}/restore",
    "pathParameters": [
      "site_key",
      "post_id",
      "revision_id"
    ],
    "permissions": "posts.view + posts.edit + posts.revisions.view + posts.revisions.restore",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-028": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/posts/{post_id}/url-history",
    "pathParameters": [
      "site_key",
      "post_id"
    ],
    "permissions": "posts.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-030": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/categories",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "categories.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-031": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/categories",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "categories.view + categories.create",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 201
  },
  "API15-S-032": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/categories/{category_id}",
    "pathParameters": [
      "site_key",
      "category_id"
    ],
    "permissions": "categories.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-033": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}/categories/{category_id}",
    "pathParameters": [
      "site_key",
      "category_id"
    ],
    "permissions": "categories.view + categories.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-034": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "DELETE",
    "path": "/api/v1/admin/sites/{site_key}/categories/{category_id}",
    "pathParameters": [
      "site_key",
      "category_id"
    ],
    "permissions": "categories.view + categories.delete",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 204
  },
  "API15-S-040": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/tags",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "tags.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-041": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/tags",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "tags.view + tags.create",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 201
  },
  "API15-S-042": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/tags/{tag_id}",
    "pathParameters": [
      "site_key",
      "tag_id"
    ],
    "permissions": "tags.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-043": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}/tags/{tag_id}",
    "pathParameters": [
      "site_key",
      "tag_id"
    ],
    "permissions": "tags.view + tags.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-044": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "DELETE",
    "path": "/api/v1/admin/sites/{site_key}/tags/{tag_id}",
    "pathParameters": [
      "site_key",
      "tag_id"
    ],
    "permissions": "tags.view + tags.delete",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 204
  },
  "API15-S-045": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/tags/{tag_id}/merge",
    "pathParameters": [
      "site_key",
      "tag_id"
    ],
    "permissions": "tags.view + tags.edit + tags.delete",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-050": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/authors",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "authors.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-051": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/authors",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "authors.view + authors.create",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 201
  },
  "API15-S-052": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/authors/{author_id}",
    "pathParameters": [
      "site_key",
      "author_id"
    ],
    "permissions": "authors.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-053": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}/authors/{author_id}",
    "pathParameters": [
      "site_key",
      "author_id"
    ],
    "permissions": "authors.view + authors.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-054": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/authors/{author_id}/retire",
    "pathParameters": [
      "site_key",
      "author_id"
    ],
    "permissions": "authors.view + authors.retire",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_SENSITIVE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-060": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/media",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "media.view",
    "queryParameters": [
      "search",
      "mime_type",
      "usage",
      "page",
      "page_size",
      "sort"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-061": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/media",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "media.view + media.upload",
    "queryParameters": [],
    "rateLimitClass": "MEDIA_UPLOAD",
    "requestContentType": "multipart/form-data",
    "siteContext": "SITE",
    "successStatus": 201
  },
  "API15-S-062": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/media/{media_id}",
    "pathParameters": [
      "site_key",
      "media_id"
    ],
    "permissions": "media.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-063": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}/media/{media_id}",
    "pathParameters": [
      "site_key",
      "media_id"
    ],
    "permissions": "media.view + media.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-064": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/media/{media_id}/replace",
    "pathParameters": [
      "site_key",
      "media_id"
    ],
    "permissions": "media.view + media.replace",
    "queryParameters": [],
    "rateLimitClass": "MEDIA_UPLOAD",
    "requestContentType": "multipart/form-data",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-065": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "DELETE",
    "path": "/api/v1/admin/sites/{site_key}/media/{media_id}",
    "pathParameters": [
      "site_key",
      "media_id"
    ],
    "permissions": "media.view + media.delete",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 204
  },
  "API15-S-066": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/media/{media_id}/usage",
    "pathParameters": [
      "site_key",
      "media_id"
    ],
    "permissions": "media.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-070": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/navigation/menus",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "navigation.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-071": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PUT",
    "path": "/api/v1/admin/sites/{site_key}/navigation/menus/{menu_key}",
    "pathParameters": [
      "site_key",
      "menu_key"
    ],
    "permissions": "navigation.view + navigation.manage",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-072": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/homepage",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "navigation.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-073": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PUT",
    "path": "/api/v1/admin/sites/{site_key}/homepage",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "navigation.view + navigation.manage",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-080": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/seo",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "seo.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-081": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}/seo",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "seo.view + seo.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-082": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/redirects",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "redirects.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-083": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/redirects",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "redirects.view + redirects.create",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 201
  },
  "API15-S-084": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}",
    "pathParameters": [
      "site_key",
      "redirect_id"
    ],
    "permissions": "redirects.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-085": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}",
    "pathParameters": [
      "site_key",
      "redirect_id"
    ],
    "permissions": "redirects.view + redirects.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-086": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "DELETE",
    "path": "/api/v1/admin/sites/{site_key}/redirects/{redirect_id}",
    "pathParameters": [
      "site_key",
      "redirect_id"
    ],
    "permissions": "redirects.view + redirects.delete",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_DESTRUCTIVE",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 204
  },
  "API15-S-090": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/search/posts",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "search.view",
    "queryParameters": [
      "q",
      "status",
      "page",
      "page_size"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-091": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/search/internal-links",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "search.view",
    "queryParameters": [
      "q",
      "page",
      "page_size"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-092": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/search/related-posts",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "search.view",
    "queryParameters": [
      "post_id",
      "q",
      "page",
      "page_size"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-093": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/search/status",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "search.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-094": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "POST",
    "path": "/api/v1/admin/sites/{site_key}/search/reindex",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "search.view + search.reindex",
    "queryParameters": [],
    "rateLimitClass": "REINDEX",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 202
  },
  "API15-S-095": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/calendar",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "calendar.view",
    "queryParameters": [
      "from",
      "to",
      "status"
    ],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-096": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID"
    ],
    "idempotency": "NO",
    "method": "GET",
    "path": "/api/v1/admin/sites/{site_key}/settings",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "site_settings.view",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_READ",
    "requestContentType": null,
    "siteContext": "SITE",
    "successStatus": 200
  },
  "API15-S-097": {
    "authContext": "ADMIN_SESSION",
    "concurrency": "NONE",
    "headerParameters": [
      "X-Request-ID",
      "Idempotency-Key"
    ],
    "idempotency": "REQUIRED",
    "method": "PATCH",
    "path": "/api/v1/admin/sites/{site_key}/settings",
    "pathParameters": [
      "site_key"
    ],
    "permissions": "site_settings.view + site_settings.edit",
    "queryParameters": [],
    "rateLimitClass": "ADMIN_WRITE",
    "requestContentType": "application/json",
    "siteContext": "SITE",
    "successStatus": 200
  }
} as const;
export type RegisteredOperationId = keyof typeof operationRegistry;
