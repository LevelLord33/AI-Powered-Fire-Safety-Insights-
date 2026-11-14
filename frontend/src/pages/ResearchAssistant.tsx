import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  ExternalLink,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  RefreshCw,
  Database,
  Layers,
  Flame,
  Droplets,
  FileText,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { api } from '../services/api';
import { AssistantResponse, CitationSource, DatasetOption } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  datasetUsed?: DatasetOption;
  responseMeta?: AssistantResponse;
  error?: boolean;
}

interface DatasetTabInfo {
  id: DatasetOption;
  label: string;
  shortLabel: string;
  records: string;
  description: string;
  icon: React.ReactNode;
  badgeColor: string;
}

const DATASET_TABS: DatasetTabInfo[] = [
  {
    id: 'all',
    label: 'All Datasets',
    shortLabel: 'All Datasets',
    records: '3 Datasets • 690 Records',
    description: 'Unified cross-investigation retrieval with dataset attribution',
    icon: <Layers size={14} />,
    badgeColor: 'border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow',
  },
  {
    id: 'bass_ii',
    label: 'BASS-II Experimental Records',
    shortLabel: 'BASS-II Solid',
    records: '126 Flight Runs • PSI-25',
    description: 'Solid polymer flammability in forced duct flow (ISS MSG)',
    icon: <Flame size={14} className="text-amber-combustion" />,
    badgeColor: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
  },
  {
    id: 'flex_planned',
    label: 'FLEX Planned Conditions',
    shortLabel: 'FLEX Planned',
    records: '290 Conditions • EIRD v4.0',
    description: 'Pre-flight target protocol specification matrix (Section 5.3)',
    icon: <FileText size={14} className="text-blue-400" />,
    badgeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  },
  {
    id: 'flex_results',
    label: 'FLEX Experimental Results',
    shortLabel: 'FLEX Results',
    records: '274 Droplet Tests • PSI-69',
    description: 'As-run photographic & burning rate measurements (ISS CIR)',
    icon: <Droplets size={14} className="text-emerald-400" />,
    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
];

export const ResearchAssistant: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<DatasetOption>('all');
  const [query, setQuery] = useState(
    'What is the difference between the FLEX planned conditions and recorded experimental results?'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const initialMessages: Message[] = [
    {
      id: 'initial-1',
      sender: 'user',
      text: 'What is the difference between the FLEX planned conditions and recorded experimental results?',
      timestamp: 'Initial Query',
      datasetUsed: 'all',
    },
    {
      id: 'initial-2',
      sender: 'assistant',
      text: `### 🔬 Difference Between FLEX Planned Conditions and Recorded Experimental Results

To maintain strict scientific integrity, **planned protocol conditions and actual flight results are maintained as separate datasets**:

#### 1. FLEX Planned Conditions Matrix (\`flex_experiments.csv\`)
• **Record Count:** 290 target environmental test conditions.
• **Source Document:** NASA FLEX Experiment Interface and Requirements Document (*FLEX_EIRD_v4.pdf*), Section 5.3, Tables 1 through 12 (pages 54–61).
• **Nature of Data:** **Pre-flight engineering and scientific specifications**, not actual flight runs.
• **Variables Specified:** Target chamber pressures (0.5 to 3.0 atm), initial droplet diameters (3 mm and 5 mm), fuels (Methanol, Heptane), suppressants (CO2, N2, He), and flow velocity (0.0 or 1.5 cm/s).
• **What it does NOT contain:** Does not contain measured burning rates, actual extinction diameters, or real flight outcomes.

#### 2. FLEX Recorded Experimental Results (\`flex_experimental_results.csv\`)
• **Record Count:** 274 authentic microgravity flight experiments conducted aboard the ISS.
• **Source Document / File:** NASA Physical Sciences Informatics raw catalog table (*PSI-69_Experimental table_FLEX.csv*).
• **Nature of Data:** **As-run photographic and sensor telemetry** from flight runs in the Combustion Integrated Rack (CIR) between March 2009 and December 2011.
• **Measured Parameters:** Actual ambient pressure (mmHg / derived atm), initial droplet diameter (d0 in mm), visible flame extinction diameter (d_ext in mm), burning rate constant (K in mm²/s from d²-law: d²(t) = d0² - K·t), burn duration (tb in seconds), and observed outcome (186 Extinction, 61 Disruption, 27 Completion).

#### ⚠️ Critical Scientific Rule:
**Never merge these datasets or compare them row-by-row.** NASA flight operations dynamically adjusted test sequences based on crew scheduling and hardware behavior; therefore, Planned Condition #1 does NOT map 1:1 to Experimental Flight Test #1 without a dedicated cross-reference key.`,
      timestamp: 'Verified Multi-Dataset Grounding',
      datasetUsed: 'all',
      responseMeta: {
        answer: '',
        mode: 'local_evidence_synthesis',
        model_name: null,
        dataset_filter: 'all',
        has_evidence: true,
        disclaimer:
          'Responses are synthesized strictly from NASA Physical Sciences Informatics technical archives. Informational research only — not for flight safety authorization.',
        citations: [
          {
            source_file: 'FLEX_EIRD_v4.pdf',
            source_title: 'NASA FLEX EIRD v4.0 (Section 5.3)',
            source_type: 'Planned Protocol Specification',
            dataset: 'flex_planned',
            page_num: 'Pages 54-61 (Tables 1-12)',
            section: 'Section 5.3 Science Protocol Matrix',
            url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
            doi_url: 'https://doi.org/10.60555/k695-k864',
            content:
              'Defines 290 pre-flight target test conditions across 12 protocol tables for Methanol and Heptane droplet burning and extinguishment.',
            score: 0.95,
          },
          {
            source_file: 'flex_experimental_results.csv',
            source_title: 'NASA PSI-69 FLEX As-Run Flight Experimental Results',
            source_type: 'Measured Flight Experimental Dataset',
            dataset: 'flex_results',
            page_num: 'Table 1 (274 Records)',
            section: 'Flight Test Measurements',
            url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
            doi_url: 'https://doi.org/10.60555/k695-k864',
            content:
              'Contains 274 measured flight experiments with burning rates (mm²/s), initial/extinction diameters (mm), and outcomes.',
            score: 0.92,
          },
        ],
      },
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [expandedCitation, setExpandedCitation] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const activeAssistantMeta = [...messages]
    .reverse()
    .find((m) => m.sender === 'assistant' && m.responseMeta)?.responseMeta;

  const handleAsk = async (questionText?: string, overrideDataset?: DatasetOption) => {
    const q = (questionText || query).trim();
    if (!q || loading) return;

    const dsToUse = overrideDataset || selectedDataset;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      datasetUsed: dsToUse,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.queryAssistant(q, dsToUse);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        datasetUsed: dsToUse,
        responseMeta: response,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `assistant-error-${Date.now()}`,
        sender: 'assistant',
        text: `Unable to complete query: ${err.message || 'Connection failure to NASA backend.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string, targetDataset: DatasetOption = 'all') => {
    setQuery(prompt);
    setSelectedDataset(targetDataset);
    handleAsk(prompt, targetDataset);
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const handleResetToDefault = () => {
    setMessages(initialMessages);
    setSelectedDataset('all');
  };

  const getDatasetBadge = (ds?: string | null) => {
    switch (ds) {
      case 'bass_ii':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-purple-500/40 bg-purple-500/10 text-purple-300 font-mono">
            <Flame size={10} />
            <span>BASS-II (Solid)</span>
          </span>
        );
      case 'flex_planned':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-blue-500/40 bg-blue-500/10 text-blue-300 font-mono">
            <FileText size={10} />
            <span>FLEX Planned</span>
          </span>
        );
      case 'flex_results':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-mono">
            <Droplets size={10} />
            <span>FLEX Results</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow font-mono">
            <Layers size={10} />
            <span>All Datasets</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-cosmic-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-glow mb-1">
            <Bot size={13} />
            <span>Phase 12 • Multi-Dataset NASA AI Research Engine</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-space-textMain">
            AI Research Assistant
          </h1>
          <p className="text-xs text-space-textMuted mt-1">
            Grounded reasoning & deterministic calculations over 470 indexed passages across BASS-II, FLEX Planned, and FLEX Results
          </p>
        </div>

        {/* Spacecraft Safety Warning Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-dim border border-amber-combustion/30 text-xs font-mono text-amber-combustion">
          <ShieldAlert size={14} />
          <span>Informational Research Only • Not for Flight Approvals</span>
        </div>
      </div>

      {/* Task 3: Interactive Dataset Selector Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-space-textMuted px-1">
          <span className="flex items-center gap-1.5 font-semibold text-space-textMain">
            <Database size={13} className="text-cyan-glow" />
            <span>Active Knowledge Scope / Dataset Selector:</span>
          </span>
          <span className="text-[11px] text-cyan-glow font-mono">
            Filter strictly affects retrieval & calculations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {DATASET_TABS.map((tab) => {
            const isSelected = selectedDataset === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedDataset(tab.id)}
                className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-cosmic-card/95 border-cyan-glow/60 shadow-glow-cyan'
                    : 'bg-cosmic-card/50 border-cosmic-border hover:bg-cosmic-card hover:border-cosmic-border/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-space-textMain">
                    {tab.icon}
                    <span>{tab.shortLabel}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-glow shadow-glow-cyan" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-cyan-glow font-medium mb-1">
                  {tab.records}
                </div>
                <div className="text-[10px] text-space-textMuted line-clamp-1 font-sans">
                  {tab.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Bar */}
      <GlassCard className="p-3.5 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Ask a question under ${DATASET_TABS.find((t) => t.id === selectedDataset)?.label}...`}
              disabled={loading}
              className="w-full glass-input rounded-lg pl-3.5 pr-4 py-2.5 text-xs font-mono text-space-textMain disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-glow/20 border border-cyan-glow/50 text-cyan-glow text-xs font-mono font-semibold hover:bg-cyan-glow/30 hover:shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 size={13} className="animate-spin text-cyan-glow" /> : <Send size={13} />}
            <span>{loading ? 'Analyzing...' : 'Ask Assistant'}</span>
          </button>
        </form>

        {/* Task 4: Scientific Presets Chips */}
        <div className="space-y-1.5 pt-2 border-t border-cosmic-border/60">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-space-textMuted">
            <Sparkles size={12} className="text-cyan-glow shrink-0" />
            <span className="font-semibold text-space-textMain">Recommended Scientific Questions:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() =>
                handleSuggestedPrompt(
                  'What is the difference between the FLEX planned conditions and recorded experimental results?',
                  'all'
                )
              }
              className="px-2.5 py-1 rounded bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-space-textMuted hover:text-cyan-glow transition-colors"
            >
              Planned vs Recorded Differences
            </button>
            <button
              type="button"
              onClick={() =>
                handleSuggestedPrompt(
                  'What outcomes are recorded for methanol experiments?',
                  'flex_results'
                )
              }
              className="px-2.5 py-1 rounded bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-space-textMuted hover:text-emerald-300 transition-colors"
            >
              Methanol Outcomes (FLEX)
            </button>
            <button
              type="button"
              onClick={() =>
                handleSuggestedPrompt(
                  'What is the distribution of FLEX experimental outcomes?',
                  'flex_results'
                )
              }
              className="px-2.5 py-1 rounded bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-space-textMuted hover:text-emerald-300 transition-colors"
            >
              FLEX Outcomes Distribution
            </button>
            <button
              type="button"
              onClick={() =>
                handleSuggestedPrompt(
                  'Which FLEX records have missing burning rates?',
                  'flex_results'
                )
              }
              className="px-2.5 py-1 rounded bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-space-textMuted hover:text-emerald-300 transition-colors"
            >
              Missing Burning Rates Audit
            </button>
            <button
              type="button"
              onClick={() =>
                handleSuggestedPrompt(
                  'Why is FLEX Test #114 flagged?',
                  'flex_results'
                )
              }
              className="px-2.5 py-1 rounded bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-amber-combustion/40 text-amber-combustion hover:bg-amber-dim/50 transition-colors"
            >
              Test #114 Anomaly
            </button>
            <button
              type="button"
              onClick={() =>
                handleSuggestedPrompt(
                  'What does the BASS-II report say about oxygen and carbon monoxide?',
                  'bass_ii'
                )
              }
              className="px-2.5 py-1 rounded bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-purple-500/30 text-purple-300 hover:bg-purple-900/30 transition-colors"
            >
              BASS-II Oxygen & CO
            </button>
            <button
              type="button"
              onClick={() =>
                handleSuggestedPrompt(
                  'Does the currently available evidence explain the 274-versus-284 FLEX discrepancy?',
                  'all'
                )
              }
              className="px-2.5 py-1 rounded bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-space-textMuted hover:text-cyan-glow transition-colors"
            >
              274 vs 284 Discrepancy
            </button>
            <button
              type="button"
              onClick={() =>
                handleSuggestedPrompt(
                  'What is the breeding cycle of emperor penguins in Antarctica?',
                  'all'
                )
              }
              className="px-2.5 py-1 rounded bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-space-textMuted hover:text-amber-combustion transition-colors"
            >
              Test Refusal (Penguins)
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Main RAG Workspace (Chat Flow + Citations Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Center AI Synthesis Panel and Message Thread */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status & Execution Mode HUD */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-cosmic-card/60 border border-cosmic-border text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-space-textMuted">Execution Mode:</span>
              {activeAssistantMeta ? (
                activeAssistantMeta.mode === 'live_llm' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-space-green/15 text-space-green border border-space-green/30">
                    <CheckCircle2 size={12} />
                    <span>Live Gemini API ({activeAssistantMeta.model_name || 'gemini-2.5-flash'})</span>
                  </span>
                ) : activeAssistantMeta.mode === 'no_evidence' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-dim text-amber-combustion border border-amber-combustion/40">
                    <AlertCircle size={12} />
                    <span>Strict Evidence Boundary (Refusal)</span>
                  </span>
                ) : activeAssistantMeta.mode === 'dataset_filter_guidance' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/40">
                    <AlertCircle size={12} />
                    <span>Dataset Scope Guidance</span>
                  </span>
                ) : activeAssistantMeta.mode === 'local_evidence_synthesis_fallback' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-dim text-amber-combustion border border-amber-combustion/30">
                    <AlertCircle size={12} />
                    <span>Offline Fallback Synthesis</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-cyan-dim text-cyan-glow border border-cyan-glow/30">
                    <CheckCircle2 size={12} />
                    <span>Deterministic Evidence Synthesis</span>
                  </span>
                )
              ) : (
                <span className="text-space-textMuted text-[11px]">Ready for query</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeAssistantMeta?.dataset_filter && (
                <span className="text-[10px] text-space-textMuted font-mono">
                  Scope: <span className="text-cyan-glow">{activeAssistantMeta.dataset_filter}</span>
                </span>
              )}
              <span className="text-[11px] text-space-textMuted">
                {activeAssistantMeta?.citations?.length || 0} Citations
              </span>
              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-1 text-[10px] text-space-textMuted hover:text-amber-combustion px-2 py-0.5 rounded bg-cosmic-elevated border border-cosmic-border transition-colors"
                  title="Clear conversation messages"
                >
                  <RotateCcw size={10} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Fallback Reason Alert if present */}
          {activeAssistantMeta?.fallback_reason && (
            <div className="p-2.5 rounded-lg bg-amber-dim/50 border border-amber-combustion/30 text-[11px] font-mono text-amber-combustion flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>Offline Fallback Active: {activeAssistantMeta.fallback_reason}</span>
            </div>
          )}

          {/* Conversation Stream */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <GlassCard className="p-8 text-center text-xs font-mono text-space-textMuted space-y-3">
                <Bot size={28} className="mx-auto text-cyan-glow/60" />
                <p className="text-space-textMain font-semibold">Conversation Cleared</p>
                <p className="text-[11px] max-w-sm mx-auto">
                  Ask a question above or click one of the suggested prompts to start research over all 470 indexed NASA passages and 690 experimental records.
                </p>
                <button
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cosmic-elevated border border-cosmic-border text-cyan-glow hover:bg-cosmic-elevated/70 transition-colors text-xs"
                >
                  <RefreshCw size={12} />
                  <span>Restore Sample Conversation</span>
                </button>
              </GlassCard>
            ) : (
              messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-space-textMuted mb-1 px-1">
                      {isUser ? (
                        <>
                          <span>User Query</span>
                          {getDatasetBadge(m.datasetUsed)}
                          <span>•</span>
                          <span>{m.timestamp}</span>
                        </>
                      ) : (
                        <>
                          <Bot size={11} className="text-cyan-glow" />
                          <span className="text-cyan-glow font-semibold">NASA Research Assistant</span>
                          {getDatasetBadge(m.datasetUsed)}
                          <span>•</span>
                          <span>{m.timestamp}</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`max-w-full rounded-xl p-4 text-xs font-mono leading-relaxed ${
                        isUser
                          ? 'bg-cosmic-elevated/80 border border-cyan-glow/30 text-space-textMain rounded-tr-none'
                          : m.error
                          ? 'bg-amber-dim/50 border border-amber-combustion/50 text-amber-combustion rounded-tl-none'
                          : 'bg-cosmic-card/90 border border-cosmic-border text-space-textMain rounded-tl-none shadow-lg'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.text}</div>

                      {!isUser && m.responseMeta?.disclaimer && (
                        <div className="mt-3 pt-2.5 border-t border-cosmic-border text-[10px] text-space-textMuted font-sans italic">
                          {m.responseMeta.disclaimer}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-glow mb-1 px-1">
                  <Bot size={11} className="animate-spin" />
                  <span>Scanning NASA Multi-Dataset Index & CSV Records...</span>
                </div>
                <div className="bg-cosmic-card/90 border border-cosmic-border rounded-xl rounded-tl-none p-4 text-xs font-mono text-space-textMuted flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-cyan-glow" />
                  <span>Synthesizing mathematically grounded answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right Col: Dedicated Source Citations Column HUD */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-glow uppercase tracking-wider font-semibold">
            <div className="flex items-center gap-2">
              <BookOpen size={14} />
              <span>
                Retrieved Citations ({activeAssistantMeta?.citations?.length || 0})
              </span>
            </div>
            <span className="text-[10px] text-space-textMuted font-mono">
              Deterministic + TF-IDF
            </span>
          </div>

          {/* Citations List */}
          {activeAssistantMeta?.citations && activeAssistantMeta.citations.length > 0 ? (
            <div className="space-y-3">
              {activeAssistantMeta.citations.map((cite: CitationSource, idx: number) => {
                const isExpanded = expandedCitation === idx;
                return (
                  <GlassCard
                    key={idx}
                    className={`p-3.5 space-y-2 border-l-2 transition-all ${
                      cite.dataset === 'flex_results'
                        ? 'border-emerald-500'
                        : cite.dataset === 'flex_planned'
                        ? 'border-blue-500'
                        : 'border-purple-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-cyan-glow">
                          [Source {idx + 1}]
                        </span>
                        {getDatasetBadge(cite.dataset)}
                      </div>
                      {cite.score != null && (
                        <span className="text-[10px] text-space-green bg-space-green/10 px-1.5 py-0.5 rounded border border-space-green/20">
                          Relevance: {(cite.score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-space-textMain font-sans">
                      {cite.source_title || cite.source_file}
                    </div>

                    <div className="text-[10px] font-mono text-space-textMuted flex flex-wrap gap-x-3 gap-y-1">
                      {cite.page_num && (
                        <span>
                          Location: <strong className="text-space-textMain">{cite.page_num}</strong>
                        </span>
                      )}
                      {cite.record_id && (
                        <span>
                          Record ID: <strong className="text-amber-combustion">{cite.record_id}</strong>
                        </span>
                      )}
                      {cite.section && (
                        <span>
                          Section: <span className="text-space-textMain">{cite.section}</span>
                        </span>
                      )}
                    </div>

                    {/* Excerpt */}
                    <div className="text-[11px] text-space-textMuted italic bg-cosmic-darkest/70 p-2.5 rounded border border-cosmic-border leading-relaxed font-mono">
                      "{isExpanded ? cite.content : `${cite.content.slice(0, 160)}...`}"
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-space-textMuted border-t border-cosmic-border/60">
                      <button
                        onClick={() => setExpandedCitation(isExpanded ? null : idx)}
                        className="inline-flex items-center gap-1 text-cyan-glow hover:underline"
                      >
                        <span>{isExpanded ? 'Show Less' : 'Full Passage'}</span>
                        {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>

                      {cite.doi_url ? (
                        <a
                          href={cite.doi_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-glow hover:underline"
                        >
                          <span>DOI Link</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <a
                          href={cite.url || 'https://psi.nasa.gov'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-glow hover:underline"
                        >
                          <span>NASA PSI</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <GlassCard className="p-4 text-center text-xs font-mono text-space-textMuted space-y-2">
              <HelpCircle size={24} className="mx-auto text-space-textMuted/40" />
              <p>No verified NASA citations active for this query state.</p>
              <p className="text-[11px]">
                Select a dataset and ask a question to retrieve matched evidence across all three NASA flight archives.
              </p>
            </GlassCard>
          )}

          {/* Dataset Provenance HUD Summary Card */}
          <GlassCard className="p-3.5 space-y-2 text-xs font-mono border-t-2 border-cyan-glow">
            <div className="flex items-center gap-1.5 font-semibold text-space-textMain">
              <Database size={13} className="text-cyan-glow" />
              <span>Active Multi-Dataset Inventory</span>
            </div>
            <div className="space-y-1 text-[11px] text-space-textMuted">
              <div className="flex justify-between">
                <span>1. BASS-II Experiments:</span>
                <span className="text-space-textMain font-semibold">126 tests</span>
              </div>
              <div className="flex justify-between">
                <span>2. FLEX Planned Matrix:</span>
                <span className="text-space-textMain font-semibold">290 conditions</span>
              </div>
              <div className="flex justify-between">
                <span>3. FLEX Results:</span>
                <span className="text-space-textMain font-semibold">274 tests</span>
              </div>
              <div className="flex justify-between border-t border-cosmic-border pt-1">
                <span>Total Indexed Passages:</span>
                <span className="text-cyan-glow font-semibold">470 chunks</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
