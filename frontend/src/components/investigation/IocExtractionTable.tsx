import React, { useState } from 'react';
import {
  ShieldAlert,
  Copy,
  Check,
  FileJson,
  FileSpreadsheet,
  Share2,
  Filter,
} from 'lucide-react';
import { IndicatorOfCompromise, InvestigationData } from '../../types/forensic';
import { Badge } from '../common/Badge';
import { exportIocsAsJson, exportIocsAsCsv, exportIocsAsStix } from '../../utils/exportUtils';

interface IocExtractionTableProps {
  iocs: IndicatorOfCompromise[];
  investigation: InvestigationData;
}

export const IocExtractionTable: React.FC<IocExtractionTableProps> = ({ iocs, investigation }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredIocs =
    filterType === 'ALL' ? iocs : iocs.filter((ioc) => ioc.type.toUpperCase() === filterType);

  const types = ['ALL', 'IP', 'DOMAIN', 'URL', 'EMAIL', 'HASH'];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Indicators of Compromise (IOC) Hub</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Actionable network & endpoint observables extracted for SIEM / SOAR threat hunting
            </p>
          </div>
        </div>

        {/* Export IOCs Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportIocsAsJson(iocs, investigation.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            title="Export JSON payload"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => exportIocsAsCsv(iocs, investigation.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            title="Export CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => exportIocsAsStix(iocs, investigation)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-50 dark:bg-cyan-950/80 hover:bg-cyan-100 dark:hover:bg-cyan-900/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 transition-colors shadow-xs"
            title="Export OASIS STIX 2.1 CTI format"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>STIX 2.1</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <span className="text-xs font-mono text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              filterType === type
                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/50 font-bold'
                : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
        <span className="ml-auto text-xs font-mono text-slate-500 dark:text-slate-400">
          Showing {filteredIocs.length} of {iocs.length} IOCs
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase text-[11px] bg-slate-100/70 dark:bg-slate-900/60">
              <th className="p-3 font-semibold">Type</th>
              <th className="p-3 font-semibold">Indicator Observable</th>
              <th className="p-3 font-semibold">Risk Level</th>
              <th className="p-3 font-semibold">Forensic Justification</th>
              <th className="p-3 font-semibold text-right">Copy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
            {filteredIocs.map((ioc) => (
              <tr key={ioc.id} className="hover:bg-white dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-3 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-800 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 text-[11px]">
                    {ioc.type}
                  </span>
                </td>

                <td className="p-3 text-cyan-800 dark:text-cyan-300 font-semibold max-w-xs sm:max-w-sm truncate" title={ioc.indicator}>
                  {ioc.indicator}
                </td>

                <td className="p-3">
                  <Badge level={ioc.risk} size="sm" />
                </td>

                <td className="p-3 max-w-sm text-slate-700 dark:text-slate-300 text-xs font-sans leading-relaxed">
                  {ioc.reason}
                </td>

                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => copyToClipboard(ioc.indicator, ioc.id)}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                    title="Copy indicator value"
                  >
                    {copiedId === ioc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
