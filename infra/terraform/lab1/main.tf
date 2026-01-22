# -----------------------------
# SUBNETS EXPLÍCITAS
# -----------------------------
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = data.aws_vpc.selected.id
  cidr_block              = "10.0.${count.index}.0/24"
  availability_zone       = "us-east-1${element(["a", "b"], count.index)}"
  map_public_ip_on_launch = true
  tags = { Name = "public-${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count                   = 5
  vpc_id                  = data.aws_vpc.selected.id
  cidr_block              = "10.0.${count.index + 10}.0/24"
  availability_zone       = "us-east-1${element(["a", "b", "c", "d", "e"], count.index)}"
  map_public_ip_on_launch = false
  tags = { Name = "private-${count.index + 1}" }
}
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

#############################
# DATA SOURCES
#############################

# Selección de VPC
data "aws_vpc" "selected" {
  id      = var.vpc_id
  default = var.vpc_id == null ? true : null
}

# Subnets
data "aws_subnets" "selected" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.selected.id]
  }
}

# AMI Amazon Linux 2
data "aws_ami" "al2" {
  owners      = ["amazon"]
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Local subnets
locals {
  subnet_ids = var.subnet_ids != null ? var.subnet_ids : data.aws_subnets.selected.ids
}

#############################
# SECURITY GROUPS
#############################

# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "lab1-alb-sg"
  description = "Allow HTTP from Internet"
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

# Bastion Security Group
resource "aws_security_group" "bastion" {
  name        = "lab1-bastion-sg"
  description = "SSH access for CI/CD (GitHub Actions)"
  vpc_id      = data.aws_vpc.selected.id

  ingress {
    from_port   = 22
    to_port     = 22
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

# App Security Group
resource "aws_security_group" "app" {
  name        = "lab1-app-sg"
  description = "Allow traffic from ALB and SSH from Bastion"
  vpc_id      = data.aws_vpc.selected.id

  ingress {
    from_port       = 3000
    to_port         = 4008
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

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

# RDS Security Group
resource "aws_security_group" "rds" {
  name        = "lab1-rds-sg"
  description = "Allow access to RDS from app instances"
  vpc_id      = data.aws_vpc.selected.id

  ingress {
    from_port       = 5432
    to_port         = 5432
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

# Redis Security Group
resource "aws_security_group" "redis" {
  name        = "lab1-redis-sg"
  description = "Allow access to Redis from app instances"
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

#############################
# BASTION HOST
#############################

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

resource "aws_eip" "bastion" {
  instance = aws_instance.bastion.id
  domain   = "vpc"

  tags = {
    Name = "lab1-bastion-eip"
  }
}

#############################
# APPLICATION LOAD BALANCER
#############################

resource "aws_lb" "alb" {
  name               = "lab1-alb"
  load_balancer_type = "application"
  subnets            = local.subnet_ids
  security_groups    = [aws_security_group.alb.id]

  tags = {
    Name = "lab1-alb"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "ALB is running"
      status_code  = "200"
    }
  }
}

#############################
# OUTPUTS
#############################

output "vpc_id" {
  description = "VPC ID"
  value       = data.aws_vpc.selected.id
}

output "public_subnet_ids" {
  description = "Subnets públicas (se usan para ALB y Bastion)"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Subnets privadas (para instancias de aplicaciones)"
  value       = aws_subnet.private[*].id
}

output "app_security_group_id" {
  description = "Security group for application instances"
  value       = aws_security_group.app.id
}

output "alb_security_group_id" {
  description = "Security group for ALB"
  value       = aws_security_group.alb.id
}

output "bastion_security_group_id" {
  description = "Security group for Bastion"
  value       = aws_security_group.bastion.id
}

output "rds_security_group_id" {
  description = "Security group for RDS"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "Security group for Redis"
  value       = aws_security_group.redis.id
}
