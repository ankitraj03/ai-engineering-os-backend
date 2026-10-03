# AI Engineering OS — Node.js + Express Backend

Production-ready standalone Node.js + Express.js backend for the AI Engineering OS platform, providing layered architecture, multi-tenant organization management, Supabase PostgreSQL data persistence, and RBAC authorization.

---

## 🏗️ Architecture

```text
Next.js Frontend (Port 3000)
       ↓  HTTP / REST (Bearer Supabase JWT)
Node.js + Express Backend (Port 4000)
       ↓  Layered Architecture
  Routes → Controllers → Services → Repositories
       ↓  Supabase PostgREST & pg Driver (Port 5432)
Supabase PostgreSQL Database (Row Level Security & RPC)
```

---

## 📁 Layered Project Layout

```text
backend/
├── src/
│   ├── config/              # Environment config & Supabase config
│   │   ├── env.config.ts
│   │   └── supabase.config.ts
│   ├── db/                  # Database connections (pg Pool, Supabase client)
│   │   ├── postgres.ts
│   │   └── supabase.ts
│   ├── models/              # TypeScript interfaces and entity types
│   │   ├── enums.ts
│   │   ├── auth-user.model.ts
│   │   ├── user.model.ts
│   │   ├── organization.model.ts
│   │   ├── membership.model.ts
│   │   ├── integration.model.ts
│   │   └── git-organization.model.ts
│   ├── repositories/        # Database access layer (Supabase PostgREST & pg queries)
│   │   ├── user.repository.ts
│   │   ├── organization.repository.ts
│   │   ├── membership.repository.ts
│   │   ├── integration.repository.ts
│   │   └── git-organization.repository.ts
│   ├── services/            # Pure business logic and domain rules
│   │   ├── user.service.ts
│   │   ├── organization.service.ts
│   │   ├── membership.service.ts
│   │   ├── integration.service.ts
│   │   ├── git-organization.service.ts
│   │   └── intelligence.service.ts
│   ├── controllers/         # HTTP request/response handlers
│   │   ├── health.controller.ts
│   │   ├── user.controller.ts
│   │   ├── organization.controller.ts
│   │   ├── membership.controller.ts
│   │   ├── integration.controller.ts
│   │   ├── git-organization.controller.ts
│   │   └── intelligence.controller.ts
│   ├── middleware/          # Express middlewares (auth, rbac, error-handling, logger)
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── error-handler.ts
│   │   └── request-logger.ts
│   ├── validators/          # Zod validation schemas
│   │   ├── validate.middleware.ts
│   │   ├── user.validator.ts
│   │   ├── organization.validator.ts
│   │   ├── membership.validator.ts
│   │   ├── integration.validator.ts
│   │   └── git-organization.validator.ts
│   ├── routes/              # Express router definitions
│   │   ├── health.routes.ts
│   │   ├── user.routes.ts
│   │   ├── organization.routes.ts
│   │   ├── integration.routes.ts
│   │   ├── git-organization.routes.ts
│   │   ├── intelligence.routes.ts
│   │   └── index.ts
│   ├── utils/               # AppError, database-error mapper, logger
│   │   ├── app-error.ts
│   │   ├── database-error.ts
│   │   └── logger.ts
│   ├── app.ts               # Express application initialization & middleware stack
│   └── server.ts            # Server entry point & graceful shutdown
├── tests/
│   └── verify-parity.ts     # Comprehensive parity and verification test suite
├── migration/               # Complete migration documentation & audit reports
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 📋 Prerequisites
- **Node.js**: v20+ or v22+
- **npm**: v10+ or v11+
- **Supabase Cloud Project**: Linked and accessible

---

## 🚀 Getting Started

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the following variables are configured in `.env`:
```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Supabase Database & Auth Credentials
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
SUPABASE_SECRET_KEY=eyJhbGci...
```

### 3. Run Development Server
```bash
npm run start:dev
```
The server will start on `http://localhost:4000`.

### 4. Run Parity & Verification Tests
```bash
npm test
```
Executes the 63 automated tests verifying repository parity, database error mapping, RBAC guards, and HTTP endpoints.

### 5. Production Build & Start
```bash
npm run build
npm start
```

---

## 🩺 Endpoints Catalog

### Health Checks
- `GET /health`: Liveness probe
- `GET /health/db`: Readiness probe testing PostgreSQL ping latency

### Users
- `GET /users/me`: Current user profile (Bearer token)
- `PATCH /users/me`: Update profile (Bearer token)
- `GET /users/:id`: Lookup user (Bearer token)

### Organizations
- `POST /organizations`: Create organization with owner (Bearer token)
- `GET /organizations`: List user organizations (Bearer token)
- `GET /organizations/:id`: Organization details (OWNER, ADMIN, MEMBER)
- `PATCH /organizations/:id`: Update organization (OWNER, ADMIN)
- `DELETE /organizations/:id`: Delete organization (OWNER only)

### Organization Memberships
- `POST /organizations/:id/members`: Invite member (OWNER, ADMIN)
- `GET /organizations/:id/members`: List members (OWNER, ADMIN, MEMBER)
- `GET /organizations/:id/members/:memberId`: Member details (OWNER, ADMIN, MEMBER)
- `PATCH /organizations/:id/members/:memberId/role`: Update role (OWNER, ADMIN)
- `PATCH /organizations/:id/members/:memberId/status`: Update status (OWNER, ADMIN)
- `DELETE /organizations/:id/members/:memberId`: Remove member (OWNER, ADMIN)

### Integrations & Git Organizations
- `POST /organizations/:id/integrations`: Connect provider (OWNER, ADMIN)
- `GET /organizations/:id/integrations`: List integrations (OWNER, ADMIN, MEMBER)
- `GET /integrations/:id`: Integration details (Bearer token)
- `PATCH /integrations/:id`: Update status (Bearer token)
- `DELETE /integrations/:id`: Disconnect integration (Bearer token)
- `POST /integrations/:id/git-organizations`: Link Git org (Bearer token)
- `GET /integrations/:id/git-organizations`: List linked Git orgs (Bearer token)
- `GET /git-organizations/:id`: Git org details (Bearer token)
- `PATCH /git-organizations/:id`: Update Git org (Bearer token)
- `DELETE /git-organizations/:id`: Unlink Git org (Bearer token)

### Intelligence & Telemetry
- `GET /dashboard/kpis`: KPI metrics
- `GET /projects`: Engineering projects catalog
- `GET /projects/:id`: Single project details
- `GET /developers/workloads`: Developer workload intelligence
