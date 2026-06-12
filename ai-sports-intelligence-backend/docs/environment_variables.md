# Environment Variables

Copy `.env.example` to `.env` for local development. In production, values are
sourced from AWS Secrets Manager or Azure Key Vault (see `SECRETS_PROVIDER`).

## Application

| Variable | Default | Description |
| --- | --- | --- |
| APP_NAME | AI Sports Intelligence Platform | Display name |
| ENVIRONMENT | local | local / test / staging / production |
| API_PREFIX | /api/v1 | API route prefix |
| SECRET_KEY | — | JWT signing key. Long random string. **Required** |
| ACCESS_TOKEN_EXPIRE_MINUTES | 30 | Access token TTL |
| REFRESH_TOKEN_EXPIRE_DAYS | 30 | Refresh token TTL |
| CORS_ORIGINS | localhost:3000,5173 | JSON list or comma-separated origins |
| RATE_LIMIT_PER_MINUTE | 120 | Per-IP per-path-group request budget |
| LOG_LEVEL | INFO | Logging level |
| SENTRY_DSN | — | Optional Sentry DSN |

## Datastores

| Variable | Description |
| --- | --- |
| DATABASE_URL | `postgresql+asyncpg://user:pass@host:5432/sports_ai` |
| REDIS_URL | `redis://host:6379/0` (use `rediss://` for TLS, e.g. Azure) |

## Stripe

| Variable | Description |
| --- | --- |
| STRIPE_SECRET_KEY | Secret API key (`sk_live_...` / `sk_test_...`) |
| STRIPE_WEBHOOK_SECRET | Webhook endpoint signing secret (`whsec_...`) |
| STRIPE_PREMIUM_PRICE_ID | Monthly Premium price ID |
| STRIPE_ELITE_PRICE_ID | Monthly Elite price ID |
| STRIPE_PREMIUM_ANNUAL_PRICE_ID | Annual Premium price ID |
| STRIPE_ELITE_ANNUAL_PRICE_ID | Annual Elite price ID |

## Telegram

| Variable | Description |
| --- | --- |
| TELEGRAM_BOT_TOKEN | Bot token from @BotFather |
| TELEGRAM_PUBLIC_CHANNEL_ID | Public channel chat ID (e.g. `@channel` or `-100...`) |
| TELEGRAM_VIP_CHANNEL_ID | VIP channel chat ID (bot must be admin) |
| TELEGRAM_WEBHOOK_SECRET | Secret for webhook verification |

## Sports data provider

| Variable | Description |
| --- | --- |
| SPORTS_DATA_PROVIDER | `mock` (default) or `http` |
| SPORTS_DATA_API_KEY | Vendor API key (http provider) |
| SPORTS_DATA_BASE_URL | Vendor base URL (http provider) |

## LLM provider

| Variable | Description |
| --- | --- |
| LLM_PROVIDER | `openai_compatible` (falls back to template renderer without a key) |
| LLM_API_KEY | API key |
| LLM_BASE_URL | e.g. `https://api.openai.com/v1` or a self-hosted endpoint |
| LLM_MODEL | Model name, e.g. `gpt-4o-mini` |

## Object storage

| Variable | Description |
| --- | --- |
| OBJECT_STORAGE_PROVIDER | `local` / `s3` / `azure_blob` / `gcs` |
| LOCAL_STORAGE_PATH | Local directory (local provider) |
| AWS_REGION / AWS_S3_BUCKET | S3 settings |
| AZURE_STORAGE_CONNECTION_STRING / AZURE_BLOB_CONTAINER | Azure Blob settings |
| GCP_PROJECT_ID / GCS_BUCKET | Google Cloud Storage settings |

## Secrets backend

| Variable | Description |
| --- | --- |
| SECRETS_PROVIDER | `env` / `aws_secrets_manager` / `azure_key_vault` |
| AWS_SECRETS_MANAGER_SECRET_ID | Secret ID containing a JSON blob |
| AZURE_KEY_VAULT_URL | Vault URI; secret names use dashes (`SECRET-KEY`) |
