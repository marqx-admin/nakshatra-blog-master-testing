from __future__ import annotations

import uvicorn

from .config.settings import api_http_port_from_env


def main() -> None:
    uvicorn.run(
        "bp_api.main:app",
        host="0.0.0.0",
        port=api_http_port_from_env(),
        proxy_headers=True,
        forwarded_allow_ips="*",
    )


if __name__ == "__main__":
    main()
