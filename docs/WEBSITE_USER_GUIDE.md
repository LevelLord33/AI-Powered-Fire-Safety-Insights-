# 🧭 Flame in Freefall — Website User Guide

This user guide provides a complete, beginner-friendly walkthrough of the **Flame in Freefall** web platform. It explains every page, dashboard card, table column, filter, chart, detail modal, and interactive feature.

---

## 📑 Table of Contents
1. [General Navigation & Layout](#1-general-navigation--layout)
2. [Mission Control (`/`)](#2-mission-control-)
3. [Experiment Explorer (`/explorer`)](#3-experiment-explorer-explorer)
4. [Combustion Analytics (`/analytics`)](#4-combustion-analytics-analytics)
5. [Test Deep-Dive (`/deep-dive`)](#5-test-deep-dive-deep-dive)
6. [FLEX Protocol Explorer (`/flex-protocol`)](#6-flex-protocol-explorer-flex-protocol)
7. [FLEX Experimental Results Explorer (`/flex-results`)](#7-flex-experimental-results-explorer-flex-results)
8. [AI Research Assistant (`/assistant`)](#8-ai-research-assistant-assistant)
9. [Insight Engine (`/insights`)](#9-insight-engine-insights)
10. [Data Inventory (`/inventory`)](#10-data-inventory-inventory)
11. [Comprehensive Field & Display Label Reference Table](#11-comprehensive-field--display-label-reference-table)

---

## 1. General Navigation & Layout

* **Collapsible Sidebar (Left):** Access all 9 modules with one click. Displays quick status badges next to each item (e.g., `126 Tests`, `290 Planned`, `274 Flight`). On mobile screens, tap the menu hamburger icon in the top header to slide the drawer open.
* **Top Navigation Bar:**
  * Shows the active investigation context (`NASA BASS-II • PSI-25 / FLEX • PSI-69`).
  * Displays the **FastAPI Backend Status Pill**:
    * 🟢 **FastAPI Backend Active** (green pulse): The local Python API server is running on port 8000 and providing live query handling.
    * 🟡 **FastAPI Offline (Using Static Safe Fallback)** (amber): The backend is stopped. The frontend automatically switches to client-side cached data so the application never crashes.
* **Footer:** Displays project metadata, NASA Space Apps Challenge 2026 attribution, and references to the NASA Physical Sciences Informatics (PSI) archive.

---

## 2. Mission Control (`/`)

### Purpose
The mission overview hub introduces microgravity combustion physics and displays real-time health telemetry from the backend.

### What You See on the Page
1. **Hero Mission Banner:**
   * Summarizes why understanding fire in freefall is critical for astronaut safety aboard the ISS and future Lunar/Mars habitats.
   * **Telemetry Pills:**
     * *Hardware:* Microgravity Science Glovebox (MSG).
     * *Archived Tests:* 126 Flight Runs.
     * *Oxygen Range:* 13.6% to 22.2% $O_2$.
     * *Investigation:* NASA BASS-II / PSI-25.
2. **Backend Telemetry Strip:** Shows server connectivity, number of indexed passages (470 chunks across all datasets), and active AI mode (Google Gemini Live LLM vs. Offline RAG).
3. **Physical Science Comparison (Earth vs. Microgravity):**
   * Three expandable cards explaining key mechanisms:
     * **Absence of Buoyant Convection (🌍 vs. 🛰️):** Why microgravity flames lack buoyancy, form spherical blue flame caps, and produce virtually zero yellow soot.
     * **The Ventilation Airflow Paradox (💨):** Why gentle spacecraft ventilation fans (1–15 cm/s) sustain combustion at oxygen levels that would self-extinguish on Earth.
     * **Toxic Carbon Monoxide Spikes (⚠️):** Why incomplete low-oxygen combustion produces dangerous CO spikes (up to 950 ppm) without detectable smoke particles.
4. **Quick Navigation Hub:** Direct one-click cards to launch the Experiment Explorer, Combustion Analytics, Insight Engine, and AI Assistant.

---

## 3. Experiment Explorer (`/explorer`)

### Purpose
Search, filter, sort, and inspect all 126 authentic BASS-II solid polymer combustion flight trials conducted aboard the ISS.

### Controls & Filters
* **Search Box:** Type any keyword to search across Test IDs (e.g., `T1`, `O13a`), fuel descriptions (`PMMA`, `SIBAL`, `Nomex`), sample card labels, or astronaut flight observations.
* **Material Category Dropdown:** Filter by fuel family:
  * `PMMA Rod` (thick acrylic cylinders, 6.35 mm to 12.7 mm).
  * `PMMA Slab` (flat acrylic slabs, 1 mm to 5 mm thick).
  * `PMMA Film` (thin sheets, 100 µm to 400 µm).
  * `SIBAL Fabric` (cotton/fiberglass blend fabric).
  * `Nomex` (flame-resistant synthetic polymer).
  * `Wax Candle` (Japan Wax reference burn).
* **Lead PI Dropdown:** Filter by NASA Principal Investigator (e.g., Olson, T'ien, Ferkul).
* **Flow Direction Dropdown:** Filter by `Opposed` flow (air blows against flame propagation) or `Concurrent` flow (air blows in the direction of flame spread).
* **Oxygen Concentration Sliders ($O_2\ \%$):** Adjust minimum and maximum chamber oxygen levels (13.0% to 23.0%).
* **Reset Filters Button:** Reverts all filters back to default.
* **Export CSV Button:** Downloads the currently filtered table rows as a clean CSV file.

### Table Columns & Actions
* **Run # (`as_run_num`):** Flight sequence order (1 to 126). Click column header to sort.
* **Test ID (`test_id`):** Alphanumeric burn designation.
* **Lead PI (`principal_investigator`):** Responsible researcher.
* **Fuel Material (`fuel_material`):** Dimensions and polymer material.
* **Flow (`flow_configuration`):** Opposed vs. Concurrent airflow.
* **Velocity (`air_velocity_cms`):** Air speed in cm/s.
* **$O_2$ Init % / $O_2$ Final %:** Chamber oxygen before ignition and after flame extinction.
* **CO Final ppm:** Trace toxic carbon monoxide concentration in parts-per-million.
* **Inspect Button:** Opens a modal window showing complete telemetry for that run, with a direct button to open the **Test Deep-Dive** page.

---

## 4. Combustion Analytics (`/analytics`)

### Purpose
Interactive data visualizations demonstrating the physical relationships discovered in BASS-II microgravity burns.

### Visualizations Included
1. **Extinction Boundary Scatter Plot:**
   * **X-Axis:** Airflow Velocity ($cm/s$).
   * **Y-Axis:** Initial Chamber Oxygen Concentration ($O_2\ \%$).
   * **Data Points:** Individual flight burns classified by outcome:
     * 🟢 **Sustained Flame:** Flame burned continuously throughout the test.
     * 🟡 **Extinguished / Quenched:** Flame suffered low-speed radiative quenching or blowoff extinction.
     * ⚪ **Observation Recorded:** Transient ignition or sensor observation.
   * **Hover Tooltip:** Shows Test ID, material, exact $O_2$ %, air velocity, and flow mode.
2. **Carbon Monoxide Generation Chart:**
   * **View Switcher:** Toggle between **"By Fuel Category"** (average CO generated per fuel) and **"Top 10 Severe Spikes"** (individual runs with extreme CO).
   * **Y-Axis:** Final CO Concentration ($ppm$).
   * **Key Scientific Insight:** Highlights Test `O13a` generating **950 ppm of CO** (the highest quantifiable numeric reading), while subsequent burn `O13b` exceeded the instrument's 1,000 ppm sensor range with an over-range (`+OR`) indication, illustrating the severe atmospheric poisoning hazard of smoldering materials in spacecraft.
3. **Combustion Stoichiometry ($\Delta O_2$ vs. $\Delta CO_2$):**
   * **X-Axis:** Oxygen Consumed ($\Delta O_2\ \%$).
   * **Y-Axis:** Carbon Dioxide Produced ($\Delta CO_2\ \%$).
   * **Linear Fit Line:** Demonstrates clean stoichiometric proportionality confirming mass conservation in the sealed MSG chamber.

---

## 5. Test Deep-Dive (`/deep-dive`)

### Purpose
A detailed telemetry console for examining a single individual BASS-II experiment record.

### Controls
* **Experiment Selector Dropdown:** Select any of the 126 flight tests (e.g., `T1`, `O13a`, `B1`).
* **Previous / Next Buttons:** Step through flight runs sequentially.
* **Search / Quick Input:** Type a test ID and press Enter to jump directly to it.

### Display Cards
1. **Hardware & Configuration Card:** Sample ID, Fuel Material, Lead PI, GMT Date, Time Range, Flow Configuration, Flow Restrictor Baffle Plate, Fan Setting, and Air Velocity.
2. **Gas Telemetry & Depletion Card:**
   * Initial vs. Final Oxygen ($O_2\ \%$) and calculated $\Delta O_2$ consumed.
   * Calibrated Initial vs. Final Oxygen.
   * Initial vs. Final Carbon Dioxide ($CO_2\ \%$) and calculated $\Delta CO_2$ produced.
   * Initial vs. Final Carbon Monoxide ($CO\text{ ppm}$) with color-coded safety badges (Green: $<50\text{ ppm}$, Amber: $50-200\text{ ppm}$, Red: $>200\text{ ppm}$).
3. **NASA Flight Log & Observations:** Verbatim astronaut log entries, ignition behavior, flame appearance, and anomalies from NASA/TM-20210011385 Table A.5.

---

## 6. FLEX Protocol Explorer (`/flex-protocol`)

### Purpose
Explore the **290 pre-flight planned protocol conditions** for the Flame Extinguishment Experiment (FLEX / PSI-69).

> ⚠️ **Critical Notice:** These 290 rows represent **planned scientific test matrix specifications**, *not* measured flight outcomes.

### Controls & Charts
* **Summary KPI Cards:** Total planned conditions (290), fuels (Methanol: 145, Heptane: 145), pressure range (0.5 to 3.0 atm), and suppressants (4 categories: CO2: 128, He: 56, SF6: 56, and None / pure N2 baseline: 50). Nitrogen ($N_2$) serves as the carrier diluent and balance gas ($X_{N2} > 0$ in 278 conditions; $X_{N2} = 0.0$ in 12 high-suppressant conditions).
* **Matrix Scatter Chart:** Chamber Pressure (atm) vs. Oxygen Mole Fraction ($X_{O2}$).
* **Pressure Distribution Bar Chart:** Visualizes condition counts across discrete pressure levels (0.5, 0.7, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0 atm).
* **Filters:** Search box, Fuel dropdown, Suppressant dropdown, Fiber Support dropdown, Pressure inputs, and Oxygen fraction inputs.
* **Table Columns:** Test No, Fuel, Suppressant, Fiber Support, Pressure (atm), $X_{O2}$, $X_{supp}$, Derived $X_{N2}$ ($1 - X_{O2} - X_{supp}$), Flow Velocity (cm/s), Initial Droplet Diameters (mm).
* **Inspect Button:** Opens a modal displaying source citations: Section 5.3, Tables 6–12, physical PDF pages 46–55 of `FLEX_EIRD_v4.pdf`.

---

## 7. FLEX Experimental Results Explorer (`/flex-results`)

### Purpose
Explore the **274 locally available authentic flight experiments** conducted in the Combustion Integrated Rack (CIR) between March 2009 and December 2011.

### Tabbed Interface
1. **Flight Records Tab:**
   * Searchable, filterable table with 25 records per page.
   * Filters: Fuel (Methanol, Heptane), Outcome (Extinction, Disruption, Completion), Pressure (mmHg), $O_2$ mole fraction, and Burning Rate ($mm^2/s$).
   * Columns: Test #, Run ID (`flex_identifier`), Date, GMT, Fuel, Pressure (mmHg & atm), $X_{O2}$, Initial Droplet Diameter ($d_0$), Extinction Diameter ($d_{ext}$), Burning Rate ($K$), Burn Time ($t_b$), Outcome badge.
2. **Analytics Tab:**
   * **Outcome Distribution Chart:** Extinction (186, 67.9%), Disruption (61, 22.3%), Completion (27, 9.9%).
   * **Fuel Breakdown:** Methanol (157 runs, avg burning rate $0.47\text{ mm}^2/\text{s}$), Heptane (117 runs, avg burning rate $0.54\text{ mm}^2/\text{s}$).
   * **Pressure vs. Burning Rate Scatter Plot:** Plots chamber pressure against burning rate $K$, featuring a linear regression fit with Test #114 excluded.
3. **Data Quality Tab:**
   * Detailed breakdown of sensor completeness and missing data.
   * Explains why 16 burning rates are missing (droplet disruptions) and 77 extinction diameters are unrecorded (complete burnouts or premature flame loss).
   * **Telemetry Anomaly Card (Test #114):** Details the $0.0\text{ mmHg}$ pressure reading on `9/6/2010` and explains why it is flagged.

---

## 8. AI Research Assistant (`/assistant`)

### Purpose
Ask natural-language scientific questions grounded strictly in authentic NASA reports and flight datasets.

### Controls & Features
* **Dataset Selector Tabs:**
  1. **All Datasets:** Searches across all 3 datasets (690 records, 470 text chunks).
  2. **BASS-II Experimental Records:** Restricts retrieval to the 126 solid combustion burns and NASA/TM-20210011385.
  3. **FLEX Planned Conditions:** Restricts retrieval to the 290 protocol matrix conditions from `FLEX_EIRD_v4.pdf`.
  4. **FLEX Experimental Results:** Restricts retrieval to the 274 flight droplet burns from `PSI-69_Experimental table_FLEX.csv`.
* **Suggested Question Pills:** Click any pre-configured question to test the assistant instantly.
* **Dual Operation Mode:**
  * **Live Generative LLM:** Calls Google Gemini when an API key is configured.
  * **Local Evidence Synthesis:** Runs 100% locally with zero external API calls when offline or unconfigured.
* **Citations Drawer:** Every answer displays verified source citations with relevance scores, exact document filenames, sections, page numbers, and external NASA PSI links.
* **Cross-Dataset Guidance:** If you ask about liquid droplets while the BASS-II tab is active, the assistant politely alerts you and suggests switching to the FLEX tab.

---

## 9. Insight Engine (`/insights`)

### Purpose
A structured scientific calculation engine for searching, pairing, and comparing combustion trials with safety compatibility guardrails.

### Two Operational Modes
1. **Smart Experiment Matcher Tab:**
   * Enter a query (e.g., `high velocity opposed flow`) or apply parameter filters.
   * Returns ranked flight tests with explainable matching reasons and key parameters.
2. **Scientific Comparison Engine Tab:**
   * Compares 2 to 4 experiments side-by-side in a unified telemetry matrix.
   * Calculates mathematical deltas ($\Delta O_2$, $\Delta\text{ Velocity}$, $\Delta CO$, etc.).
   * **Scientific Compatibility Guardrails:** Flags incompatible comparisons before misleading conclusions can be drawn:
     * *Cross-Material Warning:* Comparing PMMA with Nomex or SIBAL flags differences in pyrolysis temperature and heat of combustion.
     * *Aerodynamic Mismatch:* Comparing opposed flow with concurrent flow warns of fundamentally different convective boundary layer physics.
     * *Hardware / Igniter Anomaly:* Warns if an experiment experienced a broken igniter wire or partial ignition.
   * **4-Tier Epistemological Breakdown:**
     * **Tier 1 — Directly Observed Facts:** Raw sensor measurements and flight notes.
     * **Tier 2 — Derived & Calculated Results:** Consumed gas fractions, burning rate slopes.
     * **Tier 3 — Physical Interpretation:** Aerodynamic quenching vs. blowoff regimes.
     * **Tier 4 — Documented Scientific Limitations:** Known measurement uncertainties and unmeasured parameters.

---

## 10. Data Inventory (`/inventory`)

### Purpose
Provides transparent provenance and academic citation records for every document, raw table, and processed dataset in the repository.

### Features
* **Search & Filter:** Filter inventory items by category (`Processed Datasets`, `Raw Metadata`, `PDF Reports`).
* **File Details:** Displays exact relative file paths, file sizes, record counts, and SHA-256 verification status.
* **Academic Citations Panel:** One-click copy buttons for formal **APA** and **BibTeX** citations referencing *NASA/TM-20210011385* and DOI `10.60555/4qc4-de67`.

---

## 11. Comprehensive Field & Display Label Reference Table

| Website Page | Field / Display Label | Meaning | Unit | Source or Calculation |
| :--- | :--- | :--- | :--- | :--- |
| **Mission Control** | Hardware | Primary space experiment facility | None | NASA MSG facility |
| **Mission Control** | Archived Tests | Total verified BASS-II flight runs | Count | 126 records in `bass_ii_experiments.csv` |
| **Mission Control** | Oxygen Range | Calibrated initial oxygen bounds | % | Min (13.6%) and Max (22.2%) in dataset |
| **Experiment Explorer** | Run # | Flight execution sequence number | None | Directly sourced (`as_run_num`) |
| **Experiment Explorer** | Test ID | Alphanumeric test designation | None | Directly sourced (`test_id`) |
| **Experiment Explorer** | Fuel Material | Specimen size and polymer material | None | Directly sourced (`fuel_material`) |
| **Experiment Explorer** | Flow | Relative airflow orientation | None | `Opposed` or `Concurrent` |
| **Experiment Explorer** | Air Velocity | Forced airflow speed in duct | cm/s | Directly sourced (`air_velocity_cms`) |
| **Experiment Explorer** | $O_2$ Init % / $O_2$ Final % | Calibrated pre- and post-burn oxygen | % | Sourced from MSG gas sensors |
| **Experiment Explorer** | CO Final ppm | Post-burn toxic Carbon Monoxide | ppm | Sourced from MSG electro-chemical sensor |
| **Combustion Analytics** | Quenched vs Sustained | Flame survival outcome | Category | Classified based on NASA observations |
| **Combustion Analytics** | $\Delta O_2$ Consumed | Net oxygen loss during burn | % | Calculated: $O_{2,\text{initial}} - O_{2,\text{final}}$ |
| **Combustion Analytics** | $\Delta CO_2$ Produced | Net carbon dioxide generated | % | Calculated: $CO_{2,\text{final}} - CO_{2,\text{initial}}$ |
| **FLEX Protocol Explorer** | Test No | Protocol condition row number | None | Directly sourced from EIRD Table (1–290) |
| **FLEX Protocol Explorer** | Pressure (atm) | Target chamber pressure | atm | Directly sourced (`pressure_atm`) |
| **FLEX Protocol Explorer** | $X_{O2}$ | Target oxygen mole fraction | None | Directly sourced (`oxygen_mole_fraction`) |
| **FLEX Protocol Explorer** | Derived $X_{N2}$ | Inferred carrier nitrogen fraction | None | Calculated: $1.0 - X_{O2} - X_{\text{supp}}$ |
| **FLEX Results Explorer** | Test # | Chronological flight test index | None | Directly sourced (`flex_test_num`, 1–274) |
| **FLEX Results Explorer** | Pressure (mmHg) | Measured ambient chamber pressure | mmHg | Directly sourced (`ambient_pressure_mmhg`) |
| **FLEX Results Explorer** | Burning Rate ($K$) | Droplet regression rate constant | $mm^2/s$ | Sourced from video $d^2$-law analysis |
| **FLEX Results Explorer** | Burn Time ($t_b$) | Duration of visible flame combustion | s | Sourced / parsed from flight video |
| **FLEX Results Explorer** | Outcome | Combustion end-state | Badge | `Extinction`, `Disruption`, or `Completion` |
| **Insight Engine** | Incompatibility Warning | Physical mismatch alert | Warning | Algorithmic check on materials & aerodynamics |
| **Data Inventory** | SHA-256 Checksum | Cryptographic file integrity hash | Hex | Computed from local file bytes |
