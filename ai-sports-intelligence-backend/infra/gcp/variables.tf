variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "bxailab"
}

variable "project_number" {
  description = "GCP project number"
  type        = string
  default     = "143125406102"
}

variable "project_name" {
  description = "Logical project name used for resource naming"
  type        = string
  default     = "sports-ai"
}

variable "environment" {
  description = "Deployment environment (staging, production)"
  type        = string
  default     = "staging"
}

variable "region" {
  description = "Primary GCP region"
  type        = string
  default     = "us-central1"
}

variable "container_image" {
  description = "Backend container image (Artifact Registry or GCR URL)"
  type        = string
}

variable "postgres_tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-f1-micro"
}

variable "postgres_disk_size_gb" {
  description = "Cloud SQL disk size in GB"
  type        = number
  default     = 20
}

variable "redis_tier" {
  description = "Memorystore tier (BASIC or STANDARD_HA)"
  type        = string
  default     = "BASIC"
}

variable "redis_memory_gb" {
  description = "Memorystore memory size in GB"
  type        = number
  default     = 1
}

variable "api_min_instances" {
  description = "Minimum Cloud Run API instances"
  type        = number
  default     = 1
}

variable "api_max_instances" {
  description = "Maximum Cloud Run API instances"
  type        = number
  default     = 4
}

variable "postgres_admin_username" {
  description = "Cloud SQL administrator username"
  type        = string
  default     = "sportsai"
}

variable "enable_cloud_armor" {
  description = "Provision external HTTPS load balancer with Cloud Armor"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Custom domain for the API (optional, requires Cloud Armor LB)"
  type        = string
  default     = ""
}

variable "cors_origins" {
  description = "Allowed CORS origins for the API"
  type        = list(string)
  default     = ["https://bxailab.web.app", "http://localhost:5173"]
}
