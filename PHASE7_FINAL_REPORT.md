# Phase 7: Evidence-to-Insight Engine — Final Report
**NASA Space Apps Challenge: Flame in Freefall**  
**Investigation:** Burning and Suppression of Solids - II (BASS-II / PSI-25) on the International Space Station (ISS)  
**Status:** Completed & Empirically Verified  

---

## 1. What New Features Were Built

In Phase 7, we built the **Evidence-to-Insight Engine**, elevating Flame in Freefall from a standard chatbot into an interactive, grounded scientific discovery system for actual microgravity combustion flight data.

### Feature 1: Scientific Data Reconciliation & Audit
- Reconciled all 126 NASA BASS-II flight tests, identifying the exact physical and operational status of every run without inventing classifications.
- Mathematically verified the stoichiometric correlation ($|r| = 0.982, n=118$), clarifying the sign convention between oxygen consumption and atmospheric oxygen depletion.
- Diagnosed the live Google Gemini API status: the API key is valid and configured; when daily free-tier request limits (`HTTP 429`) occur, the system transitions to verifiable offline evidence synthesis without hallucinating.

### Feature 2: Smart Experiment Matcher
- Located at `/insights` under the **Smart Experiment Matcher** tab.
- Allows users to search the 126 actual NASA flight records using scientific inquiries (e.g., *"PMMA extinction at low airflow"*, *"SIBAL blowoff at high airspeed"*).
- Includes genuine experimental filters: Material Category (PMMA Rod, Thin PMMA Film, SIBAL Fabric, Nomex Fabric), Flow Geometry (Opposed, Concurrent), Flame Outcome, Initial Oxygen range, and Airflow Velocity range.
- Ranks experiments with **explainable scoring criteria** and lists specific reasons why each run matched (e.g., fuel match, velocity regime, astronaut logbook mention).
- Distinguishes **Exact Matches** from **Partial Matches** and flags uninstrumented sensors.
- Displays an explicit scientific disclaimer: *Relevance score indicates condition alignment, NOT a fire-risk probability.*

### Feature 3: Scientific Comparison Engine
- Allows side-by-side comparison of 2 to 4 flight experiments in an interactive matrix.
- Built-in **Scientific Compatibility Diagnostics**:
  - **[High Severity] Material Discrepancy:** Warns when comparing different polymers (e.g. Cotton fabric vs solid PMMA rod), explaining that differing heats of combustion and pyrolysis kinetics prevent attributing flame differences to airflow alone.
  - **[Moderate Severity] Aerodynamic Mismatch:** Warns when comparing opposed flow (stagnation point) against concurrent flow (downstream boundary layer).
  - **[Informational] Hardware Complications:** Flags tests where astronaut notes report broken igniter wires or cable issues.
- Calculates mathematical differences with units: absolute difference in $\text{O}_2$ consumed ($\% \text{ vol}$), toxic carbon monoxide emitted ($\text{ppm}$), and airflow speed ($\text{cm/s}$).

### Feature 4: 4-Tier Evidence-to-Insight Synthesis
For every comparison, findings are separated into 4 distinct epistemological tiers:
1. **🔬 Tier 1: Observed Evidence:** Direct empirical readings recorded by NASA sensors and astronaut logbook entries.
2. **📐 Tier 2: Calculated Results:** Mathematically derived values (stoichiometric oxygen consumption, CO emission deltas, airflow velocity ratios).
3. **💡 Tier 3: Scientific Interpretation:** Physical microgravity combustion theory suggested by the data (radiative quenching at low flow, residence time, thermal inertia).
4. **⚠️ Tier 4: Documented Limitations & Unproven Causality:** Strict physical boundaries (single-run flight data constraints, CIR glovebox pressure drift, unobserved local 3D flow fields, and caution against claiming unsupported single-factor causality).
- Cites official NASA Technical Memorandum `NASA/TM-20210011385` page numbers, sections, and the persistent DOI link (`10.60555/4qc4-de67`).

