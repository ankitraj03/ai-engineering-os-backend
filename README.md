# AI Engineering OS - NestJS Backend

NestJS backend for the AI Engineering OS project, providing database abstraction via TypeORM and PostgreSQL connection to Supabase.

---

## 🏗️ Architecture

```text
Next.js Frontend (Port 3000)
       ↓  HTTP / REST
NestJS Backend (Port 4000)
       ↓  TypeORM (PostgreSQL Driver)
Supabase PostgreSQL Database
```

---

## 📋 Prerequisites

- **Node.js**: v20+ or v22+
- **npm**: v10+ or v11+
- **Supabase Cloud Project**: Linked and accessible

---

## 🚀 Getting Started

### 1. Install Backend Dependencies

Navigate to the `backend` directory and install the packages:

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `backend/.env` with your actual Supabase database connection details.

#### Recommended: Using `DATABASE_URL`

For Supabase session pooler (port `5432`):
```env
DATABASE_URL=postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

Or for direct connection (port `5432`):
```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
```

> **Note**: Supabase requires SSL encryption. SSL is enabled by default (`rejectUnauthorized: false`).

---

### 3. Start the Backend

#### Development Mode:
```bash
npm run start:dev
```

#### Production Build & Run:
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:4000`.

---

## 🩺 Verifying Supabase Connectivity

### 1. Terminal Startup Diagnostics

When the backend starts, `DatabaseService` tests connectivity with a lightweight ping query (`SELECT NOW()`).

- **Success**: You will see:
  ```text
  ✔ DATABASE CONNECTION SUCCESSFUL
    Engine: PostgreSQL
    Database Time: ...
    Ping Latency: ...ms
  ```
- **Failure**: A clear diagnostic block will be displayed indicating the failure reason and troubleshooting steps.

### 2. Database Health-Check Endpoint

Verify database connectivity via HTTP:

```bash
curl http://localhost:4000/health/db
```

**Healthy Response (`200 OK`)**:
```json
{
  "status": "healthy",
  "database": "postgresql",
  "timestamp": "2026-09-22T05:55:00.000Z",
  "latencyMs": 45,
  "serverTime": "2026-09-22T05:55:00.000Z",
  "version": "PostgreSQL 15.x..."
}
```

**Unhealthy Response (`503 Service Unavailable`)**:
```json
{
  "status": "unhealthy",
  "database": "postgresql",
  "timestamp": "2026-09-22T05:55:00.000Z",
  "latencyMs": 10000,
  "error": "Connection terminated unexpectedly"
}
```

### 3. General Health Check

```bash
curl http://localhost:4000/health
```

---

## 🛡️ Database Safety Guidelines

- **`synchronize: false`**: Automatic schema synchronization is strictly disabled to protect shared Supabase data.
- **No Domain Entities**: Domain entities (users, orgs, projects, tasks) and migrations will be introduced in future milestones.
- **No Plaintext Secrets**: Never commit `.env` or `.env.*` files.

---

## 🧱 Modular Architecture (Planned Modules)

- `src/database/` - TypeORM & database connectivity
- `src/health/` - Health check endpoints
- `src/auth/` *(future)* - Authentication & Supabase Auth integration
- `src/users/` *(future)* - User profiles & settings
- `src/organizations/` *(future)* - Multi-tenancy & workspace management
- `src/projects/` *(future)* - Project management
- `src/repositories/` *(future)* - Git repository connections
- `src/tasks/` *(future)* - Issue & task tracking
- `src/pull-requests/` *(future)* - PR review & analysis
- `src/deployments/` *(future)* - Deployment tracking
- `src/incidents/` *(future)* - Incident management
- `src/releases/` *(future)* - Release notes
- `src/ai/` *(future)* - AI orchestration & agents
