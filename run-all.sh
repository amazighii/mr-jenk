#!/bin/bash

echo "Starting microservices..."

# running MongoDB container
echo "Starting databases..."

chmod +x db-start.sh

./db-start.sh

sleep 5


# Create logs directory

mkdir -p logs

# Function to run a service

run_service () {
SERVICE_NAME=$1
SERVICE_DIR=$2

echo "-----------------------------------"

echo "Starting $SERVICE_NAME..."

cd $SERVICE_DIR || exit

chmod +x mvnw

nohup ./mvnw clean spring-boot:run > ../logs/$SERVICE_NAME.log 2>&1 &

echo "$SERVICE_NAME started with PID $!"
echo "----------------------------------"
cd - > /dev/null

}

# 1. Start Eureka Server first

run_service "eureka-server" "eureka-server"
sleep 10

# 2. Start Gateway

run_service "gateway" "gateway"
sleep 5

# 3. Start User Service

run_service "user-service" "user-service"
sleep 5

# 4. Start Product Service

run_service "product-service" "product-service"
sleep 5

# 5. Start Media Service

# run_service "media-service" "media-service"

echo "All services started!"
echo "Check logs in /logs folder"
