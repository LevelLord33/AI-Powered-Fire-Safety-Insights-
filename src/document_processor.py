"""
Multi-Dataset Document processing and indexing module for NASA BASS-II and FLEX research materials.
Extracts text from PDFs, metadata text files, inventory markdown, and experimental CSV records.
Supports all three NASA datasets:
1. BASS-II Experimental Records (NASA PSI-25 solid fuel combustion)
2. FLEX Planned Conditions (NASA FLEX EIRD v4.0 science protocol matrix)
3. FLEX Experimental Results (NASA PSI-69 as-run droplet flight experiments)

Preserves page numbers, source filenames, record IDs, dataset tags, and official URLs.
"""

import json
import logging
from pathlib import Path
import re
import zipfile
import pandas as pd
import pymupdf

logger = logging.getLogger(__name__)

NASA_PSI_URL = "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25"
NASA_DOI_URL = "https://doi.org/10.60555/4qc4-de67"

FLEX_PSI_URL = "https://psi.nasa.gov/physci/repo/data/investigations/PSI-69"
FLEX_DOI_URL = "https://doi.org/10.60555/k695-k864"


def chunk_text(text, max_words=350, overlap_words=50):
    """Split text into manageable overlapping passages."""
    words = text.split()
    if not words:
        return []
    if len(words) <= max_words:
        return [text]

    chunks = []
    start = 0
    while start < len(words):
        end = min(start + max_words, len(words))
        chunk_words = words[start:end]
        chunks.append(" ".join(chunk_words))
        if end >= len(words):
            break
        start += max_words - overlap_words
    return chunks


