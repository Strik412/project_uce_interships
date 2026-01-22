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

# -----------------------------
# AMI
# -----------------------------
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# -----------------------------
# INSTANCIAS (2 SERVICIOS C/U)
# -----------------------------
locals {
  instances = {
    instance1 = {
      subnet_index = 0
      services = {
        api-gateway = { port = 4000, image = "dapaeza/practicas-api-gateway:latest" }
      }
    }

    instance2 = {
      subnet_index = 1
      services = {
        auth-service    = { port = 3001, image = "dapaeza/practicas-auth-service:latest" }
        user-management = { port = 3002, image = "dapaeza/practicas-user-management:latest" }
      }
    }

    instance3 = {
      subnet_index = 2
      services = {
        registration-service = { port = 3003, image = "dapaeza/practicas-registration-service:latest" }
        tracking-service     = { port = 3008, image = "dapaeza/practicas-tracking-service:latest" }
      }
    }

    instance4 = {
      subnet_index = 3
      services = {
        document-management-service = { port = 3006, image = "dapaeza/practicas-document-management-service:latest" }
        notification-service        = { port = 3005, image = "dapaeza/practicas-notification-service:latest" }
      }
    }

    instance5 = {
      subnet_index = 4
      services = {
        reporting-service     = { port = 3007, image = "dapaeza/practicas-reporting-service:latest" }
        communication-service = { port = 3004, image = "dapaeza/practicas-communication-service:latest" }
      }
    }
  }
}

# -----------------------------
# EC2
# -----------------------------
resource "aws_instance" "app" {
  for_each = local.instances

  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_ids[each.value.subnet_index]
  associate_public_ip_address = false
  vpc_security_group_ids = [var.app_security_group_id]
  key_name               = var.key_pair_name

  user_data = templatefile("${path.module}/user_data_multi.sh", {
    services       = jsonencode(each.value.services)
    db_host        = var.database_endpoint
    db_port        = var.database_port
    db_name        = var.database_name
    db_user        = var.database_user
    db_password    = var.database_password
    redis_host     = var.redis_endpoint
    redis_port     = var.redis_port
    allowed_origins = "https://project-uce-interships-web.vercel.app"
  })

  tags = {
    Name = "practicas-${each.key}"
  }
}

# -----------------------------
# ELASTIC IP
# -----------------------------
resource "aws_eip" "app" {
  for_each = aws_instance.app
  instance = each.value.id
  domain   = "vpc"
}

# -----------------------------
# TARGET GROUP ATTACHMENTS
# -----------------------------
resource "aws_lb_target_group_attachment" "services" {

  for_each = {
    for pair in flatten([
      for inst_key, inst in local.instances : [
        for svc_key, svc in inst.services : {
          key          = "${inst_key}-${svc_key}"
          instance_key = inst_key
          service_key  = svc_key
          port         = svc.port
        }
      ]
    ]) : pair.key => {
      instance_key = pair.instance_key
      service_key  = pair.service_key
      port         = pair.port
    }
  }

  target_group_arn = var.target_group_arns[each.value.service_key]
  target_id        = aws_instance.app[each.value.instance_key].id
  port             = each.value.port
}

# -----------------------------
# OUTPUTS
# -----------------------------
output "instance_ids" {
  description = "EC2 instance IDs per logical instance"
  value = {
    for k, inst in aws_instance.app :
    k => inst.id
  }
}

output "instance_private_ips" {
  description = "Private IPs per instance"
  value = {
    for k, inst in aws_instance.app :
    k => inst.private_ip
  }
}

output "instance_public_ips" {
  description = "Elastic public IPs per instance"
  value = {
    for k, eip in aws_eip.app :
    k => eip.public_ip
  }
}

