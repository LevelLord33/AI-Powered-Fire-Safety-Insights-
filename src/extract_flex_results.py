"""
NASA FLEX (Flame Extinguishment Experiment / PSI-69) Experimental Results Extractor
Extracts all 274 as-run flight experimental records from data/raw/flex/PSI-69_Experimental table_FLEX.csv
into data/processed/flex_experimental_results.csv.

Preserves authentic measurements, documents column mapping, standardizes units,
replaces placeholder symbols with true nulls (never zero), and exports in UTF-8.
"""

from pathlib import Path
import pandas as pd
import numpy as np


def clean_numeric(val):
    """
    Cleans raw NASA cell values:
    - Replaces placeholder dash symbols (en-dash byte 0x96) with NaN
    - Strips leading tilde approximations (~6 -> 6.0) for numeric calculations
    - Converts empty strings and whitespace to NaN
    - Preserves genuine numbers
    """
    if pd.isna(val):
        return np.nan
    s = str(val).strip()
    if s in ['\x96', '–', '-', '']:
        return np.nan
    if s.startswith('~'):
        try:
            return float(s[1:])
        except ValueError:
            return np.nan
    try:
        return float(s)
    except ValueError:
        return np.nan


def extract_flex_results(raw_csv_path: Path, output_csv_path: Path) -> pd.DataFrame:
    """
    Parses the raw NASA PSI-69 Experimental table and exports a clean processed CSV.
    """
    print(f"Reading raw NASA FLEX experimental table from {raw_csv_path}...")
    df_raw = pd.read_csv(raw_csv_path, encoding='cp1252')
    print(f"Loaded {len(df_raw)} raw rows across {len(df_raw.columns)} columns.")

    records = []
    for _, row in df_raw.iterrows():
        p_mmhg = float(row['Ambient pressure; mmHg'])
        burn_time_raw = str(row['Burn time; s']).strip() if pd.notna(row['Burn time; s']) else ''
        burn_time_num = clean_numeric(row['Burn time; s'])

        records.append({
            'flex_test_num': int(row['FLEX Test #']),
            'flex_identifier': str(row['FLEX Identifier']).strip(),
            'test_date': str(row['Test Date']).strip(),
            'test_gmt': str(row['Test GMT']).strip() if pd.notna(row['Test GMT']) else '',
            'fuel': str(row['Fuel']).strip(),
            'ambient_pressure_mmhg': p_mmhg,
            'ambient_pressure_atm': round(p_mmhg / 760.0, 4),
            'initial_o2_mole_fraction': float(row['O initial ambient composition; mole fraction']),
            'initial_n2_mole_fraction': float(row['N initial ambient composition; mole fraction']),
            'initial_co2_mole_fraction': float(row['CO initial ambient composition; mole fraction']),
            'initial_he_mole_fraction': float(row['He initial ambient composition; mole fraction']),
            'droplet_initial_diameter_mm': clean_numeric(row['Droplet initial diameter; mm']),
            'visible_flame_extinction_diameter_mm': clean_numeric(row['Visible flame extinction diameter; mm']),
            'burning_rate_mm2_s': clean_numeric(row['Burning rate; mm']),
            'burn_time_s': burn_time_num,
            'burn_time_raw': burn_time_raw,
            'test_end_outcome': str(row['Test end']).strip(),
            'investigation': 'FLEX (Droplet Combustion)',
            'source_file': 'NASA PSI-69_Experimental table_FLEX.csv',
            'record_type': 'As-Run Flight Experimental Results'
        })

    df_out = pd.DataFrame(records)
    output_csv_path.parent.mkdir(parents=True, exist_ok=True)
    df_out.to_csv(output_csv_path, index=False, encoding='utf-8')
    print(f"Successfully saved {len(df_out)} processed experimental records to {output_csv_path}")
    return df_out


if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent
    raw_file = base / "data" / "raw" / "flex" / "PSI-69_Experimental table_FLEX.csv"
    if not raw_file.exists():
        raw_file = base / "data" / "raw" / "PSI-69_Experimental table_FLEX.csv"
    out_file = base / "data" / "processed" / "flex_experimental_results.csv"
    extract_flex_results(raw_file, out_file)
