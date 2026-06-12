variable "frontend_container_image" {
  description = "Frontend container image (nginx serving Vite build)"
  type        = string
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = "${local.name_prefix}-web"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  labels = local.labels

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 4
    }

    containers {
      name  = "web"
      image = var.frontend_container_image
      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      startup_probe {
        http_get {
          path = "/"
          port = 8080
        }
        initial_delay_seconds = 3
        period_seconds        = 5
        failure_threshold     = 6
      }
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  name     = google_cloud_run_v2_service.frontend.name
  location = google_cloud_run_v2_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
