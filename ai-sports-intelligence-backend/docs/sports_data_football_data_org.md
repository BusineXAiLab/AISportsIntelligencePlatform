# Live sports data (football-data.org free tier)

## 1. Get a free API key

1. Register at [football-data.org](https://www.football-data.org/client/register)
2. Copy your **X-Auth-Token** from the client area

Free tier: major European leagues, **10 requests/minute**.

## 2. Local development

```bash
cd ai-sports-intelligence-backend
cp .env.example .env
```

Set in `.env`:

```env
SPORTS_DATA_PROVIDER=football_data_org
SPORTS_DATA_API_KEY=your-token-here
SPORTS_DATA_BASE_URL=https://api.football-data.org/v4
```

Run ingest:

```bash
python scripts/run_ingest.py --days-ahead 7 --results-days-back 3 --predictions
```

Verify:

```bash
curl http://localhost:8000/api/v1/matches/today
curl http://localhost:8000/api/v1/predictions/today
```

## 3. GCP staging (`bxailab`)

### Set the API key in Secret Manager

```bash
# Replace YOUR_TOKEN with your football-data.org token
echo -n "YOUR_TOKEN" | gcloud secrets versions add sports-ai-staging-sports-data-api-key \
  --project=bxailab \
  --data-file=-
```

If the secret does not exist yet, apply Terraform first (see below).

### Update Cloud Run (after Terraform apply)

```bash
cd ai-sports-intelligence-backend/infra/gcp

terraform apply \
  -var "project_id=bxailab" \
  -var "environment=staging" \
  -var "region=us-central1" \
  -var "container_image=us-central1-docker.pkg.dev/bxailab/sports-ai-backend/backend:v1" \
  -var "frontend_container_image=us-central1-docker.pkg.dev/bxailab/sports-ai-backend/frontend:v1" \
  -var "sports_data_provider=football_data_org" \
  -var "sports_data_base_url=https://api.football-data.org/v4" \
  -var "sports_data_api_key=YOUR_TOKEN"
```

Or update only the secret and redeploy services:

```bash
echo -n "YOUR_TOKEN" | gcloud secrets versions add sports-ai-staging-sports-data-api-key \
  --project=bxailab --data-file=-

gcloud run services update sports-ai-staging-api \
  --region=us-central1 --project=bxailab \
  --update-env-vars=SPORTS_DATA_PROVIDER=football_data_org,SPORTS_DATA_BASE_URL=https://api.football-data.org/v4
```

### Rebuild backend with the new provider code

```bash
cd ai-sports-intelligence-backend
gcloud builds submit --config=cloudbuild.yaml --project=bxailab \
  --substitutions=_IMAGE=us-central1-docker.pkg.dev/bxailab/sports-ai-backend/backend:v2
```

Then point Terraform `container_image` at `:v2` and apply.

### Run initial ingest on GCP

Create a one-off Cloud Run job execution:

```bash
gcloud run jobs create sports-ai-staging-ingest \
  --image=us-central1-docker.pkg.dev/bxailab/sports-ai-backend/backend:v2 \
  --region=us-central1 --project=bxailab \
  --service-account=sports-ai-staging-run@bxailab.iam.gserviceaccount.com \
  --set-cloudsql-instances=bxailab:us-central1:sports-ai-staging-postgres \
  --vpc-connector=sports-ai-staging-vpc \
  --set-secrets=DATABASE_URL=sports-ai-staging-database-url:latest,REDIS_URL=sports-ai-staging-redis-url:latest,SECRET_KEY=sports-ai-staging-secret-key:latest,SPORTS_DATA_API_KEY=sports-ai-staging-sports-data-api-key:latest \
  --set-env-vars=SPORTS_DATA_PROVIDER=football_data_org,SPORTS_DATA_BASE_URL=https://api.football-data.org/v4,ENVIRONMENT=staging \
  --command=python,scripts/run_ingest.py,--days-ahead,7,--results-days-back,3,--predictions

gcloud run jobs execute sports-ai-staging-ingest --region=us-central1 --project=bxailab --wait
```

## 4. Scheduled jobs

Celery beat (already running on GCP) will:

| Job | Schedule |
| --- | --- |
| `ingest_fixtures` | Daily 04:00 UTC |
| `ingest_results` | Every 2 hours (free-tier friendly) |
| `generate_predictions` | Daily 06:00 UTC |

Check feed health: `GET /api/v1/admin/data-feeds` (admin JWT required).

## Provider implementation

Registered as `football_data_org` in `app/integrations/sports_data_client.py`.

Maps [football-data.org v4](https://www.football-data.org/documentation/api) `/matches` and `/teams/{id}/matches` to internal DTOs.
