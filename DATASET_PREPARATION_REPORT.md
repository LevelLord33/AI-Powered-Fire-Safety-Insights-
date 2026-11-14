# NASA Microgravity Combustion Dataset Preparation Report
**Project:** Flame in Freefall — NASA Space Apps Challenge  
**Date:** October 2026  
**Status:** Completed & Empirically Verified  
**Rule:** No Internet Downloads • Only Existing Workspace Files Used • Zero Invented Data  

---

## 1. Executive Summary

This report provides a complete, transparent, and beginner-friendly audit of all NASA source files, archives, and datasets located across `data/raw/`, `data/docs/`, and `data/processed/` for the three microgravity combustion investigations: **BASS-II**, **BASS**, and **FLEX**.

### Quick Status Summary

| Investigation | Primary Source Document | Raw Metadata Archive | Processed CSV File | Total Records | Data Nature | Integration Readiness |
|:---|:---|:---|:---|:---|:---|:---|
| **BASS-II** (PSI-25) | `data/docs/bass_ii_summary_report.pdf` (144 pgs, NASA/TM-20210011385) | `data/raw/PSI-25_metadata_...zip` | `data/processed/bass_ii_experiments.csv` | **126 Tests** | **As-Run Flight Telemetry** (Sensor readings, astronaut logs, extinction outcomes) | **Ready & Integrated** (Powering existing website) |
| **FLEX** (PSI-69) | `data/docs/FLEX_EIRD_v4.pdf` (81 pgs, NASA Research Requirements) | `data/raw/PSI-69_metadata_...zip` | `data/processed/flex_experiments.csv` *(Newly Prepared)* | **290 Tests** | **Science Test Protocol Matrix** (Chamber pressures, oxygen levels, droplet sizes, suppressants) | **Ready for Standalone Viewing / Future Page** (Not yet integrated into UI) |
| **BASS** (PSI-26) | `data/docs/BASS.pdf` (10 pgs, Mission Overview Brochure) | `data/raw/PSI-26_metadata_...zip` | *None Created* (Zero tables in source) | **0 Records** | **Descriptive Metadata Only** (Mission goals, hardware descriptions, no flight tables) | **Not Ready** (Missing BASS-I Flight Test Matrix Report) |

---

## 2. All Existing Files Found in the Project

A recursive search of `data/raw/`, `data/docs/`, and `data/processed/` identified the following files:

### Folder: `data/docs/` (Original NASA Documents)
1. **`data/docs/bass_ii_summary_report.pdf`** (48,972,416 bytes / ~49 MB)
   - *Investigation:* BASS-II (Burning and Suppression of Solids - II)
   - *Document Type:* Official NASA Technical Memorandum `NASA/TM-20210011385`.
   - *Contents:* 144 pages containing executive summary, individual Principal Investigator reports, combustion models, and **Appendix A (pages 110–120) with complete tabular flight data for all 126 tests**.
2. **`data/docs/FLEX_EIRD_v4.pdf`** (3,240,704 bytes / ~3.2 MB)
   - *Investigation:* FLEX (Flame Extinguishment Experiment / Droplet Combustion)
   - *Document Type:* NASA Research Requirements & Experiment Information Document.
   - *Contents:* 81 pages specifying droplet deployment needles, Combustion Integrated Rack (CIR) chamber volumes, diagnostic cameras, and **Section 5.3 (pages 46–55) Detailed Science Test Matrix containing 290 planned flight test condition specifications**.
3. **`data/docs/BASS.pdf`** (206,949 bytes / ~207 KB)
   - *Investigation:* BASS (Burning and Suppression of Solids - First Mission)
   - *Document Type:* NASA Educational & Mission Summary Brochure.
   - *Contents:* 10 pages of high-level overview explaining why microgravity flames burn differently, acrylic fuel samples, nitrogen suppression, and research team contact info. **Contains 0 tables and 0 test rows.**
4. **`data/docs/README.txt`** (122 bytes)
   - Directory explanation text file.

### Folder: `data/raw/` (NASA PSI Repository Archives)
1. **`data/raw/PSI-25_metadata_PSI_metadata_PSI-101_BASS-II.zip`** (13,439 bytes)
   - *Investigation:* BASS-II (PSI-25)
   - *Contents:* `i_Investigation.txt` (study metadata, 17 publication DOIs, author affiliations) and `s_PSI-25.txt` (sample mapping header).
2. **`data/raw/PSI-26_metadata_PSI-102_BASS.zip`** (11,647 bytes)
   - *Investigation:* BASS (PSI-26)
   - *Contents:* `i_Investigation.txt` (study metadata, 13 publication DOIs, author affiliations) and `s_PSI-26.txt`.
3. **`data/raw/PSI-69_metadata_PSI-133_FLEX.zip`** (24,780 bytes)
   - *Investigation:* FLEX (PSI-69)
   - *Contents:* `i_Investigation.txt` (study metadata, 23 publication DOIs, author affiliations) and `s_PSI-69.txt`.
