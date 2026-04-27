#!/bin/bash

echo "Stopping all services..."

pkill -f spring-boot:run


echo "Cleaning up logs..."

if [ -d "./logs" ] && [ -n "$(ls -A ./logs)" ]; then
    echo "Logs directory exists. Removing log files..."
    rm ./logs/*.log
else
    echo "Logs directory does not exist. Creating logs directory..."
    mkdir -p ./logs
fi

echo "-----------------------------------"

echo "All services stopped."
