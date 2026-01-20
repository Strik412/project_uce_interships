# Reporting & Analytics Service

> Generates reports, tracks metrics, powers dashboards, and performs analytics for the Professional Internship Management Platform

## Overview
The Reporting & Analytics Service centralizes reporting, dashboards, and metric tracking across the platform. It offers asynchronous report generation, anomaly detection, recommendations, and widget-driven dashboards so admins, supervisors, and students can monitor practice performance and engagement.

## Key Features
- Reports: create, generate asynchronously, complete/fail lifecycle, metadata access
- Metrics: single/batch ingestion, trend and anomaly detection, practice/user scopes
- Dashboards: user-specific layouts, widgets, themes, defaults, reorder
- Analytics: recommendations, anomaly detection, practice/company/period insights
- Security: JWT + role guard (via shared auth); Swagger with bearer auth
- Reliability: DTO validation (whitelist/forbid), CORS enabled, Postgres + TypeORM

## Tech Stack
- NestJS 10, TypeScript 5
- PostgreSQL (TypeORM)
- Auth: JWT via `SharedAuthModule` (global `JwtAuthGuard` + `RolesGuard`)
- Validation: `ValidationPipe` with whitelist + forbid non-whitelisted
- Docs: Swagger at `/api`

## Service Endpoints (port 3008)
_All routes require JWT unless noted; bearer token in `Authorization` header._

### Reports
| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| POST | `/reports` | Create report | Captures creator via JWT |
| POST | `/reports/generate` | Start async generation | Returns `generating` status |
| GET | `/reports/:id` | Get report by ID | — |
| GET | `/reports/user/:userId` | List reports for user | — |
| GET | `/reports/user/:userId/active` | Active reports for user | — |
| GET | `/reports/user/:userId/paginated?page=&limit=` | Paginated user reports | Defaults page=1, limit=10 |
| GET | `/reports/status/:status` | Reports by status | Uses `ReportStatus` enum |
| PUT | `/reports/:id` | Update report | — |
| POST | `/reports/:id/complete` | Mark as complete with data/file | Body includes data/fileUrl/fileSize |
| POST | `/reports/:id/fail` | Mark as failed | Body `errorMessage` |
| GET | `/reports/:id/metadata` | Get report metadata | — |
| DELETE | `/reports/:id` | Delete report | Roles: admin, supervisor |
| DELETE | `/reports/user/:userId` | Delete all reports for user | Roles: admin |

### Metrics
| Method | Path | Description |
|--------|------|-------------|
| POST | `/metrics` | Create metric |
| POST | `/metrics/batch` | Create multiple metrics |
| GET | `/metrics/:id` | Get metric by ID |
| GET | `/metrics/user/:userId` | Metrics for user |
| GET | `/metrics/user/:userId/latest?limit=` | Latest metrics (default 10) |
| GET | `/metrics/user/:userId/anomalies` | Anomalous metrics for user |
| GET | `/metrics/user/:userId/trend?type=&days=` | Trend data (default 30 days) |
| GET | `/metrics/user/:userId/average?type=&days=` | Average value (default 7 days) |
| GET | `/metrics/practice/:practiceId` | Metrics for practice |
| POST | `/metrics/:id/mark-anomalous` | Flag metric anomalous |
| POST | `/metrics/:id/update-value` | Update metric value |
| POST | `/metrics/user/:userId/detect-anomalies?type=` | Detect anomalies for user/type |
| GET | `/metrics/all/anomalous` | All anomalous metrics |
| DELETE | `/metrics/:id` | Delete metric |
| DELETE | `/metrics/user/:userId` | Delete all user metrics |

