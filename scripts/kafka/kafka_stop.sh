#!/bin/bash

KAFKA_NAME="kafka"

echo "Stopping Kafka..."

if [ "$(docker ps -q -f name=^${KAFKA_NAME}$)" ]; then
  docker stop $KAFKA_NAME
  echo "  Stopped."
else
  echo "  Not running, skipping."
fi

echo ""
echo "Done. To start again: ./kafka_init.sh"