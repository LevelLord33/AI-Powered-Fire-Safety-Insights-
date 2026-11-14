# NASA BASS-II Data Inventory & Scientific Inspection Report

**Project:** Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data  
**Primary Source:** NASA Glenn Research Center / International Space Station (ISS)  
**Investigation:** Burning and Suppression of Solids – II (BASS-II / PSI-25)  
**NASA Report Reference:** NASA/TM-20210011385 (October 2021, 144 pages)  
**License:** Public Domain / Creative Commons CC0-1.0  

---

## 1. Verified NASA Data Assets

| File Path | Size | Source / Description | Status |
| :--- | :--- | :--- | :--- |
| `data/raw/PSI-25_metadata_PSI_metadata_PSI-101_BASS-II.zip` | 13.4 KB | Official NASA Physical Sciences Informatics (PSI) ISA-Tab metadata archive. | **Verified & Preserved** |
| `data/docs/bass_ii_summary_report.pdf` | 48.9 MB | Full 144-page official NASA Technical Memorandum (`NASA/TM-20210011385`). | **Verified & Preserved** |
| `data/raw/metadata_extracted/i_Investigation.txt` | 13.1 KB | ISA-Tab study descriptors, 17 peer-reviewed publications, author affiliations, and hardware details. | **Extracted** |
| `data/raw/metadata_extracted/s_PSI-25.txt` | 56 B | Sample mapping table from the PSI archive. | **Extracted** |
| `data/processed/bass_ii_experiments.csv` | ~38 KB | Unified, cleaned dataset of all **126 flight tests** extracted directly from Appendix A of the NASA report. | **Extracted & Validated** |

---

## 2. Experimental Data Dictionary (`data/processed/bass_ii_experiments.csv`)

The extracted dataset contains **126 rows** (one for every individual test conducted aboard the ISS) and **20 columns**:

