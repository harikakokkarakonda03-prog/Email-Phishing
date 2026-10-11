import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { AuthenticationResult } from '../../types/forensic';
import { Badge } from '../common/Badge';

interface AuthenticationCardProps {
  auth: AuthenticationResult;
}

export const AuthenticationCard: React.FC<AuthenticationCardProps> = ({ auth }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'SOFTFAIL':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-400 dark:text-slate-500" />;
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Email Authentication Forensics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">SPF, DKIM, and DMARC verification results</p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">RFC 7208 / RFC 6376 / RFC 7489</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* SPF */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">SPF (Sender Policy)</span>
              <div className="flex items-center gap-1.5">
                {getStatusIcon(auth.spf.status)}
                <Badge level={auth.spf.status} size="sm" />
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">{auth.spf.details}</p>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
            <span>Domain: {auth.spf.domain}</span>
          </div>
        </div>

        {/* DKIM */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">DKIM (Signature)</span>
              <div className="flex items-center gap-1.5">
                {getStatusIcon(auth.dkim.status)}
                <Badge level={auth.dkim.status} size="sm" />
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">{auth.dkim.details}</p>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
            <span>Selector: {auth.dkim.selector}</span>
          </div>
        </div>

        {/* DMARC */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">DMARC (Enforcement)</span>
              <div className="flex items-center gap-1.5">
                {getStatusIcon(auth.dmarc.status)}
                <Badge level={auth.dmarc.status} size="sm" />
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">{auth.dmarc.details}</p>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500">
            <span>Policy: {auth.dmarc.policy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
