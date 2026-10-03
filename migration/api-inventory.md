# API Inventory — Next.js to Node.js + Express Migration

## Overview
This document catalogs every API endpoint required for the AI Engineering OS backend. Every migrated endpoint in the Node.js + Express backend must adhere exactly to the contracts specified below.

---

## 1. Health & Diagnostic Endpoints

### 1.1 Health Liveness
- **Method**: `GET`
- **Route**: `/health`
- **Authentication**: None
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-09-26T14:15:00.000Z"
}
```

### 1.2 Health Readiness (Database Connectivity)
- **Method**: `GET`
- **Route**: `/health/db`
- **Authentication**: None
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "database": "postgresql",
  "timestamp": "2026-09-26T14:15:00.000Z",
  "latencyMs": 32,
  "serverTime": "2026-09-26T14:15:00.000Z",
  "version": "PostgreSQL 15.8 on x86_64-pc-linux-gnu..."
}
```
- **Error Response**: `503 Service Unavailable`
```json
{
  "status": "unhealthy",
  "database": "postgresql",
  "timestamp": "2026-09-26T14:15:00.000Z",
  "latencyMs": 5000,
  "error": "Connection timed out"
}
```

---

## 2. Users API

### 2.1 Get Current User Profile
- **Method**: `GET`
- **Route**: `/users/me`
- **Authentication**: Required (`Bearer <JWT>`)
- **Response**: `200 OK`
```json
{
  "id": "e0b9687c-2b22-441d-937b-5c4bb81f7ba9",
  "email": "developer@acme.ai",
  "full_name": "Jane Developer",
  "avatar_url": "https://avatars.githubusercontent.com/u/12345",
  "created_at": "2026-09-22T10:00:00.000Z",
  "updated_at": "2026-09-22T10:00:00.000Z"
}
```
- **Errors**: `401 Unauthorized`

### 2.2 Update Current User Profile
- **Method**: `PATCH`
- **Route**: `/users/me`
- **Authentication**: Required (`Bearer <JWT>`)
- **Request Body**:
```json
{
  "full_name": "Jane Doe",
  "avatar_url": "https://example.com/avatar.png"
}
```
- **Response**: `200 OK` (returns updated User object)
- **Errors**: `400 Bad Request`, `401 Unauthorized`

### 2.3 Get User by ID
- **Method**: `GET`
- **Route**: `/users/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Path Parameters**: `id` (UUID)
- **Response**: `200 OK` (returns User object)
- **Errors**: `400 Bad Request` (invalid UUID), `401 Unauthorized`, `404 Not Found`

---

## 3. Organizations API

### 3.1 Create Organization
- **Method**: `POST`
- **Route**: `/organizations`
- **Authentication**: Required (`Bearer <JWT>`)
- **Request Body**:
```json
{
  "name": "Acme Engineering",
  "slug": "acme-engineering",
  "logo_url": "https://example.com/logo.png"
}
```
- **Side Effects**: Atomically creates organization and inserts requesting user as `OWNER`.
- **Response**: `201 Created`
```json
{
  "id": "2d1b8214-4fb4-45aa-bbde-ee5d14df9eb3",
  "name": "Acme Engineering",
  "slug": "acme-engineering",
  "logo_url": "https://example.com/logo.png",
  "role": "OWNER",
  "created_at": "2026-09-26T14:15:00.000Z",
  "updated_at": "2026-09-26T14:15:00.000Z"
}
```
- **Errors**: `400 Bad Request`, `401 Unauthorized`, `409 Conflict` (slug already taken)

### 3.2 List User Organizations
- **Method**: `GET`
- **Route**: `/organizations`
- **Authentication**: Required (`Bearer <JWT>`)
- **Response**: `200 OK`
```json
[
  {
    "id": "2d1b8214-4fb4-45aa-bbde-ee5d14df9eb3",
    "name": "Acme Engineering",
    "slug": "acme-engineering",
    "logo_url": "https://example.com/logo.png",
    "role": "OWNER",
    "created_at": "2026-09-26T14:15:00.000Z",
    "updated_at": "2026-09-26T14:15:00.000Z"
  }
]
```

### 3.3 Get Organization by ID
- **Method**: `GET`
- **Route**: `/organizations/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: Scoped to members (`OWNER`, `ADMIN`, `MEMBER`)
- **Path Parameters**: `id` (UUID)
- **Response**: `200 OK`
- **Errors**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

### 3.4 Update Organization
- **Method**: `PATCH`
- **Route**: `/organizations/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER` or `ADMIN`
- **Path Parameters**: `id` (UUID)
- **Request Body**:
```json
{
  "name": "Updated Org Name",
  "slug": "updated-slug",
  "logo_url": "https://example.com/new-logo.png"
}
```
- **Response**: `200 OK`
- **Errors**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`

### 3.5 Delete Organization
- **Method**: `DELETE`
- **Route**: `/organizations/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER` only
- **Path Parameters**: `id` (UUID)
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Organization \"2d1b8214-...\" has been deleted"
}
```
- **Errors**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

## 4. Organization Memberships API

