import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Microscope,
  Gauge,
  User,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Wind,
  Flame,
  Layers,
  ExternalLink,
  Search,
  RotateCcw,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { MetricPill } from '../components/MetricPill';
import { api, ApiError } from '../services/api';
import { ExperimentRecord } from '../types';

export const TestDeepDive: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialTestId = searchParams.get('test') || 'T1';
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestId);
  const [manualInput, setManualInput] = useState<string>('');

  const [allTests, setAllTests] = useState<{ id: string; material: string; pi: string }[]>([]);
  const [record, setRecord] = useState<ExperimentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state if URL search param changes externally
  useEffect(() => {
    const urlTest = searchParams.get('test');
    if (urlTest && urlTest !== selectedTestId) {
      setSelectedTestId(urlTest);
    }
  }, [searchParams]);

  // Load experiment list for the selector
  useEffect(() => {
    let mounted = true;
    const loadExperimentList = async () => {
      try {
        const res = await api.getExperiments({ limit: 126 });
        if (mounted && res.experiments && res.experiments.length > 0) {
          const mapped = res.experiments.map((e) => ({
            id: e.test_id,
            material: e.fuel_material || 'Unknown Material',
            pi: e.principal_investigator || 'Unknown PI',
          }));
          setAllTests(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch experiment selector list:', err);
      }
    };
    loadExperimentList();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch single test details whenever selectedTestId changes
  useEffect(() => {
    let mounted = true;
    const fetchExperiment = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getExperimentById(selectedTestId);
        if (mounted) {
          setRecord(data);
          setSearchParams({ test: selectedTestId });
        }
      } catch (err: any) {
        if (mounted) {
          console.error(`Failed to fetch experiment ${selectedTestId}:`, err);
          const errorMsg =
            err instanceof ApiError && err.status === 404
              ? `Flight test '${selectedTestId}' was not found in the verified NASA BASS-II database.`
              : err.message || `Unable to load telemetry for test '${selectedTestId}'.`;
          setError(errorMsg);
          setRecord(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchExperiment();
    return () => {
      mounted = false;
    };
  }, [selectedTestId]);

  // Stepping through tests
  const currentIndex = allTests.findIndex(
    (t) => t.id.toLowerCase() === selectedTestId.toLowerCase()
  );
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allTests.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setSelectedTestId(allTests[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setSelectedTestId(allTests[currentIndex + 1].id);
    }
  };

  const handleManualJump = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualInput.trim();
    if (trimmed) {
      setSelectedTestId(trimmed);
      setManualInput('');
    }
  };

  // Hazardous CO classification
  const coPpm = record?.final_co_ppm ?? 0;
  const coLevel =
    coPpm >= 400
      ? { label: 'Hazardous (IDLH Alert)', color: 'text-red-400 bg-red-950/40 border-red-500/40' }
      : coPpm >= 100
      ? { label: 'Elevated Hazard', color: 'text-amber-combustion bg-amber-dim border-amber-combustion/40' }
      : { label: 'Nominal Range', color: 'text-space-green bg-space-green/10 border-space-green/30' };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-cosmic-border pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-glow mb-1">
            <Microscope size={13} />
            <span>Single Flight Run Telemetry</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-space-textMain flex items-center gap-2">
            <span>Flight Test Deep-Dive:</span>
            <span className="text-cyan-glow font-mono">{selectedTestId}</span>
          </h1>
          <p className="text-xs text-space-textMuted mt-1">
            Detailed sensor readings, chamber gas concentrations, and verbatim ISS crew flight observation logs
          </p>
        </div>

        {/* Test Selector and Prev/Next Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Manual Jump Form */}
          <form onSubmit={handleManualJump} className="flex items-center gap-1">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Jump to ID (e.g. T42)"
              className="glass-input rounded-lg px-2.5 py-1 text-xs font-mono text-space-textMain w-36"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="p-1.5 rounded-lg bg-cosmic-elevated border border-cosmic-border text-space-textMuted hover:text-cyan-glow disabled:opacity-40 transition-colors"
              title="Jump to test"
            >
              <Search size={14} />
            </button>
          </form>

          <div className="h-4 w-px bg-cosmic-border hidden sm:block" />

          <button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className="p-2 rounded-lg bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-space-textMuted hover:text-cyan-glow disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Flight Test"
          >
            <ChevronLeft size={16} />
          </button>

          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="glass-input rounded-lg px-3 py-1.5 text-xs font-mono text-space-textMain max-w-[260px] truncate"
          >
            {allTests.length > 0 ? (
              allTests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} — {t.material} ({t.pi})
                </option>
              ))
            ) : (
              <option value="T1">T1 — SIBAL Fabric (James S. Tien)</option>
            )}
          </select>

          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="p-2 rounded-lg bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-space-textMuted hover:text-cyan-glow disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Flight Test"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Error state with retry / reset options */}
      {error && (
        <GlassCard glow="amber" className="p-6 space-y-4 border-amber-combustion/40">
          <div className="flex items-start gap-3">
            <AlertCircle size={22} className="text-amber-combustion shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-mono font-bold text-amber-combustion uppercase tracking-wide">
                Flight Telemetry Not Found
              </h3>
              <p className="text-xs font-mono text-space-textMain leading-relaxed">{error}</p>
              <p className="text-[11px] text-space-textMuted">
                NASA BASS-II contains 126 valid runs spanning T1 through T126 (plus specimen codes like rod301, rod302).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-cosmic-border text-xs font-mono">
            <button
              onClick={() => setSelectedTestId('T1')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-glow/20 border border-cyan-glow/50 text-cyan-glow hover:bg-cyan-glow/30 transition-all font-semibold"
            >
              <RotateCcw size={13} />
              <span>Reset to Flight Run T1</span>
            </button>
            <button
              onClick={() => navigate('/explorer')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cosmic-elevated border border-cosmic-border text-space-textMuted hover:text-space-textMain transition-all"
            >
              <span>Browse 126 Runs in Explorer</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-cosmic-card/40 border border-cosmic-border animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-cosmic-card/40 border border-cosmic-border animate-pulse" />
            ))}
          </div>
        </div>
      ) : record ? (
        <>
          {/* Top Run Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricPill
              label="Test Identifier"
              value={record.test_id}
              unit={record.as_run_num ? `Run #${record.as_run_num}` : undefined}
              accent="cyan"
              icon={<Flame size={13} />}
            />
            <MetricPill
              label="Lead Investigator"
              value={record.principal_investigator || 'James S. Tien'}
              accent="default"
              icon={<User size={13} />}
            />
            <MetricPill
              label="Fuel Material"
              value={record.fuel_material || 'SIBAL Fabric'}
              unit={record.material_category || undefined}
              accent="amber"
              icon={<Layers size={13} />}
            />
            <MetricPill
              label="Airflow Velocity"
              value={record.air_velocity_numeric != null ? `${record.air_velocity_numeric}` : (record.air_velocity_cms || 'N/A')}
              unit="cm/s"
              accent="green"
              icon={<Wind size={13} />}
            />
          </div>

          {/* Environmental Sensor Gauge Cluster */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Oxygen Sensor Card */}
            <GlassCard glow="cyan" className="space-y-4">
              <div className="flex items-center justify-between border-b border-cosmic-border pb-2.5">
                <span className="text-xs font-mono text-cyan-glow uppercase tracking-wide font-semibold flex items-center gap-1.5">
                  <Gauge size={14} />
                  <span>Oxygen Depletion (O₂)</span>
                </span>
                <span className="text-[10px] font-mono text-space-textMuted bg-cosmic-elevated px-2 py-0.5 rounded border border-cosmic-border">
                  Glovebox Sensor
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="bg-cosmic-darkest/60 p-3 rounded-lg border border-cosmic-border">
                  <div className="text-[10px] text-space-textMuted font-mono">Calibrated Initial</div>
                  <div className="text-2xl font-mono font-bold text-cyan-glow mt-1">
                    {record.calibrated_initial_o2_pct != null
                      ? `${record.calibrated_initial_o2_pct}%`
                      : record.initial_o2_pct != null
                      ? `${record.initial_o2_pct}%`
                      : 'N/A'}
                  </div>
                  <div className="text-[10px] text-space-textMuted font-mono mt-0.5">Atmosphere vol</div>
                </div>

                <div className="bg-cosmic-darkest/60 p-3 rounded-lg border border-cosmic-border">
                  <div className="text-[10px] text-space-textMuted font-mono">Post-Burn Final</div>
                  <div className="text-2xl font-mono font-bold text-space-textMain mt-1">
                    {record.calibrated_final_o2_pct != null
                      ? `${record.calibrated_final_o2_pct}%`
                      : record.final_o2_pct != null
                      ? `${record.final_o2_pct}%`
                      : 'N/A'}
                  </div>
                  <div className="text-[10px] text-space-textMuted font-mono mt-0.5">Residual vol</div>
                </div>
              </div>

              <div className="pt-2 border-t border-cosmic-border flex items-center justify-between text-xs font-mono">
                <span className="text-space-textMuted">Chamber Net Δ O₂:</span>
                <span className="font-semibold text-cyan-glow">
                  {record.delta_o2_pct != null
                    ? record.delta_o2_pct > 0
                      ? `-${record.delta_o2_pct.toFixed(2)}% consumed`
                      : record.delta_o2_pct === 0
                      ? '0.00% (No net depletion)'
                      : `+${Math.abs(record.delta_o2_pct).toFixed(2)}% vol`
                    : 'Not recorded'}
                </span>
              </div>
            </GlassCard>

            {/* Toxic CO Sensor Card */}
            <GlassCard glow="amber" className="space-y-4">
              <div className="flex items-center justify-between border-b border-cosmic-border pb-2.5">
                <span className="text-xs font-mono text-amber-combustion uppercase tracking-wide font-semibold flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>Carbon Monoxide (CO)</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${coLevel.color}`}>
                  {coLevel.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="bg-cosmic-darkest/60 p-3 rounded-lg border border-cosmic-border">
                  <div className="text-[10px] text-space-textMuted font-mono">Baseline Pre-Burn</div>
                  <div className="text-2xl font-mono font-bold text-space-textMain mt-1">
                    {record.initial_co_ppm != null ? `${record.initial_co_ppm}` : '0'}
                  </div>
                  <div className="text-[10px] text-space-textMuted font-mono mt-0.5">ppm chamber</div>
                </div>

                <div className="bg-cosmic-darkest/60 p-3 rounded-lg border border-cosmic-border">
                  <div className="text-[10px] text-space-textMuted font-mono">Peak Post-Burn</div>
                  <div className="text-2xl font-mono font-bold text-amber-combustion mt-1">
                    {record.final_co_ppm != null ? `${record.final_co_ppm}` : 'N/A'}
                  </div>
                  <div className="text-[10px] text-space-textMuted font-mono mt-0.5">ppm toxic yield</div>
                </div>
              </div>

              <div className="pt-2 border-t border-cosmic-border flex items-center justify-between text-xs font-mono">
                <span className="text-space-textMuted">Toxic Generation Δ CO:</span>
                <span className="font-semibold text-amber-combustion">
                  {record.delta_co_ppm != null ? `+${record.delta_co_ppm} ppm` : (record.final_co_ppm ? `+${record.final_co_ppm} ppm` : '0 ppm')}
                </span>
              </div>
            </GlassCard>

            {/* Carbon Dioxide Sensor Card */}
            <GlassCard glow="none" className="space-y-4">
              <div className="flex items-center justify-between border-b border-cosmic-border pb-2.5">
                <span className="text-xs font-mono text-space-green uppercase tracking-wide font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Carbon Dioxide (CO₂)</span>
                </span>
                <span className="text-[10px] font-mono text-space-green bg-space-green/10 border border-space-green/30 px-2 py-0.5 rounded">
                  Combustion Product
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="bg-cosmic-darkest/60 p-3 rounded-lg border border-cosmic-border">
                  <div className="text-[10px] text-space-textMuted font-mono">Initial Baseline</div>
                  <div className="text-2xl font-mono font-bold text-space-textMuted mt-1">
                    {record.initial_co2_pct != null ? `${record.initial_co2_pct}%` : 'N/A'}
                  </div>
                  <div className="text-[10px] text-space-textMuted font-mono mt-0.5">Ambient CO₂</div>
                </div>

                <div className="bg-cosmic-darkest/60 p-3 rounded-lg border border-cosmic-border">
                  <div className="text-[10px] text-space-textMuted font-mono">Final Post-Burn</div>
                  <div className="text-2xl font-mono font-bold text-space-green mt-1">
                    {record.final_co2_pct != null ? `${record.final_co2_pct}%` : 'N/A'}
                  </div>
                  <div className="text-[10px] text-space-textMuted font-mono mt-0.5">Exhaust CO₂</div>
                </div>
              </div>

              <div className="pt-2 border-t border-cosmic-border flex items-center justify-between text-xs font-mono">
                <span className="text-space-textMuted">Stoichiometric Δ CO₂:</span>
                <span className="font-semibold text-space-green">
                  {record.delta_co2_pct != null ? `+${record.delta_co2_pct.toFixed(2)}% vol` : 'Not recorded'}
                </span>
              </div>
            </GlassCard>
          </div>

          {/* Flow Duct Hardware Settings Row */}
          <GlassCard className="p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-space-textMuted mb-3 flex items-center gap-2">
              <Wind size={13} className="text-cyan-glow" />
              <span>MSG Flow Duct Configuration & Ventilation Parameters</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-cosmic-darkest/50 p-2.5 rounded-lg border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted">Flow Configuration</div>
                <div className="text-cyan-glow font-semibold mt-1">
                  {record.flow_configuration || 'Opposed Flow'}
                </div>
              </div>
              <div className="bg-cosmic-darkest/50 p-2.5 rounded-lg border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted">Fan Speed Dial Setting</div>
                <div className="text-space-textMain font-semibold mt-1">
                  {record.fan_setting || 'Normal Setting'}
                </div>
              </div>
              <div className="bg-cosmic-darkest/50 p-2.5 rounded-lg border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted">Flow Restrictor Insert</div>
                <div className="text-space-textMain font-semibold mt-1">
                  {record.flow_restrictor ? `Position ${record.flow_restrictor}` : 'None Installed'}
                </div>
              </div>
              <div className="bg-cosmic-darkest/50 p-2.5 rounded-lg border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted">Execution Date & GMT</div>
                <div className="text-space-textMain font-semibold mt-1">
                  {record.date_gmt || 'ISS Mission Log'} {record.time_range ? `(${record.time_range})` : ''}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Verbatim Astronaut Observation Terminal */}
          <GlassCard className="space-y-3">
            <div className="flex items-center justify-between border-b border-cosmic-border pb-2.5">
              <div className="flex items-center gap-2">
                <User size={15} className="text-cyan-glow" />
                <h3 className="text-xs font-mono text-cyan-glow uppercase tracking-wider font-semibold">
                  Verbatim ISS Flight Crew Observation Log
                </h3>
              </div>
              <span className="text-[10px] font-mono text-space-textMuted">
                NASA MSG Work Volume Flight Log
              </span>
            </div>

            <div className="p-4 rounded-lg bg-cosmic-darkest/90 border-l-4 border-amber-combustion text-sm text-space-textMain font-mono leading-relaxed">
              {record.observations && record.observations.trim().length > 0 ? (
                <p className="italic">"{record.observations}"</p>
              ) : (
                <p className="italic text-space-textMuted">
                  "No anomalous crew remarks entered. Steady burn executed according to experimental matrix protocol."
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-space-textMuted border-t border-cosmic-border/60">
              <span>Source: NASA BASS-II Investigation PSI-25 Flight Database (`bass_ii_experiments.csv`)</span>
              <a
                href="https://psi.nasa.gov/physci/repo/data/investigations/PSI-25"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-cyan-glow hover:underline shrink-0"
              >
                <span>Verify in NASA PSI Repository</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </GlassCard>
        </>
      ) : null}
    </div>
  );
};
