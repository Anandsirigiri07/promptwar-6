# VAYUWISE AI (वायुवाइज़ एआई)
### Full-Stack GenAI Urban Air Quality, Winter Smog Intelligence and Family Protection Platform

> **Tagline**: Breathe Smarter. Live Safer. Build Cleaner Communities.  
> **Challenge**: Hack2Skill Prompt War — Challenge 6  
> **Architecture**: React 19 • Express 5 • TypeScript (Strict) • Tailwind CSS v4 • Google Gemini `@google/genai`

---

## 1. Challenge Problem Statement

Severe winter smog, particulate matter spikes (PM2.5 / PM10), and shallow atmospheric thermal inversions trap toxic urban pollutants at breathing level across metropolitan airsheds. Everyday citizens, schools, and families lack actionable, evidence-based, and personalized intelligence:

- Outdoor physical exertion during elevated pollution can increase inhaled exposure; the magnitude depends on concentration, activity and duration.
- Commuters sitting in traffic or taking open-window transit inhale dangerous doses of black carbon.
- Families struggle to evaluate room air purifiers and are often misled by pseudoscience.
- Communities have no mechanism to track collective avoided emissions.

**VAYUWISE AI** solves this by pairing **deterministic environmental computational physics** with **Google Gemini Generative AI (`gemini-2.5-flash` / `gemini-3.1-flash-lite`)** to protect households, optimize routines, calculate transit exposure, and mobilize neighborhood action.

---

## 2. Platform Architecture & Data Flow

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
|   Helmet Strict CSP • CORS Allowlist • 15KB Stream Bounds • Rate Limiting • Safe Logs |
+---------------------------------------------------------------------------------------+
|  /api/health      /api/air-quality      /api/routine-insights     /api/commute/compare|
|  /api/iaq/calc    /api/community        /api/emergency-advisory   /api/exposure/explain|
+---------------------------------------------------------------------------------------+
           │                                 │                              │
           ▼                                 ▼                              ▼
+-----------------------+       +-------------------------+       +---------------------+
|   DETERMINISTIC MATH  |       |   GOOGLE GEMINI GENAI   |       |  FIREBASE FIRESTORE |
|  CPCB Piecewise AQI   |       |  @google/genai SDK      |       |  Private user trees |
|  Dijkstra Pathfinding |       |  gemini-2.5-flash       |       |  Atomic transactions|
|  CADR / ACH Decay     |       |  Zod Structured Schemas |       |  Idempotency guards |
|  Inhaled PM2.5 Dose   |       |  SHA-256 LRU Caching    |       |  Demo Mode Fallback |
+-----------------------+       +-------------------------+       +---------------------+
           ▲                                 ▲                              ▲
           │                                 │                              │
