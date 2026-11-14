import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Flame,
  User,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { LoadingSpinner, EmptyState, ErrorCard } from '../components/StateViews';
import { api, ApiError } from '../services/api';
import { ExperimentRecord, DatasetSummary } from '../types';

export const ExperimentExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedPI, setSelectedPI] = useState<string>('');
  const [selectedFlow, setSelectedFlow] = useState<string>('');
  const [minO2, setMinO2] = useState<number>(13.0);
  const [maxO2, setMaxO2] = useState<number>(23.0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sorting State
  const [sortField, setSortField] = useState<keyof ExperimentRecord>('as_run_num');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Single record detail modal
  const [inspectRecord, setInspectRecord] = useState<ExperimentRecord | null>(null);

  // Load summary on mount
  useEffect(() => {
    api
      .getSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.warn('Could not load summary:', err));
  }, []);

  // Fetch experiments when filters or pagination change
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    api
      .getExperiments({
        search: searchTerm.trim() || undefined,
        material: selectedMaterial || undefined,
        pi: selectedPI || undefined,
        flow_config: selectedFlow || undefined,
        min_o2: minO2 > 13.0 ? minO2 : undefined,
        max_o2: maxO2 < 23.0 ? maxO2 : undefined,
        page: currentPage,
        limit: itemsPerPage,
      })
      .then((data) => {
        if (mounted) {
          setExperiments(data.experiments);
          setTotalRecords(data.total);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Failed to retrieve flight records from the FastAPI backend.'
          );
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [searchTerm, selectedMaterial, selectedPI, selectedFlow, minO2, maxO2, currentPage, itemsPerPage]);

  // Client-side sorting for the current view
  const sortedExperiments = useMemo(() => {
    const list = [...experiments];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === null || aVal === undefined) return sortAsc ? 1 : -1;
      if (bVal === null || bVal === undefined) return sortAsc ? -1 : 1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return list;
  }, [experiments, sortField, sortAsc]);

  const handleSort = (field: keyof ExperimentRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMaterial('');
    setSelectedPI('');
    setSelectedFlow('');
    setMinO2(13.0);
    setMaxO2(23.0);
    setCurrentPage(1);
  };

  const exportFilteredCSV = () => {
    if (experiments.length === 0) return;
    const headers = [
      'test_id',
      'as_run_num',
      'principal_investigator',
      'fuel_material',
      'flow_configuration',
      'air_velocity_cms',
      'calibrated_initial_o2_pct',
      'final_co_ppm',
      'observations',
    ];
    const rows = sortedExperiments.map((e) =>
      headers
        .map((h) => {
          const val = e[h as keyof ExperimentRecord];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nasa_bass_ii_filtered_records_page_${currentPage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / itemsPerPage));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cosmic-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-glow mb-1">
            <Layers size={13} />
            <span>NASA Flight Catalog (126 Verified Tests)</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-space-textMain">
            Experiment Explorer
          </h1>
          <p className="text-xs text-space-textMuted mt-1">
            Browse, filter, and inspect genuine sensor telemetry from the ISS Microgravity Science Glovebox
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportFilteredCSV}
            disabled={experiments.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cosmic-elevated border border-cosmic-border text-xs font-mono text-space-textMain hover:border-cyan-glow/40 hover:text-cyan-glow transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Matrix Card */}
      <GlassCard className="p-4 space-y-4">
        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-space-textMuted" />
            <input
              type="text"
              placeholder="Search by Test ID (e.g. T1, rod301), Sample ID, Fuel Material, or Observations..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full glass-input rounded-lg pl-10 pr-4 py-2 text-xs font-mono"
            />
          </div>

          {(searchTerm || selectedMaterial || selectedPI || selectedFlow || minO2 > 13 || maxO2 < 23) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cosmic-elevated/70 border border-cosmic-border text-xs font-mono text-space-textMuted hover:text-amber-combustion transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          {/* Material Category */}
          <div>
            <label className="block text-[11px] text-space-textMuted uppercase mb-1">Fuel Material</label>
            <select
              value={selectedMaterial}
              onChange={(e) => {
                setSelectedMaterial(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full glass-input rounded-lg px-3 py-1.5 text-xs font-mono"
            >
              <option value="">All Fuel Categories</option>
              {summary?.material_categories.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Principal Investigator */}
          <div>
            <label className="block text-[11px] text-space-textMuted uppercase mb-1">Lead Investigator</label>
            <select
              value={selectedPI}
              onChange={(e) => {
                setSelectedPI(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full glass-input rounded-lg px-3 py-1.5 text-xs font-mono"
            >
              <option value="">All Research Teams</option>
              {summary?.pis_list.map((pi) => (
                <option key={pi} value={pi}>
                  {pi}
                </option>
              ))}
            </select>
          </div>

          {/* Flow Configuration */}
          <div>
            <label className="block text-[11px] text-space-textMuted uppercase mb-1">Airflow Orientation</label>
            <select
              value={selectedFlow}
              onChange={(e) => {
                setSelectedFlow(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full glass-input rounded-lg px-3 py-1.5 text-xs font-mono"
            >
              <option value="">All Flow Configurations</option>
              {summary?.flow_configurations.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Oxygen Range Slider */}
          <div>
            <label className="block text-[11px] text-space-textMuted uppercase mb-1">
              Initial Oxygen ({minO2.toFixed(1)}% – {maxO2.toFixed(1)}%)
            </label>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="range"
                min="13.0"
                max="23.0"
                step="0.5"
                value={maxO2}
                onChange={(e) => {
                  setMaxO2(parseFloat(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-cyan-glow cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary Telemetry */}
        <div className="flex items-center justify-between pt-2 border-t border-cosmic-border/60 text-[11px] font-mono text-space-textMuted">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={13} className="text-cyan-glow" />
            <span>Matching Tests:</span>
            <span className="text-cyan-glow font-bold">{totalRecords}</span>
            <span>of 126 archived runs</span>
          </div>

          <div>
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="ml-2 glass-input px-2 py-0.5 rounded text-[11px]"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Table Data View */}
      {loading ? (
        <LoadingSpinner message="Querying flight matrix from FastAPI..." />
      ) : error ? (
        <ErrorCard message={error} onRetry={() => setCurrentPage(1)} />
      ) : experiments.length === 0 ? (
        <EmptyState
          title="No Matching Flight Tests"
          description="Try adjusting your oxygen range, clearing the search term, or selecting 'All Fuel Categories'."
        />
      ) : (
        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-cosmic-elevated/90 border-b border-cosmic-border text-space-textMuted uppercase tracking-wider text-[10px]">
                <tr>
                  <th
                    onClick={() => handleSort('test_id')}
                    className="py-3 px-4 cursor-pointer hover:text-cyan-glow transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Test ID</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('as_run_num')}
                    className="py-3 px-4 cursor-pointer hover:text-cyan-glow transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Run #</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th className="py-3 px-4">Lead Investigator</th>
                  <th className="py-3 px-4">Fuel Material</th>
                  <th className="py-3 px-4">Flow</th>
                  <th
                    onClick={() => handleSort('air_velocity_numeric')}
                    className="py-3 px-4 cursor-pointer hover:text-cyan-glow transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Airflow (cm/s)</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('calibrated_initial_o2_pct')}
                    className="py-3 px-4 cursor-pointer hover:text-cyan-glow transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Initial O₂</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('final_co_ppm')}
                    className="py-3 px-4 cursor-pointer hover:text-cyan-glow transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Final CO</span>
                      <ArrowUpDown size={11} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cosmic-border/30 text-space-textMain">
                {sortedExperiments.map((exp) => (
                  <tr
                    key={exp.test_id}
                    onClick={() => setInspectRecord(exp)}
                    className="hover:bg-cosmic-elevated/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-semibold text-cyan-glow group-hover:underline">
                      {exp.test_id}
                    </td>
                    <td className="py-3 px-4 text-space-textMuted">{exp.as_run_num}</td>
                    <td className="py-3 px-4 text-space-textMuted truncate max-w-[140px]">
                      {exp.principal_investigator}
                    </td>
                    <td className="py-3 px-4 font-sans text-xs truncate max-w-[180px]">
                      {exp.material_category || exp.fuel_material}
                    </td>
                    <td className="py-3 px-4 text-space-textMuted">{exp.flow_configuration}</td>
                    <td className="py-3 px-4">{exp.air_velocity_cms || '0.0'}</td>
                    <td className="py-3 px-4 text-amber-combustion font-semibold">
                      {exp.calibrated_initial_o2_pct ? `${exp.calibrated_initial_o2_pct.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {exp.final_co_ppm !== null && exp.final_co_ppm !== undefined ? (
                        <span
                          className={`font-semibold ${
                            exp.final_co_ppm > 200
                              ? 'text-amber-combustion'
                              : 'text-space-textMain'
                          }`}
                        >
                          {exp.final_co_ppm} ppm
                        </span>
                      ) : (
                        <span className="text-space-textMuted/60">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectRecord(exp);
                        }}
                        className="p-1 rounded bg-cosmic-elevated/80 border border-cosmic-border text-space-textMuted group-hover:text-cyan-glow group-hover:border-cyan-glow/40 transition-colors"
                        title="View Full Telemetry"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Navigation Footer */}
          <div className="p-4 bg-cosmic-elevated/40 border-t border-cosmic-border flex items-center justify-between text-xs font-mono text-space-textMuted">
            <span>
              Page <strong className="text-space-textMain">{currentPage}</strong> of{' '}
              <strong className="text-space-textMain">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded bg-cosmic-elevated border border-cosmic-border text-space-textMain hover:border-cyan-glow/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded bg-cosmic-elevated border border-cosmic-border text-space-textMain hover:border-cyan-glow/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Record Inspection Slide-Over / Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-2xl border border-cyan-glow/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cosmic-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-cyan-dim text-cyan-glow border border-cyan-glow/30">
                  <Flame size={16} />
                </span>
                <div>
                  <h3 className="text-base font-bold font-display text-space-textMain">
                    Flight Test: <span className="text-cyan-glow font-mono">{inspectRecord.test_id}</span>
                  </h3>
                  <p className="text-[11px] font-mono text-space-textMuted">
                    Run #{inspectRecord.as_run_num} • Sample: {inspectRecord.sample_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="p-1.5 rounded-lg bg-cosmic-elevated hover:bg-cosmic-elevated/70 text-space-textMuted hover:text-space-textMain transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Run Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted uppercase">Lead Investigator</div>
                <div className="font-semibold text-space-textMain mt-0.5 truncate">
                  {inspectRecord.principal_investigator}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted uppercase">Fuel Material</div>
                <div className="font-semibold text-space-textMain mt-0.5 truncate">
                  {inspectRecord.fuel_material}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted uppercase">Flow Configuration</div>
                <div className="font-semibold text-cyan-glow mt-0.5">
                  {inspectRecord.flow_configuration}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted uppercase">Airflow Speed</div>
                <div className="font-semibold text-space-textMain mt-0.5">
                  {inspectRecord.air_velocity_cms} cm/s
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted uppercase">Calibrated O₂ (In / Out)</div>
                <div className="font-semibold text-amber-combustion mt-0.5">
                  {inspectRecord.calibrated_initial_o2_pct}% → {inspectRecord.calibrated_final_o2_pct ?? '—'}%
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cosmic-darkest/70 border border-cosmic-border">
                <div className="text-[10px] text-space-textMuted uppercase">CO Surge (In / Out)</div>
                <div className="font-semibold text-amber-combustion mt-0.5">
                  {inspectRecord.initial_co_ppm ?? '0'} → {inspectRecord.final_co_ppm ?? '—'} ppm
                </div>
              </div>
            </div>

            {/* Astronaut Flight Log */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-cyan-glow uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} />
                <span>Crew Flight Observation Log</span>
              </div>
              <div className="p-3.5 rounded-lg bg-cosmic-darkest border-l-4 border-amber-combustion text-xs font-mono text-space-textMain leading-relaxed italic">
                "{inspectRecord.observations || 'No additional astronaut notes recorded for this run.'}"
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-cosmic-border flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-space-textMuted">
              <span>Source: NASA BASS-II Matrix (`bass_ii_experiments.csv`)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const testId = inspectRecord.test_id;
                    setInspectRecord(null);
                    navigate(`/deep-dive?test=${encodeURIComponent(testId)}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-glow/20 border border-cyan-glow/50 text-cyan-glow hover:bg-cyan-glow/30 transition-all font-semibold"
                >
                  <span>Open in Test Deep-Dive</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => setInspectRecord(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-cosmic-elevated hover:bg-cosmic-elevated/70 border border-cosmic-border text-space-textMuted hover:text-space-textMain transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
