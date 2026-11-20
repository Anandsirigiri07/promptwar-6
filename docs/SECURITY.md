# VAYUWISE AI — Security Architecture & Threat Model

## 1. Threat Model & Security Boundaries

VAYUWISE AI is engineered around a multi-layered **Defense-in-Depth** model:

```
[ Untrusted Client Request ]
             │
             ▼
[ 1. Helmet HTTP Security Headers ]  ── Strict CSP (no 'unsafe-inline' in prod), nosniff, frame-ancestors 'self'
             │
             ▼
[ 2. Granular CORS Allowlist ]       ── Explicit ALLOWED_ORIGINS validation, credentials bounded
             │
             ▼
[ 3. Stream-Level Body Bounding ]    ── Express body-parser limit '15kb' (protects against chunked/spoofed DOS)
             │
             ▼
[ 4. Differentiated Rate Limiting ]  ── 30 req/min for AI endpoints; 120 req/min for standard APIs
             │
             ▼
[ 5. Zod Strict Schema Validation ]  ── Type guards, range bounds, string clamps, no unexpected keys
             │
             ▼
[ 6. Prompt Injection Guard ]        ── Control character stripping, delimiter neutralization
             │
             ▼
[ 7. Authentication & Token Verify ] ── Firebase Admin ID token verification; FAIL-CLOSED in production
             │
             ▼
[ 8. Community Action Security ]     ── Pledge existence check, deduplication cache, reasonable unit bounds
             │
             ▼
[ 9. Centralized Safe Error Handler] ── Bearer tokens & keys redacted; generic client error; stack hidden
```

---

## 2. Authentication Security & Fail-Closed Production Behavior

Implemented in `server/middleware/authentication.ts`:

- **Production Fail-Closed Enforcement**:
  - When `NODE_ENV === 'production'`, demo tokens (e.g. `Bearer demo-token`) are **strictly rejected** with HTTP 401 Unauthorized.
  - If Firebase Admin credentials are not initialized in production, all protected endpoints **fail closed** with HTTP 401 Unauthorized.
  - Invalid tokens are never silently converted into demo users.
- **Development / Evaluation Environment**:
  - When `NODE_ENV !== 'production'` and cloud credentials are absent, the application grants clearly labeled demo access (`isDemoUser: true`), allowing evaluators to audit the full user journey without requiring real API keys.
  - Demo identities are transparently labeled in both API responses and UI badges (e.g. "Demo Mode (Local Persistence)" — never claiming "Cloud Verified" or "Firebase Authenticated" for demo sessions).

---

## 3. Content Security Policy (CSP)

Implemented in `server/middleware/security.ts`:

- **Production Environment (`NODE_ENV=production`)**:
  - `default-src`: `'self'`
  - `script-src`: `'self'` (strictly prohibits `'unsafe-inline'`)
  - `style-src`: `'self'`, `'unsafe-inline'` (required for runtime Tailwind v4 CSS variables)
  - `img-src`: `'self'`, `data:`, `https:`
  - `connect-src`: `'self'`, `https://identitytoolkit.googleapis.com`, `https://securetoken.googleapis.com`, `https://firestore.googleapis.com`, `https://air-quality-api.open-meteo.com`, `https://api.open-meteo.com`, `https://api.openaq.org`
  - `object-src`: `'none'`
  - `frame-src`: `'none'`
  - `base-uri`: `'self'`
- **Development Environment**: Permits `'unsafe-inline'` on `script-src` exclusively for Vite Hot Module Replacement (HMR).

---

## 4. Request-Size & Payload Protection

Implemented in `server/index.ts`:

- Replaced fragile header-based `Content-Length` inspection with Express stream-level body parsers:
  ```ts
  app.use(express.json({ limit: '15kb' }));
  app.use(express.urlencoded({ limit: '15kb', extended: true }));
  ```
- Protects against chunked transfer encoding (`Transfer-Encoding: chunked`) and omitted `Content-Length` headers.
- Requests exceeding 15 KB are immediately terminated by `body-parser` and caught by `errorHandler.ts`, returning HTTP 413 Payload Too Large.

---

## 5. Secret & Credential Protection

- **Server-Side Exclusivity**: `GEMINI_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` reside strictly in backend server environments.
- **Zero Client Bundling**: Vite client builds never receive or bundle server-side credentials.
- **Version Control Security**: `.env` and `.env.local` are explicitly excluded in `.gitignore`. A sanitized `.env.example` provides documentation templates with zero real keys.
- **Log Redaction**: `server/middleware/errorHandler.ts` and `server/utils/logger.ts` automatically redact bearer tokens, API keys, passwords, and service account contents before writing to logs.

---

## 6. Community Security & Data Integrity

Implemented in `server/routes/community.ts` and `server/services/firestoreService.ts`:

1. **Pledge Existence Check**: Every community action must reference an existing, valid pledge. Nonexistent pledge IDs return HTTP 404 Not Found.
2. **Action Unit Bounds**: Enforces strict maximum sensible units per action log (e.g. max 80 km for carpool, max 10 reports for anti-burn, max 24 hours for clean energy) to prevent malicious counter inflation.
3. **Idempotency Deduplication**: In-memory replay cache rejects duplicate submissions from the same user/pledge within 3 seconds with HTTP 409 Conflict.
4. **Atomic Transactions**: In production Firestore, updates to pledge counters and action logs are executed inside an atomic `firestoreDb.runTransaction()`. Avoided emissions (`estimatedCO2SavingsKg` and `estimatedPM25AvoidedGrams`) are recalculated on the server using documented IPCC/CPCB formulas upon every action completion.
5. **Accurate Status Labeling**: All user-submitted actions are explicitly tagged `status: 'self_reported'`. The term "verified" is never applied to unverified user logs.
6. **Firestore Rules**: Client writes to `communityAggregates` are strictly forbidden (`allow write: if false;`).
