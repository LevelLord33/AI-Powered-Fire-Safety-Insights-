"""
NASA BASS-II Experimental Data Extractor
Extracts all 126 structured test records from Appendix A of NASA/TM-20210011385
and generates a clean, verified CSV dataset in data/processed/.
"""

import os
import re
import pymupdf
import pandas as pd


def clean_val(v):
    if v is None:
        return ""
    v = str(v).replace("\n", " ").strip()
    v = re.sub(r"\s+", " ", v)
    if v in ["---", "----", "----------", "----------------", "NA", "N/A"]:
        return ""
    return v


def parse_float(v):
    v = clean_val(v)
    if not v:
        return None
    try:
        return float(v)
    except ValueError:
        return None


def extract_bass_ii_data(pdf_path, output_csv_path):
    doc = pymupdf.open(pdf_path)

    pi_page_ranges = [
        ("Subrata Bhattacharjee", [110, 111]),
        ("Paul V. Ferkul", [112]),
        ("Carlos Fernandez-Pello", [113, 114]),
        ("Fletcher J. Miller", [115, 116]),
        ("Sandra L. Olson", [117, 118]),
        ("James S. Tien", [119, 120]),
    ]

    records = []

    for pi, pages in pi_page_ranges:
        header_map = None

        for pno in pages:
            page = doc[pno]
            tables = page.find_tables().tables
            if not tables:
                continue

            raw_rows = tables[0].extract()
            header_row = raw_rows[0]

            # Build header mapping from first page of table or when header exists
            col_map = {}
            for col_idx, h in enumerate(header_row):
                if not h:
                    continue
                h_clean = str(h).replace("\n", " ").strip()
                if "As-run test number" in h_clean:
                    col_map["as_run_num"] = col_idx
                elif "Test number" in h_clean:
                    col_map["test_id"] = col_idx
                elif "Sample number" in h_clean:
                    col_map["sample_id"] = col_idx
                elif "Material" in h_clean:
                    col_map["material"] = col_idx
                elif "Igniter" in h_clean:
                    col_map["igniter"] = col_idx
                elif "Flow restrictor" in h_clean:
                    col_map["flow_restrictor"] = col_idx
                elif "Sample distance" in h_clean:
                    col_map["flow_config"] = col_idx
                elif "Fan display" in h_clean:
                    col_map["fan_setting"] = col_idx
                elif "Air display" in h_clean:
                    col_map["air_velocity"] = col_idx
                elif "Calibrated initial vol% O2" in h_clean:
                    col_map["cal_o2_init"] = col_idx
                elif "Calibrated final vol% O2" in h_clean:
                    col_map["cal_o2_final"] = col_idx
                elif "Initial vol% O2" in h_clean:
                    col_map["o2_init"] = col_idx
                elif "Final vol% O2" in h_clean:
                    col_map["o2_final"] = col_idx
                elif "Initial vol% CO2" in h_clean:
                    col_map["co2_init"] = col_idx
                elif "Final vol% CO2" in h_clean:
                    col_map["co2_final"] = col_idx
                elif "Initial CO, ppm" in h_clean:
                    col_map["co_init"] = col_idx
                elif "Final CO, ppm" in h_clean:
                    col_map["co_final"] = col_idx
                elif "Test observations" in h_clean:
                    col_map["observations"] = col_idx

            if col_map:
                header_map = col_map

            current_rec = None
            for r in raw_rows[1:]:
                # Check for test id in first few cells
                test_id_match = None
                for idx in range(min(10, len(r))):
                    cell = r[idx]
                    if cell and re.match(r"^[BFPMOT]\d{1,2}[a-z]?$", str(cell).strip()):
                        test_id_match = str(cell).strip()
                        break

                if test_id_match:
                    if current_rec:
                        records.append(current_rec)

                    current_rec = {
                        "PI": pi,
                        "Test_ID": test_id_match,
                        "header_map": header_map,
                        "cells": {
                            i: str(c).strip()
                            for i, c in enumerate(r)
                            if c is not None and str(c).strip()
                        },
                    }
                elif current_rec:
                    # Append continuation text
                    for i, c in enumerate(r):
                        if c is not None and str(c).strip():
                            val = str(c).strip()
                            if i in current_rec["cells"]:
                                current_rec["cells"][i] += " " + val
                            else:
                                current_rec["cells"][i] = val

            if current_rec:
                records.append(current_rec)
                current_rec = None

    # Transform records into clean dataframe
    clean_rows = []
    for rec in records:
        hmap = rec["header_map"]
        cells = rec["cells"]

        def get_by_header(key):
            if key in hmap:
                idx = hmap[key]
                # Check idx and immediate neighbor idx-1, idx+1 if shifted
                val = cells.get(idx, "")
                if not val and (idx - 1) in cells:
                    val = cells[idx - 1]
                if not val and (idx + 1) in cells:
                    val = cells[idx + 1]
                return clean_val(val)
            return ""

        # Date & GMT is always col 0
        date_gmt = clean_val(cells.get(0, ""))
        time_range = clean_val(cells.get(1, ""))

        # As-run test number
        as_run = get_by_header("as_run_num")
        if not as_run or not as_run.isdigit():
            for idx in [2, 3, 4]:
                if idx in cells and cells[idx].isdigit():
                    as_run = cells[idx]
                    break

        # Sample ID
        sample_id = get_by_header("sample_id")
        if not sample_id:
            for idx in [6, 7, 8, 9]:
                if idx in cells and cells[idx] != rec["Test_ID"]:
                    sample_id = cells[idx]
                    break

        # Fuel Material
        material = get_by_header("material")
        if not material:
            mat_parts = []
            for idx in range(9, 14):
                val = cells.get(idx, "")
                if (
                    val
                    and val != sample_id
                    and val != rec["Test_ID"]
                    and not val.isdigit()
                ):
                    mat_parts.append(val)
            material = " ".join(mat_parts)
        material = clean_val(material)

        # Flow configuration
        flow_cfg = get_by_header("flow_config")
        if not flow_cfg or flow_cfg.isdigit():
            # Check for words Opposed, Concurrent, Stagnation
            for val in cells.values():
                val_l = val.lower()
                if "opposed" in val_l:
                    flow_cfg = "Opposed"
                    break
                elif "concurrent" in val_l:
                    flow_cfg = "Concurrent"
                    break
                elif "stagnation" in val_l:
                    flow_cfg = "Axial Stagnation"
                    break

        flow_restrictor = get_by_header("flow_restrictor")
        if not flow_restrictor or flow_restrictor not in ["0", "1", "2"]:
            for idx in [15, 16, 17]:
                if idx in cells and cells[idx] in ["0", "1", "2"]:
                    flow_restrictor = cells[idx]
                    break

        fan_setting = get_by_header("fan_setting")
        air_velocity = get_by_header("air_velocity")

        cal_o2_init = parse_float(get_by_header("cal_o2_init"))
        cal_o2_final = parse_float(get_by_header("cal_o2_final"))
        o2_init = parse_float(get_by_header("o2_init"))
        o2_final = parse_float(get_by_header("o2_final"))
        co2_init = parse_float(get_by_header("co2_init"))
        co2_final = parse_float(get_by_header("co2_final"))
        co_init = parse_float(get_by_header("co_init"))
        co_final = parse_float(get_by_header("co_final"))

        observations = get_by_header("observations")
        if not observations:
            max_idx = max(cells.keys())
            observations = clean_val(cells.get(max_idx, ""))

        clean_rows.append(
            {
                "as_run_num": int(as_run) if as_run and as_run.isdigit() else None,
                "test_id": rec["Test_ID"],
                "principal_investigator": rec["PI"],
                "date_gmt": date_gmt,
                "time_range": time_range,
                "sample_id": sample_id,
                "fuel_material": material,
                "flow_configuration": flow_cfg,
                "flow_restrictor": flow_restrictor,
                "fan_setting": fan_setting,
                "air_velocity_cms": air_velocity,
                "calibrated_initial_o2_pct": cal_o2_init,
                "calibrated_final_o2_pct": cal_o2_final,
                "initial_o2_pct": o2_init,
                "final_o2_pct": o2_final,
                "initial_co2_pct": co2_init,
                "final_co2_pct": co2_final,
                "initial_co_ppm": co_init,
                "final_co_ppm": co_final,
                "observations": observations,
            }
        )

    df = pd.DataFrame(clean_rows)
    df = df.sort_values(by=["as_run_num", "test_id"]).reset_index(drop=True)
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    df.to_csv(output_csv_path, index=False)
    print(f"Successfully wrote {len(df)} records into {output_csv_path}")
    return df


if __name__ == "__main__":
    pdf = r"c:\Users\Admin\Desktop\flame-in-freefall\data\docs\bass_ii_summary_report.pdf"
    csv_out = (
        r"c:\Users\Admin\Desktop\flame-in-freefall\data\processed\bass_ii_experiments.csv"
    )
    extract_bass_ii_data(pdf, csv_out)
