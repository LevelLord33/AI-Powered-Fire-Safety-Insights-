import os
import sys
import pandas as pd
import numpy as np
import json

base_dir = r"c:\Users\Admin\Desktop\flame-in-freefall"

print("==================================================")
print("TASK 1: DATASET INVENTORY & INTEGRITY")
print("==================================================")

# 1. BASS-II
bass_path = os.path.join(base_dir, "data", "processed", "bass_ii_experiments.csv")
df_bass = pd.read_csv(bass_path)
print(f"BASS-II shape: {df_bass.shape} (rows: {len(df_bass)}, cols: {len(df_bass.columns)})")
print("BASS-II columns:", list(df_bass.columns))
print("BASS-II unique test_id:", df_bass['test_id'].nunique())
print("BASS-II unique as_run_num:", df_bass['as_run_num'].nunique())
print("BASS-II null counts per column:")
for col, cnt in df_bass.isnull().sum().items():
    if cnt > 0:
        print(f"  {col}: {cnt} nulls ({cnt/len(df_bass)*100:.1f}%)")

# 2. FLEX Planned Matrix
flex_plan_path = os.path.join(base_dir, "data", "processed", "flex_experiments.csv")
df_flex_plan = pd.read_csv(flex_plan_path)
print(f"\nFLEX Planned shape: {df_flex_plan.shape} (rows: {len(df_flex_plan)}, cols: {len(df_flex_plan.columns)})")
print("FLEX Planned columns:", list(df_flex_plan.columns))
print("FLEX Planned unique test_no:", df_flex_plan['test_no'].nunique())
print("FLEX Planned null counts per column:")
for col, cnt in df_flex_plan.isnull().sum().items():
    if cnt > 0:
        print(f"  {col}: {cnt} nulls ({cnt/len(df_flex_plan)*100:.1f}%)")

# 3. FLEX Experimental Results
flex_res_path = os.path.join(base_dir, "data", "processed", "flex_experimental_results.csv")
df_flex_res = pd.read_csv(flex_res_path)
print(f"\nFLEX Results shape: {df_flex_res.shape} (rows: {len(df_flex_res)}, cols: {len(df_flex_res.columns)})")
print("FLEX Results columns:", list(df_flex_res.columns))
print("FLEX Results unique flex_test_num:", df_flex_res['flex_test_num'].nunique())
print("FLEX Results unique flex_identifier:", df_flex_res['flex_identifier'].nunique())
print("FLEX Results null counts per column:")
for col, cnt in df_flex_res.isnull().sum().items():
    if cnt > 0:
        print(f"  {col}: {cnt} nulls ({cnt/len(df_flex_res)*100:.1f}%)")

# 4. Raw FLEX CSV
raw_flex_path = os.path.join(base_dir, "data", "raw", "flex", "PSI-69_Experimental table_FLEX.csv")
if os.path.exists(raw_flex_path):
    df_raw_flex = pd.read_csv(raw_flex_path, encoding='latin-1')
    print(f"\nRaw FLEX table shape: {df_raw_flex.shape} (rows: {len(df_raw_flex)}, cols: {len(df_raw_flex.columns)})")
    print("Raw FLEX columns:", list(df_raw_flex.columns))

# 5. Search Index
search_idx_path = os.path.join(base_dir, "data", "processed", "search_index.json")
if os.path.exists(search_idx_path):
    with open(search_idx_path, 'r', encoding='utf-8') as f:
        sdata = json.load(f)
    print(f"\nSearch index items: {len(sdata)}")
    sources = set(item.get("dataset", item.get("source", "unknown")) for item in sdata)
    print(f"Datasets indexed: {sources}")

# 6. Source PDFs
for pdf_rel in [
    os.path.join("data", "docs", "bass_ii_summary_report.pdf"),
    os.path.join("data", "docs", "FLEX_EIRD_v4.pdf"),
    os.path.join("data", "processed", "TM-20210011385.pdf")
]:
    p = os.path.join(base_dir, pdf_rel)
    if os.path.exists(p):
        print(f"PDF exists: {pdf_rel} ({os.path.getsize(p)/(1024*1024):.2f} MB)")
    else:
        print(f"PDF MISSING: {pdf_rel}")

print("\n==================================================")
print("TASK 3: SCIENTIFIC BENCHMARK VERIFICATION")
print("==================================================")

print("\n--- Question 1: BASS-II highest numeric final CO reading ---")
co_numeric = pd.to_numeric(df_bass['final_co_ppm'], errors='coerce')
max_co_val = co_numeric.max()
max_co_idx = co_numeric.idxmax()
max_row = df_bass.loc[max_co_idx]
print(f"Highest numeric final CO reading: {max_co_val} ppm")
print(f"Test ID: {max_row['test_id']}, As-run: {max_row['as_run_num']}, Fuel: {max_row['fuel_material']}, Flow config: {max_row['flow_configuration']}")
print(f"Table: {max_row.get('table_name', 'N/A')}, PDF page: {max_row.get('pdf_page', 'N/A')}")

