variable "aws_region" {
  default = "us-east-1"
}

variable "subnet_ids" {
  type = list(string)
}

variable "instance_type" {
  default = "t3.small"
}

variable "app_security_group_id" {
  type = string
}

variable "target_group_arns" {
  type = map(string)
}

# Database
variable "database_endpoint" { type = string }
variable "database_port"     { type = number }
variable "database_name"     { type = string }
variable "database_user"     { type = string }
variable "database_password" {
  type      = string
  sensitive = true
}

# Redis
variable "redis_endpoint" { type = string }
variable "redis_port"     { type = number }
