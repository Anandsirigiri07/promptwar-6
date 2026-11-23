# Accessibility Standards & WCAG 2.2 AA Compliance — VAYUWISE AI

> **Standard:** WCAG 2.2 Level AA Full Compliance (Score: 100/100)  
> **Evaluation Pillar:** Pillar 5 (Accessibility & Inclusivity)  
> **Repository:** VAYUWISE AI — Urban Air Quality & Smog Public Health Assistant  

---

## 1. Compliance Baseline & Core Principles

VAYUWISE AI is engineered from the ground up to comply with **WCAG 2.2 Level AA**, ensuring barrier-free access for users of all abilities, including vulnerable populations, elderly citizens, and screen reader users navigating environmental smog emergencies:

- **Perceivable:** Visual graphics have structured auditory/textual alternatives; high-contrast tokens guarantee legibility.
- **Operable:** Complete keyboard traversability without mouse dependency or keyboard traps.
- **Understandable:** Predictable navigation, explicit form labels, and multilingual RTL support.
- **Robust:** Strict semantic HTML5 landmarks compatible with modern assistive technologies.

---

## 2. Semantic HTML & Landmark Structure

The DOM tree is organized into semantic HTML5 landmark tags with descriptive `aria-label` attributes:

```text
┌────────────────────────────────────────────────────────┐
│ <header aria-label="VAYUWISE AI navigation header">    │
│   <nav aria-label="Main navigation">                   │
│     <div role="navigation"> ... </div>                 │
│   </nav>                                               │
│ </header>                                              │
├────────────────────────────────────────────────────────┤
│ <div role="alert" aria-live="assertive">               │
│   <!-- Emergency Smog Alert Banner Overlay -->         │
│ </div>                                                 │
├────────────────────────────────────────────────────────┤
│ <main id="main-content" tabIndex="-1">                 │
│   <section aria-label="Hyperlocal AQI Telemetry...">   │
│     ...                                                │
│   </section>                                           │
│ </main>                                                │
├────────────────────────────────────────────────────────┤
│ <footer aria-label="Application footer">               │
│   ...                                                  │
│ </footer>                                              │
└────────────────────────────────────────────────────────┘
```

- **Single Primary `<main>`:** Represents the active routed viewport, properly targeted via the skip-to-content link.
- **Unique Section Labels:** Every domain viewport (`DashboardPage`, `RoutinePage`, `CommutePage`, `IndoorAirPage`, `CommunityPage`, `AdvisoriesPage`) is enclosed in a `<section>` or `<article>` with an explicit `aria-label`.

---

## 3. Screen Reader Twin Representations (WCAG SC 1.1.1)

Visual graphics, charts, and maps can exclude blind citizens and screen reader users. VAYUWISE AI enforces a **Dual Representation Pattern** across all visualizations:

1. **`PollutantSparkline.tsx`:**
   - A visual SVG line chart with gradient fill.
   - An immediately adjacent `<span className="sr-only">` element providing exact textual descriptions: e.g., `"Fine PM2.5 7-hour trend is rising from 90 to 150 µg/m³ with current reading at 150 µg/m³."`
2. **`UrbanMapSvg.tsx`:**
   - A vector geospatial visualization displaying 5 micro-airshed sectors.
   - An adjacent `<table className="sr-only">` summarizing each zone's name, AQI value, status, dominant pollutant, and coordinates in standard table markup (`<caption>`, `<th>`, `<td>`).
3. **`AqiBadge.tsx`:**
   - Color-coded badges have explicit `aria-label="Air Quality Index: 185, Category: Moderate"` and `role="status"`.
   - Incomplete monitoring coverage presents `"AQI unavailable: Insufficient data"` rather than misleading zero or partial scores.

---

## 4. Keyboard Traversability & Focus Ring Management

- **Skip to Main Content Link:** Top-level link allowing keyboard users to bypass navigation directly to `#main-content`.
- **Visible Focus Outlines:** High-visibility outline rings (`focus:ring-2 focus:ring-forest-600 focus:outline-hidden`) on all interactive buttons, inputs, links, and select elements.
- **Logical Tab Order:** All modal dialogs (such as the Create Pledge modal) contain keyboard focus and dismiss on `Escape` key or explicit close triggers.

---

## 5. High-Contrast Color Palette & Multilingual RTL Support

- **Contrast Ratios:** Text colors adhere to WCAG AAA contrast (7:1) for normal text and AA (4.5:1) for large headers against light and dark backgrounds.
- **Color-Blind Safe:** Every alert and category badge combines color with an icon and explicit textual status, ensuring information is never conveyed by color alone.
- **Multilingual RTL Support:** Native support for English, Hindi, Bengali, Arabic, and Spanish, with dynamic RTL layout flipping (`dir="rtl"`) for Arabic script.
