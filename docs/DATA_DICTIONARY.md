# 📖 Flame in Freefall — Complete Scientific Data Dictionary

This document provides a comprehensive, field-by-field reference for all three datasets used in the **Flame in Freefall** project. Every column, data type, unit of measurement, calculation rule, and website location is documented below.

---

## 📑 Table of Contents
1. [Core Principles of Data Integrity](#1-core-principles-of-data-integrity)
2. [Dataset A — BASS-II Experimental Records (126 Runs)](#2-dataset-a--bass-ii-experimental-records)
3. [Dataset B — FLEX Planned Protocol Matrix (290 Conditions)](#3-dataset-b--flex-planned-protocol-matrix)
4. [Dataset C — FLEX As-Run Flight Experimental Results (274 Tests)](#4-dataset-c--flex-as-run-flight-experimental-results)
5. [Summary of Missing Data & Anomaly Handling](#5-summary-of-missing-data--anomaly-handling)

---

## 1. Core Principles of Data Integrity

To ensure absolute adherence to NASA scientific standards:
1. **Separation of Planned vs. Measured Data:** Pre-flight engineering protocols (`flex_experiments.csv`) are strictly segregated from measured flight telemetry (`flex_experimental_results.csv`). They must never be merged row-by-row.
2. **Preservation of Missing Telemetry:** Missing sensor values are preserved as `null` / `NaN`. They are **never replaced with zero**, which would corrupt physical calculations.
3. **Telemetry Anomaly Handling (Test #114):** Test #114 records an ambient pressure of `0.0 mmHg`. The raw number is preserved verbatim to maintain historical truth, but is automatically excluded from pressure-based regressions.

---

## 2. Dataset A — BASS-II Experimental Records

* **File Path:** `data/processed/bass_ii_experiments.csv`
* **NASA Investigation:** BASS-II (Burning and Suppression of Solids - II), Archive ID: **PSI-25**
* **Primary Source Report:** NASA Technical Memorandum *NASA/TM-20210011385* (October 2021), Table A.5
* **Total Flight Records:** **126 flight burn tests**
* **Total Columns:** **20 columns**
* **Platform & Hardware:** International Space Station (ISS) Microgravity Science Glovebox (MSG) flow duct
* **Nature of Data:** Report-derived experimental flight records with source-reported sensor readings and astronaut log observations.

### Field Definitions Table

| Display Name | CSV Column Name | Data Type | Simple English Meaning | Unit | Classification | Missing Values? | UI Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Run #** | `as_run_num` | Integer | Chronological flight execution sequence number aboard the ISS | None | Directly Sourced | None (0 missing) | Experiment Explorer table, Test Deep-Dive, Sorting |
| **Test ID** | `test_id` | String | Official alphanumeric identifier assigned to the burn (e.g., `T1`, `B1`, `O13a`) | None | Directly Sourced | None (0 missing) | Search, Explorer table, Analytics tooltips, Deep-Dive selector |
| **Lead PI** | `principal_investigator` | String | Name of the NASA Principal Investigator leading the specific material test series | None | Directly Sourced | None (0 missing) | Filter dropdown, Explorer table, Deep-Dive hardware card |
| **Date (GMT)** | `date_gmt` | String | Calendar date of flight execution in Greenwich Mean Time (e.g., `3/13/2014`) | Date | Directly Sourced | 1 missing (As-run 104 has unrecorded GMT date) | Explorer table, Deep-Dive telemetry card |
| **Time Range** | `time_range` | String | Flight burn operational time window in GMT (e.g., `18:41 - 18:48`) | Time | Directly Sourced | 36 missing (unrecorded operational windows in Table A.5) | Deep-Dive hardware card |
| **Sample ID** | `sample_id` | String | NASA hardware canister / sample card label (e.g., `S/N 1`, `Sample 4`) | None | Directly Sourced | None (0 missing) | Deep-Dive hardware card |
| **Fuel Material** | `fuel_material` | String | Specific physical fuel specimen: dimensions, shape, and polymer type | None | Directly Sourced | None (0 missing) | Explorer table & filter, Analytics charts, Deep-Dive |
| **Flow Mode** | `flow_configuration` | String | Airflow direction relative to flame propagation: `Opposed` or `Concurrent` | None | Directly Sourced | None (0 missing) | Explorer filter, Analytics groupings, Insight Engine guardrails |
| **Flow Restrictor** | `flow_restrictor` | String | Aerodynamic baffle plate installed in duct (`None`, `Triangular`, `3:1`) | None | Directly Sourced | None (0 missing) | Deep-Dive hardware card |
| **Fan Setting** | `fan_setting` | Float | Microgravity Science Glovebox internal duct fan knob setting (0.0 to 10.0) | None | Directly Sourced | 14 missing (tests conducted with zero forced flow) | Deep-Dive hardware card |
| **Air Velocity** | `air_velocity_cms` | String / Float | Forced convective airflow velocity along the duct | cm/s | Directly Sourced | None (0 missing; values range from `0` to `40.0 cm/s`) | Analytics X-axis, Explorer table, Deep-Dive metric pill |
| **Calibrated O₂ Init** | `calibrated_initial_o2_pct` | Float | Sensor-calibrated oxygen volume fraction inside the MSG chamber before ignition | % | Sourced / Calibrated | None (0 missing; range: 13.6% to 22.2%) | Explorer filter, Analytics Y-axis, Deep-Dive KPI pill |
| **Calibrated O₂ Final** | `calibrated_final_o2_pct` | Float | Sensor-calibrated oxygen volume fraction inside MSG chamber after flame extinction | % | Sourced / Calibrated | 1 missing (Test O13 had sensor anomaly) | Explorer table, Deep-Dive gas panel |
| **Raw O₂ Init** | `initial_o2_pct` | Float | Uncalibrated raw sensor reading of chamber oxygen level before ignition | % | Directly Sourced | 2 missing | Deep-Dive gas telemetry panel |
| **Raw O₂ Final** | `final_o2_pct` | Float | Uncalibrated raw sensor reading of chamber oxygen level after burn completion | % | Directly Sourced | 5 missing | Deep-Dive gas telemetry panel |
| **CO₂ Init** | `initial_co2_pct` | Float | Carbon Dioxide volume fraction inside chamber before ignition | % | Directly Sourced | 2 missing | Deep-Dive gas telemetry panel |
| **CO₂ Final** | `final_co2_pct` | Float | Carbon Dioxide volume fraction inside chamber after burn completion | % | Directly Sourced | 6 missing | Analytics Stoichiometry plot ($\Delta CO_2$), Deep-Dive |
| **CO Init** | `initial_co_ppm` | Float | Carbon Monoxide trace concentration inside chamber before ignition | ppm | Directly Sourced | 13 missing | Deep-Dive gas telemetry panel |
| **Final CO** | `final_co_ppm` | Float | Carbon Monoxide concentration after burn; reaches numeric peak of 950 ppm in Test O13a, while Test O13b exceeded the 1,000 ppm sensor range (+OR) | ppm | Directly Sourced | 10 missing (unmeasured burns or over-range +OR recorded in notes) | Explorer table, Analytics CO chart, Deep-Dive toxic warning |
| **Observations** | `observations` | String | Verbatim astronaut flight notes, ignition outcomes, flame color, and quench events | Text | Directly Sourced | None (0 missing; contains authentic NASA notes) | Search filter, Deep-Dive flight log card |

---

## 3. Dataset B — FLEX Planned Protocol Matrix

* **File Path:** `data/processed/flex_experiments.csv`
* **NASA Investigation:** Flame Extinguishment Experiment (FLEX), Archive ID: **PSI-69**
* **Primary Source Report:** *NASA FLEX Experiment Interface and Requirements Document (FLEX_EIRD_v4.pdf)*, Section 5.3, Tables 6 through 12 (physical PDF pages 46–55)
* **Total Planned Conditions:** **290 target conditions**
* **Total Columns:** **16 columns**
* **Platform & Hardware:** Combustion Integrated Rack (CIR) chamber
* **Nature of Data:** **Pre-flight target protocol specifications**. These are engineered target test requirements, **not** measured experimental results.

### Field Definitions Table

| Display Name | CSV Column Name | Data Type | Simple English Meaning | Unit | Classification | Missing Values? | UI Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Test No** | `test_no` | Integer | Protocol specification row number (1 to 290) | None | Directly Sourced | None (0 missing) | Protocol Explorer table, Search, Detail modal |
| **Investigation** | `investigation` | String | NASA research program title (`FLEX`) | None | Directly Sourced | None (0 missing) | Summary badges, Detail modal |
| **Fuel** | `fuel` | String | Target liquid hydrocarbon fuel: `Methanol` ($CH_3OH$) or `Heptane` ($C_7H_{16}$) | None | Directly Sourced | None (145 Methanol, 145 Heptane) | Protocol Explorer filter, Table, Detail modal |
| **Diluent** | `diluent` | String | Atmospheric carrier gas family (`N2` in database column; actual balanced fraction is > 0 in 278 conditions and 0.0 in 12 conditions) | None | Directly Sourced | None (0 missing) | Protocol Explorer table, Detail modal |
| **Suppressant** | `suppressant` | String | Added fire-extinguishing gaseous agent (`CO2`, `He`, `SF6`, or `None` / Baseline) | None | Directly Sourced | 50 missing (50 baseline tests without added suppressant, using pure N2 diluent) | Protocol filter dropdown, KPI summary, Detail modal |
| **Fiber Support** | `fiber_support` | String | Droplet tethering mode: `Free Droplet` (free-floating) or `Supported` (tethered on fiber) | None | Directly Sourced | None (0 missing) | Protocol filter dropdown, Table column, Detail modal |
| **Flow Velocity** | `flow_velocity_cms` | Float | Target forced air speed inside chamber (`0.0` or `1.5 cm/s`) | cm/s | Directly Sourced | None (0 missing) | Protocol table, Detail modal |
| **Initial Droplet Diameters** | `initial_droplet_diameters_mm` | String | Target droplet size specifications (e.g., `3.0 mm`, `5.0 mm`, or `3, 5 mm`) | mm | Directly Sourced | None (0 missing) | Protocol table column, Detail modal |
| **Chamber Pressure** | `pressure_atm` | Float | Target total chamber pressure (discrete levels: 0.5, 0.7, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0) | atm | Directly Sourced | None (0 missing; range: 0.5 to 3.0 atm) | Pressure filter, Scatter plot X-axis, Bar chart |
| **O₂ Mole Fraction** | `oxygen_mole_fraction` | Float | Target volume fraction of oxygen in test environment ($X_{O2}$: 0.10 to 0.40) | None | Directly Sourced | None (0 missing; range: 0.10 to 0.40) | O₂ slider filter, Scatter plot Y-axis, Table |
| **Suppressant Fraction** | `suppressant_mole_fraction` | Float | Target volume fraction of fire suppressant gas ($X_{supp}$) | None | Directly Sourced | None (0 missing; ranges from 0.00 to 0.60) | Protocol table column, Detail modal |
| **Nitrogen Fraction** | `nitrogen_mole_fraction` | Float | Derived inert gas volume fraction: $X_{N2} = 1.0 - X_{O2} - X_{supp}$ (ranges 0.00 to 0.90; exactly 0.0 in 12 conditions) | None | Transformed / Calculated | None (0 missing; balances gas mixture to 1.0) | Protocol table column, Detail modal |
| **Source Document** | `source_document` | String | Official NASA reference publication filename (`FLEX_EIRD_v4.pdf`) | None | Directly Sourced | None (0 missing) | Citations drawer, Detail modal |
| **Source Section** | `source_section` | String | Specific section within the document (`Section 5.3`) | None | Directly Sourced | None (0 missing) | Citations drawer, Detail modal |
| **Source Page** | `source_page` | String | Physical page in source document (`46` through `55`) | None | Directly Sourced | None (0 missing) | Citations drawer, Detail modal |
| **Record Type** | `record_type` | String | Clarifying metadata tag (`Planned Protocol Condition`) | None | Sourced Metadata | None (0 missing) | Top badges, Guardrail indicators |

---

## 4. Dataset C — FLEX As-Run Flight Experimental Results

* **File Path:** `data/processed/flex_experimental_results.csv`
* **NASA Investigation:** Flame Extinguishment Experiment (FLEX), Archive ID: **PSI-69**
* **Primary Source Catalog:** NASA Physical Sciences Informatics raw catalog table `PSI-69_Experimental table_FLEX.csv`
* **Total Locally Available Records:** **274 authentic flight experiments**
* **Total Columns:** **20 columns**
* **Platform & Hardware:** Combustion Integrated Rack (CIR) chamber aboard the ISS
* **Nature of Data:** **As-run photographic and telemetry measurements** from flight operations between March 2009 and December 2011.

### Field Definitions Table

| Display Name | CSV Column Name | Data Type | Simple English Meaning | Unit | Classification | Missing Values? | UI Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Test #** | `flex_test_num` | Integer | Chronological test sequence number in local catalog (1 to 274) | None | Directly Sourced | None (0 missing) | Results Explorer table, Search, Detail modal |
| **Run ID** | `flex_identifier` | String | NASA flight run code (e.g., `C11M001`, `193F001`) | None | Directly Sourced | None (0 missing) | Results Explorer search & table, Detail modal |
| **Test Date** | `test_date` | String | Flight burn execution date (e.g., `3/10/2009`) | Date | Directly Sourced | None (0 missing) | Results Explorer table, Detail modal |
| **Test GMT** | `test_gmt` | String | Exact flight burn execution timestamp (e.g., `18:48:35`) | Time | Directly Sourced | 1 missing (Test #274 has unrecorded GMT time) | Results Explorer table, Detail modal |
| **Fuel** | `fuel` | String | Liquid droplet fuel burned: `Methanol` (157 runs) or `Heptane` (117 runs) | None | Directly Sourced | None (0 missing) | Results Explorer filter, Analytics pie/bar, Detail modal |
| **Pressure (mmHg)** | `ambient_pressure_mmhg` | Float | Measured ambient chamber pressure in millimeters of mercury | mmHg | Directly Sourced | None (0 missing; values: 0.0 to 2280.0 mmHg) | Results table, Pressure filter, Detail modal |
| **Pressure (atm)** | `ambient_pressure_atm` | Float | Chamber pressure converted to atmospheres ($P_{mmHg} / 760.0$) | atm | Transformed / Calculated | None (0 missing; values: 0.0 to 3.0 atm) | Regression X-axis, Results table, Filter |
| **Initial O₂** | `initial_o2_mole_fraction` | Float | Measured initial oxygen mole fraction ($X_{O2}$) | None | Directly Sourced | None (0 missing; values: 0.10 to 0.40) | Results table, Filter slider, Detail modal |
| **Initial N₂** | `initial_n2_mole_fraction` | Float | Initial nitrogen diluent mole fraction ($X_{N2}$) | None | Directly Sourced | None (0 missing; values: 0.00 to 0.90) | Results table, Detail modal |
| **Initial CO₂** | `initial_co2_mole_fraction` | Float | Initial carbon dioxide suppressant mole fraction ($X_{CO2}$) | None | Directly Sourced | None (0 missing; values: 0.00 to 0.60) | Results table, Detail modal |
| **Initial He** | `initial_he_mole_fraction` | Float | Initial helium suppressant mole fraction ($X_{He}$) | None | Directly Sourced | None (0 missing; values: 0.00 to 0.60) | Results table, Detail modal |
| **Initial Diameter ($d_0$)** | `droplet_initial_diameter_mm` | Float | Initial droplet diameter before ignition measured by high-speed imaging | mm | Directly Sourced | 12 missing (unresolved droplet boundary in camera) | Results table, Detail modal |
| **Extinction Diam ($d_{ext}$)** | `visible_flame_extinction_diameter_mm` | Float | Droplet diameter at the exact moment visible flame extinguishes | mm | Directly Sourced | 77 missing (disrupted or completed burns with no extinction) | Results table, Detail modal |
| **Burning Rate ($K$)** | `burning_rate_mm2_s` | Float | Quasi-steady burning rate constant $K$ derived from $d^2$-law ($d^2(t) = d_0^2 - K \cdot t$) | $mm^2/s$ | Derived from video | 16 missing (burn disrupted before steady regression) | Analytics Y-axis & regression, Results table |
| **Burn Time ($t_b$)** | `burn_time_s` | Float | Numeric duration of visible flame combustion | seconds | Transformed from raw | 6 missing (unmeasured burns) | Results table, KPI summary, Detail modal |
| **Raw Burn Time** | `burn_time_raw` | String | Unmodified source string for burn duration | Text | Directly Sourced | 6 missing | Results detail modal |
| **Outcome** | `test_end_outcome` | String | Final combustion end-state: `Extinction` (186), `Disruption` (61), `Completion` (27) | None | Directly Sourced | None (0 missing) | Results Explorer filter, Analytics pie/bar, Badges |
| **Investigation** | `investigation` | String | Research program label (`FLEX (Droplet Combustion)`) | None | Directly Sourced | None (0 missing) | Results table, Citations drawer |
| **Source File** | `source_file` | String | Originating NASA PSI catalog filename | None | Directly Sourced | None (0 missing) | Citations drawer, Detail modal |
| **Record Type** | `record_type` | String | Clarifying tag (`As-Run Flight Experimental Results`) | None | Sourced Metadata | None (0 missing) | Top badges, Guardrail indicators |

---

## 5. Summary of Missing Data & Anomaly Handling

### Telemetry Anomaly in Test #114
* **Record:** Test #114 (`C11M201`, Date: `9/6/2010`)
* **Reported Value:** `ambient_pressure_mmhg = 0.0`, `ambient_pressure_atm = 0.0`
* **Contradicting Measurements:** Initial $O_2 = 0.20$, $N_2 = 0.45$, $CO_2 = 0.35$, Initial diameter = $3.23\text{ mm}$, Extinction diameter = $1.68\text{ mm}$, Burning rate = $0.42\text{ mm}^2/\text{s}$, Burn time = $18.9\text{ s}$.
* **Physical Impossibility:** Combustion with gas fractions and sustained droplet burning cannot physically occur at absolute zero pressure (vacuum).
* **System Treatment:** The raw reading is retained in the CSV and table, accompanied by a prominent warning badge (`⚠️ Known Telemetry Anomaly`). It is automatically excluded from the pressure vs. burning rate regression line.

### Missing Burning Rates ($K$)
* In 16 tests, the burning rate constant is `null`. These tests experienced rapid droplet disruption, tether interference, or premature extinction before a steady $d^2$-law regression slope could be established. They are excluded from regression fitting.
