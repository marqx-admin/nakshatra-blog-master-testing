# Legacy reference-app scaffold

This generator is retained only to make an independent legacy-style public app for reference or development work. It is **not** the Universal Platform website-creation path. Create Website uses the backend-owned API15-G-011 transaction; SITE-15, SITE-100 and later tenants use the existing `apps/public-universal` app and require no new frontend package, Dockerfile, service, or `SITE_N_*` environment family.

The generator requires an explicit `--legacy-reference` opt-in before it writes any files. It copies boilerplate without creating a runtime shared public UI dependency.

Example:

```sh
node tooling/generators/create-public-site.mjs \
  --legacy-reference \
  --app-id=APP-15 \
  --site-id=SITE-15 \
  --domain=example.invalid \
  --folder=site-15-example \
  --package=@bp/site-15-example
```

It stops after local reference package/source ownership is created. It does **not** create DB site/domain rows,
permissions, aliases, content, deployment resources or shared backend switch statements. Those actions remain
under the Universal backend and repository authorities.
