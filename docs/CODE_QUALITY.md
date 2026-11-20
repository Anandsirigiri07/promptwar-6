# VAYUWISE AI — Code Quality & Engineering Standards

## 1. Architectural Integrity & Layer Separation

The codebase follows a strict modular separation:
- Presentation (`src/components/`, `src/pages/`)
- Client State (`src/context/`, `src/hooks/`)
- Pure Domain Computation (`src/lib/compute/`)
- Backend Services & Routes (`server/routes/`, `server/services/`)
- Validation Schemas (`server/validators/`)

Files are kept concise and focused (generally under 250 lines per module), avoiding single-file monoliths.

---

## 2. TypeScript Strictness

Both `tsconfig.json` (frontend) and `tsconfig.server.json` (backend) enforce strict compiler rules:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedIndexedAccess: true`
- Zero unjustified `any` types; all API contracts and data models are strictly typed via TypeScript and Zod.

---

## 3. Zero Lint Warnings (Oxlint)

The project utilizes `oxlint` with `--deny-warnings` active:
- 0 errors, 0 warnings across all 69 source files.
- Enforces strict equality (`eqeqeq`), unused variable pruning, and clean regex definitions.

---

## 4. Error Handling Standards

- All server endpoints are wrapped with centralized error propagation (`next(err)`).
- `server/middleware/errorHandler.ts` catches unhandled exceptions, logs structured error contexts internally, and returns uniform JSON responses:
  ```json
  {
    "success": false,
    "error": "User-friendly sanitized message",
    "timestamp": "2026-11-20T12:00:00.000Z"
  }
  ```
- Clients receive `ApiError` instances with parsed status codes, preventing blank white screens.
