variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "sports-ai"
}

variable "environment" {
  description = "Deployment environment (staging, production)"
  type        = string
  default     = "staging"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "postgres_sku" {
  description = "Azure Database for PostgreSQL Flexible Server SKU"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "redis_sku" {
  description = "Azure Cache for Redis SKU (Basic, Standard, Premium)"
  type        = string
  default     = "Basic"
}

variable "redis_family" {
  description = "Redis family (C for Basic/Standard, P for Premium)"
  type        = string
  default     = "C"
}

variable "redis_capacity" {
  description = "Redis capacity tier"
  type        = number
  default     = 0
}

variable "container_image" {
  description = "Backend container image (registry/repo:tag)"
  type        = string
}

variable "desired_replicas" {
  description = "Desired API container replicas"
  type        = number
  default     = 2
}

variable "domain_name" {
  description = "Custom domain for Front Door (optional)"
  type        = string
  default     = ""
}

variable "certificate_config" {
  description = "Certificate configuration mode for the custom domain"
  type        = string
  default     = "managed"
}

variable "postgres_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "sportsai"
}

variable "enable_front_door" {
  description = "Provision Azure Front Door with WAF policy"
  type        = bool
  default     = true
}
