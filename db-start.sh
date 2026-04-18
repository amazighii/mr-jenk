#!/bin/bash

CONTAINER_NAME="mongodb_users"
IMAGE_NAME="mongo:latest"
PORT="27017"

echo "Checking Docker (rootless)..."

# Check if Docker daemon is running

if ! docker info > /dev/null 2>&1; then
echo "Docker not running. Starting rootless Docker..."

nohup dockerd-rootless.sh > ~/docker-rootless.log 2>&1 &

echo "Waiting for Docker to start..."
sleep 5
fi

echo "Checking MongoDB container..."

# Check if container exists

if [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]; then
echo "Container exists."

# Check if running

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
echo "MongoDB is already running."
else
echo "Starting existing MongoDB container..."
docker start $CONTAINER_NAME
fi

else
echo "Creating and starting MongoDB container..."
docker run -d -p $PORT:27017 --name $CONTAINER_NAME $IMAGE_NAME
fi

echo "MongoDB ready on port $PORT"


