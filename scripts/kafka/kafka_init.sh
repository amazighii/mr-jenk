#!/bin/bash

echo "Starting Kafka environment..."

ZOOKEEPER_NAME="zookeeper"
KAFKA_NAME="kafka"

# -----------------------------

# START DOCKER (ROOTLESS)

# -----------------------------

if ! docker info > /dev/null 2>&1; then
echo "Docker not running. Starting rootless Docker..."
nohup dockerd-rootless.sh > ~/docker-rootless.log 2>&1 &
sleep 5
fi

# -----------------------------

# START ZOOKEEPER

# -----------------------------

if [ "$(docker ps -a -q -f name=$ZOOKEEPER_NAME)" ]; then
echo "Zookeeper exists"
docker start $ZOOKEEPER_NAME 2>/dev/null
else
echo "Creating Zookeeper..."
docker run -d 
--name $ZOOKEEPER_NAME 
-p 2181:2181 
-e ZOOKEEPER_CLIENT_PORT=2181 
confluentinc/cp-zookeeper
fi

sleep 5

# -----------------------------

# START KAFKA

# -----------------------------

if [ "$(docker ps -a -q -f name=$KAFKA_NAME)" ]; then
echo "Kafka exists"
docker start $KAFKA_NAME 2>/dev/null
else

# creating zookeeper

echo "Creating Zookeeper..."
docker run -d --name "$ZOOKEEPER_NAME" -p 2181:2181 -e ZOOKEEPER_CLIENT_PORT=2181 confluentinc/cp-zookeeper:latest

sleep 5

echo "Creating Kafka..."
docker run -d --name "$KAFKA_NAME" -p 9092:9092 --link zookeeper -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka:latest -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092
fi

echo "Kafka is ready on localhost:9092"
