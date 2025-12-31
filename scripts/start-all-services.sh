#!/bin/bash

# Start All Microservices Script
# This script starts all services in the correct order

set -e

echo "🚀 Starting Catering System Services..."
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Service ports
declare -A SERVICES=(
  ["api-gateway"]=3000
  ["auth-service"]=3001
  ["identity-service"]=3002
  ["user-service"]=3003
  ["company-service"]=3004
  ["menu-service"]=3005
  ["order-service"]=3006
  ["invoice-service"]=3007
  ["payment-service"]=3008
  ["wallet-service"]=3009
  ["notification-service"]=3010
  ["reporting-service"]=3011
  ["file-service"]=3012
)

# Check if infrastructure is running
check_infrastructure() {
  echo -e "${YELLOW}Checking infrastructure...${NC}"
  
  # PostgreSQL
  if nc -z localhost 5432 2>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
  else
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    exit 1
  fi
  
  # MongoDB
  if nc -z localhost 27017 2>/dev/null; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
  else
    echo -e "${RED}✗ MongoDB is not running${NC}"
    exit 1
  fi
  
  # Redis
  if nc -z localhost 6379 2>/dev/null; then
    echo -e "${GREEN}✓ Redis is running${NC}"
  else
    echo -e "${RED}✗ Redis is not running${NC}"
    exit 1
  fi
  
  # RabbitMQ
  if nc -z localhost 5672 2>/dev/null; then
    echo -e "${GREEN}✓ RabbitMQ is running${NC}"
  else
    echo -e "${RED}✗ RabbitMQ is not running${NC}"
    exit 1
  fi
  
  # MinIO
  if nc -z localhost 9000 2>/dev/null; then
    echo -e "${GREEN}✓ MinIO is running${NC}"
  else
    echo -e "${RED}✗ MinIO is not running${NC}"
    exit 1
  fi
  
  echo ""
}

# Start a service
start_service() {
  local service=$1
  local port=${SERVICES[$service]}
  
  echo -e "${YELLOW}Starting $service on port $port...${NC}"
  
  cd "services/$service"
  nohup node src/app.js > "../../logs/$service.log" 2>&1 &
  echo $! > "../../pids/$service.pid"
  cd ../..
  
  # Wait for service to start
  sleep 2
  
  if nc -z localhost $port 2>/dev/null; then
    echo -e "${GREEN}✓ $service started successfully${NC}"
  else
    echo -e "${RED}✗ $service failed to start${NC}"
    cat "logs/$service.log" | tail -20
  fi
}

# Create directories
mkdir -p logs pids

# Check infrastructure
check_infrastructure

# Start services in order
echo -e "${YELLOW}Starting services...${NC}"
echo ""

# Core services first
for service in auth-service identity-service user-service; do
  start_service $service
done

# Business services
for service in company-service menu-service wallet-service; do
  start_service $service
done

# Order flow services
for service in order-service invoice-service payment-service; do
  start_service $service
done

# Support services
for service in notification-service reporting-service file-service; do
  start_service $service
done

# API Gateway last
start_service api-gateway

echo ""
echo "========================================"
echo -e "${GREEN}All services started!${NC}"
echo ""
echo "Service URLs:"
for service in "${!SERVICES[@]}"; do
  echo "  - $service: http://localhost:${SERVICES[$service]}"
done
echo ""
echo "API Gateway: http://localhost:3000"
echo "Swagger Docs: http://localhost:3000/api-docs"
