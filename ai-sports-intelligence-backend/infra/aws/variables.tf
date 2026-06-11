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

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_instance_class" {
  description = "RDS PostgreSQL instance class"
  type        = string
  default     = "db.t4g.small"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t4g.micro"
}

variable "container_image" {
  description = "Backend container image URI (ECR)"
  type        = string
}

variable "desired_count" {
  description = "Desired number of API tasks"
  type        = number
  default     = 2
}

variable "domain_name" {
  description = "Public domain name for the API (optional)"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS (optional)"
  type        = string
  default     = ""
}

variable "db_username" {
  description = "Master database username"
  type        = string
  default     = "sportsai"
}

variable "enable_cloudfront" {
  description = "Create an optional CloudFront distribution in front of the ALB"
  type        = bool
  default     = false
}