### 4.1 Add / Invite Member
- **Method**: `POST`
- **Route**: `/organizations/:id/members`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER` or `ADMIN`
- **Path Parameters**: `id` (UUID of organization)
- **Request Body**:
```json
{
  "user_id": "f5e18239-1234-45aa-bbde-ee5d14df9eb3",
  "role": "MEMBER"
}
```
- **Response**: `201 Created`
- **Errors**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict` (user already a member)

### 4.2 List Organization Members
- **Method**: `GET`
- **Route**: `/organizations/:id/members`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER`, `ADMIN`, or `MEMBER`
- **Response**: `200 OK` (Array of members with joined user profiles)

### 4.3 Get Member Details
- **Method**: `GET`
- **Route**: `/organizations/:id/members/:memberId`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER`, `ADMIN`, or `MEMBER`
- **Response**: `200 OK`

### 4.4 Update Member Role
- **Method**: `PATCH`
- **Route**: `/organizations/:id/members/:memberId/role`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER` or `ADMIN`
- **Request Body**:
```json
{
  "role": "ADMIN"
}
```
- **Constraint**: Cannot demote the last remaining `OWNER`.
- **Response**: `200 OK`
- **Errors**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

### 4.5 Update Member Status
- **Method**: `PATCH`
- **Route**: `/organizations/:id/members/:memberId/status`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER` or `ADMIN`
- **Request Body**:
```json
{
  "status": "SUSPENDED"
}
```
- **Response**: `200 OK`

### 4.6 Remove Member
- **Method**: `DELETE`
- **Route**: `/organizations/:id/members/:memberId`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER` or `ADMIN`
- **Constraint**: Cannot delete the last remaining `OWNER`.
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Member \"...\" removed from organization"
}
```

---

## 5. Integrations API

### 5.1 Connect Integration
- **Method**: `POST`
- **Route**: `/organizations/:id/integrations`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER` or `ADMIN`
- **Request Body**:
```json
{
  "provider": "GITHUB",
  "provider_account_id": "org-github-acme"
}
```
- **Response**: `201 Created`

### 5.2 List Integrations for Organization
- **Method**: `GET`
- **Route**: `/organizations/:id/integrations`
- **Authentication**: Required (`Bearer <JWT>`)
- **Authorization**: `OWNER`, `ADMIN`, or `MEMBER`
- **Response**: `200 OK` (Array of integrations)

### 5.3 Get Integration by ID
- **Method**: `GET`
- **Route**: `/integrations/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Response**: `200 OK`

### 5.4 Update Integration Status
- **Method**: `PATCH`
- **Route**: `/integrations/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Request Body**:
```json
{
  "status": "DISCONNECTED"
}
```
- **Response**: `200 OK`

### 5.5 Delete Integration
- **Method**: `DELETE`
- **Route**: `/integrations/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Response**: `200 OK`

---

## 6. Git Organizations API

### 6.1 Link Git Organization
- **Method**: `POST`
- **Route**: `/integrations/:id/git-organizations`
- **Authentication**: Required (`Bearer <JWT>`)
- **Request Body**:
```json
{
  "external_id": "1234567",
  "login": "acme-corp",
  "name": "Acme Corporation",
  "avatar_url": "https://avatars.githubusercontent.com/u/1234567"
}
```
- **Response**: `201 Created`
- **Errors**: `409 Conflict` (if already linked to this integration)

### 6.2 List Git Organizations by Integration
- **Method**: `GET`
- **Route**: `/integrations/:id/git-organizations`
- **Authentication**: Required (`Bearer <JWT>`)
- **Response**: `200 OK`

### 6.3 Get Git Organization by ID
- **Method**: `GET`
- **Route**: `/git-organizations/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Response**: `200 OK`

### 6.4 Update Git Organization
- **Method**: `PATCH`
- **Route**: `/git-organizations/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Request Body**:
```json
{
  "name": "Updated Org Name",
  "avatar_url": "https://example.com/avatar.png"
}
```
- **Response**: `200 OK`

### 6.5 Delete Git Organization Link
- **Method**: `DELETE`
- **Route**: `/git-organizations/:id`
- **Authentication**: Required (`Bearer <JWT>`)
- **Response**: `200 OK`

---

## 7. Frontend Integration / Domain Intelligence Endpoints

### 7.1 Dashboard KPIs
- **Method**: `GET`
- **Route**: `/dashboard/kpis`
- **Authentication**: Required
- **Response**: `200 OK` (Velocity, risk index, incidents count, AI reliability stats)

### 7.2 Projects
- **Method**: `GET`
- **Route**: `/projects`
- **Response**: `200 OK` (Array of projects)
- **Method**: `GET`
- **Route**: `/projects/:id`
- **Response**: `200 OK` (Project details)

### 7.3 Tasks
- **Method**: `GET`
- **Route**: `/tasks`
- **Response**: `200 OK` (Global project tasks)
- **Method**: `GET`
- **Route**: `/projects/:id/tasks`
- **Response**: `200 OK` (Project-specific tasks)

### 7.4 Developer Workloads & Intelligence
- **Method**: `GET`
- **Route**: `/developers/workloads`
- **Response**: `200 OK` (Active tasks, PR review load, workload %)

### 7.5 Incidents & Releases
- **Method**: `GET`
- **Route**: `/incidents`
- **Response**: `200 OK` (Detailed incidents list)
- **Method**: `GET`
- **Route**: `/releases`
- **Response**: `200 OK` (Releases list)
