# Phase 11 — FLEX Experimental Results Explorer Integration Report

**Project:** Flame in Freefall — NASA Space Apps Challenge  
**Date:** October 2026  
**Status:** Completed & Empirically Verified  
**Operating Standard:** Zero Internet Downloads • Zero Fabricated Values • Clean Separation of Datasets • Complete Transparency  

---

## 1. Executive Summary

In Phase 11, we built and integrated a brand-new, standalone exploration portal called **"FLEX Experimental Results Explorer"** into the Flame in Freefall web platform. 

This page allows researchers, judges, and students to inspect, search, filter, and analyze all **274 authentic as-run microgravity droplet combustion flight records** from the NASA Physical Sciences Informatics (PSI-69) investigation aboard the International Space Station (ISS).

### Key Architectural Standards Followed
1. **Three Completely Separate Datasets:**
   - **BASS-II Flight Telemetry:** 126 solid fuel combustion tests (`bass_ii_experiments.csv`)
   - **FLEX Planned Protocol Matrix:** 290 target specification conditions (`flex_experiments.csv`)
   - **FLEX Experimental Flight Results (New):** 274 measured flight tests (`flex_experimental_results.csv`)
   None of these datasets were merged, overwritten, or modified.
2. **Preservation of Raw Provenance:**
   - No measurements were fabricated, estimated, or silently replaced.
   - Missing measurements are preserved as true nulls (never converted to zeroes).
3. **Transparent Handling of Test #114 Anomaly:**
   - Test #114 (`C11M201`) recorded an ambient pressure of `0.0 mmHg` in NASA's source table.
   - The value `0.0` is preserved in the dataset, but prominently flagged with an amber data-quality alert in the UI and automatically excluded from physical pressure regressions.
4. **Transparent Documentation of Count Discrepancies:**
   - The differences between the 274 local data rows, the 275 web catalog entries, and the 284 tests described in technical literature are explicitly explained and left unresolved without speculation.

---

## 2. Files Created, Modified, and Backed Up

In compliance with the project rule to back up files before editing, all modified files were backed up with `.phase11.bak` extensions.

| File Path | Action | Description |
|:---|:---:|:---|
| `backend/config.py.phase11.bak` | **Backup** | Saved pre-Phase 11 backend configuration. |
| `backend/config.py` | **Modified** | Added `FLEX_RESULTS_CSV_PATH` pointing to `data/processed/flex_experimental_results.csv`. |
| `backend/schemas.py.phase11.bak` | **Backup** | Saved pre-Phase 11 Pydantic schemas. |
| `backend/schemas.py` | **Modified** | Added schemas: `FlexResultRecord`, `FlexResultListResponse`, `FlexResultSummaryResponse`, and `FlexResultAnalyticsResponse`. |
| `backend/main.py.phase11.bak` | **Backup** | Saved pre-Phase 11 FastAPI server. |
| `backend/main.py` | **Modified** | Added lazy loader `get_flex_results_df()`, updated `/api/inventory`, and added 4 new REST API endpoints under `/api/flex-results`. |
| `frontend/src/types/index.ts.phase11.bak` | **Backup** | Saved pre-Phase 11 TypeScript interfaces. |
| `frontend/src/types/index.ts` | **Modified** | Added TypeScript interfaces for FLEX flight results and analytics. |
| `frontend/src/services/api.ts.phase11.bak` | **Backup** | Saved pre-Phase 11 API client layer. |
| `frontend/src/services/api.ts` | **Modified** | Added client functions: `getFlexResultsSummary()`, `getFlexResultsRecords()`, `getSingleFlexResult()`, and `getFlexResultsAnalytics()`. |
| `frontend/src/App.tsx.phase11.bak` | **Backup** | Saved pre-Phase 11 router configuration. |
| `frontend/src/App.tsx` | **Modified** | Added `/flex-results` route mapped to `<FlexResultsExplorer />`. |
| `frontend/src/components/Sidebar.tsx.phase11.bak` | **Backup** | Saved pre-Phase 11 sidebar navigation. |
| `frontend/src/components/Sidebar.tsx` | **Modified** | Added navigation entry for "FLEX Results Explorer" (`/flex-results`, icon: `Activity`, badge: `274 Flight`). |
| `frontend/src/pages/DataInventory.tsx.phase11.bak` | **Backup** | Saved pre-Phase 11 inventory page. |
| `frontend/src/pages/DataInventory.tsx` | **Modified** | Added 3-Tier Multi-Mission Dataset Architecture section clearly distinguishing the three datasets. |
| `tests/test_backend_api.py.phase11.bak` | **Backup** | Saved pre-Phase 11 test suite. |
| `tests/test_backend_api.py` | **Modified** | Added `test_flex_results_endpoints()`, expanding automated test coverage from 15 to 16 test suites. |
| `frontend/src/pages/FlexResultsExplorer.tsx` | **Created** | New interactive dashboard with summary cards, search/filter table, combustion analytics, regression charts, and record detail modal. |
| `PHASE_11_FLEX_RESULTS_INTEGRATION_REPORT.md` | **Created** | This comprehensive audit and verification report. |

