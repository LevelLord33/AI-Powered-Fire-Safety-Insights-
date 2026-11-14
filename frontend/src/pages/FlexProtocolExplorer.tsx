import React, { useEffect, useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  RotateCcw,
  BookOpen,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Gauge,
  Flame,
  Shield,
  FileText,
  AlertTriangle,
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
} from 'recharts';
import { GlassCard } from '../components/GlassCard';
import { MetricPill } from '../components/MetricPill';
import { LoadingSpinner, ErrorCard } from '../components/StateViews';
import { api } from '../services/api';
import {
  FlexConditionRecord,
  FlexSummaryResponse,
  FlexAnalyticsResponse,
} from '../types';

export const FlexProtocolExplorer: React.FC = () => {
  const [conditions, setConditions] = useState<FlexConditionRecord[]>([]);
  const [summary, setSummary] = useState<FlexSummaryResponse | null>(null);
  const [analytics, setAnalytics] = useState<FlexAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedSuppressant, setSelectedSuppressant] = useState('');
  const [selectedFiber, setSelectedFiber] = useState('');
  const [minPressure, setMinPressure] = useState<string>('');
  const [maxPressure, setMaxPressure] = useState<string>('');
  const [minO2, setMinO2] = useState<string>('');
  const [maxO2, setMaxO2] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalRecords, setTotalRecords] = useState(0);

  // Inspect Modal State
  const [inspectCondition, setInspectCondition] = useState<FlexConditionRecord | null>(null);

  // Load summary and analytics once on mount
  useEffect(() => {
    Promise.all([api.getFlexSummary(), api.getFlexAnalytics()])
      .then(([sumData, anaData]) => {
        setSummary(sumData);
        setAnalytics(anaData);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Failed to load FLEX protocol data:', err);
        setError(err.message || 'Unable to connect to FLEX API');
        setLoading(false);
      });
  }, []);

  // Fetch conditions table on filter / page changes
  useEffect(() => {
    let mounted = true;
    setTableLoading(true);

    api
      .getFlexConditions({
        page: currentPage,
        limit,
        fuel: selectedFuel || undefined,
        suppressant: selectedSuppressant || undefined,
        fiber_support: selectedFiber || undefined,
        min_pressure: minPressure ? parseFloat(minPressure) : undefined,
        max_pressure: maxPressure ? parseFloat(maxPressure) : undefined,
        min_o2: minO2 ? parseFloat(minO2) : undefined,
        max_o2: maxO2 ? parseFloat(maxO2) : undefined,
        search: searchTerm.trim() || undefined,
      })
      .then((data) => {
        if (mounted) {
          setConditions(data.conditions);
          setTotalRecords(data.total);
          setTableLoading(false);
        }
      })
      .catch((err: any) => {
        if (mounted) {
          console.error('Error fetching conditions:', err);
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
    selectedSuppressant,
    selectedFiber,
    minPressure,
    maxPressure,
    minO2,
    maxO2,
    searchTerm,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedFuel('');
    setSelectedSuppressant('');
    setSelectedFiber('');
    setMinPressure('');
    setMaxPressure('');
    setMinO2('');
    setMaxO2('');
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

  // Color mappings for suppressants in charts
  const suppressantColors: Record<string, string> = {
    CO2: '#f59e0b',
    He: '#06b6d4',
    SF6: '#ec4899',
    None: '#10b981',
  };

  if (loading) {
    return <LoadingSpinner message="Loading NASA FLEX Planned Science Protocol Matrix..." />;
  }

  if (error && !summary) {
    return <ErrorCard message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------------------- */}
      {/* Page Title & Explicit Protocol Scope Banner */}
      {/* --------------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-glow text-xs font-mono tracking-wider uppercase">
              <Layers size={14} />
              <span>NASA PSI-69 • Droplet Combustion Investigation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-space-textMain mt-1">
              NASA FLEX — Planned Science Protocol Matrix
            </h1>
            <p className="text-sm font-sans text-space-textMuted mt-1">
              290 planned test conditions extracted from NASA FLEX_EIRD_v4.pdf Section 5.3 (Tables 6–12).
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-dim/40 border border-cyan-glow/30 text-xs font-mono text-cyan-glow">
              <FileText size={14} />
              <span>EIRD v4.0 • Science Protocol</span>
            </span>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-dim/30 border border-amber-combustion/40 text-xs font-sans text-amber-200 flex items-start gap-3 shadow-glow-amber">
          <AlertTriangle size={18} className="text-amber-combustion shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-space-textMain">
              Specified Protocol Conditions — Not Measured Flight Telemetry:
            </span>
            <p className="text-space-textMuted leading-relaxed">
              These 290 records are <strong>specified target conditions</strong> from NASA's Experiment Information
              and Requirements Document (EIRD). They specify chamber pressure, oxygen concentration, suppressant
              fractions, and suspension modes planned for the ISS Combustion Integrated Rack (CIR). They do{' '}
              <strong>not</strong> represent measured burning rates, extinction diameters, or sensor outcomes.
            </p>
            <p className="text-space-textMuted leading-relaxed text-[11px] pt-1 border-t border-amber-combustion/20">
              <strong>Nitrogen Diluent Provenance Note:</strong> Nitrogen mole fraction is a <em>derived value</em> calculated via Dalton&apos;s law (X_N2 = 1.0 - X_O2 - X_sup). In 278 conditions, Nitrogen is the diluent balance gas. In 12 specific planned conditions (Tests #58, #66, #86, #94, #114, #122, #142, #150, #170, #178, #198, #206), the calculated nitrogen fraction is exactly zero (X_N2 = 0.0) because NASA tested binary limit mixtures of 30% Oxygen and 70% Suppressant (X_O2 = 0.30, X_sup = 0.70).
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* Summary KPI Cards */}
      {/* --------------------------------------------------------------------- */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricPill
            label="Planned Conditions"
            value={summary.total_planned_conditions}
            unit="tests"
            icon={<Layers size={14} />}
            accent="cyan"
          />
          <MetricPill
            label="Fuel Types"
            value="2"
            unit="fuels"
            icon={<Flame size={14} />}
            accent="amber"
          />
          <MetricPill
            label="Suppressants"
            value="4"
            unit="types"
            icon={<Shield size={14} />}
            accent="default"
          />
          <MetricPill
            label="Pressure Span"
            value={`${summary.min_pressure_atm} - ${summary.max_pressure_atm}`}
            unit="atm"
            icon={<Gauge size={14} />}
            accent="default"
          />
          <MetricPill
            label="Oxygen Span"
            value={`${(summary.min_oxygen_fraction * 100).toFixed(0)}% - ${(summary.max_oxygen_fraction * 100).toFixed(0)}%`}
            unit="XO2"
            icon={<Info size={14} />}
            accent="cyan"
          />
          <MetricPill
            label="Nitrogen Mole Fraction — Derived"
            value="0.0 - 0.9"
            unit="XN2 (12 at 0.0)"
            icon={<BookOpen size={14} />}
            accent="default"
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* Visual Analytics: Planned Protocol Condition Distributions */}
      {/* --------------------------------------------------------------------- */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Planned Conditions by Pressure */}
          <GlassCard className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-display font-semibold text-space-textMain">
                  Planned Conditions by Chamber Pressure (atm)
                </h3>
                <span className="text-[10px] font-mono text-cyan-glow uppercase">Protocol</span>
              </div>
              <p className="text-xs text-space-textMuted mb-4">
                Target pressure levels specified in Section 5.3 (0.50 to 3.00 atm).
              </p>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.pressure_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                  <XAxis
                    dataKey="pressure"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `${val} atm`}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0f1d',
                      borderColor: '#1e293b',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(val: any) => [`${val} planned conditions`, 'Tests']}
                    labelFormatter={(val: any) => `Pressure: ${val} atm`}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Chart 2: Planned Conditions by Suppressant */}
          <GlassCard className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-display font-semibold text-space-textMain">
                  Planned Conditions by Chemical Suppressant
                </h3>
                <span className="text-[10px] font-mono text-amber-combustion uppercase">Protocol</span>
              </div>
              <p className="text-xs text-space-textMuted mb-4">
                Comparison of chemical suppressant types (CO2, He, SF6, and Baseline Air).
              </p>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.suppressant_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                  <XAxis dataKey="suppressant" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0f1d',
                      borderColor: '#1e293b',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(val: any) => [`${val} planned conditions`, 'Tests']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.suppressant_distribution.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={suppressantColors[entry.suppressant] || '#06b6d4'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Chart 3: Planned Matrix (Pressure vs. Oxygen Fraction) */}
          <GlassCard className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-display font-semibold text-space-textMain">
                  Planned Matrix: Chamber Pressure vs. Oxygen
                </h3>
                <span className="text-[10px] font-mono text-purple-400 uppercase">2D Space</span>
              </div>
              <p className="text-xs text-space-textMuted mb-4">
                Scatter of planned test points across pressure (x) and oxygen mole fraction (y).
              </p>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                  <XAxis
                    type="number"
                    dataKey="pressure_atm"
                    name="Pressure"
                    unit=" atm"
                    stroke="#94a3b8"
                    domain={[0.4, 3.2]}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="oxygen_mole_fraction"
                    name="Oxygen"
                    unit=" XO2"
                    stroke="#94a3b8"
                    domain={[0.08, 0.42]}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: '#0a0f1d',
                      borderColor: '#1e293b',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(val: any, name: any) => [val, name === 'Pressure' ? 'Pressure (atm)' : 'Oxygen (XO2)']}
                  />
                  <Scatter
                    name="Planned Conditions"
                    data={analytics.matrix_scatter_points}
                    fill="#38bdf8"
                    opacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* Filter Toolbar */}
      {/* --------------------------------------------------------------------- */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cosmic-border pb-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-cyan-glow" />
            <h2 className="text-sm font-display font-semibold text-space-textMain">
              Filter Planned Test Conditions
            </h2>
            <span className="text-xs text-space-textMuted font-mono">
              ({totalRecords} conditions matched)
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cosmic-elevated/70 border border-cosmic-border hover:border-cyan-glow/40 text-xs font-mono text-space-textMuted hover:text-cyan-glow transition-colors self-start md:self-auto"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-space-textMuted" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-cosmic-darkest/60 border border-cosmic-border rounded-lg text-xs font-mono text-space-textMain placeholder-space-textMuted/60 focus:outline-none focus:border-cyan-glow/60"
            />
          </div>

          {/* Fuel Filter */}
          <div>
            <select
              value={selectedFuel}
              onChange={(e) => {
                setSelectedFuel(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-cosmic-darkest/60 border border-cosmic-border rounded-lg text-xs font-mono text-space-textMain focus:outline-none focus:border-cyan-glow/60"
            >
              <option value="">All Fuel Types</option>
              {summary?.unique_fuels.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Suppressant Filter */}
          <div>
            <select
              value={selectedSuppressant}
              onChange={(e) => {
                setSelectedSuppressant(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-cosmic-darkest/60 border border-cosmic-border rounded-lg text-xs font-mono text-space-textMain focus:outline-none focus:border-cyan-glow/60"
            >
              <option value="">All Suppressants</option>
              {summary?.unique_suppressants.map((s) => (
                <option key={s} value={s}>
                  {s === 'None' ? 'None (Baseline Air)' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Droplet Suspension Mode */}
          <div>
            <select
              value={selectedFiber}
              onChange={(e) => {
                setSelectedFiber(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-cosmic-darkest/60 border border-cosmic-border rounded-lg text-xs font-mono text-space-textMain focus:outline-none focus:border-cyan-glow/60"
            >
              <option value="">All Suspension Modes</option>
              <option value="Free Droplet">Free Droplet (246 tests)</option>
              <option value="SiC fiber">SiC Fiber Support (44 tests)</option>
            </select>
          </div>

          {/* Pressure Min / Max */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.1"
              placeholder="Min P (atm)"
              value={minPressure}
              onChange={(e) => {
                setMinPressure(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2 py-2 bg-cosmic-darkest/60 border border-cosmic-border rounded-lg text-xs font-mono text-space-textMain placeholder-space-textMuted/60 focus:outline-none focus:border-cyan-glow/60"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Max P (atm)"
              value={maxPressure}
              onChange={(e) => {
                setMaxPressure(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2 py-2 bg-cosmic-darkest/60 border border-cosmic-border rounded-lg text-xs font-mono text-space-textMain placeholder-space-textMuted/60 focus:outline-none focus:border-cyan-glow/60"
            />
          </div>

          {/* Oxygen Fraction Min / Max */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.05"
              placeholder="Min XO2"
              value={minO2}
              onChange={(e) => {
                setMinO2(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2 py-2 bg-cosmic-darkest/60 border border-cosmic-border rounded-lg text-xs font-mono text-space-textMain placeholder-space-textMuted/60 focus:outline-none focus:border-cyan-glow/60"
            />
            <input
              type="number"
              step="0.05"
              placeholder="Max XO2"
              value={maxO2}
              onChange={(e) => {
                setMaxO2(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2 py-2 bg-cosmic-darkest/60 border border-cosmic-border rounded-lg text-xs font-mono text-space-textMain placeholder-space-textMuted/60 focus:outline-none focus:border-cyan-glow/60"
            />
          </div>
        </div>
      </GlassCard>

      {/* --------------------------------------------------------------------- */}
      {/* Paginated Conditions Table */}
      {/* --------------------------------------------------------------------- */}
      <GlassCard className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-space-textMuted">
              Showing page <strong className="text-space-textMain">{currentPage}</strong> of{' '}
              <strong className="text-space-textMain">{totalPages}</strong> ({totalRecords} conditions)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-space-textMuted">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-cosmic-darkest/60 border border-cosmic-border rounded text-xs font-mono text-space-textMain"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Table Viewport */}
        <div className="overflow-x-auto rounded-lg border border-cosmic-border/60">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-cosmic-surface/90 border-b border-cosmic-border text-space-textMuted uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Test #</th>
                <th className="py-3 px-3">Fuel</th>
                <th className="py-3 px-3">Suppressant</th>
                <th className="py-3 px-3">Pressure (atm)</th>
                <th className="py-3 px-3">Oxygen (X_O2)</th>
                <th className="py-3 px-3">Suppressant (X_sup)</th>
                <th className="py-3 px-3" title="Derived: 1.0 - X_O2 - X_sup">
                  Nitrogen (X_N2)*
                </th>
                <th className="py-3 px-3">Suspension Mode</th>
                <th className="py-3 px-3">Flow (cm/s)</th>
                <th className="py-3 px-3">NASA Provenance</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cosmic-border/40">
              {tableLoading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-space-textMuted">
                    Loading planned conditions...
                  </td>
                </tr>
              ) : conditions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-space-textMuted">
                    No planned test conditions match your filter criteria.
                  </td>
                </tr>
              ) : (
                conditions.map((row) => (
                  <tr
                    key={row.test_no}
                    className="hover:bg-cosmic-elevated/40 transition-colors group cursor-pointer"
                    onClick={() => setInspectCondition(row)}
                  >
                    <td className="py-2.5 px-3 font-bold text-cyan-glow">
                      #{row.test_no}
                    </td>
                    <td className="py-2.5 px-3 text-space-textMain">
                      {row.fuel}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.suppressant === 'None'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : row.suppressant === 'CO2'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : row.suppressant === 'He'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                        }`}
                      >
                        {row.suppressant === 'None' ? 'None (Air)' : row.suppressant}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-space-textMain font-medium">
                      {row.pressure_atm.toFixed(2)} atm
                    </td>
                    <td className="py-2.5 px-3 text-cyan-glow font-medium">
                      {row.oxygen_mole_fraction.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-space-textMuted">
                      {row.suppressant_mole_fraction.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-purple-300 font-medium">
                      {row.nitrogen_mole_fraction.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-space-textMuted truncate max-w-[140px]" title={row.fiber_support}>
                      {row.fiber_support.includes('Free') ? 'Free Droplet' : 'SiC Fiber'}
                    </td>
                    <td className="py-2.5 px-3 text-space-textMuted">
                      {row.flow_velocity_cms.toFixed(1)} cm/s
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-space-textMuted font-mono">
                      p. {row.source_page}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectCondition(row);
                        }}
                        className="p-1 rounded bg-cosmic-elevated hover:bg-cosmic-border text-space-textMuted hover:text-cyan-glow transition-colors"
                        title="View Complete NASA Protocol Specifications"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footnote & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
          <p className="text-[11px] text-space-textMuted/80 font-mono">
            {"*Nitrogen mole fraction (X_N2) is a derived balance value (1.0 - X_O2 - X_sup). Rows with X_N2 = 0.0 represent binary oxygen-suppressant limit mixtures (30% O2 + 70% Suppressant)."}
          </p>

          <div className="flex items-center gap-2 font-mono">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-cosmic-elevated border border-cosmic-border disabled:opacity-30 disabled:cursor-not-allowed hover:text-cyan-glow transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-space-textMain px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-cosmic-elevated border border-cosmic-border disabled:opacity-30 disabled:cursor-not-allowed hover:text-cyan-glow transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* --------------------------------------------------------------------- */}
      {/* Detailed Condition Modal */}
      {/* --------------------------------------------------------------------- */}
      {inspectCondition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-cosmic-surface border border-cosmic-border rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-cosmic-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-dim/40 border border-cyan-glow/40 text-cyan-glow font-mono font-bold text-xs">
                    Condition #{inspectCondition.test_no}
                  </span>
                  <span className="text-xs font-mono text-space-textMuted">
                    {inspectCondition.investigation}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-space-textMain mt-1">
                  NASA FLEX Planned Condition Specification
                </h3>
              </div>
              <button
                onClick={() => setInspectCondition(null)}
                className="p-1.5 rounded-lg bg-cosmic-elevated text-space-textMuted hover:text-space-textMain"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border/60 space-y-1">
                <span className="text-space-textMuted text-[10px] uppercase">Fuel Material</span>
                <p className="font-semibold text-space-textMain">{inspectCondition.fuel}</p>
              </div>

              <div className="p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border/60 space-y-1">
                <span className="text-space-textMuted text-[10px] uppercase">Chemical Suppressant</span>
                <p className="font-semibold text-amber-combustion">
                  {inspectCondition.suppressant === 'None'
                    ? 'None (Baseline Air)'
                    : inspectCondition.suppressant}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border/60 space-y-1">
                <span className="text-space-textMuted text-[10px] uppercase">Target Chamber Pressure</span>
                <p className="font-semibold text-cyan-glow">
                  {inspectCondition.pressure_atm.toFixed(2)} atm (~{(inspectCondition.pressure_atm * 101.325).toFixed(1)} kPa)
                </p>
              </div>

              <div className="p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border/60 space-y-1">
                <span className="text-space-textMuted text-[10px] uppercase">Droplet Suspension Mode</span>
                <p className="font-semibold text-space-textMain">{inspectCondition.fiber_support}</p>
              </div>

              <div className="col-span-2 p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border/60 space-y-2">
                <span className="text-space-textMuted text-[10px] uppercase">Gas Mixture Mole Fractions</span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded bg-cyan-dim/20 border border-cyan-glow/20">
                    <span className="text-[10px] text-space-textMuted block">Oxygen (X_O2)</span>
                    <strong className="text-cyan-glow text-sm">
                      {inspectCondition.oxygen_mole_fraction.toFixed(2)}
                    </strong>
                  </div>
                  <div className="p-2 rounded bg-amber-dim/20 border border-amber-combustion/20">
                    <span className="text-[10px] text-space-textMuted block">Suppressant (X_sup)</span>
                    <strong className="text-amber-combustion text-sm">
                      {inspectCondition.suppressant_mole_fraction.toFixed(2)}
                    </strong>
                  </div>
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[10px] text-space-textMuted block">Nitrogen Diluent (X_N2)*</span>
                    <strong className="text-purple-300 text-sm">
                      {inspectCondition.nitrogen_mole_fraction.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="col-span-2 p-3 rounded-lg bg-cosmic-darkest/60 border border-cosmic-border/60 space-y-1">
                <span className="text-space-textMuted text-[10px] uppercase">Official NASA Provenance</span>
                <div className="text-[11px] text-space-textMuted space-y-0.5">
                  <p>• Document: <span className="text-space-textMain">{inspectCondition.source_document}</span></p>
                  <p>• Section: <span className="text-space-textMain">{inspectCondition.source_section}</span></p>
                  <p>• Page: <span className="text-space-textMain">PDF Page {inspectCondition.source_page}</span></p>
                  <p>• Record Nature: <span className="text-cyan-glow">{inspectCondition.record_type}</span></p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectCondition(null)}
                className="px-4 py-2 rounded-lg bg-cosmic-elevated hover:bg-cosmic-border text-xs font-mono text-space-textMain transition-colors"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlexProtocolExplorer;
