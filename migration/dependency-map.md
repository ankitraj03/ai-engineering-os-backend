# Dependency Map — Next.js to Node.js + Express Migration

## Overview
This document maps all external libraries, system packages, database connections, and third-party integrations required for the standalone Node.js + Express backend.

---

## 1. Runtime & Environment Dependencies

| Environment Variable | Required | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | Port for the Express HTTP server | `4000` |
| `NODE_ENV` | Optional | Application runtime environment | `development` / `production` |
| `CORS_ORIGIN` | Optional | Allowed CORS origin (Next.js frontend) | `http://localhost:3000` |
| `DATABASE_URL` | **Required** | PostgreSQL connection string (Supabase session pooler) | `postgresql://postgres.[REF]:[PASS]@[HOST]:5432/postgres` |
| `SUPABASE_URL` | **Required** | Base URL of the Supabase project | `https://[PROJECT_REF].supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Optional | Supabase public anonymous API key | `eyJhbGciOi...` |
| `SUPABASE_SECRET_KEY` | **Required** | Supabase service-role key for backend admin operations & bypassing RLS when safe | `eyJhbGciOi...` |
| `SUPABASE_JWKS_URL` | Optional | Remote JWKS endpoint for offline JWT verification | `https://[PROJECT_REF].supabase.co/auth/v1/.well-known/jwks.json` |

---

## 2. NPM Package Dependencies

### Production Dependencies
- `express` (`^4.21.2` or `^5.0.0`): Core HTTP routing framework.
- `cors` (`^2.8.5`): Express CORS middleware with origins and credentials control.
- `helmet` (`^8.0.0`): HTTP security headers middleware.
- `dotenv` (`^16.4.7`): Environment configuration loader.
- `@supabase/supabase-js` (`^2.49.1`): Official Supabase JavaScript client for Auth & PostgREST.
- `pg` (`^8.13.3`): PostgreSQL client library for raw connection health-checks & connection pooling.
- `zod` (`^3.24.2`) or `class-validator` / `joi`: Request body, parameter, and query validation.
- `morgan` (`^1.10.0`): Structured HTTP request logging.

### Development Dependencies
- `typescript` (`^5.8.2`): TypeScript language compiler.
- `ts-node` (`^10.9.2`): Direct TypeScript execution for development.
- `tsx` (`^4.19.3`): Ultra-fast TypeScript dev watcher (alternative to ts-node).
- `@types/express`: TypeScript definitions for Express.
- `@types/cors`: TypeScript definitions for CORS.
- `@types/node`: TypeScript definitions for Node.js.
- `@types/pg`: TypeScript definitions for pg driver.
- `@types/morgan`: TypeScript definitions for morgan logger.
- `supertest` (`^7.0.0`): End-to-end HTTP integration testing for Express routes.
- `@types/supertest`: TypeScript definitions for Supertest.

---

## 3. Database Dependency & Topology
```text
┌────────────────────────────────┐
│   Node.js + Express Backend    │
└──────────────┬─────────────────┘
               │
      ┌────────┴────────┐
      ▼                 ▼
┌──────────────┐  ┌────────────────────────────────────┐
│  pg (Driver) │  │  @supabase/supabase-js             │
│  (Port 5432) │  │  (Auth Admin & Data Client)        │
└──────┬───────┘  └─────────────────┬──────────────────┘
       │                            │
       └──────────────┬─────────────┘
                      ▼
┌──────────────────────────────────────────────┐
│           Supabase Cloud Platform            │
│  - PostgreSQL 15 Engine                      │
│  - GoTrue Auth Server (JWT verification)     │
│  - Row-Level Security Policies               │
│  - Triggers: on_auth_user_created            │
│  - Functions: is_org_member, create_org...   │
└──────────────────────────────────────────────┘
```

---

## 4. Frontend-to-Backend Dependency Flow
```text
┌───────────────────────────────────────────┐
│ Next.js 16 Web Frontend (Port 3000)       │
│  - App Router: app/(dashboard)/**         │
│  - React Query / ApiService Client Layer  │
└─────────────────────┬─────────────────────┘
                      │
           HTTP REST with Bearer JWT
                      │
                      ▼
┌───────────────────────────────────────────┐
│ Node.js + Express Backend (Port 4000)     │
│  - app.use(cors({ origin: 3000 }))        │
│  - authenticate middleware (Supabase JWT) │
│  - authorizeOrgRole middleware (RBAC)     │
│  - Routes -> Controllers -> Services      │
│  - Repositories                           │
└───────────────────────────────────────────┘
```
