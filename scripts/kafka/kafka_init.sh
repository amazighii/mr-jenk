#!/bin/bash

echo "Starting Kafka (KRaft mode - no Zookeeper)..."

KAFKA_NAME="kafka"
NETWORK_NAME="buy01-network"

# START DOCKER (ROOTLESS)
if ! docker info > /dev/null 2>&1; then
  echo "Docker not running. Starting rootless Docker..."
  nohup dockerd-rootless.sh > ~/docker-rootless.log 2>&1 &
  echo "Waiting for Docker to start..."
  sleep 5
fi

# CREATE NETWORK
if ! docker network inspect $NETWORK_NAME > /dev/null 2>&1; then
  echo "Creating Docker network: $NETWORK_NAME..."
  docker network create $NETWORK_NAME
else
  echo "Network $NETWORK_NAME already exists."
fi

# START KAFKA
echo ""
echo "Checking Kafka..."

if [ "$(docker ps -a -q -f name=^${KAFKA_NAME}$)" ]; then
  echo "  Container exists."
  if [ "$(docker ps -q -f name=^${KAFKA_NAME}$)" ]; then
    echo "  Already running."
  else
    echo "  Starting existing container..."
    docker start $KAFKA_NAME
  fi
else
  echo "  Creating Kafka container..."
  docker run -d \
    --name $KAFKA_NAME \
    --network $NETWORK_NAME \
    -p 9092:9092 \
    -e KAFKA_NODE_ID=1 \
    -e KAFKA_PROCESS_ROLES=broker,controller \
    -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
    -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
    -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
    -e KAFKA_CONTROLLER_QUORUM_VOTERS=1@kafka:9093 \
    -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
    -e KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 \
    -e KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1 \
    -e KAFKA_AUTO_CREATE_TOPICS_ENABLE=true \
    -e CLUSTER_ID=MkU3OEVBNTcwNTJENDM2Qk \
    confluentinc/cp-kafka:latest
fi

echo ""
sleep 5

# VERIFY
if [ "$(docker ps -q -f name=^${KAFKA_NAME}$)" ]; then
  echo "Kafka is running on localhost:9092"
  echo ""
  echo "To stop: ./kafka-stop.sh"
else
  echo "Kafka failed to start. Check logs with:"
  echo "  docker logs kafka --tail 50"
fi

# #!/bin/bash

# echo "Starting Kafka environment..."

# ZOOKEEPER_NAME="zookeeper"
# KAFKA_NAME="kafka"
# NETWORK_NAME="buy01-network"

# # START DOCKER (ROOTLESS)
# if ! docker info > /dev/null 2>&1; then
#   echo "Docker not running. Starting rootless Docker..."
#   nohup dockerd-rootless.sh > ~/docker-rootless.log 2>&1 &
#   echo "Waiting for Docker to start..."
#   sleep 5
# fi

# # CREATE NETWORK
# if ! docker network inspect $NETWORK_NAME > /dev/null 2>&1; then
#   echo "Creating Docker network: $NETWORK_NAME..."
#   docker network create $NETWORK_NAME
# else
#   echo "Network $NETWORK_NAME already exists."
# fi

# # START ZOOKEEPER
# echo ""
# echo "Checking Zookeeper..."

# if [ "$(docker ps -a -q -f name=^${ZOOKEEPER_NAME}$)" ]; then
#   echo "  Container exists."
#   if [ "$(docker ps -q -f name=^${ZOOKEEPER_NAME}$)" ]; then
#     echo "  Already running."
#   else
#     docker start $ZOOKEEPER_NAME
#     echo "  Started."
#   fi
# else
#   echo "  Creating Zookeeper..."
#   docker run -d \
#     --name $ZOOKEEPER_NAME \
#     --network $NETWORK_NAME \
#     -p 2181:2181 \
#     -e ZOOKEEPER_CLIENT_PORT=2181 \
#     -e ZOOKEEPER_TICK_TIME=2000 \
#     confluentinc/cp-zookeeper:latest
# fi

