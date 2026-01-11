# User Management Service

> Central service for user profiles, roles, and directory search within the Professional Internship Management Platform

**Port:** 3002  
**Base path:** `/api/v1`  
**Framework:** NestJS 10 (TypeScript)  
**Database:** PostgreSQL (TypeORM)  
**Auth:** Global JWT + role guard (via shared module)  
**Docs:** Swagger at `/api/docs`

## Overview
The User Management Service stores platform users, their roles, and profile metadata. It enforces role-scoped access (admin/supervisor), supports pagination and filtering, and exposes a public health check. All write operations are validated with DTOs and protected by JWT + roles.

## Features
- User CRUD with soft deactivation (`isActive` flag)
- Role-aware access: admins manage users; supervisors can read
- Filtering & pagination: search by email, role, activity status
- Validation: global `ValidationPipe` with whitelist + forbid unknown props
- CORS: configurable origins; credentials enabled
- Swagger docs with bearer authentication

## API Endpoints (port 3002, prefix `/api/v1`)
All routes require bearer JWT except health.

### Users
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/users` | admin | Create user |
| GET | `/users` | admin, supervisor | List users (filters/pagination) |
| GET | `/users/:id` | admin, supervisor | Get user by ID |
| PATCH | `/users/:id` | admin | Update user |
| DELETE | `/users/:id` | admin | Deactivate user (`isActive=false`) |

**Query params for GET /users**
- `page` (default 1), `limit` (default 10)
- `search` (email contains), `role` (enum), `isActive` (boolean)

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Public liveness check |

### Swagger
- `/api/docs` (bearer token supported)

## Data Model (UserEntity)
- `id` (uuid), `email` (unique), `firstName`, `lastName`
- `roles` (array enum: student, supervisor, admin)
- Optional: `phoneNumber`, `profileImage`, `organization`, `title`, `about`
- Flags: `isActive` (default true), `emailVerified` (default false)
- `lastLogin`, `createdAt`, `updatedAt`

## Environment
```
PORT=3002
CORS_ORIGINS=http://localhost:3000,http://localhost:4200

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=user_service
DB_LOGGING=false
DB_SSL=false
NODE_ENV=development
```

## Running & Commands
```bash
pnpm install

# Dev
pnpm nx serve user-management-service

# Build
pnpm nx build user-management-service

# Run built artifact
node dist/apps/user-management-service/main.js
```

Swagger: http://localhost:3002/api/docs

## Project Structure
```
apps/user-management-service/
├── src/
│   ├── app/
│   │   ├── users/          # controller, service, DTOs
│   │   ├── database/       # TypeORM config + user entity
│   │   ├── decorators/     # @Roles, @Public
│   │   ├── guards/         # Auth/role guards (from shared)
│   │   ├── health/         # health controller
│   │   └── app.module.ts   # global guards, modules
│   └── main.ts             # bootstrap, CORS, validation, Swagger
├── project.json            # Nx targets
├── tsconfig*.json
├── jest.config.ts
└── webpack.config.js
```

## Security Notes
- Global `JwtAuthGuard` and `RolesGuard` protect all routes; use bearer tokens.
- ValidationPipe enforces whitelist and forbids unknown properties; implicit conversion enabled.
- CORS origins configured via `CORS_ORIGINS` (comma-separated).

## Sample Requests
### Create user (admin)
```bash
curl -X POST http://localhost:3002/api/v1/users \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{
		"email": "user@example.com",
		"firstName": "Ada",
		"lastName": "Lovelace",
		"roles": ["student"],
		"organization": "University"
	}'
```

### List users with filters (admin/supervisor)
```bash
curl "http://localhost:3002/api/v1/users?page=1&limit=10&search=example&role=student" \
	-H "Authorization: Bearer <token>"
```

### Deactivate user (admin)
```bash
curl -X DELETE http://localhost:3002/api/v1/users/<userId> \
	-H "Authorization: Bearer <token>"
```

---
Service: User Management Service  
Port: 3002  
Version: 1.0.0  
Framework: NestJS 10  
Last Updated: January 2026
