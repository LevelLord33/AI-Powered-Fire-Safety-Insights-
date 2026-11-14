# 🤖 Flame in Freefall — AI Research Assistant Guide

The **AI Research Assistant** in Flame in Freefall is an evidence-grounded scientific intelligence tool. It helps researchers, students, and space enthusiasts explore complex microgravity combustion datasets without risking hallucination or data fabrication.

---

## 📑 Table of Contents
1. [Core Scientific Design & Grounding](#1-core-scientific-design--grounding)
2. [Dual Architecture: Live Gemini vs. Local Fallback](#2-dual-architecture-live-gemini-vs-local-fallback)
3. [Dataset Selector & Cross-Dataset Guidance](#3-dataset-selector--cross-dataset-guidance)
4. [Example Questions & Evidence Retrieval Guide](#4-example-questions--evidence-retrieval-guide)
   * [Group A: BASS-II Solid Fuel Questions](#group-a-bass-ii-solid-fuel-questions)
   * [Group B: FLEX Planned Protocol Questions](#group-b-flex-planned-protocol-questions)
   * [Group C: FLEX As-Run Flight Results Questions](#group-c-flex-as-run-flight-results-questions)
   * [Group D: Multi-Dataset & Synthesis Questions](#group-d-multi-dataset--synthesis-questions)
5. [Refusal Handling & Guardrails](#5-refusal-handling--guardrails)

---

## 1. Core Scientific Design & Grounding

The AI Research Assistant adheres to strict epistemological rules:
1. **Source-Only Synthesis:** Every response is assembled strictly from the 470 pre-processed and indexed NASA document passages and tabular flight records.
2. **Mandatory Citations:** Every claim includes source document filenames, sections, page numbers, and direct URLs to the NASA PSI database.
3. **Strict Domain Boundaries:** The assistant actively refuses to answer out-of-domain queries (e.g., questions about politics, financial markets, or general trivia).
4. **No Speculative Extrapolation:** When experimental evidence is missing or unrecorded, the assistant explicitly states that the data is unavailable rather than guessing.

---

## 2. Dual Architecture: Live Gemini vs. Local Fallback

The assistant operates under a seamless dual-engine architecture:

| Feature | Live Generative LLM Mode | Local Evidence Synthesis Mode (Fallback) |
| :--- | :--- | :--- |
| **Trigger** | Valid `GEMINI_API_KEY` present in environment or `.streamlit/secrets.toml` | No API key, offline environment, network disconnect, or Gemini HTTP 429 quota exhaustion |
| **Engine** | Google Gemini (`gemini-2.5-flash`, with fallbacks to `gemini-2.0-flash`, `gemini-1.5-flash`) | Local TF-IDF & deterministic ranking algorithms running inside Python |
| **API Costs** | Uses standard Google Gemini API tier | **100% Free & Zero external network calls** |
| **Grounding** | Strict system prompt forbidding ungrounded claims | Deterministic synthesis directly from top-scoring indexed text chunks |
| **Citations** | Structured JSON citations attached to response | Identical structured citations directly from local index |

> 💡 **Seamless Failover:** If Gemini returns a rate limit error (HTTP 429) during a demo, the backend catches the exception and immediately responds using Local Evidence Mode. The user never experiences an error screen or crash.

---

## 3. Dataset Selector & Cross-Dataset Guidance

The assistant features a 4-option dataset filter:
* **All Datasets (`all`):** Searches all 690 records and 470 indexed passages across BASS-II and FLEX. Best for cross-investigation queries.
* **BASS-II Experimental Records (`bass_ii`):** Restricts search to the 126 solid combustion burns and the 144-page *NASA/TM-20210011385* report.
* **FLEX Planned Conditions (`flex_planned`):** Restricts search to the 290 target protocol specifications from `FLEX_EIRD_v4.pdf` Section 5.3.
* **FLEX Experimental Results (`flex_results`):** Restricts search to the 274 droplet flight results from `PSI-69_Experimental table_FLEX.csv`.

### Filter Mismatch Guidance
If a user selects the **BASS-II** tab but asks a question specifically about liquid droplet fuels (e.g., *"What outcomes are recorded for methanol experiments?"*), the assistant detects the entity mismatch. It informs the user that Methanol was investigated in the liquid droplet program (FLEX) rather than BASS-II, and guides them to switch to the **FLEX Results** or **All Datasets** tab.

---

## 4. Example Questions & Evidence Retrieval Guide

### Group A: BASS-II Solid Fuel Questions

#### 1. Which experiment has the highest numeric final CO reading?
* **Recommended Selector:** `bass_ii`
* **Retrieved Information:** Identifies Test `O13a` (As-run #91) which generated **950 ppm of Carbon Monoxide**, the highest quantifiable numeric reading in the dataset. Note that subsequent burn `O13b` (As-run #92) reached an over-range state (`+OR`), exceeding the instrument's 1,000 ppm sensor ceiling.
* **Supporting Source:** NASA/TM-20210011385, Table A.5, As-run 91 and 92 rows.
* **Scientific Caution:** Explains that smoldering thick PMMA rods in low oxygen produce high CO due to incomplete diffusion-limited combustion.

#### 2. Which test recorded the O13a result?
* **Recommended Selector:** `bass_ii`
* **Retrieved Information:** Test `O13a` was performed using a 12.7 mm clear PMMA rod under concurrent airflow, yielding 950 ppm CO. Test `O13b` on the same rod followed immediately, saturating the instrument (`+OR`).
* **Supporting Source:** BASS-II experiments dataset (`bass_ii_experiments.csv`) and Table A.5.

#### 3. What solid materials were tested in BASS-II?
* **Recommended Selector:** `bass_ii`
* **Retrieved Information:** Lists PMMA acrylic rods (6.35 mm, 9.5 mm, 12.7 mm), PMMA slabs (1–5 mm), thin PMMA films (100–400 µm), SIBAL fabric (cotton/fiberglass), Nomex III synthetic fabric, and a Japan Wax candle.
* **Supporting Source:** NASA/TM-20210011385, Section 2.1 & Table 1.

#### 4. How did oxygen concentration change during combustion?
* **Recommended Selector:** `bass_ii`
* **Retrieved Information:** Chamber oxygen dropped from initial levels (13.6%–22.2%) down to final levels as low as 12.9%, demonstrating net oxygen depletion ($\Delta O_2$) proportional to fuel consumed.
* **Supporting Source:** NASA/TM-20210011385, Table A.5.

#### 5. What is the relationship between consumed oxygen and produced carbon dioxide?
* **Recommended Selector:** `bass_ii`
* **Retrieved Information:** Retrieves the stoichiometric correlation where $\Delta CO_2$ increases linearly with $\Delta O_2$ consumed, verifying closed-chamber stoichiometry ($R^2 \approx 0.98$).
* **Supporting Source:** NASA/TM-20210011385, Section 4.2.

#### 6. Which tests used concurrent airflow?
* **Recommended Selector:** `bass_ii`
* **Retrieved Information:** Identifies the test series where airflow was directed downstream with flame spread (e.g., tests designated with prefix `C` or specific `O` series runs).
* **Supporting Source:** `bass_ii_experiments.csv`, `flow_configuration` column.

#### 7. What are the recorded airflow velocities?
* **Recommended Selector:** `bass_ii`
* **Retrieved Information:** Retrieves velocities ranging from $0.0\text{ cm/s}$ (quiescent) up to $40.0\text{ cm/s}$, with most tests operating in the gentle ventilation range ($1.0$ to $5.5\text{ cm/s}$).
* **Supporting Source:** `bass_ii_experiments.csv`, `air_velocity_cms` column.

#### 8. Which experiments have missing final CO measurements?
* **Recommended Selector:** `bass_ii`
* **Retrieved Information:** Notes that 10 runs have unrecorded final CO concentrations due to sensor saturation, battery depletion, or unpowered gas loggers during early burns.
* **Supporting Source:** `bass_ii_experiments.csv` null field audit.

#### 9. What is the significance of carbon monoxide production for spacecraft fire safety?
* **Recommended Selector:** `bass_ii` or `all`
* **Retrieved Information:** Details how microgravity fires produce lethal CO spikes before sufficient heat or smoke triggers thermal or optical particle alarms, highlighting the necessity of gas-phase electrochemical sensors.
* **Supporting Source:** NASA/TM-20210011385, Executive Summary & Conclusions.

---

### Group B: FLEX Planned Protocol Questions

#### 1. How many planned conditions are available?
* **Recommended Selector:** `flex_planned`
* **Retrieved Information:** Confirms exactly **290 planned conditions**.
* **Supporting Source:** *FLEX_EIRD_v4.pdf*, Section 5.3, Tables 6–12 (physical PDF pages 46–55).
* **Caution:** Notes that these are protocol requirements, not actual flight results.

#### 2. Which fuels are included in the planned matrix?
* **Recommended Selector:** `flex_planned`
* **Retrieved Information:** Exactly two liquid fuels: **Methanol** ($CH_3OH$, 145 conditions) and **Heptane** ($C_7H_{16}$, 145 conditions).
* **Supporting Source:** *FLEX_EIRD_v4.pdf*, Section 5.3.

#### 3. What chamber pressure range is specified?
* **Recommended Selector:** `flex_planned`
* **Retrieved Information:** Discrete pressure levels ranging from **0.5 atm to 3.0 atm** (0.5, 0.7, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0 atm).
* **Supporting Source:** *FLEX_EIRD_v4.pdf*, Section 5.3, Tables 6 through 12.

#### 4. Which suppressants are considered?
* **Recommended Selector:** `flex_planned`
* **Retrieved Information:** Four suppressant categories: Carbon Dioxide ($CO_2$, 128 conditions), Helium ($He$, 56 conditions), Sulfur Hexafluoride ($SF_6$, 56 conditions), and baseline conditions with no added suppressant (50 conditions). Nitrogen ($N_2$) serves as the carrier diluent and balance gas ($X_{N2} > 0$ in 278 conditions, and $X_{N2} = 0.0$ in 12 high-suppressant conditions).
* **Supporting Source:** `flex_experiments.csv`, `suppressant` and `diluent` columns; *FLEX_EIRD_v4.pdf* Section 5.3.

#### 5. What oxygen mole fractions are planned?
* **Recommended Selector:** `flex_planned`
* **Retrieved Information:** Oxygen fractions ($X_{O2}$) span between **0.10 and 0.40** (10% to 40% oxygen).
* **Supporting Source:** *FLEX_EIRD_v4.pdf*, Table matrices.

#### 6. Which conditions use carbon dioxide?
* **Recommended Selector:** `flex_planned`
* **Retrieved Information:** Identifies the 128 conditions specifying $CO_2$ at concentrations between 0.05 and 0.60 mole fraction.
* **Supporting Source:** `flex_experiments.csv`.

#### 7. What is the difference between free-droplet and fibre-supported conditions?
* **Recommended Selector:** `flex_planned`
* **Retrieved Information:** Free droplets float freely without conductive heat loss from a tether; fiber-supported droplets are tethered on a silicon carbide fiber to prevent drift caused by spacecraft acceleration jitter.
* **Supporting Source:** *FLEX_EIRD_v4.pdf*, Section 3.2.

#### 8. How does the planned matrix vary across pressures?
* **Recommended Selector:** `flex_planned`
* **Retrieved Information:** Explains how conditions are grouped into discrete pressure tiers to systematically test the pressure dependence of flammability limits and burning rates.
* **Supporting Source:** *FLEX_EIRD_v4.pdf*, Section 5.3, Tables 6 through 12 (physical PDF pages 46–55).

---

### Group C: FLEX As-Run Flight Results Questions

#### 1. What are the recorded outcome distributions?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Extinction: **186 (67.9%)**, Disruption: **61 (22.3%)**, Completion: **27 (9.9%)**. Total: **274 tests**.
* **Supporting Source:** `PSI-69_Experimental table_FLEX.csv`.

#### 2. How many tests used methanol?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Exactly **157 flight tests** burned Methanol.
* **Supporting Source:** `flex_experimental_results.csv`.

#### 3. How many tests used heptane?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Exactly **117 flight tests** burned Heptane.
* **Supporting Source:** `flex_experimental_results.csv`.

#### 4. What is the average recorded burning rate by fuel?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Across the 258 flight records with valid, non-null burning rates:
  * **Methanol:** Mean burning rate constant is **$0.4715\text{ mm}^2/\text{s}$** (approx. $0.47\text{ mm}^2/\text{s}$; calculated from $N = 151$ valid flight burns, with 6 missing/disrupted).
  * **Heptane:** Mean burning rate constant is **$0.5448\text{ mm}^2/\text{s}$** (approx. $0.54\text{ mm}^2/\text{s}$; calculated from $N = 107$ valid flight burns, with 10 missing/disrupted).
* **Supporting Source:** `flex_experimental_results.csv` statistical aggregation ($N = 258$ valid records out of 274 total).

#### 5. Which tests have missing burning-rate values?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Identifies the **16 tests** where droplet disruption or flame extinguishment occurred before a steady $d^2$-law regression rate could be calculated.
* **Supporting Source:** `flex_experimental_results.csv` null audit.

#### 6. Which test had the largest measured initial droplet diameter?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Test **#70** (`193F001`, Date: `1/21/2010`) had the largest initial diameter at **$4.67\text{ mm}$**.
* **Supporting Source:** `flex_experimental_results.csv`, `droplet_initial_diameter_mm` max value.

#### 7. Which test had the smallest recorded extinction diameter?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Test **#39** recorded a complete burnout with visible extinction diameter recorded as **$0.0\text{ mm}$**.
* **Supporting Source:** `flex_experimental_results.csv`, `visible_flame_extinction_diameter_mm` min value.

#### 8. What is the relationship between pressure and burning rate?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Explains that higher ambient pressures increase droplet burning rates due to enhanced gas-phase chemical reaction rates and higher flame temperatures.
* **Supporting Source:** `flex_experimental_results.csv` regression analytics.

#### 9. What is the recorded burn time for Test #114?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Test #114 recorded a burn time of **$18.9\text{ seconds}$**.
* **Supporting Source:** `flex_experimental_results.csv`, row 114.

#### 10. Why is Test #114 flagged?
* **Recommended Selector:** `flex_results`
* **Retrieved Information:** Test #114 records `ambient_pressure_mmhg = 0.0`. This is physically impossible for a combustion test with $18.9\text{ s}$ burn duration and recorded gas mole fractions ($O_2 = 0.20$, $N_2 = 0.45$, $CO_2 = 0.35$). The cause of the sensor anomaly is unconfirmed. It is preserved verbatim but excluded from pressure regressions.
* **Supporting Source:** Data quality audit, `flex_experimental_results.csv`.

---

### Group D: Multi-Dataset & Synthesis Questions

#### 1. What is the difference between BASS-II and FLEX?
* **Recommended Selector:** `all`
* **Retrieved Information:** BASS-II investigated **solid polymer flammability** (PMMA, SIBAL, Nomex) in a forced flow duct inside the Microgravity Science Glovebox (MSG). FLEX investigated **liquid hydrocarbon droplet combustion** (Methanol, Heptane) in a pressurized chamber inside the Combustion Integrated Rack (CIR).
* **Supporting Source:** NASA investigations PSI-25 and PSI-69.

#### 2. What is the difference between planned FLEX conditions and recorded FLEX results?
* **Recommended Selector:** `all`
* **Retrieved Information:** The 290 planned conditions are pre-flight target engineering matrices from *FLEX_EIRD_v4.pdf*; the 274 recorded results are as-run flight telemetry from *PSI-69_Experimental table_FLEX.csv*. They must never be merged row-by-row.
* **Supporting Source:** Multi-dataset cross-reference synthesis.

#### 3. How do solid-fuel and liquid-droplet investigations differ?
* **Recommended Selector:** `all`
* **Retrieved Information:** Solid fuels involve surface pyrolysis, boundary layer aerodynamics, and char formation; liquid droplets follow spherically symmetric $d^2$-law vaporization and diffuse spherical flame envelopment.
* **Supporting Source:** BASS-II and FLEX scientific summaries.

#### 4. Which combustion measurements are available in each dataset?
* **Recommended Selector:** `all`
* **Retrieved Information:** BASS-II provides airflow velocity, pre/post $O_2$, $CO_2$, and toxic $CO\text{ ppm}$. FLEX Results provides initial droplet diameter, extinction diameter, burning rate constant $K$, burn duration, and chamber pressure.
* **Supporting Source:** Data dictionary synthesis.

#### 5. What does the evidence say about microgravity combustion?
* **Recommended Selector:** `all`
* **Retrieved Information:** Microgravity eliminates natural buoyant convection, allowing flames to burn in spherical configurations, persist at lower oxygen levels under slow ventilation flow, and generate toxic CO spikes without soot.
* **Supporting Source:** NASA TM-20210011385 and PSI archives.

#### 6. What scientific limitations remain?
* **Recommended Selector:** `all`
* **Retrieved Information:** Solid fuel mass loss was not measured continuously in BASS-II; FLEX droplet photography had optical resolution limits causing 12 unmeasured initial diameters; pressure sensor anomaly in Test #114 remains unconfirmed.
* **Supporting Source:** Epistemological Tier 4 limitation logs.

#### 7. Why cannot every BASS-II and FLEX measurement be compared directly?
* **Recommended Selector:** `all`
* **Retrieved Information:** Different geometries (flat slabs/rods in duct vs. spherical droplets), different fuel states (solid polymers vs. liquid hydrocarbons), and different aerodynamics (forced convection vs. quiescent/weak convection) make direct quantitative delta comparison unphysical.
* **Supporting Source:** Insight Engine compatibility rules.

---

## 5. Refusal Handling & Guardrails

When a user submits a question that cannot be answered using the indexed NASA repository, the assistant executes a **transparent refusal**:

* **Example Out-of-Domain Query:** *"What is the current stock price of Apple?"*
* **Assistant Behavior:** Refuses cleanly with a polite response:
  > *"I am an AI Research Assistant specialized strictly in NASA microgravity combustion research (BASS-II and FLEX investigations). I do not have access to financial, personal, or non-scientific data. Please ask a question related to spacecraft fire safety, polymer flammability, droplet extinction, or flight telemetry."*
