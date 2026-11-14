"""
NASA FLEX (Droplet Flame Extinguishment in Microgravity) Test Matrix Extractor
Extracts all 290 planned experimental test condition records from Section 5.3 (pages 46-55)
of NASA FLEX_EIRD_v4.pdf into data/processed/flex_experiments.csv.
"""

from pathlib import Path
import re
import pymupdf
import pandas as pd


def extract_flex_test_matrix(pdf_path: Path, output_csv_path: Path) -> pd.DataFrame:
    doc = pymupdf.open(pdf_path)
    records = []

    # State tracking across pages
    current_fuel = "Heptane (C7H16)"
    current_diluent = "N2"
    current_suppressant = "None"
    current_fiber = "No fiber support (Free Droplet)"
    current_flow = 0.0
    current_diam = "3, 5 mm"

    # Pages 46 to 55 (0-indexed 45 to 54)
    for pno in range(45, 55):
        page_num = pno + 1
        text = doc[pno].get_text()
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        # Filter out trailing page number
        if lines and lines[-1] == str(page_num):
            lines = lines[:-1]

        i = 0
        while i < len(lines):
            line = lines[i]

            # Detect Fuel changes
            if "Fuel:" in line or "Table" in line or "Diluent:" in line:
                block_text = line
                # Lookahead to collect the header description
                while i + 1 < len(lines) and not lines[i + 1].startswith("Test No.") and not (lines[i + 1].isdigit() and int(lines[i + 1]) < 300):
                    i += 1
                    block_text += " " + lines[i]

                # Update context
                if "C7H16" in block_text or "C 7H" in block_text:
                    current_fuel = "Heptane (C7H16)"
                elif "CH3OH" in block_text or "CH OH" in block_text:
                    current_fuel = "Methanol (CH3OH)"

                if "Suppressant:" in block_text:
                    if "CO2" in block_text or "CO 2" in block_text:
                        current_suppressant = "CO2"
                    elif "SF6" in block_text or "SF 6" in block_text:
                        current_suppressant = "SF6"
                    elif "He" in block_text:
                        current_suppressant = "He"
                    else:
                        current_suppressant = "None"
                else:
                    # Reset suppressant if table does not specify one
                    if "Table 7" in block_text or "Table 8" in block_text:
                        current_suppressant = "None"

                if "SiC" in block_text:
                    current_fiber = "SiC fiber support"
                elif "No fiber" in block_text or "No ﬁber" in block_text:
                    current_fiber = "No fiber support (Free Droplet)"

                if "Flow: 1.5" in block_text:
                    current_flow = 1.5
                elif "Flow: 0.0" in block_text:
                    current_flow = 0.0

                i += 1
                continue

            # Skip header labels
            if line in ["Test No.", "P (atm)", "XO2", "XCO2", "XHe", "XSF6"]:
                i += 1
                continue

            # Check for Test Number
            if line.isdigit() and int(line) <= 290:
                test_no = int(line)
                p_val = None
                o2_val = None
                sup_val = 0.0

                # Expect next line to be pressure
                if i + 1 < len(lines):
                    try:
                        p_val = float(lines[i + 1])
                        i += 1
                    except ValueError:
                        pass

                # Expect next line to be XO2
                if i + 1 < len(lines):
                    try:
                        o2_val = float(lines[i + 1])
                        i += 1
                    except ValueError:
                        pass

                # If suppressant table, expect next line to be X_sup
                if current_suppressant != "None" and i + 1 < len(lines):
                    try:
                        sup_val = float(lines[i + 1])
                        i += 1
                    except ValueError:
                        pass

                records.append({
                    "test_no": test_no,
                    "investigation": "FLEX (Droplet Combustion)",
                    "fuel": current_fuel,
                    "diluent": current_diluent,
                    "suppressant": current_suppressant,
                    "fiber_support": current_fiber,
                    "flow_velocity_cms": current_flow,
                    "initial_droplet_diameters_mm": current_diam,
                    "pressure_atm": p_val,
                    "oxygen_mole_fraction": o2_val,
                    "suppressant_mole_fraction": sup_val,
                    "nitrogen_mole_fraction": round(1.0 - (o2_val or 0.0) - sup_val, 4) if o2_val is not None else None,
                    "source_document": "NASA FLEX_EIRD_v4.pdf",
                    "source_section": "Section 5.3 Detailed Science Test Matrix",
                    "source_page": page_num,
                    "record_type": "Planned Science Protocol Matrix (Requirements Specification)"
                })

            i += 1

    df = pd.DataFrame(records)
    # Deduplicate in case of duplicate layout passes and sort by test_no
    df = df.drop_duplicates(subset=["test_no"]).sort_values("test_no").reset_index(drop=True)
    output_csv_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv_path, index=False)
    print(f"Extracted {len(df)} FLEX test matrix records into {output_csv_path}")
    return df


if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent
    pdf = base / "data" / "docs" / "FLEX_EIRD_v4.pdf"
    csv_out = base / "data" / "processed" / "flex_experiments.csv"
    extract_flex_test_matrix(pdf, csv_out)
