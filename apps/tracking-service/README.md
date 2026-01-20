# Tracking Service

> Optional service for tracking progress reports and milestones for the Professional Internship Management Platform

**Port:** 3005  
**Framework:** NestJS 10 (TypeScript)  
**Database:** PostgreSQL (TypeORM)  
**Docs:** Swagger at `/api`

## Overview
The Tracking Service is an **optional monitoring service** that provides progress report and milestone tracking. It links to placements (via placementId) from the Registration Service. This service enables detailed progress monitoring without duplicating core assignment logic which is handled by the Registration Service.

**Note:** This service is optional and not required for core functionality. The Registration Service handles all placement and hour log workflows.

## Features
- **Progress Reports:** Weekly progress submissions linked to placements
- **Milestones:** Create and track project milestones
- **Statistics:** Progress stats and completion tracking
- **Approval Workflow:** Approve/reject/request revision on progress reports
- **Security:** JWT authentication with role-based access
- **Documentation:** Swagger API documentation

## Architecture
- **API:** Controllers for progress and milestones
- **Domain/Data:** TypeORM entities (`ProgressReport`, `Milestone`)
- **Linked to:** Registration Service placements via `placementId`
- **Security:** Global `JwtAuthGuard` + `RolesGuard`, validation, CORS

## API Endpoints (base `/api/v1/` on port 3005)
All endpoints require a bearer token (JWT) via the API Gateway/Auth service.

### Notes
- Placement assignments are managed in **Registration Service** (not here)
- Progress and Milestones are linked to placements via `placementId`

### Progress Reports
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/progress` | Submit weekly progress report | ✅ Yes (student) |
| GET | `/progress/:id` | Get progress report | ✅ Yes |
| GET | `/progress/placement/:placementId` | Reports for placement | ✅ Yes |
| GET | `/progress/placement/:placementId/stats` | Progress statistics | ✅ Yes |
| GET | `/progress/placement/:placementId/recent` | Recent reports (default 5) | ✅ Yes |
| PATCH | `/progress/:id` | Update progress report | ✅ Yes (student) |
| PATCH | `/progress/:id/approve` | Approve report | ✅ Yes (professor, company) |
| PATCH | `/progress/:id/reject` | Reject report | ✅ Yes (professor, company) |
| PATCH | `/progress/:id/request-revision` | Request revision | ✅ Yes |
| DELETE | `/progress/:id` | Delete report | ✅ Yes (student) |

### Milestones
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/milestones` | Create milestone | ✅ Yes (professor, company) |
| GET | `/milestones/:id` | Get milestone | ✅ Yes |
| GET | `/milestones/placement/:placementId` | Milestones for placement | ✅ Yes |
| GET | `/milestones/placement/:placementId/stats` | Milestone statistics | ✅ Yes |
| GET | `/milestones/placement/:placementId/summary` | Summary (list + stats) | ✅ Yes |
| GET | `/milestones/status/overdue` | Overdue milestones | ✅ Yes |
| GET | `/milestones/status/upcoming` | Upcoming milestones | ✅ Yes |
| PATCH | `/milestones/:id` | Update milestone | ✅ Yes (professor, company) |
| PATCH | `/milestones/:id/progress` | Update progress % | ✅ Yes |
| POST | `/milestones/:id/complete` | Mark complete | ✅ Yes |
| POST | `/milestones/:id/check-overdue` | Check/update overdue flag | ✅ Yes |
| DELETE | `/milestones/:id` | Delete milestone | ✅ Yes (professor, company) |

### Docs
- Swagger UI: `/api` (auth: bearer)

## Status State Machines
**Assignments**: `PENDING → ACTIVE → COMPLETED` with branches to `PAUSED ↔ ACTIVE` and `CANCELLED` terminal.  
**Progress**: `PENDING → SUBMITTED → APPROVED/REJECTED/REVISED`.  
**Milestones**: `PENDING → IN_PROGRESS → COMPLETED` with `OVERDUE` flagged when past due and incomplete.

