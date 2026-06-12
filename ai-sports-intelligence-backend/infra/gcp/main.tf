terraform {
  required_version = ">= 1.6"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.40"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Configure a remote backend per environment, e.g.:
  # backend "gcs" {
  #   bucket = "bxailab-tfstate"
  #   prefix = "sports-ai"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  labels = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }

  required_apis = [
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "compute.googleapis.com",
    "vpcaccess.googleapis.com",
    "servicenetworking.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.required_apis)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}
