# Azure Deployment Guide

Target architecture: Azure Container Apps (API + Celery worker + beat),
Azure Database for PostgreSQL Flexible Server, Azure Cache for Redis,
Blob Storage, Key Vault, Log Analytics + Application Insights, and
Azure Front Door Premium with WAF. Provisioned by Terraform in `infra/azure/`.

## Prerequisites

- Terraform >= 1.6, Azure CLI logged in (`az login`)
- An Azure Container Registry (ACR)
- A service principal / OIDC federation for GitHub Actions
  (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` secrets)

## 1. Build and push the image

```bash
az acr login --name <acrName>
docker build -f docker/Dockerfile -t <acrName>.azurecr.io/sports-ai-backend:v1 .
docker push <acrName>.azurecr.io/sports-ai-backend:v1
```

## 2. Provision infrastructure

```bash
cd infra/azure
terraform init
terraform apply \
  -var "environment=staging" \
  -var "location=eastus" \
  -var "container_image=<acrName>.azurecr.io/sports-ai-backend:v1"
```

Outputs include the Container App FQDN, Front Door endpoint, Key Vault URI
and storage account name.

## 3. Configure application secrets

Terraform seeds `DATABASE-URL`, `REDIS-URL`, `SECRET-KEY` and
`AZURE-STORAGE-CONNECTION-STRING` into Key Vault. Add the remaining secrets
(note: Key Vault names use dashes):

```bash
az keyvault secret set --vault-name <kvName> --name STRIPE-SECRET-KEY --value sk_live_...
az keyvault secret set --vault-name <kvName> --name TELEGRAM-BOT-TOKEN --value ...
```

The container apps use a user-assigned managed identity with
`Key Vault Secrets User` and `Storage Blob Data Contributor` roles.

## 4. Run migrations

```bash
az containerapp exec \
  --resource-group sports-ai-staging-rg \
  --name sports-ai-staging-api \
  --command "alembic upgrade head"
```

## 5. Create the first admin

```bash
az containerapp exec \
  --resource-group sports-ai-staging-rg \
  --name sports-ai-staging-api \
  --command "python scripts/create_admin_user.py --email you@example.com --password Secret123!"
```

## 6. Stripe webhook and Telegram bot

Identical to the AWS guide: point the Stripe webhook at
`https://<front-door-endpoint>/api/v1/subscriptions/webhook/stripe` and
configure the Telegram bot as admin of both channels.

## Scheduled jobs

Celery beat runs as a dedicated single-replica container app and drives all
schedules. Alternatively, Container Apps Jobs (cron) can invoke individual
Celery tasks if you prefer platform-managed scheduling.

## CI/CD

`.github/workflows/deploy_azure.yml` performs: ACR build/push →
`terraform apply` → migration exec → Front Door/Container App health smoke
test. Trigger via the *Deploy to Azure* workflow dispatch.

## Backup and restore

- PostgreSQL Flexible Server: 7-day automated backups (geo-redundant in
  production); restore with `az postgres flexible-server restore`.
- Blob Storage: versioning + 30-day soft delete.
- Manual logical backup: `pg_dump "$DATABASE_URL" > backup.sql`.

## Monitoring

- Log Analytics workspace collects Container Apps console/system logs
- Application Insights resource provisioned for APM integration
- Metric alerts: PostgreSQL CPU, Redis memory (extend the action group with
  email/Teams/PagerDuty receivers)
- Prometheus metrics available at `/metrics`
