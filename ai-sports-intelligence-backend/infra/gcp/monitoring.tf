resource "google_monitoring_notification_channel" "email" {
  count = var.environment == "production" ? 1 : 0

  display_name = "${local.name_prefix}-ops-email"
  type         = "email"

  labels = {
    email_address = "ops@businexailab.com"
  }

  depends_on = [google_project_service.apis]
}

resource "google_monitoring_alert_policy" "cloud_run_5xx" {
  display_name = "${local.name_prefix} Cloud Run 5xx rate"
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run 5xx responses"

    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND metric.type = \"run.googleapis.com/request_count\" AND metric.labels.response_code_class = \"5xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 10

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = var.environment == "production" ? [google_monitoring_notification_channel.email[0].name] : []

  alert_strategy {
    auto_close = "1800s"
  }

  depends_on = [google_project_service.apis]
}

resource "google_monitoring_alert_policy" "cloud_sql_cpu" {
  display_name = "${local.name_prefix} Cloud SQL CPU"
  combiner     = "OR"

  conditions {
    display_name = "Cloud SQL CPU utilization"

    condition_threshold {
      filter          = "resource.type = \"cloudsql_database\" AND metric.type = \"cloudsql.googleapis.com/database/cpu/utilization\""
      duration        = "900s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.85

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = var.environment == "production" ? [google_monitoring_notification_channel.email[0].name] : []

  depends_on = [google_project_service.apis]
}

resource "google_monitoring_alert_policy" "redis_memory" {
  display_name = "${local.name_prefix} Redis memory"
  combiner     = "OR"

  conditions {
    display_name = "Memorystore memory usage ratio"

    condition_threshold {
      filter          = "resource.type = \"redis_instance\" AND metric.type = \"redis.googleapis.com/stats/memory/usage_ratio\""
      duration        = "900s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.85

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = var.environment == "production" ? [google_monitoring_notification_channel.email[0].name] : []

  depends_on = [google_project_service.apis]
}
