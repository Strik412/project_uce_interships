#!/bin/bash
set -e

echo "=== [BOOTSTRAP] Starting user_data_multi ==="

# -----------------------------
# System update & Docker install
# -----------------------------
yum update -y
yum install -y docker jq

systemctl enable docker
systemctl start docker

# Allow ec2-user to use Docker
usermod -aG docker ec2-user

# Wait until Docker is ready
until docker info >/dev/null 2>&1; do
  echo "Waiting for Docker to start..."
  sleep 2
done

echo "Docker is running"

# -----------------------------
# Docker network
# -----------------------------
docker network create practicas_net || true

# -----------------------------
# Variables injected by Terraform
# -----------------------------
SERVICES='${services}'

DB_HOST='${db_host}'
DB_PORT='${db_port}'
DB_NAME='${db_name}'
DB_USER='${db_user}'
DB_PASSWORD='${db_password}'

REDIS_HOST='${redis_host}'
REDIS_PORT='${redis_port}'

# Frontend origins (Vercel / local if needed)
ALLOWED_ORIGINS='${allowed_origins}'

export DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD
export REDIS_HOST REDIS_PORT
export ALLOWED_ORIGINS

# -----------------------------
# Deploy services
# -----------------------------
echo "$SERVICES" | jq -c 'to_entries[]' | while read svc; do
  NAME=$(echo "$svc" | jq -r '.key')
  PORT=$(echo "$svc" | jq -r '.value.port')
  IMAGE=$(echo "$svc" | jq -r '.value.image')

  echo "Deploying service: $NAME"
  echo "  Image: $IMAGE"
  echo "  Port:  $PORT"

  docker pull "$IMAGE"
  docker rm -f "$NAME" || true

  docker run -d \
    --name "$NAME" \
    --network practicas_net \
    --restart unless-stopped \
    -p "$PORT:$PORT" \
    -e PORT="$PORT" \
    -e DB_HOST="$DB_HOST" \
    -e DB_PORT="$DB_PORT" \
    -e DB_NAME="$DB_NAME" \
    -e DB_USERNAME="$DB_USER" \
    -e DB_PASSWORD="$DB_PASSWORD" \
    -e REDIS_HOST="$REDIS_HOST" \
    -e REDIS_PORT="$REDIS_PORT" \
    $( [ "$NAME" = "api-gateway" ] && echo "-e ALLOWED_ORIGINS=$ALLOWED_ORIGINS" ) \
    "$IMAGE"

  echo "Service $NAME deployed successfully"
done

echo "=== [BOOTSTRAP] user_data_multi completed successfully ==="