---

## 3. Dataset Counts & Scientific Provenance

| Metric / Dimension | BASS-II Dataset | FLEX Planned Protocol | FLEX Flight Results (Phase 11) |
|:---|:---:|:---:|:---:|
| **Physical Investigation** | NASA PSI-25 (Solid fuels) | NASA PSI-69 (Liquid droplets) | NASA PSI-69 (Liquid droplets) |
| **Spaceflight Facility** | Microgravity Science Glovebox (MSG) | Combustion Integrated Rack (CIR) | Combustion Integrated Rack (CIR) |
| **Operational Period** | 2012–2014 | Pre-flight requirement | March 2009 – December 2011 |
| **Record Count** | **126 test runs** | **290 test conditions** | **274 flight experiments** |
| **Source Document / File** | `NASA/TM-20210011385.pdf` | `NASA FLEX_EIRD_v4.pdf` | `PSI-69_Experimental table_FLEX.csv` |
| **Local File Path** | `data/processed/bass_ii_experiments.csv` | `data/processed/flex_experiments.csv` | `data/processed/flex_experimental_results.csv` |
| **Nature of Datapoints** | Solid flame spread telemetry | Environmental specifications | As-run photographic & sensor measurements |
| **Fuels Tested** | PMMA, Cotton, Nomex, Sibal | Methanol, Heptane | Methanol (157), Heptane (117) |
| **Primary Measured Result** | Flame growth & toxic gas production | Target gas mixture & flow | Burning rate constant $K$ ($\text{mm}^2/\text{s}$), $d_0$, $d_{ext}$ |

---

## 4. Scientific Column Audits & Accurate Units

In strict adherence to scientific accuracy:
* **Ambient Pressure:**
  - Standardized as `ambient_pressure_mmhg` (native measurement from source in mmHg).
  - Converted atmospheric pressure is provided as `ambient_pressure_atm` and is explicitly labeled as **`(derived)`** in the API and UI ($P_{\text{mmHg}} / 760.0$).
* **Droplet Initial Diameter ($d_0$):**
  - Labeled in **millimeters (mm)**.
  - 12 unrecorded measurements are preserved as true nulls (rendered as *"Unavailable"* or *"—"* in the UI, never `0.0`).
* **Visible Flame Extinction Diameter ($d_{ext}$):**
  - Labeled in **millimeters (mm)**.
  - 77 unrecorded measurements preserved as true nulls.
  - 8 tests contain literal `0.0` values from NASA's table for runs ending in `Completion` (droplet consumed to zero size) or `Disruption`.
