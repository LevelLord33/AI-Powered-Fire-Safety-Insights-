import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Ensure workspace root is in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.data_loader import load_experiments
from src.retriever import NASARetriever
from src.llm_client import NASAAssistantClient, resolve_gemini_api_key

print("=" * 60)
print("PHASE 7 SCIENTIFIC DATA AUDIT (DETAILED RECONCILIATION)")
print("=" * 60)

# 1. Investigate the 126 records and outcomes
df = load_experiments()
print(f"\nTotal records in CSV: {len(df)}")

def classify_outcome_backend(obs):
    if not obs or pd.isna(obs):
        return "Observation Recorded"
    obs_lower = str(obs).lower()
    if any(w in obs_lower for w in ["extinguish", "quench", "went out", "died", "put out", "self-extinguished"]):
        return "Extinguished / Quenched"
    elif any(w in obs_lower for w in ["spread", "burn", "sustained", "steady", "grew", "propagated"]):
        return "Sustained Flame"
    return "Observation Recorded"

df["outcome_backend"] = df["observations"].apply(classify_outcome_backend)
backend_counts = df["outcome_backend"].value_counts().to_dict()
print(f"Backend keyword classification (current main.py): {backend_counts}")

# Check where the 55 quenched vs 50 sustained came from:
# Let's inspect keywords across all observations
quenched_mask = df["outcome_backend"] == "Extinguished / Quenched"
sustained_mask = df["outcome_backend"] == "Sustained Flame"
unclassified_mask = df["outcome_backend"] == "Observation Recorded"

print(f"\nCurrent backend outcomes: {df['outcome_backend'].value_counts().to_dict()}")

# Look at the 46 'Observation Recorded' records - what do they actually say?
print(f"\nAnalyzing the {unclassified_mask.sum()} unclassified records:")
blowoff_count = 0
ignition_failed_count = 0
pot_turned_down = 0
soot_smoke_flame_count = 0
hardware_cable_count = 0
other_count = 0

for idx, r in df[unclassified_mask].iterrows():
    obs = str(r["observations"])
    test_id = r["test_id"]
    fuel = r["fuel_material"]
    # categorize without inventing
    obs_lower = obs.lower()
    cat = "Unspecified Observation"
    if "blowoff" in obs_lower or "blew out" in obs_lower:
        cat = "Blowoff / Forced Flow Extinction"
        blowoff_count += 1
    elif "broke" in obs_lower or "igniter" in obs_lower and ("not ignite" in obs_lower or "would not stay lit" in obs_lower or "failed" in obs_lower or "attempt" in obs_lower):
        cat = "Ignition / Hardware / Igniter Issue"
        ignition_failed_count += 1
    elif "flame out" in obs_lower or "extinction" in obs_lower: # note: extinction is in some!
        cat = "Flow-decrement Extinction"
        pot_turned_down += 1
    elif "flame" in obs_lower or "soot" in obs_lower or "sooty" in obs_lower:
        cat = "Combustion Characterization / Soot Observation"
        soot_smoke_flame_count += 1
    elif "cable" in obs_lower or "no stills" in obs_lower or "video" in obs_lower or "pot = 10" in obs_lower:
        cat = "Instrumentation / Facility Note"
        hardware_cable_count += 1
    else:
        cat = "Operational Procedure Note"
        other_count += 1
    print(f"  [{test_id}] ({fuel}): Category: '{cat}' | Text: '{obs}'")

print(f"\nBreakdown of the {unclassified_mask.sum()} records by operational/physical nature:")
print(f"  - Blowoff / Forced Flow Extinction: {blowoff_count}")
print(f"  - Ignition / Igniter / Setup Issue: {ignition_failed_count}")
print(f"  - Flow-decrement Extinction (tested extinction limit): {pot_turned_down}")
print(f"  - Combustion Characterization / Soot Observations: {soot_smoke_flame_count}")
print(f"  - Instrumentation / Facility Notes: {hardware_cable_count}")
print(f"  - Operational Procedure Notes: {other_count}")

# 2. Stoichiometry correlation audit:
print("\n" + "=" * 60)
print("2. STOICHIOMETRIC CORRELATION VERIFICATION (-0.982 vs underlying data)")
print("=" * 60)
valid_corr = df[df["delta_o2_pct"].notna() & df["delta_co2_pct"].notna()]
n = len(valid_corr)
x = valid_corr["delta_o2_pct"].values
y = valid_corr["delta_co2_pct"].values
r = np.corrcoef(x, y)[0, 1]
print(f"Valid pairs n = {n}")
print(f"delta_o2_pct formula: calibrated_final_o2_pct - calibrated_initial_o2_pct")
print(f"delta_co2_pct formula: final_co2_pct - initial_co2_pct")
print(f"Calculated Pearson r: {r:.5f}")
print("Check sign convention: in combustion, O2 is consumed (decreases, delta < 0 or calibrated delta), while CO2 is produced (increases, delta > 0).")
# Check the actual values in the CSV
print("Examine first 10 rows of delta_o2_pct and delta_co2_pct:")
for i in range(10):
    row = valid_corr.iloc[i]
    print(f"  Test {row['test_id']}: Init O2={row['calibrated_initial_o2_pct']}, Final O2={row['calibrated_final_o2_pct']}, Delta O2={row['delta_o2_pct']:.2f}% | Init CO2={row['initial_co2_pct']}, Final CO2={row['final_co2_pct']}, Delta CO2={row['delta_co2_pct']:.2f}%")

# Let's check why Pearson r was +0.9817 or -0.982!
# In combustion stoichiometry: consumption of O2 = - Delta O2.
# If Delta O2 was defined as (Final - Initial), in a sealed chamber, Final O2 < Initial O2, so Delta O2 is negative or positive?
# In this CSV: let's check whether final > initial or final < initial in the CSV columns:
mean_init_o2 = valid_corr['calibrated_initial_o2_pct'].mean()
mean_fin_o2 = valid_corr['calibrated_final_o2_pct'].mean()
print(f"Mean Initial Calibrated O2: {mean_init_o2:.3f}%")
print(f"Mean Final Calibrated O2: {mean_fin_o2:.3f}%")
mean_delta_o2 = valid_corr['delta_o2_pct'].mean()
mean_delta_co2 = valid_corr['delta_co2_pct'].mean()
print(f"Mean Delta O2: {mean_delta_o2:.3f}%, Mean Delta CO2: {mean_delta_co2:.3f}%")

# 3. Gemini Live Integration Status
print("\n" + "=" * 60)
print("3. GEMINI LIVE INTEGRATION AUDIT")
print("=" * 60)
key = resolve_gemini_api_key()
print(f"Resolved API key exists: {bool(key)} (length: {len(key) if key else 0})")
client = NASAAssistantClient()
retriever = NASARetriever()
test_passages = retriever.retrieve("What is the flame extinction boundary for PMMA in microgravity?", top_k=2)
print(f"Retrieved {len(test_passages)} test passages for grounded prompt.")

# Attempt generation and inspect exact exception or response
try:
    resp = client.generate_response("What is the flame extinction boundary for PMMA in microgravity?", test_passages)
    print(f"Response mode: {resp.get('mode')}")
    print(f"Model used: {resp.get('model_name')}")
    print(f"Answer snippet: {resp.get('answer', '')[:250]}...")
except Exception as e:
    print(f"Live Gemini exception: {type(e).__name__}: {e}")