---

## 2. How This Differs From a General Chatbot

| General AI Chatbot (e.g. ChatGPT / Claude) | Flame in Freefall Evidence-to-Insight Engine |
|---|---|
| **Plausible Hallucinations:** May invent plausible-sounding space experiments or make up numbers. | **Zero Invention Guarantee:** Queries only the 126 verified NASA flight records from BASS-II. |
| **Opaque Scoring:** Often assigns arbitrary "risk scores" or "danger percentages". | **Explainable Matching:** Scores reflect condition matching percentage with transparent itemized reasons. |
| **Unchecked Comparisons:** Will freely compare incompatible tests (e.g. comparing thin fabric to thick acrylic rods) without alerting the user. | **Scientific Guardrails:** Actively detects and warns against cross-material or aerodynamic mismatches before drawing conclusions. |
| **Blurring Evidence & Opinion:** Mixes what was observed with conjecture in a single paragraph. | **Strict 4-Tier Separation:** Rigorously isolates Observed Facts from Derived Calculations, Scientific Interpretation, and Limitations. |
| **Vague Sources:** Cites generic web links or unverified titles. | **Exact NASA Provenance:** Cites specific pages and tables in `NASA/TM-20210011385` and links to the NASA PSI Repository. |

---

## 3. Data & Calculations Used

1. **Experimental Telemetry Dataset (`bass_ii_experiments.csv`):**
   - 126 flight runs on the ISS Microgravity Science Glovebox (MSG).
   - Variables used: `test_id`, `fuel_material`, `material_category`, `flow_configuration`, `air_velocity_cms`, `air_velocity_numeric`, `calibrated_initial_o2_pct`, `calibrated_final_o2_pct`, `delta_o2_pct`, `final_co_ppm`, `delta_co_ppm`, `observations`.
2. **Document Index (`search_index.json`):**
   - 318 text chunks extracted directly from `bass_ii_summary_report.pdf` (144 pages, NASA/TM-20210011385).
3. **Stoichiometric Delta Derivations:**
   - Oxygen Consumed: $\Delta \text{O}_{2,\text{consumed}} = \text{Initial O}_2 - \text{Final O}_2$ ($mean = +0.484\% \text{ vol}$).
   - Carbon Dioxide Produced: $\Delta \text{CO}_{2,\text{produced}} = \text{Final CO}_2 - \text{Initial CO}_2$ ($mean = +0.393\% \text{ vol}$).
   - Pearson correlation magnitude: $|r| = 0.98173 \approx 0.982$ across $n = 118$ paired test records.
4. **Explainable Scoring Formula:**
   - Total Match Score = $\min\left(1.0, \text{Baseline Filter Weight } (0.30) + \sum \text{Lexical \& Parameter Match Weights}\right)$.
   - Clamped to $0.98$ for partial matches; $1.0$ only when all search tokens and instrumented fields are verified.

---

## 4. Test Verification Results

### Automated Backend Tests (`tests/test_backend_api.py`)
All **14 of 14 automated tests passed** cleanly:
- `test_health_endpoint` — **PASSED** (200 OK, 126 experiments, 318 passages, ISS platform)
- `test_summary_endpoint` — **PASSED** (13.6% min O₂, 22.2% max O₂, 4 material classes)
- `test_experiments_listing_and_pagination` — **PASSED** (126 total, 10 per page, 13 pages)
- `test_experiments_filtering` — **PASSED** (Material filtering, O₂ bounds, search term filtering)
- `test_single_experiment_lookup` — **PASSED** (Run T1 lookup and 404 on nonexistent ID)
- `test_extinction_boundary_analytics` — **PASSED** (Initial O₂ vs air velocity coordinates)
- `test_gas_correlations_analytics` — **PASSED** (Stoichiometry Pearson correlation $r = 0.982$)
- `test_assistant_query_supported` — **PASSED** (Grounded retrieval with citations)
- `test_assistant_query_unsupported_refusal` — **PASSED** (Penguin inquiry rejected without hallucinating)
- `test_inventory_endpoint` — **PASSED** (Verified files manifest, 318 passages, DOI link)
- `test_insights_experiment_matching` — **PASSED** (Query matching, explainable score, match reasons)
- `test_insights_experiment_comparison_compatible` — **PASSED** (Side-by-side data, 4-tier insight generation)
- `test_insights_experiment_comparison_incompatible_warning` — **PASSED** (Material Discrepancy warning emitted)
- `test_insights_experiment_comparison_insufficient_records` — **PASSED** (Input validation refusal on < 2 IDs)

