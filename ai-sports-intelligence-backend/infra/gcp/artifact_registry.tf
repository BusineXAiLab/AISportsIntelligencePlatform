resource "google_artifact_registry_repository" "main" {
  location      = var.region
  repository_id = "${var.project_name}-backend"
  description   = "AI Sports Intelligence backend container images"
  format        = "DOCKER"

  labels = local.labels

  depends_on = [google_project_service.apis]
}

locals {
  default_image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}/backend:latest"
}
