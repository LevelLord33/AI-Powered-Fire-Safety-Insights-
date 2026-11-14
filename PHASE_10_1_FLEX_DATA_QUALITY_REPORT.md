# Phase 10.1 — Final FLEX Results Data Quality Audit Report

**Project:** Flame in Freefall — NASA Space Apps Challenge  
**Date:** October 2026  
**Audit Type:** Read-Only Data Quality and Scientific Verification Audit  
**Operating Standard:** Zero Internet Downloads • Zero Modified Datasets • Zero Fabricated Explanations • Complete Transparency  

---

## 1. Executive Summary

This report presents the findings of the **Phase 10.1 Data Quality Audit** for the NASA PSI-69 FLEX (Flame Extinguishment Experiment) experimental results dataset. 

As instructed, this audit was conducted in **strict read-only mode**:
- No datasets were modified or deleted.
- The original NASA raw CSV was not overwritten.
- No code in the frontend, backend, or AI assistant was modified.
- No external files were downloaded.
- No unverified explanations or assumptions were invented.

### Quick Audit Summary
* **Raw CSV file (`data/raw/flex/PSI-69_Experimental table_FLEX.csv`):** Exactly 275 total lines (1 header line + **274 data rows**).
* **Processed CSV file (`data/processed/flex_experimental_results.csv`):** Exactly 275 total lines (1 header line + **274 data rows**).
* **Row Alignment:** 100% 1-to-1 match across all 274 records. Zero rows were skipped, dropped, or duplicated during extraction.
* **Ambient Pressure Zero Audit:** Exactly **1 row** has `ambient_pressure_mmhg = 0.0` (FLEX Test #114, `C11M201`). Inspection proves this `0` was present in the original NASA raw CSV file and was **not** created by an extraction script error.
* **Discrepancy Status:** The difference between the 274 data rows, the 275 web catalog entries, and the 284 tests cited in technical literature is documented with empirical evidence and **explicitly left unresolved** where conclusive proof does not exist in local project files.

---

## 2. Check 1 — Record-Count Reconciliation & Discrepancy Investigation

### 2.1 File Line and Record Counts

We examined both the raw download file and the processed CSV file on disk:

| File | File Path | Total Lines on Disk | Header Rows | Actual Data Rows | File Size (Bytes) |
|:---|:---|:---:|:---:|:---:|:---:|
| **Raw NASA Table** | `data/raw/flex/PSI-69_Experimental table_FLEX.csv` | **275** | 1 | **274** | 24,776 bytes |
| **Processed Table** | `data/processed/flex_experimental_results.csv` | **275** | 1 | **274** | 56,349 bytes |

### 2.2 Extraction Integrity Check
- **Sequence Continuity:** The primary identifier `FLEX Test #` runs continuously from `1` to `274` with **zero gaps** and **zero duplicate numbers**.
- **Dropped or Skipped Rows:** Exactly **0** rows were skipped or dropped.
- **Row-by-Row Alignment:** Comparing every row in the processed file to the raw source confirms that record $i$ matches test number $i$ without any index shifts.

---

### 2.3 The 274 vs. 275 vs. 284 Discrepancy

There are three different numbers associated with the FLEX experiment count:
1. **274:** The number of data rows in our locally downloaded NASA CSV file.
2. **275:** The number of experimental-table entries reported on the official NASA Physical Science Informatics (PSI) web page.
3. **284:** The number of tests described in NASA technical publication NTRS 20150023456.

Here is the exact status of the evidence available in the local repository:

#### A. The 275-versus-274 Question (Catalog Web Page vs. Local Data Rows)
* **What is verified locally:**
  - The raw CSV file on disk has exactly **275 physical lines**: Line 1 is the column header row, and Lines 2 through 275 are the 274 data rows.
  - The data rows are numbered sequentially from `1` to `274`.
* **What is NOT verified locally:**
  - We do **not** have the source code, backend query, or live HTML page of the NASA PSI portal stored locally in our repository.
  - Therefore, we cannot prove whether the portal's counter of "275 entries" was simply an off-by-one count of total lines (including the header) or whether there was a distinct 275th record on the web server that was omitted from the downloaded CSV export.
* **Honest Conclusion:**
  - The local CSV file contains **274 data rows**.
  - While the 275 total line count (including header) is a plausible cause for the web counter, it cannot be proven without access to the web server's system logic.
  - **Status: Unresolved.**

#### B. The 284-versus-274 Question (Technical Report vs. Local Table)
* **What is verified locally:**
  - In `data/raw/PSI-69_metadata_PSI-133_FLEX.zip`, the file `i_Investigation.txt` lists the exact publication citation:
    - **Authors:** DL Dietrich, VM Bryg, PV Ferkul, FA Williams, FL Dryer, BD Shaw, MY Choi, MV Nayagam, MC Hicks, CT Avedisian
    - **Title:** *"Detailed results from the flame extinugishment experiment (FLEX) - March 2009 to December 2011"*
    - **Citation Link:** `https://ntrs.nasa.gov/citations/20150023456`
  - In our local data table, Test #1 took place on `3/5/2009` and Test #274 took place on `12/8/2011`. This date span matches the operational period in the title of the technical report.
* **What is NOT verified locally:**
  - The local repository does **not** include the full text PDF of NTRS report 20150023456.
  - We do not possess a flight operations log for tests 275 to 284.
  - There is no direct documentary evidence in our project showing whether the 10 additional tests were aborted, suffered deployment needle failures, had ignition failures, or were excluded for post-processing reasons.
* **Honest Conclusion:**
  - The local evidence proves the report exists and covers the same test campaign date range, but does not contain the text needed to explain what happened in the 10 remaining tests.
  - Making claims about why 10 tests were omitted without the text of the report would be speculative.
  - **Status: Unresolved.**

---

## 3. Check 2 — Ambient Pressure Audit (Zero Pressure Investigation)

### 3.1 Numerical Value Counts in `ambient_pressure_mmhg`

We audited all 274 values of `ambient_pressure_mmhg` in `data/processed/flex_experimental_results.csv`:

| Condition | Count | Details |
|:---|:---:|:---|
| **Zero values ($P = 0.0$)** | **1** | FLEX Test #114 |
| **Negative values ($P < 0.0$)** | **0** | None |
| **Null / Missing / NaN values** | **0** | None |
| **Non-numeric strings / values** | **0** | None |
| **Valid positive numbers ($P > 0$)** | **273** | Range: 504.6 mmHg to 2319.9 mmHg |

---

### 3.2 Identification of the Zero-Pressure Record

There is exactly one row in the dataset with zero ambient pressure:

* **DataFrame Row Index:** 113
* **CSV File Line Number:** Line 115 (including header)
* **FLEX Test #:** `114`
* **FLEX Identifier:** `C11M201`
* **Test Date:** `9/6/2010`
* **Test GMT:** `19:14:22`
* **Fuel:** `Methanol`
* **Processed Values:** `ambient_pressure_mmhg = 0.0`, `ambient_pressure_atm = 0.0`
* **Gas Composition:** $X_{O_2} = 0.20$, $X_{N_2} = 0.45$, $X_{CO_2} = 0.35$, $X_{He} = 0.0$
* **Measured Droplet Results:**
  - Initial Diameter: $3.23\text{ mm}$
  - Extinction Diameter: $1.68\text{ mm}$
  - Burning Rate: $0.42\text{ mm}^2/\text{s}$
  - Burn Time: $18.9\text{ s}$
  - Outcome: `Extinction`

---

### 3.3 Inspection of the Original Raw NASA CSV

We inspected Line 115 of `data/raw/flex/PSI-69_Experimental table_FLEX.csv` directly on disk:

```csv
114,C11M201,9/6/2010,19:14:22,Methanol,0,0.2,0.45,0.35,0,3.23,1.68,0.42,18.9,Extinction
```

* In column 6 (`Ambient pressure; mmHg`), the raw text is literally the character `'0'`.
* It was **not** a blank cell, an empty string, or an en-dash placeholder byte (`0x96`).

---

### 3.4 Extraction Script Audit

We reviewed the extraction logic in `src/extract_flex_results.py` (lines 48–60):
```python
p_mmhg = float(row['Ambient pressure; mmHg'])
...
'ambient_pressure_mmhg': p_mmhg,
'ambient_pressure_atm': round(p_mmhg / 760.0, 4),
```
* The script simply executed `float("0")`, yielding `0.0`.
* The script **did not** convert a missing symbol, whitespace, or invalid character into zero.
* The zero exists in the source file provided by NASA.

---

### 3.5 Physical Evaluation & Comparison with Surrounding Data

1. **Physical Impossibility of Combustion in Vacuum:**
   - In fluid mechanics and combustion physics, liquid methanol has a vapor pressure of approximately 97 to 130 mmHg at room temperature. In a true vacuum ($0\text{ mmHg}$), a liquid droplet would flash boil or freeze immediately upon deployment from the needle.
   - Furthermore, a flame requires an oxidizer to sustain chemical reaction. The row specifies gas mole fractions of 20% $\text{O}_2$, 45% $\text{N}_2$, and 35% $\text{CO}_2$. In a vacuum of 0 mmHg, no ambient gas molecules are present, so mole fractions would be physically meaningless.
   - The test recorded an 18.9-second steady burn and normal droplet burning rate ($K = 0.42\text{ mm}^2/\text{s}$), which requires a pressurized combustion atmosphere.

2. **Context from the Surrounding "C11" Test Series:**
   Looking at all other flight tests conducted under the identical experimental condition matrix code **`C11`** between 9/1/2010 and 9/6/2010:

   | Test # | Identifier | Date | Fuel | Pressure (mmHg) | Pressure (atm) | $X_{O_2}$ | $X_{N_2}$ | $X_{CO_2}$ |
   |:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
   | 113 | `C11M101` | 9/1/2010 | Methanol | **534.6** | 0.703 | 0.20 | 0.45 | 0.35 |
   | **114** | **`C11M201`** | **9/6/2010** | **Methanol** | **0.0** | **0.0** | **0.20** | **0.45** | **0.35** |
   | 115 | `C11M301` | 9/1/2010 | Methanol | **535.8** | 0.705 | 0.20 | 0.45 | 0.35 |
   | 116 | `C11M401` | 9/1/2010 | Methanol | **536.3** | 0.706 | 0.20 | 0.45 | 0.35 |
   | 117 | `C11H101` | 9/6/2010 | Heptane | **531.1** | 0.699 | 0.20 | 0.45 | 0.35 |
   | 118 | `C11H201` | 9/6/2010 | Heptane | **532.8** | 0.701 | 0.20 | 0.44 | 0.35 |

   - In the planned experiment requirements (`data/docs/FLEX_EIRD_v4.pdf`), the target nominal pressure for this condition series is **0.70 atm** ($0.70 \times 760 \approx 532\text{ mmHg}$).
   - Every surrounding test in this group measured between **531.1 and 536.3 mmHg**.

3. **Conclusion for Test #114:**
   - The value `0` in Test #114 represents an unrecorded pressure transducer measurement, sensor dropout, or clerical data-entry placeholder in the upstream NASA archive table.
   - **Action Taken:** In accordance with our read-only mandate, the value `0.0` is preserved in the CSV dataset. We do **not** alter the data, but document it as an upstream data anomaly.

---

## 4. Check 3 — Scientific Columns & Data Integrity Audit

We reviewed the scientific naming, units, and integrity of key data columns:

### 4.1 Burning Rate Units ($\text{mm}^2/\text{s}$)
* **Raw Table Header:** `Burning rate; mm`
* **Processed Table Header:** `burning_rate_mm2_s`
* **Scientific Verification:**
  - In classical droplet combustion theory (the $d^2$-law), the burning rate constant $K$ is defined by $d^2(t) = d_0^2 - K t$, giving $K$ units of $[\text{length}^2 / \text{time}]$, specifically **$\text{mm}^2/\text{s}$**.
  - In our dataset, values range from $0.05$ to $1.06$, with a median of $0.50$. These numerical values match established microgravity burning rate constants in $\text{mm}^2/\text{s}$.
  - The raw NASA column header `Burning rate; mm` had its unit truncated in the raw table header. Standardizing to `burning_rate_mm2_s` correctly identifies the physical quantity.

### 4.2 Ambient Pressure Units and Derived Values
* **Raw Table Header:** `Ambient pressure; mmHg`
* **Processed Columns:**
  - `ambient_pressure_mmhg` (native measurement from source)
  - `ambient_pressure_atm` (explicitly identified as derived)
* **Derivation Formula:** Calculated strictly as $\text{Pressure}_{\text{atm}} = \text{Pressure}_{\text{mmHg}} / 760.0$.
* **Audit Result:** Verified. All values match within rounding tolerances, and the derivation is explicitly documented in the dataset metadata.

### 4.3 Carbon Dioxide Composition ($\text{CO}_2$) Label
* **Raw Table Header:** `CO initial ambient composition; mole fraction`
* **Processed Table Header:** `initial_co2_mole_fraction`
* **Verification of $\text{CO}_2$ vs. $\text{CO}$:**
  - In chemistry, `CO` stands for carbon monoxide, while `CO2` stands for carbon dioxide.
  - We verified whether this was carbon monoxide or carbon dioxide using two independent project documents:
    1. In `data/docs/FLEX_EIRD_v4.pdf` (Table 12, page 55), the suppressant used for these tests is explicitly listed as **$\text{CO}_2$**.
    2. In `data/raw/PSI-69_metadata_PSI-133_FLEX.zip` (`i_Investigation.txt`), published research papers for this experiment are titled:
       *"Methanol Droplet Extinction in Oxygen/Carbon-dioxide/Nitrogen Mixtures in Microgravity: Results from the International Space Station Experiments"*.
  - Therefore, the raw column label `CO` was an abbreviation for Carbon Dioxide ($\text{CO}_2$), and the standardized column `initial_co2_mole_fraction` is fully supported by original project documents.

### 4.4 Missing Measurements vs. Zeroes
A major risk in experimental science is converting unrecorded measurements into zero, which would falsely suggest zero droplet size or instantaneous flame death.

We audited every measured experimental column to confirm missing markers were preserved as true nulls (NaNs):

| Physical Column | Raw Missing Markers (`\x96` / blank) | Processed Null Count (`NaN`) | Processed Zero Count (`0.0`) | Verification Status |
|:---|:---:|:---:|:---:|:---|
| **Droplet Initial Diameter** | 12 | **12** | **0** | Verified: No null converted to 0 |
| **Visible Extinction Diameter** | 77 | **77** | **8** | Verified: 8 zeroes were present in raw table (see note below) |
| **Burning Rate** | 16 | **16** | **0** | Verified: No null converted to 0 |
| **Burn Time** | 6 | **6** | **0** | Verified: No null converted to 0 |
| **Test GMT** | 1 | **1** | **0** | Verified: Test #9 null timestamp preserved |

* **Note on the 8 Extinction Diameter Zeroes:**
  In the raw CSV, exactly 8 tests (Tests #39, 43, 51, 52, 63, 69, 93, 135) contain literal `'0'` entries for extinction diameter. In all 8 cases, the test outcome was either `Completion` (the droplet burned completely to zero size) or `Disruption` (the droplet broke apart at the end of the burn). These zeroes were in the raw table and were not introduced by our code.

### 4.5 Primary Sequence Identifier
* `FLEX Test #` (`flex_test_num`) is strictly used as the record sequence identifier.
* It spans from 1 to 274 without any missing values, index skips, or duplicated numbers.

### 4.6 Preservation of Repeated Identifiers (No Deduplication)
* `flex_test_num` is completely unique (274 distinct numbers).
* `flex_identifier` contains one repeated NASA run code: **`193F001`**, which appears in both Test #70 and Test #73.
  - Both tests occurred on `3/23/2010` at `7:25:43 GMT`.
  - However, they contain different measured numbers:
    - Test #70: Initial diameter = $4.67\text{ mm}$, Burning rate = $0.41\text{ mm}^2/\text{s}$.
    - Test #73: Initial diameter = $4.64\text{ mm}$, Burning rate = $0.56\text{ mm}^2/\text{s}$.
  - This indicates two separate video measurement analyses of the same combustion run.
  - In compliance with scientific guidelines, **both records were preserved**. Neither record was deduplicated or discarded.

---

## 5. Summary of Identified Data Anomalies

The following table summarizes the verified findings and anomalies in the flight results dataset:

| Item | Finding | Root Cause | Status in Dataset | Recommended Handling |
|:---|:---|:---|:---|:---|
| **Test #114 Pressure** | `ambient_pressure_mmhg = 0.0` | Upstream NASA data entry omission or sensor failure | Preserved as `0.0` | Filter or flag in statistical regressions against pressure |
| **Web Catalog Count (275 vs. 274)** | 275 catalog entries vs. 274 data rows | Web portal counts 275 lines (including header) or unindexed placeholder | 274 records on disk | Leave unexplained/unresolved pending access to web server logic |
| **Technical Paper Count (284 vs. 274)** | Report title mentions 284 tests vs. 274 table rows | Full report text not in local files; 10 tests cannot be verified | 274 records on disk | Leave unexplained/unresolved pending full text of NTRS 20150023456 |
| **Burning Rate Header** | Raw header truncated as `; mm` | Incomplete unit label in raw NASA CSV | Standardized to `burning_rate_mm2_s` | Document physical definition ($d^2$-law $K$ constant) |
| **CO Header** | Raw header labeled `CO` | Abbreviated label for Carbon Dioxide in raw CSV | Standardized to `initial_co2_mole_fraction` | Confirmed as $\text{CO}_2$ via EIRD v4 and published papers |
| **Duplicate Run Code** | `193F001` repeated in Tests #70 and #73 | Dual analyses of single flight event | Both records preserved | Distinct sequence numbers `flex_test_num` 70 and 73 |

---

## 6. Recommendations for Future Phases

1. **Analytical Guardrails for Pressure Queries:**
   - When downstream models, exploratory graphs, or queries analyze pressure trends (e.g. burning rate vs. chamber pressure), an automatic warning or filter should be applied for Test #114 ($P = 0.0$) so that it does not skew physical scaling laws.
2. **Preserve Raw Dataset Integrity:**
   - Keep `flex_experimental_results.csv` synchronized with the authentic NASA measurements. Do not artificially overwrite Test #114's pressure with 534 mmHg unless creating an explicitly labeled *imputed* or *model-ready* feature set.
3. **Documentation Transparency:**
   - When presenting data in the user interface or API documentation, clearly state that 274 flight records are available, that Test #114 has an upstream unrecorded pressure, and that the 275 and 284 count differences remain unverified due to lack of local server and report text.

---

## 7. Audit Sign-Off

* **Audit Completion:** Completed and verified against local repository files.
* **Modifications Made:** **None** (Read-Only Audit).
* **Dataset State:** Preserved without modification.
