# Enterprise Catering System - سیستم کترینگ سازمانی

A production-ready microservices-based enterprise catering platform.

## Architecture Overview

This system consists of 13 independent microservices:

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| api-gateway | 3000 | Redis | API Gateway & Rate Limiting |
| auth-service | 3001 | PostgreSQL + Redis | Authentication & JWT |
| identity-service | 3002 | PostgreSQL | Identity & Access Management |
| user-service | 3003 | PostgreSQL | User Management |
| company-service | 3004 | PostgreSQL | Company & Organization Management |
| menu-service | 3005 | MongoDB | Menu & Food Catalog |
| order-service | 3006 | PostgreSQL + MongoDB | Order Processing |
| invoice-service | 3007 | PostgreSQL | Invoice Generation |
| payment-service | 3008 | PostgreSQL | Payment Processing |
| wallet-service | 3009 | PostgreSQL | Digital Wallet |
| notification-service | 3010 | MongoDB + Redis | Notifications (SMS, Email, Push) |
| reporting-service | 3011 | PostgreSQL + MongoDB | Reports & Analytics |
| file-service | 3012 | MongoDB + MinIO | File Storage |

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Databases**: PostgreSQL, MongoDB, Redis
- **Message Broker**: RabbitMQ
- **File Storage**: MinIO
- **Containerization**: Docker & Docker Compose

## Quick Start

```bash
# Clone and setup
cp .env.example .env

# Start infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Start all services
docker-compose up -d
```

## API Documentation

Each service exposes Swagger documentation at `/api-docs`

## Health Checks

All services expose health endpoint at `/health`

## Project Structure

```
catering-system/
├── services/           # Microservices
├── packages/           # Shared packages
├── docker-compose.yml  # Production compose
└── docker-compose.dev.yml # Development compose
```
