# Phase 7 Scientific Data & Systems Audit Report
**Project:** Flame in Freefall — NASA Space Apps Challenge  
**Date:** October 2026  
**Auditor:** Flame in Freefall Autonomous Scientific Pipeline  

---

## 1. Executive Summary

This audit reconciles the underlying NASA BASS-II flight dataset (`data/processed/bass_ii_experiments.csv`), analytical calculations, and AI system capabilities prior to implementing the Phase 7 Evidence-to-Insight Engine.

| Audit Item | Question / Discrepancy | Verified Ground Truth | Recommendation / Action |
|---|---|---|---|
| **1. Flame Outcome Distribution** | 126 records; report listed 55 quenched, 50 sustained (leaving 21 unclassified). | Keyword classification in `backend/main.py` yields 55 Quenched, 25 Sustained, and 46 "Observation Recorded". | Do not invent classifications. Categorize unclassified tests by genuine NASA test objectives: Low-Flow Extinction Steps (11), Blowoff (12), Igniter Issues (6), Soot/Morphology (7), Instrumentation (2), Operational (8). |
| **2. Stoichiometry Correlation** | Reported correlation is $r = -0.982$. Verify variable definitions. | $n=118$ paired tests. In the CSV, `delta_o2_pct` is $(\text{Initial} - \text{Final})$ [$\text{O}_2\text{ consumed}$], and `delta_co2_pct` is $(\text{Final} - \text{Initial})$ [$\text{CO}_2\text{ produced}$]. Correlation is $+0.9817$. In concentration terms ($\Delta[\text{O}_2] = \text{Final} - \text{Initial} \le 0$), $r = -0.982$. | Explicitly document sign convention: consumption vs concentration change. Both represent the identical stoichiometric line $|r|=0.982$. |
| **3. Gemini AI Integration** | Previous diagnostic encountered 403 or 429 quota. Verify live API. | API Key is configured and valid. Live calls return `HTTP 429: generativelanguage.googleapis.com free tier requests quota exceeded (limit: 20/day)`. | Preserve resilient `local_evidence_synthesis_fallback`. Transparently show when offline synthesis is active rather than claiming live LLM execution. |

---

## 2. Issue 1: Examination of the 126 Flight Records & Outcomes

### 2.1 Why the Previous Report Listed 55 Quenched and 50 Sustained
In early exploration, broad search strings (such as counting any record with "flame", "ignite", "pot", or "burn") counted 50 tests with combustion activity. However, a rigorous scientific reading of NASA's astronaut logbook entries (`observations`) reveals that NASA astronauts and principal investigators (Bhattacharjee, Ferkul, Olson, Tien) were not simply testing whether a material "sustained" or "quenched". Rather, they were exploring dynamic boundaries:
1. **Low-Speed Extinction Limits:** Astronauts ignited the sample at a steady speed (e.g. $5\text{ cm/s}$), and then stepped the airflow down through potentiometer settings ($0.36, 0.34, 0.32, 0.28$) until the flame went out due to radiative heat loss exceeding convective supply.
2. **Forced Blowoff Limits:** Astronauts increased fan speed to maximum flow to determine whether aerodynamic strain would blow the flame off the leading edge.
3. **Flame Morphology & Soot Dynamics:** In thick PMMA and clear rod samples, astronauts observed bubble layers, jetting vapor, and soot transitions from yellow to blue.
4. **Igniter / Hardware Restraints:** Broken igniter wires (e.g. `P1`, `P21b`, `T23`) or loose video cables prevented completion of ignition.

### 2.2 Transparent Breakdown of All 126 Tests
- **Explicit Quenched / Extinguished:** 55 records ($43.7\%$)
- **Explicit Sustained Flame:** 25 records ($19.8\%$)
- **Specialized Experimental Phenomena (46 records, $36.5\%$):**
  - **Flow-Decrement Extinction Limits:** 11 runs (e.g., Run `P9`, `P13a`, `P18`, `P20`, `P23`, `P24`, `T7`, `T20`, `B22`, `M20`, `O15a`). In these tests, combustion was sustained initially, but airflow was systematically lowered until extinction.
  - **High-Speed Blowoff Extinction:** 12 runs (e.g., Run `T21`, `B18`, `B19`, `O7`, `O8b`, `O9`, `O10`, `O11`, `P17`, `P19`).
  - **Igniter & Hardware Limitations:** 6 runs (e.g., Run `T23`, `O5b`, `P1`, `P21b`, `T3`, `F2`).
  - **Soot & Morphological Characterization:** 7 runs (e.g., Run `O1`, `O2`, `B2`, `B4`, `B7`, `B12`, `M12`).
  - **Instrumentation & Facility Notes:** 2 runs (Run `T1`, `B5`).
  - **Operational Procedure Notes:** 8 runs (e.g., Run `T15`, `T17`, `T25`, `T26`, `O3b`, `O6`, `O13b`, `P8`).

