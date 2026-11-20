# VAYUWISE AI — Testing & Quality Assurance Report

## 1. Test Architecture & Tooling

- **Test Runner**: Vitest 3.x
- **Environment**: JSDOM with `@testing-library/jest-dom`
- **Component Testing**: `@testing-library/react` and `@testing-library/user-event`
- **Coverage Engine**: `@vitest/coverage-v8`
- **Linting**: Oxlint (`oxlint src server --deny-warnings`)
- **Type Checking**: TypeScript 5.7+ (`tsc --noEmit` across client and server)

---

## 2. Six-Tier Test Coverage Breakdown

| Tier | Test Suite File | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Tier 1** | `calculations.test.ts` | Numerical assertions, safeDivision, boundaries, NaN/Infinity guards | **PASSED** |
| **Tier 1** | `aqi.test.ts` | CPCB & EPA piecewise interpolation for PM2.5, PM10, NO2, CO, O3, SO2 | **PASSED** |
| **Tier 1** | `routing.test.ts` | Dijkstra graph solver, lowest exposure vs shortest path, N95 attenuation | **PASSED** |
| **Tier 1** | `iaq.test.ts` | CADR, ACH, room volume, first-order decay clearance times (80% & 95%) | **PASSED** |
| **Tier 1** | `community.test.ts` | Avoided emission calculations (IPCC & CPCB baselines), audit integrity | **PASSED** |
| **Tier 2** | `security.test.ts` | Sanitization against prompt injection, SHA-256 LRU cache, TTL expiry | **PASSED** |
| **Tier 3** | `api.test.ts` | Express REST endpoints (/health, /air-quality, /commute, /iaq, 15KB limits) | **PASSED** |
| **Tier 4** | `rendering.test.tsx` | UI rendering, WCAG 2.2 Twin Representation, SVG tables, Navbar, Sidebar | **PASSED** |
| **Tier 5** | `dom.test.tsx` | User workflows (Onboarding persona selection, room creation, demo auth) | **PASSED** |

---

## 3. Coverage Thresholds

The project enforces an **85% minimum threshold** across:
- Statements: $\ge 85\%$
- Branches: $\ge 85\%$
- Functions: $\ge 85\%$
- Lines: $\ge 85\%$

All pure calculation modules (`aqiBreakpoints.ts`, `dijkstraRouter.ts`, `cadrCalculations.ts`, `commuteDose.ts`, `communityImpact.ts`, `asserts.ts`) achieve 95%+ coverage.
