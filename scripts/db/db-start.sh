#!/bin/bash

IMAGE_NAME="mongo:latest"

CONTAINERS=(
  "mongodb_users:27017"
  "mongodb_products:27018"
)

echo "Checking Docker (rootless)..."

if ! docker info > /dev/null 2>&1; then
  echo "Docker not running. Starting rootless Docker..."
  nohup dockerd-rootless.sh > ~/docker-rootless.log 2>&1 &
  echo "Waiting for Docker to start..."
  sleep 5
fi

for ENTRY in "${CONTAINERS[@]}"; do
  CONTAINER_NAME="${ENTRY%%:*}"
  PORT="${ENTRY##*:}"

  echo ""
  echo "Checking container: $CONTAINER_NAME on port $PORT..."

  if [ "$(docker ps -a -q -f name=^${CONTAINER_NAME}$)" ]; then
    echo "  Container exists."

    if [ "$(docker ps -q -f name=^${CONTAINER_NAME}$)" ]; then
      echo "  Already running."
    else
      echo "  Starting existing container..."
      docker start $CONTAINER_NAME
    fi

  else
    echo "  Creating and starting new container..."
    docker run -d \
      -p $PORT:27017 \
      --name $CONTAINER_NAME \
      $IMAGE_NAME
  fi
done

echo ""
sleep 3
echo "MongoDB containers ready:"
echo ""
echo "  user-service    -> mongodb://localhost:27017/userdb    (container: mongodb_users)"
echo "  product-service -> mongodb://localhost:27018/productdb (container: mongodb_products)"
echo ""
echo "To stop all:"
echo "  docker stop mongodb_users mongodb_products"