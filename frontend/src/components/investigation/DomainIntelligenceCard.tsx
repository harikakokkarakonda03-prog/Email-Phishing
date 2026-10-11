import React from 'react';
import { Globe, AlertTriangle } from 'lucide-react';
import { DomainIntelligenceItem } from '../../types/forensic';
import { Badge } from '../common/Badge';

interface DomainIntelligenceCardProps {
  domains: DomainIntelligenceItem[];
}

export const DomainIntelligenceCard: React.FC<DomainIntelligenceCardProps> = ({ domains }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Domain Intelligence & Typosquatting Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              WHOIS registration age, homoglyph character substitution, and brand impersonation audit
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-800 dark:text-cyan-400 font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {domains.length} Domain Entities
        </span>
      </div>

      <div className="space-y-6">
        {domains.map((item, index) => {
          const ageUnknown = item.ageDays < 0; // the backend sends -1 when the registry has no data
          const isNewlyRegistered = !ageUnknown && item.ageDays <= 30;

          return (
            <div
              key={index}
              className={`p-5 rounded-xl border transition-all ${
                item.reputation === 'MALICIOUS'
                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/70'
                  : item.reputation === 'SUSPICIOUS'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/70'
                  : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header: Domain Name, Risk Score & Reputation Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-mono font-bold text-slate-900 dark:text-white tracking-wide">
                      {item.domain}
                    </h4>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      TLD Category: <span className="text-cyan-700 dark:text-cyan-300 font-semibold">{item.tld}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block uppercase">Risk Score</span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        item.riskScore >= 75
                          ? 'text-red-600 dark:text-red-400'
                          : item.riskScore >= 40
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.riskScore} / 100
                    </span>
                  </div>
                  <Badge level={item.reputation} size="md" />
                </div>
              </div>

              {/* Look-alike / Typosquatting Callout */}
              {item.lookalikeTarget && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/80 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-2 mb-1 text-red-800 dark:text-red-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>HOMOGLYPH TYPOSQUATTING ATTACK IDENTIFIED:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="p-2 rounded bg-white dark:bg-black/40 border border-red-200 dark:border-red-900/50 shadow-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold">TARGET TRUSTED BRAND:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">{item.lookalikeTarget}</span>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-black/40 border border-red-200 dark:border-red-900/50 shadow-xs">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold">SUSPICIOUS FORGED DOMAIN:</span>
                      <span className="text-red-600 dark:text-red-400 font-bold">{item.domain}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-slate-700 dark:text-slate-200 font-sans text-xs">
                    <span className="font-semibold text-red-700 dark:text-red-300 font-mono">Forensic Reason: </span>
                    {item.similarityReason || 'Domain uses character substitution to imitate a trusted organization.'}
                  </p>
                </div>
              )}

              {/* WHOIS Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-white dark:bg-black/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">REGISTRAR:</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate block font-medium" title={item.registrar}>
                    {item.registrar}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">DOMAIN AGE:</span>
                  <span className={`font-bold ${ageUnknown ? 'text-slate-500 dark:text-slate-400' : isNewlyRegistered ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {ageUnknown ? 'Unknown' : `${item.ageDays} Days ${isNewlyRegistered ? '(Newly Registered)' : '(Established)'}`}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">CREATION DATE:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate block">
                    {item.creationDate.split('T')[0]}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold">EXPIRY DATE:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate block">
                    {item.expiryDate.split('T')[0]}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
                  <span className="text-slate-500 text-[10px] font-semibold">NAMESERVERS:</span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
                    {item.nameservers.join(' • ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