| Column Name | Data Type | Units / Format | Non-Null Count | Description & Fire Safety Relevance |
| :--- | :--- | :--- | :--- | :--- |
| `as_run_num` | Integer | 1 – 126 | 126 (100%) | Chronological test sequence number aboard the ISS Microgravity Science Glovebox (MSG). |
| `test_id` | String | e.g., `T1`, `B1`, `O1` | 126 (100%) | Test identifier assigned by each Principal Investigator (`B`=Bhattacharjee, `F`=Ferkul, `P`=Fernandez-Pello, `M`=Miller, `O`=Olson, `T`=T'ien). |
| `principal_investigator` | String | Categorical | 126 (100%) | Lead scientist responsible for test hypothesis (6 NASA-sponsored research teams). |
| `date_gmt` | String | Date / Day of Year | 125 (99%) | Calendar date and Greenwich Mean Time (GMT) day of year on ISS (e.g., `2/19/2014 GMT 050`). |
| `time_range` | String | `HH:MM:SS to HH:MM:SS` | 90 (71%) | Video recording duration timestamp. Missing in runs where video timing was recorded separately. |
| `sample_id` | String | NASA Sample Tag | 126 (100%) | Hardware sample tag mounted on the flight flow duct (e.g., `147`, `185m`, `207`). |
| `fuel_material` | String | Material & Dimensions | 126 (100%) | Fuel type tested: PMMA clear/black rods (6.35 mm, 9.5 mm, 12.7 mm), thin PMMA films (100 µm, 200 µm, 400 µm), thick PMMA slabs, Nomex fabric, and SIBAL cotton-fiberglass fabric. |
| `flow_configuration` | String | Categorical | 120 (95%) | Direction of forced airflow relative to flame spread: `Opposed` (67 tests), `Concurrent` (38 tests), or `Axial Stagnation` (15 tests). |
| `flow_restrictor` | Integer | `0`, `1`, `2` | 126 (100%) | Hardware flow restrictor plate used at fan inlet to achieve desired low-speed flow regime. |
| `fan_setting` | String | Voltage / Potentiometer | 112 (89%) | Variable-speed fan setting controlling duct air velocity. |
| `air_velocity_cms` | String | cm/s | 126 (100%) | Measured duct air velocity (from 0 cm/s up to ~40 cm/s, or multi-step flow decrements). |
| `calibrated_initial_o2_pct` | Float | Vol % O₂ | 126 (100%) | Initial chamber oxygen concentration calibrated with ISS sensors (Range: **13.6% to 22.2% O₂**, Mean: **18.6%**). |
| `calibrated_final_o2_pct` | Float | Vol % O₂ | 126 (100%) | Final chamber oxygen concentration after burn completion. |
| `initial_o2_pct` | Float | Vol % O₂ | 125 (99%) | Uncalibrated sensor reading before ignition. |
| `final_o2_pct` | Float | Vol % O₂ | 125 (99%) | Uncalibrated sensor reading after burn completion. |
| `initial_co2_pct` | Float | Vol % CO₂ | 125 (99%) | Background CO₂ level in the glovebox prior to test (Mean: ~0.33%). |
| `final_co2_pct` | Float | Vol % CO₂ | 125 (99%) | Post-burn CO₂ concentration resulting from fuel combustion products. |
| `initial_co_ppm` | Float | ppm | 123 (98%) | Pre-burn Carbon Monoxide in parts per million. |
| `final_co_ppm` | Float | ppm | 116 (92%) | Post-burn Carbon Monoxide in parts per million (Range: **0.3 ppm to 950 ppm**; critical indicator of incomplete combustion/sooting). |
| `observations` | Text | Qualitative Notes | 126 (100%) | Real-time astronaut and scientist observations on ignition ease, flame color (blue vs. yellow sooty), spread rate, and extinction mechanisms. |

---

## 3. Key Scientific Findings from the 144-Page NASA Summary Report

1. **Microgravity Flammability is NOT Conservative with 1g Tests:**
   * On Earth, NASA qualifies spacecraft materials using standard upward-burning tests (*NASA-STD-6001 Test 1*), assuming normal-gravity buoyant flow represents the "worst case".
   * BASS-II proved that in microgravity with gentle forced ventilation (speeds of 2–10 cm/s), **flames can burn at lower oxygen levels and spread more persistently than predicted by Earth-based upward tests**.
2. **The Dual Extinction Boundary (Flow Speed):**
   * **Low-Flow Radiative Extinction:** At very low flow speeds (< 1 cm/s), natural convection is absent. Radiative heat loss from the flame outpaces oxygen diffusion, causing the flame to shrink into a dim blue sphere and self-extinguish.
   * **High-Flow Blowoff Extinction:** At high flow speeds (> 35–40 cm/s), aerodynamic straining and excessive convective cooling blow the flame out.
3. **Oxygen Vitiation and Suppression:**
   * BASS-II was the first ISS experiment to actively vitiate the Microgravity Science Glovebox with gaseous nitrogen ($GN_2$), systematically reducing $O_2$ from 21% down to ~13.6%.
   * Materials that burn vigorously in Earth air cease spreading when $O_2$ drops below ~15–16% under microgravity forced flow.
4. **Combustion Products & Toxicity:**
   * The global equivalence ratio was fuel-rich (~1.3 average).
   * Incomplete combustion in low-flow regimes produced elevated Carbon Monoxide levels (up to 950 ppm in specific rod tests), underscoring that microgravity fires produce severe toxic gas hazards even when flames appear small.
5. **Fuel Thickness Sensitivity:**
   * Thin PMMA films (100 µm) ignited almost instantaneously and spread rapidly.
   * Thick PMMA rods (6.35 mm to 12.7 mm) required prolonged pre-heating, had steady regression rates, and exhibited pronounced soot trailing at moderate air velocities.

---

## 4. Recommendations for Next Phase (Streamlit Prototype)

With `bass_ii_experiments.csv` successfully generated:
1. **Interactive Filters:** Filter by Fuel Material, Flow Direction (Opposed vs. Concurrent), and Oxygen Level.
2. **Exploration Plots:** Plot Air Velocity vs. Final CO (ppm) and Oxygen Consumption ($O_2$ drop).
3. **AI Fire Safety Advisor:** Build an interactive Q&A assistant using the verified report findings to explain *why* microgravity flames behave differently and how this guides spacecraft design.
4. **(Optional Future Asset):** Download 1 sample video from the PSI-25 repository (e.g., `SAMPLE_147_TEST_B1.mp4`) to show users an actual flame burn in the glovebox.