### Frontend Production Build (`npm run build`)
- TypeScript compilation (`tsc -b`): **0 errors**.
- Vite production bundle: **✓ built in 7.54s** (`dist/assets/index-BR8iiHn7.js` 728 kB, `dist/assets/index-BgjmetlB.css` 32.79 kB).

### End-to-End Browser Testing
- Successfully loaded `http://127.0.0.1:5173/insights`.
- Executed research queries and observed explainable match scores, badges, and astronaut quotes.
- Triggered benchmark comparison presets, confirming real-time rendering of incompatibility warnings, evidence matrix, and 4-tier cards.
- Recorded browser walkthrough: [phase7_compare_demo_1792680220644.webp](file:///C:/Users/Admin/.gemini/antigravity-ide/brain/47e16835-72fb-4c26-a9a9-a79680c96cd8/phase7_compare_demo_1792680220644.webp).

---

## 5. What Remains Incomplete or Scientifically Uncertain

1. **Unrepeated Exploratory Flight Points:**
   Microgravity testing on the ISS is severely constrained by astronaut crew time and chamber gas refills. Most test points in BASS-II were run once or twice under varied fan potentiometer sweeps rather than as 30-run statistical batches.
2. **Glovebox Atmospheric Drift:**
   The Microgravity Science Glovebox (MSG) sealed chamber experienced slight ambient pressure and temperature variations across flight test days, which are noted in astronaut observations but not continuously recorded in the flight matrix table.
3. **Hot-Wire Anemometer Local Flow Field:**
   The recorded `air_velocity_cms` measures upstream duct velocity, not the microscale 3D stagnation or recirculating eddy flow immediately surrounding the burning fuel surface.
4. **Gemini Live Quota:**
   Live Google Gemini calls depend on external API quota limits. When daily free limits (`HTTP 429`) occur, the system relies on verified offline synthesis.

---

## 6. How to Demonstrate Value to NASA Space Apps Judges

When presenting Flame in Freefall to the Space Apps judges, highlight these 4 key talking points:

1. **Demonstrate the "Compare Presets" on the Insight Engine:**
   - Click the preset `⚠️ T1 vs P1 (Cross-Material Warning Demo)`.
   - Point out to judges: *"Notice how our engine doesn't blindly compare numbers like a naive AI. It actively warns the astronaut or safety officer that cotton fabric (SIBAL) and solid acrylic (PMMA) have fundamentally different pyrolysis kinetics."*
2. **Show the 4-Tier Epistemological Separation:**
   - Walk through the 4 cards: *"We never mix direct NASA observations with our own interpretations. Tier 1 is what the astronaut saw. Tier 2 is verified mathematics. Tier 3 is microgravity combustion theory. Tier 4 is what cannot be claimed."*
3. **Show Explainable Search Matching:**
   - Type *"PMMA extinction at low flow"* into the Smart Matcher.
   - Show how each experiment displays *why* it matched, down to the astronaut logbook quotes and specific page numbers in `NASA/TM-20210011385`.
4. **Highlight Grounded Scientific Honesty:**
   - Show that when an unsupported question is asked (like penguin biology), the assistant refuses to answer rather than making up space facts.
   - Point to the verified stoichiometric line ($|r| = 0.982$) showing real physics in action on the Space Station.
