"""
Pydantic schemas for the Flame in Freefall REST API.
Defines strict data contracts for experiments, telemetry analytics, and RAG assistant queries.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# Health & Status Schemas
# -----------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = Field(..., description="System operational status ('ok')")
    service: str = Field("Flame in Freefall API", description="Service name")
    active_model: Optional[str] = Field(None, description="Active Gemini model or fallback")
    ai_mode: str = Field(..., description="'live_llm' or 'offline_synthesis'")
    total_experiments: int = Field(..., description="Total verified NASA flight experiments")
    indexed_passages: int = Field(..., description="Total indexed document passages")
    platform: str = Field("ISS Microgravity Science Glovebox", description="Flight hardware platform")
    timestamp: str = Field(..., description="Server ISO timestamp")


# -----------------------------------------------------------------------------
# Dataset Summary Schemas
# -----------------------------------------------------------------------------
class DatasetSummaryResponse(BaseModel):
    total_records: int
    total_columns: int
    unique_pis: int
    unique_materials: int
    min_o2: float
    max_o2: float
    avg_o2: float
    max_co_ppm: Optional[float]
    hardware: str
    platform: str
    investigation: str
    technical_report: str
    material_categories: List[str]
    flow_configurations: List[str]
    pis_list: List[str]


# -----------------------------------------------------------------------------
# Experiment Record Schemas
# -----------------------------------------------------------------------------
class ExperimentRecord(BaseModel):
    test_id: str
    as_run_num: Optional[int] = None
    principal_investigator: Optional[str] = None
    date_gmt: Optional[str] = None
    time_range: Optional[str] = None
    sample_id: Optional[str] = None
    fuel_material: Optional[str] = None
    material_category: Optional[str] = None
    flow_configuration: Optional[str] = None
    flow_restrictor: Optional[int] = None
    fan_setting: Optional[str] = None
    air_velocity_cms: Optional[str] = None
    air_velocity_numeric: Optional[float] = None
    calibrated_initial_o2_pct: Optional[float] = None
    calibrated_final_o2_pct: Optional[float] = None
    initial_o2_pct: Optional[float] = None
    final_o2_pct: Optional[float] = None
    delta_o2_pct: Optional[float] = None
    initial_co2_pct: Optional[float] = None
    final_co2_pct: Optional[float] = None
    delta_co2_pct: Optional[float] = None
    initial_co_ppm: Optional[float] = None
    final_co_ppm: Optional[float] = None
    delta_co_ppm: Optional[float] = None
    observations: Optional[str] = None


class ExperimentListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    experiments: List[ExperimentRecord]


# -----------------------------------------------------------------------------
# Telemetry Analytics Schemas
# -----------------------------------------------------------------------------
class ExtinctionBoundaryPoint(BaseModel):
    test_id: str
    calibrated_initial_o2_pct: Optional[float]
    air_velocity_cms: Optional[str]
    air_velocity_numeric: Optional[float]
    fuel_material: Optional[str]
    material_category: Optional[str]
    flow_configuration: Optional[str]
    flame_behavior: str = Field(
        ...,
        description="'Extinguished / Quenched', 'Sustained Flame', or 'Observation Recorded'",
    )
    observations: Optional[str]


class ExtinctionBoundaryResponse(BaseModel):
    total_points: int
    summary: Dict[str, Any]
    points: List[ExtinctionBoundaryPoint]


class GasCorrelationRecord(BaseModel):
    test_id: str
    material_category: str
    flow_configuration: str
    calibrated_initial_o2_pct: Optional[float]
    delta_o2_pct: Optional[float]
    final_co2_pct: Optional[float]
    delta_co2_pct: Optional[float]
    final_co_ppm: Optional[float]
    delta_co_ppm: Optional[float]
    air_velocity_numeric: Optional[float]


class GasCorrelationsResponse(BaseModel):
    total_records: int
    correlations: Dict[str, Optional[float]]
    records: List[GasCorrelationRecord]


# -----------------------------------------------------------------------------
# AI Assistant Schemas
# -----------------------------------------------------------------------------
class AssistantQueryRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000, description="Scientific inquiry")
    dataset: Optional[str] = Field("all", description="'all', 'bass_ii', 'flex_planned', or 'flex_results'")


class CitationSource(BaseModel):
    chunk_id: Optional[str] = None
    source_file: str
    source_title: str
    source_type: str
    dataset: Optional[str] = None
    page_num: Optional[Union[int, str]] = None
    section: Optional[str] = None
    url: str
    doi_url: str
    content: str
    score: Optional[float] = None
    record_id: Optional[str] = None


class AssistantQueryResponse(BaseModel):
    answer: str
    mode: str = Field(
        ...,
        description="'live_llm', 'local_evidence_synthesis', 'local_evidence_synthesis_fallback', 'dataset_filter_guidance', or 'no_evidence'",
    )
    model_name: Optional[str] = None
    dataset_filter: Optional[str] = "all"
    has_evidence: bool
    disclaimer: str
    fallback_reason: Optional[str] = None
    citations: List[CitationSource]


# -----------------------------------------------------------------------------
# Data Inventory Schemas
# -----------------------------------------------------------------------------
class InventoryItem(BaseModel):
    name: str
    path: str
    size_bytes: int
    category: str
    verified: bool
    description: str


class InventoryResponse(BaseModel):
    indexed_passages: int
    total_experiments: int
    technical_report: str
    doi: str
    psi_repository_url: str
    files: List[InventoryItem]


# -----------------------------------------------------------------------------
# Phase 7: Evidence-to-Insight Engine Schemas
# -----------------------------------------------------------------------------
class ExperimentMatchCriteria(BaseModel):
    query: Optional[str] = Field(None, description="Research question or keywords (e.g., 'PMMA extinction at low flow')")
    material_category: Optional[str] = Field(None, description="'PMMA', 'Cotton', 'Nomex', or None")
    flow_configuration: Optional[str] = Field(None, description="'Opposed', 'Concurrent', or None")
    min_initial_o2: Optional[float] = Field(None, description="Minimum initial calibrated O2 %")
    max_initial_o2: Optional[float] = Field(None, description="Maximum initial calibrated O2 %")
    min_air_velocity: Optional[float] = Field(None, description="Minimum airflow velocity cm/s")
    max_air_velocity: Optional[float] = Field(None, description="Maximum airflow velocity cm/s")
    flame_behavior: Optional[str] = Field(None, description="'Extinguished / Quenched', 'Sustained Flame', or 'Observation Recorded'")
    limit: int = Field(15, ge=1, le=50, description="Max results to return")


class MatchedExperimentItem(BaseModel):
    test_id: str
    fuel_material: str
    material_category: str
    flow_configuration: str
    air_velocity_cms: Optional[str] = None
    air_velocity_numeric: Optional[float] = None
    calibrated_initial_o2_pct: Optional[float] = None
    calibrated_final_o2_pct: Optional[float] = None
    final_co_ppm: Optional[float] = None
    delta_o2_pct: Optional[float] = None
    delta_co2_pct: Optional[float] = None
    flame_behavior: str
    observations: Optional[str] = None
    total_match_score: float = Field(..., description="Explainable matching relevance (0.0 to 1.0). NOT a fire-risk probability.")
    is_exact_match: bool
    match_reasons: List[str]
    missing_fields: List[str]
    source_reference: str
    report_page_hint: Optional[str] = None


class ExperimentMatchResponse(BaseModel):
    total_found: int
    returned_count: int
    query_echo: Optional[str] = None
    scoring_criteria_explanation: str
    disclaimer: str
    results: List[MatchedExperimentItem]


class ExperimentComparisonRequest(BaseModel):
    test_ids: List[str] = Field(..., min_length=2, max_length=5, description="List of 2 to 5 test IDs to compare")
    include_synthesis: bool = True
    investigation: Optional[str] = Field("bass_ii", description="'bass_ii', 'flex_results', or 'cross_investigation'")


class ComparedExperimentData(BaseModel):
    test_id: str
    fuel_material: Optional[str] = None
    material_category: Optional[str] = None
    flow_configuration: Optional[str] = None
    flow_restrictor: Optional[str] = None
    air_velocity_cms: Optional[str] = None
    air_velocity_numeric: Optional[float] = None
    calibrated_initial_o2_pct: Optional[float] = None
    calibrated_final_o2_pct: Optional[float] = None
    initial_co2_pct: Optional[float] = None
    final_co2_pct: Optional[float] = None
    delta_co2_pct: Optional[float] = None
    initial_co_ppm: Optional[float] = None
    final_co_ppm: Optional[float] = None
    delta_co_ppm: Optional[float] = None
    delta_o2_pct: Optional[float] = None
    flame_behavior: Optional[str] = None
    observations: Optional[str] = None
    # Droplet attributes for FLEX results
    investigation: Optional[str] = "BASS-II"
    flex_identifier: Optional[str] = None
    fuel: Optional[str] = None
    ambient_pressure_mmhg: Optional[float] = None
    ambient_pressure_atm: Optional[float] = None
    droplet_initial_diameter_mm: Optional[float] = None
    visible_flame_extinction_diameter_mm: Optional[float] = None
    burning_rate_mm2_s: Optional[float] = None
    burn_time_s: Optional[float] = None
    test_end_outcome: Optional[str] = None
    is_anomalous: Optional[bool] = False


class ComparisonWarning(BaseModel):
    category: str = Field(..., description="'Material Discrepancy', 'Aerodynamic Mismatch', 'Missing Sensor', 'Hardware Note'")
    severity: str = Field(..., description="'High', 'Moderate', 'Informational'")
    message: str


class EvidenceToInsightSection(BaseModel):
    observed_evidence: List[str]
    calculated_results: List[str]
    scientific_interpretation: List[str]
    limitations_and_uncertainties: List[str]


class ExperimentComparisonResponse(BaseModel):
    test_ids: List[str]
    experiments: List[ComparedExperimentData]
    incompatibility_warnings: List[ComparisonWarning]
    evidence_to_insight: EvidenceToInsightSection
    citations: List[CitationSource]
    synthesis_mode: str = Field(..., description="'live_llm', 'offline_evidence_synthesis', or 'data_only'")
    disclaimer: str


# -----------------------------------------------------------------------------
# FLEX Protocol Matrix Schemas (NASA PSI-69)
# -----------------------------------------------------------------------------
class FlexConditionRecord(BaseModel):
    test_no: int
    investigation: str
    fuel: str
    diluent: str
    suppressant: str
    fiber_support: str
    flow_velocity_cms: float
    initial_droplet_diameters_mm: str
    pressure_atm: float
    oxygen_mole_fraction: float
    suppressant_mole_fraction: float
    nitrogen_mole_fraction: float
    source_document: str
    source_section: str
    source_page: int
    record_type: str


class FlexConditionListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    conditions: List[FlexConditionRecord]


class FlexSummaryResponse(BaseModel):
    total_planned_conditions: int
    unique_fuels: List[str]
    unique_suppressants: List[str]
    unique_pressures: List[float]
    min_pressure_atm: float
    max_pressure_atm: float
    min_oxygen_fraction: float
    max_oxygen_fraction: float
    fiber_supports: Dict[str, int]
    flow_velocities: Dict[str, int]
    fuel_counts: Dict[str, int]
    suppressant_counts: Dict[str, int]
    pressure_counts: Dict[str, int]
    source_document: str
    source_section: str
    source_pages: str
    disclaimer: str
    nitrogen_derived_note: str


class FlexAnalyticsResponse(BaseModel):
    pressure_distribution: List[Dict[str, Any]]
    suppressant_distribution: List[Dict[str, Any]]
    oxygen_distribution: List[Dict[str, Any]]
    fuel_breakdown: List[Dict[str, Any]]
    matrix_scatter_points: List[Dict[str, Any]]


# -----------------------------------------------------------------------------
# Phase 11: NASA PSI-69 FLEX Experimental Flight Results Schemas
# -----------------------------------------------------------------------------
class FlexResultRecord(BaseModel):
    flex_test_num: int
    flex_identifier: str
    test_date: str
    test_gmt: Optional[str] = None
    fuel: str
    ambient_pressure_mmhg: float
    ambient_pressure_atm: float
    initial_o2_mole_fraction: float
    initial_n2_mole_fraction: float
    initial_co2_mole_fraction: float
    initial_he_mole_fraction: float
    droplet_initial_diameter_mm: Optional[float] = None
    visible_flame_extinction_diameter_mm: Optional[float] = None
    burning_rate_mm2_s: Optional[float] = None
    burn_time_s: Optional[float] = None
    burn_time_raw: Optional[str] = None
    test_end_outcome: str
    investigation: str = "FLEX (Droplet Combustion)"
    source_file: str = "NASA PSI-69_Experimental table_FLEX.csv"
    record_type: str = "As-Run Flight Experimental Results"
    has_pressure_warning: bool = False
    pressure_warning_detail: Optional[str] = None


class FlexResultListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    records: List[FlexResultRecord]


class FlexResultSummaryResponse(BaseModel):
    total_flight_records: int
    fuel_counts: Dict[str, int]
    outcome_counts: Dict[str, int]
    min_pressure_mmhg: float
    max_pressure_mmhg: float
    min_burning_rate_mm2_s: Optional[float] = None
    max_burning_rate_mm2_s: Optional[float] = None
    mean_burning_rate_mm2_s: Optional[float] = None
    min_burn_time_s: Optional[float] = None
    max_burn_time_s: Optional[float] = None
    min_droplet_diameter_mm: Optional[float] = None
    max_droplet_diameter_mm: Optional[float] = None
    missing_field_counts: Dict[str, int]
    test_114_anomaly: Dict[str, Any]
    unresolved_counts_notice: Dict[str, Any]
    source_file: str
    disclaimer: str


class FlexResultAnalyticsResponse(BaseModel):
    outcome_distribution: List[Dict[str, Any]]
    fuel_breakdown: List[Dict[str, Any]]
    outcome_by_fuel: List[Dict[str, Any]]
    pressure_vs_burning_rate: Dict[str, Any]
    diameter_vs_burn_time: List[Dict[str, Any]]
    burning_rate_distribution: List[Dict[str, Any]]



