import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'amber' | 'green' | 'none';
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  onClick,
}) => {
  const glowStyles = {
    cyan: 'border-cosmic-border hover:border-cyan-glow/40 hover:shadow-glow-cyan',
    amber: 'border-cosmic-border hover:border-amber-combustion/40 hover:shadow-glow-amber',
    green: 'border-cosmic-border hover:border-space-green/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    none: 'border-cosmic-border',
  }[glow];

  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-300 hover:-translate-y-1'
    : '';

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-5 ${glowStyles} ${interactiveStyles} ${className}`}
    >
      {children}
    </div>
  );
};