**Conclusion:** For Phase 7, the Experiment Matcher and Comparison Engine must display NASA's actual notes and classify flame behavior accurately, highlighting procedural outcomes like low-flow turndown extinction and blowoff.

---

## 3. Issue 2: Verification of Gas Stoichiometry Correlation ($r = -0.982$)

### 3.1 Data Lineage & Formulas
- Valid paired records with both oxygen and carbon dioxide sensors: **$n = 118$ tests** (out of 126).
- Variables in `bass_ii_experiments.csv`:
  - `delta_o2_pct`: Defined as $\text{calibrated\_initial\_o2\_pct} - \text{calibrated\_final\_o2\_pct}$.  
    - Mean initial: $18.553\text{ vol } \text{O}_2\%$
    - Mean final: $18.069\text{ vol } \text{O}_2\%$
    - Mean delta: $+0.484\text{ vol } \text{O}_2\%$ (Positive value = Oxygen Consumed).
  - `delta_co2_pct`: Defined as $\text{final\_co2\_pct} - \text{initial\_co2\_pct}$.  
    - Mean delta: $+0.393\text{ vol } \text{CO}_2\%$ (Positive value = Carbon Dioxide Produced).

### 3.2 Pearson Correlation Calculation
- Direct correlation between `delta_o2_pct` ($\text{O}_2\text{ consumed}$) and `delta_co2_pct` ($\text{CO}_2\text{ produced}$):
  $$r(\Delta \text{O}_{2,\text{consumed}}, \Delta \text{CO}_{2,\text{produced}}) = +0.98173 \approx +0.982 \quad (p = 8.4 \times 10^{-83})$$
- Atmospheric concentration change correlation ($\Delta[\text{O}_2] = \text{final} - \text{initial} \le 0$):
  $$r(\Delta[\text{O}_2], \Delta[\text{CO}_2]) = -0.98173 \approx -0.982$$

**Conclusion:** The reported magnitude $|r| = 0.982$ is mathematically correct and verified against 118 empirical test records. The minus sign in literature describes the physical trade-off (chamber oxygen drops as $\text{CO}_2$ increases), whereas the positive correlation in the CSV reflects that more oxygen consumed yields more $\text{CO}_2$ produced. Both convey the identical physical principle.

---

## 4. Issue 3: Gemini API Integration Status

### 4.1 Diagnostic Test Result
- Configuration: API Key present in `.streamlit/secrets.toml` and backend environment (length 53 characters).
- Primary Model: `gemini-3.5-flash` / Fallbacks: `gemini-3.6-flash`, `gemini-flash-latest`, `gemini-3.8-flash`.
- Actual Execution Call:
  ```text
  Live Gemini API call failed: Gemini API quota or rate limit exceeded (HTTP 429):
  Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests,
  limit: 20/day. Please retry in 16h46m. Preserving offline evidence synthesis.
  ```
- **Operational Status:** The system operates in **Verifiable Offline Synthesis Mode**. When the API quota resets, live generation will resume automatically.
- **Integrity Rule:** Phase 7 will explicitly display `Evidence Synthesis Mode: Offline Grounded Verification` whenever Gemini quota is unavailable. It will synthesize structured insights from verified NASA document chunks rather than generating fabricated outputs.

---

## 5. Architectural Requirements for Phase 7

1. **Smart Experiment Matcher (`/api/insights/match`):**
   - Query actual BASS-II records using research questions (e.g. "thick PMMA low flow extinction", "blowoff cotton SIBAL").
   - Filter by real fields: `material_category`, `fuel_material`, `flow_configuration`, `air_velocity_range`, `initial_o2_range`.
   - Explainable scoring: Transparent breakdown of Keyword Match, Condition Match, and Outcome Match (score is a match confidence, NEVER a fire-risk probability).
   - Display full test details, observations, and source citations (`NASA/TM-20210011385`).

2. **Scientific Comparison Engine (`/api/insights/compare`):**
   - Multi-experiment side-by-side view (2 to 4 tests).
   - Comparative condition alignment: Fuel, Thickness, Geometry, Airspeed, Initial $\text{O}_2$, Final $\text{CO}$, Outcome.
   - Incompatibility Warnings: Flag when comparing disparate materials (e.g., Cotton fabric vs PMMA cylinder), opposing flow vectors, or tests with broken igniters.
   - Derived difference metrics: $\Delta \text{O}_2$, $\Delta \text{CO}_2$, $\Delta \text{CO}$.

3. **Evidence-to-Insight Summary:**
   - 4-Tier Separation:
     1. **Observed Evidence:** What astronauts and sensors literally recorded.
     2. **Calculated Results:** Stoichiometric consumption, velocities, and delta values.
     3. **Scientific Interpretation:** What the physics indicates (e.g., quenching boundary, boundary layer thickness).
     4. **Limitations & Uncertainties:** What cannot be claimed (e.g. unknown crew cabin drift, single-sample repeats).