4. **`data/raw/metadata_extracted/`**
   - Extracted text files: `i_Investigation.txt` (13,147 bytes) and `s_PSI-25.txt` (56 bytes).
5. **`data/raw/README.txt`** (105 bytes)
   - Notes explaining storage of raw NASA downloads.

### Folder: `data/processed/` (Structured Processed Datasets)
1. **`data/processed/bass_ii_experiments.csv`** (35,463 bytes)
   - *Investigation:* BASS-II
   - *Contents:* 126 flight tests with 20 columns of verified sensor readings, astronaut logs, and outcomes.
2. **`data/processed/flex_experiments.csv`** (47,560 bytes) *(Newly Prepared)*
   - *Investigation:* FLEX
   - *Contents:* 290 planned flight test conditions with 16 columns of chamber pressures, fuel types, oxygen levels, and chemical suppressants.
3. **`data/processed/search_index.json`** (545,634 bytes)
   - 318 indexed text passages from `NASA/TM-20210011385` for the AI assistant and retriever.
4. **`data/processed/TM-20210011385.pdf`** (48,972,416 bytes)
   - Identical reference copy of the official NASA Technical Memorandum.
5. **`data/processed/README.txt`** (102 bytes)
   - Directory explanation text file.

---

## 3. Investigation-by-Investigation Deep Dive

### 1. BASS-II (Investigation PSI-25)
- **Status:** **Preserved & 100% Verified.**
- **Source File:** `data/docs/bass_ii_summary_report.pdf` (Appendix A, pages 110–120, Tables A.1 to A.6).
- **Extraction Tool:** `src/extract_experiments.py` (using `pymupdf.find_tables()`).
- **Record Count:** **126 tests** (matches page 10 of NASA report: *"A total of 126 tests were conducted as part of BASS–II"*).
- **Table Breakdown:**
  - Tien (Table A.6): 29 tests (`T1` to `T27` plus repeats)
  - Fernandez-Pello (Table A.3): 27 tests (`P1` to `P25` plus repeats)
  - Olson (Table A.5): 24 tests (`O1` to `O16` plus repeats)
  - Bhattacharjee (Table A.1): 22 tests (`B1` to `B22`)
  - Miller (Table A.4): 20 tests (`M1` to `M20`)
  - Ferkul (Table A.2): 4 tests (`F1` to `F4`)
- **Key Columns & Units:**
  - `calibrated_initial_o2_pct` (vol % O₂, range 13.6% – 22.2%)
  - `calibrated_final_o2_pct` (vol % O₂)
  - `initial_co2_pct` & `final_co2_pct` (vol % CO₂)
  - `initial_co_ppm` & `final_co_ppm` (ppm, peak 950 ppm)
  - `air_velocity_cms` (cm/s, duct velocity)
  - `fuel_material` (SIBAL cotton fabric, Nomex fabric, PMMA clear/black rods, PMMA thin films)
  - `observations` (verbatim astronaut qualitative logbook entries)
- **Missing Values:**
  - 36 tests lack video `time_range` (unlogged video timing in NASA table).
  - 10 tests lack `final_co_ppm` (uninstrumented or saturated sensor).
  - 6 tests lack explicit `flow_configuration`.
  - Zero values were guessed or invented.

---

### 2. FLEX (Investigation PSI-69)
- **Status:** **Newly Prepared as `data/processed/flex_experiments.csv`.**
- **Source File:** `data/docs/FLEX_EIRD_v4.pdf` (Section 5.3, pages 46–55, Tables 6 through 12).
- **Extraction Tool:** `src/extract_flex_matrix.py` (written specifically to parse the test tables).
- **Record Count:** **Exactly 290 test conditions** (numbered `Test No. 1` through `Test No. 290`).
- **Nature of the Data:**
  - **Critical Distinction:** This is a **Science Protocol & Requirements Matrix** specifying planned environmental conditions inside the Combustion Integrated Rack (CIR).
  - It defines target pressures, oxygen mole fractions, droplet sizes, and chemical suppressants.
  - It does **not** contain as-run sensor telemetry (such as actual burning rate or extinction diameter), because this source document is an Experiment Information and Requirements Document (EIRD), not a post-flight telemetry log.
