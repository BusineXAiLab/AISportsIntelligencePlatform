# AI Sports Intelligence Platform — Backend

Production-grade FastAPI backend for a premium football/soccer intelligence platform:
probability-based AI predictions, AI-generated reports with responsible-language
controls, Stripe subscriptions, Telegram free/VIP automation, an admin review
workflow, accuracy tracking, and cloud deployment to AWS or Azure.

## Stack

- Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2 (async), Alembic
- PostgreSQL, Redis, Celery (worker + beat)
- Stripe, Telegram Bot API, OpenAI-compatible LLM abstraction
- Docker, Terraform (AWS ECS Fargate / Azure Container Apps), GitHub Actions
- structlog structured logging, Prometheus metrics at `/metrics`

## Quick start (Docker)

```bash
cp .env.example .env          # fill in secrets as needed
make docker-up                # API + Postgres + Redis + worker + beat
# API docs: http://localhost:8000/docs
```

## Quick start (local Python)

```bash
make install                  # pip install -e ".[dev]"
# start Postgres + Redis (e.g. docker compose -f docker/docker-compose.yml up db redis -d)
make migrate                  # alembic upgrade head
make seed                     # seed users, leagues, sample prediction
make run                      # uvicorn on :8000
make worker                   # celery worker (separate shell)
make beat                     # celery beat (separate shell)
```

Seeded users (password in parentheses):

| Email | Password | Role |
| --- | --- | --- |
| admin@sportsai.local | AdminPass123! | SUPER_ADMIN |
| free@sportsai.local | FreePass123! | FREE_USER |
| premium@sportsai.local | PremiumPass123! | PREMIUM_USER |
| elite@sportsai.local | ElitePass123! | ELITE_USER |

Create additional admins:

```bash
python scripts/create_admin_user.py --email you@example.com --password Secret123! --role SUPER_ADMIN
```

## Project layout

```
app/
  api/v1/         REST endpoints (auth, users, subscriptions, matches,
                  predictions, reports, telegram, admin, analytics, health)
  core/           config, security, database, redis, permissions, pagination
  models/         SQLAlchemy models (UUID PKs, timestamps, soft delete)
  schemas/        Pydantic request/response models
  services/       business logic (auth, subscriptions, predictions, reports, ...)
  repositories/   data access layer
  ml/             feature engineering, baseline models, calibration, explainability
  integrations/   Stripe, Telegram, sports data, LLM, object storage, secrets
  jobs/           Celery tasks + beat schedule
  middleware/     request ID, rate limiting, access logs, error handling
  tests/          unit + integration tests
alembic/          migrations
infra/aws/        Terraform: VPC, ECS Fargate, RDS, ElastiCache, S3, WAF, CloudWatch
infra/azure/      Terraform: Container Apps, PostgreSQL, Redis, Blob, Key Vault, Front Door
docker/           Dockerfile + docker-compose
docs/             API, architecture and deployment guides
.github/workflows CI + AWS/Azure deploy pipelines
```

## Key behaviors

- **Predictions are probabilities, never guarantees.** Every prediction stores
  model version, feature snapshot, input data timestamp, confidence and risk.
- **Responsible language filter** removes betting-style claims from all
  generated content before storage or publication.
- **Entitlements**: Free / Premium ($19.99/mo) / Elite ($49.99/mo) plans gate
  content and Telegram VIP access; webhooks keep Stripe state in sync.
- **Admin workflow**: predictions, reports and Telegram posts require approval;
  every admin action is audited.
- **Jobs**: fixture/result ingestion, prediction generation, report generation,
  Telegram publishing, VIP revocation, accuracy settlement, feed monitoring,
  subscription sync.

## Tests

```bash
make test         # unit tests always run; integration tests need Postgres
make lint
make typecheck
```

## Documentation

- [docs/api.md](docs/api.md) — endpoint reference
- [docs/architecture.md](docs/architecture.md) — system design
- [docs/deployment_aws.md](docs/deployment_aws.md) — AWS deployment
- [docs/deployment_azure.md](docs/deployment_azure.md) — Azure deployment
- [docs/deployment_gcp.md](docs/deployment_gcp.md) — GCP deployment (project `bxailab`)
- [docs/sports_data_football_data_org.md](docs/sports_data_football_data_org.md) — free live data via football-data.org
- [docs/environment_variables.md](docs/environment_variables.md) — configuration
