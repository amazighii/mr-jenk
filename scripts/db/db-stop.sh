#!/bin/bash

CONTAINERS=(
  "mongodb_users"
  "mongodb_products"
)

echo "Stopping MongoDB containers..."

for CONTAINER_NAME in "${CONTAINERS[@]}"; do
  echo ""
  echo "Checking container: $CONTAINER_NAME..."

  if [ "$(docker ps -q -f name=^${CONTAINER_NAME}$)" ]; then
    docker stop $CONTAINER_NAME
    echo "  Stopped."
  else
    echo "  Not running, skipping."
  fi
done

echo "Done."
