import React from 'react';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Retrieving flight telemetry...',
}) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="relative w-12 h-12 mb-4">
      <div className="absolute inset-0 rounded-full border-2 border-cosmic-border border-t-cyan-glow animate-spin" />
      <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-amber-combustion animate-spin" />
    </div>
    <p className="text-sm font-mono text-cyan-glow tracking-wider animate-pulse">{message}</p>
    <p className="text-xs text-space-textMuted mt-1">Glovebox sensor array telemetry streaming</p>
  </div>
);

export const ErrorCard: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Telemetry Connection Interrupted', message, onRetry }) => (
  <div className="glass-panel border-amber-combustion/40 rounded-xl p-6 bg-gradient-to-br from-cosmic-surface to-amber-dim/20">
    <div className="flex items-start gap-4">
      <div className="p-2.5 rounded-lg bg-amber-dim border border-amber-combustion/40 text-amber-combustion">
        <AlertCircle size={24} />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-amber-combustion tracking-wide uppercase font-mono">
          {title}
        </h4>
        <p className="text-sm text-space-textMain mt-1 leading-relaxed">{message}</p>
        <p className="text-xs text-space-textMuted mt-2">
          Tip: Ensure the FastAPI backend is running via{' '}
          <code className="px-1.5 py-0.5 rounded bg-cosmic-darkest font-mono text-cyan-glow">
            python -m uvicorn backend.main:app --port 8000
          </code>
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cosmic-elevated border border-amber-combustion/50 text-xs font-mono text-amber-combustion hover:bg-amber-dim transition-colors"
          >
            <RefreshCw size={13} />
            <span>Retry Telemetry Request</span>
          </button>
        )}
      </div>
    </div>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
}> = ({ title, description, icon }) => (
  <div className="glass-panel rounded-xl p-10 text-center flex flex-col items-center justify-center border-dashed border-cosmic-border">
    <div className="p-3 rounded-xl bg-cosmic-elevated text-cyan-glow/60 mb-3 border border-cosmic-border">
      {icon || <Layers size={28} />}
    </div>
    <h4 className="text-sm font-semibold text-space-textMain font-mono">{title}</h4>
    <p className="text-xs text-space-textMuted max-w-sm mt-1 leading-relaxed">{description}</p>
  </div>
);
