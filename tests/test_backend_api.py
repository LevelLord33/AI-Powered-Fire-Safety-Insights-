"""
Comprehensive test suite for the Flame in Freefall FastAPI backend.
Validates all 8 REST API endpoints, schemas, filtering, telemetry analytics, and RAG assistant behavior.
"""

import sys
from pathlib import Path
from starlette.testclient import TestClient

# Ensure workspace root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify /api/health returns 200, valid status, total counts, and platform."""
    response = client.get("/api/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "Flame in Freefall API"
    assert data["total_experiments"] == 126
    assert data["indexed_passages"] >= 318
    assert "International Space Station" in data["platform"] or "ISS" in data["platform"]
    assert "timestamp" in data
    print("✓ Health endpoint passed.")


def test_summary_endpoint():
    """Verify /api/experiments/summary returns real NASA ranges and distinct categories."""
    response = client.get("/api/experiments/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 126
    assert data["total_columns"] >= 20
    assert data["unique_materials"] >= 6
    assert 13.0 <= data["min_o2"] <= 15.0  # Actual min is 13.6% O2
    assert 21.0 <= data["max_o2"] <= 23.0  # Actual max is 22.2% O2
    assert len(data["material_categories"]) >= 4
    assert "PMMA Rod" in data["material_categories"]
    assert len(data["flow_configurations"]) >= 2
    assert "Opposed" in data["flow_configurations"]
    print("✓ Summary endpoint passed.")


def test_experiments_listing_and_pagination():
    """Verify /api/experiments default listing, total count, and pagination."""
    response = client.get("/api/experiments?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 126
    assert data["page"] == 1
    assert data["limit"] == 10
    assert data["total_pages"] == 13
    assert len(data["experiments"]) == 10

    first = data["experiments"][0]
    assert "test_id" in first
    assert "fuel_material" in first
    assert "calibrated_initial_o2_pct" in first
    print("✓ Experiments listing and pagination passed.")


def test_experiments_filtering():
    """Verify filtering by material, oxygen bounds, and text search."""
    # Filter 1: Material Category
    r_mat = client.get("/api/experiments?material=PMMA+Rod")
    assert r_mat.status_code == 200
    d_mat = r_mat.json()
    assert d_mat["total"] > 0
    assert all(e["material_category"] == "PMMA Rod" for e in d_mat["experiments"])

    # Filter 2: Oxygen Bounds (18.0 - 21.0)
    r_o2 = client.get("/api/experiments?min_o2=18.0&max_o2=21.0")
    assert r_o2.status_code == 200
    d_o2 = r_o2.json()
    assert d_o2["total"] > 0
    assert all(18.0 <= e["calibrated_initial_o2_pct"] <= 21.0 for e in d_o2["experiments"])

    # Filter 3: Search Query matching specific sample or test
    r_search = client.get("/api/experiments?search=sibal")
    assert r_search.status_code == 200
    d_search = r_search.json()
    assert d_search["total"] > 0
    assert any("sibal" in str(e["fuel_material"]).lower() for e in d_search["experiments"])
    print("✓ Experiments filtering passed.")


def test_single_experiment_lookup():
    """Verify /api/experiments/{test_id} returns accurate record or 404."""
    # Valid lookup (Test T1 exists in records)
    r_valid = client.get("/api/experiments/T1")
    assert r_valid.status_code == 200
    data = r_valid.json()
    assert data["test_id"] == "T1"
    assert data["as_run_num"] == 1
    assert data["principal_investigator"] == "James S. Tien"

    # Invalid lookup
    r_invalid = client.get("/api/experiments/NON_EXISTENT_FLIGHT_TEST_999")
    assert r_invalid.status_code == 404
    assert "not found" in r_invalid.json()["detail"].lower()
    print("✓ Single experiment lookup passed.")


def test_extinction_boundary_analytics():
    """Verify /api/analytics/extinction-boundary returns 126 categorized points."""
    response = client.get("/api/analytics/extinction-boundary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_points"] == 126
    assert len(data["points"]) == 126
    summary = data["summary"]
    assert summary["quenched_count"] > 0
    assert summary["sustained_count"] > 0
    assert (summary["quenched_count"] + summary["sustained_count"] + summary["other_observations_count"]) == 126
    print("✓ Extinction boundary analytics passed.")


def test_gas_correlations_analytics():
    """Verify /api/analytics/gas-correlations returns stoichiometry data and Pearson correlations."""
    response = client.get("/api/analytics/gas-correlations")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 126
    assert len(data["records"]) == 126
    corrs = data["correlations"]
    assert "delta_o2_vs_delta_co2" in corrs
    # The stoichiometric correlation between O2 drop and CO2 rise is known to exceed 0.95
    assert corrs["delta_o2_vs_delta_co2"] is not None
    assert corrs["delta_o2_vs_delta_co2"] > 0.90
    print("✓ Gas correlations analytics passed.")


def test_assistant_query_supported():
    """Verify /api/assistant/query answers a BASS-II inquiry with citations."""
    response = client.post(
        "/api/assistant/query",
        json={"question": "What was the purpose of the BASS-II investigation and what fuels were tested?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["has_evidence"] is True
    assert len(data["citations"]) > 0
    assert len(data["answer"]) > 50
    assert data["mode"] in ["live_llm", "local_evidence_synthesis", "local_evidence_synthesis_fallback"]
    assert "Spacecraft Safety" in data["disclaimer"] or "disclaimer" in data["disclaimer"].lower()

    # Verify citation attributes
    first_cit = data["citations"][0]
    assert "source_file" in first_cit
    assert "url" in first_cit
    print("✓ Assistant query (supported) passed.")


def test_assistant_query_unsupported_refusal():
    """Verify /api/assistant/query refuses out-of-domain queries without hallucinating."""
    response = client.post(
        "/api/assistant/query",
        json={"question": "What is the breeding cycle of emperor penguins in Antarctica?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["has_evidence"] is False
    assert data["mode"] == "no_evidence"
    assert "Insufficient Evidence" in data["answer"]
    assert len(data["citations"]) == 0
    print("✓ Assistant query (unsupported refusal) passed.")


def test_inventory_endpoint():
    """Verify /api/inventory returns verified file manifests and 318 passages count."""
    response = client.get("/api/inventory")
    assert response.status_code == 200
    data = response.json()
    assert data["indexed_passages"] >= 318
    assert data["total_experiments"] == 126
    assert "10.60555" in data["doi"]
    assert len(data["files"]) >= 3
    assert all(f["verified"] is True for f in data["files"])
    print("✓ Inventory endpoint passed.")


def test_insights_experiment_matching():
    """Verify /api/insights/match returns ranked results with transparent match reasons and explainable score."""
    response = client.post(
        "/api/insights/match",
        json={"query": "PMMA extinction at low flow", "limit": 5},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_found"] > 0
    assert len(data["results"]) <= 5
    first = data["results"][0]
    assert "test_id" in first
    assert "total_match_score" in first
    assert 0.0 <= first["total_match_score"] <= 1.0
    assert "match_reasons" in first
    assert len(first["match_reasons"]) > 0
    assert "is_exact_match" in first
    assert "missing_fields" in first
    assert "source_reference" in first
    assert "NOT a fire-risk probability" in data["disclaimer"]
    print("✓ Insights experiment matching passed.")


def test_insights_experiment_comparison_compatible():
    """Verify /api/insights/compare performs side-by-side comparison and 4-tier Evidence-to-Insight."""
    response = client.post(
        "/api/insights/compare",
        json={"test_ids": ["T1", "T2"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["experiments"]) == 2
    assert "evidence_to_insight" in data
    e2i = data["evidence_to_insight"]
    assert len(e2i["observed_evidence"]) == 2
    assert len(e2i["calculated_results"]) >= 1
    assert len(e2i["scientific_interpretation"]) >= 1
    assert len(e2i["limitations_and_uncertainties"]) >= 1
    assert len(data["citations"]) >= 1
    print("✓ Insights experiment comparison (compatible) passed.")


def test_insights_experiment_comparison_incompatible_warning():
    """Verify /api/insights/compare flags physical incompatibilities (cross-material, differing flow)."""
    response = client.post(
        "/api/insights/compare",
        json={"test_ids": ["T1", "P1"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["incompatibility_warnings"]) >= 1
    categories = [w["category"] for w in data["incompatibility_warnings"]]
    assert "Material Discrepancy" in categories
    print("✓ Insights experiment comparison (incompatible warning) passed.")


def test_insights_experiment_comparison_insufficient_records():
    """Verify /api/insights/compare validates input length (422) and non-existent test IDs (400)."""
    # 1. Fewer than 2 IDs -> Pydantic validation error (422)
    response_len = client.post(
        "/api/insights/compare",
        json={"test_ids": ["ONLY_ONE_ID"]},
    )
    assert response_len.status_code == 422

    # 2. 2 IDs provided but non-existent in NASA dataset -> 400 Bad Request
    response_missing = client.post(
        "/api/insights/compare",
        json={"test_ids": ["FAKE_ID_1", "FAKE_ID_2"]},
    )
    assert response_missing.status_code == 400
    print("✓ Insights experiment comparison (insufficient/invalid records refusal) passed.")


def test_flex_protocol_endpoints():
    """Verify FLEX protocol endpoints: summary, conditions filtering/pagination, and analytics."""
    # 1. Summary
    r_sum = client.get("/api/flex/summary")
    assert r_sum.status_code == 200
    d_sum = r_sum.json()
    assert d_sum["total_planned_conditions"] == 290
    assert len(d_sum["unique_fuels"]) == 2
    assert "Heptane (C7H16)" in d_sum["unique_fuels"]
    assert "Methanol (CH3OH)" in d_sum["unique_fuels"]
    assert len(d_sum["unique_suppressants"]) == 4
    assert d_sum["min_pressure_atm"] == 0.5
    assert d_sum["max_pressure_atm"] == 3.0
    assert d_sum["min_oxygen_fraction"] == 0.1
    assert d_sum["max_oxygen_fraction"] == 0.4

    # 2. Conditions list & filters
    r_cond = client.get("/api/flex/conditions?page=1&limit=25")
    assert r_cond.status_code == 200
    d_cond = r_cond.json()
    assert d_cond["total"] == 290
    assert len(d_cond["conditions"]) == 25

    # Filter fuel
    r_fuel = client.get("/api/flex/conditions?fuel=Methanol")
    assert r_fuel.status_code == 200
    assert r_fuel.json()["total"] == 145

    # Filter suppressant
    r_sup = client.get("/api/flex/conditions?suppressant=CO2")
    assert r_sup.status_code == 200
    assert r_sup.json()["total"] == 128

    # 3. Analytics
    r_ana = client.get("/api/flex/analytics")
    assert r_ana.status_code == 200
    d_ana = r_ana.json()
    assert len(d_ana["matrix_scatter_points"]) == 290
    assert len(d_ana["fuel_breakdown"]) == 2
    assert len(d_ana["pressure_distribution"]) == 8
    print("[PASS] FLEX protocol matrix endpoints passed.")


def test_flex_results_endpoints():
    """Verify Phase 11 NASA PSI-69 FLEX experimental flight results endpoints."""
    # 1. Summary
    r_sum = client.get("/api/flex-results/summary")
    assert r_sum.status_code == 200
    d_sum = r_sum.json()
    assert d_sum["total_flight_records"] == 274
    assert d_sum["fuel_counts"]["Methanol"] == 157
    assert d_sum["fuel_counts"]["Heptane"] == 117
    assert d_sum["outcome_counts"]["Extinction"] == 186
    assert d_sum["outcome_counts"]["Disruption"] == 61
    assert d_sum["outcome_counts"]["Completion"] == 27
    assert d_sum["test_114_anomaly"]["flex_test_num"] == 114
    assert d_sum["test_114_anomaly"]["ambient_pressure_mmhg"] == 0.0

    # 2. Records Listing & Filtering
    r_rec = client.get("/api/flex-results/records?page=1&limit=25")
    assert r_rec.status_code == 200
    d_rec = r_rec.json()
    assert d_rec["total"] == 274
    assert len(d_rec["records"]) == 25

    # Fuel filter
    r_fuel = client.get("/api/flex-results/records?fuel=Heptane")
    assert r_fuel.status_code == 200
    assert r_fuel.json()["total"] == 117

    # Outcome filter
    r_out = client.get("/api/flex-results/records?outcome=Disruption")
    assert r_out.status_code == 200
    assert r_out.json()["total"] == 61

    # Search filter
    r_search = client.get("/api/flex-results/records?search=193F001")
    assert r_search.status_code == 200
    assert r_search.json()["total"] == 2  # Repeated identifier in test 70 & 73

    # 3. Single Record & Test #114 Warning
    r_114 = client.get("/api/flex-results/records/114")
    assert r_114.status_code == 200
    d_114 = r_114.json()
    assert d_114["flex_test_num"] == 114
    assert d_114["ambient_pressure_mmhg"] == 0.0
    assert d_114["has_pressure_warning"] is True
    assert "0.0 mmHg" in d_114["pressure_warning_detail"]

    # 4. Analytics & Regression Exclusion
    r_ana = client.get("/api/flex-results/analytics")
    assert r_ana.status_code == 200
    d_ana = r_ana.json()
    assert len(d_ana["outcome_distribution"]) == 3
    assert len(d_ana["fuel_breakdown"]) == 2
    p_data = d_ana["pressure_vs_burning_rate"]
    assert p_data["excluded_due_to_zero_pressure"] == 1
    assert p_data["total_valid"] == 257
    assert p_data["total_excluded"] == 17
    assert p_data["regression"] is not None
    print("[PASS] FLEX experimental results endpoints passed.")


def test_assistant_multi_dataset_filtering():
    """Verify assistant query filters retrieval correctly by selected dataset."""
    # 1. BASS-II query with bass_ii filter
    r_bass = client.post(
        "/api/assistant/query",
        json={"question": "What fuels were tested in BASS-II?", "dataset": "bass_ii"},
    )
    assert r_bass.status_code == 200
    d_bass = r_bass.json()
    assert d_bass["dataset_filter"] == "bass_ii"
    assert d_bass["has_evidence"] is True
    assert all(c["dataset"] == "bass_ii" for c in d_bass["citations"])

    # 2. FLEX Planned query with flex_planned filter
    r_plan = client.post(
        "/api/assistant/query",
        json={"question": "What suppressants are planned in FLEX protocol?", "dataset": "flex_planned"},
    )
    assert r_plan.status_code == 200
    d_plan = r_plan.json()
    assert d_plan["dataset_filter"] == "flex_planned"
    assert d_plan["has_evidence"] is True
    assert all(c["dataset"] == "flex_planned" for c in d_plan["citations"])

    # 3. FLEX Results query with flex_results filter
    r_res = client.post(
        "/api/assistant/query",
        json={"question": "What is the outcome distribution of FLEX experiments?", "dataset": "flex_results"},
    )
    assert r_res.status_code == 200
    d_res = r_res.json()
    assert d_res["dataset_filter"] == "flex_results"
    assert d_res["has_evidence"] is True
    assert all(c["dataset"] == "flex_results" for c in d_res["citations"])
    print("[PASS] Assistant multi-dataset filtering passed.")


def test_assistant_filter_mismatch_guidance():
    """Verify that asking about droplet fuel (methanol) with BASS-II filter active returns mismatch guidance."""
    r = client.post(
        "/api/assistant/query",
        json={"question": "What outcomes are recorded for methanol experiments?", "dataset": "bass_ii"},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["has_evidence"] is True
    assert "methanol" in data["answer"].lower()
    assert "flex" in data["answer"].lower()
    print("[PASS] Assistant filter mismatch guidance passed.")


def test_scientific_questions_calculations():
    """Verify exact numerical and factual answers for the 7 scientific questions."""
    # Q1: Planned vs Recorded difference
    r1 = client.post(
        "/api/assistant/query",
        json={"question": "What is the difference between the FLEX planned conditions and recorded experimental results?", "dataset": "all"},
    )
    assert r1.status_code == 200
    ans1 = r1.json()["answer"]
    assert "290" in ans1
    assert "274" in ans1

    # Q2: Methanol outcomes
    r2 = client.post(
        "/api/assistant/query",
        json={"question": "What outcomes are recorded for methanol experiments?", "dataset": "flex_results"},
    )
    assert r2.status_code == 200
    ans2 = r2.json()["answer"]
    assert "157" in ans2
    assert "126" in ans2  # extinction
    assert "23" in ans2   # disruption
    assert "8" in ans2    # completion

    # Q3: Distribution of FLEX outcomes
    r3 = client.post(
        "/api/assistant/query",
        json={"question": "What is the distribution of FLEX experimental outcomes?", "dataset": "flex_results"},
    )
    assert r3.status_code == 200
    ans3 = r3.json()["answer"]
    assert "186" in ans3
    assert "61" in ans3
    assert "27" in ans3

    # Q4: Missing burning rates
    r4 = client.post(
        "/api/assistant/query",
        json={"question": "Which FLEX records have missing burning rates?", "dataset": "flex_results"},
    )
    assert r4.status_code == 200
    ans4 = r4.json()["answer"]
    assert "16" in ans4
    assert "zero" in ans4.lower()

    # Q5: FLEX Test #114 flagged
    r5 = client.post(
        "/api/assistant/query",
        json={"question": "Why is FLEX Test #114 flagged?", "dataset": "flex_results"},
    )
    assert r5.status_code == 200
    ans5 = r5.json()["answer"]
    assert "114" in ans5
    assert "0.0" in ans5
    assert "9/6/2010" in ans5
    assert "530" in ans5 or "536" in ans5
    assert "not confirmed" in ans5.lower() or "unconfirmed" in ans5.lower()

    # Q6: BASS-II oxygen and carbon monoxide
    r6 = client.post(
        "/api/assistant/query",
        json={"question": "What does the BASS-II report say about oxygen and carbon monoxide?", "dataset": "bass_ii"},
    )
    assert r6.status_code == 200
    ans6 = r6.json()["answer"]
    assert "oxygen" in ans6.lower()
    assert "950" in ans6
    assert "O13a" in ans6
    assert "concurrent" in ans6.lower()
    assert "0.982" in ans6
    assert "Table A.5" in ans6 or "table a.5" in ans6.lower()

    # Q7: 274 vs 284 discrepancy
    r7 = client.post(
        "/api/assistant/query",
        json={"question": "Does the currently available evidence explain the 274-versus-284 FLEX discrepancy?", "dataset": "all"},
    )
    assert r7.status_code == 200
    ans7 = r7.json()["answer"]
    assert "274" in ans7
    assert "284" in ans7
    assert "unresolved" in ans7.lower() or "cannot" in ans7.lower() or "insufficient" in ans7.lower()
    print("[PASS] Scientific questions and deterministic calculations passed.")


def test_evidence_to_insight_flex_and_cross_investigation():
    """Verify Evidence-to-Insight engine supports FLEX results (with anomaly detection) and Cross-Investigation."""
    # 1. FLEX Results comparison (Tests 114 and 115)
    r_flex = client.post(
        "/api/insights/compare",
        json={"test_ids": ["114", "115"], "investigation": "flex_results"},
    )
    assert r_flex.status_code == 200
    d_flex = r_flex.json()
    assert len(d_flex["experiments"]) == 2
    warnings = [w["category"] for w in d_flex["incompatibility_warnings"]]
    assert any("Pressure Anomaly" in c or "Telemetry" in c for c in warnings)
    exp_114 = next(e for e in d_flex["experiments"] if "114" in str(e["test_id"]))
    assert exp_114["ambient_pressure_mmhg"] == 0.0
    assert exp_114["is_anomalous"] is True

    # 2. Cross-investigation comparison (BASS T1 and FLEX 1)
    r_cross = client.post(
        "/api/insights/compare",
        json={"test_ids": ["T1", "1"], "investigation": "cross_investigation"},
    )
    assert r_cross.status_code == 200
    d_cross = r_cross.json()
    assert len(d_cross["experiments"]) == 2
    cross_warns = [w["category"] for w in d_cross["incompatibility_warnings"]]
    assert any("Physical Phase" in c or "Facility" in c or "Incompatible" in c for c in cross_warns)
    print("[PASS] Evidence-to-Insight FLEX and cross-investigation passed.")


if __name__ == "__main__":
    print("Running Flame in Freefall API Test Suite...")
    test_health_endpoint()
    test_summary_endpoint()
    test_experiments_listing_and_pagination()
    test_experiments_filtering()
    test_single_experiment_lookup()
    test_extinction_boundary_analytics()
    test_gas_correlations_analytics()
    test_assistant_query_supported()
    test_assistant_query_unsupported_refusal()
    test_inventory_endpoint()
    test_insights_experiment_matching()
    test_insights_experiment_comparison_compatible()
    test_insights_experiment_comparison_incompatible_warning()
    test_insights_experiment_comparison_insufficient_records()
    test_flex_protocol_endpoints()
    test_flex_results_endpoints()
    test_assistant_multi_dataset_filtering()
    test_assistant_filter_mismatch_guidance()
    test_scientific_questions_calculations()
    test_evidence_to_insight_flex_and_cross_investigation()
    print("\nALL 20 BACKEND API TESTS PASSED SUCCESSFULLY!")
