# Flame in Freefall: UI Modernization & Architecture Migration Plan

**Project:** Flame in Freefall — AI-Powered Fire Safety Insights from NASA Microgravity Combustion Data  
**Target Architecture:** React + Vite + TypeScript + Tailwind CSS + FastAPI (Python)  
**Target Visual Quality:** High-End Scientific Analytics & Spacecraft Mission Control Platform  
**Status:** Architecture Specification & Implementation Blueprint (Pre-Implementation Phase)

---

## 1. Executive Summary & Current State Analysis

### Current Application Overview
The current Flame in Freefall application is built with **Python 3.14** and **Streamlit 1.35+**, serving as an interactive scientific dashboard that visualizes and analyzes real combustion experiments conducted aboard the International Space Station (ISS) during the **NASA BASS-II (PSI-25)** investigation.

### Existing Implemented Features
1. **Telemetry & Dataset Ingestion:** Loads, validates, and calculates derived combustion physics for **126 verified flight experiments** (`data/processed/bass_ii_experiments.csv`).
2. **Document Retrieval Engine:** Indexes **318 text passages** (`data/processed/search_index.json`) from the 144-page NASA Summary Report (`NASA/TM-20210011385`) and investigation metadata using a domain-weighted **TF-IDF vectorizer** with a strict 0.12 relevance threshold.
3. **AI Research Assistant:** Connects to **Google Gemini (`gemini-3.5-flash`)** using secure backend credential resolution with automatic fallback models (`gemini-3.6-flash`, `gemini-3.8-flash`) and a robust **Offline Evidence-Synthesis Engine** on network or quota constraints.
4. **Data Visualization:** Renders interactive Plotly charts for oxygen depletion ($\Delta\text{O}_2$), toxic Carbon Monoxide (CO) generation, material distributions, and extinction boundaries.
5. **Experiment Explorer & Deep-Dive:** Filterable tabular view and single-test telemetry inspector with gas sensor deltas and verbatim astronaut flight logs.

### Motivation for Redesign
While the Streamlit interface is scientifically accurate and functional, its layout is constrained by Streamlit's linear, vertical widget-stacking paradigm. The user interface does not reflect the visual sophistication, responsive density, and high-tech telemetry aesthetic expected of a tier-1 NASA Space Apps project. Migrating to a **React + Vite + Tailwind CSS** frontend decoupled from a **FastAPI** backend will allow us to implement:
- Translucent, frosted glassmorphic cards and floating telemetry HUDs (inspired by modern aerospace mission consoles).
- Multi-condition data filtering modals (e.g., SciGlass-style compound queries with `AND`/`OR` logic).
- Multi-panel RAG workspaces with dedicated, side-by-side evidence cards and real-time confidence metrics.
- High-performance, pixel-perfect chart rendering without Streamlit page-reload lag.

---

## 2. Reusable Assets & Python Modules

The existing Python backend has been thoroughly audited and contains clean, decoupled scientific logic that can be reused **directly without rewrites**:

| Existing Module | Path | Reusability | Purpose in New Architecture |
| :--- | :--- | :--- | :--- |
| **Data Loader** | `src/data_loader.py` | **100% Direct** | Supplies `load_experiments()`, filter logic, and computed metrics ($\Delta\text{O}_2$, $\Delta\text{CO}_2$, $\Delta\text{CO}$, parsed air velocities). |
| **Document Processor** | `src/document_processor.py` | **100% Direct** | Handles PDF extraction and chunks text into the 318-passage index. |
| **Evidence Retriever** | `src/retriever.py` | **100% Direct** | Executes TF-IDF vectorization, cosine similarity, and keyword boosting across indexed NASA passages. |
| **AI Client** | `src/llm_client.py` | **100% Direct** | Manages Gemini REST queries, fallback chains, offline evidence synthesis, and prompt grounding. |
| **Flight Dataset** | `data/processed/bass_ii_experiments.csv` | **100% Direct** | Verified dataset of 126 flight tests with sensor readings and astronaut logs. |
| **Search Index** | `data/processed/search_index.json` | **100% Direct** | 318 pre-computed passage chunks with source titles, sections, and PDF page numbers. |

