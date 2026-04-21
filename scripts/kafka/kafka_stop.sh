#!/bin/bash

echo "Stopping Kafka..."

docker stop kafka 2>/dev/null
echo "Kafka stopped."
docker stop zookeeper 2>/dev/null
echo "Zookeeper stopped."

