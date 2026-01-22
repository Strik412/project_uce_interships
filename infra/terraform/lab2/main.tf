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

# -------------------------------------------------
# SUBNETS
# -------------------------------------------------
# Si quieres unificar public/private en un solo arreglo
locals {
  public_subnet_ids  = var.public_subnet_ids
  private_subnet_ids = var.private_subnet_ids
}

# -------------------------------------------------
# SECURITY GROUPS
# -------------------------------------------------
resource "aws_security_group" "rds" {
  name   = "lab2-rds-sg"
  vpc_id = var.vpc_id

  description = "Allow Postgres access from app instances"

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.app_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "redis" {
  name   = "lab2-redis-sg"
  vpc_id = var.vpc_id

  description = "Allow Redis access from app instances"

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [var.app_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# -------------------------------------------------
# RDS POSTGRES (PRIVATE)
# -------------------------------------------------
resource "aws_db_subnet_group" "postgres" {
  name       = "lab2-postgres-subnet-group"
  subnet_ids = local.private_subnet_ids

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
  storage_encrypted       = true

  db_name                 = "lab2db"
  username                = var.db_username
  password                = var.db_password

  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [aws_security_group.rds.id]

  publicly_accessible     = false
  skip_final_snapshot     = true
  backup_retention_period = 7

  tags = {
    Name = "lab2-postgres"
  }
}

# -------------------------------------------------
# REDIS (ELASTICACHE - PRIVATE)
# -------------------------------------------------
resource "aws_elasticache_subnet_group" "redis" {
  name       = "lab2-redis-subnet-group"
  subnet_ids = local.private_subnet_ids
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "lab2-redis"
  description          = "Redis replication group"
  node_type            = "cache.t3.micro"
  num_cache_clusters   = 1
  engine               = "redis"
  engine_version       = "7.0"
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Name = "lab2-redis"
  }
}

# -------------------------------------------------
# APPLICATION LOAD BALANCER (PUBLIC)
# -------------------------------------------------
resource "aws_lb" "alb" {
  name               = "lab2-alb"
  load_balancer_type = "application"
  internal           = false

  security_groups = [var.alb_security_group_id]
  subnets         = local.public_subnet_ids

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

# -------------------------------------------------
# TARGET GROUPS (EC2 SE REGISTRAN EN LAB 3)
# -------------------------------------------------
locals {
  services = {
    web = { port = 3000, path = "/" }
    api-gateway = { port = 4000, path = "/health" }
    auth-service = { port = 3001, path = "/health" }
    user-management = { port = 3002, path = "/health" }
    registration-service = { port = 3003, path = "/health" }
    communication-service = { port = 3004, path = "/health" }
    notification-service = { port = 3005, path = "/health" }
    document-management-service = { port = 3006, path = "/health" }
    reporting-service = { port = 3007, path = "/health" }
    tracking-service = { port = 3008, path = "/health" }
  }
}

resource "aws_lb_target_group" "services" {
  for_each = local.services

  name        = "tg-${each.key}"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
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

# -------------------------------------------------
# OUTPUTS PARA LAB 3
# -------------------------------------------------
output "alb_dns_name" {
  description = "Public DNS of the Application Load Balancer"
  value       = aws_lb.alb.dns_name
}

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.alb.arn
}

output "target_group_arns" {
  description = "Target group ARNs per service"
  value = {
    for k, tg in aws_lb_target_group.services :
    k => tg.arn
  }
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_port" {
  description = "RDS PostgreSQL port"
  value       = aws_db_instance.postgres.port
}

output "rds_db_name" {
  description = "RDS database name"
  value       = aws_db_instance.postgres.db_name
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.redis.port
}
