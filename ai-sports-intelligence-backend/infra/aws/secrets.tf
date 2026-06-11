resource "aws_secretsmanager_secret" "app" {
  name = "${local.name_prefix}-app-secrets"
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id

  # Application secrets (Stripe, Telegram, LLM keys) should be added to this
  # JSON blob out-of-band or via CI; Terraform seeds infrastructure values.
  secret_string = jsonencode({
    DATABASE_URL = "postgresql+asyncpg://${var.db_username}:${random_password.db.result}@${aws_db_instance.main.address}:5432/sports_ai"
    REDIS_URL    = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379/0"
    SECRET_KEY   = random_password.app_secret_key.result
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

resource "random_password" "app_secret_key" {
  length  = 64
  special = false
}
