import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Wind,
  Shield,
  Activity,
  ArrowRight,
  Compass,
  FileText,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { MetricPill } from '../components/MetricPill';
import { api } from '../services/api';
import { DatasetSummary, HealthData } from '../types';

export const MissionControl: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhysics, setExpandedPhysics] = useState<string | null>(null);

  const fetchMissionData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, healthData] = await Promise.all([
        api.getSummary(),
        api.getHealth(),
      ]);
      setSummary(sumData);
      setHealth(healthData);
    } catch (err: any) {
      console.warn('Backend unavailable, using cached baseline telemetry:', err);
      setError(err.message || 'Unable to load real-time telemetry from FastAPI backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionData();
  }, []);

  const togglePhysics = (key: string) => {
    setExpandedPhysics(expandedPhysics === key ? null : key);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Mission HUD Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-glow/20 bg-gradient-to-br from-cosmic-surface via-cosmic-elevated/70 to-cosmic-darkest p-6 md:p-10 shadow-glass">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-glow/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-combustion/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-dim border border-cyan-glow/30 text-cyan-glow text-xs font-mono mb-4">
            <Sparkles size={13} />
            <span>NASA Space Apps Challenge 2026 • Science Analytics</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight text-space-textMain leading-tight">
            Flame in Freefall
          </h1>
          <p className="font-display text-lg md:text-xl text-cyan-glow mt-2 font-medium">
            AI-Powered Fire Safety Insights from NASA Microgravity Combustion Data
          </p>

          <p className="text-space-textMuted text-sm md:text-base leading-relaxed mt-4 font-normal">
            Aboard the International Space Station, fire behaves fundamentally differently than on Earth. Without gravity-driven
            natural convection, flames become dim, spherical blue domes that can persist in low-oxygen environments
            and react unpredictably to subtle spacecraft ventilation airflow.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap gap-2.5 mt-6 pt-4 border-t border-cosmic-border">
            <MetricPill
              label="Hardware"
              value="Microgravity Science Glovebox"
              accent="cyan"
              icon={<Zap size={13} />}
            />
            <MetricPill
              label="Archived Tests"
              value={summary ? `${summary.total_records} Flight Runs` : '126 Flight Runs'}
              accent="default"
              icon={<Activity size={13} />}
            />
            <MetricPill
              label="Oxygen Range"
              value={summary ? `${summary.min_o2}% – ${summary.max_o2}% O₂` : '13.6% – 22.2% O₂'}
              accent="amber"
              icon={<Flame size={13} />}
            />
            <MetricPill
              label="Investigation"
              value="NASA BASS-II / PSI-25"
              accent="green"
              icon={<Compass size={13} />}
            />
          </div>
        </div>
      </div>

      {/* Live Backend Telemetry Strip / Error Banner */}
      {error ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-dim/50 border border-amber-combustion/40 text-xs font-mono text-amber-combustion">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-combustion animate-pulse" />
            <span>Backend Telemetry Offline: {error} (Displaying verified baseline catalog)</span>
          </div>
          <button
            onClick={fetchMissionData}
            disabled={loading}
            className="px-3 py-1 rounded bg-cosmic-elevated border border-amber-combustion/50 hover:bg-amber-dim text-white text-[11px] font-semibold transition-colors"
          >
            {loading ? 'Reconnecting...' : 'Retry Connection'}
          </button>
        </div>
      ) : health ? (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-cosmic-card/60 border border-cosmic-border text-xs font-mono text-space-textMuted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-space-green font-semibold">
              <span className="w-2 h-2 rounded-full bg-space-green animate-pulse" />
              <span>FastAPI Backend Active</span>
            </span>
            <span className="text-cosmic-border">•</span>
            <span>
              Verified Records: <strong className="text-cyan-glow">{health.total_experiments}</strong>
            </span>
            <span className="text-cosmic-border">•</span>
            <span>
              Indexed Passages: <strong className="text-cyan-glow">{health.indexed_passages}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>AI Reasoning:</span>
            <span className="text-cyan-glow font-semibold">
              {health.ai_mode === 'live_llm' ? `Google Gemini (${health.active_model})` : 'Offline RAG'}
            </span>
          </div>
        </div>
      ) : null}

      {/* Physical Science Deep-Dive: Earth vs Microgravity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-space-textMain tracking-wide flex items-center gap-2">
              <Compass size={18} className="text-cyan-glow" />
              <span>Why Fire Behaves Differently in Space</span>
            </h2>
            <p className="text-xs text-space-textMuted mt-0.5">
              Fundamental combustion physics separating 1-g buoyant flames from orbital microgravity combustion
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Buoyancy */}
          <GlassCard glow="cyan" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-cyan-glow uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-dim border border-cyan-glow/20">
                  Physics Mechanism
                </span>
                <span className="text-lg">🌍 vs 🛰️</span>
              </div>
              <h3 className="font-semibold text-space-textMain text-sm">
                Absence of Buoyant Convection
              </h3>
              <p className="text-xs text-space-textMuted mt-2 leading-relaxed">
                On Earth, hot air rises because it is less dense, pulling fresh oxygen into the fire.
                In freefall, buoyancy vanishes: hot air does not rise. Flames become spherical, dim blue shells governed
                strictly by molecular diffusion.
              </p>
              
              {expandedPhysics === 'buoyancy' && (
                <div className="mt-3 p-3 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border text-xs text-space-textMuted leading-relaxed space-y-2">
                  <p>
                    <strong className="text-cyan-glow">The Teardrop Myth:</strong> In space, flames do not flicker or form a teardrop. Without buoyancy, soot particles have longer residence times, meaning microgravity flames can burn with little to no visible yellow soot at low oxygen levels.
                  </p>
                  <p>
                    <strong className="text-cyan-glow">NASA BASS-II Observation:</strong> Solid acrylic rods burn as rounded hemispherical flame caps with a blue leading edge oriented into the incoming forced airflow.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-cosmic-border flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-glow">
                NASA TM-20210011385 § 1.2
              </span>
              <button
                onClick={() => togglePhysics('buoyancy')}
                className="text-xs font-mono text-space-textMuted hover:text-cyan-glow flex items-center gap-1"
              >
                <span>{expandedPhysics === 'buoyancy' ? 'Less' : 'Learn More'}</span>
                {expandedPhysics === 'buoyancy' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </GlassCard>

          {/* Card 2: Ventilation */}
          <GlassCard glow="amber" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-amber-combustion uppercase tracking-wider px-2 py-0.5 rounded bg-amber-dim border border-amber-combustion/20">
                  Spacecraft Hazard
                </span>
                <span className="text-lg">💨</span>
              </div>
              <h3 className="font-semibold text-space-textMain text-sm">
                The Ventilation Airflow Paradox
              </h3>
              <p className="text-xs text-space-textMuted mt-2 leading-relaxed">
                In stagnant microgravity air, flames quickly suffocate on their own combustion products.
                However, gentle spacecraft ventilation airflow (1–15 cm/s) continuously feeds fresh oxygen,
                causing flames to propagate where Earth fires would self-extinguish.
              </p>

              {expandedPhysics === 'ventilation' && (
                <div className="mt-3 p-3 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border text-xs text-space-textMuted leading-relaxed space-y-2">
                  <p>
                    <strong className="text-amber-combustion">Critical Flammability Shift:</strong> Standard Earth flammability testing (NASA-STD-6001 Test 1) assumes upward natural convection (~30 cm/s). BASS-II proved that at slow airflows (~5 cm/s), radiative losses are minimized, allowing materials to burn at lower oxygen levels than on Earth.
                  </p>
                  <p>
                    <strong className="text-amber-combustion">Extinction Limits:</strong> As air speed drops to zero, radiative heat loss causes a "low-speed quench." Increasing airflow beyond a high limit blows the flame out ("blowoff extinction").
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-cosmic-border flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-combustion">
                NASA TM-20210011385 § 1.3
              </span>
              <button
                onClick={() => togglePhysics('ventilation')}
                className="text-xs font-mono text-space-textMuted hover:text-amber-combustion flex items-center gap-1"
              >
                <span>{expandedPhysics === 'ventilation' ? 'Less' : 'Learn More'}</span>
                {expandedPhysics === 'ventilation' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </GlassCard>

          {/* Card 3: Toxicity */}
          <GlassCard glow="none" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-space-green uppercase tracking-wider px-2 py-0.5 rounded bg-space-green/15 border border-space-green/20">
                  Atmospheric Safety
                </span>
                <span className="text-lg">⚠️</span>
              </div>
              <h3 className="font-semibold text-space-textMain text-sm">
                Toxic Carbon Monoxide Spikes
              </h3>
              <p className="text-xs text-space-textMuted mt-2 leading-relaxed">
                Oxygen-depleted burning produces severe spikes in Carbon Monoxide (reaching 300 to 950 ppm in the BASS-II chamber),
                creating severe toxic atmospheric poisoning hazards before significant thermal heat or smoke is detected.
              </p>

              {expandedPhysics === 'toxicity' && (
                <div className="mt-3 p-3 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border text-xs text-space-textMuted leading-relaxed space-y-2">
                  <p>
                    <strong className="text-space-green">Incomplete Combustion:</strong> Below 18% O₂, diffusion-controlled kinetics prevent CO from converting into harmless CO₂. Astronauts in a sealed spacecraft module face fatal CO concentrations within minutes if a smoldering fire goes undetected.
                  </p>
                  <p>
                    <strong className="text-space-green">Detection Challenge:</strong> Standard smoke detectors look for light scattering from soot. Dim blue microgravity flames generate virtually zero soot, making gas-phase CO and CO₂ monitors the only reliable early warning system.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-cosmic-border flex items-center justify-between">
              <span className="text-[11px] font-mono text-space-green">
                NASA TM-20210011385 § 1.4
              </span>
              <button
                onClick={() => togglePhysics('toxicity')}
                className="text-xs font-mono text-space-textMuted hover:text-space-green flex items-center gap-1"
              >
                <span>{expandedPhysics === 'toxicity' ? 'Less' : 'Learn More'}</span>
                {expandedPhysics === 'toxicity' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Core Platform Modules Navigation Hub */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-space-textMain tracking-wide flex items-center gap-2">
          <Activity size={18} className="text-cyan-glow" />
          <span>Research Console Modules</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: Explorer */}
          <GlassCard
            interactive
            onClick={() => navigate('/explorer')}
            className="group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-cyan-dim border border-cyan-glow/30 flex items-center justify-center text-cyan-glow mb-3 group-hover:scale-110 transition-transform">
                <Activity size={18} />
              </div>
              <h3 className="font-semibold text-space-textMain text-sm group-hover:text-cyan-glow transition-colors">
                Experiment Explorer
              </h3>
              <p className="text-xs text-space-textMuted mt-1 leading-relaxed">
                Filter and search all 126 verified ISS BASS-II flight runs across 6 fuel categories with live sorting and pagination.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-cosmic-border flex items-center justify-between text-xs text-cyan-glow font-mono">
              <span>Launch Explorer</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>

          {/* Module 2: Analytics */}
          <GlassCard
            interactive
            onClick={() => navigate('/analytics')}
            className="group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-amber-dim border border-amber-combustion/30 flex items-center justify-center text-amber-combustion mb-3 group-hover:scale-110 transition-transform">
                <Wind size={18} />
              </div>
              <h3 className="font-semibold text-space-textMain text-sm group-hover:text-amber-combustion transition-colors">
                Combustion Analytics
              </h3>
              <p className="text-xs text-space-textMuted mt-1 leading-relaxed">
                Explore the extinction boundary curve, stoichiometric gas correlation (r = 0.982), and toxic CO generation spikes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-cosmic-border flex items-center justify-between text-xs text-amber-combustion font-mono">
              <span>View Analytics</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>

          {/* Module 3: Deep-Dive */}
          <GlassCard
            interactive
            onClick={() => navigate('/deep-dive')}
            className="group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-cosmic-elevated border border-cosmic-border flex items-center justify-center text-space-textMain mb-3 group-hover:scale-110 transition-transform">
                <Shield size={18} />
              </div>
              <h3 className="font-semibold text-space-textMain text-sm group-hover:text-cyan-glow transition-colors">
                Test Deep-Dive
              </h3>
              <p className="text-xs text-space-textMuted mt-1 leading-relaxed">
                Inspect raw sensor gauges, calibrated O₂ deltas, and verbatim astronaut logs for any flight test.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-cosmic-border flex items-center justify-between text-xs text-space-textMuted group-hover:text-cyan-glow font-mono">
              <span>Inspect Telemetry</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>

          {/* Module 4: AI Assistant */}
          <GlassCard
            interactive
            onClick={() => navigate('/assistant')}
            className="group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-cyan-dim border border-cyan-glow/30 flex items-center justify-center text-cyan-glow mb-3 group-hover:scale-110 transition-transform">
                <Sparkles size={18} />
              </div>
              <h3 className="font-semibold text-space-textMain text-sm group-hover:text-cyan-glow transition-colors">
                AI Research Assistant
              </h3>
              <p className="text-xs text-space-textMuted mt-1 leading-relaxed">
                Ask combustion questions grounded in 318 indexed NASA report passages via Gemini LLM with exact PDF page citations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-cosmic-border flex items-center justify-between text-xs text-cyan-glow font-mono">
              <span>Open Assistant</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Official Citation & Scientific Provenance */}
      <div className="glass-panel rounded-xl p-5 border-cosmic-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cosmic-elevated text-cyan-glow">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-xs font-mono text-space-textMuted uppercase tracking-wider">
              Primary Scientific Source
            </div>
            <div className="text-sm font-semibold text-space-textMain">
              NASA Technical Memorandum TM-20210011385 • Physical Sciences Informatics (PSI-25)
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/inventory')}
          className="px-3.5 py-1.5 rounded-lg bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-xs font-mono text-cyan-glow hover:border-cyan-glow/40 transition-colors"
        >
          View Full Data Inventory
        </button>
      </div>
    </div>
  );
};
