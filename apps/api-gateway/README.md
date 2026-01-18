# API Gateway

> Centralized entry point for the Professional Internship Management Platform

## 📋 Overview

The API Gateway serves as the single point of entry for all client requests in the microservices architecture. It handles authentication, request routing, rate limiting, and provides a unified API interface for frontend applications.

## ✨ Key Features

- 🔐 **JWT Authentication & Authorization** - Token-based security with middleware validation
- 🔀 **Intelligent Request Routing** - Routes requests to appropriate microservices
- ⏱️ **Multi-tier Rate Limiting** - Protects against abuse with configurable limits
- 🌐 **CORS Management** - Secure cross-origin resource sharing
- 📝 **Request/Response Logging** - Comprehensive logging with interceptors
- 🛡️ **Global Error Handling** - Centralized exception management
- 💊 **Health Monitoring** - Service health checks and status endpoints
- 📚 **Interactive API Documentation** - Swagger/OpenAPI integration
- 🔄 **Request/Response Transformation** - Automatic data transformation
- 🎯 **Load Distribution** - Routes traffic efficiently across services

## 🚀 Quick Start

### Port
**4000**

### Development Mode

```bash
# Using Nx
pnpm nx serve api-gateway

# Using npm scripts
pnpm dev:gateway
```

### Production Mode

```bash
# Build
pnpm nx build api-gateway

# Run
node dist/apps/api-gateway/main.js
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server
PORT=4000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
REGISTRATION_SERVICE_URL=http://localhost:3003
TRACKING_SERVICE_URL=http://localhost:3004
COMMUNICATION_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006
DOCUMENT_SERVICE_URL=http://localhost:3007
REPORTING_SERVICE_URL=http://localhost:3008

# Timeouts
REQUEST_TIMEOUT=5000

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100
```

## 📡 Service Routing Map

The gateway routes requests to backend microservices based on URL patterns:

| Route Pattern | Target Service | Port | Description |
|--------------|----------------|------|-------------|
| `/api/v1/auth/*` | Auth Service | 3001 | Authentication & authorization |
| `/api/v1/users/*` | User Management | 3002 | User profiles & management |
| `/api/v1/practices/*` | Registration | 3003 | Internship registration |
| `/api/v1/applications/*` | Registration | 3003 | Application management |
| `/api/v1/progress/*` | Tracking | 3004 | Progress monitoring |
| `/api/v1/milestones/*` | Tracking | 3004 | Milestone tracking |
| `/api/v1/assignments/*` | Tracking | 3004 | Assignment management |
| `/api/v1/messages/*` | Communication | 3005 | Messaging system |
| `/api/v1/conversations/*` | Communication | 3005 | Conversation threads |
| `/api/v1/notifications/*` | Notification | 3006 | Push notifications |
| `/api/v1/templates/*` | Notification | 3006 | Notification templates |
| `/api/v1/documents/*` | Document Management | 3007 | File management |
| `/api/v1/reports/*` | Reporting | 3008 | Report generation |
| `/api/v1/metrics/*` | Reporting | 3008 | Metrics & analytics |
| `/api/v1/dashboards/*` | Reporting | 3008 | Dashboard data |
| `/api/v1/analytics/*` | Reporting | 3008 | Analytics queries |

## 🔒 Authentication & Authorization

### Public Endpoints (No Authentication)

```http
POST   /api/v1/auth/register          # User registration
POST   /api/v1/auth/login             # User login
POST   /api/v1/auth/refresh           # Refresh access token
POST   /api/v1/auth/forgot-password   # Request password reset
POST   /api/v1/auth/reset-password    # Reset password with token
GET    /api/v1/health                 # Gateway health check
```

### Protected Endpoints (JWT Required)

All other endpoints require a valid JWT token in the authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

**Protected Route Examples:**
```http
POST   /api/v1/auth/verify            # Verify token validity
POST   /api/v1/auth/logout            # Logout user
GET    /api/v1/users                  # List users
GET    /api/v1/users/:id              # Get user details
PUT    /api/v1/users/:id              # Update user
GET    /api/v1/practices              # List internships
POST   /api/v1/practices              # Create internship
GET    /api/v1/progress/:id           # Get progress
POST   /api/v1/messages               # Send message
GET    /api/v1/documents              # List documents
GET    /api/v1/reports                # Generate reports
```

