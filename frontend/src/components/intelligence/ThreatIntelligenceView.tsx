import React from 'react';
import { Search, BarChart3 } from 'lucide-react';
import { InvestigationData, DashboardMetrics } from '../../types/forensic';
import { ThreatCharts } from '../dashboard/ThreatCharts';

interface ThreatIntelligenceViewProps {
  metrics?: DashboardMetrics;
  activeInvestigation?: InvestigationData;
  onStartNewScan: () => void;
}

export const ThreatIntelligenceView: React.FC<ThreatIntelligenceViewProps> = ({
  onStartNewScan,
}) => {
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 w-full max-w-[1700px] mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Threat Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time SOC telemetry, global threat indicators, and defensive analytics.
          </p>
        </div>

        <button
          onClick={onStartNewScan}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1e60dc] hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Search className="w-4 h-4 stroke-[2.2]" />
          <span>Analyze a New Threat</span>
        </button>
      </div>

      {/* Section Header: SOC Telemetry & Charts */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1e60dc] text-white shadow-xs">
          <BarChart3 className="w-4 h-4" />
          <span>SOC Telemetry & Charts</span>
        </div>
      </div>

      {/* SOC Telemetry & Charts View */}
      <div className="space-y-8 animate-fade-in">
        <ThreatCharts />
      </div>
    </div>
  );
};

export const ThreatOverviewView = ThreatIntelligenceView;