+---------------------------------------------------------------------------------------+
|                        MULTI-TIER ENVIRONMENTAL DATA PROVIDERS                        |
|  1. Open-Meteo Copernicus CAMS Live Air Quality & Weather (Free, No Key Required)     |
|  2. OpenAQ v3 ground stations (optional current sensor measurements when configured) |
|  3. Clearly labelled offline demonstration scenarios (not historical observations)   |
+---------------------------------------------------------------------------------------+
```

---

## 3. Key Feature Modules Across 9 Routes

| Route | Feature Module | Technical Implementation Highlights |
| :--- | :--- | :--- |
| `/` | **Platform Overview & Mission** | Overview of challenge alignment, direct links to family onboarding and air intelligence. |
| `/onboarding` | **Family & Persona Setup** | 8 specific protection profiles (Infant, Child, Senior, Asthmatic, Student, Commuter, Cyclist, Champion) with zero tracking cookies or forced GPS permissions. |
| `/dashboard` | **Urban Air-Quality Overview** | City zones, provider-sourced pollutant readings where available, source labels, explicit unavailable states for missing pollutants and standard-incomplete AQI coverage, plus clearly labelled scenario simulation. Hourly trends are shown only where source data exists. |
| `/routine` | **GenAI Daily Routine Planner** | Persona-aware recommendations and an activity exposure explainer. It does not report a generic personal daily avoided-dose total without time-resolved breathing, exposure and filtration inputs. |
| `/commute` | **Illustrative Multi-Modal Commute Comparison** | Compares configured transport-mode scenarios using entered distance and available PM2.5 concentration. Its graph is a demonstration network, not turn-by-turn live navigation or a verified street-level low-exposure route. |
| `/indoor-air` | **IAQ & Low-Cost Hack Center** | Room volume, required CADR, and actual ACH calculator; dynamic outdoor air quality and meteorology integration; step-by-step Corsi-Rosenthal DIY box filter blueprint; smart ventilation window assistant. |
| `/community` | **Collective Action & Pledges** | Community pledge creation, self-reported action logging with idempotency deduplication, reasonable unit bounds, and atomic server-side recalculation of avoided emissions (IPCC & CPCB baselines). |
| `/advisories` | **Multilingual AI Emergency Center** | Generates real-time smog alerts in 5 languages (English, Hindi, Kannada, Arabic with bidirectional RTL, Spanish) using Google Gemini with deterministic fallback, strictly identifying the generating engine. |
| `/profile` | **Preferences & Authentication** | Toggle between CPCB NAQI and US EPA calculation standards, language switcher, high contrast options, and transparent demo mode evaluator session (clearly separated from Firebase authenticated mode). |

---

## 4. Evaluation Framework Optimization

VAYUWISE AI was engineered to achieve maximum demonstrable performance across the six evaluation parameters:

1. **Code Quality**: Strict TypeScript compiler checks across client and server, modular architecture, pure computation modules, and clean Oxlint execution (`0 errors, 0 warnings`).
2. **Security**: Multi-layered defense-in-depth with Helmet CSP (no unsafe-inline in production), CORS domain allowlisting, 15KB stream-level request body bounds, differentiated rate limits (30 req/min for AI), input sanitization, token redaction in logs, and fail-closed production authentication.
3. **Efficiency**: Native SVG visualizations, bounded caching and request timeouts. Report bundle size from the current production build rather than an unverified fixed target.
4. **Testing**: 10 comprehensive Vitest suites covering numerical assertion guards, fractional AQI precision, transition gap elimination, CPCB minimum 3 pollutants rule, Dijkstra graph pathfinding, CADR decay modeling, security sanitization, and REST API integration.
5. **Accessibility**: Semantic controls, keyboard focus styles, text labels for important status indicators and RTL layout support. Formal WCAG 2.2 AA conformance requires a separate accessibility audit.
6. **Problem Statement Alignment**: Direct solutions tailored for 8 household vulnerability personas with transparent mathematical formulas and zero artificial claims.

---

## 5. Technology Stack

- **Frontend**: React 19, TypeScript 5.7 (Strict), Vite 6, Tailwind CSS v4, React Router 7, Lucide Icons
- **Backend**: Node.js 20+, Express 5, TypeScript (`tsx`), Helmet 8, CORS, Express-Rate-Limit, Node Crypto (SHA-256)
- **Generative AI**: Official Google `@google/genai` SDK (`gemini-2.5-flash` / `gemini-3.1-flash-lite`), Zod runtime schema validation, deterministic algorithmic fallback
- **Database & Auth**: Firebase Authentication & Cloud Firestore (with transparent in-memory Demo Mode fallback)
- **Quality & Testing**: Vitest 3, JSDOM, Testing Library, Oxlint, GitHub Actions CI

---

## 6. Installation & Development Guide

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Anandsirigiri07/promptwar-6.git
cd promptwar-6
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: If external keys are omitted, the application runs automatically in transparent Demo Mode with free Open-Meteo atmospheric data and deterministic AI fallbacks).*

### 3. Run Application
```bash
# Production single-process mode (Serves React 19 SPA + Express 5 API on port 3001)
npm run build
npm start

# Development dual-process mode
npm run server   # Terminal 1: Express API on http://localhost:3001
npm run dev      # Terminal 2: Vite Dev Server on http://localhost:5173
```

---

## 7. Quality Assurance & Verification Commands

Execute the unified verification suite:
```bash
# 1. TypeScript Strict Typechecking (Client + Server)
npm run typecheck

# 2. Code Linting (Oxlint with zero warnings allowed)
npm run lint

# 3. Vitest Unit & Integration Test Suites
npm run test:run

# 4. Coverage Verification
npm run test:coverage

# 5. Production Build (Client SPA + Server)
npm run build

# 6. Full Quality Gate Verification
npm run verify
```

---

## 8. Continuous Integration

A GitHub Actions workflow is active under `.github/workflows/ci.yml`:
- Runs on every `push` and `pull_request` to `main`.
- Enforces Node.js 22 LTS, `npm ci`, static typecheck, linting, unit & integration tests, coverage verification, and full production build.
- Supports secretless test environments via deterministic mocks and offline fallbacks.

---

## 9. Assumptions & Limitations

1. **Air Quality Standards**: Default calculations follow the Central Pollution Control Board (CPCB) NAQI 2014 standards; US EPA AQI can be toggled in Preferences.
2. **Data provenance**: Open-Meteo returns modelled air-quality and weather data, not roadside station measurements. OpenAQ ground-station readings are used only when the optional API key is configured and fresh location-latest readings are retrieved. Missing pollutants remain unavailable, not zero. Current/latest snapshots are labelled as indicative index values, not regulatory CPCB/EPA AQI, because required pollutant-specific averaging periods are not validated. Offline scenarios are demonstrations, not historical observations.
3. **Medical Disclaimer**: VAYUWISE AI provides scientific algorithmic advice and does not replace statutory emergency directives or clinical medical diagnoses.
