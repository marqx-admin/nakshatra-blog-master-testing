# Neutral future-site scaffold

The generator copies boilerplate; it does not create a runtime shared public UI dependency.

Example:

```sh
node tooling/generators/create-public-site.mjs \
  --app-id=APP-15 \
  --site-id=SITE-15 \
  --domain=example.invalid \
  --folder=site-15-example \
  --package=@bp/site-15-example
```

It stops after local package/source ownership is created. It does **not** create DB site/domain rows,
permissions, aliases, content, deployment resources or shared backend switch statements. Those actions remain
under their owning authorities/chats.
