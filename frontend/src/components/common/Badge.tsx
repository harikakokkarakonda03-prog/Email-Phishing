import React from 'react';
import { RiskLevel } from '../../types/forensic';

interface BadgeProps {
  level?: RiskLevel | 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NONE' | 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ level, text, size = 'md', className = '' }) => {
  const displayText = text || level || 'INFO';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  switch (level) {
    case 'CRITICAL':
    case 'FAIL':
    case 'MALICIOUS':
      colorClasses = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/70 dark:text-red-400 dark:border-red-800/80 shadow-sm';
      break;
    case 'HIGH':
    case 'SUSPICIOUS':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-400 dark:border-amber-800/80 shadow-sm';
      break;
    case 'MEDIUM':
    case 'SOFTFAIL':
      colorClasses = 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/70 dark:text-yellow-400 dark:border-yellow-800/80';
      break;
    case 'LOW':
    case 'PASS':
    case 'SAFE':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-400 dark:border-emerald-800/80 shadow-sm';
      break;
    case 'NONE':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700';
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-mono font-semibold'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-mono font-bold'
      : 'px-2.5 py-1 text-xs font-mono font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border uppercase tracking-wider ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {displayText}
    </span>
  );
};
