#!/bin/bash
set -e

# Install Docker
yum update -y
amazon-linux-extras install docker -y
systemctl enable --now docker
usermod -a -G docker ec2-user

# Install AWS CLI v2 (for ECR login)
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
yum install -y unzip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install

# Authenticate to ECR
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_registry}

# Create isolated docker network for intra-instance communication
docker network create practicas_net || true

# Helper to run a container with common env/config
run_service() {
  NAME="$1"
  PORT="$2"
  IMAGE_REPO="$3"
  IMAGE="${ecr_registry}/${IMAGE_REPO}:latest"

  docker pull "$IMAGE"

  # Remove old container if exists
  if docker ps -a --format '{{.Names}}' | grep -q "^${NAME}$"; then
    docker rm -f "${NAME}" || true
  fi

  docker run -d \
    --name "${NAME}" \
    --network practicas_net \
    --restart unless-stopped \
    -p "${PORT}:${PORT}" \
    -e PORT="${PORT}" \
    -e NODE_ENV=production \
    -e DATABASE_URL="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}" \
    -e REDIS_URL="redis://${redis_host}:${redis_port}" \
    -e AUTH_SERVICE_URL="http://auth-service:3001" \
    -e USER_SERVICE_URL="http://user-management:3002" \
    -e REGISTRATION_SERVICE_URL="http://registration-service:3003" \
    -e TRACKING_SERVICE_URL="http://tracking-service:3008" \
    -e COMMUNICATION_SERVICE_URL="http://communication-service:3004" \
    -e NOTIFICATION_SERVICE_URL="http://notification-service:3005" \
    -e DOCUMENT_SERVICE_URL="http://document-management-service:3006" \
    -e REPORTING_SERVICE_URL="http://reporting-service:3007" \
    "$IMAGE"
}

# Start containers in order: main first, then secondaries
%{ for service in services ~}
run_service "${service.name}" "${service.port}" "${service.ecr_name}"
%{ endfor ~}
