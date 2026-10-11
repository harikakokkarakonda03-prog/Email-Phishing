import React, { useState } from 'react';
import { Link2, Copy, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { UrlAnalysisItem } from '../../types/forensic';
import { Badge } from '../common/Badge';

interface UrlAnalysisTableProps {
  urls: UrlAnalysisItem[];
}

export const UrlAnalysisTable: React.FC<UrlAnalysisTableProps> = ({ urls }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDefanged, setShowDefanged] = useState(true);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Embedded URL & Link Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Heuristic audit for HTTP unencrypted endpoints, lookalike domains, and redirection chains
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showDefanged}
              onChange={(e) => setShowDefanged(e.target.checked)}
              className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-cyan-600 focus:ring-0"
            />
            <span>Defang Links (hxxp://)</span>
          </label>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-800 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
            {urls.length} URLs Detected
          </span>
        </div>
      </div>

      {urls.length === 0 ? (
        <div className="p-6 text-center text-slate-500 dark:text-slate-400 font-mono text-xs">
          <ShieldCheck className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
          No external hyperlinks or embedded URLs detected in this email message.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase text-[11px] bg-slate-100/70 dark:bg-slate-900/60">
                <th className="p-3 font-semibold">Analyzed URL</th>
                <th className="p-3 font-semibold">Target Domain</th>
                <th className="p-3 font-semibold">Protocol</th>
                <th className="p-3 font-semibold">Redirect Chain</th>
                <th className="p-3 font-semibold">Risk Level</th>
                <th className="p-3 font-semibold">Forensic Reason</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
              {urls.map((item) => (
                <tr key={item.id} className="hover:bg-white dark:hover:bg-slate-800/30 transition-colors">
                  {/* URL */}
                  <td className="p-3 max-w-xs truncate text-cyan-800 dark:text-cyan-300 font-semibold" title={item.url}>
                    {showDefanged ? item.defanged : item.url}
                  </td>

                  {/* Domain */}
                  <td className="p-3 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                    {item.domain}
                  </td>

                  {/* Protocol */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.protocol === 'HTTP'
                          ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/80 dark:text-red-400 dark:border-red-800/80'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800/80'
                      }`}
                    >
                      {item.protocol}
                    </span>
                  </td>

                  {/* Redirect Chain */}
                  <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                    {item.redirectChain.length > 1 ? (
                      <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                        <span>{item.redirectChain.length} Hops</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="truncate">{item.redirectChain[item.redirectChain.length - 1]}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Direct Link</span>
                    )}
                  </td>

                  {/* Risk */}
                  <td className="p-3">
                    <Badge level={item.risk} size="sm" />
                  </td>

                  {/* Reason */}
                  <td className="p-3 max-w-sm text-slate-700 dark:text-slate-300 text-xs font-sans leading-relaxed">
                    {item.reason}
                  </td>

                  {/* Action */}
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => copyToClipboard(showDefanged ? item.defanged : item.url, item.id)}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
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
      )}
    </div>
  );
};
