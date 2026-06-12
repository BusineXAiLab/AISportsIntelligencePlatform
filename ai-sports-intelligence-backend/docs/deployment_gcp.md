# GCP Deployment Guide

Target architecture: Cloud Run (API + Celery worker + beat), Cloud SQL PostgreSQL,
Memorystore Redis, Cloud Storage, Secret Manager, Artifact Registry, Cloud
Monitoring. All provisioned by Terraform in `infra/gcp/`.

**Project:** `bxailab` (number `143125406102`)

## Prerequisites

- Terraform >= 1.6
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- Billing enabled on project `bxailab`
- A user or service account with these roles on the project:
  - `roles/owner` (initial bootstrap) or a custom role with Cloud Run, Cloud SQL,
    Redis, VPC, Secret Manager, Artifact Registry, and IAM permissions
- (Optional) GitHub Actions workload identity for CI deploys

## 1. Authenticate and select the project

```bash
gcloud auth login
gcloud config set project bxailab
gcloud auth application-default login
```

Enable billing if not already enabled:

```bash
gcloud beta billing projects describe bxailab
```

## 2. Build and push the container image

Terraform creates an Artifact Registry repository. After the first `terraform apply`
(with a placeholder image) or after creating the repo manually:

```bash
cd ai-sports-intelligence-backend

gcloud auth configure-docker us-central1-docker.pkg.dev

export IMAGE="us-central1-docker.pkg.dev/bxailab/sports-ai-backend/backend:v1"
docker build -f docker/Dockerfile -t "$IMAGE" .
docker push "$IMAGE"
```

## 3. Provision infrastructure

```bash
cd infra/gcp
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and set container_image to the pushed image URL

terraform init
terraform plan \
  -var "project_id=bxailab" \
  -var "environment=staging" \
  -var "container_image=us-central1-docker.pkg.dev/bxailab/sports-ai-backend/backend:v1"

terraform apply \
  -var "project_id=bxailab" \
  -var "environment=staging" \
  -var "container_image=us-central1-docker.pkg.dev/bxailab/sports-ai-backend/backend:v1"
```

Terraform enables required APIs, creates VPC + connector, Cloud SQL, Memorystore,
GCS bucket, Secret Manager secrets, Artifact Registry, Cloud Run services
(`api`, `worker`, `beat`), and a migration job.

Outputs include the public API URL, bucket name, and secret IDs.

## 4. Configure application secrets

Terraform seeds `DATABASE_URL`, `REDIS_URL`, and `SECRET_KEY`. Add Stripe,
Telegram, LLM, and sports-data keys to the app config secret:

```bash
gcloud secrets versions access latest \
  --secret="sports-ai-staging-app-config" \
  --project=bxailab > secrets.json

# Edit secrets.json, then:
gcloud secrets versions add sports-ai-staging-app-config \
  --project=bxailab \
  --data-file=secrets.json
```

For runtime, Cloud Run injects core secrets directly. Optional keys can also be
added as individual Secret Manager entries and wired into Cloud Run env vars.

## 5. Run database migrations

```bash
gcloud run jobs execute sports-ai-staging-migrate \
  --region=us-central1 \
  --project=bxailab \
  --wait
```

## 6. Create the first admin user

Run a one-off Cloud Run job override or Cloud Shell task:

```bash
gcloud run jobs create sports-ai-staging-admin \
  --image=us-central1-docker.pkg.dev/bxailab/sports-ai-backend/backend:v1 \
  --region=us-central1 \
  --project=bxailab \
  --service-account="$(terraform output -raw service_account_email)" \
  --set-cloudsql-instances="$(terraform output -raw cloud_sql_connection_name)" \
  --vpc-connector=sports-ai-staging-connector \
  --set-secrets=DATABASE_URL=sports-ai-staging-database-url:latest,SECRET_KEY=sports-ai-staging-secret-key:latest \
  --command=python,scripts/create_admin_user.py,--email,admin@example.com,--password,ChangeMe123!

gcloud run jobs execute sports-ai-staging-admin --region=us-central1 --wait
```

## 7. Verify deployment

```bash
API_URL=$(terraform output -raw api_url)
curl -fsS "$API_URL/api/v1/health/live"
curl -fsS "$API_URL/api/v1/health/ready"
```

## 8. Stripe webhook

Point Stripe at:

`https://<cloud-run-api-url>/api/v1/subscriptions/webhook/stripe`

Events: `checkout.session.completed`, `customer.subscription.*`,
`invoice.payment_failed`, `invoice.payment_succeeded`.

## 9. Telegram bot

1. Create a bot via @BotFather; store `TELEGRAM_BOT_TOKEN`.
2. Add the bot as admin of public and VIP channels.
3. Set channel IDs in Secret Manager / app config.

## Frontend (optional)

The React frontend in the repo root can be hosted on:

- **Firebase Hosting** (same GCP project)
- **Cloud Storage + Cloud CDN**
- **Cloud Run** (static nginx container)

Set `CORS_ORIGINS` in Terraform to your frontend URL.

## CI/CD

`.github/workflows/deploy_gcp.yml` performs: image build/push to Artifact Registry
→ Terraform apply → migration job → health smoke test.

Required GitHub secrets / vars:

| Name | Description |
| --- | --- |
| `GCP_PROJECT_ID` | `bxailab` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload identity provider resource name |
| `GCP_SERVICE_ACCOUNT` | Deployer service account email |
| `GCP_REGION` | e.g. `us-central1` |

## Monitoring and backup

- Cloud Monitoring alert policies for Cloud Run 5xx, Cloud SQL CPU, Redis memory
- Cloud SQL automated backups (7-day retention; PITR in production)
- GCS bucket versioning enabled

## Cost notes (staging)

Approximate monthly staging cost: Cloud Run (~$20–40), Cloud SQL db-f1-micro
(~$10), Memorystore 1 GB BASIC (~$35), plus egress. Use `terraform destroy` to
tear down non-production environments when idle.

## Tear down

```bash
cd infra/gcp
terraform destroy \
  -var "project_id=bxailab" \
  -var "environment=staging" \
  -var "container_image=us-central1-docker.pkg.dev/bxailab/sports-ai-backend/backend:v1"
```