* **Burning Rate Constant ($K$):**
  - Defined by the classical $d^2$-law: $d^2(t) = d_0^2 - K t$.
  - Labeled in **$\text{mm}^2/\text{s}$** (corrected from NASA's truncated `; mm` table header).
  - 16 unrecorded values preserved as nulls.
* **Burn Time:**
  - Labeled in **seconds (s)**.
  - 6 missing values preserved as nulls.
  - Verbatim approximate notes from astronauts (e.g. `~6`, `~9`) are preserved in `burn_time_raw`.
* **Primary Sequence Identifier:**
  - `FLEX Test #` (`flex_test_num`) is used as the continuous sequence ID ($1$ to $274$, 0 gaps).
  - The duplicate run code `193F001` (in Tests #70 and #73) represents dual video analyses of the same flight event; both records are preserved.

---

## 5. Test #114 Anomaly Handling & Regression Exclusion

### The Anomaly
* **FLEX Test #:** 114
* **FLEX Identifier:** `C11M201`
* **Test Date:** 9/6/2010 (GMT 19:14:22)
* **Fuel:** Methanol
* **Chamber Pressure:** `0.0 mmHg`
* **Combustion Outcome:** Extinction after an 18.9-second burn, with $d_0 = 3.23\text{ mm}$ and $K = 0.42\text{ mm}^2/\text{s}$.

### Physical Impossibility & Upstream Dropout
* Methanol has a vapor pressure of 97–130 mmHg at room temperature. In a true vacuum ($0\text{ mmHg}$), a droplet would flash boil or freeze immediately.
* Furthermore, chemical combustion requires oxidizer molecules; gas mole fractions of 20% $\text{O}_2$, 45% $\text{N}_2$, and 35% $\text{CO}_2$ are physically meaningless at zero absolute pressure.
* All surrounding tests in test campaign series `C11` (Tests 113, 115, 116, 117, 118) measured between **531.1 and 536.3 mmHg** (~0.70 atm).
* Therefore, the `0` in NASA's table is an upstream transducer dropout or data-entry omission.

### Implemented Safeguards
1. **Preserve Authentic Datapoint:** The value `0.0` is preserved in the CSV file without synthetic modification.
2. **UI Data Quality Warning:** Test #114 is rendered with an amber warning badge in the table and a prominent callout inside the Record Detail Modal.
3. **Default Exclusion from Regressions:** The `/api/flex-results/analytics` endpoint automatically excludes Test #114 from the pressure-versus-burning-rate regression line:
   - **Total records:** 274
   - **Valid regression points:** 257 (positive pressure and recorded burning rate)
   - **Excluded points:** 17 total (1 due to zero pressure [Test #114] + 16 due to missing burning rate)
   - A dedicated modal allows users to inspect all 17 excluded records and their specific reasons.

---

## 6. Verification Results

### 6.1 Backend Automated API Tests
We ran the complete test suite via `python -X utf8 tests/test_backend_api.py`. All 16 test suites passed:

```
Running Flame in Freefall API Test Suite...
✓ Health endpoint passed.
✓ Summary endpoint passed.
✓ Experiments listing and pagination passed.
✓ Experiments filtering passed.
✓ Single experiment lookup passed.
✓ Extinction boundary analytics passed.
✓ Gas correlations analytics passed.
✓ Assistant query (supported) passed.
✓ Assistant query (unsupported refusal) passed.
✓ Inventory endpoint passed.
✓ Insights experiment matching passed.
✓ Insights experiment comparison (compatible) passed.
✓ Insights experiment comparison (incompatible warning) passed.
✓ Insights experiment comparison (insufficient/invalid records refusal) passed.
[PASS] FLEX protocol matrix endpoints passed.
[PASS] FLEX experimental results endpoints passed.

ALL 16 BACKEND API TESTS PASSED SUCCESSFULLY!
```

### 6.2 Frontend Production Compilation
We verified the complete TypeScript and Vite production bundle using `npm --prefix frontend run build`:

```
> flame-in-freefall-frontend@1.0.0 build
> tsc -b && vite build

vite v6.4.5 building for production...
transforming...
✓ 2215 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.24 kB │ gzip:   0.70 kB
dist/assets/index-qVri4yto.css   37.09 kB │ gzip:   6.82 kB
dist/assets/index-DwSQBz-b.js   800.80 kB │ gzip: 211.22 kB
✓ built in 7.30s
```
**Result:** 0 TypeScript compiler errors. 0 bundle errors.

### 6.3 Browser Visual Verification
Using the browser test runner, we verified:
1. Navigation to `http://localhost:5173/flex-results`.
2. Header and 6 summary metric cards rendered with exact counts (274 tests, 186 extinctions, 61 disruptions, 27 completions, 157 Methanol / 117 Heptane, mean burning rate 0.5019 mm²/s).
3. Search filtering for "114" correctly located Test #114 (`C11M201`) and displayed the amber warning badge `0.0 mmHg`.
4. Inspect modal opened for Test #114, displaying the upstream sensor dropout warning banner and all flight conditions.
5. Combustion Analytics tab loaded the pressure-versus-burning-rate scatter plot and regression metrics.
6. The "17 Excluded (View Details)" button opened the exclusion drawer, confirming Test #114 and missing rate points were listed with scientific explanations.
7. Existing pages (Mission Control, Experiment Explorer, BASS-II Analytics, AI Assistant, FLEX Protocol Explorer, Data Inventory) remain fully functional.

---

## 7. How to Open and Use the New Page Locally

Both the backend and frontend are currently running and ready to use.

### Step 1: Open Your Web Browser
Open your browser and navigate to:
```
http://localhost:5173/flex-results
```

### Step 2: Explore Key Features
1. **Browse Flight Tests:** Use the **Flight Records Table** tab to search by test number (e.g. `114`, `70`, `193F001`) or filter by fuel (`Methanol`, `Heptane`) and outcome (`Extinction`, `Disruption`, `Completion`).
2. **Inspect Test #114:** Search for `114` to see the amber `0.0 mmHg` warning badge, then click **Inspect** to see the full environmental condition log and sensor alert.
3. **Analyze Combustion Scaling:** Click the **Combustion Analytics** tab to view the pressure-versus-burning-rate scatter plot, the $d^2$-law droplet burn time correlation, and the outcome breakdown by fuel.
4. **Inspect Excluded Records:** On the analytics tab, click **"17 Excluded (View Details)"** to review the records safely omitted from the regression fit.
5. **Review Quality Audit:** Click the **Data Quality & Notices** tab to read the documented audit of Test #114 and the unresolved 274 vs 275 vs 284 count explanation.

### To Restart Servers in the Future:
* **Backend:** `python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload`
* **Frontend:** `npm --prefix frontend run dev`
