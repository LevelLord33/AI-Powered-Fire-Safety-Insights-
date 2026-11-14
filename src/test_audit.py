"""
Automated Audit Script for Flame in Freefall Dashboard
Tests data loading, filtering edge cases, missing value resilience, and chart data integrity.
"""

from pathlib import Path
import sys
import pandas as pd

# Ensure workspace root is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from src.data_loader import (
    load_experiments,
    get_dataset_summary,
    filter_experiments,
)


def run_audit():
    results = {}

    # Test 1: File Presence & Load
    csv_path = root_dir / "data" / "processed" / "bass_ii_experiments.csv"
    pdf_path = root_dir / "data" / "docs" / "bass_ii_summary_report.pdf"
    zip_path = (
        root_dir
        / "data"
        / "raw"
        / "PSI-25_metadata_PSI_metadata_PSI-101_BASS-II.zip"
    )

    results["csv_exists"] = csv_path.exists()
    results["pdf_exists"] = pdf_path.exists()
    results["zip_exists"] = zip_path.exists()

    df = load_experiments(csv_path)
    results["records_loaded"] = len(df)
    results["expected_126_records"] = len(df) == 126

    # Test 2: Source Data Integrity
    results["pis_count"] = df["principal_investigator"].nunique()
    results["has_observations"] = df["observations"].notna().all()
    results["calibrated_o2_complete"] = (
        df["calibrated_initial_o2_pct"].notna().all()
    )
    results["o2_range_valid"] = (
        df["calibrated_initial_o2_pct"].min() >= 13.0
        and df["calibrated_initial_o2_pct"].max() <= 23.0
    )

    # Test 3: Filter & Search Functionality
    # Regular filter
    filtered_pi = filter_experiments(df, pis=["Sandra L. Olson"])
    results["olson_filter_works"] = len(filtered_pi) == 24

    filtered_search = filter_experiments(df, search_query="sooty")
    results["keyword_search_works"] = len(filtered_search) > 0

    # Edge Case: Empty Filter (no matching records)
    filtered_empty = filter_experiments(
        df, search_query="NON_EXISTENT_SAMPLE_XYZ_999"
    )
    results["empty_filter_handled"] = (
        isinstance(filtered_empty, pd.DataFrame) and len(filtered_empty) == 0
    )

    # Test 4: Chart Column Types & Units
    results["calibrated_initial_o2_is_float"] = pd.api.types.is_float_dtype(
        df["calibrated_initial_o2_pct"]
    )
    results["final_co_ppm_is_float"] = pd.api.types.is_float_dtype(
        df["final_co_ppm"]
    )
    results["delta_o2_is_float"] = pd.api.types.is_float_dtype(
        df["delta_o2_pct"]
    )
    results["delta_co2_is_float"] = pd.api.types.is_float_dtype(
        df["delta_co2_pct"]
    )

    # Test 5: Missing Value Safety
    summary = get_dataset_summary(df)
    results["missing_counts_reported"] = len(summary["missing_counts"]) > 0

    # Verify that dropping NA leaves valid data for plotting
    valid_co = df.dropna(subset=["calibrated_initial_o2_pct", "final_co_ppm"])
    results["chart1_valid_points"] = len(valid_co)

    valid_delta = df.dropna(subset=["flow_configuration", "delta_o2_pct"])
    results["chart3_valid_points"] = len(valid_delta)

    return results


if __name__ == "__main__":
    res = run_audit()
    print("=== AUDIT RESULTS ===")
    all_passed = True
    for k, v in res.items():
        print(f"  {k}: {v}")
        if v is False:
            all_passed = False
    print("ALL TESTS PASSED:", all_passed)