- **Data Dictionary (`flex_experiments.csv`):**
  1. `test_no` (Integer 1 – 290): NASA test condition sequence number.
  2. `investigation`: "FLEX (Droplet Combustion)".
  3. `fuel`: Fuel type:
     - **Heptane ($C_7H_{16}$):** 145 tests
     - **Methanol ($CH_3OH$):** 145 tests
  4. `diluent`: Nitrogen ($N_2$) in 100% of tests.
  5. `suppressant`: Chemical fire suppressant agent:
     - **Carbon Dioxide ($CO_2$):** 128 tests
     - **Helium ($He$):** 56 tests
     - **Sulfur Hexafluoride ($SF_6$):** 56 tests
     - **None (Baseline Air):** 50 tests
  6. `fiber_support`: Droplet suspension mode:
     - `No fiber support (Free Droplet)`: 246 tests
     - `SiC fiber support`: 44 tests
  7. `flow_velocity_cms`: Convective flow velocity:
     - $0.0\text{ cm/s}$ (quiescent): 246 tests
     - $1.5\text{ cm/s}$ (gentle convective flow): 44 tests
  8. `initial_droplet_diameters_mm`: Specified droplet deployment diameters ($3\text{ mm}$ and $5\text{ mm}$).
  9. `pressure_atm`: Chamber pressure ($0.50, 0.70, 0.75, 0.85, 1.00, 1.50, 2.00, 3.00\text{ atm}$).
  10. `oxygen_mole_fraction`: $X_{O2}$ ($0.10$ to $0.40$).
  11. `suppressant_mole_fraction`: $X_{sup}$ ($0.15$ to $0.70$, or $0.0$ when unsuppressed).
  12. `nitrogen_mole_fraction`: $X_{N2} = 1.0 - X_{O2} - X_{sup}$.
  13. `source_document`: `NASA FLEX_EIRD_v4.pdf`.
  14. `source_section`: `Section 5.3 Detailed Science Test Matrix`.
  15. `source_page`: PDF page number (pages 46 to 55).
  16. `record_type`: `Planned Science Protocol Matrix (Requirements Specification)`.
- **Python / Pandas Loading Test:**
  - Successfully verified with `pandas.read_csv('data/processed/flex_experiments.csv')`.
  - Shape: `(290, 16)`. Zero parsing errors.

---

### 3. BASS (Investigation PSI-26)
- **Status:** **No CSV Created (Descriptive Metadata Only).**
- **Source Files Examined:**
  1. `data/docs/BASS.pdf` (10 pages)
  2. `data/raw/PSI-26_metadata_PSI-102_BASS.zip`
- **Why No CSV Was Created:**
  - We inspected every single page of `data/docs/BASS.pdf`. It contains **0 tables** and **0 individual test records**. It is an educational summary brochure describing the mission concept, showing photos of wax candles and acrylic rods.
  - `PSI-26_metadata_PSI-102_BASS.zip` contains only `i_Investigation.txt` and `s_PSI-26.txt`, which are ISA-Tab study descriptors (listing PIs, grant numbers, and publication titles), not flight sensor measurements.
- **What Source Information is Missing:**
  - To create `bass_experiments.csv`, the project would require the official **NASA BASS-I Final Flight Test Summary Report** (the counterpart to the BASS-II Technical Memorandum).
  - Rather than inventing fictional flight tests or hallucinating numbers, **we strictly preserved scientific integrity by not creating a fake BASS CSV.**

---

## 4. Verification and Safeguards

1. **Original Files Preserved:**
   - Zero files were modified, overwritten, or deleted in `data/docs/`, `data/raw/`, or `data/processed/`.
   - `bass_ii_experiments.csv` was left completely untouched.
2. **Web Application Safety:**
   - No changes were made to the React frontend (`frontend/`), FastAPI backend (`backend/`), AI assistant, or Streamlit backup.
   - All services continue running smoothly without disruption.
3. **Python Verification Test:**
   Both datasets load cleanly in Python:
   ```python
   import pandas as pd
   df_bass2 = pd.read_csv('data/processed/bass_ii_experiments.csv')  # 126 rows x 20 cols
   df_flex = pd.read_csv('data/processed/flex_experiments.csv')     # 290 rows x 16 cols
   ```

---

## 5. Website Integration Readiness Assessment

| Dataset | Ready to Show on Website? | Recommendation |
|:---|:---|:---|
| **BASS-II** | **YES — Fully Integrated** | Currently powers all 7 pages: Mission Control, Explorer, Analytics, Deep-Dive, Insight Engine, AI Assistant, and Inventory. |
| **FLEX** | **YES — Standalone Exploration Ready** | The 290-test protocol matrix is cleanly prepared in `flex_experiments.csv`. It can be added as a separate tab or view in a future phase if you wish to let users explore droplet combustion test conditions. |
| **BASS** | **NO — Missing Source Data** | Clearly document that BASS-I data is reference-only until the official BASS-I flight test report is acquired. |

---

## 6. Conclusion

- **BASS-II:** 126 verified as-run flight telemetry records from `NASA/TM-20210011385`.
- **FLEX:** 290 verified test protocol conditions from `FLEX_EIRD_v4.pdf` Section 5.3.
- **BASS:** Documented as an educational overview brochure with zero experimental tables.
- **Zero data was invented, guessed, or downloaded from outside the project.**
