# Registration Service

> Manages internship practices, student applications, and assignment lifecycle for the Professional Internship Management Platform

## 📋 Overview

The Registration Service handles the full lifecycle of internship practices and applications. It allows admins to publish practices, students to submit applications, and supervisors/admins to review, approve, or reject them. It provides pagination, role-based access control, and status tracking for all registrations.

## ✨ Key Features

- 📑 **Practice Management** - Create, list, update, and delete internship practices
- 📝 **Application Management** - Students apply to practices; admins/supervisors review
- 🔒 **Role-Based Access** - Public listing, protected mutations with role guards
- 📊 **Pagination & Filtering** - Query practices and applications with paging
- ✅ **Status Tracking** - Application status updates with rejection reasons
- 🧭 **OpenAPI Docs** - Swagger UI for all endpoints
- 🧹 **Validation** - DTO validation with whitelisting and forbidden unknown props
- 🌐 **CORS** - Configurable allowed origins

## 📦 Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (TypeORM)
- **Auth**: JWT (via API Gateway/Auth Service), role-based decorators
- **Validation**: class-validator
- **Docs**: Swagger/OpenAPI

## 🔌 API Endpoints

### Port
**3003**

### Practice Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/practices` | Create practice | ✅ Yes (admin, student) |
| GET | `/api/v1/practices` | List practices (paginated) | ❌ Public |
| GET | `/api/v1/practices/:id` | Get practice by ID | ❌ Public |
| PATCH | `/api/v1/practices/:id` | Update practice | ✅ Yes (admin, supervisor) |
| DELETE | `/api/v1/practices/:id` | Delete practice | ✅ Yes (admin) |

### Application Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/applications` | Submit application | ❌ Public (token optional) |
| GET | `/api/v1/applications` | List applications (filter by practiceId, pagination) | ✅ Yes (admin, supervisor) |
| GET | `/api/v1/applications/:id` | Get application by ID | ❌ Public |
| PATCH | `/api/v1/applications/:id` | Update application status | ✅ Yes (admin, supervisor) |
| DELETE | `/api/v1/applications/:id` | Delete application | ✅ Yes (admin) |

### Health & Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Service health check |
| GET | `/api` | Swagger UI |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL 16

### 1) Install dependencies
```bash
pnpm install
```

### 2) Environment variables (.env)
```env
PORT=3003
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=practicas_user
DB_PASSWORD=practicas_password
DB_NAME=practicas_db
DB_LOGGING=true

CORS_ORIGINS=http://localhost:3000,http://localhost:4200
```

### 3) Run service
```bash
# Dev watch
pnpm dev:registration

# Using Nx
pnpm nx serve registration-service

# Build
pnpm nx build registration-service

# Run built artifact
node dist/apps/registration-service/main.js
```

Service: http://localhost:3003  
Swagger: http://localhost:3003/api

## 📝 API Usage Examples

### Create Practice
```bash
curl -X POST http://localhost:3003/api/v1/practices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Backend Internship",
    "description": "Work on NestJS microservices",
    "company": "Tech Corp",
    "location": "Remote",
    "startDate": "2026-02-01",
    "endDate": "2026-06-01",
    "slots": 3
  }'
```

### Apply to Practice
```bash
curl -X POST http://localhost:3003/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "practiceId": "550e8400-e29b-41d4-a716-446655440000",
    "studentId": "660e8400-e29b-41d4-a716-446655440001",
    "coverLetter": "I am excited to join..."
  }'
```

### List Applications (admin/supervisor)
```bash
curl -X GET "http://localhost:3003/api/v1/applications?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Update Application Status
```bash
curl -X PATCH http://localhost:3003/api/v1/applications/770e8400-e29b-41d4-a716-446655440002 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "approved",
    "rejectionReason": null
  }'
```

## 🔐 Security
- JWT auth enforced via API Gateway/Auth Service
- Role decorators: `@Roles('admin', 'supervisor', 'student')`
- Public decorator for open endpoints (`@Public()`)
- DTO validation with `whitelist` + `forbidNonWhitelisted`

## 📁 Project Structure
```
apps/registration-service/
├── src/
│   ├── app/
│   │   ├── practices/                 # Practice domain
│   │   │   ├── practices.controller.ts
│   │   │   ├── practices.service.ts
│   │   │   └── dto/practice.dto.ts
│   │   ├── registrations/             # Applications domain
│   │   │   ├── applications.controller.ts
│   │   │   ├── applications.service.ts
│   │   │   └── dto/application.dto.ts
│   │   ├── decorators/                # @Roles, @Public
│   │   ├── health/                    # Health check controller
│   │   ├── database/                  # TypeORM entities/config
│   │   └── app.module.ts
│   └── main.ts
├── jest.config.ts
├── project.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.spec.json
└── webpack.config.js
```

## 🛠️ Commands
```bash
# Dev
pnpm dev:registration
pnpm nx serve registration-service

# Build
pnpm nx build registration-service

# Test
pnpm nx test registration-service
pnpm nx test registration-service --watch

# Lint
pnpm nx lint registration-service
```

## 🗄️ Database migrations / schema updates

If `DB_SYNCHRONIZE` is turned off in production, apply SQL patches manually. The fractional hours change for placements is captured in:

- scripts/init.sql/20260109_completed_hours_decimal.sql

Apply it with psql (inside the Postgres container):

```bash
docker compose -f docker-compose.prod.yml exec postgres psql \
  -U practicas_user \
  -d practicas_db \
  -f /scripts/init.sql/20260109_completed_hours_decimal.sql
```

When running outside containers, adjust the host path to the script and connection flags accordingly.

## 🔗 Integrations
- **API Gateway**: routes `/api/v1/practices/*` and `/api/v1/applications/*`
- **Auth Service**: JWT validation and role claims
- **User Management**: student and supervisor identities
- **Notification Service** (future): send notifications on status changes

## 📖 API Documentation
- Swagger UI: http://localhost:3003/api
- Testing Guide: see root `TESTING_GUIDE.md`

---

**Service**: Registration Service  
**Port**: 3003  
**Version**: 1.0.0  
**Framework**: NestJS 10.x  
**Last Updated**: January 2026
