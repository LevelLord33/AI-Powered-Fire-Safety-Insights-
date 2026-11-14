# Flame in Freefall: Pre-Demo Verification Checklist
**NASA Space Apps Challenge 2026**  
**Purpose:** Step-by-step verification protocol to run 15 minutes before presenting to judges.  

---

## 1. Quick Startup Commands

Run these commands in separate terminal windows from `c:\Users\Admin\Desktop\flame-in-freefall`:

### Terminal 1: FastAPI Backend (Port 8000)
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
*Expected Terminal Output:*
`INFO: Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)`

### Terminal 2: React Frontend (Port 5173)
```powershell
cd frontend
npm run dev
```
*Expected Terminal Output:*
`VITE v6.4.5 ready in ... ms`  
`➜ Local: http://localhost:5173/`

### Terminal 3 (Optional Parallel Backup): Streamlit (Port 8501)
```powershell
python -m streamlit run app.py --server.port 8501 --server.headless true
```
*Expected Terminal Output:*
`You can now view your Streamlit app in your browser: http://localhost:8501`

---

## 2. Fast Health & Endpoint Verification

Open your browser or run this one-line command to verify that the backend is responding with NASA flight data:

```powershell
python -X utf8 -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/api/health').read().decode())"
```

*Expected JSON Response:*
```json
{
  "status": "ok",
  "service": "Flame in Freefall API",
  "active_model": "gemini-3.5-flash",
  "ai_mode": "live_llm",
  "total_experiments": 126,
  "indexed_passages": 318,
  "platform": "International Space Station (ISS)"
}
```

---

## 3. Key Routes & Verification Steps

| Page / Route | What to Click / Inspect | Expected Result |
|---|---|---|
| **Mission Control (`/`)** | View hero section and metric cards. | Displays **126 Flight Tests**, **318 Passages**, $13.6\% - 22.2\% \text{ O}_2$. |
| **Explorer (`/explorer`)** | Type `"SIBAL"` in the search bar. | Table filters from 126 down to 26 tests immediately. |
| **Explorer (`/explorer`)** | Clear search; click **"Next"** on pagination. | Shows page 2 (Tests 11 to 20 of 126). |
| **Analytics (`/analytics`)** | Scroll down to the Stoichiometry chart. | Regression line shows $r = 0.982$ with $n=118$ callout. |
| **Deep-Dive (`/deep-dive`)** | Select Test `O13a` from dropdown. | Toxic CO gauge displays **$950 \text{ ppm}$** peak emission. |
| **Insight Engine (`/insights`)** | Click preset chip **"Low-Flow PMMA Extinction"**. | Displays ranked cards with explainable Condition Match % and astronaut quotes. |
| **Insight Engine (`/insights`)** | Click preset button **"⚠️ T1 vs P1 (Cross-Material Warning Demo)"**. | Red **[High] Material Discrepancy** warning banner renders prominently above side-by-side table. |
| **Insight Engine (`/insights`)** | Scroll down to **4-Tier Evidence Cards**. | 4 distinct colored cards: Observed (Blue), Calculated (Cyan), Interpretation (Amber), Limitations (Red). |
| **Assistant (`/assistant`)** | Check previous query or click an example question. | Formats answer with citation source cards pointing to *NASA/TM-20210011385*. |
| **Inventory (`/inventory`)** | Check the file manifest table. | 3 verified items (PDF, CSV, JSON index) with green checkmarks and DOI links. |

---

## 4. Example AI Inquiries to Demonstrate to Judges

### 1. Grounded Technical Question (Supported)
- **Question:** *"What was the purpose of the BASS-II investigation and what fuels were tested?"*
- **Expected Behavior:** Cites Section 1.0 (Page 5) and Section 3.1 (Page 42) of *NASA/TM-20210011385*. Details PMMA acrylic rods, thin films, cotton/fiberglass SIBAL fabrics, and Nomex.

### 2. Extinction Boundary Question (Supported)
- **Question:** *"What causes flame extinction at low airflow velocities in microgravity?"*
- **Expected Behavior:** Explains that without buoyant convection, flames suffer radiative heat loss from soot, cooling below the critical adiabatic flame temperature.

### 3. Out-of-Domain Refusal (Anti-Hallucination Guardrail)
- **Question:** *"What is the breeding cycle of emperor penguins in Antarctica?"*
- **Expected Behavior:** The assistant immediately refuses:  
  *⚠️ Insufficient Evidence in NASA Records: The indexed NASA BASS-II flight documents contain no verified evidence regarding this topic.* Zero hallucinations.

---

## 5. AI Dual-Mode Verification & Rate-Limit Contingency

### If Google Gemini Quota is Available:
- Assistant status badge will display: **`Synthesis Mode: Live Gemini AI`**.

### If Google Gemini Quota is Exceeded (`HTTP 429` Free-Tier Daily Limit):
- The backend automatically transitions to: **`Synthesis Mode: Offline Grounded Verification`**.
- The assistant extracts verbatim factual synthesis from the 318 NASA text chunks without failing or freezing.
- **Judge Pitch:** *"Notice our architecture's resilience: when cloud API quotas are reached, our system immediately falls back to local evidence synthesis, running 100% offline without crashing or making things up."*

---

## 6. Network Contingency Planning

- **No WiFi / Airplane Mode:**
  Because the backend runs on `127.0.0.1:8000` and the React frontend on `127.0.0.1:5173`, the entire application runs **completely offline**.
- **Backup Video Recording:**
  If your laptop display or projector fails, you have an automated browser walkthrough recording ready in the artifacts directory:
  - Walkthrough: [phase7_compare_demo_1792680220644.webp](file:///C:/Users/Admin/.gemini/antigravity-ide/brain/47e16835-72fb-4c26-a9a9-a79680c96cd8/phase7_compare_demo_1792680220644.webp)
- **Backup Streamlit Application:**
  If anything unexpected happens in the React layer, open `http://localhost:8501` to show the original Streamlit dashboard.

---

## 7. Secret-Safety Audit

- [x] Verify that no API keys or passwords exist in `frontend/src/`.
- [x] All `.env` or `secrets.toml` files are located in `.streamlit/secrets.toml` or backend root.
- [x] Browser Developer Tools $\rightarrow$ Network tab shows all requests going to `/api/...` with zero exposed bearer tokens.
- [x] All NASA datasets derive from public domain US Government publications (CC0-1.0).
