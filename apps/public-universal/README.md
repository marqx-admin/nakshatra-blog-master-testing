# Universal public frontend

One Next.js Pages Router application serves any registered website through the public API. SSR forwards the incoming request Host as `X-BP-Public-Host` over the configured private API origin. The API domain registry and trusted SiteContext select the tenant; this app has no site key or domain setting.

The app renders the RC13 PageData response with one fixed Header/Footer shell. Presentation tokens are projected into a new style object for each response. Unknown hosts and untrusted API failures render a neutral state. Preview uses the existing backend handoff and session authority.

WU-04 visual option IDs and safe defaults come from `@bp/presentation-catalogue`. The shared page engines consume per-request resolved configuration; Header/Footer structure, Host authority and Preview authority remain fixed.

Robots and sitemap requests pass through to the WU-02 API crawler routes with the same incoming Host. The backend remains responsible for crawler policy and tenant resolution.

Local static checks:

```sh
corepack pnpm --filter @bp/public-universal typecheck
corepack pnpm --filter @bp/public-universal test
corepack pnpm --filter @bp/public-universal build
```

WU-06 registers this existing package as one generic image/service beside the legacy fourteen. For local development, start the shared API separately, then run `corepack pnpm dev:public-universal`; it honors `BP_API_INTERNAL_ORIGIN`, otherwise uses `BP_HTTP_PORT` (fallback 8080), and listens on port 3015. For the existing API on 8001, use `BP_HTTP_PORT=8001 corepack pnpm dev:public-universal` only when this listener is not already running. The incoming HTTP Host determines the site through the API domain registry. No site key or domain is compiled into this package or its Dockerfile.

The committed WU-04 catalogue supplies visual profiles and legacy parity configurations. WU-06 adds repository deployment definitions without changing traffic routing.

Existing sites need active `preview.localhost` domain rows; see the [local startup and alias-repair guide](../../infrastructure/local/README.md). SITE-01 through SITE-14 all use this same application on 3015. Future sites receive their temporary Host atomically during provisioning. Do not use legacy port maps to select tenancy. DISABLED sites support only authorized private preview; normal public access remains closed until activation.
