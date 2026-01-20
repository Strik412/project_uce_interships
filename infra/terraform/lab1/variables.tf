variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "Existing VPC ID (leave null to use default VPC)"
  type        = string
  default     = null
}

variable "subnet_ids" {
  description = "Optional list of subnet IDs"
  type        = list(string)
  default     = null
}

variable "key_pair_name" {
  description = "EC2 key pair name for bastion"
  type        = string
}

variable "your_ip_cidr" {
  description = "Your IP in CIDR form (e.g., 1.2.3.4/32)"
  type        = string
}

