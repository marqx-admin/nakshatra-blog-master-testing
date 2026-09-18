# AWS provider wiring

DOC-24 fixes separate AWS non-production and production accounts/VPC/EKS managed-dependency topology, ECR immutable images, S3, DynamoDB security state, managed PostgreSQL/Redis/OpenSearch, ALB/Host preservation and CodePipeline + CodeBuild. This folder contains safe repository-side IaC entry points only; account IDs, subnet IDs, DNS zones, certificates, KMS aliases, Vault endpoints and production secret values are deployment inputs and are intentionally absent.
