# Migration Status Tracker

## Metrics Summary
- **Total endpoints identified**: 30
- **Migrated**: 30
- **Pending**: 0
- **Failed**: 0
- **Tested**: 30
- **Verified**: 30
- **Parity Test Suite**: 63/63 tests passed (100%)

---

## Detailed Endpoint Breakdown

| Module | Method | Endpoint | Status | Tested | Verified | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` | Migrated | Yes | Yes | Liveness probe (200 OK) |
| **Health** | `GET` | `/health/db` | Migrated | Yes | Yes | DB ping latency & version (200 OK / 503) |
| **Users** | `GET` | `/users/me` | Migrated | Yes | Yes | Supabase JWT Bearer required (401 enforced) |
| **Users** | `PATCH` | `/users/me` | Migrated | Yes | Yes | Profile update validated |
| **Users** | `GET` | `/users/:id` | Migrated | Yes | Yes | UUID validated lookup |
| **Organizations** | `POST` | `/organizations` | Migrated | Yes | Yes | Atomic owner creation via Postgres RPC |
| **Organizations** | `GET` | `/organizations` | Migrated | Yes | Yes | List user orgs with roles |
| **Organizations** | `GET` | `/organizations/:id` | Migrated | Yes | Yes | Scoped to members (OWNER, ADMIN, MEMBER) |
| **Organizations** | `PATCH` | `/organizations/:id` | Migrated | Yes | Yes | OWNER / ADMIN with slug collision check |
| **Organizations** | `DELETE` | `/organizations/:id` | Migrated | Yes | Yes | OWNER only |
| **Memberships** | `POST` | `/organizations/:id/members` | Migrated | Yes | Yes | Invite member (OWNER / ADMIN) |
| **Memberships** | `GET` | `/organizations/:id/members` | Migrated | Yes | Yes | List members with user profiles |
| **Memberships** | `GET` | `/organizations/:id/members/:memberId` | Migrated | Yes | Yes | Member detail |
| **Memberships** | `PATCH` | `/organizations/:id/members/:memberId/role` | Migrated | Yes | Yes | Last owner demotion protection |
| **Memberships** | `PATCH` | `/organizations/:id/members/:memberId/status` | Migrated | Yes | Yes | Last owner suspension protection |
| **Memberships** | `DELETE` | `/organizations/:id/members/:memberId` | Migrated | Yes | Yes | Last owner removal protection |
| **Integrations** | `POST` | `/organizations/:id/integrations` | Migrated | Yes | Yes | Add integration (duplicate check) |
| **Integrations** | `GET` | `/organizations/:id/integrations` | Migrated | Yes | Yes | List integrations |
| **Integrations** | `GET` | `/integrations/:id` | Migrated | Yes | Yes | Integration detail |
| **Integrations** | `PATCH` | `/integrations/:id` | Migrated | Yes | Yes | Update status |
| **Integrations** | `DELETE` | `/integrations/:id` | Migrated | Yes | Yes | Remove integration |
| **Git Orgs** | `POST` | `/integrations/:id/git-organizations` | Migrated | Yes | Yes | Link external git org (duplicate external check) |
| **Git Orgs** | `GET` | `/integrations/:id/git-organizations` | Migrated | Yes | Yes | List linked orgs |
| **Git Orgs** | `GET` | `/git-organizations/:id` | Migrated | Yes | Yes | Org link detail |
| **Git Orgs** | `PATCH` | `/git-organizations/:id` | Migrated | Yes | Yes | Update git org link |
| **Git Orgs** | `DELETE` | `/git-organizations/:id` | Migrated | Yes | Yes | Remove git org link |
| **Intelligence** | `GET` | `/dashboard/kpis` | Migrated | Yes | Yes | Dashboard telemetry (velocity, riskIndex) |
| **Intelligence** | `GET` | `/projects` | Migrated | Yes | Yes | Projects catalog |
| **Intelligence** | `GET` | `/projects/:id` | Migrated | Yes | Yes | Single project detail |
| **Intelligence** | `GET` | `/developers/workloads` | Migrated | Yes | Yes | Developer workload metrics |
