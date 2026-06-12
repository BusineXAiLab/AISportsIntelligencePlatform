resource "random_password" "secret_key" {
  length  = 64
  special = false
}

resource "google_secret_manager_secret" "database_url" {
  secret_id = "${local.name_prefix}-database-url"

  replication {
    auto {}
  }

  labels = local.labels

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = local.database_url
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id = "${local.name_prefix}-redis-url"

  replication {
    auto {}
  }

  labels = local.labels

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = local.redis_url
}

resource "google_secret_manager_secret" "secret_key" {
  secret_id = "${local.name_prefix}-secret-key"

  replication {
    auto {}
  }

  labels = local.labels

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "secret_key" {
  secret      = google_secret_manager_secret.secret_key.id
  secret_data = random_password.secret_key.result
}

resource "google_secret_manager_secret" "sports_data_api_key" {
  secret_id = "${local.name_prefix}-sports-data-api-key"

  replication {
    auto {}
  }

  labels = local.labels

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "sports_data_api_key" {
  secret      = google_secret_manager_secret.sports_data_api_key.id
  secret_data = var.sports_data_api_key
}

resource "google_secret_manager_secret" "app_config" {
  secret_id = "${local.name_prefix}-app-config"

  replication {
    auto {}
  }

  labels = local.labels

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "app_config" {
  secret = google_secret_manager_secret.app_config.id
  secret_data = jsonencode({
    STRIPE_SECRET_KEY              = ""
    STRIPE_WEBHOOK_SECRET          = ""
    STRIPE_PREMIUM_PRICE_ID        = ""
    STRIPE_ELITE_PRICE_ID          = ""
    STRIPE_PREMIUM_ANNUAL_PRICE_ID = ""
    STRIPE_ELITE_ANNUAL_PRICE_ID   = ""
    TELEGRAM_BOT_TOKEN             = ""
    TELEGRAM_PUBLIC_CHANNEL_ID     = ""
    TELEGRAM_VIP_CHANNEL_ID        = ""
    LLM_API_KEY                    = ""
    SPORTS_DATA_PROVIDER           = "football_data_org"
    SPORTS_DATA_BASE_URL           = "https://api.football-data.org/v4"
    SPORTS_DATA_API_KEY            = ""
  })
}
