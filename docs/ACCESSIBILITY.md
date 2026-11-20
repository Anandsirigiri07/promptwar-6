# VAYUWISE AI — Accessibility & WCAG 2.2 AA Compliance Audit

## 1. Compliance Target: WCAG 2.2 AA

VAYUWISE AI was engineered from the foundation up to satisfy and exceed WCAG 2.2 Level AA accessibility standards across all 9 modules.

---

## 2. Twin Representation Rule

**Principle**: Graphical visualizations must never be the sole vehicle of information delivery.

Implementation:
1. **Urban Airshed Sector Map (`UrbanMapSvg.tsx`)**:
   - The interactive SVG map is paired with an accessible, hidden data table (`<table className="sr-only">`) that exposes sector names, AQI sub-indices, categories, and dominant pollutants directly to screen readers.
   - SVG interactive nodes are tagged with `role="button"`, `tabIndex={0}`, explicit `aria-label`, and keyboard event handlers (`Enter` and `Space`).
2. **7-Hour Historical Sparklines (`PollutantSparkline.tsx`)**:
   - Visual polylines are marked with `aria-hidden="true"`.
   - Accompanied by `<span className="sr-only">`:
     ```html
     <span className="sr-only">
       Fine PM2.5 7-hour trend is rising from 90 to 150 µg/m³. Current concentration: 150 µg/m³.
     </span>
     ```

---

## 3. Sensory Characteristics & Color Contrast (SC 1.4.1 & 1.4.3)

- **No Color-Only Signaling**: In `AqiBadge.tsx`, every AQI severity badge combines:
  1. The numeric AQI value (`185 AQI`)
  2. The standardized category label (`Moderate`)
  3. An accessible `role="status"` attribute with explicit `aria-label`
  4. Contrast-tested background and border pairings exceeding the 4.5:1 text contrast ratio for normal text and 3:1 for graphical UI components.

---

## 4. Keyboard Navigation & Focus Management

- **Skip-to-Content Link**: Provided at the very top of `index.html`:
  ```html
  <a href="#main-content" class="sr-only focus:not-sr-only ...">
    Skip to main content
  </a>
  ```
  Directly targets `<main id="main-content" tabIndex={-1}>`, allowing keyboard users to bypass navigation.
- **Focus Rings**: `:focus-visible` token styled with high-contrast forest green outline (`#336148`) and 2px offset.
- **No Keyboard Traps**: Modal dialogs provide Escape key dismissal and clear Cancel buttons.

---

## 5. Multilingual & Bidirectional RTL Support

- **Language Declarations**: Dynamic synchronization of `<html lang="...">` on every language change.
- **Arabic RTL Direction**: When Arabic (`ar`) is selected, `document.documentElement.dir = 'rtl'` is activated, flipping typography and alignment.
- **Languages Supported**:
  - English (`en`)
  - Hindi (`hi`)
  - Kannada (`kn`)
  - Arabic (`ar` - RTL)
  - Spanish (`es`)