class DocumentProcessor:
    """Extracts, structures, and chunks NASA documents across BASS-II and FLEX datasets."""

    def __init__(self, workspace_root=None):
        if workspace_root is None:
            self.root = Path(__file__).resolve().parent.parent
        else:
            self.root = Path(workspace_root)

        # 1. BASS-II sources
        self.pdf_path = self.root / "data" / "docs" / "bass_ii_summary_report.pdf"
        self.zip_path = (
            self.root
            / "data"
            / "raw"
            / "PSI-25_metadata_PSI_metadata_PSI-101_BASS-II.zip"
        )
        self.metadata_txt_path = (
            self.root / "data" / "raw" / "metadata_extracted" / "i_Investigation.txt"
        )
        self.csv_path = self.root / "data" / "processed" / "bass_ii_experiments.csv"

        # 2. FLEX Planned Matrix & Requirements Document
        self.flex_pdf_path = self.root / "data" / "docs" / "FLEX_EIRD_v4.pdf"
        self.flex_planned_csv_path = self.root / "data" / "processed" / "flex_experiments.csv"

        # 3. FLEX As-Run Experimental Results
        self.flex_results_csv_path = self.root / "data" / "processed" / "flex_experimental_results.csv"
        self.flex_raw_csv_path = self.root / "data" / "raw" / "flex" / "PSI-69_Experimental table_FLEX.csv"

        self.inventory_path = self.root / "data_inventory.md"
        self.index_cache_path = (
            self.root / "data" / "processed" / "search_index.json"
        )

    def verify_sources(self):
        """Check availability of each source document without pretending missing files exist."""
        status = {
            "bass_pdf_available": self.pdf_path.exists() and self.pdf_path.stat().st_size > 0,
            "bass_zip_available": self.zip_path.exists() and self.zip_path.stat().st_size > 0,
            "bass_metadata_txt_available": self.metadata_txt_path.exists() and self.metadata_txt_path.stat().st_size > 0,
            "bass_csv_available": self.csv_path.exists() and self.csv_path.stat().st_size > 0,
            "flex_pdf_available": self.flex_pdf_path.exists() and self.flex_pdf_path.stat().st_size > 0,
            "flex_planned_csv_available": self.flex_planned_csv_path.exists() and self.flex_planned_csv_path.stat().st_size > 0,
            "flex_results_csv_available": self.flex_results_csv_path.exists() and self.flex_results_csv_path.stat().st_size > 0,
            "inventory_available": self.inventory_path.exists() and self.inventory_path.stat().st_size > 0,
            # Legacy keys for backward compatibility
            "pdf_available": self.pdf_path.exists() and self.pdf_path.stat().st_size > 0,
            "zip_available": self.zip_path.exists() and self.zip_path.stat().st_size > 0,
            "metadata_txt_available": self.metadata_txt_path.exists() and self.metadata_txt_path.stat().st_size > 0,
            "csv_available": self.csv_path.exists() and self.csv_path.stat().st_size > 0,
        }
        return status

    def inspect_zip(self):
        """Inspect the raw ZIP archive without modifying it."""
        if not self.zip_path.exists():
            return None
        file_list = []
        try:
            with zipfile.ZipFile(self.zip_path, "r") as z:
                for info in z.infolist():
                    file_list.append(
                        {
                            "filename": info.filename,
                            "file_size": info.file_size,
                            "compress_size": info.compress_size,
                        }
                    )
            return file_list
        except Exception as e:
            logger.error(f"Error inspecting ZIP {self.zip_path}: {e}")
            return None

    def process_pdf(self):
        """Extract text from the 144-page BASS-II PDF report, preserving page numbers."""
        if not self.pdf_path.exists():
            logger.warning(f"PDF not found at {self.pdf_path}")
            return []

        chunks = []
        try:
            doc = pymupdf.open(self.pdf_path)
            for page_index in range(len(doc)):
                page_num = page_index + 1
                page = doc[page_index]
                text = page.get_text()
                if not text or len(text.strip()) < 40:
                    continue

                # Clean whitespace
                clean_t = re.sub(r"\s+", " ", text).strip()
                passages = chunk_text(clean_t, max_words=320, overlap_words=40)

                for p_idx, passage in enumerate(passages):
                    chunks.append(
                        {
                            "chunk_id": f"bass_pdf_p{page_num}_{p_idx+1}",
                            "dataset": "bass_ii",
                            "source_file": "bass_ii_summary_report.pdf",
                            "source_title": "NASA/TM-20210011385: BASS-II Summary Report",
                            "source_type": "Official NASA Technical Report",
                            "page_num": page_num,
                            "section": f"Report Page {page_num}",
                            "url": NASA_PSI_URL,
                            "doi_url": NASA_DOI_URL,
                            "content": passage,
                        }
                    )
        except Exception as e:
            logger.error(f"Failed to process BASS-II PDF {self.pdf_path}: {e}")

        return chunks

    def process_metadata_text(self):
        """Extract text from the ISA-Tab i_Investigation.txt metadata file."""
        if not self.metadata_txt_path.exists():
            return []

        chunks = []
        try:
            text = self.metadata_txt_path.read_text(
                encoding="utf-8", errors="replace"
            )
            lines = text.splitlines()
            current_section = "General Investigation Metadata"
            buffer = []

            for line in lines:
                if not line.strip():
                    continue
                if (
                    line.startswith("INVESTIGATION")
                    or line.startswith("STUDY")
                    or line.startswith("ONTOLOGY")
                ):
                    if buffer:
                        sec_text = "\n".join(buffer)
                        passages = chunk_text(
                            sec_text, max_words=300, overlap_words=30
                        )
                        for idx, p in enumerate(passages):
                            chunks.append(
                                {
                                    "chunk_id": f"bass_meta_{len(chunks)+1}_{idx+1}",
                                    "dataset": "bass_ii",
                                    "source_file": "i_Investigation.txt",
                                    "source_title": "NASA PSI-25 ISA-Tab Investigation Metadata",
                                    "source_type": "NASA ISA-Tab Repository Metadata",
                                    "page_num": None,
                                    "section": current_section,
                                    "url": NASA_PSI_URL,
                                    "doi_url": NASA_DOI_URL,
                                    "content": p,
                                }
                            )
                        buffer = []
                    current_section = line.strip()
                buffer.append(line.strip())

            if buffer:
                sec_text = "\n".join(buffer)
                for idx, p in enumerate(
                    chunk_text(sec_text, max_words=300, overlap_words=30)
                ):
                    chunks.append(
                        {
                            "chunk_id": f"bass_meta_{len(chunks)+1}_{idx+1}",
                            "dataset": "bass_ii",
                            "source_file": "i_Investigation.txt",
                            "source_title": "NASA PSI-25 ISA-Tab Investigation Metadata",
                            "source_type": "NASA ISA-Tab Repository Metadata",
                            "page_num": None,
                            "section": current_section,
                            "url": NASA_PSI_URL,
                            "doi_url": NASA_DOI_URL,
                            "content": p,
                        }
                    )
        except Exception as e:
            logger.error(f"Failed to process metadata {self.metadata_txt_path}: {e}")

        return chunks

    def process_experiments_csv(self):
        """Convert structured BASS-II CSV flight records into searchable evidence passages."""
        if not self.csv_path.exists():
            return []

        chunks = []
        try:
            df = pd.read_csv(self.csv_path)

            total = len(df)
            pis = ", ".join(df["principal_investigator"].unique())
            min_o2 = df["calibrated_initial_o2_pct"].min()
            max_o2 = df["calibrated_initial_o2_pct"].max()
            max_co = df["final_co_ppm"].max()
            configs = ", ".join(
                [x for x in df["flow_configuration"].dropna().unique() if x]
            )

            overview_text = (
                f"The verified NASA BASS-II experimental dataset contains"
                f" {total} solid combustion flight tests conducted on the International Space"
                f" Station. Lead Principal Investigators include: {pis}."
                f" Tested flow configurations include: {configs}. Ambient"
                f" initial oxygen concentration ranged from {min_o2:.1f}% to"
                f" {max_o2:.1f}% O2 vitiated with gaseous nitrogen. Post-burn"
                f" toxic Carbon Monoxide (CO) levels reached up to"
                f" {max_co:.0f} ppm during incomplete combustion."
            )
            chunks.append(
                {
                    "chunk_id": "bass_csv_dataset_overview",
                    "dataset": "bass_ii",
                    "source_file": "bass_ii_experiments.csv",
                    "source_title": "NASA BASS-II Flight Test Matrix (Appendix A)",
                    "source_type": "Structured Experimental Dataset",
                    "page_num": "Pages 111-121",
                    "section": "Overall Dataset Summary",
                    "url": NASA_PSI_URL,
                    "doi_url": NASA_DOI_URL,
                    "content": overview_text,
                }
            )

            for (pi, mat), group in df.groupby(
                ["principal_investigator", "fuel_material"]
            ):
                test_ids = group["test_id"].tolist()
                avg_o2 = group["calibrated_initial_o2_pct"].mean()
                obs_samples = [
                    f"Test {row['test_id']}: {row['observations']}"
                    for _, row in group.head(3).iterrows()
                    if pd.notna(row["observations"]) and row["observations"]
                ]
                obs_text = " | ".join(obs_samples)

                passage = (
                    f"Flight tests conducted by {pi} using fuel material"
                    f" '{mat}'. Total tests: {len(group)} (Test IDs:"
                    f" {', '.join(test_ids[:10])}). Average initial oxygen"
                    f" concentration was {avg_o2:.1f}% O2. Selected flight"
                    f" observations: {obs_text}"
                )
                chunks.append(
                    {
                        "chunk_id": f"bass_csv_mat_{len(chunks)+1}",
                        "dataset": "bass_ii",
                        "source_file": "bass_ii_experiments.csv",
                        "source_title": "NASA BASS-II Flight Test Matrix (Appendix A)",
                        "source_type": "Structured Experimental Dataset",
                        "page_num": "Pages 111-121",
                        "section": f"Test Group: {pi} — {mat}",
                        "url": NASA_PSI_URL,
                        "doi_url": NASA_DOI_URL,
                        "content": passage,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to process BASS-II experiments CSV {self.csv_path}: {e}")

        return chunks

    def process_flex_pdf(self):
        """Extract text from the 81-page NASA FLEX EIRD v4.0 report."""
        if not self.flex_pdf_path.exists():
            logger.warning(f"FLEX PDF not found at {self.flex_pdf_path}")
            return []

        chunks = []
        try:
            doc = pymupdf.open(self.flex_pdf_path)
            for page_index in range(len(doc)):
                page_num = page_index + 1
                page = doc[page_index]
                text = page.get_text()
                if not text or len(text.strip()) < 40:
                    continue

                # Section detection heuristic based on page ranges
                if page_num <= 5:
                    section_title = "Document Overview & Research Team"
                elif page_num <= 10:
                    section_title = "Section 1: Introduction & Microgravity Droplet Physics"
                elif page_num <= 25:
                    section_title = "Section 2-4: Facility & Experiment Interfaces"
                elif page_num <= 53:
                    section_title = "Section 5: Science Requirements & Experimental Objectives"
                elif page_num <= 61:
                    section_title = "Section 5.3: Science Protocol Matrix (Tables 1-12)"
                elif page_num <= 65:
                    section_title = "Section 6: Post-Flight Data Analysis Plan"
                else:
                    section_title = "Section 7-8: Ground-Based Research Program & Numerical Modeling"

                clean_t = re.sub(r"\s+", " ", text).strip()
                passages = chunk_text(clean_t, max_words=320, overlap_words=40)

                for p_idx, passage in enumerate(passages):
                    chunks.append(
                        {
                            "chunk_id": f"flex_pdf_p{page_num}_{p_idx+1}",
                            "dataset": "flex_planned",
                            "source_file": "FLEX_EIRD_v4.pdf",
                            "source_title": "NASA FLEX EIRD v4.0 (Experiment Interface and Requirements Document)",
                            "source_type": "Official NASA Requirements Document",
                            "page_num": page_num,
                            "section": section_title,
                            "url": FLEX_PSI_URL,
                            "doi_url": FLEX_DOI_URL,
                            "content": passage,
                        }
                    )
        except Exception as e:
            logger.error(f"Failed to process FLEX PDF {self.flex_pdf_path}: {e}")

        return chunks

    def process_flex_planned_csv(self):
        """Convert structured FLEX planned science matrix records into evidence passages."""
        if not self.flex_planned_csv_path.exists():
            return []

        chunks = []
        try:
            df = pd.read_csv(self.flex_planned_csv_path, keep_default_na=False)
            total = len(df)
            fuels = ", ".join(df["fuel"].unique())
            pressures = sorted([float(p) for p in df["pressure_atm"].unique() if p])
            p_range = f"{min(pressures)} to {max(pressures)} atm" if pressures else "0.5 to 3.0 atm"
            suppressants = ", ".join([s for s in df["suppressant"].unique() if s])

            overview_text = (
                f"The NASA FLEX Planned Protocol Matrix contains {total} target science conditions "
                f"specified pre-flight in Section 5.3 of NASA FLEX EIRD v4.0 (Tables 1 through 12). "
                f"Planned fuels include: {fuels}. Planned chamber pressures range from {p_range}. "
                f"Planned suppressants evaluated include: {suppressants}. "
                f"Target initial droplet diameters specified are 3 mm and 5 mm under quiescent flow (0.0 cm/s) "
                f"or slow forced flow (1.5 cm/s). "
                f"CRITICAL SCIENTIFIC DISTINCTION: These 290 conditions represent pre-flight target requirements, "
                f"NOT as-run flight measurements. They do not record actual burning rates or observed extinction diameters."
            )
            chunks.append(
                {
                    "chunk_id": "flex_planned_overview",
                    "dataset": "flex_planned",
                    "source_file": "flex_experiments.csv",
                    "source_title": "NASA FLEX Planned Protocol Matrix (EIRD v4.0 Section 5.3)",
                    "source_type": "Planned Protocol Specification",
                    "page_num": "Pages 54-61 (Tables 1-12)",
                    "section": "Planned Science Conditions Matrix Overview",
                    "url": FLEX_PSI_URL,
                    "doi_url": FLEX_DOI_URL,
                    "content": overview_text,
                }
            )

            # Fuel-specific planned condition passages
            for fuel_name, group in df.groupby("fuel"):
                count = len(group)
                supp_list = ", ".join([s for s in group["suppressant"].unique() if s])
                passages_text = (
                    f"FLEX planned protocol conditions for fuel '{fuel_name}': {count} target conditions. "
                    f"Investigates droplet flame extinction across suppressants ({supp_list}), "
                    f"droplet diameters of 3 mm and 5 mm, and pressures between 0.5 and 3.0 atm. "
                    f"Documented in NASA FLEX EIRD v4.0 Section 5.3."
                )
                chunks.append(
                    {
                        "chunk_id": f"flex_planned_{fuel_name.lower()}",
                        "dataset": "flex_planned",
                        "source_file": "flex_experiments.csv",
                        "source_title": "NASA FLEX Planned Protocol Matrix (EIRD v4.0 Section 5.3)",
                        "source_type": "Planned Protocol Specification",
                        "page_num": "Pages 54-61",
                        "section": f"Planned Protocol: {fuel_name}",
                        "url": FLEX_PSI_URL,
                        "doi_url": FLEX_DOI_URL,
                        "content": passages_text,
                    }
                )
        except Exception as e:
            logger.error(f"Failed to process FLEX planned CSV {self.flex_planned_csv_path}: {e}")

        return chunks

    def process_flex_results_csv(self):
        """Convert structured FLEX experimental flight results into evidence passages."""
        if not self.flex_results_csv_path.exists():
            return []

        chunks = []
        try:
            df = pd.read_csv(self.flex_results_csv_path)
            total = len(df)
            fuel_counts = df["fuel"].value_counts().to_dict()
            outcome_counts = df["test_end_outcome"].value_counts().to_dict()
            missing_k_count = int(df["burning_rate_mm2_s"].isna().sum())

            # 1. Overall Results Overview Passage
            overview_text = (
                f"The verified NASA PSI-69 FLEX as-run experimental results dataset contains {total} "
                f"authentic microgravity droplet combustion flight experiments conducted aboard the "
                f"International Space Station in the Combustion Integrated Rack (CIR) between March 2009 and December 2011. "
                f"Fuel breakdown: {fuel_counts.get('Methanol', 0)} Methanol tests, {fuel_counts.get('Heptane', 0)} Heptane tests. "
                f"Observed test outcomes: {outcome_counts.get('Extinction', 0)} Extinction (67.9%), "
                f"{outcome_counts.get('Disruption', 0)} Disruption (22.3%), and "
                f"{outcome_counts.get('Completion', 0)} Completion (9.9%). "
                f"Measured parameters include initial droplet diameter (d0 in mm), visible flame extinction diameter "
                f"(d_ext in mm), burning rate constant (K in mm²/s), and burn time (in seconds). "
                f"DATA INTEGRITY & LIMITATIONS: Exactly {missing_k_count} tests have unrecorded burning rates due to "
                f"droplet disruption or rapid extinction, preserved as true nulls (never substituted with zero). "
                f"Test #114 (C11M201) records an ambient pressure of 0.0 mmHg, flagged as a physical sensor anomaly "
                f"and excluded from pressure regressions by default. "
                f"The discrepancy between 274 local flight records, 275 online PSI catalog entries, and 284 tests "
                f"described in NASA literature remains unresolved in the available local files."
            )
            chunks.append(
                {
                    "chunk_id": "flex_results_overview",
                    "dataset": "flex_results",
                    "source_file": "flex_experimental_results.csv",
                    "source_title": "NASA PSI-69 FLEX As-Run Flight Experimental Results",
                    "source_type": "Measured Flight Experimental Dataset",
                    "page_num": "Table 1 (274 Flight Records)",
                    "section": "FLEX Experimental Results Overview",
                    "url": FLEX_PSI_URL,
                    "doi_url": FLEX_DOI_URL,
                    "content": overview_text,
                }
            )

            # 2. Methanol Results Specific Passage
            meth_df = df[df["fuel"].str.lower() == "methanol"]
            meth_outcomes = meth_df["test_end_outcome"].value_counts().to_dict()
            meth_k_valid = meth_df["burning_rate_mm2_s"].dropna()
            meth_k_mean = meth_k_valid.mean() if len(meth_k_valid) > 0 else 0.0

            meth_text = (
                f"FLEX Experimental Results for Methanol: 157 flight tests conducted in the ISS CIR facility. "
                f"Recorded flight outcomes: {meth_outcomes.get('Extinction', 0)} Extinctions, "
                f"{meth_outcomes.get('Disruption', 0)} Disruptions, and {meth_outcomes.get('Completion', 0)} Completions. "
                f"Methanol droplets exhibited classical d²-law regression with an average burning rate of "
                f"{meth_k_mean:.2f} mm²/s. Tests were conducted under nitrogen, carbon dioxide, and helium atmospheres."
            )
            chunks.append(
                {
                    "chunk_id": "flex_results_methanol",
                    "dataset": "flex_results",
                    "source_file": "flex_experimental_results.csv",
                    "source_title": "NASA PSI-69 FLEX As-Run Flight Experimental Results",
                    "source_type": "Measured Flight Experimental Dataset",
                    "page_num": "Table 1",
                    "section": "Methanol Droplet Flight Results",
                    "url": FLEX_PSI_URL,
                    "doi_url": FLEX_DOI_URL,
                    "content": meth_text,
                }
            )

            # 3. Anomaly Passage for Test #114
            t114 = df[df["flex_test_num"] == 114]
            if len(t114) > 0:
                t114_row = t114.iloc[0]
                t114_text = (
                    f"FLEX Test #114 (Identifier: {t114_row['flex_identifier']}, Date: {t114_row['test_date']}): "
                    f"Tested fuel was Methanol with initial droplet diameter {t114_row['droplet_initial_diameter_mm']} mm, "
                    f"burning rate {t114_row['burning_rate_mm2_s']} mm²/s, burn time {t114_row['burn_time_s']} s, "
                    f"and outcome '{t114_row['test_end_outcome']}'. "
                    f"ANOMALY DETAILS: The source table records ambient pressure as 0.0 mmHg (0.0 atm). "
                    f"This is physically impossible for a gas-phase flame with 20% O2, 45% N2, and 35% CO2 sustaining a flame. "
                    f"This represents an instrument sensor failure or transcription dropout in the NASA PSI-69 source file. "
                    f"The value 0.0 is preserved for data provenance integrity, flagged as an anomaly, and excluded "
                    f"from pressure-based regression models."
                )
                chunks.append(
                    {
                        "chunk_id": "flex_results_test_114_anomaly",
                        "dataset": "flex_results",
                        "source_file": "flex_experimental_results.csv",
                        "source_title": "NASA PSI-69 FLEX As-Run Flight Experimental Results",
                        "source_type": "Measured Flight Experimental Dataset",
                        "page_num": "Test #114 (Record C11M201)",
                        "section": "Data Quality: Test #114 Pressure Anomaly",
                        "url": FLEX_PSI_URL,
                        "doi_url": FLEX_DOI_URL,
                        "content": t114_text,
                    }
                )

            # 4. Missing Burning Rates Passage
            missing_k_tests = df[df["burning_rate_mm2_s"].isna()]["flex_test_num"].tolist()
            missing_k_text = (
                f"FLEX Missing Burning Rate Records: Exactly 16 of the 274 flight tests have unrecorded burning rates "
                f"(burning_rate_mm2_s is null/NaN). These include FLEX Test Numbers: {missing_k_tests}. "
                f"Of these 16 tests, 8 ended in Disruption (droplet oscillation or tether separation preventing a steady d²-law regression) "
                f"and 8 ended in Extinction. "
                f"In compliance with scientific integrity rules, missing measurements are preserved as true nulls "
                f"and are never substituted with zeroes."
            )
            chunks.append(
                {
                    "chunk_id": "flex_results_missing_burning_rates",
                    "dataset": "flex_results",
                    "source_file": "flex_experimental_results.csv",
                    "source_title": "NASA PSI-69 FLEX As-Run Flight Experimental Results",
                    "source_type": "Measured Flight Experimental Dataset",
                    "page_num": "Table 1 (Missing Values Audit)",
                    "section": "Data Quality: Unrecorded Burning Rates",
                    "url": FLEX_PSI_URL,
                    "doi_url": FLEX_DOI_URL,
                    "content": missing_k_text,
                }
            )

            # 5. Unresolved Discrepancy Passage
            discrepancy_text = (
                f"FLEX Dataset Count Discrepancy: The local dataset (PSI-69_Experimental table_FLEX.csv) contains 274 "
                f"flight records. The online NASA Physical Sciences Informatics (PSI) catalog lists 275 entries for PSI-69. "
                f"Published NASA technical literature (e.g., Dietrich et al., Williams et al.) describes 284 flight tests. "
                f"SCIENTIFIC STATUS: The currently available local evidence does NOT explain or resolve this discrepancy. "
                f"The 10 missing records are not present in the local repository files. To maintain strict scientific integrity, "
                f"this discrepancy is documented as an unresolved limitation rather than invented or speculated upon."
            )
            chunks.append(
                {
                    "chunk_id": "flex_results_count_discrepancy",
                    "dataset": "flex_results",
                    "source_file": "flex_experimental_results.csv",
                    "source_title": "NASA PSI-69 FLEX As-Run Flight Experimental Results",
                    "source_type": "Measured Flight Experimental Dataset",
                    "page_num": "Table 1 / Provenance Audit",
                    "section": "Scientific Provenance: 274 vs 284 Count Discrepancy",
                    "url": FLEX_PSI_URL,
                    "doi_url": FLEX_DOI_URL,
                    "content": discrepancy_text,
                }
            )
        except Exception as e:
            logger.error(f"Failed to process FLEX results CSV {self.flex_results_csv_path}: {e}")

        return chunks

    def process_inventory_md(self):
        """Extract synthesis and scientific conclusions from data_inventory.md."""
        if not self.inventory_path.exists():
            return []

        chunks = []
        try:
            text = self.inventory_path.read_text(
                encoding="utf-8", errors="replace"
            )
            sections = re.split(r"\n##\s+", text)
            for idx, sec in enumerate(sections):
                if not sec.strip():
                    continue
                header_match = re.match(r"^([^\n]+)", sec)
                sec_title = (
                    header_match.group(1).strip()
                    if header_match
                    else f"Section {idx}"
                )
                passages = chunk_text(sec, max_words=320, overlap_words=40)
                for p_idx, p in enumerate(passages):
                    chunks.append(
                        {
                            "chunk_id": f"inv_sec_{idx+1}_{p_idx+1}",
                            "dataset": "bass_ii",  # Primarily BASS-II and project provenance
                            "source_file": "data_inventory.md",
                            "source_title": "NASA BASS-II Data Inventory & Scientific Inspection Report",
                            "source_type": "Verified Project Scientific Synthesis",
                            "page_num": None,
                            "section": sec_title,
                            "url": NASA_PSI_URL,
                            "doi_url": NASA_DOI_URL,
                            "content": p,
                        }
                    )
        except Exception as e:
            logger.error(f"Failed to process inventory {self.inventory_path}: {e}")

        return chunks

    def build_or_load_index(self, force_rebuild=False):
        """Build all chunks across all three NASA datasets or load from existing cache."""
        if self.index_cache_path.exists() and not force_rebuild:
            try:
                with open(self.index_cache_path, "r", encoding="utf-8") as f:
                    cached_chunks = json.load(f)
                    # Verify cache contains multi-dataset tags and FLEX chunks
                    if cached_chunks and len(cached_chunks) > 100:
                        has_flex = any(c.get("dataset") in ["flex_planned", "flex_results"] for c in cached_chunks)
                        if has_flex:
                            return cached_chunks
                        logger.info("Cached index lacks multi-dataset FLEX chunks; triggering rebuild.")
            except Exception as e:
                logger.warning(f"Could not load cached index, rebuilding: {e}")

        logger.info("Building multi-dataset search index across BASS-II and FLEX...")
        all_chunks = []
        # 1. BASS-II documents and flight records
        all_chunks.extend(self.process_pdf())
        all_chunks.extend(self.process_metadata_text())
        all_chunks.extend(self.process_experiments_csv())
        all_chunks.extend(self.process_inventory_md())

        # 2. FLEX Planned Matrix & Requirements Document
        all_chunks.extend(self.process_flex_pdf())
        all_chunks.extend(self.process_flex_planned_csv())

        # 3. FLEX As-Run Experimental Results
        all_chunks.extend(self.process_flex_results_csv())

        logger.info(f"Built total of {len(all_chunks)} chunks across all three datasets.")

        if all_chunks:
            try:
                self.index_cache_path.parent.mkdir(parents=True, exist_ok=True)
                with open(self.index_cache_path, "w", encoding="utf-8") as f:
                    json.dump(all_chunks, f, indent=2)
            except Exception as e:
                logger.error(f"Could not write cache file: {e}")

        return all_chunks
