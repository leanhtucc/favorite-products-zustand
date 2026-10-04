# React Performance Optimization Report

> **Summary:** The Lighthouse audit of the original version **failed**: the page stopped responding (`NO_FCP`), so **no BEFORE metrics exist**. After optimization, the production Mobile audits score **100/100** (headless run) and **85/100** (later DevTools run, flagged by Lighthouse as affected by Chrome extensions).
> No improvement percentage can be calculated, because there is no baseline value to compare against.
> After a second optimization round, three production audits all scored **100/100**.
> A later audit on the Vite **development server** (`localhost:5173`) scored **48/100**. It is not comparable to the production audit (see Section 5.2).

---

## Table of Contents

1. [Objective](#1-objective)
2. [Measurement Environment](#2-measurement-environment)
3. [BEFORE Measurement: Original Version](#3-before-measurement-original-version)
4. [Optimizations Applied](#4-optimizations-applied)
5. [AFTER Measurement](#5-after-measurement)
6. [Conclusion](#6-conclusion)
7. [Limitations and Decisions](#7-limitations-and-decisions)

---

## 1. Objective

The React/Vite project displays and searches **10,000 products**. The work consists of:

1. measuring the application in its initial state;
2. identifying performance problems;
3. applying at least two suitable optimizations;
4. re-measuring under the same conditions.

---

## 2. Measurement Environment

Lighthouse results vary with hardware, browser, system load and network. The conditions below are those of the AFTER audit.

| Item | Value |
|---|---|
| Round 1 date and time | October 3, 2026, 22:22 (Bangkok time) |
| Chrome (round 1) | HeadlessChrome 154.0 |
| Lighthouse (round 1) | 13.5.0 |
| Audited URL | `http://127.0.0.1:4173/` in the saved Lighthouse report (`http://localhost:4173/` in the later DevTools runs; both are loopback) |
| Mode | Navigation |
| Device | Mobile |
| Category | Performance |
| Server | Production build served by `vite preview` |
| Network and CPU | Lighthouse Mobile simulation: RTT 150 ms, downstream 1,638 Kbps, CPU 4× slowdown |
| Number of products | 10,000 |
| Number of AFTER audits | 5 production audits: 2 after round 1, 3 on the final build after round 2 (median reported for the final build) |
| Final-build audit times (`fetchTime`) | October 4, 2026, 10:37:02.116, 10:37:33.174 and 10:37:53.181 (Bangkok time, UTC+07:00) |
| Chrome (final-build runs) | Chrome 154.0.0.0 in all three JSON files |
| Lighthouse (final-build runs) | 13.4.1 in all three JSON files |
| Extension warnings (final-build runs) | No extension-related warning in `runWarnings` for any of the three JSON files |

---

## 3. BEFORE Measurement: Original Version

### 3.1 Procedure

1. Build the production version:

   ```powershell
   npm run build
   ```

2. Serve the build:

   ```powershell
   npm run preview -- --host 127.0.0.1
   ```

3. Open `http://localhost:4173/` in Chrome and check that 10,000 products are displayed.
4. Open **DevTools → Lighthouse**, select **Navigation**, **Mobile**, **Performance**, then run the analysis.
5. Save the report in `docs/lighthouse-before/`.

### 3.2 Results

| Metric | BEFORE result | Note |
|---|---|---|
| Performance (/100) | ❌ Failed | Score not calculated by Lighthouse |
| FCP (First Contentful Paint) | Not measured | No content painted (`NO_FCP`) |
| LCP (Largest Contentful Paint) | Not measured | Audit failed |
| TBT (Total Blocking Time) | Not measured | Audit failed |
| CLS (Cumulative Layout Shift) | Not measured | Audit failed |

**Evidence:** screenshot from October 3, 2026 showing `localhost:4173` with 10,000 products, followed by Lighthouse's message: *"unable to reliably load the URL you requested because the page stopped responding"*. The first attempt returned the `NO_FCP` error. Lighthouse produced no valid numeric result; the saved JSON (`docs/lighthouse-before/report.report.json`) contains only the `NO_FCP` error.

> ⚠️ These errors must not be converted into numeric values: the fields remain "Not measured".

### 3.3 Analysis of the Original Code

The original source is no longer in the working tree. The points below are **hypotheses drawn from the code inspection made before the changes**. They are consistent with the observed freeze but were not quantified by Lighthouse.

| Observation | File | Probable cause |
|---|---|---|
| 10,000 products filtered on every render, then copied via `map` | `src/page/ProductManagement.tsx` | Repeated computation and unnecessary allocations |
| One `ProductCard` mounted per result (up to 10,000 with an empty search) | `src/components/ProductList/ProductList.tsx` | Massive DOM mounting |
| One remote image per card (10,000 requests to `picsum.photos`) | `src/components/ProductCard/ProductCard.tsx` | Network overload, decoding and rendering cost |

**Impact:** the massive mounting is consistent with the page freeze, but its exact time cost could not be measured.

---

## 4. Optimizations Applied

### 4.1 Round 1 (audited in Section 5.1)

| # | Technique | Problem targeted | Files modified | Effect |
|---|---|---|---|---|
| 1 | **List virtualization** | 10,000 cards mounted at once | `src/components/ProductList/ProductList.tsx`, `src/index.css` | Only visible rows plus 2 margin rows are mounted. A `ResizeObserver` adapts the number of columns. Lighthouse measured **70 DOM elements**. |
| 2 | **`useMemo` on filtering** | Filter recomputed on every render, objects copied | `src/page/ProductManagement.tsx` | Recomputed only when the keyword changes; per-object copying removed. |
| 3 | **`React.memo` on cards** | Unnecessary re-renders of visible cards | `src/components/ProductCard/ProductCard.tsx` | A card skips re-rendering when its props are unchanged. |
| 4 | **Images with `loading="lazy"` and `decoding="async"`** | 10,000 remote images declared | `src/components/ProductCard/ProductCard.tsx` | Loading and decoding deferred for off-screen images; unmounted cards make no requests. |

### 4.2 Round 2 (audited in Section 5.3)

Round 2 targets the diagnostics of the second production audit: JavaScript execution time (1.5 s), main-thread work (2.6 s) and 9 long tasks.

| # | Technique | Diagnostic targeted | Files modified | Effect |
|---|---|---|---|---|
| 5 | **Product generation in a Web Worker** | JavaScript execution time, long tasks | `src/data/productManager.ts`, `src/data/productManager.worker.ts`, `src/page/ProductManagement.tsx` | The 10,000 product objects were generated synchronously on the UI thread. They are now generated in a worker and sent to the page with `postMessage`. While waiting, the page shows a loading message. If the worker fails, an error message with a retry button is shown (added before the final audits of Section 5.3). |
| 6 | **Precomputed search field and deferred filtering** | Search work, UI responsiveness | `src/data/productManager.ts`, `src/page/ProductManagement.tsx`, `src/types/product.ts` | Each product carries a lowercase `normalizedName` computed once in the worker, so filtering no longer lowercases 10,000 names per search. `useDeferredValue` keeps the input responsive while the list filters. |
| 7 | **Favorite IDs in a `Set` with a per-card selector** | Main-thread work when toggling favorites | `src/stores/favoritesStore.ts`, `src/components/ProductCard/ProductCard.tsx` | Each card selects only a boolean (`favoriteIds.has(product.id)`), so it re-renders only when its own favorite state changes. The membership check is a lookup instead of an array scan. |
| 8 | **Passive scroll listener with `requestAnimationFrame`** | Main-thread work, long tasks while scrolling | `src/components/ProductList/ProductList.tsx` | Scroll updates are batched per frame and state changes only when the first visible row changes. Resize updates skip unchanged dimensions, and a new search resets the scroll position. |
| 9 | **Explicit image dimensions** | Layout stability (CLS) | `src/components/ProductCard/ProductCard.tsx` | Images declare `width` and `height`, so the browser reserves space before they load. |

**Build and checks reported after round 2**

- `npm run build` passed, including TypeScript compilation. On the final build, Vite reported a main JavaScript file of 225.31 kB (70.77 kB gzip), a stylesheet of 6.57 kB (2.14 kB gzip) and a worker file of 0.37 kB.
- `npm run preview` served the production page and the worker.
- Manual checks: searching "Sản phẩm 99" returned 111 results (expected: 1 + 10 + 100), the favorite button toggled correctly, and scrolling rendered later products.
- No dependency was added or removed, and `package.json` and `package-lock.json` were not changed.
- Before the final audits of Section 5.3, the worker error state with a retry button was added in `src/page/ProductManagement.tsx`, and the unused legacy files `src/components/ProductCard.tsx` and `src/data/products.ts` were deleted (no active import referenced them). `npm run build` and `tsc -b` still pass.
- Lighthouse results for this version are reported in Section 5.3.

---

## 5. AFTER Measurement

### 5.1 Production audit (reference measurement)

The audit was run on a production build, with the same URL, mode, device and category as described in Section 2.

Two production audits were run on `http://localhost:4173/`:

- **Run 1:** headless Chrome 154, Lighthouse 13.5.0 (October 3, 2026, 22:22 Bangkok time).
- **Run 2:** Lighthouse in Chrome DevTools, later run. Lighthouse reported that **Chrome extensions negatively affected the page load**. Chrome and Lighthouse versions and time were not recorded.

| Metric | BEFORE | AFTER run 1 (headless) | AFTER run 2 (DevTools) | Change |
|---|---|---|---|---|
| Performance | Audit failed | **100 / 100** | **85 / 100** | Not calculable |
| FCP | Not measured | 1.21 s | 1.3 s | Not calculable |
| LCP | Not measured | 1.36 s | 1.5 s | Not calculable |
| TBT | Not measured | 0 ms | 580 ms | Not calculable |
| CLS | Not measured | 0.033 | 0 | Not calculable |
| Speed Index | Not measured | 1.2 s | 1.4 s | Not calculable |

**Reading the result:** the AFTER values describe the optimized version only. They do not prove a numeric gain, since the baseline is missing.

**Difference between the two runs:** FCP, LCP, CLS and Speed Index are close. The gap comes almost entirely from **TBT (0 ms vs 580 ms)**, which lowers the score from 100 to 85. Lighthouse flagged browser extensions on run 2, and a DevTools run in a regular profile is generally noisier than a headless run, so the extensions are a probable contributor. The cause was not isolated, though. A rerun in incognito mode would confirm it.

**Evidence:**
- HTML report: [`lighthouse-after/report.report.html`](lighthouse-after/report.report.html)
- JSON data: [`lighthouse-after/report.report.json`](lighthouse-after/report.report.json)

All 10,000 records remain in memory; only the visible cards and margin rows are mounted in the DOM.

**Run 2 diagnostics reported by Lighthouse**

| Diagnostic | Value |
|---|---|
| Render-blocking requests | Estimated savings of 40 ms |
| JavaScript execution time | 1.5 s |
| Main-thread work | 2.6 s |
| Unused JavaScript | Estimated savings of 175 KiB |
| Long main-thread tasks | 9 |

These are the remaining optimization opportunities and could be the next improvements: reducing unused JavaScript, splitting long tasks, and removing the render-blocking request.

### 5.2 Supplementary audit: Vite development server

A later audit was run against the **development server** (`http://localhost:5173/`) instead of the production build.

| Item | Value |
|---|---|
| URL | `http://localhost:5173/` |
| Server | Vite dev server (unminified modules, HMR client) |
| Code version audited | Optimized version (to be confirmed before submitting) |
| Chrome / Lighthouse version, date | Not recorded |

| Metric | Result |
|---|---|
| Performance | **48 / 100** |
| FCP | 11.1 s |
| LCP | 20.0 s |
| TBT | 340 ms |
| CLS | 0 |
| Speed Index | 11.1 s |

**Key diagnostics reported by Lighthouse**

| Diagnostic | Value |
|---|---|
| Total network payload | 3,703 KiB |
| Minify JavaScript | Estimated savings of 2,788 KiB |
| Reduce unused JavaScript | Estimated savings of 624 KiB |
| JavaScript execution time | 1.6 s |
| Main-thread work | 4.0 s |
| Long main-thread tasks | 12 |
| Maximum critical path latency | 497 ms |
| Largest single resource | `react-dom_client.js`, 3,059 KiB |

**Interpretation**

- This audit is **not comparable** with the production audit in 5.1: the dev server serves unminified, unbundled code plus Vite's HMR and React Refresh clients, and it is not a deployment configuration.
- Most of the payload comes from the unminified React DOM development module (3,059 KiB out of 3,703 KiB). Under Lighthouse's Mobile throttling (1,638 Kbps), downloading it alone accounts for a large share of the 11.1 s FCP.
- The score of 48 therefore reflects the development setup, not the optimized application. The production result in 5.1 remains the reference measurement.
- The 12 long tasks and 340 ms TBT are also inflated by development builds (React dev mode, extra runtime checks).

### 5.3 Production audits on the final build

Three Lighthouse audits (Navigation, Mobile, Performance) were run on the final production build served by `vite preview`. This build includes the round 2 optimizations of Section 4.2 and the later worker error state (main bundle `index-CwTz1Ti2.js`).

| Audit | Performance | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| Run 1 | 100 | 1.3 s | 1.4 s | 0 ms | 0.001 | 1.3 s |
| Run 2 | 100 | 1.3 s | 1.4 s | 0 ms | 0.001 | 1.3 s |
| Run 3 | 100 | 1.3 s | 1.4 s | 0 ms | 0.001 | 1.3 s |
| **Median** | **100** | **1.3 s** | **1.4 s** | **0 ms** | **0.001** | **1.3 s** |

The three audits returned identical displayed metrics, so the result is stable across runs.

The table reports the Lighthouse `displayValue` for each metric. The median was recomputed from the three JSON `numericValue` entries before formatting: Performance score 1; FCP 1,257.1571 ms; LCP 1,407.1571 ms; TBT 0 ms (the three raw values are 1, 0 and 0 ms); CLS 0.00100439104400799; Speed Index 1,257.1571 ms. These medians format to the values already shown in the table.

**Final-build evidence:**
- [Run 1 HTML](lighthouse-after/final-run1.report.html) · [Run 1 JSON](lighthouse-after/final-run1.report.json)
- [Run 2 HTML](lighthouse-after/final-run2.report.html) · [Run 2 JSON](lighthouse-after/final-run2.report.json)
- [Run 3 HTML](lighthouse-after/final-run3.report.html) · [Run 3 JSON](lighthouse-after/final-run3.report.json)

**Observations from the three reports**

| Observation | Value |
|---|---|
| LCP element | `h1` (text), in all three runs |
| LCP breakdown | Time to first byte 0 ms; element render delay 70 to 100 ms |
| CLS culprit | One `p` element, score 0.001 |
| Main JavaScript file | 68.80 KiB transferred |
| CSS file | 2.45 KiB transferred |
| Maximum critical path latency | 38 to 57 ms |
| Images from `picsum.photos` | 18 to 19 KiB for the six images listed in each run |
| Long main-thread tasks | None listed in runs 1 and 3; 3 in run 2 (63, 50 and 66 ms) |

**Remaining opportunities** (estimated by Lighthouse, not applied):
- Render-blocking CSS: estimated savings of 150 ms (one 2.5 KiB stylesheet).
- Unused JavaScript: estimated savings of about 35 KiB out of 68.4 KiB.

**Comparison with the round 1 headless audit (Section 5.1, run 1):** FCP (1.21 s vs 1.3 s), LCP (1.36 s vs 1.4 s) and Speed Index (1.2 s vs 1.3 s) are close, TBT is 0 ms in both, and CLS drops from 0.033 to 0.001. The lower CLS is consistent with the explicit image dimensions added in round 2, but the audits do not isolate that cause.

Because the LCP element is text rather than an image, loading the products in a worker does not delay LCP.

Full reports are saved in `docs/lighthouse-after/`.

---

## 6. Conclusion

- **Before:** the page stopped responding and Lighthouse produced no metrics.
- **After** virtualization, memoization and lazy image loading, the production Mobile audits succeeded. Run 1 (headless): **Performance 100, FCP 1.21 s, LCP 1.36 s, TBT 0 ms, CLS 0.033**, with **70 DOM elements** while the collection holds 10,000 products. Run 2 (DevTools, extensions flagged by Lighthouse): **Performance 85, FCP 1.3 s, LCP 1.5 s, TBT 580 ms, CLS 0**.
- Both runs show a fast first paint (about 1.2 to 1.3 s). The main variation is TBT, so the optimized page scores between 85 and 100 depending on test conditions.
- A supplementary audit on the Vite dev server scored 48/100 (FCP 11.1 s, LCP 20.0 s, TBT 340 ms). It is dominated by unminified development bundles and does not represent production performance.
- After a second optimization round (Section 4.2), three further production audits all scored **100 / 100** (FCP 1.3 s, LCP 1.4 s, TBT 0 ms, CLS 0.001, Speed Index 1.3 s), so the score is stable. The earlier 85 (high TBT, browser extensions flagged) was not reproduced; the audits do not isolate whether round 2 or cleaner test conditions explain this.
- Going from a failed audit to a successful one is the main finding. An improvement percentage cannot be calculated.
- Lighthouse results are lab measurements and may vary from one audit to another.

---

## 7. Limitations and Decisions

- **Missing baseline:** no valid value exists for Performance, FCP, LCP, TBT or CLS. The page freeze is itself the initial finding.
- **Cause of the freeze:** the project creates 10,000 DOM cards at once and requests 10,000 external images from `picsum.photos`. Lighthouse failed even in Chrome ("page stopped responding").
- **Decision:** to make the application usable and measurable, the four optimizations in Section 4 were applied. The AFTER audit then succeeded.
- **Tooling:** the `npm` command in `PATH` points to a broken launcher. The initial build still succeeded using the local TypeScript and Vite binaries.
- **Lighthouse** was installed temporarily, without modifying `package.json` or `package-lock.json`.
