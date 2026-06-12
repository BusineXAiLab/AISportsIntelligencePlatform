#!/usr/bin/env bash
# Deploy AI Sports Intelligence backend to GCP project bxailab.
# Run in Google Cloud Shell: https://shell.cloud.google.com/?project=bxailab
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-bxailab}"
REGION="${GCP_REGION:-us-central1}"
ENVIRONMENT="${DEPLOY_ENV:-staging}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/sports-ai-backend/backend:$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo v1)"

echo "==> Project: $PROJECT_ID | Region: $REGION | Env: $ENVIRONMENT"
gcloud config set project "$PROJECT_ID"

echo "==> Enabling Artifact Registry (if needed) and configuring Docker"
gcloud services enable artifactregistry.googleapis.com run.googleapis.com --project="$PROJECT_ID"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "==> Building container image"
cd "$BACKEND_ROOT"
docker build -f docker/Dockerfile -t "$IMAGE" .

echo "==> Creating Artifact Registry repo if missing"
gcloud artifacts repositories describe sports-ai-backend \
  --location="$REGION" --project="$PROJECT_ID" 2>/dev/null || \
gcloud artifacts repositories create sports-ai-backend \
  --repository-format=docker \
  --location="$REGION" \
  --project="$PROJECT_ID" \
  --description="Sports AI backend images"

echo "==> Pushing image: $IMAGE"
docker push "$IMAGE"

echo "==> Applying Terraform"
cd infra/gcp
terraform init -input=false
terraform apply -auto-approve \
  -var "project_id=${PROJECT_ID}" \
  -var "project_number=143125406102" \
  -var "environment=${ENVIRONMENT}" \
  -var "region=${REGION}" \
  -var "container_image=${IMAGE}"

echo "==> Running database migrations"
gcloud run jobs execute "sports-ai-${ENVIRONMENT}-migrate" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --wait

API_URL="$(terraform output -raw api_url)"
echo "==> Smoke test: $API_URL/api/v1/health/live"
curl -fsS "$API_URL/api/v1/health/live"
echo
curl -fsS "$API_URL/api/v1/health/ready"
echo
echo "Deploy complete. API URL: $API_URL"
