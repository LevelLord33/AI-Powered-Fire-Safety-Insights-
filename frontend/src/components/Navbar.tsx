import React, { useEffect, useState } from 'react';
import { ShieldAlert, Globe, Activity, Menu } from 'lucide-react';
import { api } from '../services/api';
import { HealthData } from '../types';
import { StatusIndicator } from './StatusIndicator';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .getHealth()
      .then((data) => {
        if (mounted) {
          setHealth(data);
          setLoading(false);
          setOffline(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setLoading(false);
          setOffline(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="h-16 border-b border-cosmic-border bg-cosmic-surface/80 backdrop-blur-md sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between">
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg bg-cosmic-elevated border border-cosmic-border text-space-textMuted"
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-space-textMuted">
          <Globe size={14} className="text-cyan-glow" />
          <span className="text-space-textMain font-semibold">NASA Space Apps Challenge 2026</span>
          <span className="text-cosmic-border">/</span>
          <span className="text-cyan-glow">BASS-II Research Telemetry Console</span>
        </div>
      </div>

      {/* Right Telemetry HUD & Status Badges */}
      <div className="flex items-center gap-3">
        {/* Safety Boundary Notice */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-dim/50 border border-amber-combustion/30 text-[11px] font-mono text-amber-combustion"
          title="Outputs are for scientific research and educational exploration only. Not for operational flight safety approvals."
        >
          <ShieldAlert size={13} />
          <span>Research Synthesis Only</span>
        </div>

        {/* Global Dataset Counter */}
        {health && (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full bg-cosmic-elevated/70 border border-cosmic-border">
            <Activity size={13} className="text-cyan-glow" />
            <span className="text-space-textMuted">Flight Tests:</span>
            <span className="font-semibold text-cyan-glow">{health.total_experiments}</span>
          </div>
        )}

        {/* Backend & AI Engine Status Badge */}
        <StatusIndicator
          status={loading ? 'loading' : offline ? 'offline' : 'online'}
          activeModel={health?.active_model}
          aiMode={health?.ai_mode}
        />
      </div>
    </header>
  );
};
