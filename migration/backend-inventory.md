# Backend Inventory — Next.js to Node.js + Express Migration

## Executive Summary
This document provides a comprehensive inventory of all backend capabilities, services, data models, routes, and external dependencies in the AI Engineering OS application ecosystem. It captures the existing state before migration to ensure 100% feature and behavioral parity in the standalone Node.js + Express backend.

---

## 1. Application & Platform Context
- **Frontend Framework**: Next.js 16.3.5 (App Router), React 19.2.8, Tailwind CSS v4.
- **Current Backend Runtime**: Node.js v20+ with TypeScript 5.8+.
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) policies, triggers, and stored procedures (`handle_new_user`, `is_org_member`, `is_org_admin_or_owner`, `create_organization_with_owner`).
- **Target Backend Architecture**: Standalone Node.js + Express.js layered architecture (Routes -> Controllers -> Services -> Repositories -> Database).

---

## 2. Backend Capabilities Inventory

### 2.1 Core Identity & Authentication
- **Provider**: Supabase Auth (JWT-based session authentication).
- **Token Format**: Bearer JWT passed in `Authorization: Bearer <token>` header.
- **Verification**: Validated against Supabase Auth service via `auth.getUser(token)`.
- **User Attributes**: `id` (UUID matching `auth.users.id`), `email`, `full_name`, `avatar_url`, `role`.
- **User Synchronization**: Trigger `on_auth_user_created` synchronizes `auth.users` rows into `public.users`.

### 2.2 Multi-Tenancy & Organizations
- **Tenancy Model**: Multi-tenant with organization-level scoping.
- **Slug Management**: Unique organization slug identifier (`/organizations/slug`).
- **Atomic Creation**: `create_organization_with_owner` stored procedure ensures that creating an organization and assigning the creator as `OWNER` occurs atomically inside a single database transaction.
- **Role-Based Access Control (RBAC)**:
  - `OWNER`: Full administrative privileges, deletion rights, membership management, integration configuration.
  - `ADMIN`: Membership invites, role modification, integration updates.
  - `MEMBER`: Read-only access to scoped organizational resources.

### 2.3 Organization Memberships
- **Status Lifecycle**: `ACTIVE`, `INVITED`, `SUSPENDED`.
- **Constraints**:
  - Unique composite index `(user_id, organization_id)`.
  - Protection rule: Organization must always have at least one active `OWNER`. Preventing the last owner from being downgraded or removed.

### 2.4 Integrations Management
- **Supported Providers**: `GITHUB`, `GITLAB`, `BITBUCKET`, `JIRA`, `SLACK`.
- **Lifecycle Statuses**: `ACTIVE`, `DISCONNECTED`, `ERROR`.
- **Scoping**: Associated directly with `organization_id`.
- **Sub-entities**: `git_organizations` representing connected Git organizations/accounts per integration.

### 2.5 Health & Diagnostics
- **Endpoints**:
  - `GET /health`: Liveness probe returning process uptime, environment, and status `ok`.
  - `GET /health/db`: Readiness probe measuring PostgreSQL ping latency via lightweight `SELECT NOW()` query.

### 2.6 Domain Data & Services (Frontend API Layer)
Currently abstracted inside `ai-engineering-os-web/lib/services/api.service.ts`:
- **Dashboard**: KPI summary metrics (velocity, risk index, active incidents, AI reliability).
- **Projects**: Project catalog, project details, project repositories.
- **Tasks & Planner**: Global task management, project-scoped tasks, Kanban board stages, roadmap milestones.
- **VCS & Code**: Commits timeline, GitHub pull requests, issues tracking.
- **Observability & Incidents**: Production incidents, severity classification (P0–P3), SLA tracking.
- **Releases**: Release cycle tracking, changelogs, stability metrics.
- **Developer Intelligence**: Workload distribution, PR review load, blocked task indicators.
- **Audit Logs & Security**: Security events, actor identification, IP tracing.
- **Notification Preferences**: Multi-channel alerts (Slack, PagerDuty, Email, Webhook).

---

## 3. Database Layer Specification
- **Engine**: PostgreSQL 15+ (Supabase)
- **Primary Keys**: UUID (`gen_random_uuid()`)
- **Foreign Key Constraints**: Cascade deletes configured on all children of `organizations`.
- **Row Level Security**: Enabled on all core tables with `SECURITY DEFINER` helper functions to avoid recursion:
  - `public.users`
  - `public.organizations`
  - `public.organization_memberships`
  - `public.integrations`
  - `public.git_organizations`

---

## 4. Error Handling & Validation
- **Global Error Format**:
```json
{
  "statusCode": 400,
  "message": "Detailed error message or validation errors array",
  "error": "Bad Request",
  "timestamp": "2026-09-26T14:10:00.000Z"
}
```
- **PostgreSQL Error Code Mapping**:
  - `23505`: 409 Conflict (Unique violation)
  - `23503`: 400 Bad Request (Foreign key violation)
  - `23502`: 400 Bad Request (Missing required column)
  - `22P02`: 400 Bad Request (Invalid UUID or data type)
  - `PGRST116`: 404 Not Found (Row not found)

---

## 5. Security & CORS Specification
- **Allowed Origins**: Configurable via `CORS_ORIGIN` (default `http://localhost:3000`).
- **Credentials**: `true` (supports cookies and authorization headers).
- **Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- **Allowed Headers**: `Content-Type`, `Authorization`, `Accept`.
