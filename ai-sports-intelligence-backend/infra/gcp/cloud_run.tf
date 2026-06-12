locals {
  common_env = [
    { name = "ENVIRONMENT", value = var.environment },
    { name = "OBJECT_STORAGE_PROVIDER", value = "gcs" },
    { name = "GCS_BUCKET", value = google_storage_bucket.main.name },
    { name = "GCP_PROJECT_ID", value = var.project_id },
    { name = "SECRETS_PROVIDER", value = "env" },
    { name = "CORS_ORIGINS", value = jsonencode(concat(var.cors_origins, [google_cloud_run_v2_service.frontend.uri])) },
    { name = "SPORTS_DATA_PROVIDER", value = "mock" },
  ]

  secret_env = [
    {
      name   = "DATABASE_URL"
      secret = google_secret_manager_secret.database_url.secret_id
    },
    {
      name   = "REDIS_URL"
      secret = google_secret_manager_secret.redis_url.secret_id
    },
    {
      name   = "SECRET_KEY"
      secret = google_secret_manager_secret.secret_key.secret_id
    },
  ]

  cloud_run_template = {
    service_account = google_service_account.app.email
    vpc_access = {
      connector = google_vpc_access_connector.main.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
    volumes = [{
      name = "cloudsql"
      cloud_sql_instance = {
        instances = [google_sql_database_instance.main.connection_name]
      }
    }]
  }
}

resource "google_cloud_run_v2_service" "api" {
  name     = "${local.name_prefix}-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  labels = local.labels

  template {
    service_account = local.cloud_run_template.service_account

    scaling {
      min_instance_count = var.api_min_instances
      max_instance_count = var.api_max_instances
    }

    vpc_access {
      connector = local.cloud_run_template.vpc_access.connector
      egress    = local.cloud_run_template.vpc_access.egress
    }

    volumes {
      name = local.cloud_run_template.volumes[0].name
      cloud_sql_instance {
        instances = local.cloud_run_template.volumes[0].cloud_sql_instance.instances
      }
    }

    containers {
      name  = "api"
      image = var.container_image
      ports {
        container_port = 8000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      dynamic "env" {
        for_each = local.common_env
        content {
          name  = env.value.name
          value = env.value.value
        }
      }

      dynamic "env" {
        for_each = local.secret_env
        content {
          name = env.value.name
          value_source {
            secret_key_ref {
              secret  = env.value.secret
              version = "latest"
            }
          }
        }
      }

      startup_probe {
        http_get {
          path = "/api/v1/health/live"
          port = 8000
        }
        initial_delay_seconds = 10
        period_seconds        = 10
        failure_threshold     = 6
      }

      liveness_probe {
        http_get {
          path = "/api/v1/health/live"
          port = 8000
        }
        period_seconds = 30
      }
    }
  }

  depends_on = [
    google_project_service.apis,
    google_secret_manager_secret_iam_member.app_secrets,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "api_public" {
  name     = google_cloud_run_v2_service.api.name
  location = google_cloud_run_v2_service.api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service" "worker" {
  name     = "${local.name_prefix}-worker"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  labels = local.labels

  template {
    service_account = local.cloud_run_template.service_account

    scaling {
      min_instance_count = 1
      max_instance_count = 2
    }

    vpc_access {
      connector = local.cloud_run_template.vpc_access.connector
      egress    = local.cloud_run_template.vpc_access.egress
    }

    volumes {
      name = local.cloud_run_template.volumes[0].name
      cloud_sql_instance {
        instances = local.cloud_run_template.volumes[0].cloud_sql_instance.instances
      }
    }

    containers {
      name  = "worker"
      image = var.container_image
      command = [
        "sh",
        "-c",
        "python -m http.server 8080 & exec celery -A app.jobs.celery_app:celery_app worker --loglevel=INFO",
      ]

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
        cpu_idle = false
      }

      startup_probe {
        http_get {
          path = "/"
          port = 8080
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 12
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      dynamic "env" {
        for_each = local.common_env
        content {
          name  = env.value.name
          value = env.value.value
        }
      }

      dynamic "env" {
        for_each = local.secret_env
        content {
          name = env.value.name
          value_source {
            secret_key_ref {
              secret  = env.value.secret
              version = "latest"
            }
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.apis,
    google_secret_manager_secret_iam_member.app_secrets,
  ]
}

resource "google_cloud_run_v2_service" "beat" {
  name     = "${local.name_prefix}-beat"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  labels = local.labels

  template {
    service_account = local.cloud_run_template.service_account

    scaling {
      min_instance_count = 1
      max_instance_count = 1
    }

    vpc_access {
      connector = local.cloud_run_template.vpc_access.connector
      egress    = local.cloud_run_template.vpc_access.egress
    }

    volumes {
      name = local.cloud_run_template.volumes[0].name
      cloud_sql_instance {
        instances = local.cloud_run_template.volumes[0].cloud_sql_instance.instances
      }
    }

    containers {
      name  = "beat"
      image = var.container_image
      command = [
        "sh",
        "-c",
        "python -m http.server 8080 & exec celery -A app.jobs.celery_app:celery_app beat --loglevel=INFO",
      ]

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle = false
      }

      startup_probe {
        http_get {
          path = "/"
          port = 8080
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 12
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      dynamic "env" {
        for_each = local.common_env
        content {
          name  = env.value.name
          value = env.value.value
        }
      }

      dynamic "env" {
        for_each = local.secret_env
        content {
          name = env.value.name
          value_source {
            secret_key_ref {
              secret  = env.value.secret
              version = "latest"
            }
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.apis,
    google_secret_manager_secret_iam_member.app_secrets,
  ]
}

resource "google_cloud_run_v2_job" "migrate" {
  name     = "${local.name_prefix}-migrate"
  location = var.region

  labels = local.labels

  template {
    template {
      service_account = local.cloud_run_template.service_account
      timeout         = "600s"

      vpc_access {
        connector = local.cloud_run_template.vpc_access.connector
        egress    = local.cloud_run_template.vpc_access.egress
      }

      volumes {
        name = local.cloud_run_template.volumes[0].name
        cloud_sql_instance {
          instances = local.cloud_run_template.volumes[0].cloud_sql_instance.instances
        }
      }

      containers {
        name    = "migrate"
        image   = var.container_image
        command = ["alembic", "upgrade", "head"]

        volume_mounts {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }

        dynamic "env" {
          for_each = local.common_env
          content {
            name  = env.value.name
            value = env.value.value
          }
        }

        dynamic "env" {
          for_each = local.secret_env
          content {
            name = env.value.name
            value_source {
              secret_key_ref {
                secret  = env.value.secret
                version = "latest"
              }
            }
          }
        }
      }
    }
  }

  depends_on = [
    google_project_service.apis,
    google_secret_manager_secret_iam_member.app_secrets,
  ]
}
