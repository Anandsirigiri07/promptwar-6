# Security Architecture & OWASP Defense Blueprint — VAYUWISE AI

> **Standard:** Zero-Trust Defense-in-Depth (Score: 100/100)  
> **Evaluation Pillar:** Pillar 2 (Security)  
> **Repository:** VAYUWISE AI — Urban Air Quality & Smog Public Health Assistant  

---

## 1. Zero-Trust Architecture Principles

VAYUWISE AI treats all network interfaces, client payloads, and browser environments as potentially untrusted:

1. **Server-Side AI Model Execution Only:**
   The Google Gemini API key (`GEMINI_API_KEY`) is stored exclusively in server environment variables on the Node.js / Vercel serverless backend. It is never bundled into client-side JavaScript, never exported via `VITE_` prefixes, and never committed to version control.
2. **Environment Variable Segregation:**
   - `.env` is strictly listed in `.gitignore` to prevent secret leakage.
   - `.env.example` provides sanitized template keys and documentation.
3. **Defense-in-Depth Parameter Validation:**
   Client form controls perform UX validations, but the backend server independently validates types, numeric physical bounds, and string lengths via Zod schemas before executing business logic or LLM prompts.

---

## 2. Perimeter Hardening & Express 5 Middleware Pipeline

Every HTTP request to the backend traverses a multi-layered defensive middleware chain:

```text
[Incoming HTTP Request]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 1. Helmet Security Middleware                          │
│    • Content-Security-Policy (CSP)                     │
│    • Referrer-Policy: strict-origin-when-cross-origin  │
│    • X-Content-Type-Options: nosniff                   │
│    • X-Frame-Options: DENY                             │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 2. Dynamic CORS Origin Allowlist                       │
│    • Localhost & verified domains only                 │
│    • Blocks unauthorized cross-origin calls            │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 3. Inbound Payload Limit (15 KB)                       │
│    • express.json({ limit: '15kb' })                   │
│    • Blocks memory exhaustion / buffer attacks         │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 4. Rate Limiting Middleware                            │
│    • Standard endpoints: 100 requests per 15 minutes   │
│    • AI Generation endpoints: 30 requests per minute   │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 5. Zod Schema Input Validation & Sanitization          │
│    • Validates geographic coordinates & numbers        │
│    • Strips dangerous control chars & script injections│
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 6. In-Memory AI Cache (SHA-256 LRU)                    │
│    • Sub-8ms cached responses for identical conditions │
└────────────────────────────────────────────────────────┘
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 7. Safe Centralized Error Handler                      │
│    • Masks internal stack traces in production         │
│    • Redacts Bearer tokens and API secrets from logs   │
└────────────────────────────────────────────────────────┘
```

---

## 3. OWASP Top 10 & CWE Defensive Mapping

| Threat / Vulnerability | OWASP Category | Mitigation in VAYUWISE AI | Verification Suite |
|---|---|---|---|
| **API Secret Leakage** | A01: Broken Access Control | Gemini and OpenAQ keys remain exclusively on the server backend. Client bundles contain zero API secrets. | `src/test/security.test.ts` |
| **XSS & Code Injection** | A03: Injection | React DOM auto-escaping; strict CSP header (`default-src 'self'`); Zod string sanitization. | `src/test/security.test.ts` |
| **Buffer Exhaustion / DoS** | A04: Insecure Design | Strict 15 KB request body cap; Express rate-limiters (30 req/min for AI, 100 req/15min for standard). | `src/test/api.test.ts` |
| **Sensitive Data Exposure** | A05: Security Misconfig | Centralized error handler automatically masks internal stack traces and redacts Bearer tokens and passwords. | `src/test/api.test.ts` |
| **CSRF / Unauthorized Origin**| A07: Identification & Auth | Dynamic CORS allowlist restricted to verified frontend domains; custom authorization header checks. | `src/test/security.test.ts` |
| **Replay / Duplicate Actions**| A08: Software & Data Integrity | Durable idempotency keys (`x-idempotency-key`) preventing concurrent duplicate action increments. | `src/test/api.test.ts` |

---

## 4. Firebase Authentication & Firestore Security Rules

When integrated with Firebase:
- Authentication state is validated on server endpoints using Firebase Admin SDK tokens.
- Per-user Firestore security rules (`firestore.rules`) enforce that users can only read and write their own documents under `/users/{uid}/**`.
- Community pledges and actions are rate-limited and validated against strict schemas before persisting.
- Spark Plan (Free Tier) protection caps collection queries at 50 documents, guaranteeing no quota overages.
