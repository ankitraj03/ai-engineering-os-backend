# Migration Plan — Next.js to Node.js + Express Backend

## 1. Objectives & Guardrails
- **Primary Goal**: Complete migration from Next.js backend layer to a clean, maintainable standalone Node.js + Express backend.
- **Contract Preservation**: All HTTP methods, routes, request bodies, query params, headers, and status codes are preserved without breaking changes.
- **Zero Loss of Functionality**: Every domain capability (Users, Organizations, Memberships, Integrations, Git Orgs, Health, Intelligence) is completely migrated.
- **Rollback Safety**: The migration is performed on branch `migration/nextjs-to-express`, preserving `main` baseline until parity testing is completed.

---

## 2. Multi-Agent Execution Phases

### Phase 1: Repository Analysis & Inventories [COMPLETED]
- [x] Analyze existing Next.js frontend structure and dependencies.
- [x] Inspect existing database migrations and Supabase PostgreSQL schema.
- [x] Inspect existing backend modules, decorators, guards, and test suites.
- [x] Generate `migration/backend-inventory.md`.
- [x] Generate `migration/api-inventory.md`.
- [x] Generate `migration/dependency-map.md`.

### Phase 2: Express Architecture Setup & Git Safety [IN PROGRESS]
- [x] Configure git repository and create GitHub public repo `ankitraj03/ai-engineering-os-backend`.
- [x] Create and checkout branch `migration/nextjs-to-express`.
- [x] Design Express layered architecture in `migration/architecture.md`.
- [ ] Configure `package.json` with Express dependencies (`express`, `cors`, `helmet`, `morgan`, `zod`).
- [ ] Create `src/config/`, `src/db/`, and `src/utils/`.

### Phase 3: Database & Supabase Layer
- [ ] Implement `src/db/supabase.ts` (Supabase client factory and admin client).
- [ ] Implement `src/db/postgres.ts` (PostgreSQL connection pool for direct SQL & health checks).
- [ ] Implement `src/utils/database-error.ts` (PostgreSQL / PostgREST error mapper).

### Phase 4: Authentication & Authorization Middleware
- [ ] Implement `src/middleware/authenticate.ts` (Supabase JWT verification).
- [ ] Implement `src/middleware/authorize.ts` (Organization role guard for OWNER, ADMIN, MEMBER).
- [ ] Implement `src/middleware/error-handler.ts` (Centralized error handler).

### Phase 5: Repositories & Models
- [ ] Implement `src/repositories/user.repository.ts`
- [ ] Implement `src/repositories/organization.repository.ts`
- [ ] Implement `src/repositories/membership.repository.ts`
- [ ] Implement `src/repositories/integration.repository.ts`
- [ ] Implement `src/repositories/git-organization.repository.ts`

### Phase 6: Services (Business Logic)
- [ ] Implement `src/services/user.service.ts`
- [ ] Implement `src/services/organization.service.ts` (slug validation, atomic owner creation)
- [ ] Implement `src/services/membership.service.ts` (single owner protection, role checks)
- [ ] Implement `src/services/integration.service.ts`
- [ ] Implement `src/services/git-organization.service.ts`
- [ ] Implement `src/services/intelligence.service.ts` (projects, tasks, KPIs, incidents, releases)

### Phase 7: Validators, Controllers & Routes
- [ ] Implement request validators (Zod schemas for DTOs)
- [ ] Implement controllers for each domain
- [ ] Implement Express routers and mount on `src/routes/index.ts`
- [ ] Assemble `src/app.ts` and `src/server.ts`

### Phase 8: Testing & Parity Verification
- [ ] Create test suite `tests/verify-parity.ts` covering:
  - Repository methods and data access
  - Error mapping (23505, 23503, PGRST116, etc.)
  - Business rules (slug collision, duplicate membership, last owner safety)
  - Endpoints with Supertest / Express app
- [ ] Run test suite and achieve 100% pass rate.
- [ ] Verify TypeScript build (`npm run build`).

### Phase 9: Frontend Compatibility & Final Reporting
- [ ] Document frontend compatibility in `migration/compatibility-report.md`.
- [ ] Update `migration/migration-status.md`.
- [ ] Generate comprehensive `migration/final-report.md`.
