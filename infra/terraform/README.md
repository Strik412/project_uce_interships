# Terraform Labs (AWS Academy - EC2 + Docker + ASG)

This infrastructure deploys 10 independent microservices on AWS using EC2 Auto Scaling Groups (ASGs), each running Docker containers pulled from ECR. The Application Load Balancer (ALB) routes traffic to each service's target group based on path patterns.

## Architecture

- **Lab 1**: VPC, Security Groups, Bastion Host, ECR repositories
- **Lab 2**: RDS PostgreSQL, ElastiCache Redis, ALB with 10 target groups
- **Lab 3**: 10 Auto Scaling Groups (one per service), Launch Templates, per-service Docker containers

## Services

All 10 services are deployed identically, each with:
- Port mapping (web:3000, api-gateway:4000, auth:3001, etc.)
- Automatic instance recovery via ASG health checks
- Docker container pulled from ECR at startup
- Environment variables for database and Redis connections
- CloudWatch logs

## Deployment Order

Execute labs sequentially:

```bash
# Lab 1: Networking & ECR
cd infra/terraform/lab1
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars

# Lab 2: Stateful services (DB, Cache, ALB)
cd ../lab2
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars

# Lab 3: Compute tier (10 ASGs with Docker)
cd ../lab3
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

## terraform.tfvars Setup

### Lab 1 (`lab1/terraform.tfvars`)

```hcl
aws_region     = "us-east-1"
key_pair_name  = "your-ec2-key-pair"
your_ip_cidr   = "YOUR.IP.HERE/32"
```

### Lab 2 (`lab2/terraform.tfvars`)

```hcl
aws_region = "us-east-1"
vpc_id     = "<from Lab 1 output: vpc_id>"
subnet_ids = ["<private subnet 1>", "<private subnet 2>"]
rds_security_group_id   = "<Lab 1: rds_security_group_id>"
redis_security_group_id = "<Lab 1: redis_security_group_id>"
alb_security_group_id   = "<Lab 1: alb_security_group_id>"

db_username = "postgres"
db_password = "SecurePassword123!"
db_name     = "practicas_db"
```

### Lab 3 (`lab3/terraform.tfvars`)

```hcl
aws_region = "us-east-1"
subnet_ids = ["<private subnet 1>", "<private subnet 2>"]
app_security_group_id = "<Lab 1: app_security_group_id>"
instance_type = "t3.micro"

ecr_registry_url = "<AWS Account ID>.dkr.ecr.us-east-1.amazonaws.com"

# Target groups from Lab 2 output
target_group_arns = {
  "web"                          = "<Lab 2 output: target_group_arns['web']>"
  "api-gateway"                  = "<Lab 2 output: target_group_arns['api-gateway']>"
  "auth-service"                 = "<Lab 2 output: target_group_arns['auth-service']>"
  "registration-service"         = "<Lab 2 output: target_group_arns['registration-service']>"
  "user-management"              = "<Lab 2 output: target_group_arns['user-management']>"
  "communication-service"        = "<Lab 2 output: target_group_arns['communication-service']>"
  "notification-service"         = "<Lab 2 output: target_group_arns['notification-service']>"
  "document-management-service"  = "<Lab 2 output: target_group_arns['document-management-service']>"
  "reporting-service"            = "<Lab 2 output: target_group_arns['reporting-service']>"
  "tracking-service"             = "<Lab 2 output: target_group_arns['tracking-service']>"
}

# Database endpoint from Lab 2 output
database_endpoint = "<Lab 2 output: rds_endpoint>"
database_port     = 5432
database_name     = "practicas_db"
database_user     = "postgres"
database_password = "SecurePassword123!"

# Redis endpoint from Lab 2 output
redis_endpoint = "<Lab 2 output: redis_endpoint>"
redis_port     = 6379

# ASG settings
asg_min     = 2
asg_max     = 4
asg_desired = 2
```

## Deployment Pipeline

Each service has a GitHub Actions workflow in `.github/workflows/`:

1. **Trigger**: Commit to `apps/<service-name>/**` in main/qa branch
2. **Build**: Docker build `apps/<service-name>/Dockerfile`
3. **Push**: To `<account>.dkr.ecr.us-east-1.amazonaws.com/practicas-<service>:latest`
4. **Deploy**: `aws autoscaling start-instance-refresh --asg-name practicas-<service>-asg`

Example: Updating auth-service:
```bash
git add apps/auth-service/src/
git commit -m "fix: auth validation"
git push origin qa
# → GitHub Actions automatically triggers
# → Builds, tags, and pushes new image to ECR
# → Starts ASG instance refresh (rolling update)
# → Old instances gradually replaced with new ones
```

## ALB Routing

Web frontend:
- **Path**: `/` → web:3000

Backend services (example paths):
- **Path**: `/api/*` → api-gateway:4000
- **Path**: `/auth/*` → auth-service:3001
- **Path**: `/registration/*` → registration-service:3003
- **Path**: `/users/*` → user-management:3002
- **Path**: `/communication/*` → communication-service:3004
- **Path**: `/notifications/*` → notification-service:3005
- **Path**: `/documents/*` → document-management-service:3006
- **Path**: `/reports/*` → reporting-service:3007
- **Path**: `/tracking/*` → tracking-service:3008

Update ALB listener rules in `lab2/main.tf` if routing paths change.

## Scaling & Recovery

Each ASG monitors health checks every 30 seconds:
- **Healthy**: Instance continues serving traffic
- **Unhealthy** (3 failed checks): Instance is terminated and replaced

To manually scale a service:
```bash
aws autoscaling set-desired-capacity \
  --asg-name practicas-<service>-asg \
  --desired-capacity 4
```

## Debugging

### Check EC2 instance logs
```bash
# SSH via bastion (from Lab 1)
ssh -i your-key.pem ec2-user@<bastion-public-ip>
ssh ec2-user@<app-instance-private-ip>

# View Docker logs
docker logs practicas-<service>
docker ps
```

### ALB health checks
- Open AWS Console → EC2 → Target Groups
- Select `practicas-<service>-tg` → Targets tab
- Verify health status and check failure reasons

### RDS & Redis connectivity
```bash
# From an app instance or bastion
psql -h <rds-endpoint> -U postgres -d practicas_db
redis-cli -h <redis-endpoint> ping
```

## Cleanup

Destroy in reverse order:

```bash
cd lab3 && terraform destroy
cd ../lab2 && terraform destroy
cd ../lab1 && terraform destroy
```

> **⚠️ Warning**: Destroying lab2 deletes RDS database and Redis cluster (snapshots not enabled by default).

## Notes

- **No Elastic IPs**: ALB DNS name (`alb_dns_name` output from Lab 2) is the external entry point
- **Auto-recovery**: ASG automatically replaces failed instances
- **Rolling updates**: GitHub Actions triggers ASG instance refresh, ensuring zero-downtime deployments
- **Shared database/cache**: All 10 services connect to the same RDS and Redis instances
- **Cost**: t3.micro for RDS/Redis, t3.micro for EC2 instances; monitor usage in AWS Academy
