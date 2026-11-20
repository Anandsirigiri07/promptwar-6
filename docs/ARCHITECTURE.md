# VAYUWISE AI — System Architecture & Engineering Blueprint

## 1. Executive System Overview

**VAYUWISE AI** ("Breathe Smarter. Live Safer. Build Cleaner Communities.") is a production-grade full-stack generative AI environmental intelligence platform designed to protect families and communities from severe winter smog, atmospheric thermal inversions, and hazardous particulate matter.

The platform combines **deterministic computational physics and environmental science** with **Google Gemini Generative AI (gemini-3.1-flash-lite / gemini-2.5-flash)**, delivering personalized protective schedules, low-emission commute pathfinding, and indoor clean-air engineering.

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION                                 |
|      React 19 • TypeScript (Strict) • Tailwind CSS v4 • Native Accessible SVG Charts  |
+---------------------------------------------------------------------------------------+
|  / (Landing)    /onboarding   /dashboard    /routine   /commute   /indoor-air   /community|
+---------------------------------------------------------------------------------------+
                                           │
                                 HTTPS REST API (JSON)
                                 Bearer ID Tokens
                                           ▼
+---------------------------------------------------------------------------------------+
|                                   EXPRESS 5 BACKEND                                   |
|   Helmet Strict CSP • CORS Allowlist • 15KB Request Bounds • Rate Limiting • Safe Logs|
+---------------------------------------------------------------------------------------+
|  /api/health      /api/air-quality      /api/routine-insights     /api/commute/compare|
|  /api/iaq/calc    /api/community        /api/emergency-advisory   /api/exposure/explain|
+---------------------------------------------------------------------------------------+
           │                                 │                              │
           ▼                                 ▼                              ▼
+-----------------------+       +-------------------------+       +---------------------+
|   DETERMINISTIC MATH  |       |   GOOGLE GEMINI GENAI   |       |  FIREBASE FIRESTORE |
|  CPCB Piecewise AQI   |       |  @google/genai SDK      |       |  Private user trees |
|  Dijkstra Pathfinding |       |  gemini-3.1-flash-lite  |       |  Append-only actions|
|  CADR / ACH Decay     |       |  Zod Structured Schemas |       |  Server aggregates  |
|  Inhaled PM2.5 Dose   |       |  SHA-256 LRU Caching    |       |  Demo Mode Fallback |
+-----------------------+       +-------------------------+       +---------------------+
```

---

## 2. Layer Separation of Concerns

1. **Presentation Layer (`src/pages/`, `src/components/`)**:
   - Strictly separated multi-page routes via React Router (no continuous vertical dump).
   - Twin Representation Rule for WCAG 2.2 AA accessibility (all SVG sparklines and airshed maps have screen-reader table/text companions).
   - Zero hardcoded colors for risk; semantic AQI badges combine numeric rating, category text, and contrast-safe color.

2. **Client State & Services Layer (`src/context/`, `src/hooks/`, `src/services/`)**:
   - `AppContext` orchestrates active zones, household personas, simulation states, and language selection.
   - Decoupled `apiService` handles timeouts, AbortController cancellation, and centralized token injection.
   - `storageService` provides local persistence fallback.

3. **Domain Computation Modules (`src/lib/compute/`)**:
   - 100% pure TypeScript modules without React or external DOM dependencies.
   - Piecewise linear interpolation for CPCB NAQI and US EPA breakpoints.
   - Pure Dijkstra graph solver with multi-modal edge weights factoring in exposure duration and mask filtration.
   - First-order particle decay models for indoor clearance: $C(t) = C_0 \cdot e^{-\lambda t}$.

4. **Server Middleware & Security Layer (`server/middleware/`, `server/validators/`)**:
   - Restrictive Content Security Policy via Helmet.
   - IP and user-bounded express-rate-limiters (30 req/min for AI, 120 req/min for telemetry).
   - Strict Zod schemas validating all incoming bodies and queries; 15 KB payload limits.
   - Centralized error handler ensuring internal stack traces and server credentials are never leaked.

5. **External Providers & Gateways (`server/services/`)**:
   - `aiService`: Integrates official Google `@google/genai` SDK with deterministic fallback engine.
   - `cacheService`: Bounded TTL LRU cache using SHA-256 keys.
   - `firestoreService`: Firebase Admin token verification with automatic in-memory fallback demo mode.
