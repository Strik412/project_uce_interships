variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "VPC ID desde Lab 1"
  type        = string
}

variable "subnet_ids" {
  description = "Subnets públicas desde Lab 1"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "Security Group para RDS"
  type        = string
}

variable "redis_security_group_id" {
  description = "Security Group para Redis"
  type        = string
}

variable "alb_security_group_id" {
  description = "Security Group para ALB"
  type        = string
}

variable "db_username" {
  description = "Usuario de la base de datos"
  type        = string
}

variable "db_password" {
  description = "Password de la base de datos"
  type        = string
  sensitive   = true
}
