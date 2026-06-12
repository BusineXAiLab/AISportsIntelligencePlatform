resource "google_service_account" "app" {
  account_id   = "${local.name_prefix}-run"
  display_name = "Sports AI runtime (${var.environment})"
}

resource "google_project_iam_member" "app_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.app.email}"
}

resource "google_project_iam_member" "app_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.app.email}"
}

resource "google_project_iam_member" "app_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.app.email}"
}

resource "google_storage_bucket_iam_member" "app_storage" {
  bucket = google_storage_bucket.main.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.app.email}"
}

locals {
  secret_ids = [
    google_secret_manager_secret.database_url.id,
    google_secret_manager_secret.redis_url.id,
    google_secret_manager_secret.secret_key.id,
    google_secret_manager_secret.app_config.id,
  ]
}

resource "google_secret_manager_secret_iam_member" "app_secrets" {
  for_each = toset(local.secret_ids)

  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.app.email}"
}
