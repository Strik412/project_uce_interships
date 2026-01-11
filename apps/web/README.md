# Web Frontend (Next.js)

Minimal Next.js app for the Internship Management Platform.

## Prerequisites
- Node.js 18+
- pnpm 9+
- API Gateway running on `http://localhost:4000`

## Setup
```bash
pnpm install --filter web
```

## Development
```bash
pnpm --filter web dev
```
Open http://localhost:3000

## Build
```bash
pnpm --filter web build
```

## Configuration
- Set `NEXT_PUBLIC_API_BASE_URL` to point to your gateway (defaults to `http://localhost:4000/api/v1`).
- Auth pages call `auth/login` and `auth/register`.
- The dashboard uses local state for opportunities, applications, weekly logs, and validations until backend endpoints are ready.
