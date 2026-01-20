terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
locals {
  # Per-service configuration. Each entry becomes one ASG (one instance if ASG sizes = 1).
  services = {
    "web" = { port = 3000, ecr_name = "practicas-web" }
    "api-gateway" = { port = 4000, ecr_name = "practicas-api-gateway" }
    "auth-service" = { port = 3001, ecr_name = "practicas-auth-service" }
    "user-management" = { port = 3002, ecr_name = "practicas-user-management" }
    "registration-service" = { port = 3003, ecr_name = "practicas-registration-service" }
    "tracking-service" = { port = 3008, ecr_name = "practicas-tracking-service" }
    "communication-service" = { port = 3004, ecr_name = "practicas-communication-service" }
    "notification-service" = { port = 3005, ecr_name = "practicas-notification-service" }
    "document-management-service" = { port = 3006, ecr_name = "practicas-document-management-service" }
    "reporting-service" = { port = 3007, ecr_name = "practicas-reporting-service" }
  }

  # Allow selecting a subset of services to enable. If empty, all services are used.
  selected_services = length(var.enabled_services) > 0 ? { for k, v in local.services : k => v if contains(var.enabled_services, k) } : local.services
  # Convenience list of keys (used to pick a subnet index)
  selected_service_keys = keys(local.selected_services)
}


# Get latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}



# Single EC2 instances (one per service) - create these first, then we can safely scale down/destroy ASGs after validation
resource "aws_instance" "service" {
  for_each = local.selected_services

  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = element(var.subnet_ids, index(local.selected_service_keys, each.key) % length(var.subnet_ids))
  associate_public_ip_address = false
  vpc_security_group_ids = [var.app_security_group_id]

  user_data = templatefile("${path.module}/user_data_multi.sh", {
    # single service per instance
    run_services_block   = "run_service \"${each.key}\" \"${each.value.port}\" \"${var.dockerhub_username}/${each.value.ecr_name}:${lookup(var.service_image_tags, each.key, var.default_image_tag)}\""
    db_host              = var.database_endpoint
    db_port              = var.database_port
    db_name              = var.database_name
    db_user              = var.database_user
    db_password          = var.database_password
    redis_host           = var.redis_endpoint
    redis_port           = var.redis_port
    aws_region           = var.aws_region
    dockerhub_username   = var.dockerhub_username
  })

  tags = {
    Name  = "practicas-${each.key}"
    Group = each.key
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Register each instance with its service target group
resource "aws_lb_target_group_attachment" "service" {
  for_each = local.selected_services

  target_group_arn = var.target_group_arns[each.key]
  target_id        = aws_instance.service[each.key].id
  port             = each.value.port
}

# Outputs
output "instance_ids" {
  value       = { for k, v in aws_instance.service : k => v.id }
  description = "EC2 instance IDs for each service"
}

output "instance_private_ips" {
  value       = { for k, v in aws_instance.service : k => v.private_ip }
  description = "Private IPs of EC2 instances for each service"
}
