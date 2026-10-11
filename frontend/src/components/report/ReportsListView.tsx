import React from 'react';
import { FileText, Printer, ExternalLink } from 'lucide-react';
import { InvestigationData } from '../../types/forensic';
import { Badge } from '../common/Badge';

interface ReportsListViewProps {
  investigations: InvestigationData[];
  onOpenReport: (inv: InvestigationData) => void;
  onSelectInvestigation: (id: string) => void;
}

export const ReportsListView: React.FC<ReportsListViewProps> = ({
  investigations,
  onOpenReport,
  onSelectInvestigation,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          <span>Forensic Incident Reports</span>
        </h2>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
          Exportable incident documentation for compliance, legal chain of custody, and executive briefing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {investigations.map((inv) => (
          <div
            key={inv.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400">{inv.id}</span>
                <Badge level={inv.riskLevel} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-sans">{inv.subject}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans line-clamp-2 mb-4 leading-relaxed">
                {inv.summary}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-black/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mb-4">
                <div>
                  <span className="text-slate-500 text-[10px] block">THREAT SCORE:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{inv.threatScore}/100</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">IOC COUNT:</span>
                  <span className="text-cyan-700 dark:text-cyan-300 font-bold">{inv.iocs.length} Extracted</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">SPF / DKIM:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {inv.authentication.spf.status} / {inv.authentication.dkim.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">DATE:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate">{new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onSelectInvestigation(inv.id)}
                className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View Full Telemetry</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                onClick={() => onOpenReport(inv)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Open Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