### Dashboards
| Method | Path | Description |
|--------|------|-------------|
| POST | `/dashboards` | Create dashboard |
| GET | `/dashboards/:id` | Get dashboard |
| GET | `/dashboards/user/:userId` | Dashboards for user |
| GET | `/dashboards/user/:userId/type/:type` | Dashboards by type |
| GET | `/dashboards/user/:userId/default` | Default dashboard |
| GET | `/dashboards/user/:userId/active` | Active dashboards |
| PUT | `/dashboards/:id` | Update dashboard |
| POST | `/dashboards/:id/widgets` | Add widget |
| DELETE | `/dashboards/:id/widgets/:widgetId` | Remove widget |
| PUT | `/dashboards/:id/widgets/reorder` | Reorder widgets |
| POST | `/dashboards/:id/set-default?userId=` | Set default for user |
| POST | `/dashboards/:id/viewed` | Update last viewed timestamp |
| PUT | `/dashboards/:id/theme` | Update theme |
| DELETE | `/dashboards/:id` | Delete dashboard |
| DELETE | `/dashboards/user/:userId` | Delete user dashboards |
| GET | `/dashboards/user/:userId/count` | Count dashboards for user |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| POST | `/analytics` | Create analytics record |
| GET | `/analytics/:id` | Get analytics |
| GET | `/analytics/user/:userId` | Analytics for user |
| GET | `/analytics/user/:userId/latest` | Latest analytics for user |
| POST | `/analytics/user/:userId/recommendations` | Generate recommendations |
| POST | `/analytics/user/:userId/detect-anomalies` | Detect anomalies |
| GET | `/analytics/practice/:practiceId` | Analytics for practice |
| GET | `/analytics/company/:companyId` | Analytics for company |
| GET | `/analytics/period/:period` | Analytics by period |
| GET | `/analytics/anomalies` | Analytics with anomalies |
| GET | `/analytics/warnings` | Analytics with warnings |
| POST | `/analytics/:id/warning` | Add warning |
| POST | `/analytics/:id/recommendation` | Add recommendation |
| DELETE | `/analytics/:id` | Delete analytics |
| DELETE | `/analytics/user/:userId` | Delete all analytics for user |

### Health & Docs
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api` | Swagger UI |

## Quick Start
Prereqs: Node 20+, pnpm 9+, PostgreSQL 16.

1) Install deps
```bash
pnpm install
```

2) Environment (.env)
```env
PORT=3008
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=practicas_user
DB_PASSWORD=practicas_password
DB_NAME=practicas_db
DB_SYNCHRONIZE=true
DB_LOGGING=true
DB_SSL=false
```

3) Run
```bash
# Dev serve
pnpm nx serve reporting-service

# Build
pnpm nx build reporting-service

# Run built artifact
node dist/apps/reporting-service/main.js
```

Swagger: http://localhost:3008/api

## API Examples
### Create metric
```bash
curl -X POST http://localhost:3008/metrics \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","practiceId":"p1","type":"engagement","value":0.92,"unit":"score"}'
```

### Generate report (async)
```bash
curl -X POST http://localhost:3008/reports/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"u1","type":"performance","filters":{"range":"last30"}}'
```

### Add dashboard widget
```bash
curl -X POST http://localhost:3008/dashboards/<dashboardId>/widgets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type":"chart","title":"Weekly Engagement","position":1,"config":{"metric":"engagement","period":7}}'
```

## Security
- Global `JwtAuthGuard` + `RolesGuard`; supply bearer tokens on all calls
- `@Roles` restricts destructive report routes (admin/supervisor)
- Validation: whitelist + forbid unknown fields
- CORS: `*` by default (configurable)

## Project Structure
```
apps/reporting-service/
├── src/
│   ├── app/
│   │   ├── analytics/
│   │   │   ├── application/ | domain/ | dto/ | infrastructure/ | presentation/
│   │   ├── dashboards/
│   │   │   ├── application/ | domain/ | dto/ | infrastructure/ | presentation/
│   │   ├── metrics/
│   │   │   ├── application/ | domain/ | dto/ | infrastructure/ | presentation/
│   │   ├── reports/
│   │   │   ├── application/ | domain/ | dto/ | infrastructure/ | presentation/
│   │   └── app.module.ts
│   └── main.ts
├── project.json
├── tsconfig*.json
├── jest.config.ts
└── webpack.config.js
```

## Commands
```bash
pnpm nx serve reporting-service
pnpm nx build reporting-service
pnpm nx test reporting-service
pnpm nx lint reporting-service
```

## Integrations
- Auth: uses shared JWT guards from `@app/shared`
- Downstream: consumes Postgres for persistence; exposed via API Gateway routes
- Upstream: produces data for dashboards/analytics used by other services

---
Service: Reporting & Analytics Service  
Port: 3008  
Version: 1.0.0  
Framework: NestJS 10  
Last Updated: January 2026
