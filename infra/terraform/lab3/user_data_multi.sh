#!/bin/bash
set -e

yum update -y
amazon-linux-extras install docker -y
systemctl enable --now docker
usermod -aG docker ec2-user

docker network create practicas_net || true

SERVICES='${services}'

echo "$SERVICES" | jq -c 'to_entries[]' | while read svc; do
  NAME=$(echo $svc | jq -r '.key')
  PORT=$(echo $svc | jq -r '.value.port')
  IMAGE=$(echo $svc | jq -r '.value.image')

  docker pull "$IMAGE"
  docker rm -f "$NAME" || true

  docker run -d \
    --name "$NAME" \
    --network practicas_net \
    --restart unless-stopped \
    -p "$PORT:$PORT" \
    -e PORT="$PORT" \
    -e DATABASE_URL="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}" \
    -e REDIS_URL="redis://${redis_host}:${redis_port}" \
    "$IMAGE"
done
