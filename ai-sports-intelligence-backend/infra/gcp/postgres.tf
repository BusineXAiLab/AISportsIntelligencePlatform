resource "random_password" "postgres" {
  length  = 32
  special = false
}

resource "google_sql_database_instance" "main" {
  name             = "${local.name_prefix}-postgres"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = var.postgres_tier
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_size         = var.postgres_disk_size_gb
    disk_type         = "PD_SSD"

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = var.environment == "production"
      start_time                     = "03:00"
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }
  }

  deletion_protection = var.environment == "production"

  depends_on = [
    google_service_networking_connection.private_vpc,
    google_project_service.apis,
  ]
}

resource "google_sql_database" "main" {
  name     = "sports_ai"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "main" {
  name     = var.postgres_admin_username
  instance = google_sql_database_instance.main.name
  password = random_password.postgres.result
}

locals {
  database_url = "postgresql+asyncpg://${var.postgres_admin_username}:${random_password.postgres.result}@/${google_sql_database.main.name}?host=/cloudsql/${google_sql_database_instance.main.connection_name}"
}
