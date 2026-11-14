import React from 'react';

interface MetricPillProps {
  label: string;
  value: string | number;
  unit?: string;
  accent?: 'cyan' | 'amber' | 'green' | 'default';
  icon?: React.ReactNode;
}

export const MetricPill: React.FC<MetricPillProps> = ({
  label,
  value,
  unit,
  accent = 'default',
  icon,
}) => {
  const accentClasses = {
    cyan: 'bg-cyan-dim border-cyan-glow/30 text-cyan-glow',
    amber: 'bg-amber-dim border-amber-combustion/30 text-amber-combustion',
    green: 'bg-space-green/15 border-space-green/30 text-space-green',
    default: 'bg-cosmic-elevated/70 border-cosmic-border text-space-textMain',
  }[accent];

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-mono backdrop-blur-sm ${accentClasses}`}
    >
      {icon && <span className="opacity-80">{icon}</span>}
      <span className="text-space-textMuted font-sans uppercase tracking-wider text-[10px]">
        {label}:
      </span>
      <span className="font-semibold text-space-textMain">
        {value}
        {unit && <span className="ml-0.5 text-space-textMuted font-normal">{unit}</span>}
      </span>
    </div>
  );
};
