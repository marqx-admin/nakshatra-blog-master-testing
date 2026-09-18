from __future__ import annotations
import json, logging, sys
from datetime import datetime, timezone
from .context import get_context
from .redaction import redact_mapping, redact_text

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "severity": record.levelname,
            "logger": record.name,
            "message": redact_text(record.getMessage()),
        }
        ctx=get_context()
        if ctx: payload.update(ctx.safe_fields())
        extra=getattr(record,"safe_fields",None)
        if isinstance(extra,dict): payload.update(redact_mapping(extra))
        if record.exc_info: payload["exception_class"]=record.exc_info[0].__name__ if record.exc_info[0] else "Exception"
        return json.dumps(payload,ensure_ascii=True,separators=(",",":"))

def configure_json_logging(level: str="INFO") -> None:
    root=logging.getLogger(); root.handlers.clear(); handler=logging.StreamHandler(sys.stdout); handler.setFormatter(JsonFormatter()); root.addHandler(handler); root.setLevel(level.upper())
