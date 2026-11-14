"""
AI Research Assistant Client for NASA Microgravity Combustion Data.
Supports all three NASA datasets:
1. BASS-II Experimental Records (NASA PSI-25 solid fuel combustion)
2. FLEX Planned Conditions (NASA FLEX EIRD v4.0 science protocol matrix)
3. FLEX Experimental Results (NASA PSI-69 as-run droplet flight experiments)

Integrates Google Gemini generative language model with grounded NASA document evidence
and deterministic structured data calculations.
Falls back safely to local evidence synthesis on network failure, missing key, 503, or rate limits.
"""

import logging
import os
from pathlib import Path
import re
from typing import Any, Dict, List, Optional
import requests

logger = logging.getLogger(__name__)

DISCLAIMER_TEXT = (
    "⚠️ **Spacecraft Safety Disclaimer:** This AI research assistant provides"
    " informational synthesis for educational and exploratory purposes only."
    " Its outputs must not be used as operational spacecraft fire-safety"
    " decisions or engineering approvals."
)

PRIMARY_MODEL = "gemini-2.5-flash"
FALLBACK_MODELS = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest",
    "gemini-3.8-flash",
]


def resolve_gemini_api_key(explicit_key: Optional[str] = None) -> Optional[str]:
    """Securely resolve Gemini API key from environment, Streamlit secrets, or secrets.toml.

    Never logs or exposes the key value.
    """
    if explicit_key and explicit_key.strip():
        return explicit_key.strip()

    # 1. Environment variables
    for var in ["GEMINI_API_KEY", "GOOGLE_API_KEY"]:
        val = os.getenv(var)
        if val and val.strip():
            return val.strip()

    # 2. Streamlit secrets (if running in Streamlit runtime)
    try:
        import streamlit as st

        if hasattr(st, "secrets"):
            for var in ["GEMINI_API_KEY", "GOOGLE_API_KEY"]:
                if var in st.secrets and str(st.secrets[var]).strip():
                    return str(st.secrets[var]).strip()
    except Exception:
        pass

    # 3. Direct reading of .streamlit/secrets.toml
    try:
        secrets_file = (
            Path(__file__).resolve().parent.parent
            / ".streamlit"
            / "secrets.toml"
        )
        if secrets_file.exists():
            text = secrets_file.read_text(encoding="utf-8")
            m = re.search(r"GEMINI_API_KEY\s*=\s*[\"']?([^\"'\r\n]+)", text)
            if m:
                val = m.group(1).strip()
                if val:
                    return val
    except Exception:
        pass

    return None


