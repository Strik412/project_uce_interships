# Professional Internship Management Platform

A distributed microservices-based platform for managing professional internships, built with NestJS, TypeScript, and modern cloud infrastructure.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Microservices](#microservices)
- [Infrastructure](#infrastructure)
- [Testing](#testing)
- [Documentation](#documentation)
- [Project Structure](#project-structure)

## 🎯 Overview

This platform provides a comprehensive solution for managing professional internships, connecting students, companies, and educational institutions through a robust microservices architecture. The system handles user management, internship registration, tracking, communications, notifications, document management, and reporting/analytics.

## 🏗️ Architecture

The platform follows a microservices architecture with the following key components:

- **API Gateway**: Centralized entry point with routing, authentication, and rate limiting
- **9 Specialized Microservices**: Each handling a specific domain
- **Multiple Databases**: PostgreSQL, MongoDB, and Redis
- **Message Broker**: RabbitMQ for asynchronous communication
- **MQTT Broker**: Mosquitto for real-time notifications
- **Monitoring**: Prometheus & Grafana for observability

### Architecture Diagrams

All architecture diagrams are available in the `diagramas/` directory:
- C4 Model diagrams (Context, Container, Components)
- Database ER diagrams
- BPMN process flows
- Infrastructure diagrams
- UML class diagrams

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Monorepo Tool**: Nx 18.x
- **Package Manager**: pnpm 9.x

### Databases
- **PostgreSQL 16**: Primary relational database
- **MongoDB 7.0**: Document storage
- **Redis 7**: Caching and session management

### Message Brokers
- **RabbitMQ 3.13**: Asynchronous messaging
- **Mosquitto**: MQTT protocol for IoT/real-time updates

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **IaC**: Terraform (6 AWS lab configurations)
- **Monitoring**: Prometheus & Grafana
- **Cloud**: AWS (Auto Scaling Groups, ALB, Target Groups)

## 📦 Prerequisites

Before running the project, ensure you have:

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0
- **Docker**: >= 20.x
- **Docker Compose**: >= 2.x
- **Git**: Latest version

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <https://github.com/Strik412/project_uce_interships.git>
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Infrastructure (Databases & Brokers)

```bash
# Windows
.\scripts\start-databases.bat

# Linux/Mac
./scripts/start-databases.sh

# Or using Docker Compose directly
docker-compose up -d
```

### 4. Start All Microservices

```bash
# Start all services in development mode
pnpm dev:all

# Or start specific services
pnpm dev:auth        # Auth Service only
pnpm dev:users       # User Management only
pnpm dev:gateway     # API Gateway only
```

### 5. Quick Start (Windows)

```bash
# One-command startup
.\QUICKSTART.bat
```

## 🔧 Microservices

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | 4000 | Main entry point, routing, auth middleware |
| **Auth Service** | 3001 | Authentication, JWT tokens, authorization |
| **User Management** | 3002 | User CRUD, profiles, roles |
| **Registration Service** | 3003 | Internship registration, applications |
| **Tracking Service** | 3004 | Internship progress tracking, milestones |
| **Communication Service** | 3005 | Internal messaging, notifications queue |
| **Notification Service** | 3006 | Email, SMS, push notifications |
| **Document Management** | 3007 | File upload, storage, versioning |
| **Reporting & Analytics** | 3008 | Reports, dashboards, metrics |

### Service Health Checks

```bash
# API Gateway
curl http://localhost:4000/api/v1/health

# Individual services
curl http://localhost:3001/api/v1/health  # Auth
curl http://localhost:3002/api/v1/health  # Users
curl http://localhost:3003/health         # Registration
```

## 🗄️ Infrastructure

### Docker Services

```bash
# View running containers
docker ps

# View logs
docker logs practicas-postgres
docker logs practicas-mongodb
docker logs practicas-redis
docker logs practicas-rabbitmq
```

### Database Connections

**PostgreSQL**
```
Host: localhost
Port: 5432
User: practicas_user
Password: practicas_password
Database: practicas_db
```

**MongoDB**
```
Host: localhost
Port: 27017
User: admin
Password: admin_password
Database: practicas
```

**Redis**
```
Host: localhost
Port: 6379
Password: redis_password
```

**RabbitMQ Management**
```
URL: http://localhost:15672
User: guest
Password: guest
```

### Monitoring

**Prometheus**: http://localhost:9090  
**Grafana**: http://localhost:3000 (admin/admin)


## 📚 Documentation

- **Architecture Diagrams**: `diagramas/arquitectura/`
- **Database Schemas**: `diagramas/base-de-datos/`
- **Process Flows**: `diagramas/bpmn/`
- **Service READMEs**: Each service has its own README in `apps/<service>/README.md`

### Generate Dependency Graph

```bash
# Visual dependency graph
pnpm graph

# Watch mode
pnpm graph:watch
```

## 📁 Project Structure

```
Final_Project/
├── apps/                          # Microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── user-management-service/
│   ├── registration-service/
│   ├── tracking-service/
│   ├── communication-service/
│   ├── notification-service/
│   ├── document-management-service/
│   └── reporting-service/
├── libs/                          # Shared libraries
│   └── shared/
│       ├── types/
│       └── utils/
├── config/                        # Configuration files
│   ├── grafana/
│   ├── mosquitto.conf/
│   └── prometheus.yml/
├── diagramas/                     # Architecture diagrams
│   ├── arquitectura/
│   ├── base-de-datos/
│   ├── bpmn/
│   ├── infraestructura/
│   └── uml/
├── infra/                         # Infrastructure as Code
│   └── terraform/                 # 6 AWS lab configurations
├── scripts/                       # Utility scripts
│   ├── start-databases.bat
│   ├── start-databases.sh
│   ├── init.sql
│   └── mongo-init.js
├── tests/                         # Integration tests
├── tools/                         # Development tools
├── docker-compose.yml             # Container orchestration
├── nx.json                        # Nx configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev:all              # Start all services
pnpm dev:auth             # Start auth service only
pnpm dev:users            # Start users service only
pnpm dev:gateway          # Start API gateway only

# Production
pnpm start                # Start with Nx
pnpm start:all            # Start all with Docker Compose
pnpm start:infra          # Start infrastructure only

# Build
pnpm build                # Build all services
pnpm build:docker         # Build Docker images

# Testing
pnpm test                 # Run all tests
pnpm lint                 # Lint all code

# Code Quality
pnpm format               # Format code
pnpm format:check         # Check formatting

# Nx Utilities
pnpm graph                # View dependency graph
pnpm affected:build       # Build only affected projects
```

## 🌩️ AWS Infrastructure (Terraform)

The `infra/terraform/` directory contains 6 independent lab configurations for AWS:

- Auto Scaling Groups (5 instances per lab)
- Application Load Balancers (public)
- Target Groups
- Security Groups
- Elastic IPs (5 per lab).
- VPC with public subnets.

Each lab uses:
- **Region**: us-east-1
- **Instance Type**: t3.micro
- **AMI**: Amazon Linux 2
- **Key Name**: keyproject

## 🤝 Contributing

1. Create a feature branch from `qa`
2. Make your changes
3. Run tests: `pnpm test`
4. Format code: `pnpm format`
5. Commit with conventional commits
6. Push and create a Pull Request