---

## 3. Components to Be Decoupled & Replaced

The monolithic presentation logic currently embedded in `app.py` will be extracted:

```
[ Current Monolith: app.py (Streamlit) ]
├── st.radio (Sidebar navigation)          ──► React Router / Custom Tab HUD
├── st.dataframe / st.slider (Filters)     ──► React Advanced Data Table & Filter Modal
├── st.plotly_chart (Visualization)        ──► Recharts / Tremor / Chart.js in React
├── st.chat_message (Assistant Chat)       ──► React Multi-Panel RAG Workspace
└── st.secrets (API Key Handling)          ──► FastAPI Environment Configuration (.env)
```

1. **State Management:** Streamlit's `st.session_state` and full-page script re-runs will be replaced by React state hooks (`useState`, `useQuery` / SWR) for instant, seamless UI updates without screen flashing.
2. **Layout & Styling:** Streamlit's linear HTML/CSS injection will be replaced by modular Tailwind CSS classes, CSS grid layouts, and custom glassmorphism utilities.
3. **API Key Isolation:** API keys remain strictly on the backend. The frontend never accesses or receives raw API keys, communicating with FastAPI purely via JSON payloads.

---

## 4. FastAPI Backend Architecture

A lightweight FastAPI service (`backend/main.py`) will expose the existing Python functions via high-speed, asynchronous REST endpoints.

```
                         HTTP / JSON
  React Frontend (Port 5173) ◄─────────► FastAPI Backend (Port 8000)
                                                 │
                                 ┌───────────────┼───────────────┐
                                 ▼               ▼               ▼
                           src/data_loader  src/retriever  src/llm_client
```

### Backend Responsibilities
- Serve structured JSON for flight tests, summary telemetry, and filter choices.
- Compute aggregations and chart distributions on demand.
- Execute TF-IDF semantic searches and format citations.
- Securely execute Gemini LLM calls or offline synthesis without exposing secrets.
- Enable Cross-Origin Resource Sharing (CORS) for the local Vite dev server (`http://localhost:5173`).

---

## 5. Proposed Frontend Project Structure

```
flame-in-freefall/
├── backend/                         # New FastAPI Service
│   ├── main.py                      # FastAPI entrypoint & router definitions
│   ├── schemas.py                   # Pydantic request/response data contracts
│   └── config.py                    # Environment and secret loader
│
├── frontend/                        # New React + Vite + TypeScript Client
│   ├── index.html                   # HTML entrypoint with Space Fonts
│   ├── package.json                 # React, Vite, Lucide, Tailwind dependencies
│   ├── vite.config.ts               # Vite configuration (port 5173, proxy to 8000)
│   ├── tailwind.config.js           # Custom space palette (cosmic darks, cyan, amber)
│   ├── tsconfig.json
│   │
│   └── src/
│       ├── main.tsx                 # React application mount
│       ├── App.tsx                  # Root navigation & global layout
│       ├── index.css                # Tailwind directives & cosmic glass utilities
│       │
│       ├── components/              # Reusable UI Primitives
│       │   ├── Navbar.tsx           # Mission header with telemetry status & NASA insignia
│       │   ├── Sidebar.tsx          # Collapsible navigation rail with active indicators
│       │   ├── GlassCard.tsx        # Frosted glass card with glow borders
│       │   ├── MetricPill.tsx       # Sensor telemetry badge (O2, velocity, duration)
│       │   ├── FilterModal.tsx      # Compound filter builder (SciGlass-style AND/OR)
│       │   └── StatusIndicator.tsx  # Live Gemini vs. Offline fallback status badge
│       │
│       ├── pages/                   # Main Page Views
│       │   ├── MissionControl.tsx   # Visual command center & orbit/glovebox overview
│       │   ├── ExperimentExplorer.tsx# SciGlass-inspired advanced scientific table
│       │   ├── CombustionAnalytics.tsx# High-density analytical charts & heatmaps
│       │   ├── TestDeepDive.tsx     # Single-test flight inspector with gas gauges
│       │   ├── ResearchAssistant.tsx# Multi-panel RAG workspace with dedicated citations
│       │   └── DataInventory.tsx    # Source provenance, DOI links, and file matrix
│       │
│       ├── services/                # API Communication Layer
│       │   └── api.ts               # Axios / Fetch client calling FastAPI endpoints
│       │
│       └── types/                   # TypeScript Type Definitions
│           └── index.ts             # Experiment, Telemetry, Citation, and Message types
│
├── data/                            # PRESERVED: NASA Source Files & Processed CSVs
├── src/                             # PRESERVED: Core Python Scientific Logic
├── app.py                           # PRESERVED: Backup Streamlit Application
└── requirements.txt                 # Updated with fastapi & uvicorn
```

