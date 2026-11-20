# VAYUWISE AI — Testing & Quality Assurance Report

## 1. Test Architecture & Tooling

- **Test Runner**: Vitest 3.x
- **Environment**: JSDOM with `@testing-library/jest-dom`
- **Component Testing**: `@testing-library/react` and `@testing-library/user-event`
- **Coverage Engine**: `@vitest/coverage-v8`
- **Continuous Integration**: GitHub Actions CI workflow (`.github/workflows/ci.yml`) running typecheck, lint, test, coverage, and build on push/PR
- **Linting**: Oxlint (`oxlint src server --deny-warnings`)
- **Type Checking**: TypeScript 5.7+ (`tsc --noEmit` across client and server)

---

## 2. Six-Tier Test Coverage Breakdown

| Tier | Test Suite File | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Tier 1** | `calculations.test.ts` | Numerical assertions, safeDivision, boundaries, NaN/Infinity guards | **PASSED** |
| **Tier 1** | `aqi.test.ts` | CPCB & EPA piecewise interpolation for PM2.5, PM10, NO2, CO, O3, SO2; fractional concentration precision; transition gap elimination; minimum 3 pollutants & particulate criteria | **PASSED** |
| **Tier 1** | `meteorology.test.ts` | Thermal inversion indexing, lapse rates, planetary boundary layer sounding, ventilation window advice | **PASSED** |
| **Tier 1** | `routing.test.ts` | Dijkstra graph solver, multi-criteria mode scoring, lowest exposure vs shortest path, N95 attenuation | **PASSED** |
| **Tier 1** | `iaq.test.ts` | CADR, ACH, room volume, dynamic outdoor air conditions, first-order decay clearance times (80% & 95%) | **PASSED** |
| **Tier 1** | `community.test.ts` | Avoided emission calculations (IPCC & CPCB baselines), action recalculation, audit integrity | **PASSED** |
| **Tier 2** | `security.test.ts` | Sanitization against prompt injection, delimiter neutralization, SHA-256 LRU cache, TTL expiry | **PASSED** |
| **Tier 3** | `api.test.ts` | Express REST endpoints (/health, /air-quality, /commute, /iaq), production demo-token rejection, missing token 401, 413 Payload Too Large, secret log redaction, AIService deterministic fallback without key, community action integrity & 404s | **PASSED** |
| **Tier 4** | `rendering.test.tsx` | UI rendering, WCAG 2.2 Twin Representation, SVG tables, Navbar, Sidebar | **PASSED** |
| **Tier 5** | `dom.test.tsx` | User workflows (Onboarding persona selection, room creation, demo auth session) | **PASSED** |

---

## 3. Coverage Enforcement

Coverage is enforced across core computational modules (`src/lib/compute/**`), security middleware (`server/middleware/**`), and server utilities (`server/utils/**`):
- Statements: $\ge 80\%$
- Branches: $\ge 70\%$
- Functions: $\ge 80\%$
- Lines: $\ge 80\%$

Core mathematical computation modules (`aqiBreakpoints.ts`, `dijkstraRouter.ts`, `cadrCalculations.ts`, `commuteDose.ts`, `communityImpact.ts`, `asserts.ts`) achieve 95%+ coverage.
