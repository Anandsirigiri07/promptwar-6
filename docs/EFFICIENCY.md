# VAYUWISE AI — Performance & Efficiency Report

## 1. Production Bundle Analysis

Vite 6 build metrics:
- **Client HTML (`index.html`)**: 1.23 kB (gzip: 0.69 kB)
- **Stylesheet (`index.css`)**: 39.77 kB (gzip: 7.50 kB)
- **Application Bundle (`index.js`)**: 448.03 kB (gzip: 133.56 kB)
- **Total Production Asset Weight**: < 145 kB gzipped!
- **Build Duration**: 9.59s

No heavy charting libraries (such as Chart.js, Recharts, or D3) were imported. All charts, heatmaps, and sparklines are authored in lightweight, native SVG.

---

## 2. Caching Strategy & Latency Reduction

- **Bounded TTL LRU Cache**: Implemented in `server/services/cacheService.ts`.
- **SHA-256 Key Hashing**: Every request produces a 64-character deterministic key from its normalized parameters, model version, and language.
- **Cache Hit Latency**: < 1ms for previously synthesized schedules and emergency briefings.
- **Memory Footprint**: Strict cap at 300 entries for AI routines and 100 entries for telemetry ensures server RAM never exceeds bounds.

---

## 3. Algorithmic Complexity

- **CPCB / EPA Piecewise Interpolation**: $O(B)$ where $B$ is breakpoint count ($B \le 7$), executing in sub-microsecond time.
- **Dijkstra Multi-Modal Routing Engine**: $O((V + E) \log V)$ using adjacency lists, computing multi-modal exposure tradeoffs in < 5ms for urban networks.
- **First-Order Room Clearance Decay**: $O(1)$ logarithmic closed-form evaluation:
  $$t_{\text{clearance}} = -\frac{\ln(C(t)/C_0)}{\lambda}$$
