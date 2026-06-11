# API Reference

Interactive OpenAPI docs are served at `/docs` (Swagger UI) and `/redoc`.
All endpoints are prefixed with `/api/v1`. Authentication uses
`Authorization: Bearer <access_token>`.

## Auth

| Method | Path | Description |
| --- | --- | --- |
| POST | /auth/register | Create account (returns user) |
| POST | /auth/login | Login, returns access + refresh tokens |
| POST | /auth/refresh | Rotate refresh token, new access token |
| POST | /auth/logout | Revoke refresh token |
| POST | /auth/forgot-password | Send reset token (no account enumeration) |
| POST | /auth/reset-password | Reset password with token |
| POST | /auth/verify-email | Verify email with token |

Roles: `FREE_USER`, `PREMIUM_USER`, `ELITE_USER`, `CONTENT_LEAD`, `ADMIN`,
`SUPER_ADMIN`.

## Users

| Method | Path | Description |
| --- | --- | --- |
| GET | /users/me | Profile incl. plan, favorites, telegram status |
| PATCH | /users/me | Update profile |
| GET / PATCH | /users/preferences | Notification prefs, favorites, locale |
| GET / POST | /users/watchlist | List / add watchlist items |
| DELETE | /users/watchlist/{item_id} | Remove watchlist item |

## Subscriptions

| Method | Path | Description |
| --- | --- | --- |
| GET | /subscriptions/plans | Free / Premium $19.99 / Elite $49.99 |
| GET | /subscriptions/status | Current entitlement status |
| POST | /subscriptions/checkout-session | Stripe Checkout (monthly/annual) |
| POST | /subscriptions/customer-portal | Stripe billing portal |
| POST | /subscriptions/webhook/stripe | Stripe webhook (signature verified) |
| POST | /subscriptions/cancel | Cancel at period end |
| POST | /subscriptions/reactivate | Undo pending cancellation |

## Matches

| Method | Path |
| --- | --- |
| GET | /matches/today |
| GET | /matches/upcoming?days=7&league_id= |
| GET | /matches/{match_id} |
| GET | /matches/{match_id}/timeline |
| GET | /leagues |
| GET | /teams/{team_id} |
| GET | /teams/{team_id}/form |

## Predictions

| Method | Path | Notes |
| --- | --- | --- |
| GET | /predictions/today | Headline probabilities for everyone; full insight requires Premium |
| GET | /predictions/{match_id} | Latest published prediction |
| GET | /predictions/history | Paginated, requires auth |
| GET | /predictions/accuracy | Settled accuracy, optional `model_version` |
| GET | /predictions/model-status | Active model registry entries |

Prediction payloads include 1X2 / over-under / BTTS probabilities, correct
score ranges, confidence score and level, risk level, key factors, explanation,
model version, feature snapshot ID and input data timestamp.

## Reports

| Method | Path | Access |
| --- | --- | --- |
| GET | /reports/daily | Published reports filtered by plan |
| GET | /reports/{report_id} | Plan-gated |
| POST | /reports/generate | CONTENT_LEAD+ |
| POST | /reports/{report_id}/publish | CONTENT_LEAD+ (blocked if banned language present) |
| POST | /reports/{report_id}/archive | CONTENT_LEAD+ |

Report types: match preview, daily intelligence, team form summary, tactical
observation, injury impact, personalized, Telegram short, long-form premium.

## Telegram

| Method | Path | Description |
| --- | --- | --- |
| GET | /telegram/status | Connection + VIP status |
| POST | /telegram/connect | Issue verification code |
| POST | /telegram/verify | Link Telegram account; VIP granted if entitled |
| POST | /telegram/disconnect | Unlink (revokes VIP) |
| POST | /telegram/send-test | Admin-only test message |

## Admin (ADMIN/CONTENT_LEAD/SUPER_ADMIN; every action audited)

- `GET /admin/overview` — KPI dashboard
- `GET/PATCH /admin/users`, `GET /admin/users/{id}`
- `GET /admin/subscriptions`
- `GET /admin/predictions/pending`, `POST .../approve`, `POST .../reject`
- `GET /admin/reports/pending`, `PATCH /admin/reports/{id}`, `POST .../approve`, `POST .../publish`
- `GET /admin/telegram/posts`, `POST /admin/telegram/posts/{id}/approve`
- `GET /admin/model-status`, `GET /admin/data-feed-status`, `GET /admin/audit-logs`

## Analytics (admin)

- `GET /analytics/business` — users, conversion, MRR
- `GET /analytics/subscriptions` — churn, renewals, by plan
- `GET /analytics/predictions` — volume by status
- `GET /analytics/model-accuracy` — by league/market/model, Brier score, calibration
- `GET /analytics/telegram` — delivery success, VIP accounts

## Health

- `GET /health` — full check (DB + Redis)
- `GET /health/live` — liveness
- `GET /health/ready` — readiness (DB)
- `GET /metrics` — Prometheus metrics (mounted at app root)

## Error format

```json
{
  "error_code": "not_found",
  "detail": "Match not found",
  "request_id": "9b1c..."
}
```
