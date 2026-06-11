# Architecture

## Overview

API-first, modular monolith designed to be split into services later. All
business logic lives in `services/`, data access in `repositories/`, transport
in `api/v1/`. External vendors are isolated behind `integrations/` so providers
can be swapped via configuration.

```
                       ┌─────────────┐
   Web / Mobile ───────► FastAPI API │──► PostgreSQL (SQLAlchemy async)
   Admin portal ───────►  (api/v1)   │──► Redis (cache, rate limit, locks)
                       └──────┬──────┘
                              │ enqueues / beat schedule
                       ┌──────▼──────┐
                       │ Celery jobs │──► Sports data provider (mock/http)
                       │  worker+beat│──► Stripe, Telegram, LLM provider
                       └─────────────┘──► Object storage (S3/Blob/local)
```

## Layers

| Layer | Responsibility |
| --- | --- |
| `api/v1` | HTTP transport, request/response schemas, RBAC dependencies |
| `services` | Business rules, workflows, audit, entitlements |
| `repositories` | Queries; no business logic |
| `models` | SQLAlchemy ORM models; UUID PKs, timestamps, soft delete |
| `ml` | Feature building, models, calibration, explainability |
| `integrations` | Stripe / Telegram / sports data / LLM / storage / secrets |
| `jobs` | Celery tasks with retries, locks, metrics and structured logs |

## Prediction traceability

Every prediction stores:

- `model_version` (linked to the `model_registry` table)
- `feature_snapshot_id` → immutable copy of the input feature vector
- `input_data_timestamp` → when source data was captured
- confidence score/level, risk level, key factors and explanation metadata

After results arrive, `calculate_accuracy` settles predictions per market
(1X2, over/under 2.5, BTTS) producing `prediction_accuracy` rows with Brier
score and log loss — powering `/predictions/accuracy` and
`/analytics/model-accuracy` (including confidence calibration buckets).

## Model lifecycle

`ml/model_loader.py` resolves a model version to an implementation. The MVP
ships `mvp-baseline-v1` (form-based Poisson heuristic). Trained artifacts
(LogisticRegression, RandomForest, XGBoost, LightGBM) implement the same
`BaseMatchModel.predict_proba` contract via `SklearnModelAdapter`, are stored
in object storage and registered in `model_registry`.

## Responsible AI controls

`ResponsibleLanguageService` rewrites betting-style absolute claims
("guaranteed win", "bet now", "100% accurate", ...) into measured phrasing,
appends a disclaimer, logs all replacements on the report, and blocks
publication if banned language remains. The LLM system prompt additionally
forbids invented facts and certainty language; reports are generated from
structured prediction data only.

## Subscriptions and entitlements

Stripe is the source of truth. Webhooks upsert `subscriptions` rows and sync
the denormalised `users.plan`. `EntitlementService` resolves the effective
plan (admins get Elite). Gates:

- API: `RequirePlan` dependencies + per-field redaction of premium insight
- Reports: `minimum_plan` on each report
- Telegram: VIP invite granted on verify if entitled; `revoke_expired_telegram_access`
  job kicks lapsed users from the VIP channel

Payment failures move subscriptions into a 3-day grace period before expiry.

## Security

- JWT access tokens (30 min) + rotating refresh tokens stored server-side (revocable)
- bcrypt password hashing; reset/verify flows with single-use tokens
- RBAC dependencies (`require_admin`, `require_content_lead`, `RequirePlan`)
- Redis fixed-window rate limiting (fail-open), request ID propagation
- Stripe webhook signature verification; Telegram secret-based config
- Full audit trail: `audit_logs` for security events, `admin_actions` with
  before/after state for every admin mutation
- Secrets via env (.env locally), AWS Secrets Manager, or Azure Key Vault

## Observability

- structlog JSON logs in production (request ID bound per request)
- Prometheus metrics: HTTP counts/latency + job runs/duration at `/metrics`
- Health endpoints for load balancer probes
- CloudWatch alarms (AWS) / Azure Monitor alerts (Azure) provisioned in Terraform

## Multi-sport extensibility

Sport-specific logic is concentrated in the sports data provider DTOs, the
feature builder and the settlement logic. Adding a sport means a new provider
adapter, a feature module and market settlement rules — models, subscriptions,
reports and Telegram automation are sport-agnostic.