## Events (Kafka)
- `tracking.assignment.created` | started | completed | paused
- `tracking.progress.submitted` | approved | rejected
- `tracking.milestone.created` | completed | overdue
Broker list from `KAFKA_BROKERS` (default `localhost:9092`); clientId `tracking-service`, groupId `tracking-service-group`.

## Caching
Lightweight in-memory cache helper for assignment/progress/milestone lookups (TTL default 300–600s). No external Redis dependency.

## Configuration
Environment variables (see `.env` or `.env.local`):
```
PORT=3004
API_URL=http://localhost:3004
CORS_ORIGIN=*

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=practicas_user
DB_PASSWORD=practicas_password
DB_NAME=practicas_db

KAFKA_BROKERS=localhost:9092
NODE_ENV=development
```

## Run & Build
```bash
pnpm install

# Serve (dev)
pnpm nx serve tracking-service

# Build
pnpm nx build tracking-service

# Tests
pnpm nx test tracking-service

# Lint
pnpm nx lint tracking-service

# Run built artifact
node dist/apps/tracking-service/main.js
```

Swagger: http://localhost:3004/api

## Project Structure
```
apps/tracking-service/
├── src/
│   ├── app/
│   │   ├── assignments/   # Assignment module (controller/service/repo/entity)
│   │   ├── progress/      # Progress module
│   │   ├── milestones/    # Milestone module
│   │   ├── shared/        # cache, events, logging
│   │   ├── database/      # TypeORM config
│   │   └── tracking.module.ts
│   └── main.ts            # Bootstrap + Swagger
├── project.json           # Nx targets
├── jest.config.ts
├── tsconfig*.json
└── webpack.config.js
```

## Notes
- JWT is enforced globally via `JwtAuthGuard`; `RolesGuard` available for role scoping.
- ValidationPipe enables whitelist + forbid non-whitelisted; implicit conversion is on.
- CORS origin defaults to `*`; override with `CORS_ORIGIN`.
- TypeORM `synchronize` and `logging` are enabled unless `NODE_ENV=production`.
# Run tests
npm run test:tracking

# Build for production
npm run build:tracking
```

## Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=tracking_db

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka
KAFKA_BROKERS=localhost:9092

# Service
PORT=3004
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=*
```

## Testing

```bash
# Unit tests
npm run test:tracking

# Integration tests
npm run test:tracking:e2e

# Test coverage
npm run test:tracking:cov
```

## Performance Metrics

- **Assignment Operations**: < 100ms
- **Progress Submission**: < 150ms (includes validation)
- **Milestone Updates**: < 100ms
- **Statistics Queries**: < 200ms
- **Cache Hit Rate Target**: 70%
- **Database Connection Pool**: 20 connections max

## Monitoring & Logging

### Winston Logger
- Logs to console and files (error.log, combined.log)
- Configurable levels: debug, info, warn, error
- Structured JSON logging for analysis
- File rotation: 5MB max, 5 file max

### Metrics
- Request/response times
- Error rates and types
- Database query performance
- Cache hit/miss ratios
- Event publishing latency

## Security

- Input validation (class-validator decorators)
- Date format validation
- UUID validation for IDs
- Status enum validation (prevents invalid states)
- Hours range validation (0-12 per day)
- Soft delete prevention on approved records

## Related Services

- **Registration Service** → Creates assignments from approved applications
- **User Management Service** → Provides student, supervisor, company data
- **Notification Service** → Sends deadline reminders, approval notifications
- **Evaluations Service** → Uses progress reports for grading
- **Reports Service** → Generates summary reports from tracking data

## API Documentation

Full Swagger documentation available at: `http://localhost:3004/api`

Includes:
- Complete endpoint descriptions
- Request/response schemas
- Parameter documentation
- Error response codes
- Authentication requirements
