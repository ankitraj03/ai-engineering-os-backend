# Frontend Compatibility Report — Next.js to Express Backend

## 1. Overview
This report evaluates the interaction between the Next.js frontend (`ai-engineering-os-web`) and the standalone Node.js + Express backend (`http://localhost:4000`).

---

## 2. API Compatibility Mapping

| Capability | Frontend Consumer (`api.service.ts` or page) | Target Express Endpoint | Method | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Health Liveness | Infra / Monitoring | `/health` | `GET` | Compatible | Returns `{ status: 'ok', timestamp }` |
| Health Readiness | Infra / Monitoring | `/health/db` | `GET` | Compatible | Returns PostgreSQL status & latency |
| User Profile | User Menu / Settings | `/users/me` | `GET` | Compatible | Bearer JWT in `Authorization` header |
| Update Profile | Profile Settings Page | `/users/me` | `PATCH` | Compatible | Body: `{ full_name?, avatar_url? }` |
| Organizations List | Org Switcher Component | `/organizations` | `GET` | Compatible | Returns array of user organizations |
| Create Org | Onboarding / Modal | `/organizations` | `POST` | Compatible | Body: `{ name, slug, logo_url? }` |
| Org Details | Dashboard / Settings | `/organizations/:id` | `GET` | Compatible | Scoped to members |
| Update Org | Org Settings Page | `/organizations/:id` | `PATCH` | Compatible | OWNER or ADMIN |
| Org Members | Team Settings Page | `/organizations/:id/members` | `GET` | Compatible | Returns array of members |
| Invite Member | Team Settings Page | `/organizations/:id/members` | `POST` | Compatible | Body: `{ user_id, role }` |
| Integrations List | Integrations Page | `/organizations/:id/integrations` | `GET` | Compatible | Returns connected providers |
| Connect Integration| Integrations Page | `/organizations/:id/integrations` | `POST` | Compatible | Body: `{ provider, provider_account_id? }` |
| Dashboard KPIs | Dashboard Page | `/dashboard/kpis` | `GET` | Compatible | Velocity, Risk, AI Reliability |
| Projects List | Projects Page | `/projects` | `GET` | Compatible | Catalog of engineering projects |
| Project Detail | Project Overview Page | `/projects/:id` | `GET` | Compatible | Detailed project telemetry |
| Project Tasks | Tasks & Kanban Board | `/projects/:id/tasks` | `GET` | Compatible | Task backlog and stages |
| Incidents | Incidents Page | `/incidents` | `GET` | Compatible | P0-P3 incident tracker |
| Releases | Releases Page | `/releases` | `GET` | Compatible | Deployment and release health |
| Developer Workloads| Developers Page | `/developers/workloads` | `GET` | Compatible | Dev cognitive load and PR backlog |

---

## 3. Network, CORS & Authentication Alignment

### 3.1 Base URL Configuration
The frontend communicates with the backend via environment variable:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
In `ai-engineering-os-web`, client calls can use a configured `ApiClient` pointing to `process.env.NEXT_PUBLIC_API_URL`.

### 3.2 CORS Configuration
The Express backend configures `cors`:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
```
This ensures zero CORS friction with the Next.js dev server on `http://localhost:3000`.

### 3.3 Authentication Header
Next.js client code sends the active Supabase session token in standard format:
```typescript
headers: {
  'Authorization': `Bearer ${supabaseSession.access_token}`,
  'Content-Type': 'application/json'
}
```
Express `authenticate` middleware extracts this token and validates it with Supabase Auth, attaching the user identity to `req.user`.
