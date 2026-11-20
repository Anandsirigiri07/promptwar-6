# VAYUWISE AI — Security Architecture & Threat Model

## 1. Threat Model & Security Boundaries

VAYUWISE AI is designed around a multi-layered **Defense-in-Depth** model:

```
[ Untrusted Client Request ]
             │
             ▼
[ 1. Helmet HTTP Security Headers ]  ── Restrictive CSP, MIME Sniffing protection, no-sniff
             │
             ▼
[ 2. Granular CORS Allowlist ]       ── Explicit ALLOWED_ORIGINS validation
             │
             ▼
[ 3. Request Size Bounding ]         ── 15 KB strict JSON payload limit (prevents payload DOS)
             │
             ▼
[ 4. Express Rate Limiting ]         ── 30 req/min for AI endpoints; 120 req/min for standard APIs
             │
             ▼
[ 5. Zod Strict Schema Validation ]  ── Type guards, range bounds, string clamps, no unexpected keys
             │
             ▼
[ 6. Prompt Injection Guard ]        ── Control character stripping, delimiter neutralization
             │
             ▼
[ 7. Authentication & Token Verify ] ── Firebase Admin ID token verification (UID isolation)
             │
             ▼
[ 8. Centralized Safe Error Handler] ── Internal stacks redacted; generic safe client JSON
```

---

## 2. Content Security Policy (CSP)

Implemented in `server/middleware/security.ts`:

- `default-src`: `'self'`
- `script-src`: `'self'`, `'unsafe-inline'` (development Vite/HMR compatibility)
- `style-src`: `'self'`, `'unsafe-inline'`
- `img-src`: `'self'`, `data:`, `https:`
- `connect-src`: `'self'`, `https://identitytoolkit.googleapis.com`, `https://firestore.googleapis.com`
- `object-src`: `'none'`
- `frame-src`: `'none'`
- `base-uri`: `'self'`

---

## 3. Secret & Credential Protection

- **Server-Side Exclusivity**: `GEMINI_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` reside strictly in server environments.
- **No Client Exposure**: Vite client builds never receive or bundle server-side credentials.
- **Version Control Security**: `.env` and `.env.local` are explicitly excluded in `.gitignore`. A sanitized `.env.example` provides documentation templates without real keys.
- **Log Redaction**: `server/utils/logger.ts` automatically redacts tokens, bearer headers, passwords, and private keys from standard output and error streams.

---

## 4. Prompt Injection & AI Safety Defense

- **Untrusted Input Treatment**: User inputs (persona, activity names, city) are treated as data, never as system instructions.
- **Input Sanitization**: `sanitizeUserInput()` strips non-printable ASCII control characters and neutralizes delimiter injection tokens such as ````system`, `<|im_start|>`, and `<system>`.
- **Structured JSON Schema Enforcement**: Gemini models are queried with `responseMimeType: 'application/json'` and validated against runtime Zod schemas. Any malformed output triggers an automatic fallback to the deterministic engine.
- **No External Execution**: Generated AI outputs never invoke shell commands, database queries, or external network requests.

---

## 5. Firestore Access Rules

Defined in `firestore.rules`:
- Users can only read and write their own private records under `users/{userId}/**`.
- Community aggregates (`communityAggregates/**`) are strictly read-only for clients and writable solely by authorized server backend processes, preventing fraudulent counter inflation.
- Unspecified paths are denied by default (`match /{document=**} { allow read, write: if false; }`).