---

## 6. Required REST API Endpoints

| Method | Endpoint | Description | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health & active LLM status | None | `{ status: "ok", active_model: string, mode: "live" \| "offline" }` |
| `GET` | `/api/experiments/summary` | Global dataset telemetry metrics | None | `{ total_tests: 126, o2_range: [14.5, 22.0], materials: [...], hardware: "MSG" }` |
| `GET` | `/api/experiments` | Filterable list of flight records | Query params: `material`, `min_o2`, `max_o2`, `search`, `page`, `limit` | `{ total: number, page: number, experiments: ExperimentRecord[] }` |
| `GET` | `/api/experiments/{test_id}` | Detailed telemetry for single test | Path param: `test_id` | Single `ExperimentRecord` with gas deltas and notes |
| `GET` | `/api/analytics/extinction-boundary`| Data points for O2 vs. Velocity curve| None | `{ points: [{ o2: float, velocity: float, material: str, outcome: str }] }` |
| `GET` | `/api/analytics/gas-correlations` | Gas consumption & emission matrix | None | `{ records: [{ o2_drop: float, co_ppm: float, co2_pct: float }] }` |
| `POST` | `/api/assistant/query` | RAG search & Gemini LLM reasoning | `{ question: string }` | `{ answer: string, mode: string, model: string, sources: Citation[] }` |
| `GET` | `/api/inventory` | Verified document inventory & stats| None | `{ indexed_passages: 318, reports: [...], doi: string }` |

---

## 7. Polished Page-by-Page UI Design Specifications

### Page 1: 🛰️ Mission Control Home Page (Inspired by Image 1)
- **Visual Atmosphere:** Immersive celestial deep-navy background (`#050811`) with subtle glowing gridlines and a digital ISS orbit visual.
- **Top Mission HUD:** Displays real-time mission metadata:
  - *Platform:* International Space Station (ISS)
  - *Facility:* Microgravity Science Glovebox (MSG)
  - *Archived Tests:* 126 Flight Runs
  - *Investigation:* NASA BASS-II / PSI-25
- **Interactive Earth / Microgravity Module:** Visual diagram contrasting buoyancy-driven teardrop flames on Earth with spherical blue microgravity diffusion flames in space.
- **Telemetry Quick-Access Cards:** Translucent floating glass cards showing key findings:
  1. *Ventilation Risk Factor:* Low-speed forced airflow ($1.0 - 5.0\text{ cm/s}$) promotes flame spread where Earth fires would choke.
  2. *Low-Oxygen Toxicity:* Incomplete combustion below $16.5\%\text{ O}_2$ produces toxic Carbon Monoxide (CO) spikes exceeding $100\text{ ppm}$.
  3. *NASA STD-6001 Flammability Limit:* Highlights empirical proof that Earth flammability tests are not always conservative for spacecraft environments.
- **One-Click Teleport Buttons:** Direct navigation to Explorer, Analytics, or AI Assistant.

### Page 2: 🔍 Experiment Explorer (Inspired by Image 2 - SciGlass Table)
- **High-Density Scientific Table:** Clean, dark-mode tabular interface with fixed header, zebra hovering, and pagination controls.
- **SciGlass-Style Compound Filter Modal:**
  - Floating modal triggered by a `Filter` button.
  - Allows building multi-condition rules: `[Material] [Contains] [PMMA Rod]` **AND** `[Oxygen %] [Between] [18.0] [21.0]` **AND** `[Airflow] [>] [5.0 cm/s]`.
