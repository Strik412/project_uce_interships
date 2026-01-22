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
}

#######################
# SECURITY GROUPS
#######################

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

#######################
# BASTION HOST
#######################

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

#######################
# APPLICATION LOAD BALANCER
#######################

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
