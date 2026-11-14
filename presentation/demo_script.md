# Flame in Freefall: 3-Minute Live Demonstration Script
**NASA Space Apps Challenge 2026**  
**Estimated Time:** 3 Minutes (180 Seconds)  
**Presenter Role:** Lead Developer & Science Communicator  
**Backup URLs:** React Frontend: `http://localhost:5173` | FastAPI Docs: `http://localhost:8000/docs` | Streamlit Backup: `http://localhost:8501`  

---

## Demo Overview & Timeline

| Scene | Target Route | Focus Topic | Target Time |
|---|---|---|---|
| **Scene 1** | `/` (Mission Control) | The Microgravity Fire Problem | 0:00 – 0:30 (30s) |
| **Scene 2** | `/explorer` (Experiment Explorer) | Authentic NASA Flight Telemetry | 0:30 – 1:00 (30s) |
| **Scene 3** | `/insights` (Smart Matcher) | Explainable Condition Matching | 1:00 – 1:30 (30s) |
| **Scene 4** | `/insights` (Comparison Engine) | Guardrails & Incompatibility Warnings | 1:30 – 2:00 (30s) |
| **Scene 5** | `/insights` & `/analytics` | 4-Tier Separation & Stoichiometry Chart | 2:00 – 2:30 (30s) |
| **Scene 6** | `/assistant` (Research Assistant) | Grounded AI, Citations & Refusal | 2:30 – 3:00 (30s) |

---

## Scene 1: The Space Fire Paradox (0:00 – 0:30)

### On-Screen Action:
- Open browser at `http://localhost:5173`.
- Scroll smoothly down the **Mission Control** overview.

### Spoken Script:
> *"Hello judges! If a fire starts in a space station, how does it burn? Most people imagine a normal campfire, but in the microgravity of space, there is no buoyancy. Flames do not rise; they burn as slow, spherical halos that can survive on subtle ventilation drafts and generate lethal spikes of toxic carbon monoxide.  
> 
> Standard AI models often hallucinate space fire safety or blindly compare incompatible materials. We built **Flame in Freefall**—an interpretable **Evidence-to-Insight Engine** powered by authentic NASA flight burns from the International Space Station."*

### Expected On-Screen Visuals:
- Cosmic header: *"Flame in Freefall — AI-Powered Fire Safety Insights from NASA Microgravity Combustion Data"*.
- Metric cards showing **126 Flight Tests**, **318 Indexed Document Chunks**, and verified oxygen range ($13.6\% - 22.2\% \text{ vol } \text{O}_2$).

---

## Scene 2: Real NASA Flight Telemetry (0:30 – 1:00)

### On-Screen Action:
- Click **"Experiment Explorer"** in the sidebar (route: `/explorer`).
- Type `"SIBAL"` into the search bar.
- Show how the table filters instantly from 126 to 26 tests.
- Clear the search and click **"Next"** on pagination.

### Spoken Script:
> *"Here in the Experiment Explorer, every single row is a real experiment conducted aboard the ISS Microgravity Science Glovebox. We have 126 verified runs testing acrylic rods, thin films, cotton fabrics, and Nomex.  
> 
> When I search for 'SIBAL'—NASA's cotton-fiberglass fabric—the system instantly narrows down the flight matrix, showing exact fan potentiometer settings, flow restrictor plates, pre- and post-burn oxygen levels, and verbatim astronaut logbook observations. Zero placeholder numbers exist in this entire application."*

### Expected On-Screen Visuals:
- Filtered table showing 26 SIBAL fabric experiments with real test IDs (`T1`, `T2`, `T15`, `T17`, etc.).
- Badges showing flame behavior: Extinguished, Sustained, and Specialized Observations.

---

## Scene 3: The Smart Experiment Matcher (1:00 – 1:30)

### On-Screen Action:
- Click **"Insight Engine"** in the sidebar (route: `/insights`).
- In the Smart Matcher tab, click the preset chip: **"Low-Flow PMMA Extinction"**.
- Point your mouse at the top matched experiment card (e.g., Test `P1`).

### Spoken Script:
> *"Rather than relying on a black-box chatbot, our **Smart Experiment Matcher** allows aerospace engineers to search flight records using research questions.  
> 
> When I click 'Low-Flow PMMA Extinction', notice the explainable score: it displays 'Condition Match: 95%'. Why? Because as shown in the breakdown, the fuel matches PMMA, the airspeed falls within the quiescent low-flow regime below 5 cm/s, and the astronaut notes describe flame extinction. Crucially, we include a clear disclaimer: this is a parameter match score, NOT an invented probability of fire."*

### Expected On-Screen Visuals:
- Ranked cards with explainable percentage scores.
- Itemized reasons: `• Direct match on Test ID`, `• Fuel material matches`, `• Air velocity in low-flow regime`.
- NASA Astronaut Log quote: *"Broke –20, –21 igniters, –22 worked; nice flame, got down to extinction..."*
- Technical memorandum page hint: `NASA/TM-20210011385 Section 2.1-2.4 (pp. 13-38)`.