## ⏱️ Rate Limiting

The gateway implements multi-tier rate limiting to protect services:

### Default Limits

| Tier | Limit | Window | Description |
|------|-------|--------|-------------|
| **Short** | 3 requests | 1 second | Burst protection |
| **Medium** | 20 requests | 10 seconds | Standard operations |
| **Long** | 100 requests | 60 seconds | Overall traffic control |

### Endpoint-Specific Limits

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| `/auth/login` | 5 attempts | 5 minutes | Brute force protection |
| `/auth/forgot-password` | 3 attempts | 10 minutes | Abuse prevention |
| `/auth/register` | 3 attempts | 1 second | Spam prevention |

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## 📚 API Documentation

### Swagger UI

Once the service is running, access interactive API documentation:

🔗 **http://localhost:4000/api/docs**

Features:
- Browse all available endpoints
- Test API calls directly in browser
- View request/response schemas
- See authentication requirements
- Download OpenAPI spec

### Health Check

Monitor gateway status:

🔗 **http://localhost:4000/api/v1/health**

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-06T12:00:00.000Z",
  "uptime": 3600,
  "service": "api-gateway",
  "version": "1.0.0"
}
```

## 🏗️ Architecture

### Components

```
API Gateway
├── Guards
│   └── JwtAuthGuard         # JWT validation
├── Interceptors
│   ├── LoggingInterceptor   # Request/response logging
│   └── TransformInterceptor # Data transformation
├── Filters
│   └── HttpExceptionFilter  # Error handling
├── Middleware
│   ├── RateLimitMiddleware  # Rate limiting
│   └── CorsMiddleware       # CORS handling
└── Services
    └── GatewayService       # Routing logic
```

### Request Flow

```
Client Request
    ↓
CORS Check
    ↓
Rate Limiting
    ↓
JWT Validation (if protected)
    ↓
Request Logging
    ↓
Route to Microservice
    ↓
Response Transformation
    ↓
Response Logging
    ↓
Client Response
```

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Real-time logs
pnpm nx serve api-gateway --verbose

# Docker logs
docker logs -f practicas-gateway
```

### Debug Mode

Enable detailed logging:

```env
NODE_ENV=development
LOG_LEVEL=debug
```

### Health Checks

```bash
# Gateway health
curl http://localhost:4000/api/v1/health

# Test routing
curl http://localhost:4000/api/v1/auth/health
curl http://localhost:4000/api/v1/users/health
```

## 🧪 Testing

### Unit Tests

```bash
# Run tests
nx test api-gateway

# Watch mode
nx test api-gateway --watch

# Coverage
nx test api-gateway --coverage
```

### Integration Tests

```bash
# Run integration tests
nx test api-gateway --testMatch="**/*.e2e-spec.ts"
```

### Manual Testing

Use the included HTTP test file:

```bash
tests/api-gateway.http
```

Or import the Postman collection:

```bash
postman-collection.json
```

## 📦 Dependencies

### Core
- `@nestjs/common` - NestJS framework
- `@nestjs/core` - NestJS core
- `@nestjs/platform-express` - Express adapter

### Authentication
- `@nestjs/jwt` - JWT handling
- `@nestjs/passport` - Authentication strategies
- `passport-jwt` - JWT strategy

### HTTP & Routing
- `@nestjs/axios` - HTTP client
- `axios` - Promise-based HTTP client

### Rate Limiting
- `@nestjs/throttler` - Rate limiting

### Documentation
- `@nestjs/swagger` - OpenAPI/Swagger

### Configuration
- `@nestjs/config` - Environment configuration

## 🚨 Error Handling

The gateway provides standardized error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["field1 is required"]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Service unavailable"
}
```

## 🔗 Related Services

- [Auth Service](../auth-service/README.md) - Authentication & authorization
- [User Management Service](../user-management-service/README.md) - User profiles
- [Registration Service](../registration-service/README.md) - Internship registration
- [Tracking Service](../tracking-service/README.md) - Progress tracking

## 📝 Notes

- All timestamps are in UTC
- Request/response payloads are automatically validated
- JWT tokens expire after 1 hour by default
- Refresh tokens expire after 7 days
- Maximum request payload size: 10MB
- Request timeout: 5 seconds (configurable)

