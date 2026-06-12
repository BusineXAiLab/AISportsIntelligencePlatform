resource "google_storage_bucket" "main" {
  name     = "${var.project_id}-${local.name_prefix}-assets"
  location = var.region

  uniform_bucket_level_access = true
  force_destroy               = var.environment != "production"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }

  labels = local.labels

  depends_on = [google_project_service.apis]
}