- **Search & Quick Views:**
  - Instant text filter for Test ID (e.g., `test101`, `rod301`).
  - Column selector to toggle between Gas Telemetry columns ($\Delta\text{O}_2, \Delta\text{CO}$) and Physical Fuel Dimensions (Length, Diameter, Thickness).
- **Data Export:** Clean CSV/JSON export button that downloads the currently filtered subset.

### Page 3: 📊 Combustion Analytics (Inspired by Image 3 - Scientific Analytics)
- **Grid-Aligned Analytical Dashboard:**
  - **Chart A (Extinction Boundary Scatter):** Airflow Velocity ($x$-axis) vs. Oxygen Percentage ($y$-axis). Points colored by outcome (Sustained Flame vs. Quenched) with hover inspection of exact flight numbers.
  - **Chart B (Toxic CO Generation Bar Chart):** Amber-to-gold gradient horizontal bars showing CO emissions grouped by fuel material and oxygen concentration.
  - **Chart C (Oxygen Depletion Spectrum):** Multi-line curve tracking $\Delta\text{O}_2$ consumption across different ventilation regimes.
  - **Chart D (Correlation Heat Matrix):** Interactive matrix showing mathematical Pearson correlations between airflow velocity, initial oxygen, burn duration, and carbon monoxide yield.
- **Interactive Controls:** Range sliders for oxygen filtering and checkboxes to toggle fuel material overlays dynamically without page reloads.

### Page 4: 🔬 Test Deep-Dive (Flight Telemetry Inspector)
- **Experiment Selector Bar:** Dropdown or search drawer to quickly switch between any of the 126 tests.
- **Dual Gauge Clusters:**
  - Circular dials for **Oxygen Depletion** ($21.0\% \rightarrow 19.4\%$) and **Airflow Speed** ($12.5\text{ cm/s}$).
  - Warning-styled metric cards for **Carbon Monoxide Surge** ($\text{CO} > 80\text{ ppm}$).
- **Astronaut Observation Card:** Stylized observation terminal featuring the exact flight comments from the ISS crew (e.g., *"Quiescent blue flame observed at stagnation point; extinguished upon fan shutoff"*).
- **Source Verification Badge:** Direct link to the exact raw metadata file (`i_Investigation.txt`) and PSI repository record.

### Page 5: 🤖 AI Research Assistant (Inspired by Image 4 - Research RAG Layout)
- **Three-Column Research Console:**
  - **Left Rail (Topic Index & Suggested Queries):** Quick-launch buttons for standard research questions (*"Purpose of BASS-II"*, *"Airflow velocity effect"*, *"Extinction limits"*, *"Test out-of-domain rejection"*).
  - **Center Panel (Interactive Dialogue & AI Synthesis):**
    - Query input box with a glowing `Ask AI` action button.
    - Prominent **AI SYNTHESIS Card** featuring:
      - Active Model Pill (`🟢 gemini-3.5-flash` or `ℹ️ Local Evidence Synthesis`).
      - Query Execution Time (e.g., `⚡ 1.59s`).
      - Grounding Evidence Badge (`📚 2 NASA Passages Verified`).
    - Synthesized scientific explanation with clean headings, bullet points, and empirical vs. interpretive separation.
  - **Right Panel (Dedicated Source Citations HUD):**
    - Sticky sidebar displaying dedicated cards for every retrieved NASA source.
    - Shows Document Title, Section Header, exact **PDF Page Number** (`Page 5`, `Page 42`), verbatim text quotes, and clickable DOI citation links (`doi:10.60555/4qc4-de67`).
- **Safety Boundary Notice:** Persistent spacecraft safety advisory card ensuring users recognize the assistant is for informational exploration and not flight approvals.

