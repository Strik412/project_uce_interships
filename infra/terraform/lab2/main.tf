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
# RDS POSTGRES
# -----------------------------
resource "aws_db_subnet_group" "postgres" {
  name       = "lab2-postgres-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "lab2-postgres-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier              = "lab2-postgres"
  engine                  = "postgres"
  engine_version          = "15"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [var.rds_security_group_id]
  skip_final_snapshot     = true
  publicly_accessible     = false

  tags = {
    Name = "lab2-postgres"
  }
}

# -----------------------------
# REDIS (ELASTICACHE)
# -----------------------------
resource "aws_elasticache_subnet_group" "redis" {
  name       = "lab2-redis-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "lab2-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [var.redis_security_group_id]
}

# -----------------------------
# APPLICATION LOAD BALANCER
# -----------------------------
resource "aws_lb" "alb" {
  name               = "lab2-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.subnet_ids

  tags = {
    Name = "lab2-alb"
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
      message_body = "Service not found"
      status_code  = "404"
    }
  }
}

# -----------------------------
# TARGET GROUPS (para Lab 3)
# -----------------------------
locals {
  services = {
    web = {
      port = 3000
      path = "/"
    }
    api-gateway = {
      port = 4000
      path = "/health"
    }
    auth-service = {
      port = 3001
      path = "/health"
    }
    user-management = {
      port = 3002
      path = "/health"
    }
    registration-service = {
      port = 3003
      path = "/health"
    }
    communication-service = {
      port = 3004
      path = "/health"
    }
    notification-service = {
      port = 3005
      path = "/health"
    }
    document-management-service = {
      port = 3006
      path = "/health"
    }
    reporting-service = {
      port = 3007
      path = "/health"
    }
    tracking-service = {
      port = 3008
      path = "/health"
    }
  }
}

resource "aws_lb_target_group" "services" {
  for_each = local.services

  name        = "tg-${each.key}"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id     = var.vpc_id
  target_type = "instance"

  health_check {
    path                = each.value.path
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener_rule" "services" {
  for_each = local.services

  listener_arn = aws_lb_listener.http.arn
  priority     = 100 + index(sort(keys(local.services)), each.key)

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services[each.key].arn
  }

  condition {
    path_pattern {
      values = each.key == "web" ? ["/*"] : ["/${each.key}/*"]
    }
  }
}

# -----------------------------
# OUTPUTS (USADOS EN LAB 3)
# -----------------------------
output "alb_dns_name" {
  value = aws_lb.alb.dns_name
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS PostgreSQL endpoint (host:port)"
}

output "redis_endpoint" {
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  description = "ElastiCache Redis endpoint"
}

output "target_group_arns" {
  value = {
    for k, v in aws_lb_target_group.services : k => v.arn
  }
  description = "Target group ARNs for all services"
}
