# 🔥 Flame in Freefall
### AI-Powered Fire Safety Insights from Microgravity Combustion Data

**Flame in Freefall** is an AI-powered web application that explores how fire behaves in microgravity using NASA combustion experiment data. It transforms complex research datasets into interactive visualizations, experiment explorers, and an AI-powered research assistant to make space-based fire research easier to understand.

## 🚀 Project Overview

Fire behaves differently in microgravity than it does on Earth. Understanding these differences is important for spacecraft fire safety and future human space missions.

Our project brings together NASA combustion research data to help users investigate fuel behavior, oxygen concentration, combustion conditions, burning rates, flame extinction, and suppressant effects.

The platform combines data analysis, interactive dashboards, and AI-assisted research into one accessible application.

## ✨ Key Features

- **Mission Control Dashboard:** A central overview of the available combustion datasets and research insights.
- **Experiment Explorer:** Explore BASS-II experiment records and their recorded conditions.
- **Combustion Analytics:** Interactive charts and visual analysis of combustion measurements.
- **Test Deep-Dive:** Examine individual combustion experiment records.
- **FLEX Protocol Explorer:** Investigate planned FLEX experimental conditions, including fuel, pressure, oxygen, and suppressant mixtures.
- **FLEX Results Explorer:** Explore experimental outcomes, burning rates, and flame extinction measurements.
- **AI Research Assistant:** Ask questions about the datasets and receive evidence-based answers.
- **Insight Engine:** Find useful patterns and comparisons across the datasets.
- **Data Inventory:** Review the available datasets and their contents.

## 📊 NASA Research Datasets

The application integrates three distinct datasets:

### 1. BASS-II — Burning and Suppression of Solids

- **126 experimental records**
- Source: NASA Technical Memorandum NASA/TM-20210011385.
- Includes solid-fuel combustion experiments and recorded measurements.
- Contains fuel information, airflow conditions, oxygen and carbon dioxide measurements, carbon monoxide readings, and experiment observations.

### 2. FLEX Planned Experimental Conditions

- **290 planned experimental conditions**
- Source: FLEX Experiment Implementation Requirements Document (EIRD).
- Includes methanol and heptane experiment conditions.
- Covers pressure, oxygen concentration, diluent composition, and suppressant mixtures.
- Nitrogen is treated as a diluent or balance gas, not as a suppressant.

### 3. FLEX Experimental Results

- **274 experimental records**
- Source: NASA PSI-69 FLEX experimental results table.
- Includes recorded combustion outcomes, initial droplet diameters, visible flame extinction diameters, burning rates, and burn times.
- Records outcomes such as extinction, disruption, and completion.

**Important:** Planned FLEX conditions are not measured experimental outcomes. BASS-II records are extracted from a NASA report and should not be mistaken for raw telemetry files.

## 🧠 AI Research Assistant

The AI Research Assistant helps users explore the available datasets through natural-language questions.

It supports:
- Dataset-related question answering.
- Numerical and statistical queries.
- Cross-dataset comparisons.
- Evidence-based research responses.
- Source references for supporting information.

The application integrates the Google Gemini API, with a deterministic local fallback for supported questions when the external AI service is unavailable or its usage quota is exceeded.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Data Processing | Pandas, PyMuPDF |
| Data Retrieval | TF-IDF and structured retrieval |
| AI Integration | Google Gemini API |
| Visualization | Recharts, Plotly |
| Testing | Python backend tests and frontend production build |

## 🏗️ Application Architecture

The project uses a frontend-and-backend architecture.

- **Frontend:** Displays dashboards, charts, experiment records, and research tools.
- **Backend:** Provides REST API endpoints and processes research data.
- **Data Layer:** Stores and organizes the BASS-II and FLEX datasets.
- **AI Layer:** Supports natural-language research queries and evidence retrieval.

## 💻 Getting Started

### Prerequisites

- Python 3.10 or later recommended.
- Node.js 18 or later.
- npm.
- Git.

### 1. Clone the Repository

Replace the example URL with your GitHub repository URL.

```bash
git clone https://github.com/LevelLord33/AI-Powered-Fire-Safety-Insights-.git
cd flame-in-freefall
```

### 2. Start the Application

On Windows, run the supplied startup script from the project folder:

```powershell
.\start.bat
```

The application is designed to start the frontend and backend services.

### 3. Open the Application

Once the services are running, open:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

If the frontend uses another available port, use the local address displayed in your terminal.

### 4. Gemini API Configuration

The AI Research Assistant can use a Google Gemini API key when configured.

Set the `GEMINI_API_KEY` environment variable using your own API key. Follow the project's environment configuration instructions.

The local deterministic fallback supports selected research queries when Gemini is unavailable.

**Security:** Never upload API keys, passwords, or private environment files to GitHub.

## 📁 Project Structure

```text
flame-in-freefall/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── docs/
│
├── docs/
│   ├── DATA_DICTIONARY.md
│   ├── WEBSITE_USER_GUIDE.md
│   └── AI_RESEARCH_ASSISTANT_GUIDE.md
│
├── frontend/
│
├── backend/
│
├── src/
│
├── app.py
├── start.bat
├── README.md
└── requirements.txt
```

*The structure above provides a high-level overview; individual source folders may contain additional files.*

## 🔬 Why This Project Matters

Fire safety is an essential part of human space exploration. Microgravity changes how flames develop and how combustion products behave.

By making NASA combustion research easier to explore, Flame in Freefall helps students, researchers, and space enthusiasts understand experimental evidence related to fire behavior in microgravity.

The project supports research exploration that may contribute to better-informed fire safety studies for spacecraft and future space missions.

## ⚠️ Data and Scientific Limitations

- The application is a research and educational tool, not a spacecraft fire-safety certification system.
- Its findings are based on the supplied NASA research datasets.
- Planned experiment conditions must not be interpreted as measured outcomes.
- Missing experimental measurements are preserved as missing values rather than treated as zero.
- AI-generated responses should be checked against their cited source records.
- The application does not replace professional engineering analysis or NASA safety procedures.

## 📚 Documentation

- [Data Dictionary](docs/DATA_DICTIONARY.md)
- [Website User Guide](docs/WEBSITE_USER_GUIDE.md)
- [AI Research Assistant Guide](docs/AI_RESEARCH_ASSISTANT_GUIDE.md)

## 🌌 Project Vision

Our vision is to make complex space combustion research more accessible through data science, interactive visualization, and AI-assisted exploration.

**Flame in Freefall — Exploring Fire Beyond Earth.**

## 👥 NASA Space Apps Challenge

Developed as a project for the **NASA Space Apps Challenge**.

This project uses publicly available NASA research publications and experimental datasets as its scientific foundation.

---

**Built with curiosity, science, and a passion for safer space exploration.** 🔥🚀
