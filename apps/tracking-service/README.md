# Tracking Service

> Tracks practice assignments, weekly progress, and milestones for the Professional Internship Management Platform

**Port:** 3004  
**Framework:** NestJS 10 (TypeScript)  
**Database:** PostgreSQL (TypeORM)  
**Messaging:** Kafka (event publishing)  
**Docs:** Swagger at `/api`

## Overview
The Tracking Service manages assignment lifecycles, weekly progress reviews, and milestone delivery tracking. It enforces status state machines, emits domain events to Kafka, and exposes JWT-protected REST endpoints.

## Features
- Assignments: CRUD, hour tracking, activate/pause/resume/complete
- Progress: weekly submissions, approve/reject/request revision, stats
- Milestones: create/update, progress %, complete, overdue/upcoming summaries
- Events: publishes assignment/progress/milestone events to Kafka topics
- Security: global JWT + roles guards, request validation (whitelist/forbid), CORS
- Docs: Swagger with bearer auth, local dev server preset

## Architecture
- **API:** Controllers for assignments, progress, milestones
- **Domain/Data:** TypeORM entities (`PracticeAssignment`, `ProgressReport`, `Milestone`)
- **Infra:** Kafka publisher (`tracking-event.publisher.ts`), in-memory cache helper
- **Cross-cutting:** Global `JwtAuthGuard` + `RolesGuard`, `ValidationPipe`, CORS

## API Endpoints (base `/` on port 3004)
All endpoints require a bearer token (JWT) via the API Gateway/Auth service.

### Assignments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/assignments` | Create assignment |
| GET | `/assignments/:id` | Get assignment |
| GET | `/assignments/student/:studentId` | Assignments by student |
| GET | `/assignments/company/:companyId` | Assignments by company |
| GET | `/assignments/supervisor/:supervisorId` | Assignments supervised |
| GET | `/assignments/status/active` | Active assignments |
| PUT | `/assignments/:id` | Update assignment |
| PUT | `/assignments/:id/progress` | Update completed hours |
| POST | `/assignments/:id/activate` | Transition to ACTIVE |
| POST | `/assignments/:id/complete` | Transition to COMPLETED |
| POST | `/assignments/:id/pause` | Transition to PAUSED |
| POST | `/assignments/:id/resume` | Resume from PAUSED |
| DELETE | `/assignments/:id` | Delete assignment |

### Progress
| Method | Path | Description |
|--------|------|-------------|
| POST | `/progress` | Submit weekly progress |
| GET | `/progress/:id` | Get progress report |
| GET | `/progress/assignment/:assignmentId` | Reports for assignment |
| GET | `/progress/assignment/:assignmentId/stats` | Progress statistics |
| GET | `/progress` | Pending reviews |
| GET | `/progress/assignment/:assignmentId/recent` | Recent reports (default 5) |
| PUT | `/progress/:id` | Update progress report |
| POST | `/progress/:id/approve` | Approve report |
| POST | `/progress/:id/reject` | Reject report |
| POST | `/progress/:id/request-revision` | Request revision |
| DELETE | `/progress/:id` | Delete report |

### Milestones
| Method | Path | Description |
|--------|------|-------------|
| POST | `/milestones` | Create milestone |
| GET | `/milestones/:id` | Get milestone |
| GET | `/milestones/assignment/:assignmentId` | Milestones for assignment |
| GET | `/milestones/assignment/:assignmentId/stats` | Milestone statistics |
| GET | `/milestones/assignment/:assignmentId/summary` | Summary (list + stats) |
| GET | `/milestones/status/overdue` | Overdue milestones |
| GET | `/milestones/status/upcoming` | Upcoming milestones |
| PUT | `/milestones/:id` | Update milestone |
| PUT | `/milestones/:id/progress` | Update progress % |
| POST | `/milestones/:id/complete` | Mark complete |
| POST | `/milestones/:id/check-overdue` | Check/update overdue flag |
| DELETE | `/milestones/:id` | Delete milestone |

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
