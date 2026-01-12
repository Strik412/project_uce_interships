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
  # Group services by functional domain. The first (main) service is the ALB target.
  service_groups = {
    frontend = {
      main_service = "web"
      services = [
        { name = "web", port = 3000, ecr_name = "practicas-web" }
      ]
    }
    gateway = {
      main_service = "api-gateway"
      services = [
        { name = "api-gateway", port = 4000, ecr_name = "practicas-api-gateway" }
      ]
    }
    auth_user = {
      main_service = "auth-service"
      services = [
        { name = "auth-service",     port = 3001, ecr_name = "practicas-auth-service" },
        { name = "user-management",  port = 3002, ecr_name = "practicas-user-management" }
      ]
    }
    business = {
      main_service = "registration-service"
      services = [
        { name = "registration-service", port = 3003, ecr_name = "practicas-registration-service" },
        { name = "tracking-service",     port = 3008, ecr_name = "practicas-tracking-service" }
      ]
    }
    support1 = {
      main_service = "communication-service"
      services = [
        { name = "communication-service", port = 3004, ecr_name = "practicas-communication-service" },
        { name = "notification-service",  port = 3005, ecr_name = "practicas-notification-service" }
      ]
    }
    support2 = {
      main_service = "document-management-service"
      services = [
        { name = "document-management-service", port = 3006, ecr_name = "practicas-document-management-service" },
        { name = "reporting-service",           port = 3007, ecr_name = "practicas-reporting-service" }
      ]
    }
  }
}

# IAM Role for EC2 instances (ECR access, CloudWatch logs, ASG operations)
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_role" {
  name               = "practicas-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

# Policy for ECR authentication and image pull
data "aws_iam_policy_document" "ecr_access" {
  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "ecr_access" {
  name   = "practicas-ecr-access"
  role   = aws_iam_role.ec2_role.id
  policy = data.aws_iam_policy_document.ecr_access.json
}

# Policy for CloudWatch Logs
data "aws_iam_policy_document" "cloudwatch_logs" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams"
    ]
    resources = ["arn:aws:logs:${var.aws_region}:*:*"]
  }
}

resource "aws_iam_role_policy" "cloudwatch_logs" {
  name   = "practicas-cloudwatch-logs"
  role   = aws_iam_role.ec2_role.id
  policy = data.aws_iam_policy_document.cloudwatch_logs.json
}

# Policy for Systems Manager (optional but useful for automation)
resource "aws_iam_role_policy_attachment" "ssm_managed" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "practicas-ec2-profile"
  role = aws_iam_role.ec2_role.name
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
  for_each = local.service_groups

  name_prefix   = "practicas-${each.key}-"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = var.instance_type

  iam_instance_profile {
    arn = aws_iam_instance_profile.ec2_profile.arn
  }

  vpc_security_group_ids = [var.app_security_group_id]

  user_data = base64encode(templatefile("${path.module}/user_data_multi.sh", {
    services     = each.value.services
    ecr_registry = var.ecr_registry_url
    db_host      = var.database_endpoint
    db_port      = var.database_port
    db_name      = var.database_name
    db_user      = var.database_user
    db_password  = var.database_password
    redis_host   = var.redis_endpoint
    redis_port   = var.redis_port
    aws_region   = var.aws_region
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
  for_each = local.service_groups

  name                = "practicas-${each.key}-asg"
  vpc_zone_identifier = var.subnet_ids
  # Attach only the main service target group for this functional group
  target_group_arns   = [var.target_group_arns[each.value.main_service]]
  health_check_type   = "ELB"
  health_check_grace_period = 300
  min_size            = var.asg_min
  max_size            = var.asg_max
  desired_capacity    = var.asg_desired

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
