#!/bin/bash
set -e

# Logging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting user data script for ${service_name} at $(date)"

# Update system
yum update -y
yum install -y docker aws-cli

# Start Docker daemon
systemctl enable docker
systemctl start docker

# Wait for Docker to be ready
sleep 5

# Get ECR login token and login
echo "Logging into ECR..."
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_registry}

# Pull the service image
echo "Pulling image for ${service_name}..."
docker pull ${ecr_registry}/${ecr_repository}:latest

# Stop any existing container
docker stop ${service_name} || true
docker rm ${service_name} || true

# Run the container
echo "Starting container ${service_name}..."
docker run -d \
  --name ${service_name} \
  --restart unless-stopped \
  -p ${service_port}:${service_port} \
  -e PORT=${service_port} \
  -e DB_HOST=${db_host} \
  -e DB_PORT=${db_port} \
  -e DB_NAME=${db_name} \
  -e DB_USERNAME=${db_user} \
  -e DB_PASSWORD="${db_password}" \
  -e REDIS_HOST=${redis_host} \
  -e REDIS_PORT=${redis_port} \
  -e AWS_REGION=${aws_region} \
  ${ecr_registry}/${ecr_repository}:latest

echo "Container ${service_name} started successfully"

# CloudWatch agent (optional; can be added later for deeper monitoring)
# For now, Docker logs will be available via 'docker logs' command

echo "User data script completed at $(date)"
