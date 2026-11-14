# Flame in Freefall: Space Apps Judge Q&A Guide
**NASA Space Apps Challenge 2026**  
**Investigation:** NASA BASS-II (PSI-25)  
**Target Audience:** Beginner presenters seeking clear, scientifically accurate answers to tough judge questions  

---

## 1. The Core Scientific Problem

### Q1: Why does fire burn differently in space compared to Earth?
**Simple English Answer:**  
> On Earth, gravity creates *buoyancy*. When air gets hot from a fire, it expands, becomes lighter, and rises upward, pulling fresh oxygen into the bottom of the flame and creating the classic teardrop shape.  
> 
> In microgravity aboard the ISS, gravity is effectively zero in freefall. Hot air does *not* rise. Smoke and exhaust stay right next to the flame, suffocating it unless artificial fans circulate fresh air. Because oxygen only arrives through slow diffusion or gentle ventilation, microgravity flames burn as dim, blue, spherical domes, burn at lower temperatures, and can produce lethal amounts of toxic Carbon Monoxide.

---

## 2. NASA Data & Flight Matrix

### Q2: What was NASA's BASS-II investigation, and what data did you use?
**Simple English Answer:**  
> BASS-II stands for **Burning and Suppression of Solids - II**. It was an authentic series of combustion experiments conducted by astronauts inside the Microgravity Science Glovebox (MSG) aboard the International Space Station between 2014 and 2015.  
> 
> We used two verified NASA sources:
> 1. `bass_ii_experiments.csv`: A flight test matrix containing **126 individual orbital burns** recording fuel thickness, airflow speed, initial and final oxygen concentrations, toxic CO emissions, and astronaut logbook entries.
> 2. `bass_ii_summary_report.pdf` (*NASA/TM-20210011385*): The official 144-page technical memorandum written by the principal investigators (Bhattacharjee, Ferkul, Olson, T'ien, etc.), chunked into **318 indexed text passages** with exact section and page citations.

---

### Q3: Why are the 126 flight tests broken down into 55 quenched, 25 sustained, and 46 specialized observations?
**Simple English Answer:**  
> In real spaceflight experiments, astronauts are not simply watching whether a flame stays lit or goes out. They are testing boundary limits:
> - **55 Quenched / Extinguished runs:** Flames that died out directly.
> - **25 Sustained Flame runs:** Flames that burned steadily across the sample.
> - **46 Specialized Procedural Observations:** Rather than forcing an artificial binary classification, our audit showed NASA scientists recorded specific testing goals:
>   - *11 Flow-Decrement Extinction Limits:* Astronauts lit the sample, then stepped the fan speed down in steps ($0.36, 0.34, 0.32, 0.28$) to find the low-speed quenching limit.
>   - *12 High-Speed Blowoff Limits:* Astronauts cranked fans to maximum flow to test if air velocity would blow the flame off.
>   - *6 Igniter Complications:* Broken igniter wires (e.g. Tests `P1`, `P21b`, `T23`).
>   - *7 Soot / Morphology Characterizations:* Observations of bubble layer thicknesses and soot transitions.
>   - *10 Operational Notes:* Instrumentation timing drift, cable checks, and steady-state holds.

---

## 3. Search, Matching & Retrieval Mechanics

### Q4: How does the Smart Experiment Matcher work, and why is its score NOT a probability of fire?
**Simple English Answer:**  
> The Smart Matcher takes a research query (like *"PMMA extinction at low airflow"*) and ranks the 126 actual NASA flight records using transparent scientific criteria:
> - It checks whether the fuel matches acrylic (PMMA), whether airflow falls within the low-speed regime ($\le 5 \text{ cm/s}$), and whether astronaut notes describe flame extinction.
> - It assigns a match percentage (e.g., $95\%$) based on keyword and parameter alignment, and lists the exact reasons *why* it matched.
> - **Crucially, we make it clear that this score is a condition-matching relevance score, NEVER a fire-risk probability.** Claiming an AI score is a "95% chance of spacecraft fire" would be scientifically irresponsible and false.

---

### Q5: What is TF-IDF and Cosine Similarity, and how does your document retriever work?
**Simple English Answer:**  
> **TF-IDF** stands for *Term Frequency–Inverse Document Frequency*. It is a mathematical way of measuring how important a word is in a document. A common word like "the" gets almost zero weight, while rare, important words like "extinction", "quench", or "stagnation" get high weights.  
> 
> When a user enters a question, our system turns the question and all 318 NASA document passages into vectors (mathematical lists of numbers). **Cosine similarity** measures the angle between these vectors to find how closely the meaning of the question matches each passage.  
> 
> We also add **domain keyword boosting** for terms like `pmma`, `sibal`, and `velocity`, and enforce a strict minimum threshold of $0.25$. If a question scores below this threshold, our retriever rejects it to prevent hallucination.

---

### Q6: What is Retrieval-Augmented Generation (RAG)?
**Simple English Answer:**  
> Standard language models answer questions based purely on patterns they memorized during pre-training, which often leads to hallucinations.  
> 
> **Retrieval-Augmented Generation (RAG)** works like an open-book exam. Instead of asking the AI to guess from memory, our retriever first searches our verified NASA document index, extracts the 3 to 4 most relevant factual passages, and feeds those passages into the prompt. The AI is instructed: *"Answer this question using ONLY the provided NASA evidence. If the evidence does not state the answer, say you do not know."*

---

## 4. AI Models, Offline Fallback & Security

### Q7: How does your Gemini integration work, and what happens if the API key fails or hits a rate limit?
**Simple English Answer:**  
> In live mode, our FastAPI backend connects to Google Gemini Flash (`gemini-3.5-flash` with fallbacks to `gemini-3.6-flash`, `gemini-flash-latest`, and `gemini-3.8-flash`).  
> 
> However, on public free tiers, Google enforces daily request quotas (`HTTP 429: limit 20 requests/day`). We built an **automatic, resilient offline fallback**:
> - If an API key is missing, network fails, or quota runs out, the backend automatically transitions to **Local Evidence-Synthesis Mode**.
> - It extracts key findings directly from the verified NASA text chunks without calling external cloud servers.
> - The UI honestly changes the badge to: `Synthesis Mode: Offline Grounded Verification`. We never pretend live Gemini is executing when offline synthesis is active.

---

### Q8: How do you prevent API keys or secrets from leaking?
**Simple English Answer:**  
> All API credentials remain strictly on the backend inside environment variables or `.streamlit/secrets.toml`.  
> - The React frontend never touches, stores, or transmits API keys.
> - All AI calls are routed through our own backend endpoint: `/api/assistant/query`.
> - If you inspect the browser's network traffic or client-side JavaScript, you will see zero secrets.

---

## 5. Scientific Validation & Gas Stoichiometry

### Q9: How did you scientifically verify the oxygen-to-carbon-dioxide correlation ($r = -0.982$)?
**Simple English Answer:**  
> In early reports, a stoichiometric correlation of $r = -0.982$ was cited. We ran an independent mathematical audit across all 118 paired flight burns with gas telemetry:
> - In our dataset, `delta_o2_pct` is stored as $\text{Initial } \text{O}_2 - \text{Final } \text{O}_2$ (which represents **oxygen consumed**, a positive value, mean $+0.484\%$).
> - `delta_co2_pct` is stored as $\text{Final } \text{CO}_2 - \text{Initial } \text{CO}_2$ (which represents **carbon dioxide produced**, a positive value, mean $+0.393\%$).
> - The Pearson correlation between oxygen consumed and $\text{CO}_2$ produced is **$+0.9817 \approx +0.982$** ($p < 10^{-70}$).
> - If you calculate atmospheric concentration change ($\Delta [\text{O}_2] = \text{Final} - \text{Initial} \le 0$), the correlation is **$-0.982$**. Both describe the identical chemical law: burning PMMA consumes 6 moles of $\text{O}_2$ for every 5 moles of $\text{CO}_2$ produced.

---

### Q10: Why does your Comparison Engine warn users when comparing cotton (SIBAL) to acrylic (PMMA)?
**Simple English Answer:**  
> This is a key guardrail where generic AI fails. Cotton-fiberglass fabric (SIBAL) is a porous, thermally thin cellulose weave that chars, pyrolyzes at $\sim 300^\circ\text{C}$, and has a heat of combustion of $\sim 17 \text{ MJ/kg}$. Solid PMMA (acrylic) is a thermally thick thermoplastic that melts, gasifies completely at $\sim 380^\circ\text{C}$, and releases $\sim 26 \text{ MJ/kg}$.  
> 
> If an astronaut compares Test `T1` (cotton) against Test `P1` (acrylic) and sees different flameout times, they might incorrectly conclude that fan speed caused the difference. Our system detects this cross-material comparison and emits a **High-Severity Material Discrepancy Warning**, explaining that differing pyrolysis kinetics prevent attributing flame behavior to airflow alone.

---

## 6. Real-World Value & Differentiation

### Q11: How is Flame in Freefall fundamentally different from ChatGPT or Claude?
**Simple English Answer:**  
> General chatbots have three major flaws when used in aerospace engineering:
> 1. **Hallucination:** They generate believable-sounding answers without verifying against actual orbital telemetry.
> 2. **Unchecked Comparisons:** They will happily compare completely incompatible materials or opposing flow directions without physical warnings.
> 3. **Unverifiable Claims:** They blend raw sensor observations with their own speculation in a single paragraph.
> 
> **Flame in Freefall** is different because:
> - It operates only on 126 verified NASA ISS burns.
> - It actively stops users from drawing false conclusions with physical compatibility warnings.
> - It strictly separates Observed Evidence, Derived Calculations, Scientific Interpretation, and Limitations into four distinct cards.
> - It cites exact page numbers in NASA Technical Memorandum 20210011385.

---

### Q12: Could this system predict if a brand new, untested material will burn in space?
**Simple English Answer (Honest Limitation):**  
> **No, and we explicitly do not claim it can.** Predicting whether an entirely new material will burn in microgravity requires either:
> 1. Physical orbital flight testing in the Microgravity Science Glovebox, or
> 2. A complex multiphysics Computational Fluid Dynamics (CFD) solver with verified reaction kinetics.  
> 
> Our system is an **Evidence-to-Insight Engine**, not a speculative predictor. It helps engineers discover, compare, and interpret genuine spaceflight tests that NASA already conducted, ensuring that decisions are grounded in verified empirical data.

---

### Q13: What are the main limitations of the NASA BASS-II dataset?
**Simple English Answer:**  
> 1. **Single-Run Sweeps:** Because ISS crew time and nitrogen fill gas are extremely limited, most BASS-II tests were exploratory single sweeps rather than 30-run statistical batches.
> 2. **Glovebox Drift:** The Microgravity Science Glovebox experienced minor ambient pressure and temperature drifts across different crew work days.
> 3. **Bulk Airflow Measurement:** The recorded air velocity was measured by an upstream hot-wire anemometer in the flow duct, meaning it measures overall wind speed, not the microscale 3D airflow around irregular burning fuel tips.

---

### Q14: How would this project be deployed for real mission flight controllers?
**Simple English Answer:**  
> In an operational setting, this system could be containerized as a secure Docker microservice deployed on private agency infrastructure (e.g., at Johnson Space Center or Glenn Research Center). Flight controllers and habitat designers could run queries completely on-premise without sending sensitive spacecraft telemetry to external commercial AI APIs.

---

### Q15: What is your roadmap for future development?
**Simple English Answer:**  
> 1. **Ingest NASA SoFIE Data:** Ingesting data from NASA's newer Solid Fuel Ignition and Extinction (SoFIE) investigation conducted in the Combustion Integrated Rack (CIR).
> 2. **Video Frame Integration:** Linking high-speed camera video footage recorded by astronauts to exact telemetry timestamps.
> 3. **Radical Kinetics Modeling:** Coupling empirical test points with open-source chemical kinetics solvers (Cantera) to study gas-phase radical extinction.
