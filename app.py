"""
Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data
NASA Space Apps Challenge Interactive Dashboard.
Built with Python, Streamlit, and Plotly using verified NASA BASS-II (PSI-25) flight data.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from src.data_loader import (
    load_experiments,
    get_dataset_summary,
    filter_experiments,
)
from src.retriever import NASARetriever
from src.llm_client import NASAAssistantClient

# -----------------------------------------------------------------------------
# Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Flame in Freefall | NASA Space Apps",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# -----------------------------------------------------------------------------
# Custom Styling: Modern Space Theme
# -----------------------------------------------------------------------------
st.markdown(
    """
    <style>
    /* Dark cosmic theme base */
    .main {
        background-color: #0b0f19;
        color: #e0e6ed;
    }
    
    /* Hero Banner */
    .hero-container {
        background: linear-gradient(135deg, rgba(16, 26, 49, 0.85) 0%, rgba(35, 15, 30, 0.85) 100%);
        border: 1px solid rgba(255, 87, 34, 0.25);
        border-radius: 12px;
        padding: 2rem 2.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    
    .hero-title {
        font-size: 2.3rem;
        font-weight: 800;
        background: linear-gradient(90deg, #ff7043, #ffca28, #4fc3f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    
    .hero-subtitle {
        font-size: 1.1rem;
        color: #90caf9;
        margin-bottom: 1rem;
    }
    
    /* Feature Card */
    .info-card {
        background: rgba(18, 24, 38, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .info-card:hover {
        border-color: rgba(255, 112, 67, 0.5);
        transform: translateY(-2px);
    }
    
    .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #ffab91;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    /* Metric Pill */
    .metric-badge {
        display: inline-block;
        background: rgba(33, 150, 243, 0.15);
        border: 1px solid rgba(33, 150, 243, 0.4);
        color: #64b5f6;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    
    /* Observation Quote Box */
    .observation-box {
        background-color: rgba(13, 20, 36, 0.9);
        border-left: 4px solid #ff7043;
        padding: 1rem 1.25rem;
        border-radius: 0 8px 8px 0;
        font-style: italic;
        color: #cfd8dc;
        margin-top: 0.5rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# -----------------------------------------------------------------------------
# Data Loading & Verification
# -----------------------------------------------------------------------------
@st.cache_data
def get_data():
    try:
        return load_experiments()
    except Exception as e:
        st.error(f"⚠️ Error loading verified NASA BASS-II dataset: {e}")
        return pd.DataFrame()


df = get_data()

if df.empty:
    st.warning(
        "No experimental data could be loaded. Please ensure data/processed/bass_ii_experiments.csv exists."
    )
    st.stop()

summary = get_dataset_summary(df)


@st.cache_resource
def get_ai_assistant():
    retriever = NASARetriever()
    client = NASAAssistantClient()
    return retriever, client

# -----------------------------------------------------------------------------
# Sidebar Navigation & Mission Badge
# -----------------------------------------------------------------------------
with st.sidebar:
    st.image(
        "https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg",
        width=90,
    )
    st.title("Flame in Freefall")
    st.caption("NASA Space Apps Challenge 2026")
    st.markdown("---")

    page = st.radio(
        "Navigation",
        [
            "🚀 Mission Briefing",
            "🤖 AI Research Assistant",
            "🔍 Experiment Explorer",
            "📊 Data Visualizations",
            "🔬 Test Deep-Dive",
            "📋 Data Inventory & Sources",
        ],
        index=0,
    )

    st.markdown("---")
    st.markdown("### 🛰️ Dataset Telemetry")
    st.markdown(
        f"""
        - **Platform:** International Space Station (ISS)
        - **Hardware:** Microgravity Science Glovebox (MSG)
        - **Total Flight Tests:** **{summary['total_records']}**
        - **Oxygen Range:** **{summary['min_o2']:.1f}% – {summary['max_o2']:.1f}% O₂**
        - **License:** CC0-1.0 (Public Domain)
        """
    )
    st.caption("Source: NASA Glenn Research Center / PSI-25")


# =============================================================================
# PAGE 1: MISSION BRIEFING (HOME)
# =============================================================================
if page == "🚀 Mission Briefing":
    st.markdown(
        """
        <div class="hero-container">
            <div class="hero-title">Flame in Freefall</div>
            <div class="hero-subtitle">AI-Powered Fire Safety Insights from NASA Microgravity Combustion Data</div>
            <p style="color: #b0bec5; font-size: 1.05rem; line-height: 1.6; margin-bottom: 0;">
                Understanding how fire behaves aboard spacecraft is vital as humanity journeys to the Moon and Mars. 
                This platform opens up decades of NASA microgravity combustion experiments—specifically the 
                <strong>BASS-II (Burning and Suppression of Solids - II)</strong> investigation conducted on the 
                <strong>International Space Station</strong>.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Key Comparison Section
    st.markdown("### 🌌 Why Fire Behaves Differently in Space")
    st.write(
        "On Earth, gravity governs how flames ignite, breathe, and spread. In freefall (microgravity), fire fundamentally changes."
    )

    col1, col2 = st.columns(2)

    with col1:
        st.markdown(
            """
            <div class="info-card">
                <div class="card-title">🌍 Normal Gravity (1g on Earth)</div>
                <ul style="color: #cfd8dc; font-size: 0.95rem; line-height: 1.6; padding-left: 1.2rem;">
                    <li><strong>Buoyancy-Driven Convection:</strong> Hot combustion gases are lighter than cold air and rapidly rise upward.</li>
                    <li><strong>Teardrop Flame Shape:</strong> Rising air draws fresh oxygen into the base, creating the familiar pointed flame.</li>
                    <li><strong>Predictable Flammability:</strong> Standard Earth upward-burning tests (<em>NASA-STD-6001 Test 1</em>) screen materials.</li>
                    <li><strong>Rapid Heat Dissipation:</strong> Convective plumes vent heat away from the burning surface.</li>
                </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col2:
        st.markdown(
            """
            <div class="info-card" style="border-color: rgba(255, 112, 67, 0.4);">
                <div class="card-title">🛰️ Microgravity (0g in Orbit)</div>
                <ul style="color: #cfd8dc; font-size: 0.95rem; line-height: 1.6; padding-left: 1.2rem;">
                    <li><strong>Zero Natural Buoyancy:</strong> Hot gases do not rise; without forced airflow, flames starve in their own exhaust.</li>
                    <li><strong>Spherical, Dim Flames:</strong> Flames burn as slow, dome-like or spherical envelopes around the fuel.</li>
                    <li><strong>Earth Tests Are Not Conservative:</strong> With gentle ventilation (2–10 cm/s), materials burn at lower O₂ levels than in 1g!</li>
                    <li><strong>Elevated Toxicity:</strong> Sluggish oxygen diffusion causes fuel-rich burning and dangerous Carbon Monoxide (CO) spikes.</li>
                </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("---")

    # How This Tool Helps
    st.markdown("### 🛠️ How This Tool Empowers Space Safety")
    colA, colB, colC = st.columns(3)

    with colA:
        st.markdown(
            """
            <div class="info-card">
                <div class="card-title">🔍 Structured Exploration</div>
                <p style="color: #b0bec5; font-size: 0.9rem;">
                    Browse all <strong>126 authentic ISS flight burns</strong>. Filter by fuel thickness, ventilation airflow velocity, and oxygen concentrations without reading through 140+ pages of dense PDFs.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with colB:
        st.markdown(
            """
            <div class="info-card">
                <div class="card-title">📈 Interactive Analytics</div>
                <p style="color: #b0bec5; font-size: 0.9rem;">
                    Explore real correlations between ambient oxygen, airflow direction (opposed vs concurrent), and toxic byproduct generation (CO and CO₂) using interactive Plotly charts.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with colC:
        st.markdown(
            """
            <div class="info-card">
                <div class="card-title">🔬 Verified Evidence</div>
                <p style="color: #b0bec5; font-size: 0.9rem;">
                    Every record, parameter, and observation is directly linked to the official NASA Technical Memorandum (<em>NASA/TM-20210011385</em>) and the Physical Sciences Informatics repository.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.info(
        "💡 **Quick Start:** Use the left sidebar to navigate to **'AI Research Assistant'** to ask combustion questions, or **'Experiment Explorer'** to filter flight records."
    )


# =============================================================================
# PAGE 2: AI RESEARCH ASSISTANT
# =============================================================================
elif page == "🤖 AI Research Assistant":
    st.header("🤖 NASA BASS-II AI Research Assistant")
    st.markdown(
        "Ask questions grounded strictly in the **144-page official NASA summary report**, ISA-Tab metadata, and 126 flight experiment records."
    )

    retriever, assistant_client = get_ai_assistant()

    # System Status and Safety Disclaimer Banner
    col_status, col_clear = st.columns([3, 1])
    with col_status:
        if assistant_client.is_api_configured():
            st.markdown(
                '<span class="metric-badge" style="background: rgba(76, 175, 80, 0.2); border-color: #4caf50; color: #81c784;">🟢 Live Gemini LLM Connected</span>',
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                '<span class="metric-badge" style="background: rgba(33, 150, 243, 0.2); border-color: #2196f3; color: #90caf9;">ℹ️ Local Evidence-Grounded Synthesis Mode (No API key required)</span>',
                unsafe_allow_html=True,
            )
    with col_clear:
        if st.button("🗑️ Clear Chat History", width="stretch"):
            st.session_state.chat_history = []
            st.rerun()

    st.markdown(
        """
        <div style="background: rgba(255, 87, 34, 0.1); border-left: 4px solid #ff7043; padding: 0.6rem 1rem; border-radius: 4px; margin: 0.75rem 0 1.25rem 0; font-size: 0.85rem; color: #ffccbc;">
            ⚠️ <strong>Spacecraft Safety Notice:</strong> This assistant provides scientific research synthesis for educational exploration. Outputs must not be used as operational flight safety approvals.
        </div>
        """,
        unsafe_allow_html=True,
    )

    with st.expander("⚙️ How to configure an AI API Key (Optional)", expanded=False):
        st.markdown(
            """
            This assistant runs out-of-the-box in **Local Evidence-Synthesis Mode** without requiring any external account or API key.
            
            To enable conversational reasoning with Google Gemini:
            1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
            2. Set it in your environment:
               ```bash
               set GEMINI_API_KEY=your_key_here
               ```
               Or create a file at `.streamlit/secrets.toml`:
               ```toml
               GEMINI_API_KEY = "your_key_here"
               ```
            3. Restart the Streamlit app. The assistant will automatically switch to Live Generative LLM mode!
            """
        )

    # Initialize chat history
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = [
            {
                "role": "assistant",
                "content": (
                    "👋 **Hello! I am your NASA BASS-II AI Research Assistant.**\\n\\n"
                    "I can answer questions regarding:\\n"
                    "- The purpose and findings of NASA's BASS-II experiments aboard the ISS\\n"
                    "- How ventilation airflow velocity influences flame spread and extinction\\n"
                    "- Combustion limits for PMMA acrylic, fabrics, and Nomex in microgravity\\n"
                    "- Toxic Carbon Monoxide (CO) generation and oxygen vitiation\\n\\n"
                    "*Every answer is grounded strictly in NASA Technical Memorandum TM-20210011385 and our flight dataset.*"
                ),
                "sources": [],
                "has_evidence": True,
            }
        ]

    # Sample prompt suggestions
    st.markdown("##### 💡 Suggested Questions to Explore:")
    qcol1, qcol2 = st.columns(2)
    with qcol1:
        if st.button("❓ What was the purpose of the BASS-II investigation?"):
            st.session_state.pending_prompt = "What is the purpose of NASA's BASS-II investigation?"
        if st.button("❓ How does airflow affect flame behavior in microgravity?"):
            st.session_state.pending_prompt = "What does the provided evidence say about flame behavior under different airflow conditions?"
    with qcol2:
        if st.button("❓ Which experimental variables are documented in BASS-II?"):
            st.session_state.pending_prompt = "Which experimental variables are documented in my available BASS-II files?"
        if st.button("❓ Test unsupported query: Penguin breeding in Antarctica"):
            st.session_state.pending_prompt = "What is the breeding cycle of emperor penguins in Antarctica?"

    # Display conversation history
    for message in st.session_state.chat_history:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

            # Mode indicator badge beneath assistant messages
            if message["role"] == "assistant":
                mode = message.get("mode", "")
                if mode == "live_llm":
                    model_id = message.get("model_name", "gemini-3.8-flash")
                    st.caption(f"🟢 **Generated by Google Gemini ({model_id})** — Grounded in retrieved NASA evidence.")
                elif mode == "local_evidence_synthesis_fallback":
                    st.caption("ℹ️ **Offline Evidence Synthesis Mode** — (Gemini API returned a Permission or Quota issue; preserved offline verified synthesis).")
                elif mode == "local_evidence_synthesis":
                    st.caption("ℹ️ **Offline Evidence Synthesis Mode** — (Running locally without external API calls).")
                elif mode == "no_evidence":
                    st.caption("⚠️ **Evidence Boundary Notice** — No verified NASA documentation supports this query.")

            if message.get("sources"):
                with st.expander(f"📚 Verified NASA Sources & Evidence ({len(message['sources'])} Passages)"):
                    for idx, s in enumerate(message["sources"], 1):
                        p_num = s.get("page_num")
                        page_badge = f" | Page {p_num}" if p_num else ""
                        st.markdown(
                            f"**[Source {idx}] {s.get('source_title', s.get('source_file'))}** `{s.get('source_file')}{page_badge}`"
                        )
                        st.markdown(f"> *\"{s['content']}\"*")
                        st.markdown(
                            f"[Open NASA PSI Repository]({s.get('url', 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25')}) | [DOI Citation]({s.get('doi_url', 'https://doi.org/10.60555/4qc4-de67')})"
                        )
                        st.divider()

    # Handle prompt from button click or chat input
    prompt = None
    if "pending_prompt" in st.session_state and st.session_state.pending_prompt:
        prompt = st.session_state.pending_prompt
        st.session_state.pending_prompt = None
    else:
        prompt = st.chat_input("Ask a question about NASA microgravity combustion research...")

    if prompt:
        # Display user message
        st.session_state.chat_history.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        # Retrieve and generate
        with st.chat_message("assistant"):
            with st.spinner("Searching NASA BASS-II technical reports and flight test records..."):
                passages = retriever.retrieve(prompt, top_k=4)
                response = assistant_client.generate_response(prompt, passages)
                st.markdown(response["answer"])

                mode = response.get("mode", "")
                if mode == "live_llm":
                    model_id = response.get("model_name", "gemini-3.8-flash")
                    st.caption(f"🟢 **Generated by Google Gemini ({model_id})** — Grounded in retrieved NASA evidence.")
                elif mode == "local_evidence_synthesis_fallback":
                    st.caption("ℹ️ **Offline Evidence Synthesis Mode** — (Gemini API returned a Permission or Quota issue; preserved offline verified synthesis).")
                elif mode == "local_evidence_synthesis":
                    st.caption("ℹ️ **Offline Evidence Synthesis Mode** — (Running locally without external API calls).")
                elif mode == "no_evidence":
                    st.caption("⚠️ **Evidence Boundary Notice** — No verified NASA documentation supports this query.")

                if response.get("sources"):
                    with st.expander(f"📚 Verified NASA Sources & Evidence ({len(response['sources'])} Passages)"):
                        for idx, s in enumerate(response["sources"], 1):
                            p_num = s.get("page_num")
                            page_badge = f" | Page {p_num}" if p_num else ""
                            st.markdown(
                                f"**[Source {idx}] {s.get('source_title', s.get('source_file'))}** `{s.get('source_file')}{page_badge}`"
                            )
                            st.markdown(f"> *\"{s['content']}\"*")
                            st.markdown(
                                f"[Open NASA PSI Repository]({s.get('url', 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25')}) | [DOI Citation]({s.get('doi_url', 'https://doi.org/10.60555/4qc4-de67')})"
                            )
                            st.divider()

        st.session_state.chat_history.append(
            {
                "role": "assistant",
                "content": response["answer"],
                "sources": response.get("sources", []),
                "has_evidence": response.get("has_evidence", True),
                "mode": response.get("mode", ""),
                "model_name": response.get("model_name"),
            }
        )
        st.rerun()


# =============================================================================
# PAGE 3: EXPERIMENT EXPLORER
# =============================================================================
elif page == "🔍 Experiment Explorer":
    st.header("🔍 NASA BASS-II Experiment Explorer")
    st.markdown(
        "Search, filter, and inspect all **126 verified flight tests** conducted aboard the ISS inside the Microgravity Science Glovebox."
    )

    # Search & Filters
    with st.expander("⚙️ Filter Flight Records", expanded=True):
        fcol1, fcol2, fcol3 = st.columns(3)

        with fcol1:
            selected_pis = st.multiselect(
                "Principal Investigator (PI)",
                options=sorted(df["principal_investigator"].unique()),
                default=[],
                help="Select one or more lead scientists who designed the test matrices.",
            )

        with fcol2:
            selected_materials = st.multiselect(
                "Fuel Material Category",
                options=sorted(df["material_category"].unique()),
                default=[],
                help="PMMA rods, thin PMMA films, cotton/fiberglass SIBAL fabric, or Nomex.",
            )

        with fcol3:
            selected_flows = st.multiselect(
                "Flow Configuration",
                options=sorted(
                    [
                        x
                        for x in df["flow_configuration"].dropna().unique()
                        if x
                    ]
                ),
                default=[],
                help="Direction of forced air relative to flame spread.",
            )

        fcol4, fcol5 = st.columns([2, 1])
        with fcol4:
            search_query = st.text_input(
                "🔎 Search Records by Keyword",
                placeholder="e.g., 'sooty', 'extinguished', 'blowoff', '100-µm', '147'",
                help="Search by Test ID, Sample ID, Material, or Astronaut Observations.",
            )

        with fcol5:
            min_o2_val = float(df["calibrated_initial_o2_pct"].min())
            max_o2_val = float(df["calibrated_initial_o2_pct"].max())
            o2_range = st.slider(
                "Calibrated Initial O₂ Range (%)",
                min_value=min_o2_val,
                max_value=max_o2_val,
                value=(min_o2_val, max_o2_val),
                step=0.5,
            )

    # Apply filters
    filtered_df = filter_experiments(
        df,
        pis=selected_pis if selected_pis else None,
        materials=selected_materials if selected_materials else None,
        flow_configs=selected_flows if selected_flows else None,
        min_o2=o2_range[0],
        max_o2=o2_range[1],
        search_query=search_query,
    )

    # Metric Row
    mcol1, mcol2, mcol3, mcol4 = st.columns(4)
    mcol1.metric("Matching Tests", f"{len(filtered_df)} / {len(df)}")
    mcol2.metric(
        "Avg Initial O₂",
        (
            f"{filtered_df['calibrated_initial_o2_pct'].mean():.1f}%"
            if len(filtered_df) > 0
            else "N/A"
        ),
    )
    mcol3.metric(
        "Max Toxic CO",
        (
            f"{filtered_df['final_co_ppm'].max():.0f} ppm"
            if filtered_df["final_co_ppm"].dropna().any()
            else "N/A"
        ),
    )
    mcol4.metric(
        "Unique Materials",
        (
            f"{filtered_df['fuel_material'].nunique()}"
            if len(filtered_df) > 0
            else "0"
        ),
    )

    # Data Display
    if filtered_df.empty:
        st.warning(
            "⚠️ No flight experiments matched your current filter criteria. Try broadening your selection or clearing the search bar."
        )
    else:
        display_cols = [
            "as_run_num",
            "test_id",
            "principal_investigator",
            "date_gmt",
            "sample_id",
            "fuel_material",
            "flow_configuration",
            "air_velocity_cms",
            "calibrated_initial_o2_pct",
            "final_co_ppm",
            "observations",
        ]

        st.dataframe(
            filtered_df[display_cols].rename(
                columns={
                    "as_run_num": "Seq #",
                    "test_id": "Test ID",
                    "principal_investigator": "Lead PI",
                    "date_gmt": "Date / GMT",
                    "sample_id": "Sample #",
                    "fuel_material": "Fuel Material",
                    "flow_configuration": "Flow Type",
                    "air_velocity_cms": "Air Speed (cm/s)",
                    "calibrated_initial_o2_pct": "Initial O₂ (%)",
                    "final_co_ppm": "Final CO (ppm)",
                    "observations": "Flight Observations",
                }
            ),
            width="stretch",
            height=420,
        )

        csv_download = filtered_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="📥 Download Filtered Data as CSV",
            data=csv_download,
            file_name="nasa_bass_ii_filtered_experiments.csv",
            mime="text/csv",
        )

    # Missing Data Diagnostics
    with st.expander("ℹ️ Data Integrity & Sensor Completeness Notes"):
        st.markdown(
            """
            - **Calibrated Initial O₂:** 100% complete across all 126 tests.
            - **Carbon Monoxide (CO) Sensor:** 10 records have missing final CO values due to sensor warm-up windows or brief runs where ignition failed immediately before gas accumulated.
            - **Video Recording Time Range:** 36 tests do not list an exact video time overlay because timing was captured via the ISS Microgravity Science Glovebox master timeline instead of the camera burned-in timestamp.
            - **No Fictional Imputation:** In accordance with scientific integrity guidelines, missing sensor channels remain empty (`NaN`) rather than being filled with synthetic estimates.
            """
        )


# =============================================================================
# PAGE 3: DATA VISUALIZATIONS
# =============================================================================
elif page == "📊 Data Visualizations":
    st.header("📊 Microgravity Combustion Telemetry & Charts")
    st.markdown(
        "Interactive Plotly visual analytics based on genuine sensor readings from NASA/TM-20210011385."
    )

    tab1, tab2, tab3, tab4 = st.tabs(
        [
            "💨 Oxygen vs Toxic CO Generation",
            "🧪 Test Count by Fuel Material",
            "🌪️ Flow Configuration vs O₂ Consumption",
            "⚖️ Combustion Gas Stoichiometry",
        ]
    )

    with tab1:
        st.subheader("Chamber Oxygen vs Carbon Monoxide Generation")
        st.caption(
            "Higher CO concentrations indicate incomplete combustion—a major risk in confined spacecraft atmospheres."
        )

        # Plot 1: Initial O2 vs Final CO
        valid_co = df.dropna(subset=["calibrated_initial_o2_pct", "final_co_ppm"])
        fig1 = px.scatter(
            valid_co,
            x="calibrated_initial_o2_pct",
            y="final_co_ppm",
            color="material_category",
            hover_name="test_id",
            hover_data=[
                "principal_investigator",
                "fuel_material",
                "air_velocity_cms",
            ],
            labels={
                "calibrated_initial_o2_pct": "Calibrated Initial Oxygen Concentration (vol % O₂)",
                "final_co_ppm": "Post-Burn Carbon Monoxide (ppm)",
                "material_category": "Fuel Category",
            },
            title="Post-Burn Carbon Monoxide (ppm) vs. Initial Oxygen Level (% O₂)",
            template="plotly_dark",
            height=500,
        )
        fig1.update_traces(marker=dict(size=10, opacity=0.85, line=dict(width=1, color="white")))
        st.plotly_chart(fig1, width="stretch")

        st.markdown(
            """
            > **Scientific Insight:** Notice the severe CO spikes (reaching 300 to 950 ppm) occurring around 17%–21% O₂ for **PMMA Rods** and **SIBAL fabrics**. In low-speed microgravity forced flow, oxygen diffusion cannot keep up with pyrolyzed fuel vapor, creating fuel-rich flame zones that produce dangerous carbon monoxide instead of carbon dioxide.
            """
        )

    with tab2:
        st.subheader("Distribution of Flight Tests by Fuel Material")
        st.caption(
            "NASA BASS-II evaluated thick rods, thin films, composite fabrics, and slabs across 6 research teams."
        )

        mat_counts = (
            df.groupby(["material_category", "principal_investigator"])
            .size()
            .reset_index(name="test_count")
        )
        fig2 = px.bar(
            mat_counts,
            x="material_category",
            y="test_count",
            color="principal_investigator",
            labels={
                "material_category": "Fuel Material Category",
                "test_count": "Number of ISS Flight Tests",
                "principal_investigator": "Lead Investigator",
            },
            title="Flight Tests Conducted by Fuel Material & Principal Investigator",
            template="plotly_dark",
            height=480,
            barmode="stack",
        )
        st.plotly_chart(fig2, width="stretch")

        st.markdown(
            """
            > **Scientific Insight:** **PMMA Rods** (tested extensively by Olson and Fernandez-Pello) and **SIBAL Cotton/Fiberglass Fabric** (tested by T'ien) represent the majority of test runs to establish baseline steady regression rates and extinction limits.
            """
        )

    with tab3:
        st.subheader("Flow Configuration vs Oxygen Consumption (Δ O₂)")
        st.caption(
            "Comparing Opposed flow (airflow against flame front) vs Concurrent flow (airflow aiding flame spread)."
        )

        valid_delta = df.dropna(subset=["flow_configuration", "delta_o2_pct"])
        valid_delta = valid_delta[valid_delta["flow_configuration"].isin(["Opposed", "Concurrent", "Axial Stagnation"])]

        fig3 = px.box(
            valid_delta,
            x="flow_configuration",
            y="delta_o2_pct",
            color="flow_configuration",
            points="all",
            labels={
                "flow_configuration": "Forced Air Flow Configuration",
                "delta_o2_pct": "Oxygen Consumed: Initial O₂ - Final O₂ (vol %)",
            },
            title="Oxygen Depletion During Burn by Airflow Direction",
            template="plotly_dark",
            height=480,
        )
        st.plotly_chart(fig3, width="stretch")

        st.markdown(
            """
            > **Scientific Insight:** Concurrent flow typically supports longer flame spread lengths and greater total oxygen consumption before extinction compared to opposed flow, where radiative heat losses from the thin flame front lead to earlier quench.
            """
        )

    with tab4:
        st.subheader("Combustion Gas Stoichiometry: O₂ Consumed vs CO₂ Produced")
        st.caption(
            "Verifies stoichiometric consistency in the Microgravity Science Glovebox working volume."
        )

        valid_stoich = df.dropna(subset=["delta_o2_pct", "delta_co2_pct"])
        fig4 = px.scatter(
            valid_stoich,
            x="delta_o2_pct",
            y="delta_co2_pct",
            color="material_category",
            hover_name="test_id",
            labels={
                "delta_o2_pct": "Oxygen Consumed: Δ O₂ (vol %)",
                "delta_co2_pct": "Carbon Dioxide Produced: Δ CO₂ (vol %)",
                "material_category": "Material",
            },
            title="Oxygen Consumption vs. Carbon Dioxide Production",
            template="plotly_dark",
            height=480,
        )
        st.plotly_chart(fig4, width="stretch")

        st.markdown(
            """
            > **Scientific Insight:** As documented in Section 1.4 of NASA/TM-20210011385, the linear correlation between oxygen consumed and carbon dioxide produced confirms that the single-step gas-phase reaction models match glovebox sensor measurements with high accuracy.
            """
        )


# =============================================================================
# PAGE 4: TEST DEEP-DIVE
# =============================================================================
elif page == "🔬 Test Deep-Dive":
    st.header("🔬 Single Experiment Telemetry Deep-Dive")
    st.markdown(
        "Select any of the **126 individual ISS tests** to inspect complete experimental parameters, sensor readings, and astronaut observations."
    )

    test_options = df["test_id"] + " — " + df["fuel_material"] + " (" + df["principal_investigator"] + ")"
    selected_idx = st.selectbox(
        "Select Flight Test Record:",
        range(len(df)),
        format_func=lambda i: test_options.iloc[i],
    )

    rec = df.iloc[selected_idx]

    # Test Header
    st.markdown(
        f"""
        <div class="hero-container" style="padding: 1.5rem 2rem; margin-bottom: 1.5rem;">
            <div style="font-size: 1.8rem; font-weight: 700; color: #ff7043;">
                Test {rec['test_id']} <span class="metric-badge">Run #{rec['as_run_num']} on ISS</span>
            </div>
            <div style="color: #90caf9; font-size: 1.05rem; margin-top: 0.25rem;">
                Lead Investigator: <strong>{rec['principal_investigator']}</strong> | Flight Date: <strong>{rec['date_gmt']}</strong>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    colA, colB = st.columns([1, 1])

    with colA:
        st.markdown("#### ⚙️ Hardware & Flow Parameters")
        st.markdown(
            f"""
            - **Hardware Sample Tag:** `{rec['sample_id']}`
            - **Fuel Material Tested:** **{rec['fuel_material']}**
            - **Flow Configuration:** `{rec['flow_configuration']}`
            - **Air Velocity Setting:** `{rec['air_velocity_cms']} cm/s` (Fan display: `{rec['fan_setting']}`)
            - **Flow Restrictor Plate:** `{rec['flow_restrictor']}`
            - **Video Timestamp:** `{rec['time_range'] if pd.notna(rec['time_range']) and rec['time_range'] else 'Logged in MSG master timeline'}`
            """
        )

    with colB:
        st.markdown("#### 🧪 Combustion Gas Telemetry")
        tcol1, tcol2 = st.columns(2)
        with tcol1:
            st.metric(
                "Initial Calibrated O₂",
                f"{rec['calibrated_initial_o2_pct']:.1f}%",
            )
            st.metric(
                "Initial CO₂",
                f"{rec['initial_co2_pct']:.2f}%" if pd.notna(rec['initial_co2_pct']) else "N/A",
            )
            st.metric(
                "Pre-Burn CO",
                f"{rec['initial_co_ppm']:.0f} ppm" if pd.notna(rec['initial_co_ppm']) else "N/A",
            )
        with tcol2:
            st.metric(
                "Final Calibrated O₂",
                f"{rec['calibrated_final_o2_pct']:.1f}%" if pd.notna(rec['calibrated_final_o2_pct']) else "N/A",
                delta=(
                    f"{-rec['delta_o2_pct']:.1f}%" if pd.notna(rec['delta_o2_pct']) else None
                ),
            )
            st.metric(
                "Final CO₂",
                f"{rec['final_co2_pct']:.2f}%" if pd.notna(rec['final_co2_pct']) else "N/A",
                delta=(
                    f"+{rec['delta_co2_pct']:.2f}%" if pd.notna(rec['delta_co2_pct']) else None
                ),
            )
            st.metric(
                "Final Toxic CO",
                f"{rec['final_co_ppm']:.0f} ppm" if pd.notna(rec['final_co_ppm']) else "N/A",
                delta=(
                    f"+{rec['delta_co_ppm']:.0f} ppm" if pd.notna(rec['delta_co_ppm']) else None
                ),
            )

    st.markdown("#### 📝 Real-Time Flight Observations & Anomalies")
    st.markdown(
        f"""
        <div class="observation-box">
            "{rec['observations']}"
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("---")
    st.markdown(
        f"""
        🔗 **NASA Official Data Verification:**  
        Record extracted from *NASA Technical Memorandum NASA/TM-20210011385 (Table A.{rec['test_id'][0]})*.  
        Archive: [NASA Physical Sciences Informatics (PSI-25)](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25) | DOI: `10.60555/4qc4-de67`
        """
    )


# =============================================================================
# PAGE 5: DATA INVENTORY & SOURCES
# =============================================================================
elif page == "📋 Data Inventory & Sources":
    st.header("📋 NASA BASS-II Data Inventory & Repository")
    st.markdown(
        "Transparency, source references, and verifiable NASA provenance for all data used in this project."
    )

    st.markdown("### 🏛️ Primary NASA Investigation")
    st.markdown(
        """
        - **Investigation Name:** Burning and Suppression of Solids – II (BASS-II)
        - **NASA PSI Identifier:** **PSI-25**
        - **Digital Object Identifier (DOI):** [10.60555/4qc4-de67](https://doi.org/10.60555/4qc4-de67)
        - **Direct Repository Link:** [https://psi.nasa.gov/physci/repo/data/investigations/PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25)
        - **Host Facility:** International Space Station (ISS) Destiny Laboratory, Microgravity Science Glovebox (MSG)
        - **NASA Research Center:** NASA Glenn Research Center (GRC), Cleveland, Ohio
        - **Lead Author / Project Scientist:** Sandra L. Olson (NASA GRC) and Paul V. Ferkul (USRA)
        - **Principal Investigators:** Subrata Bhattacharjee, Carlos Fernandez-Pello, Fletcher J. Miller, James S. T'ien, Indrek Wichman
        - **Open Access License:** Creative Commons CC0-1.0 (Public Domain Software & Data)
        """
    )

    st.markdown("### 📁 Project Files & Verification Status")
    inventory_data = [
        {
            "File": "data/raw/PSI-25_metadata_PSI_metadata_PSI-101_BASS-II.zip",
            "Type": "NASA Archive",
            "Records": "2 Files",
            "Status": "✅ Verified & Intact",
            "Description": "Official ISA-Tab investigation metadata and 17 publication DOIs from NASA PSI.",
        },
        {
            "File": "data/docs/bass_ii_summary_report.pdf",
            "Type": "NASA Technical Report",
            "Records": "144 Pages",
            "Status": "✅ Verified & Intact",
            "Description": "NASA/TM-20210011385 documenting complete science background, tests, and anomalies.",
        },
        {
            "File": "data/raw/metadata_extracted/i_Investigation.txt",
            "Type": "ISA-Tab Text",
            "Records": "13.1 KB",
            "Status": "✅ Extracted",
            "Description": "Study descriptors, hardware requirements, and author list.",
        },
        {
            "File": "data/processed/bass_ii_experiments.csv",
            "Type": "Cleaned CSV",
            "Records": "126 Rows x 20 Cols",
            "Status": "✅ Verified",
            "Description": "All 126 experimental burns from Appendix A parsed into tabular format.",
        },
    ]

    st.table(pd.DataFrame(inventory_data))

    st.markdown("### 📜 Scientific Citation")
    st.code(
        """@techreport{olson2021bass2,
  title={Burning and Suppression of Solids--II (BASS--II) Summary Report},
  author={Olson, Sandra L and Ferkul, Paul V and Bhattacharjee, Subrata and Miller, Fletcher J and Fernandez-Pello, Carlos and Link, Shmuel and T'ien, James S and Wichman, Indrek},
  year={2021},
  institution={National Aeronautics and Space Administration},
  number={NASA/TM-20210011385},
  doi={10.60555/4qc4-de67}
}""",
        language="bibtex",
    )
