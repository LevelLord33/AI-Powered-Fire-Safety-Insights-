import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Ensure workspace root in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.data_loader import load_experiments, get_dataset_summary
from src.retriever import NASARetriever
from backend.config import MISSION_METADATA, EXPERIMENTS_CSV_PATH, SEARCH_INDEX_JSON_PATH, SUMMARY_PDF_PATH

print("=" * 65)
print("PHASE 8 SCIENTIFIC DATA & METROLOGY INDEPENDENT AUDIT")
print("=" * 65)

# 1. Total records and integrity
df = load_experiments()
print(f"Total experimental flight runs: {len(df)}")
assert len(df) == 126, "Expected exactly 126 records"

summary = get_dataset_summary(df)
print(f"Dataset summary columns: {summary['total_columns']}")
print(f"Unique fuel materials: {summary['unique_materials']}")
print(f"Material categories: {sorted(df['material_category'].dropna().unique().tolist())}")
print(f"Flow configurations: {sorted(df['flow_configuration'].dropna().unique().tolist())}")

# 2. Oxygen & Gas Measurements
o2_series = df["calibrated_initial_o2_pct"].dropna()
print(f"\nCalibrated Initial Oxygen (% vol):")
print(f"  Count non-null: {len(o2_series)} / 126")
print(f"  Min: {o2_series.min():.2f} % vol")
print(f"  Max: {o2_series.max():.2f} % vol")
print(f"  Mean: {o2_series.mean():.2f} % vol")
print(f"  Standard Deviation: {o2_series.std():.2f} % vol")

co_series = df["final_co_ppm"].dropna()
print(f"\nFinal Carbon Monoxide (ppm):")
print(f"  Count non-null: {len(co_series)} / 126 (Note: {126 - len(co_series)} uninstrumented)")
print(f"  Min: {co_series.min():.1f} ppm")
print(f"  Max: {co_series.max():.1f} ppm (Test {df.loc[co_series.idxmax(), 'test_id']}, Fuel: {df.loc[co_series.idxmax(), 'fuel_material']})")
print(f"  Mean: {co_series.mean():.1f} ppm")

vel_series = df["air_velocity_numeric"].dropna()
print(f"\nAirflow Velocity (cm/s):")
print(f"  Count non-null: {len(vel_series)} / 126")
print(f"  Min: {vel_series.min():.1f} cm/s")
print(f"  Max: {vel_series.max():.1f} cm/s")
print(f"  Mean: {vel_series.mean():.1f} cm/s")

# 3. Correlation Verification
paired = df[df["delta_o2_pct"].notna() & df["delta_co2_pct"].notna()]
n = len(paired)
x = paired["delta_o2_pct"].values
y = paired["delta_co2_pct"].values
r = np.corrcoef(x, y)[0, 1]
print(f"\nGas Stoichiometry Correlation:")
print(f"  Paired observations: {n} / 126")
print(f"  Pearson r (O2 consumed vs CO2 produced): {r:.5f}")
print(f"  Pearson r (atmospheric [O2] change vs [CO2] change): {-r:.5f}")

# 4. Physical Outcomes & Logbook Categories
def classify_full(obs):
    if not obs or pd.isna(obs):
        return "Observation Recorded"
    obs_lower = str(obs).lower()
    if any(w in obs_lower for w in ["extinguish", "quench", "went out", "died", "put out", "self-extinguished"]):
        return "Extinguished / Quenched"
    elif any(w in obs_lower for w in ["spread", "burn", "sustained", "steady", "grew", "propagated"]):
        return "Sustained Flame"
    return "Observation Recorded"

df["classified_outcome"] = df["observations"].apply(classify_full)
counts = df["classified_outcome"].value_counts().to_dict()
print(f"\nOutcome Classification Breakdown:")
for k, v in counts.items():
    print(f"  - {k}: {v} ({v/len(df)*100:.1f}%)")

# 5. Provenance & Citations Integrity
retriever = NASARetriever()
print(f"\nDocument Corpus Provenance:")
print(f"  Total indexed chunks: {len(retriever.chunks)}")
print(f"  Technical report: {MISSION_METADATA['technical_report']}")
print(f"  DOI: {MISSION_METADATA['doi']}")
print(f"  PSI Repository: {MISSION_METADATA['psi_repository_url']}")
print(f"  PDF file exists: {SUMMARY_PDF_PATH.exists()} (Size: {SUMMARY_PDF_PATH.stat().st_size} bytes)")
print(f"  CSV file exists: {EXPERIMENTS_CSV_PATH.exists()} (Size: {EXPERIMENTS_CSV_PATH.stat().st_size} bytes)")
print(f"  Index file exists: {SEARCH_INDEX_JSON_PATH.exists()} (Size: {SEARCH_INDEX_JSON_PATH.stat().st_size} bytes)")
