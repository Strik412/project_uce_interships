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

# Launch Templates for each service group
resource "aws_launch_template" "group" {
  for_each = local.selected_services

  name_prefix   = "practicas-${each.key}-"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = var.instance_type


  vpc_security_group_ids = [var.app_security_group_id]

  user_data = base64encode(templatefile("${path.module}/user_data_multi.sh", {
    # single service per instance
    run_services_block   = "run_service \"${each.key}\" \"${each.value.port}\" \"${each.value.ecr_name}\""
    db_host              = var.database_endpoint
    db_port              = var.database_port
    db_name              = var.database_name
    db_user              = var.database_user
    db_password          = var.database_password
    redis_host           = var.redis_endpoint
    redis_port           = var.redis_port
    aws_region           = var.aws_region
    dockerhub_username   = var.dockerhub_username
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name  = "practicas-${each.key}"
      Group = each.key
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Groups for each service group
resource "aws_autoscaling_group" "group" {
  for_each = local.selected_services

  name                = "practicas-${each.key}-asg"
  vpc_zone_identifier = var.subnet_ids
  # Attach the single target group for this service
  target_group_arns   = [ var.target_group_arns[each.key] ]
  health_check_type         = "ELB"
  health_check_grace_period = 300
  min_size                  = var.asg_min
  max_size                  = var.asg_max
  desired_capacity          = var.asg_desired

  launch_template {
    id      = aws_launch_template.group[each.key].id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "practicas-${each.key}"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
  depends_on = [aws_launch_template.group]
}

# Outputs
output "asg_names" {
  value       = { for k, v in aws_autoscaling_group.group : k => v.name }
  description = "Auto Scaling Group names for each service group"
}

output "launch_template_ids" {
  value       = { for k, v in aws_launch_template.group : k => v.id }
  description = "Launch Template IDs for each service group"
}
