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

data "aws_caller_identity" "current" {}

data "aws_vpc" "selected" {
  id      = var.vpc_id
  default = var.vpc_id == null ? true : null
}

data "aws_subnets" "selected" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.selected.id]
  }
}

data "aws_ami" "al2" {
  owners      = ["amazon"]
  most_recent = true
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

locals {
  subnet_ids = var.subnet_ids != null ? var.subnet_ids : data.aws_subnets.selected.ids
  # ecr_repos removed
}

# Security groups
resource "aws_security_group" "alb" {
  name        = "lab1-alb-sg"
  description = "Allow HTTP from internet"
  vpc_id      = data.aws_vpc.selected.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "bastion" {
  name        = "lab1-bastion-sg"
  description = "SSH access from your IP"
  vpc_id      = data.aws_vpc.selected.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.your_ip_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "app" {
  name        = "lab1-app-sg"
  description = "Allow app traffic from ALB and SSH from bastion"
  vpc_id      = data.aws_vpc.selected.id

  # App ports 3000-4000 range for services
  ingress {
    from_port       = 3000
    to_port         = 4008
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # SSH from bastion
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name        = "lab1-rds-sg"
  description = "Allow Postgres from app and bastion"
  vpc_id      = data.aws_vpc.selected.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id, aws_security_group.bastion.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "redis" {
  name        = "lab1-redis-sg"
  description = "Allow Redis from app"
  vpc_id      = data.aws_vpc.selected.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Bastion host (for SSH and troubleshooting)
resource "aws_instance" "bastion" {
  ami                         = data.aws_ami.al2.id
  instance_type               = "t2.micro"
  subnet_id                   = local.subnet_ids[0]
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true
  key_name                    = var.key_pair_name

  tags = {
    Name = "lab1-bastion"
  }
}


# Outputs
output "vpc_id" {
  value       = data.aws_vpc.selected.id
  description = "VPC used by the stack"
}

output "subnet_ids" {
  value       = local.subnet_ids
  description = "Subnets used for the stack"
}

output "alb_security_group_id" {
  value       = aws_security_group.alb.id
  description = "Security group for ALB"
}

output "app_security_group_id" {
  value       = aws_security_group.app.id
  description = "Security group for app instances"
}

output "rds_security_group_id" {
  value       = aws_security_group.rds.id
  description = "Security group for RDS"
}

output "redis_security_group_id" {
  value       = aws_security_group.redis.id
  description = "Security group for Redis"
}

output "bastion_public_ip" {
  value       = aws_instance.bastion.public_ip
  description = "Public IP for bastion host"
}


