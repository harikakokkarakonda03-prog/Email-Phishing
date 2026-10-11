import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  THREAT_TREND_DATA,
  CATEGORY_DISTRIBUTION,
} from '../../data/historicalData';

export const ThreatCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* 1. Threat Detection Over Time */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Threat Detection Over Time</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Weekly progression by attack vector</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Phishing
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> BEC
            </span>
            <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Malware
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={THREAT_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="phishGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="becGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="malwareGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} fontVariant="mono" />
              <YAxis stroke="#94a3b8" fontSize={11} fontVariant="mono" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="phishing"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#phishGrad)"
              />
              <Area
                type="monotone"
                dataKey="bec"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#becGrad)"
              />
              <Area
                type="monotone"
                dataKey="malware"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#malwareGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Threat Category Distribution */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Threat Category Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Telemetry share by threat type</p>
        </div>

        <div className="h-52 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CATEGORY_DISTRIBUTION}
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {CATEGORY_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" className="dark:stroke-slate-900" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
          {CATEGORY_DISTRIBUTION.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-slate-700 dark:text-slate-300 truncate">{cat.name}:</span>
              <span className="text-slate-900 dark:text-slate-200 font-bold">{cat.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
