resource "google_redis_instance" "main" {
  name               = "${local.name_prefix}-redis"
  tier               = var.redis_tier
  memory_size_gb     = var.redis_memory_gb
  region             = var.region
  authorized_network = google_compute_network.main.id
  connect_mode       = "DIRECT_PEERING"
  redis_version      = "REDIS_7_0"

  depends_on = [
    google_service_networking_connection.private_vpc,
    google_project_service.apis,
  ]
}

locals {
  redis_url = "redis://${google_redis_instance.main.host}:${google_redis_instance.main.port}/0"
}