# Check O13a and O13b
o13a = df_bass[df_bass['test_id'].str.contains('O13a', case=False, na=False)]
o13b = df_bass[df_bass['test_id'].str.contains('O13b', case=False, na=False)]
print("O13a details:")
print(o13a[['test_id', 'as_run_num', 'final_co_ppm', 'fuel_material', 'flow_configuration', 'observations']].to_dict(orient='records'))
print("O13b details:")
print(o13b[['test_id', 'as_run_num', 'final_co_ppm', 'fuel_material', 'flow_configuration', 'observations']].to_dict(orient='records'))

# Check non-numeric markers
non_num = df_bass[co_numeric.isna() & df_bass['final_co_ppm'].notna()]
print("Non-numeric final_co_ppm entries:")
for _, r in non_num.iterrows():
    print(f"  Test: {r['test_id']}, As-run: {r['as_run_num']}, Value: '{r['final_co_ppm']}', Obs: {r['observations']}")

print("\n--- Question 2: FLEX experimental outcome distribution ---")
outcome_counts = df_flex_res['test_end_outcome'].value_counts()
outcome_pcts = df_flex_res['test_end_outcome'].value_counts(normalize=True) * 100
for outcome in ['Extinction', 'Disruption', 'Completion']:
    cnt = outcome_counts.get(outcome, 0)
    pct = outcome_pcts.get(outcome, 0.0)
    print(f"  {outcome}: {cnt} records ({pct:.2f}%)")
print(f"Total records: {len(df_flex_res)}")

print("\n--- Question 3: FLEX Test #114 and neighbors ---")
t114 = df_flex_res[df_flex_res['flex_test_num'] == 114]
print("Test 114 record in processed CSV:")
for k, v in t114.to_dict(orient='records')[0].items():
    print(f"  {k}: {v}")

# Raw CSV check for Test #114
if 'Test #' in df_raw_flex.columns:
    raw_114 = df_raw_flex[df_raw_flex['Test #'] == 114]
    print("Test 114 record in RAW CSV:")
    for k, v in raw_114.to_dict(orient='records')[0].items():
        print(f"  {k}: {v}")

print("Neighboring tests by flex_test_num:")
neighbors = df_flex_res[df_flex_res['flex_test_num'].isin([112, 113, 114, 115, 116, 117])].sort_values('flex_test_num')
for _, r in neighbors.iterrows():
    print(f"  Test #{r['flex_test_num']}: ID={r['flex_identifier']}, Pressure={r['ambient_pressure_mmhg']} mmHg ({r['ambient_pressure_atm']} atm), Outcome={r['test_end_outcome']}")

print("\n--- Question 4: Planned vs Recorded Counts ---")
print(f"FLEX Planned Matrix count: {len(df_flex_plan)}")
print(f"FLEX Experimental Results count: {len(df_flex_res)}")
print(f"Raw PSI-69 Experimental table count: {len(df_raw_flex)}")

print("\n--- Question 5: Missing FLEX burning rate measurements ---")
missing_burn = df_flex_res[df_flex_res['burning_rate_mm2_s'].isna()]
print(f"Missing count: {len(missing_burn)}")
print(f"Missing test numbers: {sorted(missing_burn['flex_test_num'].tolist())}")
expected_missing = [66, 70, 73, 74, 109, 110, 111, 130, 131, 144, 145, 179, 180, 201, 214, 274]
print(f"Matches expected 16 test numbers exactly? {sorted(missing_burn['flex_test_num'].tolist()) == expected_missing}")

print("\n--- Question 6: BASS-II Pearson correlation between consumed O2 and produced CO2 ---")
# Consumed O2 = initial_o2_pct - final_o2_pct
# Produced CO2 = final_co2_pct - initial_co2_pct
df_corr = df_bass.copy()
# Note: check both initial_o2_pct and calibrated_initial_o2_pct
df_corr['consumed_o2'] = pd.to_numeric(df_corr['initial_o2_pct'], errors='coerce') - pd.to_numeric(df_corr['final_o2_pct'], errors='coerce')
df_corr['produced_co2'] = pd.to_numeric(df_corr['final_co2_pct'], errors='coerce') - pd.to_numeric(df_corr['initial_co2_pct'], errors='coerce')
valid_corr = df_corr.dropna(subset=['consumed_o2', 'produced_co2'])
print(f"Valid records with uncalibrated O2: N = {len(valid_corr)}, r = {valid_corr['consumed_o2'].corr(valid_corr['produced_co2']):.5f}")

df_corr['consumed_cal_o2'] = pd.to_numeric(df_corr['calibrated_initial_o2_pct'], errors='coerce') - pd.to_numeric(df_corr['calibrated_final_o2_pct'], errors='coerce')
valid_cal = df_corr.dropna(subset=['consumed_cal_o2', 'produced_co2'])
print(f"Valid records with calibrated O2: N = {len(valid_cal)}, r = {valid_cal['consumed_cal_o2'].corr(valid_cal['produced_co2']):.5f}")

print("\n--- Question 7: Methanol droplet experiments ---")
methanol_bass = df_bass[df_bass['fuel_material'].astype(str).str.contains('methanol', case=False, na=False)]
print(f"Methanol records in BASS-II: {len(methanol_bass)}")
methanol_flex = df_flex_res[df_flex_res['fuel'].astype(str).str.contains('methanol', case=False, na=False)]
print(f"Methanol records in FLEX results: {len(methanol_flex)}")
