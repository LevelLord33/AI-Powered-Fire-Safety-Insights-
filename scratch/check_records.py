import pandas as pd

raw_df = pd.read_csv('data/raw/flex/PSI-69_Experimental table_FLEX.csv', encoding='latin-1')
proc_df = pd.read_csv('data/processed/flex_experimental_results.csv')

target_tests = [112, 113, 114, 115, 116]

print("=== RAW CSV RECORDS (PSI-69_Experimental table_FLEX.csv) ===")
for t in target_tests:
    row = raw_df[raw_df['FLEX Test #'] == t]
    if not row.empty:
        r = row.iloc[0]
        print(f"Test #{t}: Ident={r['FLEX Identifier']}, Date={r['Test Date']}, GMT={r['Test GMT']}, P={r['Ambient pressure; mmHg']} mmHg, Fuel={r['Fuel']}, Outcome={r['Test end']}")
    else:
        print(f"Test #{t}: NOT FOUND")

print("\n=== PROCESSED CSV RECORDS (flex_experimental_results.csv) ===")
for t in target_tests:
    row = proc_df[proc_df['flex_test_num'] == t]
    if not row.empty:
        r = row.iloc[0]
        print(f"Test #{t}: Ident={r['flex_identifier']}, Date={r['test_date']}, GMT={r['test_gmt']}, P={r['ambient_pressure_mmhg']} mmHg, Fuel={r['fuel']}, Outcome={r['test_end_outcome']}")
    else:
        print(f"Test #{t}: NOT FOUND")

print("\n=== RAW CSV SEQUENCE SURROUNDING TEST #114 ===")
idx_114 = raw_df[raw_df['FLEX Test #'] == 114].index[0]
print(f"Index of Test 114: {idx_114} (CSV row {idx_114 + 2})")
for i in range(max(0, idx_114 - 3), min(len(raw_df), idx_114 + 4)):
    r = raw_df.iloc[i]
    print(f"Row {i} (Line {i+2}): Test #{r['FLEX Test #']}, Ident={r['FLEX Identifier']}, Date={r['Test Date']}, P={r['Ambient pressure; mmHg']} mmHg, Fuel={r['Fuel']}, Outcome={r['Test end']}")
