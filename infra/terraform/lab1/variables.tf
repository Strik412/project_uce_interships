variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "Existing VPC ID (null = default VPC)"
  type        = string
  default     = null
}

variable "subnet_ids" {
  description = "Optional subnet IDs"
  type        = list(string)
  default     = null
}

variable "key_pair_name" {
  description = "EC2 key pair name"
  type        = string
}
