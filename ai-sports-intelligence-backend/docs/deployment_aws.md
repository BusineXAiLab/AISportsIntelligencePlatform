# AWS Deployment Guide

Target architecture: ECS Fargate (API + Celery worker + beat) behind an ALB
with WAF, RDS PostgreSQL, ElastiCache Redis, S3, Secrets Manager, CloudWatch,
optional CloudFront. All provisioned by Terraform in `infra/aws/`.

## Prerequisites

- Terraform >= 1.6, AWS CLI configured
- An ECR repository (e.g. `sports-ai-backend`)
- (Optional) ACM certificate + Route53 domain for HTTPS
- A GitHub OIDC deploy role for CI (`AWS_DEPLOY_ROLE_ARN` secret)

## 1. Build and push the image

```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <acct>.dkr.ecr.<region>.amazonaws.com
docker build -f docker/Dockerfile -t <acct>.dkr.ecr.<region>.amazonaws.com/sports-ai-backend:v1 .
docker push <acct>.dkr.ecr.<region>.amazonaws.com/sports-ai-backend:v1
```

## 2. Provision infrastructure

```bash
cd infra/aws
terraform init
terraform apply \
  -var "environment=staging" \
  -var "region=us-east-1" \
  -var "container_image=<acct>.dkr.ecr.us-east-1.amazonaws.com/sports-ai-backend:v1" \
  -var "certificate_arn=arn:aws:acm:..."        # optional HTTPS
```

Outputs include the ALB DNS name, S3 bucket and the Secrets Manager secret ID.

## 3. Configure application secrets

Terraform seeds `DATABASE_URL`, `REDIS_URL` and `SECRET_KEY` into the
Secrets Manager JSON secret. Add the remaining keys (Stripe, Telegram, LLM,
sports data) to the same secret:

```bash
aws secretsmanager get-secret-value --secret-id sports-ai-staging-app-secrets
aws secretsmanager put-secret-value --secret-id sports-ai-staging-app-secrets \
  --secret-string file://secrets.json
```

## 4. Run migrations

Migrations run automatically in the deploy workflow, or manually:

```bash
aws ecs run-task --cluster sports-ai-staging-cluster \
  --task-definition sports-ai-staging-api --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[...],securityGroups=[...]}" \
  --overrides '{"containerOverrides":[{"name":"api","command":["alembic","upgrade","head"]}]}'
```

## 5. Create the first admin

Run a one-off task with
`["python","scripts/create_admin_user.py","--email","...","--password","..."]`
as the container command (same pattern as migrations).

## 6. Stripe webhook

Point a Stripe webhook at `https://<domain>/api/v1/subscriptions/webhook/stripe`
with events: `checkout.session.completed`, `customer.subscription.*`,
`invoice.payment_failed`, `invoice.payment_succeeded`. Store the signing
secret as `STRIPE_WEBHOOK_SECRET`.

## 7. Telegram bot

1. Create a bot via @BotFather; store `TELEGRAM_BOT_TOKEN`.
2. Add the bot as admin of the public and VIP channels.
3. Set `TELEGRAM_PUBLIC_CHANNEL_ID` / `TELEGRAM_VIP_CHANNEL_ID`.

## CI/CD

`.github/workflows/deploy_aws.yml` performs: image build/push to ECR →
`terraform apply` → migration task → health-endpoint smoke test. Trigger via
the *Deploy to AWS* workflow dispatch with the target environment.

## Backup and restore

- RDS: 7-day automated backups; restore via point-in-time recovery
  (`aws rds restore-db-instance-to-point-in-time`).
- S3: versioning enabled; lifecycle expires non-current versions after 90 days.
- Manual logical backup: `pg_dump "$DATABASE_URL" > backup.sql`.

## Monitoring

- CloudWatch log groups: `/ecs/sports-ai-<env>/api` and `/worker`
- Alarms: ALB 5xx, ECS CPU, RDS CPU (extend with SNS notifications)
- Prometheus metrics scrapeable from `/metrics`
- Container Insights enabled on the ECS cluster
