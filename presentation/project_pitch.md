# Flame in Freefall: Project Pitch & Comprehensive Guide
**NASA Space Apps Challenge 2026**  
**Investigation:** Burning and Suppression of Solids - II (BASS-II / PSI-25)  
**Platform:** International Space Station (ISS) Microgravity Science Glovebox (MSG)  

---

## 1. Executive Elevator Pitch (30 Seconds)

> *"Fire on Earth and fire in space behave completely differently. On Earth, gravity creates buoyancy: hot gases rise, drawing in fresh oxygen and giving flames their classic teardrop shape. But aboard the International Space Station, buoyancy vanishes. Flames burn as slow, spherical halos, can survive at surprisingly low oxygen levels, and emit dangerous spikes of toxic carbon monoxide.  
> 
> Current AI chatbots often hallucinate safety advice or blindly compare incompatible materials. **Flame in Freefall** solves this with an authentic, interpretable **Evidence-to-Insight Engine**. Built on 126 real NASA spaceflight burns and 318 technical document chunks, our system actively warns engineers against invalid comparisons, enforces strict 4-tier separation between observed facts and scientific interpretation, and provides verified NASA citations—ensuring that microgravity fire safety is grounded in empirical physics, not generative guesswork."*

---

## 2. The Core Problem: Why Space Combustion Is Unique & Dangerous

### 2.1 The Physics of Zero-Gravity Burning
On Earth ($1g$):
- Heat expands air, lowering its density. The hot, low-density combustion products naturally float upward (buoyancy), pulling cool, oxygen-rich air into the base of the flame.
- This creates natural convective airflow ($\sim 100 \text{ cm/s}$ upward drafts).

In Microgravity ($0g$ / Freefall):
- There is no "up" or "down". Hot exhaust does not rise away from the fuel surface.
- Without buoyancy, combustion products linger around the flame, forming a suffocating blanket of $\text{CO}_2$ and water vapor.
- Oxygen can only reach the flame front through slow molecular diffusion or forced mechanical airflow from spacecraft environmental control and life support systems (ECLSS).
- Flames become dim, blue, spherical, and burn cooler.

### 2.2 The Spacecraft Safety Paradox
1. **Low-Speed Quenching Boundary:** If cabin ventilation airflow drops too low ($< 1 \text{ cm/s}$), the flame starves of oxygen or loses heat through radiative cooling and self-extinguishes.
2. **Surprising Flammability Regimes:** At gentle ventilation velocities ($2 - 10 \text{ cm/s}$), incoming air gently feeds oxygen without cooling the flame base—allowing materials like acrylic (PMMA) or cotton/fiberglass fabrics (SIBAL) to burn steadily at oxygen concentrations lower than standard terrestrial screening tests (*NASA-STD-6001 Test 1*) predict.
3. **Toxic Incomplete Combustion Spikes:** Microgravity flames frequently undergo incomplete combustion, generating lethal spikes of toxic Carbon Monoxide ($\text{CO}$) reaching up to $950 \text{ ppm}$ (observed in Test `O13a`), far surpassing the Immediately Dangerous to Life or Health (IDLH) safety threshold of $1,200 \text{ ppm}$ and the OSHA 8-hour limit of $50 \text{ ppm}$.

---

## 3. Target Users & Real-World Use Cases

1. **Spacecraft Habitat & Subsystem Designers:**
   - Engineers selecting non-metallic materials (polymers, wire insulation, interior fabrics) for future crewed capsules (Orion, Commercial LEO Destinations, Artemis Lunar Base).
   - Evaluating how thin films vs. thick structural slabs behave when ventilation fans fail or fluctuate.
2. **Space Agency Fire Safety Officers & Flight Controllers:**
   - Specialists defining emergency airflow protocols (e.g., whether to immediately shut off cabin ventilation ducts or throttle them to starve a detected smolder).
3. **Aerospace & Combustion Researchers:**
   - Academic researchers comparing microgravity numerical models against genuine orbital boundary conditions without parsing thousands of raw spreadsheet rows manually.
