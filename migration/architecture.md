# Target Architecture — Node.js + Express Backend

## 1. Architectural Philosophy
The target backend adopts a clean layered architecture designed specifically for Node.js + Express:
- **Separation of Concerns**: HTTP parsing and status codes stay in **Controllers**; business rules and orchestration stay in **Services**; database queries stay in **Repositories**; transport contracts are defined in **Routes** and validated via **Validators**.
- **No Unused Abstractions**: Simple, testable TypeScript classes and functions without heavyweight framework decorators or reflection overhead.
- **Fail-Fast Validation**: Incoming requests are validated at the route boundary before reaching controllers or services.
- **Centralized Error Handling**: Unhandled exceptions bubble to a unified error handler that maps PostgreSQL/PostgREST codes to appropriate HTTP error responses.

---

## 2. Directory Structure

```text
backend/
├── src/
│   ├── config/              # Environment config, Supabase config, database pool config
│   │   ├── env.config.ts
│   │   └── supabase.config.ts
│   │
│   ├── db/                  # Database connections (pg Pool, Supabase client)
│   │   ├── postgres.ts
│   │   └── supabase.ts
│   │
│   ├── middleware/          # Express middlewares (auth, rbac, error-handling, request-logger)
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── error-handler.ts
│   │   └── request-logger.ts
│   │
│   ├── validators/          # Request validation schemas (Zod or class-validator)
│   │   ├── user.validator.ts
│   │   ├── organization.validator.ts
│   │   ├── membership.validator.ts
│   │   └── integration.validator.ts
│   │
│   ├── models/              # TypeScript interfaces and entity types
│   │   ├── user.model.ts
│   │   ├── organization.model.ts
│   │   ├── membership.model.ts
│   │   └── integration.model.ts
│   │
│   ├── repositories/        # Database access layer (Supabase PostgREST & pg queries)
│   │   ├── user.repository.ts
│   │   ├── organization.repository.ts
│   │   ├── membership.repository.ts
│   │   ├── integration.repository.ts
│   │   └── git-organization.repository.ts
│   │
│   ├── services/            # Pure business logic and domain rules
│   │   ├── user.service.ts
│   │   ├── organization.service.ts
│   │   ├── membership.service.ts
│   │   ├── integration.service.ts
│   │   ├── git-organization.service.ts
│   │   └── intelligence.service.ts
│   │
│   ├── controllers/         # HTTP request/response handlers
│   │   ├── health.controller.ts
│   │   ├── user.controller.ts
│   │   ├── organization.controller.ts
│   │   ├── membership.controller.ts
│   │   ├── integration.controller.ts
│   │   ├── git-organization.controller.ts
│   │   └── intelligence.controller.ts
│   │
│   ├── routes/              # Express router definitions
│   │   ├── health.routes.ts
│   │   ├── user.routes.ts
│   │   ├── organization.routes.ts
│   │   ├── integration.routes.ts
│   │   ├── intelligence.routes.ts
│   │   └── index.ts
│   │
│   ├── utils/               # Error classes, response helpers, logger
│   │   ├── app-error.ts
│   │   ├── database-error.ts
│   │   └── logger.ts
│   │
│   ├── app.ts               # Express application initialization & middleware stack
│   └── server.ts            # Server entry point & graceful shutdown
│
├── tests/                   # Parity, unit, and integration tests
│   ├── integration/
│   ├── unit/
│   └── verify-parity.ts
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Layer Interactions & Flow

```text
Incoming HTTP Request
       │
       ▼
Express App (app.ts)
       │  [cors, helmet, express.json, requestLogger]
       ▼
Express Route (e.g., organization.routes.ts)
       │  [authenticate] -> [authorize(OWNER, ADMIN)] -> [validate(createOrgSchema)]
       ▼
Controller (organization.controller.ts)
       │  - Unpacks req.body, req.params, req.user
       │  - Calls service
       ▼
Service (organization.service.ts)
       │  - Enforces domain rules (slug collisions, business logic)
       │  - Calls repository
       ▼
Repository (organization.repository.ts)
       │  - Performs Supabase PostgREST query or pg pool query
       ▼
Supabase PostgreSQL Database
```

---

## 4. Middleware Design

### 4.1 Authentication Middleware (`authenticate.ts`)
- Extracts `Authorization: Bearer <token>`.
- Calls `supabase.auth.getUser(token)`.
- On success: Attaches `req.user = { id, email, fullName, avatarUrl, role }` and proceeds with `next()`.
- On failure: Returns `401 Unauthorized`.

### 4.2 Authorization Middleware (`authorize.ts`)
- Takes required roles: `authorize(MembershipRole.OWNER, MembershipRole.ADMIN)`.
- Resolves `organizationId` from `req.params.organizationId || req.params.id || req.body.organization_id`.
- Queries `organization_memberships` for `(organization_id, user_id)` with `status = 'ACTIVE'`.
- On insufficient role: Returns `403 Forbidden`.
- On success: Attaches `req.membership` and proceeds.

### 4.3 Centralized Error Handler (`error-handler.ts`)
- Catches known `AppError` instances (BadRequest, Unauthorized, Forbidden, NotFound, Conflict) and returns structured JSON.
- Catches database errors and maps PostgreSQL codes (`23505` -> 409, `23503` -> 400, `PGRST116` -> 404).
- Catches unexpected errors, logs full stack traces securely, and returns `500 Internal Server Error`.
