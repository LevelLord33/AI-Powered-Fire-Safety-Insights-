# Flame in Freefall: 8-Slide Presentation Outline
**NASA Space Apps Challenge 2026**  
**Project:** Flame in Freefall — AI-Powered Fire Safety Insights from NASA Microgravity Combustion Data  
**Investigation:** NASA BASS-II (PSI-25 / NASA Glenn Research Center)  

---

## Slide 1: Title & Mission

- **Slide Title:** Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data
- **Subtitle:** An Interpretable Evidence-to-Insight Engine Grounded in Authentic NASA ISS Flight Experiments
- **Key Message:** Moving beyond black-box generative AI to deliver grounded, explainable microgravity combustion analytics for spacecraft safety.
- **Recommended Visual:**
  - High-contrast cosmic banner featuring the project flame badge and ISS microgravity glovebox flight imagery.
  - Subtitle callout: *NASA Space Apps Challenge 2026 • Investigation BASS-II (PSI-25)*.
- **Speaker Notes:**
  > *"Good morning judges. We are presenting Flame in Freefall. Our mission is to transform how aerospace engineers and researchers explore microgravity combustion data, replacing ungrounded generative chatbots with an authentic, physics-aware Evidence-to-Insight Engine."*
- *Compliance Note: Community challenge entry. Does not imply official NASA agency endorsement.*

---

## Slide 2: The Problem — Fire in Freefall

- **Slide Title:** Why Fire Behaves Differently in Space
- **Key Message:** In microgravity, the absence of buoyancy causes slow, spherical flames, unexpected low-flow flammability, and dangerous toxic gas spikes.
- **Key Bullet Points:**
  - **Zero Natural Buoyancy:** Hot air does not rise. Combustion products linger, suffocating flames unless mechanical airflow supplies fresh oxygen.
  - **The Low-Flow Flammability Paradox:** Gentle ventilation speeds ($2 - 10 \text{ cm/s}$) can sustain combustion at lower oxygen levels than predicted by terrestrial screening tests (*NASA-STD-6001 Test 1*).
  - **Lethal Incomplete Combustion:** Toxic Carbon Monoxide ($\text{CO}$) spikes reach up to $950 \text{ ppm}$ (Test `O13a`), far exceeding standard industrial safety limits.
- **Recommended Visual:**
  - Side-by-side illustration: Earth Fire (teardrop, natural buoyancy convective draft $\sim 100 \text{ cm/s}$) vs. Space Fire (spherical halo, diffusion/forced ventilation dominated).
- **Speaker Notes:**
  > *"On Earth, gravity pulls cooler air down and pushes hot air up, feeding the flame. In orbit, buoyancy drops to zero. Fire becomes a dim, spherical dome that survives on subtle cabin ventilation drafts. Materials that pass standard 1g flammability tests on the ground can unexpectedly burn in orbit, generating lethal spikes of carbon monoxide."*

---

## Slide 3: Authentic Data Foundation — NASA BASS-II

