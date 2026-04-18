#!/bin/bash

CONTAINER_NAME="mongodb_users"

echo "Stopping MongoDB container..."

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
docker stop $CONTAINER_NAME
echo "MongoDB stopped."
else
echo "MongoDB is not running."
fi
