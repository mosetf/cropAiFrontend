import React from 'react';
import type { RiskLevel } from '@/types';

const LEVELS: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: 'Low risk', className: 'bg-good-soft text-good' },
  medium: { label: 'Medium risk', className: 'bg-warn-soft text-warn' },
  high: { label: 'High risk', className: 'bg-bad-soft text-bad' },
};

/** Pill with a status dot. Colours come from the tokens, so contrast holds in light and dark. */
const RiskBadge: React.FC<{ level: RiskLevel; className?: string }> = ({ level, className = '' }) => {
  const { label, className: tone } = LEVELS[level] ?? LEVELS.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[14px] font-semibold ${tone} ${className}`}>
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
      {label}
    </span>
  );
};

export default RiskBadge;
