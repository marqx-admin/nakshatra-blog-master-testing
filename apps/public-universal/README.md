# Universal public frontend

One Next.js Pages Router application serves any registered website through the public API. SSR forwards the incoming request Host as `X-BP-Public-Host` over the configured private API origin. The API domain registry and trusted SiteContext select the tenant; this app has no site key or domain setting.

The app renders the RC11 PageData response with one fixed Header/Footer shell. Presentation tokens are projected into a new style object for each response. Unknown hosts and untrusted API failures render a neutral state. Preview uses the existing backend handoff and session authority.

WU-04 visual option IDs and safe defaults come from `@bp/presentation-catalogue`. The shared page engines consume per-request resolved configuration; Header/Footer structure, Host authority and Preview authority remain fixed.

Robots and sitemap requests pass through to the WU-02 API crawler routes with the same incoming Host. The backend remains responsible for crawler policy and tenant resolution.

Local static checks:

```sh
corepack pnpm --filter @bp/public-universal typecheck
corepack pnpm --filter @bp/public-universal test
corepack pnpm --filter @bp/public-universal build
```

WU-06 registers this existing package as one generic image/service beside the legacy fourteen. For local development, start the shared API separately, then run `corepack pnpm dev:public-universal`; it defaults `BP_API_INTERNAL_ORIGIN` to `http://127.0.0.1:8080` and listens on port 3015. The incoming HTTP Host determines the site through the API domain registry. No site key or domain is compiled into this package or its Dockerfile.

The committed WU-04 catalogue supplies visual profiles and legacy parity configurations. WU-06 adds repository deployment definitions without changing traffic routing.