---

## Scene 4: Guardrails & Incompatibility Warnings (1:30 – 2:00)

### On-Screen Action:
- Switch to the **"Scientific Comparison & 4-Tier Insight"** tab.
- Click the benchmark preset button: **"⚠️ T1 vs P1 (Cross-Material Warning Demo)"**.
- Hover over the red warning box at the top.

### Spoken Script:
> *"Now let's look at where normal AI dangerously fails: comparison. Naive systems will happily compare two tests with different numbers without understanding physics.  
> 
> But when we compare Test T1 against Test P1, our engine immediately throws a **High-Severity Material Discrepancy Warning**. It warns the engineer: Test T1 is a thin cotton fabric, while Test P1 is a solid acrylic cylinder. Their thermal decomposition and pyrolysis chemistry are completely different! Differences in flameout cannot be attributed solely to airflow. This guardrail prevents false engineering conclusions."*

### Expected On-Screen Visuals:
- Red warning banner: `[HIGH] Material Discrepancy: Comparing distinct material classes (PMMA Rod, SIBAL Fabric). Different polymers possess fundamentally distinct heats of combustion...`
- Amber warning banner: `[MODERATE] Aerodynamic Mismatch: Comparing Opposed flow vs Concurrent flow.`
- Side-by-side table aligning Test T1 and Test P1 parameters.

---

## Scene 5: 4-Tier Evidence & Combustion Analytics (2:00 – 2:30)

### On-Screen Action:
- Scroll down slightly to showcase the **4-Tier Evidence-to-Insight Cards**.
- Then click **"Combustion Analytics"** in the sidebar (route: `/analytics`).
- Scroll to the **Stoichiometry Scatter Plot** ($r = 0.982$).

### Spoken Script:
> *"Below the matrix, we enforce a strict 4-tier epistemological separation:
> Tier 1 is Observed Evidence—what the sensors and astronauts literally saw.
> Tier 2 is Calculated Results—derived oxygen consumption and toxic gas yield with units.
> Tier 3 is Scientific Interpretation—what microgravity combustion theory suggests.
> And Tier 4 is Documented Limitations—explicitly stating what cannot be proven due to single-run flight constraints.  
> 
> Over on the Combustion Analytics page, you see this confirmed in our stoichiometric correlation chart: a mathematically verified Pearson r of 0.982 across 118 flight burns, showing the exact physical consumption of oxygen into carbon dioxide aboard the ISS."*

### Expected On-Screen Visuals:
- 4 colorful cards: Blue (Observed), Cyan (Calculated), Amber (Interpretation), Red (Limitations).
- Stoichiometry linear regression chart with callout: *"Mathematical Correlation: Pearson r = 0.982 across n=118 paired tests"*.

---

## Scene 6: Grounded AI Assistant, Citations & Wrap-Up (2:30 – 3:00)

### On-Screen Action:
- Click **"AI Research Assistant"** in the sidebar (route: `/assistant`).
- Point to the recent inquiry: *"What was the purpose of the BASS-II investigation and what fuels were tested?"*
- Highlight the citation source chips with page numbers and DOI link.
- Briefly mention the anti-hallucination refusal test.

### Spoken Script:
> *"Finally, our AI Research Assistant combines Google Gemini with strict grounded RAG. Every single claim is backed by citations pointing directly to page numbers in NASA Technical Memorandum 20210011385 and the official NASA Physical Sciences Informatics repository.  
> 
> And if someone asks an unsupported question—like penguin biology—the assistant refuses to answer rather than inventing space facts. If external API quotas are exceeded, the system automatically falls back to verified offline evidence synthesis without crashing.  
> 
> Flame in Freefall brings NASA's microgravity combustion flight data to life—grounded, explainable, and scientifically honest. Thank you!"*

### Expected On-Screen Visuals:
- AI Research Assistant page with structured answer, citation pills (`Page 5`, `Page 42`, `DOI: 10.60555/4qc4-de67`).
- Status badge: `Synthesis Mode: Offline Grounded Verification` (or `Live Gemini AI`).

---

## Contingency & Fallback Strategy

| Scenario | Live Symptom | Contingency Action & Spoken Explanation |
|---|---|---|
| **Gemini API hits rate limit** | Badge shows `Offline Grounded Verification` | **Advantage pitch:** *"Notice the badge says Offline Grounded Verification. Our architecture is resilient: when Google Gemini free-tier quota limits are reached, the system smoothly falls back to local synthesis from verified NASA text passages without crashing or hallucinating."* |
| **Local WiFi disconnects** | Browser loses internet access | The app runs locally on `127.0.0.1:8000` and `127.0.0.1:5173`. Everything—including search, table filters, charts, deep-dive, comparisons, and offline evidence synthesis—works **100% offline**. |
| **Accidental tab closure** | Browser window closed | Re-open browser and navigate to `http://localhost:5173`. Both Vite and FastAPI run as persistent background services. |
