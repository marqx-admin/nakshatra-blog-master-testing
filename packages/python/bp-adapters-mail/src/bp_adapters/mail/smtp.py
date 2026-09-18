from __future__ import annotations
import asyncio, smtplib
from email.message import EmailMessage
class SmtpMailAdapter:
    def __init__(self, *, host: str, port: int, sender: str, username: str|None=None, password: str|None=None, starttls: bool=True):
        self.host=host; self.port=port; self.sender=sender; self.username=username; self.password=password; self.starttls=starttls
    async def send(self, recipient: str, subject: str, text: str) -> None:
        msg=EmailMessage(); msg['From']=self.sender; msg['To']=recipient; msg['Subject']=subject; msg.set_content(text)
        await asyncio.to_thread(self._send,msg)
    def _send(self,msg):
        with smtplib.SMTP(self.host,self.port,timeout=10) as s:
            if self.starttls: s.starttls()
            if self.username: s.login(self.username,self.password or '')
            s.send_message(msg)
class RecordingMailAdapter:
    def __init__(self): self.messages=[]
    async def send(self, recipient, subject, text): self.messages.append((recipient,subject,text))
