"""
Data loader module for NASA BASS-II experimental records.
Loads, validates, and prepares data for Streamlit exploration and Plotly visualization.
"""

from pathlib import Path
import re
import pandas as pd


DATA_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "processed"
    / "bass_ii_experiments.csv"
)


def load_experiments(csv_path=None):
    """Load the verified NASA BASS-II experimental dataset and compute derived metrics."""
    if csv_path is None:
        csv_path = DATA_PATH

    csv_path = Path(csv_path)
    if not csv_path.exists():
        raise FileNotFoundError(
            f"BASS-II dataset not found at {csv_path}. Please run src/extract_experiments.py first."
        )

    df = pd.read_csv(csv_path)

    # Derived physics metrics based strictly on genuine NASA sensor readings
    df["delta_o2_pct"] = (
        df["calibrated_initial_o2_pct"] - df["calibrated_final_o2_pct"]
    )
    df["delta_co2_pct"] = df["final_co2_pct"] - df["initial_co2_pct"]
    df["delta_co_ppm"] = df["final_co_ppm"] - df["initial_co_ppm"]

    # Extract single numerical air velocity where available for plotting
    def parse_first_velocity(v):
        if pd.isna(v):
            return None
        v_str = str(v).strip()
        m = re.search(r"(\d+(\.\d+)?)", v_str)
        if m:
            return float(m.group(1))
        return None

    df["air_velocity_numeric"] = df["air_velocity_cms"].apply(
        parse_first_velocity
    )

    # Simplified material category for grouping
    def categorize_material(m):
        if pd.isna(m):
            return "Unknown"
        m_lower = str(m).lower()
        if "rod" in m_lower:
            return "PMMA Rod"
        elif "film" in m_lower or "100-" in m_lower or "200-" in m_lower:
            return "Thin PMMA Film"
        elif "sibal" in m_lower:
            return "SIBAL Fabric (Cotton/Fiberglass)"
        elif "nomex" in m_lower:
            return "Nomex Fabric"
        elif "slab" in m_lower or "thick" in m_lower:
            return "Thick PMMA Slab"
        elif "sphere" in m_lower:
            return "PMMA Sphere Section"
        return "Other Fuel Sample"

    df["material_category"] = df["fuel_material"].apply(categorize_material)

    return df


def get_dataset_summary(df):
    """Return summary statistics and data completeness metadata."""
    total_records = len(df)
    missing_counts = df.isnull().sum().to_dict()

    summary = {
        "total_records": total_records,
        "total_columns": len(df.columns),
        "unique_pis": df["principal_investigator"].nunique(),
        "unique_materials": df["fuel_material"].nunique(),
        "min_o2": df["calibrated_initial_o2_pct"].min(),
        "max_o2": df["calibrated_initial_o2_pct"].max(),
        "avg_o2": df["calibrated_initial_o2_pct"].mean(),
        "max_co_ppm": df["final_co_ppm"].max(),
        "missing_counts": missing_counts,
    }
    return summary


def filter_experiments(
    df,
    pis=None,
    materials=None,
    flow_configs=None,
    min_o2=None,
    max_o2=None,
    search_query="",
):
    """Filter records based on real NASA parameters."""
    filtered = df.copy()

    if pis:
        filtered = filtered[filtered["principal_investigator"].isin(pis)]

    if materials:
        filtered = filtered[filtered["material_category"].isin(materials)]

    if flow_configs:
        filtered = filtered[filtered["flow_configuration"].isin(flow_configs)]

    if min_o2 is not None:
        filtered = filtered[filtered["calibrated_initial_o2_pct"] >= min_o2]

    if max_o2 is not None:
        filtered = filtered[filtered["calibrated_initial_o2_pct"] <= max_o2]

    if search_query and search_query.strip():
        q = search_query.strip().lower()
        mask = (
            filtered["test_id"].astype(str).str.lower().str.contains(q)
            | filtered["sample_id"].astype(str).str.lower().str.contains(q)
            | filtered["fuel_material"].astype(str).str.lower().str.contains(q)
            | filtered["observations"].astype(str).str.lower().str.contains(q)
        )
        filtered = filtered[mask]

    return filtered
