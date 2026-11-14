import React from 'react';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading';
  activeModel?: string | null;
  aiMode?: 'live_llm' | 'offline_synthesis';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  activeModel,
  aiMode,
}) => {
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-space-textMuted bg-cosmic-elevated/80 px-2.5 py-1 rounded-full border border-cosmic-border">
        <span className="w-2 h-2 rounded-full bg-space-textMuted animate-pulse" />
        <span>Telemetry Syncing...</span>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="flex items-center gap-2 text-xs font-mono text-amber-combustion bg-amber-dim px-2.5 py-1 rounded-full border border-amber-combustion/30">
        <span className="w-2 h-2 rounded-full bg-amber-combustion" />
        <span>FastAPI Offline (Using Static Safe Fallback)</span>
      </div>
    );
  }

  const isLiveGemini = aiMode === 'live_llm';

  return (
    <div className="flex items-center gap-2 text-xs font-mono bg-cosmic-elevated/90 px-3 py-1 rounded-full border border-cosmic-border">
      <span
        className={`w-2 h-2 rounded-full ${
          isLiveGemini ? 'bg-space-green animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-cyan-glow'
        }`}
      />
      <span className="text-space-textMuted">Backend:</span>
      <span className="text-space-green font-semibold">Active</span>
      <span className="text-cosmic-border">|</span>
      <span className="text-space-textMuted">AI:</span>
      <span className={isLiveGemini ? 'text-cyan-glow font-semibold' : 'text-space-textMuted'}>
        {isLiveGemini ? `${activeModel || 'Gemini 3.5 Flash'}` : 'Offline Evidence Synthesis'}
      </span>
    </div>
  );
};
