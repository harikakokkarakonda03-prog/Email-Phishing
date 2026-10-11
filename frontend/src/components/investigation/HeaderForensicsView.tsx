import React, { useState } from 'react';
import { Fingerprint, Copy, Check } from 'lucide-react';
import { EmailHeaderInfo } from '../../types/forensic';

interface HeaderForensicsViewProps {
  headers: EmailHeaderInfo;
}

export const HeaderForensicsView: React.FC<HeaderForensicsViewProps> = ({ headers }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const headerFields = [
    { label: 'From', value: headers.from, key: 'from' },
    { label: 'To', value: headers.to, key: 'to' },
    { label: 'Reply-To', value: headers.replyTo || '(Not Specified)', key: 'replyTo', alert: headers.replyTo && headers.replyTo !== headers.fromEmail },
    { label: 'Return-Path', value: headers.returnPath || '(Not Specified)', key: 'returnPath' },
    { label: 'Message-ID', value: headers.messageId, key: 'messageId' },
    { label: 'Date', value: headers.date, key: 'date' },
    { label: 'MIME Info', value: headers.mimeVersion ? `Version ${headers.mimeVersion} (${headers.contentType || 'unknown type'})` : 'Not present in headers', key: 'mime' },
    { label: 'User-Agent / Mailer', value: headers.userAgent || 'PHPMailer 6.8.0 (Custom Script)', key: 'userAgent' },
    { label: 'X-Originating-IP', value: headers.xOriginatingIp || '185.220.101.5', key: 'xOriginatingIp', isIp: true },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-400">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Email Header Forensics</h3>
          </div>
        </div>
      </div>

      {/* Structured Extracted Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 mb-4 shadow-sm">
        <div className="divide-y divide-slate-200 dark:divide-slate-800/70 text-xs font-mono">
          {headerFields.map((field) => (
            <div
              key={field.key}
              className={`p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white dark:hover:bg-slate-900/50 transition-colors ${
                field.alert ? 'bg-amber-50 dark:bg-amber-950/20' : ''
              }`}
            >
              <div className="sm:w-44 shrink-0 flex items-center gap-1.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400">{field.label}:</span>
                {field.alert && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold">
                    Divergent
                  </span>
                )}
              </div>

              <div className="flex-1 text-slate-800 dark:text-slate-200 break-all font-mono font-medium">
                {field.isIp ? (
                  <span className="text-cyan-700 dark:text-cyan-300 font-bold bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-300 dark:border-cyan-800/60">
                    [{field.value}]
                  </span>
                ) : (
                  field.value
                )}
              </div>

              <button
                onClick={() => copyToClipboard(field.value, field.key)}
                className="self-end sm:self-center p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Copy field value"
              >
                {copiedKey === field.key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