- **Slide Title:** Built on Authentic Spaceflight Telemetry
- **Key Message:** Every metric, observation, and calculation in this project derives strictly from verified NASA International Space Station flight records.
- **Key Data Facts:**
  - **Investigation:** Burning and Suppression of Solids - II (BASS-II / PSI-25).
  - **Facility:** Microgravity Science Glovebox (MSG), Destiny Module, ISS.
  - **126 Orbital Flight Burns:** Acrylic rods, thin films ($100 - 400 \ \mu\text{m}$), cotton/fiberglass SIBAL fabrics, and Nomex.
  - **318 Chunked Passages:** Extracted from NASA Technical Memorandum *NASA/TM-20210011385* (144 pages, October 2021).
  - **Persistent Scientific Provenance:** Linked directly to DOI [`10.60555/4qc4-de67`](https://doi.org/10.60555/4qc4-de67) and the NASA Physical Sciences Informatics (PSI) repository.
- **Recommended Visual:**
  - Photograph or schematic of the Microgravity Science Glovebox (MSG) facility on the ISS, accompanied by a screenshot of the verified data inventory table from `/inventory`.
- **Speaker Notes:**
  > *"We did not train our system on generic internet scrape data. Flame in Freefall is anchored in 126 actual orbital burns conducted by astronauts in the Microgravity Science Glovebox, backed by the official 144-page NASA summary report and the NASA Physical Sciences Informatics repository."*

---

## Slide 4: System Architecture — Decoupled & Resilient

- **Slide Title:** Full-Stack Scientific Architecture
- **Key Message:** A high-performance FastAPI backend paired with a modern React + TypeScript frontend, designed for reproducibility and offline resilience.
- **Architecture Highlights:**
  - **React 18 + Vite Frontend (`frontend/`):** 7 dedicated pages, Tailwind cosmic design system, responsive layout, zero exposed API credentials.
  - **FastAPI Scientific Backend (`backend/`):** 8 REST endpoints delivering real-time filtering, mathematical statistics, transparent ranking, and grounded RAG responses.
  - **Dual-Mode AI Resilience:** Automatically switches between Google Gemini Flash and offline deterministic evidence synthesis if network or rate limits occur.
  - **Streamlit Backup Preserved (`app.py`):** Standalone parallel environment maintained on port 8501.
- **Recommended Visual:**
  - Clean architecture diagram showing Frontend $\leftrightarrow$ FastAPI REST API $\leftrightarrow$ Python Data Pipeline & NASA Repositories.
- **Speaker Notes:**
  > *"Our architecture separates concerns cleanly: a fast, type-safe React frontend talks to a FastAPI scientific backend. All API keys remain strictly on the backend. And if internet connection drops or free API quotas run out, our local evidence engine continues running 100% offline."*

---

## Slide 5: Core Innovation — The Evidence-to-Insight Engine

- **Slide Title:** Beyond Chatbots: Guardrails & 4-Tier Synthesis
- **Key Message:** Normal AI models hallucinate and compare incompatible physics; Flame in Freefall enforces explainability, compatibility warnings, and strict evidence tiers.
- **Key Features:**
  - **Smart Experiment Matcher:** Search flight trials using research questions. Returns explainable match reasons with a clear disclaimer: *relevance score is condition alignment, NOT fire-risk probability*.
  - **Compatibility Diagnostics:** Automatically warns against comparing disparate materials (e.g., thin cotton fabric vs. thick acrylic cylinder) or opposing flow vectors.
  - **4-Tier Epistemological Separation:**
    1. *Observed Evidence:* Direct sensor readings & astronaut logs.
    2. *Calculated Results:* Mathematical stoichiometric derivations with units.
    3. *Scientific Interpretation:* Microgravity combustion theory.
    4. *Documented Limitations:* Clear statements of what cannot be concluded.
- **Recommended Visual:**
  - Screenshot of the `/insights` page showing the red `[High] Material Discrepancy` warning and the 4-tier insight cards.
- **Speaker Notes:**
  > *"General chatbots dangerously hallucinate safety advice. When you ask them to compare two tests, they mix facts with speculation. Our Evidence-to-Insight Engine actively stops the user from making false comparisons—warning them if two materials have different pyrolysis chemistry—and separates direct observations from calculations, theory, and uncertainties into four distinct tiers."*

---

## Slide 6: Empirical Validation & Testing

- **Slide Title:** Empirically Verified Science & Code
- **Key Message:** Every calculation has been verified against raw flight data, and all automated software tests have passed.
- **Verified Results:**
  - **14 / 14 Automated Backend Tests Passed:** `test_backend_api.py` covering health, filters, single-test lookups, gas correlations, RAG retrieval, and refusal logic.
  - **Zero Compilation Errors:** Production build verified (`tsc -b && vite build` completed in $7.54\text{ s}$).
  - **Stoichiometry Line Confirmed:** Pearson correlation of $|r| = 0.982$ across $n = 118$ paired instrumented flight burns.
  - **Zero Browser Console Errors:** End-to-end user journey validated across all 7 pages.
- **Recommended Visual:**
  - Terminal screenshot showing `ALL 14 BACKEND API TESTS PASSED SUCCESSFULLY!` alongside the linear stoichiometry regression chart ($r = 0.982$).
- **Speaker Notes:**
  > *"We verified our code and our science. Our test suite runs 14 automated unit and integration tests with a 100% pass rate. We audited the gas measurements across 118 flight burns and confirmed the stoichiometric oxygen-to-carbon-dioxide correlation of 0.982. Nothing is assumed; everything is tested."*

---

## Slide 7: Scientific Limitations & Safety Guardrails

- **Slide Title:** Scientific Integrity: What We Do NOT Claim
- **Key Message:** True scientific tools state their boundaries clearly. We do not claim operational flight approval or unverified causality.
- **Core Guardrails & Boundaries:**
  - **Non-Operational Exploration:** Designed for research discovery, education, and trade studies—not operational mission flight approvals.
  - **Single-Run Flight Data:** BASS-II tests were exploratory sweeps on the ISS, not 30-run statistical batches.
  - **Upstream Anemometer Data:** Duct airspeed represents bulk flow, not microscale boundary layer aerodynamics around irregular fuel shapes.
  - **Strict Anti-Hallucination Threshold:** RAG retriever refuses queries outside NASA documentation (e.g. penguin biology) rather than generating plausible fiction.
- **Recommended Visual:**
  - Graphic highlighting the ⚠️ Spacecraft Safety Disclaimer and the RAG evidence refusal banner on out-of-domain questions.
- **Speaker Notes:**
  > *"In aerospace safety, knowing what you cannot claim is as vital as knowing what you can. We state clearly that our system is an exploratory and educational tool, not an operational clearance system. We explicitly document that single flight sweeps are not statistical repeats, and our AI strictly refuses to answer questions outside verified NASA literature."*

---

## Slide 8: Impact & Future Roadmap

- **Slide Title:** Enabling Safer Space Exploration
- **Key Message:** Advancing deep-space exploration safety for Artemis, Commercial LEO Destinations, and future long-duration human spaceflight.
- **Future Development Roadmap:**
  - **Phase 9+ Data Ingestion:** Expand from BASS-II to NASA's newer SoFIE (Solid Fuel Ignition and Extinction) flight matrix.
  - **Synchronized Video Annotation:** Map high-speed camera footage from the ISS to synchronized telemetry timestamps.
  - **Chemical Radical Simulation:** Integrate chemical kinetics engines (Cantera) for gas-phase radical tracking.
- **Recommended Visual:**
  - Concept illustration of future space habitats (Lunar Gateway / Artemis Base Camp) paired with the Flame in Freefall analytics dashboard.
- **Speaker Notes:**
  > *"As humanity travels back to the Moon and on to Mars, spacecraft fire safety will be paramount. Flame in Freefall proves that by combining authentic NASA telemetry, rigorous physical guardrails, and explainable AI, we can help engineers design safer habitats for the next generation of explorers. Thank you."*