### Page 6: 📋 Data Inventory & Provenance
- **Dataset Traceability Matrix:** Displays exact file sizes, checksums, and verification timestamps for `bass_ii_summary_report.pdf` (144 pages), `i_Investigation.txt`, and `bass_ii_experiments.csv`.
- **Passage Distribution Breakdown:** Visual representation of the 318 indexed passages categorized by source chapter (Introduction, Experimental Setup, Solid Fuels, Results, Extinction Data).
- **Official NASA Citations:** Formatted BibTeX and APA citations for Technical Memorandum `NASA/TM-20210011385`.

---

## 8. Visual Design System & Design Tokens

To achieve the caliber of the provided example interfaces, the new UI will adhere to a unified, high-contrast, aerospace-grade visual system:

```css
/* Color System Tokens */
--bg-cosmic-black:     #040711; /* Deep space root backdrop */
--bg-surface-navy:      #0a1124; /* Primary container background */
--bg-surface-elevated:  #101b35; /* Card and modal surfaces */
--border-subtle:        rgba(56, 189, 248, 0.12); /* Faint cyan structural borders */
--border-highlight:     rgba(56, 189, 248, 0.35); /* Active / hover border glow */

/* Accent Palette */
--cyan-electric:        #38bdf8; /* Telemetry, primary active states, data points */
--amber-combustion:     #f59e0b; /* Flame metrics, oxygen indicators, warnings */
--orange-fire:          #ff6b35; /* High temperature & ignition highlights */
--green-telemetry:      #10b981; /* Verified status, successful connections */

/* Typography */
--font-display:         'Inter', 'Space Grotesk', sans-serif;
--font-mono:            'JetBrains Mono', 'Fira Code', monospace;
```

### Aesthetic Principles
1. **Translucent Glassmorphism:** Cards use subtle backdrop blurring (`backdrop-blur-md`) with dark gradients (`linear-gradient(135deg, rgba(16,27,53,0.7) 0%, rgba(8,13,26,0.85) 100%)`).
2. **Restrained Data Accents:** Electric cyan is reserved for system states and telemetry readings; warm combustion amber is reserved for fire and gas metrics. No neon clutter.
3. **Typography Hierarchy:** Crisp tabular numbers (`font-mono`) for sensor metrics, clear sans-serif for documentation and synthesis.
4. **Zero Dead Controls:** Every button, filter, tab, and expander has a functional event handler tied to real state.

---

## 9. Safe, Non-Breaking Migration Strategy

To guarantee continuous availability and prevent regression during development:

```
[ Phase 1: Planning ] ────────► COMPLETE (ui_migration_plan.md)
[ Phase 2: FastAPI Setup ] ───► Create backend/main.py without altering src/ or data/
[ Phase 3: React Setup ] ─────► Scaffold frontend/ with Vite + Tailwind
[ Phase 4: Component Build ] ─► Assemble 6 page views matching design specs
[ Phase 5: Verification ] ────► Parallel testing (Streamlit on 8501, React on 5173)
[ Phase 6: Handover ] ────────► Streamlit retained as verified fallback
```

- **Dual-Running Guarantee:** The existing Streamlit app (`app.py`) will remain completely untouched and runnable on port `8501` at all times.
- **Zero Data Duplication:** FastAPI and Streamlit will both reference the exact same underlying `data/` and `src/` modules.
- **Strict Key Safety:** API keys will be managed in `backend/.env` or read from the existing `.streamlit/secrets.toml`. Keys are never passed to the client browser.

---

## 10. Local Development & Verification Guide

### Step 1: Install Backend Additions (FastAPI)
```bash
pip install fastapi uvicorn pydantic
```

### Step 2: Run the FastAPI Backend
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Documentation will be instantly accessible at `http://localhost:8000/docs`.*

### Step 3: Run the React Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
*New Modern UI will be accessible at `http://localhost:5173`.*

### Step 4: Run the Streamlit Backup (Whenever Desired)
```bash
python -m streamlit run app.py --server.port 8501
```
*Existing Streamlit UI remains accessible at `http://localhost:8501`.*

---

## Conclusion & Readiness
This plan preserves **100% of the verified scientific NASA data, TF-IDF search index, and Gemini LLM integration** while establishing a clear roadmap to build a visual interface that matches the quality of world-class aerospace data consoles.