# echo "  Waiting for Zookeeper to be ready..."
# sleep 8

# # START KAFKA
# echo ""
# echo "Checking Kafka..."

# if [ "$(docker ps -a -q -f name=^${KAFKA_NAME}$)" ]; then
#   echo "  Container exists."
#   if [ "$(docker ps -q -f name=^${KAFKA_NAME}$)" ]; then
#     echo "  Already running."
#   else
#     docker start $KAFKA_NAME
#     echo "  Started."
#   fi
# else
#   echo "  Creating Kafka..."
#   docker run -d \
#     --name $KAFKA_NAME \
#     --network $NETWORK_NAME \
#     -p 9092:9092 \
#     -e KAFKA_BROKER_ID=1 \
#     -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
#     -e KAFKA_LISTENERS=INTERNAL://0.0.0.0:29092,EXTERNAL://0.0.0.0:9092 \
#     -e KAFKA_ADVERTISED_LISTENERS=INTERNAL://kafka:29092,EXTERNAL://localhost:9092 \
#     -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=INTERNAL:PLAINTEXT,EXTERNAL:PLAINTEXT \
#     -e KAFKA_INTER_BROKER_LISTENER_NAME=INTERNAL \
#     -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
#     -e KAFKA_AUTO_CREATE_TOPICS_ENABLE=true \
#     confluentinc/cp-kafka:latest
# fi

# echo ""
# sleep 5
# echo "Kafka environment ready:"
# echo "  Zookeeper -> localhost:2181"
# echo "  Kafka     -> localhost:9092"
# echo ""
# echo "To stop: ./kafka-stop.sh"

# # #!/bin/bash

# # echo "Starting Kafka environment..."

# # ZOOKEEPER_NAME="zookeeper"
# # KAFKA_NAME="kafka"

# # # -----------------------------

# # # START DOCKER (ROOTLESS)

# # # -----------------------------

# # if ! docker info > /dev/null 2>&1; then
# # echo "Docker not running. Starting rootless Docker..."
# # nohup dockerd-rootless.sh > ~/docker-rootless.log 2>&1 &
# # sleep 5
# # fi

# # # -----------------------------

# # # START ZOOKEEPER

# # # -----------------------------

# # if [ "$(docker ps -a -q -f name=$ZOOKEEPER_NAME)" ]; then
# # echo "Zookeeper exists"
# # docker start $ZOOKEEPER_NAME 2>/dev/null
# # else
# # echo "Creating Zookeeper..."
# # docker run -d 
# # --name $ZOOKEEPER_NAME 
# # -p 2181:2181 
# # -e ZOOKEEPER_CLIENT_PORT=2181 
# # confluentinc/cp-zookeeper
# # fi

# # sleep 5

# # # -----------------------------

# # # START KAFKA

# # # -----------------------------

# # if [ "$(docker ps -a -q -f name=$KAFKA_NAME)" ]; then
# # echo "Kafka exists"
# # docker start $KAFKA_NAME 2>/dev/null
# # else

# # # creating zookeeper

# # echo "Creating Zookeeper..."
# # docker run -d --name "$ZOOKEEPER_NAME" -p 2181:2181 -e ZOOKEEPER_CLIENT_PORT=2181 confluentinc/cp-zookeeper:latest

# # sleep 5

# # echo "Creating Kafka..."
# # # docker run -d --name "$KAFKA_NAME" -p 9092:9092 --link zookeeper -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka:latest -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092
# # docker run -d \
# #   --name kafka \
# #   -p 9092:9092 \
# #   -e KAFKA_BROKER_ID=1 \
# #   -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
# #   -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092 \
# #   -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
# #   confluentinc/cp-kafka:latest

# # fi

# # echo "Kafka is ready on localhost:9092"
