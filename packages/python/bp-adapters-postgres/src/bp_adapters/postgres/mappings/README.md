# SQLAlchemy mappings boundary

Raw SQL migrations are the sole schema authority. Any later SQLAlchemy mappings must map the existing DOC-08 schema only. `MetaData.create_all()`, `drop_all()`, schema push/synchronize behavior, and application-startup DDL are prohibited.
