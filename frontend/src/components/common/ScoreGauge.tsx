import React from 'react';
import { RiskLevel } from '../../types/forensic';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, riskLevel, size = 160 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc spans 260 degrees instead of 360 for speedometer look
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // green
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  if (riskLevel === 'CRITICAL') {
    strokeColor = '#ef4444'; // red
    glowColor = 'rgba(239, 68, 68, 0.5)';
  } else if (riskLevel === 'HIGH') {
    strokeColor = '#f97316'; // orange
    glowColor = 'rgba(249, 115, 22, 0.4)';
  } else if (riskLevel === 'MEDIUM') {
    strokeColor = '#eab308'; // yellow
    glowColor = 'rgba(234, 179, 8, 0.4)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Active Score Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 10px ${glowColor})`,
          }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight" style={{ color: strokeColor }}>
          {score}
        </span>
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
          / 100 SCORE
        </span>
      </div>
    </div>
  );
};
