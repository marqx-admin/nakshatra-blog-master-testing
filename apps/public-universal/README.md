# Universal public frontend

One Next.js Pages Router application serves any registered website through the public API. SSR forwards the incoming request Host as `X-BP-Public-Host` over the configured private API origin. The API domain registry and trusted SiteContext select the tenant; this app has no site key or domain setting.

The app renders the RC11 PageData response with one fixed Header/Footer shell. Presentation tokens are projected into a new style object for each response. Unknown hosts and untrusted API failures render a neutral state. Preview uses the existing backend handoff and session authority.

Robots and sitemap requests pass through to the WU-02 API crawler routes with the same incoming Host. The backend remains responsible for crawler policy and tenant resolution.

Local static checks:

```sh
corepack pnpm --filter @bp/public-universal typecheck
corepack pnpm --filter @bp/public-universal test
corepack pnpm --filter @bp/public-universal build
```

WU-04 will supply the visual catalogue and site parity styles. This app does not configure deployment or traffic cutover.
