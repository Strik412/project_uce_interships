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

resource "aws_db_subnet_group" "postgres" {
  name       = "practicas-postgres-subnet-group"
  subnet_ids = var.subnet_ids
  tags       = { Name = "practicas-postgres-subnet-group" }
}

resource "aws_db_instance" "postgres" {
  identifier              = "practicas-postgres"
  engine                  = "postgres"
  engine_version          = "15"
  instance_class          = "db.t3.micro"
  username                = var.db_username
  password                = var.db_password
  db_name                 = var.db_name
  allocated_storage       = 20
  max_allocated_storage   = 100
  storage_encrypted       = false
  backup_retention_period = 1
  skip_final_snapshot     = true
  publicly_accessible     = false
  multi_az                = false
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [var.rds_security_group_id]
  tags                    = { Name = "practicas-postgres" }
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "practicas-redis-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "practicas-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [var.redis_security_group_id]
  tags                 = { Name = "practicas-redis" }
}

resource "aws_lb" "alb" {
  name               = "practicas-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.subnet_ids
  tags               = { Name = "practicas-alb" }
}

# Target groups for each service
locals {
  services = {
    web                      = { port = 3000, path = "/" }
    api-gateway              = { port = 4000, path = "/health" }
    auth-service             = { port = 3001, path = "/health" }
    registration-service     = { port = 3003, path = "/health" }
    user-management          = { port = 3002, path = "/health" }
    communication-service    = { port = 3004, path = "/health" }
    notification-service     = { port = 3005, path = "/health" }
    document-management-service = { port = 3006, path = "/health" }
    reporting-service        = { port = 3007, path = "/health" }
    tracking-service         = { port = 3008, path = "/health" }
  }
}

resource "aws_lb_target_group" "services" {
  for_each = local.services

  name        = "practicas-${each.key}-tg"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 3
    interval            = 30
    path                = each.value.path
    matcher             = "200"
  }

  tags = { Name = "practicas-${each.key}-tg" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["web"].arn
  }
}

# Routing rules for backend services
resource "aws_lb_listener_rule" "api_gateway" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["api-gateway"].arn
  }

  condition {
    path_pattern { values = ["/api/*"] }
  }
}

resource "aws_lb_listener_rule" "auth_service" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 110

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["auth-service"].arn
  }

  condition {
    path_pattern { values = ["/auth/*"] }
  }
}

resource "aws_lb_listener_rule" "registration_service" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 120

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["registration-service"].arn
  }

  condition {
    path_pattern { values = ["/registration/*"] }
  }
}

resource "aws_lb_listener_rule" "user_management" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 130

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["user-management"].arn
  }

  condition {
    path_pattern { values = ["/users/*"] }
  }
}

resource "aws_lb_listener_rule" "communication_service" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 140

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["communication-service"].arn
  }

  condition {
    path_pattern { values = ["/communication/*"] }
  }
}

resource "aws_lb_listener_rule" "notification_service" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 150

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["notification-service"].arn
  }

  condition {
    path_pattern { values = ["/notifications/*"] }
  }
}

resource "aws_lb_listener_rule" "document_management_service" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 160

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["document-management-service"].arn
  }

  condition {
    path_pattern { values = ["/documents/*"] }
  }
}

resource "aws_lb_listener_rule" "reporting_service" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 170

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["reporting-service"].arn
  }

  condition {
    path_pattern { values = ["/reports/*"] }
  }
}

resource "aws_lb_listener_rule" "tracking_service" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 180

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["tracking-service"].arn
  }

  condition {
    path_pattern { values = ["/tracking/*"] }
  }
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "Postgres endpoint"
}

output "redis_endpoint" {
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  description = "Redis endpoint"
}

output "alb_dns_name" {
  value       = aws_lb.alb.dns_name
  description = "ALB DNS"
}

output "target_group_arns" {
  value = { for k, v in aws_lb_target_group.services : k => v.arn }
  description = "Target group ARNs for all services"
}

output "web_target_group_arn" {
  value = aws_lb_target_group.services["web"].arn
}

output "api_target_group_arn" {
  value = aws_lb_target_group.services["api-gateway"].arn
}