4. **STEM Students & Public Science Explorers:**
   - Engaging with authentic NASA flight telemetry and astronaut logbooks through an intuitive, interactive visual interface.

---

## 4. Authentic NASA BASS-II Data Foundation

Flame in Freefall is built entirely on authentic, publicly available NASA spaceflight data:

- **Investigation Name:** Burning and Suppression of Solids - II (BASS-II)
- **Archive ID:** PSI-25 (Physical Sciences Informatics)
- **Facility:** Microgravity Science Glovebox (MSG) in the Destiny laboratory module of the ISS
- **Principal Investigators:** Dr. Subrata Bhattacharjee (San Diego State Univ.), Dr. Paul Ferkul (NCSER/NASA Glenn), Dr. Sandra Olson (NASA Glenn), Dr. C.H. Wang & Dr. Forman Williams (UC San Diego), Dr. James T'ien (Case Western Reserve Univ.)
- **Primary Source Report:** *NASA/TM-20210011385* (October 2021, 144 pages, $48.97 \text{ MB}$)
- **Persistent DOI:** [`10.60555/4qc4-de67`](https://doi.org/10.60555/4qc4-de67)
- **Flight Test Matrix:** `bass_ii_experiments.csv` containing **126 verified orbital burns** with 25 instrumented telemetry and metadata columns.
- **Indexed Document Corpus:** `search_index.json` containing **318 chunked passages** preserving exact section titles, report page numbers, and direct source URLs.

---

## 5. Software Architecture

Flame in Freefall follows a modular, decoupled architecture:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   React + TypeScript + Vite Frontend                   │
│                        (Port 5173 / Production)                        │
├────────────────────────────────────────────────────────────────────────┤
│  • Mission Control (Overview & Physics)                                │
│  • Experiment Explorer (Search, Filters, Pagination across 126 runs)   │
│  • Combustion Analytics (Extinction boundary & Stoichiometry charts)   │
│  • Test Deep-Dive (Telemetry gauges, flow restrictors, astronaut logs) │
│  • Evidence-to-Insight Engine (Smart Matcher & Comparison Matrix)      │
│  • AI Research Assistant (Grounded RAG dialogue & verified citations)  │
│  • Data Inventory (File provenance, SHA verification, DOI links)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API (/api)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       FastAPI Scientific Backend                       │
│                        (Port 8000 / Uvicorn)                           │
├────────────────────────────────────────────────────────────────────────┤
│  • GET /api/health                System telemetry & active model state│
│  • GET /api/experiments/summary   Verified ranges (O2 min/max, materials)
│  • GET /api/experiments           Filterable, paginated flight tests  │
│  • GET /api/experiments/{id}      Single flight test sensor lookup    │
│  • GET /api/analytics/...         Extinction boundary & Pearson r     │
│  • POST /api/insights/match       Transparent condition ranking       │
│  • POST /api/insights/compare     Side-by-side matrices & 4-tier cards│
│  • POST /api/assistant/query      RAG retrieval + Gemini / Offline     │
│  • GET /api/inventory             NASA source file verification       │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
┌───────────────────▼────────────┐  ┌───────────────▼────────────────────┐
│   Python Scientific Pipeline   │  │   Streamlit Backup Application     │
│    (src/data_loader.py,        │  │     (app.py - Port 8501)           │
│     src/retriever.py,          │  │  Preserved parallel demonstration  │
│     src/llm_client.py)         │  │  environment with Plotly charts   │
└────────────────────────────────┘  └────────────────────────────────────┘
```

---

## 6. The AI & Evidence Retrieval Pipeline

1. **Dual-Stage Hybrid Retrieval:**
   - Lightweight TF-IDF vectorization across 318 document chunks.
   - Domain-specific keyword boosting for key combustion parameters (`quench`, `opposed`, `stagnation`, `pmma`, `sibal`, `nomex`, `extinction`).
   - Strict cosine relevance threshold ($0.25$ minimum boosted score). Completely unsupported questions are immediately refused rather than passed to an LLM to hallucinate.
2. **Resilient AI Execution (Dual Mode):**
   - **Primary Live Mode:** Connects to Google Gemini Flash (`gemini-3.5-flash` with fallbacks to `gemini-3.6-flash`, `gemini-flash-latest`, and `gemini-3.8-flash`).
   - **Offline Grounded Evidence Synthesis Mode:** If the API key is missing, network fails, or free-tier quotas (`HTTP 429`) are encountered, the backend automatically transitions to direct deterministic extraction from verified NASA text passages.
   - The UI transparently states: `Synthesis Mode: Offline Grounded Verification` or `Live Gemini AI`.
3. **Zero Secrets in Frontend:**
   - All API keys remain strictly in backend environment variables or `.streamlit/secrets.toml`. No secrets are ever exposed in client JavaScript.

---

## 7. The Evidence-to-Insight Engine (Phase 7 Innovation)

Standard chatbots suffer from three major flaws when applied to aerospace engineering:
1. They hallucinate non-existent flight runs.
2. They compare incompatible physical tests (e.g., comparing fabric flammability directly against thick acrylic cylinders).
3. They blend raw observations with speculation.

Flame in Freefall solves these with three dedicated capabilities:

### A. Smart Experiment Matcher
- Natural language query interface with explainable ranking.
- Itemized match reasons (e.g. *"Fuel material matches PMMA"*, *"Airspeed falls within quiescent regime <= 5 cm/s"*).
- Distinguishes **Exact Matches** from **Partial Matches** and flags missing sensors.
- Transparent disclaimer: *Relevance scores represent condition matching, NOT fire-risk probabilities.*

### B. Scientific Compatibility Diagnostics
When comparing 2 to 4 flight experiments, the engine evaluates physical validity:
- **[High Severity] Material Discrepancy:** Flags when comparing distinct polymer classes (e.g. cotton fabric vs. solid PMMA), explaining that differing heats of combustion and pyrolysis temperatures prevent attributing flame differences solely to ventilation.
- **[Moderate Severity] Aerodynamic Mismatch:** Warns if comparing opposed flow (stagnation point) against concurrent flow (downstream boundary layer).
- **[Informational] Hardware Complications:** Notes broken igniter wires or cable anomalies directly from astronaut logbooks.

### C. 4-Tier Epistemological Separation
Every comparison separates findings into four distinct visual cards:
- **🔬 Tier 1: Observed Evidence:** Verbatim astronaut log entries and recorded sensor readings.
- **📐 Tier 2: Calculated Results:** Mathematically derived values (oxygen consumed $\Delta \text{O}_2$, $\text{CO}$ emission differences, airspeed ratios).
- **💡 Tier 3: Scientific Interpretation:** Microgravity combustion principles suggested by the data (radiative quenching, residence time).
- **⚠️ Tier 4: Documented Limitations & Unproven Causality:** Strict physical caveats (lack of statistical repeats, glovebox pressure drift, caution against asserting single-variable causality).

---

## 8. Known Limitations & Future Development

### Verified Limitations (What We Do NOT Claim):
- **Not an Operational Flight Clearance Tool:** This project is an exploratory and educational research platform. It must not be used for mission-critical spacecraft safety approvals without full NASA certification.
- **Single-Flight Exploratory Points:** Due to ISS crew time constraints, most BASS-II tests were exploratory single sweeps rather than repeated statistical trials.
- **Hot-Wire Anemometer Spatial Resolution:** Airflow velocities reflect upstream duct averages, not complex 3D recirculating micro-flow directly around the burning sample.
- **No Automated Multiphysics CFD:** We present verified empirical flight measurements; we do not run real-time Navier-Stokes fluid simulations.

### Future Roadmap:
1. **Integration with NASA SoFIE Data:** Ingest recent data from the Solid Fuel Ignition and Extinction (SoFIE) investigation aboard the CIR.
2. **Real-time Video Annotation:** Link synchronized video clips from ISS cameras to individual telemetry timestamps.
3. **Expanded Chemical Kinetics:** Incorporate full reaction mechanism solvers (Cantera) to simulate gas-phase radicals ($\text{OH}^*$, $\text{CH}^*$).
