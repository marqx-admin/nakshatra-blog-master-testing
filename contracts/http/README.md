# Canonical HTTP contract custody

Selected owner authority: **BLOG-DOC-15 v1.0-RC8**. Current executable WU-01 correction: **RC10**.

Canonical source: `contracts/http/BLOG-DOC-15_openapi_v1.0-RC10.yaml`
SHA-256: `001363acaf1f40d65edde67fb06f36990269e89ed1c699f221c4d545a6ea2e65`

RC10 supersedes the unchanged RC9 executable YAML (`f0d55354f79d7ff43385f5e761670b3cc8bf30a0a19de1623777be83f23ac172`) only for typed Site Settings transport of `presentation_config` and `static_pages`. Ordinary settings keep `SettingJsonValue`; the backend owns `presentation_schema_version`. The selected DOC-15 RC8 authority and RC9 executable artifact remain historical. The strict public fixed-page contract is unchanged. FastAPI-generated OpenAPI is diagnostic only.
