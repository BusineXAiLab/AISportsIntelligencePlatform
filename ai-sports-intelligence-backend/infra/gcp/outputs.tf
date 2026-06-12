output "project_id" {
  description = "GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "Primary GCP region"
  value       = var.region
}

output "api_url" {
  description = "Public Cloud Run API URL"
  value       = google_cloud_run_v2_service.api.uri
}

output "frontend_url" {
  description = "Public Cloud Run frontend URL"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}"
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL instance connection name"
  value       = google_sql_database_instance.main.connection_name
}

output "cloud_sql_private_ip" {
  description = "Cloud SQL private IP address"
  value       = google_sql_database_instance.main.private_ip_address
}

output "redis_host" {
  description = "Memorystore Redis host"
  value       = google_redis_instance.main.host
}

output "gcs_bucket" {
  description = "Object storage bucket name"
  value       = google_storage_bucket.main.name
}

output "app_config_secret_id" {
  description = "Secret Manager secret ID for optional app config (Stripe, Telegram, LLM)"
  value       = google_secret_manager_secret.app_config.secret_id
}

output "migrate_job_name" {
  description = "Cloud Run job name for database migrations"
  value       = google_cloud_run_v2_job.migrate.name
}

output "service_account_email" {
  description = "Runtime service account email"
  value       = google_service_account.app.email
}

output "default_container_image" {
  description = "Default Artifact Registry image reference"
  value       = local.default_image
}
