import React, { useEffect, useState } from 'react';
import {
  Flame,
  Search,
  RotateCcw,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  Gauge,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { LoadingSpinner, ErrorCard } from '../components/StateViews';
import { api } from '../services/api';
import {
  FlexResultRecord,
  FlexResultSummaryResponse,
  FlexResultAnalyticsResponse,
} from '../types';

export const FlexResultsExplorer: React.FC = () => {
  // Main Data States
  const [summary, setSummary] = useState<FlexResultSummaryResponse | null>(null);
  const [analytics, setAnalytics] = useState<FlexResultAnalyticsResponse | null>(null);
  const [records, setRecords] = useState<FlexResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab State: 'records' | 'analytics' | 'quality'
  const [activeTab, setActiveTab] = useState<'records' | 'analytics' | 'quality'>('records');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [minPressure, setMinPressure] = useState<string>('');
  const [maxPressure, setMaxPressure] = useState<string>('');
  const [minO2, setMinO2] = useState<string>('');
  const [maxO2, setMaxO2] = useState<string>('');
  const [minRate, setMinRate] = useState<string>('');
  const [maxRate, setMaxRate] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);

  // Detail Modal State
  const [inspectRecord, setInspectRecord] = useState<FlexResultRecord | null>(null);
  const [showExcludedModal, setShowExcludedModal] = useState(false);

  // Load summary and analytics once on mount
  useEffect(() => {
    Promise.all([api.getFlexResultsSummary(), api.getFlexResultsAnalytics()])
      .then(([sumData, anaData]) => {
        setSummary(sumData);
        setAnalytics(anaData);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Failed to load FLEX experimental results:', err);
        setError(err.message || 'Unable to connect to FLEX Results API');
        setLoading(false);
      });
  }, []);

  // Fetch paginated table records on filter or page change
  useEffect(() => {
    let mounted = true;
    setTableLoading(true);

    api
      .getFlexResultsRecords({
        page: currentPage,
        limit,
        fuel: selectedFuel || undefined,
        outcome: selectedOutcome || undefined,
        min_pressure_mmhg: minPressure ? parseFloat(minPressure) : undefined,
        max_pressure_mmhg: maxPressure ? parseFloat(maxPressure) : undefined,
        min_o2: minO2 ? parseFloat(minO2) : undefined,
        max_o2: maxO2 ? parseFloat(maxO2) : undefined,
        min_burning_rate: minRate ? parseFloat(minRate) : undefined,
        max_burning_rate: maxRate ? parseFloat(maxRate) : undefined,
        search: searchTerm.trim() || undefined,
      })
      .then((data) => {
        if (mounted) {
          setRecords(data.records);
          setTotalRecords(data.total);
          setTableLoading(false);
        }
      })
      .catch((err: any) => {
        if (mounted) {
          console.error('Error fetching FLEX flight records:', err);
          setTableLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [
    currentPage,
    limit,
    selectedFuel,
    selectedOutcome,
    minPressure,
    maxPressure,
    minO2,
    maxO2,
    minRate,
    maxRate,
    searchTerm,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedFuel('');
    setSelectedOutcome('');
    setMinPressure('');
    setMaxPressure('');
    setMinO2('');
    setMaxO2('');
    setMinRate('');
    setMaxRate('');
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

  // Color mapping helper for test outcomes
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'Extinction':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 size={11} /> Extinction
          </span>
        );
      case 'Disruption':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <AlertTriangle size={11} /> Disruption
          </span>
        );
      case 'Completion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Sparkles size={11} /> Completion
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-cosmic-elevated text-space-textMuted border border-cosmic-border">
            {outcome}
          </span>
        );
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading NASA PSI-69 FLEX flight results..." />;
  }

  if (error || !summary) {
    return (
      <ErrorCard
        title="Failed to Load FLEX Results"
        message={error || 'No summary data available from FastAPI backend.'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cosmic-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono text-cyan-glow uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-glow/10 border border-cyan-glow/20">
              NASA PSI-69 • As-Run Flight Results
            </span>
            <span className="text-[11px] font-mono text-amber-combustion uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-combustion/10 border border-amber-combustion/20">
              Droplet Combustion (CIR / ISS)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-space-textMain flex items-center gap-3">
            <Flame className="text-amber-combustion animate-pulse" size={28} />
            FLEX Experimental Results Explorer
          </h1>
          <p className="text-sm text-space-textMuted mt-1 max-w-3xl">
            Explore 274 verified microgravity liquid droplet combustion flight records from NASA Physical Sciences
            Informatics (PSI-69). Inspect as-run chamber pressures, burning rates, droplet diameters, and flame extinction
            outcomes.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-cosmic-elevated/70 p-1 rounded-xl border border-cosmic-border shrink-0">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'records'
                ? 'bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/40 shadow-glow-cyan/30'
                : 'text-space-textMuted hover:text-space-textMain'
            }`}
          >
            Flight Records Table
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-glow/20 text-cyan-glow border border-cyan-glow/40 shadow-glow-cyan/30'
                : 'text-space-textMuted hover:text-space-textMain'
            }`}
          >
            Combustion Analytics
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'quality'
                ? 'bg-amber-combustion/20 text-amber-combustion border border-amber-combustion/40 shadow-glow-amber/30'
                : 'text-space-textMuted hover:text-space-textMain'
            }`}
          >
            Data Quality & Notices
          </button>
        </div>
      </div>

      {/* Scientific Transparency & Count Notice Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cosmic-elevated/90 to-cosmic-surface/90 border border-cyan-glow/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <Info className="text-cyan-glow shrink-0 mt-0.5" size={18} />
          <div>
            <span className="font-semibold text-space-textMain">Authentic Dataset Notice: </span>
            <span className="text-space-textMuted">
              This explorer presents <strong>274 flight experimental records</strong> locally available in NASA PSI-69.
              The difference between the 274 local records, 275 web catalog entries, and 284 tests described in technical
              paper NTRS 20150023456 remains an <strong>unresolved count discrepancy</strong> due to absence of backend server logs.
              Missing values reflect unavailable measurements, never zero measurements.
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('quality')}
          className="text-[11px] font-mono text-cyan-glow hover:underline shrink-0 font-medium"
        >
          View Quality Audit &rarr;
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <GlassCard className="p-3.5 text-center">
          <p className="text-[11px] font-mono text-space-textMuted uppercase tracking-wider">Flight Tests</p>
          <p className="text-2xl font-bold font-display text-cyan-glow mt-1">{summary.total_flight_records}</p>
          <p className="text-[10px] text-space-textMuted mt-0.5">2009–2011 ISS</p>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <p className="text-[11px] font-mono text-space-textMuted uppercase tracking-wider">Extinctions</p>
          <p className="text-2xl font-bold font-display text-emerald-400 mt-1">{summary.outcome_counts['Extinction'] || 0}</p>
          <p className="text-[10px] text-space-textMuted mt-0.5">67.9% of tests</p>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <p className="text-[11px] font-mono text-space-textMuted uppercase tracking-wider">Disruptions</p>
          <p className="text-2xl font-bold font-display text-amber-combustion mt-1">{summary.outcome_counts['Disruption'] || 0}</p>
          <p className="text-[10px] text-space-textMuted mt-0.5">22.3% of tests</p>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <p className="text-[11px] font-mono text-space-textMuted uppercase tracking-wider">Completions</p>
          <p className="text-2xl font-bold font-display text-blue-400 mt-1">{summary.outcome_counts['Completion'] || 0}</p>
          <p className="text-[10px] text-space-textMuted mt-0.5">9.9% of tests</p>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <p className="text-[11px] font-mono text-space-textMuted uppercase tracking-wider">Methanol / Heptane</p>
          <p className="text-xl font-bold font-display text-space-textMain mt-1">157 / 117</p>
          <p className="text-[10px] text-space-textMuted mt-0.5">Tested droplet fuels</p>
        </GlassCard>

        <GlassCard className="p-3.5 text-center">
          <p className="text-[11px] font-mono text-space-textMuted uppercase tracking-wider">Mean Burning Rate</p>
          <p className="text-2xl font-bold font-display text-purple-400 mt-1">
            {summary.mean_burning_rate_mm2_s ? `${summary.mean_burning_rate_mm2_s}` : '—'}
          </p>
          <p className="text-[10px] text-space-textMuted mt-0.5">mm²/s (d²-law K)</p>
        </GlassCard>
      </div>

      {/* TAB 1: FLIGHT RECORDS TABLE */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <GlassCard className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 text-space-textMuted" size={16} />
                <input
                  type="text"
                  placeholder="Search test #, identifier, fuel, outcome, date..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-cosmic-darkest/70 border border-cosmic-border rounded-lg text-xs text-space-textMain placeholder-space-textMuted focus:outline-none focus:border-cyan-glow/50"
                />
              </div>

              {/* Filter Selectors */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedFuel}
                  onChange={(e) => {
                    setSelectedFuel(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-cosmic-darkest/70 border border-cosmic-border rounded-lg text-xs text-space-textMain focus:outline-none focus:border-cyan-glow/50"
                >
                  <option value="">All Fuels (274)</option>
                  <option value="Methanol">Methanol (157)</option>
                  <option value="Heptane">Heptane (117)</option>
                </select>

                <select
                  value={selectedOutcome}
                  onChange={(e) => {
                    setSelectedOutcome(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-cosmic-darkest/70 border border-cosmic-border rounded-lg text-xs text-space-textMain focus:outline-none focus:border-cyan-glow/50"
                >
                  <option value="">All Outcomes</option>
                  <option value="Extinction">Extinction (186)</option>
                  <option value="Disruption">Disruption (61)</option>
                  <option value="Completion">Completion (27)</option>
                </select>

                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-lg bg-cosmic-elevated/60 hover:bg-cosmic-elevated border border-cosmic-border text-xs text-space-textMuted hover:text-space-textMain flex items-center gap-1.5 transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
              </div>
            </div>

            {/* Numerical Filters Row */}
            <div className="pt-2 border-t border-cosmic-border/50 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-space-textMuted text-[11px] shrink-0">Pressure (mmHg):</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPressure}
                  onChange={(e) => {
                    setMinPressure(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-16 px-1.5 py-1 bg-cosmic-darkest/80 border border-cosmic-border rounded text-[11px]"
                />
                <span className="text-space-textMuted">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPressure}
                  onChange={(e) => {
                    setMaxPressure(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-16 px-1.5 py-1 bg-cosmic-darkest/80 border border-cosmic-border rounded text-[11px]"
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-space-textMuted text-[11px] shrink-0">Oxygen (XO₂):</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.12"
                  value={minO2}
                  onChange={(e) => {
                    setMinO2(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-16 px-1.5 py-1 bg-cosmic-darkest/80 border border-cosmic-border rounded text-[11px]"
                />
                <span className="text-space-textMuted">–</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.35"
                  value={maxO2}
                  onChange={(e) => {
                    setMaxO2(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-16 px-1.5 py-1 bg-cosmic-darkest/80 border border-cosmic-border rounded text-[11px]"
                />
              </div>

              <div className="flex items-center gap-1">
                <span className="text-space-textMuted text-[11px] shrink-0">Rate (mm²/s):</span>
                <input
                  type="number"
                  step="0.05"
                  placeholder="0.05"
                  value={minRate}
                  onChange={(e) => {
                    setMinRate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-16 px-1.5 py-1 bg-cosmic-darkest/80 border border-cosmic-border rounded text-[11px]"
                />
                <span className="text-space-textMuted">–</span>
                <input
                  type="number"
                  step="0.05"
                  placeholder="1.10"
                  value={maxRate}
                  onChange={(e) => {
                    setMaxRate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-16 px-1.5 py-1 bg-cosmic-darkest/80 border border-cosmic-border rounded text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end text-[11px] text-space-textMuted">
                <span>Showing {records.length} of {totalRecords} records</span>
              </div>
            </div>
          </GlassCard>

          {/* Table Container */}
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cosmic-darkest/70 text-space-textMuted font-mono uppercase text-[10px] tracking-wider border-b border-cosmic-border">
                  <tr>
                    <th className="py-3 px-3">Test #</th>
                    <th className="py-3 px-3">Identifier</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Fuel</th>
                    <th className="py-3 px-3">Pressure (mmHg)</th>
                    <th className="py-3 px-3">Atm (derived)</th>
                    <th className="py-3 px-3">Gas (XO₂ / XN₂ / XCO₂)</th>
                    <th className="py-3 px-3">Initial d₀ (mm)</th>
                    <th className="py-3 px-3">Rate K (mm²/s)</th>
                    <th className="py-3 px-3">Burn Time (s)</th>
                    <th className="py-3 px-3">Outcome</th>
                    <th className="py-3 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-border/50">
                  {tableLoading ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-space-textMuted">
                        <LoadingSpinner message="Filtering flight records..." />
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-space-textMuted">
                        No FLEX flight records match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => {
                      const isAnomaly = r.has_pressure_warning;
                      return (
                        <tr
                          key={r.flex_test_num}
                          className={`hover:bg-cosmic-elevated/40 transition-colors ${
                            isAnomaly ? 'bg-amber-950/20 border-l-2 border-l-amber-500' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-cyan-glow">
                            #{r.flex_test_num}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-medium text-space-textMain">
                            {r.flex_identifier}
                          </td>
                          <td className="py-2.5 px-3 text-space-textMuted text-[11px] whitespace-nowrap">
                            {r.test_date}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                r.fuel === 'Methanol'
                                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              }`}
                            >
                              {r.fuel}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold">
                            {isAnomaly ? (
                              <span
                                className="inline-flex items-center gap-1 text-amber-400 font-bold"
                                title={r.pressure_warning_detail || 'Zero pressure anomaly'}
                              >
                                <AlertTriangle size={13} className="text-amber-400 animate-pulse" />
                                0.0 mmHg
                              </span>
                            ) : (
                              `${r.ambient_pressure_mmhg.toFixed(1)}`
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-space-textMuted text-[11px]">
                            {r.ambient_pressure_atm.toFixed(3)}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-space-textMuted">
                            {r.initial_o2_mole_fraction.toFixed(2)} / {r.initial_n2_mole_fraction.toFixed(2)} /{' '}
                            {r.initial_co2_mole_fraction.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {r.droplet_initial_diameter_mm !== null && r.droplet_initial_diameter_mm !== undefined ? (
                              `${r.droplet_initial_diameter_mm.toFixed(2)}`
                            ) : (
                              <span className="text-space-textMuted/50 font-normal italic">Unavailable</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-space-textMain">
                            {r.burning_rate_mm2_s !== null && r.burning_rate_mm2_s !== undefined ? (
                              `${r.burning_rate_mm2_s.toFixed(2)}`
                            ) : (
                              <span className="text-space-textMuted/50 font-normal italic">Unavailable</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            {r.burn_time_s !== null && r.burn_time_s !== undefined ? (
                              `${r.burn_time_s.toFixed(1)}s`
                            ) : (
                              <span className="text-space-textMuted/50 font-normal italic">Unavailable</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">{getOutcomeBadge(r.test_end_outcome)}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setInspectRecord(r)}
                              className="px-2 py-1 rounded bg-cosmic-elevated/80 hover:bg-cyan-glow/20 border border-cosmic-border hover:border-cyan-glow/40 text-[11px] font-medium text-cyan-glow transition-all"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-cosmic-border bg-cosmic-darkest/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-space-textMuted">
                <span>Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-cosmic-elevated border border-cosmic-border rounded text-xs text-space-textMain"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>
                  Page {currentPage} of {totalPages} ({totalRecords} records)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded bg-cosmic-elevated border border-cosmic-border text-space-textMuted hover:text-space-textMain disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2 font-mono text-[11px] text-cyan-glow font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded bg-cosmic-elevated border border-cosmic-border text-space-textMuted hover:text-space-textMain disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 2: COMBUSTION ANALYTICS & REGRESSION */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Pressure vs Burning Rate Analysis */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-cosmic-border pb-3">
              <div>
                <h2 className="text-lg font-bold font-display text-space-textMain flex items-center gap-2">
                  <TrendingUp className="text-cyan-glow" size={20} />
                  Pressure versus Burning Rate Analysis (d²-law Constant K)
                </h2>
                <p className="text-xs text-space-textMuted mt-0.5">
                  Assessing the classical microgravity pressure dependence: K (mm²/s) as a function of chamber pressure P (mmHg).
                </p>
              </div>

              {/* Exclusion Summary Callout */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                  ✓ {analytics.pressure_vs_burning_rate.total_valid} Valid Points Included
                </span>
                <button
                  onClick={() => setShowExcludedModal(true)}
                  className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
                >
                  <ShieldAlert size={14} />
                  {analytics.pressure_vs_burning_rate.total_excluded} Excluded (View Details)
                </button>
              </div>
            </div>

            {/* Regression Metrics Grid */}
            {analytics.pressure_vs_burning_rate.regression && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border text-xs">
                <div>
                  <span className="text-space-textMuted text-[10px] uppercase font-mono">Fitted Equation</span>
                  <p className="font-mono font-bold text-cyan-glow mt-0.5">
                    {analytics.pressure_vs_burning_rate.regression.equation}
                  </p>
                </div>
                <div>
                  <span className="text-space-textMuted text-[10px] uppercase font-mono">Correlation (R²)</span>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">
                    {analytics.pressure_vs_burning_rate.regression.r_squared} (Pearson r = {analytics.pressure_vs_burning_rate.regression.pearson_r})
                  </p>
                </div>
                <div>
                  <span className="text-space-textMuted text-[10px] uppercase font-mono">Slope</span>
                  <p className="font-mono font-bold text-space-textMain mt-0.5">
                    {analytics.pressure_vs_burning_rate.regression.slope} mm²/(s·mmHg)
                  </p>
                </div>
                <div>
                  <span className="text-space-textMuted text-[10px] uppercase font-mono">Excluded Zero Pressure</span>
                  <p className="font-mono font-bold text-amber-400 mt-0.5">
                    Test #114 (C11M201) excluded
                  </p>
                </div>
              </div>
            )}

            {/* Scatter Chart */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252b42" />
                  <XAxis
                    type="number"
                    dataKey="ambient_pressure_mmhg"
                    name="Chamber Pressure"
                    unit=" mmHg"
                    stroke="#8c9fc2"
                    fontSize={11}
                    domain={['dataMin - 50', 'dataMax + 50']}
                  />
                  <YAxis
                    type="number"
                    dataKey="burning_rate_mm2_s"
                    name="Burning Rate"
                    unit=" mm²/s"
                    stroke="#8c9fc2"
                    fontSize={11}
                    domain={[0, 1.2]}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-cosmic-darkest border border-cyan-glow/40 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold text-cyan-glow">
                            Test #{data.flex_test_num} ({data.flex_identifier})
                          </p>
                          <p className="text-space-textMuted">Fuel: <span className="text-space-textMain">{data.fuel}</span></p>
                          <p className="text-space-textMuted">Pressure: <span className="font-mono text-space-textMain">{data.ambient_pressure_mmhg} mmHg</span> ({data.ambient_pressure_atm} atm derived)</p>
                          <p className="text-space-textMuted">Burning Rate (K): <span className="font-mono text-amber-combustion font-bold">{data.burning_rate_mm2_s} mm²/s</span></p>
                          <p className="text-space-textMuted">Outcome: <span className="font-mono text-space-textMain">{data.outcome}</span></p>
                        </div>
                      );
                    }}
                  />
                  <Scatter
                    name="Methanol Droplets"
                    data={analytics.pressure_vs_burning_rate.valid_points.filter((p) => p.fuel === 'Methanol')}
                    fill="#38bdf8"
                  />
                  <Scatter
                    name="Heptane Droplets"
                    data={analytics.pressure_vs_burning_rate.valid_points.filter((p) => p.fuel === 'Heptane')}
                    fill="#34d399"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Two-column Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Outcomes by Fuel */}
            <GlassCard className="p-5 space-y-3">
              <h3 className="text-sm font-bold font-display text-space-textMain flex items-center gap-2">
                <Activity size={17} className="text-cyan-glow" />
                Combustion Outcomes by Fuel (Methanol vs. Heptane)
              </h3>
              <p className="text-xs text-space-textMuted">
                Comparison of Extinction, Disruption (droplet shattering), and Completion (droplet consumed).
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.outcome_by_fuel} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252b42" />
                    <XAxis dataKey="fuel" stroke="#8c9fc2" fontSize={12} />
                    <YAxis stroke="#8c9fc2" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#252b42', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Extinction" fill="#10b981" name="Extinction" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Disruption" fill="#f59e0b" name="Disruption" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Completion" fill="#06b6d4" name="Completion" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Chart: Burning Rate Distribution */}
            <GlassCard className="p-5 space-y-3">
              <h3 className="text-sm font-bold font-display text-space-textMain flex items-center gap-2">
                <Gauge size={17} className="text-amber-combustion" />
                Burning Rate Distribution (mm²/s)
              </h3>
              <p className="text-xs text-space-textMuted">
                Frequency distribution of measured droplet burning rate constants (K).
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.burning_rate_distribution} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252b42" />
                    <XAxis dataKey="bin" stroke="#8c9fc2" fontSize={11} />
                    <YAxis stroke="#8c9fc2" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#252b42', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {analytics.burning_rate_distribution.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 2 ? '#38bdf8' : index === 3 ? '#a855f7' : '#6366f1'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Droplet Initial Diameter vs Burn Time Chart */}
          <GlassCard className="p-5 space-y-3">
            <h3 className="text-sm font-bold font-display text-space-textMain flex items-center gap-2">
              <Sparkles size={17} className="text-emerald-400" />
              Droplet Initial Diameter (d₀) versus Burn Time (s)
            </h3>
            <p className="text-xs text-space-textMuted">
              Demonstrating the d²-law proportionality: larger droplets sustain longer burning duration before extinction or disruption.
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252b42" />
                  <XAxis
                    type="number"
                    dataKey="initial_diameter_mm"
                    name="Initial Diameter"
                    unit=" mm"
                    stroke="#8c9fc2"
                    fontSize={11}
                    domain={['dataMin - 0.2', 'dataMax + 0.2']}
                  />
                  <YAxis
                    type="number"
                    dataKey="burn_time_s"
                    name="Burn Time"
                    unit=" s"
                    stroke="#8c9fc2"
                    fontSize={11}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-cosmic-darkest border border-emerald-500/40 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold text-emerald-400">
                            Test #{data.flex_test_num} ({data.flex_identifier})
                          </p>
                          <p className="text-space-textMuted">Fuel: <span className="text-space-textMain">{data.fuel}</span></p>
                          <p className="text-space-textMuted">Initial Diameter (d₀): <span className="font-mono text-space-textMain">{data.initial_diameter_mm} mm</span></p>
                          <p className="text-space-textMuted">Burn Time: <span className="font-mono text-cyan-glow font-bold">{data.burn_time_s} s</span></p>
                          <p className="text-space-textMuted">Outcome: <span className="font-mono text-space-textMain">{data.outcome}</span></p>
                        </div>
                      );
                    }}
                  />
                  <Scatter
                    name="Droplet Burn Points"
                    data={analytics.diameter_vs_burn_time}
                    fill="#10b981"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: DATA QUALITY & PROVENANCE AUDIT */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          {/* Card: Test #114 Anomaly Deep Dive */}
          <GlassCard className="p-5 border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-base">
              <AlertTriangle size={20} />
              <span>Data Quality Finding: Test #114 Zero Ambient Pressure</span>
            </div>
            <p className="text-xs text-space-textMain leading-relaxed">
              In the raw NASA PSI-69 data table, <strong>FLEX Test #114</strong> (Identifier <code>C11M201</code>, conducted on 9/6/2010 with Methanol)
              contains an ambient pressure of <strong>0.0 mmHg</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-cosmic-darkest/80 border border-cosmic-border text-xs">
              <div>
                <h4 className="font-semibold text-space-textMain mb-1">Physical Reality & Verification:</h4>
                <ul className="list-disc list-inside space-y-1 text-space-textMuted text-[11px]">
                  <li>Methanol has a room-temperature vapor pressure of 97–130 mmHg.</li>
                  <li>In a vacuum (0 mmHg), a liquid droplet would immediately flash vaporize or boil violently.</li>
                  <li>The test recorded an 18.9s burn duration, d₀ = 3.23 mm, and K = 0.42 mm²/s, which requires a pressurized chamber.</li>
                  <li>The gas mole fractions are XO₂ = 0.20, XN₂ = 0.45, XCO₂ = 0.35 (physically meaningless in vacuum).</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-space-textMain mb-1">Provenance & Handling:</h4>
                <ul className="list-disc list-inside space-y-1 text-space-textMuted text-[11px]">
                  <li>Raw CSV line 115 contains the character <code>'0'</code>; our script did not convert a missing marker into zero.</li>
                  <li>All surrounding C11 series tests (Tests #113, 115–118) measured between <strong>531.1 and 536.3 mmHg (~0.70 atm)</strong>.</li>
                  <li>To prevent fabricating measurements, the original <code>0.0</code> value is preserved without alteration.</li>
                  <li>Test #114 is automatically excluded from physical pressure regressions and flagged in the table.</li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Card: Unresolved Record Count Discrepancies */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="text-base font-bold font-display text-space-textMain flex items-center gap-2">
              <Info className="text-cyan-glow" size={19} />
              Record Count Reconciliation (274 vs. 275 vs. 284)
            </h3>
            <p className="text-xs text-space-textMuted">
              Detailed breakdown of why three different numbers appear in NASA project documentation and why this remains unresolved:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                <span className="font-mono text-cyan-glow font-bold text-sm">274 Data Rows</span>
                <p className="text-space-textMuted mt-1">
                  The actual number of data rows in <code>PSI-69_Experimental table_FLEX.csv</code> on disk. Sequence numbers run continuously from 1 to 274.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                <span className="font-mono text-amber-combustion font-bold text-sm">275 Portal Entries</span>
                <p className="text-space-textMuted mt-1">
                  Reported on the NASA PSI web portal. The local CSV file has 275 total physical lines (1 header + 274 data rows). Without access to server code, this is documented as an unverified catalog display convention.
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                <span className="font-mono text-purple-400 font-bold text-sm">284 Paper Tests</span>
                <p className="text-space-textMuted mt-1">
                  Mentioned in technical report NTRS 20150023456 by Dietrich et al. Because full-text flight logs for tests 275–284 are not available locally, claims that 10 tests were aborted cannot be proven and remain unresolved.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Card: Missing Values Audit Summary */}
          <GlassCard className="p-5 space-y-3">
            <h3 className="text-base font-bold font-display text-space-textMain flex items-center gap-2">
              <FileSpreadsheet className="text-blue-400" size={19} />
              Missing Measurement Audit Across the 274 Tests
            </h3>
            <p className="text-xs text-space-textMuted">
              In spaceflight droplet combustion, non-measurements must be preserved as true nulls (NaN) rather than replaced by zero:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border">
                <p className="text-space-textMuted text-[10px]">Initial Diameter (d₀)</p>
                <p className="text-lg font-bold font-mono text-space-textMain mt-1">{summary.missing_field_counts.droplet_initial_diameter_mm} nulls</p>
                <p className="text-[10px] text-space-textMuted">4.4% missing</p>
              </div>
              <div className="p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border">
                <p className="text-space-textMuted text-[10px]">Extinction Diameter</p>
                <p className="text-lg font-bold font-mono text-space-textMain mt-1">{summary.missing_field_counts.visible_flame_extinction_diameter_mm} nulls</p>
                <p className="text-[10px] text-space-textMuted">28.1% missing</p>
              </div>
              <div className="p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border">
                <p className="text-space-textMuted text-[10px]">Burning Rate (K)</p>
                <p className="text-lg font-bold font-mono text-space-textMain mt-1">{summary.missing_field_counts.burning_rate_mm2_s} nulls</p>
                <p className="text-[10px] text-space-textMuted">5.8% missing</p>
              </div>
              <div className="p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border">
                <p className="text-space-textMuted text-[10px]">Burn Time</p>
                <p className="text-lg font-bold font-mono text-space-textMain mt-1">{summary.missing_field_counts.burn_time_s} nulls</p>
                <p className="text-[10px] text-space-textMuted">2.2% missing</p>
              </div>
              <div className="p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border">
                <p className="text-space-textMuted text-[10px]">Test GMT</p>
                <p className="text-lg font-bold font-mono text-space-textMain mt-1">{summary.missing_field_counts.test_gmt} null</p>
                <p className="text-[10px] text-space-textMuted">Test #9 unrecorded</p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* RECORD DETAIL INSPECT MODAL */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-cosmic-surface border border-cosmic-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-cosmic-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-glow/20 border border-cyan-glow/30 text-cyan-glow font-bold">
                    FLEX Test #{inspectRecord.flex_test_num}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-cosmic-elevated text-space-textMuted border border-cosmic-border">
                    {inspectRecord.flex_identifier}
                  </span>
                  {getOutcomeBadge(inspectRecord.test_end_outcome)}
                </div>
                <h3 className="text-lg font-display font-bold text-space-textMain mt-1">
                  Flight Test Details & Environmental Measurements
                </h3>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="p-1 rounded-lg text-space-textMuted hover:text-space-textMain hover:bg-cosmic-elevated transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Test #114 Alert Banner inside Modal */}
            {inspectRecord.has_pressure_warning && (
              <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <AlertTriangle size={16} />
                  <span>Upstream Sensor / Data Entry Warning</span>
                </div>
                <p className="leading-relaxed">
                  {inspectRecord.pressure_warning_detail}
                </p>
                <p className="text-[11px] text-amber-300/80">
                  Surrounding nominal condition: ~534 mmHg (0.70 atm). The authentic 0.0 value is preserved in the CSV dataset.
                </p>
              </div>
            )}

            {/* Test Conditions Grid */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-space-textMuted mb-2">
                1. Test Conditions & Chamber Atmosphere
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Test Date & Time</span>
                  <p className="font-mono font-medium text-space-textMain mt-0.5">
                    {inspectRecord.test_date} {inspectRecord.test_gmt ? `at ${inspectRecord.test_gmt} GMT` : '(GMT unrecorded)'}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Fuel Formulation</span>
                  <p className="font-mono font-bold text-space-textMain mt-0.5">{inspectRecord.fuel}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Chamber Pressure</span>
                  <p className="font-mono font-bold text-cyan-glow mt-0.5">
                    {inspectRecord.ambient_pressure_mmhg.toFixed(1)} mmHg
                  </p>
                  <p className="text-[10px] text-space-textMuted">{inspectRecord.ambient_pressure_atm.toFixed(3)} atm (derived)</p>
                </div>
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Oxygen Fraction (XO₂)</span>
                  <p className="font-mono font-semibold text-space-textMain mt-0.5">
                    {(inspectRecord.initial_o2_mole_fraction * 100).toFixed(1)}% ({inspectRecord.initial_o2_mole_fraction})
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Nitrogen Diluent (XN₂)</span>
                  <p className="font-mono font-semibold text-space-textMain mt-0.5">
                    {(inspectRecord.initial_n2_mole_fraction * 100).toFixed(1)}% ({inspectRecord.initial_n2_mole_fraction})
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Suppressant (XCO₂ / XHe)</span>
                  <p className="font-mono font-semibold text-space-textMain mt-0.5">
                    CO₂: {(inspectRecord.initial_co2_mole_fraction * 100).toFixed(1)}% | He: {(inspectRecord.initial_he_mole_fraction * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Measured Combustion Results Grid */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-space-textMuted mb-2">
                2. Measured Combustion Results
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Initial Diameter (d₀)</span>
                  <p className="font-mono font-bold text-space-textMain mt-0.5">
                    {inspectRecord.droplet_initial_diameter_mm !== null && inspectRecord.droplet_initial_diameter_mm !== undefined ? (
                      `${inspectRecord.droplet_initial_diameter_mm.toFixed(2)} mm`
                    ) : (
                      <span className="text-amber-400 font-normal italic">Measurement Unavailable</span>
                    )}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Extinction Diameter</span>
                  <p className="font-mono font-bold text-space-textMain mt-0.5">
                    {inspectRecord.visible_flame_extinction_diameter_mm !== null && inspectRecord.visible_flame_extinction_diameter_mm !== undefined ? (
                      `${inspectRecord.visible_flame_extinction_diameter_mm.toFixed(2)} mm`
                    ) : (
                      <span className="text-space-textMuted font-normal italic">Unavailable</span>
                    )}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Burning Rate (K)</span>
                  <p className="font-mono font-bold text-amber-combustion mt-0.5">
                    {inspectRecord.burning_rate_mm2_s !== null && inspectRecord.burning_rate_mm2_s !== undefined ? (
                      `${inspectRecord.burning_rate_mm2_s.toFixed(2)} mm²/s`
                    ) : (
                      <span className="text-amber-400 font-normal italic">Unavailable</span>
                    )}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                  <span className="text-space-textMuted text-[10px]">Burn Time</span>
                  <p className="font-mono font-bold text-cyan-glow mt-0.5">
                    {inspectRecord.burn_time_s !== null && inspectRecord.burn_time_s !== undefined ? (
                      `${inspectRecord.burn_time_s.toFixed(1)} s`
                    ) : (
                      <span className="text-space-textMuted font-normal italic">Unavailable</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Provenance Metadata */}
            <div className="p-3 rounded-lg bg-cosmic-elevated/40 border border-cosmic-border/60 text-[11px] text-space-textMuted space-y-1">
              <div className="flex justify-between">
                <span>NASA Investigation:</span>
                <span className="font-mono text-space-textMain">{inspectRecord.investigation}</span>
              </div>
              <div className="flex justify-between">
                <span>Source Archive Table:</span>
                <span className="font-mono text-space-textMain">{inspectRecord.source_file}</span>
              </div>
              <div className="flex justify-between">
                <span>Record Nature:</span>
                <span className="font-mono text-cyan-glow font-medium">{inspectRecord.record_type}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectRecord(null)}
                className="px-4 py-2 rounded-lg bg-cosmic-elevated hover:bg-cosmic-elevated/80 border border-cosmic-border text-xs font-medium text-space-textMain transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCLUDED RECORDS DETAIL MODAL */}
      {showExcludedModal && analytics && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-cosmic-surface border border-cosmic-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-cosmic-border pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-display font-bold">
                <ShieldAlert size={20} />
                <span>Excluded Records from Pressure Regression ({analytics.pressure_vs_burning_rate.total_excluded} records)</span>
              </div>
              <button
                onClick={() => setShowExcludedModal(false)}
                className="p-1 rounded-lg text-space-textMuted hover:text-space-textMain transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-space-textMuted">
              To guarantee scientific accuracy and prevent distorted statistical trends, the following records were
              safely excluded from the pressure-versus-burning-rate regression line:
            </p>

            <div className="divide-y divide-cosmic-border/60 max-h-96 overflow-y-auto pr-1">
              {analytics.pressure_vs_burning_rate.excluded_points.map((pt) => (
                <div key={pt.flex_test_num} className="py-2.5 text-xs flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-cyan-glow">
                      Test #{pt.flex_test_num} ({pt.flex_identifier})
                    </span>
                    <span className="ml-2 text-space-textMuted text-[11px]">{pt.fuel} • {pt.outcome}</span>
                    <p className="text-[11px] text-amber-300/90 mt-0.5">{pt.reason}</p>
                  </div>
                  <div className="text-right font-mono text-[11px] shrink-0 text-space-textMuted">
                    <span>{pt.ambient_pressure_mmhg} mmHg</span>
                    {pt.burning_rate_mm2_s ? (
                      <p className="text-space-textMain">{pt.burning_rate_mm2_s} mm²/s</p>
                    ) : (
                      <p className="text-space-textMuted/50 italic">No rate</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-cosmic-border flex justify-end">
              <button
                onClick={() => setShowExcludedModal(false)}
                className="px-4 py-1.5 rounded-lg bg-cosmic-elevated border border-cosmic-border text-xs text-space-textMain"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlexResultsExplorer;
