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
