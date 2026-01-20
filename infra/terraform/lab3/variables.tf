variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs for EC2 instances"
}

variable "app_security_group_id" {
  type        = string
  description = "Security group ID for application instances"
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "EC2 instance type for services"
}

variable "target_group_arns" {
  type        = map(string)
  description = "Target group ARNs keyed by service name"
}

variable "asg_min" {
  type        = number
  default     = 1
  description = "Minimum number of instances per service"
}

variable "asg_max" {
  type        = number
  default     = 1
  description = "Maximum number of instances per service"
}

variable "asg_desired" {
  type        = number
  default     = 1
  description = "Desired number of instances per service"
}

# Optional: select which services to enable; empty list = all services
variable "enabled_services" {
  type        = list(string)
  default     = []
  description = "List of service keys to create ASGs for; empty = all services"
}

# Docker Hub username to pull images from
variable "dockerhub_username" {
  type        = string
  default     = "dapaeza"
  description = "Docker Hub username used by instances to pull images"
}

# Database variables
variable "database_endpoint" {
  type        = string
  description = "RDS database endpoint"
}

variable "database_port" {
  type        = number
  default     = 5432
  description = "RDS database port"
}

variable "database_name" {
  type        = string
  default     = "practicas_db"
  description = "RDS database name"
}

variable "database_user" {
  type        = string
  description = "RDS database master username"
}

variable "database_password" {
  type        = string
  sensitive   = true
  description = "RDS database master password"
}

# Redis variables
variable "redis_endpoint" {
  type        = string
  description = "ElastiCache Redis endpoint"
}

variable "redis_port" {
  type        = number
  default     = 6379
  description = "ElastiCache Redis port"
}

# Image tag configuration
variable "default_image_tag" {
  type        = string
  default     = "latest"
  description = "Default Docker image tag to use when no per-service tag is provided"
}

variable "service_image_tags" {
  type        = map(string)
  default     = {}
  description = "Optional per-service image tags keyed by service name"
}
