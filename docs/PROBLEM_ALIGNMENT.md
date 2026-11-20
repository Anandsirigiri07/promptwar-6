# VAYUWISE AI — Problem Statement Traceability Matrix

This matrix maps every mandate from the Hack2Skill Challenge 6 problem statement to the concrete implementation files, algorithmic models, API endpoints, test suites, and verification status.

| # | Challenge Requirement | Implementation File | Algorithm / API / Model | Test Suite | Status |
| :- | :-------------------- | :------------------ | :---------------------- | :--------- | :----- |
| **1** | Low-emission daily routines | `src/pages/RoutinePage.tsx`, `server/services/aiService.ts` | `POST /api/routine-insights` (Gemini + Deterministic Inversion Engine) | `rendering.test.tsx`, `dom.test.tsx` | **VERIFIED** |
| **2** | Safer outdoor activity windows | `server/routes/routines.ts`, `src/lib/compute/meteorology.ts` | Planetary boundary layer sounding & thermal inversion evaluation | `aqi.test.ts`, `api.test.ts` | **VERIFIED** |
| **3** | Practical indoor air solutions (CADR/DIY) | `src/pages/IndoorAirPage.tsx`, `src/lib/compute/cadrCalculations.ts` | Room volume, ACH, CADR deficit, Corsi-Rosenthal DIY box filter blueprint | `iaq.test.ts`, `dom.test.tsx` | **VERIFIED** |
| **4** | Multi-modal sustainable transit optimizer | `src/pages/CommutePage.tsx`, `src/lib/compute/dijkstraRouter.ts` | Pure Dijkstra multi-modal graph pathfinding weighted by exposure | `routing.test.ts`, `api.test.ts` | **VERIFIED** |
| **5** | Quantified direct exposure calculation | `src/lib/compute/commuteDose.ts`, `server/routes/routines.ts` | Inhaled PM2.5 Dose: $\text{Conc} \times t \times \text{VentRate} \times (1 - \eta_{\text{filter}})$ | `routing.test.ts`, `api.test.ts` | **VERIFIED** |
| **6** | Protection for 8 vulnerable personas | `src/lib/constants.ts`, `src/pages/OnboardingPage.tsx` | Profiles for Infant, Child, Senior, Asthmatic, Commuter, Cyclist, Student, Champion | `dom.test.tsx`, `rendering.test.tsx` | **VERIFIED** |
| **7** | Understandable emergency advisories | `src/pages/AdvisoriesPage.tsx`, `server/routes/advisories.ts` | `POST /api/emergency-advisory` (5 languages: EN, HI, KN, AR-RTL, ES) | `api.test.ts`, `rendering.test.tsx` | **VERIFIED** |
| **8** | Measurable community action & pledges | `src/pages/CommunityPage.tsx`, `src/lib/compute/communityImpact.ts` | Server-side aggregate counters (IPCC/CPCB avoided CO₂ & PM2.5 baselines) | `community.test.ts`, `api.test.ts` | **VERIFIED** |
| **9** | Documented CPCB & EPA AQI standard | `src/lib/compute/aqiBreakpoints.ts`, `src/pages/DashboardPage.tsx` | Exact piecewise linear interpolation across all pollutants without mixing | `aqi.test.ts` | **VERIFIED** |
| **10** | Five selectable urban airshed sectors | `src/components/shared/UrbanMapSvg.tsx`, `src/pages/DashboardPage.tsx` | Native interactive SVG sector map with WCAG 2.2 Twin Representation | `rendering.test.tsx` | **VERIFIED** |
| **11** | Transparent demo fallback mode | `src/context/AppContext.tsx`, `server/services/firestoreService.ts` | Offline evaluator mode with clear "Demo Mode" labeling | `dom.test.tsx`, `api.test.ts` | **VERIFIED** |
| **12** | Defense-in-depth security | `server/middleware/security.ts`, `server/utils/sanitize.ts` | Helmet CSP, 15KB payload bounding, Rate limits, Zod validation | `security.test.ts`, `api.test.ts` | **VERIFIED** |