class NASAAssistantClient:
    """Answers combustion queries grounded strictly in verified NASA documents and structured datasets."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = resolve_gemini_api_key(api_key)
        self.model_name = PRIMARY_MODEL

    def is_api_configured(self) -> bool:
        """Check whether a non-empty Gemini API key is available."""
        return bool(self.api_key and len(self.api_key) > 8)

    def generate_response(
        self,
        query: str,
        retrieved_passages: List[Dict[str, Any]],
        structured_evidence: Optional[Dict[str, Any]] = None,
        dataset_filter: str = "all",
    ) -> Dict[str, Any]:
        """Generate an answer grounded in retrieved passages and structured dataset queries.

        Args:
            query: The user's combustion or project question.
            retrieved_passages: Evidence passages returned by NASARetriever.
            structured_evidence: Pre-computed exact calculations from StructuredEvidenceEngine.
            dataset_filter: "all", "bass_ii", "flex_planned", or "flex_results".

        Returns:
            Dictionary with response text, sources, mode, and safety metadata.
        """
        # Case 0: Dataset filter mismatch (e.g. asking about droplet combustion with BASS-II solid filter active)
        if structured_evidence and structured_evidence.get("is_filtered_out"):
            return {
                "answer": structured_evidence["explanation"],
                "sources": structured_evidence.get("sources", []),
                "mode": "dataset_filter_guidance",
                "model_name": None,
                "has_evidence": True,
                "dataset_filter": dataset_filter,
                "disclaimer": DISCLAIMER_TEXT,
            }

        # Collect all combined citation sources
        combined_sources: List[Dict[str, Any]] = []
        if structured_evidence and "sources" in structured_evidence:
            combined_sources.extend(structured_evidence["sources"])
        for p in retrieved_passages:
            # Avoid duplicate citations
            if not any(s.get("source_file") == p.get("source_file") and s.get("page_num") == p.get("page_num") for s in combined_sources):
                combined_sources.append(p)

        # Case 1: No relevant evidence was found in NASA documents or structured records
        if not retrieved_passages and not structured_evidence:
            filter_note = f" (under selected filter '{dataset_filter}')" if dataset_filter != "all" else ""
            return {
                "answer": (
                    f"### ⚠️ Insufficient Evidence in NASA Records{filter_note}\n\n"
                    "The indexed NASA flight documents, summary reports, and experimental matrices contain "
                    "**no verified evidence or experimental measurements** regarding this topic.\n\n"
                    "To maintain scientific integrity, this research assistant **never fabricates data** "
                    "or extrapolates beyond the available NASA research repository."
                ),
                "sources": [],
                "mode": "no_evidence",
                "model_name": None,
                "has_evidence": False,
                "dataset_filter": dataset_filter,
                "disclaimer": DISCLAIMER_TEXT,
            }

        # Case 2: Live Gemini API key is configured -> Call Gemini LLM
        if self.is_api_configured():
            try:
                llm_answer, used_model = self._call_gemini_api(
                    query, retrieved_passages, structured_evidence, dataset_filter
                )
                return {
                    "answer": llm_answer,
                    "sources": combined_sources,
                    "mode": "live_llm",
                    "model_name": used_model,
                    "has_evidence": True,
                    "dataset_filter": dataset_filter,
                    "disclaimer": DISCLAIMER_TEXT,
                }
            except Exception as e:
                logger.warning(
                    f"Live Gemini API call failed ({e}); preserving offline evidence synthesis."
                )
                local_answer = self._synthesize_local_evidence(
                    query, retrieved_passages, structured_evidence, dataset_filter
                )
                return {
                    "answer": (
                        f"> ℹ️ **Gemini API Status:** *The configured API key encountered a service issue ({e}). "
                        "Switched to verified offline NASA evidence-synthesis mode.*\n\n"
                        + local_answer
                    ),
                    "sources": combined_sources,
                    "mode": "local_evidence_synthesis_fallback",
                    "model_name": None,
                    "has_evidence": True,
                    "dataset_filter": dataset_filter,
                    "disclaimer": DISCLAIMER_TEXT,
                    "fallback_reason": str(e),
                }

        # Case 3: Offline Evidence-Grounded Synthesis (Zero API Key required)
        local_answer = self._synthesize_local_evidence(
            query, retrieved_passages, structured_evidence, dataset_filter
        )
        return {
            "answer": local_answer,
            "sources": combined_sources,
            "mode": "local_evidence_synthesis",
            "model_name": None,
            "has_evidence": True,
            "dataset_filter": dataset_filter,
            "disclaimer": DISCLAIMER_TEXT,
        }

    def _call_gemini_api(
        self,
        query: str,
        passages: List[Dict[str, Any]],
        structured_evidence: Optional[Dict[str, Any]] = None,
        dataset_filter: str = "all",
    ) -> tuple[str, str]:
        """Call Google Gemini generateContent REST API with timeouts and graceful model fallback."""
        context_blocks = []

        # 1. Include verified structured numerical calculations if available
        if structured_evidence and "explanation" in structured_evidence:
            context_blocks.append(
                "=== DETERMINISTIC STRUCTURED NASA DATA CALCULATIONS ===\n"
                + structured_evidence["explanation"]
            )

        # 2. Include retrieved document passages
        if passages:
            context_blocks.append("=== RETRIEVED NASA DOCUMENT PASSAGES ===")
            for idx, p in enumerate(passages, 1):
                src = p.get("source_file", "NASA Document")
                page = p.get("page_num")
                page_str = f", Page {page}" if page else ""
                section = p.get("section")
                sec_str = f" ({section})" if section else ""
                ds = p.get("dataset", "unknown")
                context_blocks.append(
                    f"[Source {idx} ({ds}): {src}{page_str}{sec_str}]\n{p['content']}"
                )

        context_text = "\n\n".join(context_blocks)

        system_prompt = (
            "You are the NASA Multi-Dataset AI Research Assistant for the Space Apps Challenge project 'Flame in Freefall'.\n"
            "You assist researchers, judges, and students by explaining microgravity combustion data across three NASA datasets:\n"
            "1. BASS-II Experimental Records (PSI-25 solid polymer flame spread)\n"
            "2. FLEX Planned Conditions (EIRD v4.0 Section 5.3 planned science protocol matrix, 290 target conditions)\n"
            "3. FLEX Experimental Results (PSI-69 as-run droplet flight measurements, 274 flight tests)\n\n"
            "STRICT SCIENTIFIC GUIDELINES:\n"
            "1. Ground your answer EXCLUSIVELY in the provided NASA evidence blocks and structured facts below.\n"
            "2. State clearly which dataset supports each important claim.\n"
            "3. Strictly distinguish planned protocol conditions from actual recorded experimental results.\n"
            "4. Never invent experimental measurements or missing values. Preserved missing values are nulls, not zero.\n"
            "5. Cite specific source documents, page/table numbers, and test numbers (e.g. '[FLEX Results, Test #114]' or '[FLEX EIRD v4.0, p. 54]').\n"
            "6. For FLEX Test #114, note that the 0.0 mmHg ambient pressure value is an anomalous sensor failure preserved from NASA's source table and excluded from pressure regressions.\n"
            "7. For the discrepancy between 274 local results, 275 catalog entries, and 284 literature tests, state clearly that it remains unresolved in the local records. Never invent an explanation.\n"
            "8. Units: burning rate mm²/s, droplet initial/extinction diameters mm, burn time seconds, airflow cm/s, oxygen % or mole fraction.\n"
            "9. If the provided evidence is insufficient to fully answer the question, state this limitation clearly."
        )

        user_content = (
            f"Active Dataset Filter: {dataset_filter}\n\n"
            f"{context_text}\n\n"
            f"=== USER QUESTION ===\n"
            f"{query}\n\n"
            "Please provide an accurate, grounded answer citing the sources above:"
        )

        payload = {
            "contents": [{"parts": [{"text": user_content}]}],
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.9,
                "maxOutputTokens": 1200,
            },
        }

        models_to_try = [self.model_name] + [
            m for m in FALLBACK_MODELS if m != self.model_name
        ]
        last_error = None

        for model in models_to_try:
            endpoint = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={self.api_key}"
            )
            try:
                resp = requests.post(
                    endpoint,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=10,
                )

                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            self.model_name = model
                            return parts[0]["text"].strip(), model

                err_detail = ""
                try:
                    err_json = resp.json().get("error", {})
                    err_detail = str(err_json.get("message", "")).strip()
                except Exception:
                    pass

                if self.api_key and self.api_key in err_detail:
                    err_detail = err_detail.replace(self.api_key, "[REDACTED_API_KEY]")

                if resp.status_code in [401, 403]:
                    last_error = f"Google API Permission Denied (HTTP {resp.status_code}): {err_detail}"
                    break
                elif resp.status_code == 429:
                    last_error = f"Gemini API rate limit exceeded (HTTP 429): {err_detail}"
                    break
                elif resp.status_code in [500, 502, 503, 504]:
                    last_error = f"Model {model} returned HTTP {resp.status_code} ({err_detail}). Trying fallback..."
                    continue
                else:
                    last_error = f"Gemini API HTTP {resp.status_code}: {err_detail}"
            except requests.exceptions.Timeout:
                last_error = f"Model {model} timed out (10s). Trying fallback..."
                continue
            except requests.exceptions.ConnectionError:
                last_error = "Network connection error connecting to Google Gemini API."
                break

        raise RuntimeError(last_error or "Failed to generate response from Gemini API.")

    def _synthesize_local_evidence(
        self,
        query: str,
        passages: List[Dict[str, Any]],
        structured_evidence: Optional[Dict[str, Any]] = None,
        dataset_filter: str = "all",
    ) -> str:
        """Synthesize an accurate, grounded answer directly from verified evidence without an external API key."""
        # 1. If structured evidence has a computed explanation, use it directly as primary factual grounding
        if structured_evidence and "explanation" in structured_evidence:
            text = structured_evidence["explanation"]
            # Add citations footer
            if passages:
                text += "\n\n#### 📚 Supporting NASA Technical Documents:\n"
                for p in passages[:3]:
                    src = p.get("source_file", "NASA Archive")
                    page = p.get("page_num")
                    page_ref = f", Page {page}" if page else ""
                    sec = p.get("section", "")
                    sec_ref = f" ({sec})" if sec else ""
                    snippet = p["content"].strip()
                    if len(snippet) > 220:
                        snippet = snippet[:217] + "..."
                    text += f"- **[{src}{page_ref}{sec_ref}]**: \"{snippet}\"\n"
            return text

        # 2. General synthesis based on retrieved document passages
        top_passage = passages[0] if passages else {}
        src_file = top_passage.get("source_file", "NASA Archive")
        page = top_passage.get("page_num")
        page_ref = f" (Page {page})" if page else ""
        ds = top_passage.get("dataset", "bass_ii")

        ds_label = {
            "bass_ii": "NASA BASS-II Solid Fuel Flight Documentation",
            "flex_planned": "NASA FLEX Planned Protocol Matrix (EIRD v4.0)",
            "flex_results": "NASA PSI-69 FLEX Experimental Results",
        }.get(ds, "NASA Physical Sciences Informatics Documentation")

        lines = [
            "### 🛰️ Evidence-Grounded Research Finding\n",
            f"*Synthesized directly from verified {ds_label} ({src_file}{page_ref}).*\n",
        ]

        lines.append("#### 📌 Key Documented Facts:")
        for p in passages[:3]:
            p_src = p.get("source_file", "NASA Document")
            p_page = p.get("page_num")
            p_ref = f", Page {p_page}" if p_page else ""
            p_ds = p.get("dataset", "")
            ds_tag = f"[{p_ds.upper()}] " if p_ds else ""
            content_snippet = p["content"].strip()
            if len(content_snippet) > 300:
                content_snippet = content_snippet[:297] + "..."
            lines.append(f'- **{ds_tag}[{p_src}{p_ref}]**: "{content_snippet}"')

        lines.append("\n#### 🔬 Scientific Context:")
        q_lower = query.lower()

        if "flex" in q_lower or "droplet" in q_lower or ds in ["flex_planned", "flex_results"]:
            lines.append(
                "The FLEX investigation (NASA PSI-69) examined isolated droplet combustion and flame extinguishment "
                "in microgravity aboard the ISS Combustion Integrated Rack (CIR). Fuels evaluated include Methanol ($CH_3OH$) "
                "and n-Heptane ($C_7H_{16}$). Droplets regress according to the classical $d^2$-law until reaching a critical "
                "extinction diameter $d_{ext}$ where radiative or diffusive heat loss extinguishes the flame."
            )
        elif "airflow" in q_lower or "flow" in q_lower:
            lines.append(
                "The BASS-II investigation tested forced airflow velocities between 0 and 40 cm/s inside the Microgravity Science Glovebox. "
                "Unlike Earth fires where buoyant convection pulls fresh oxidizer upward, microgravity space flames depend entirely on "
                "forced ventilation airflow. At low airflows (< 1-2 cm/s), radiative heat loss outpaces oxygen supply, leading to flame quenching. "
                "At high airflow (> 35-40 cm/s), convective cooling causes blowoff extinction."
            )
        elif "purpose" in q_lower or "objective" in q_lower or "goal" in q_lower:
            lines.append(
                "BASS-II investigated the hypothesis that solid materials burn as well or better in low-speed forced ventilation in microgravity "
                "than in normal Earth gravity, evaluating whether NASA-STD-6001 Test 1 is conservative for spacecraft safety screening. "
                "FLEX focused on droplet combustion, quantifying burning rates ($K$ in mm²/s) and spherical flame extinction limits."
            )
        else:
            lines.append(
                f"The available NASA flight evidence confirms specific experimental conditions and observations recorded directly in {src_file}{page_ref}. "
                "These findings reflect authentic flight experiments conducted inside the International Space Station."
            )

        return "\n".join(lines)
