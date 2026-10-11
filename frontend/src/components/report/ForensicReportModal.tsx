import { buildPlainSummary } from '../../utils/plainSummary';
import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Lock,
  Globe,
  FileCode,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Cpu,
} from 'lucide-react';
import { InvestigationData } from '../../types/forensic';
import { Badge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';
import { downloadFile } from '../../utils/exportUtils';

interface ForensicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigation: InvestigationData;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  isOpen,
  onClose,
  investigation,
}) => {
  const [reportMode, setReportMode] = useState<'simple' | 'technical'>('simple');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    downloadFile(
      `${investigation.id}_Forensic_Report.json`,
      JSON.stringify(investigation, null, 2),
      'application/json'
    );
  };

  const isPhishing = investigation.threatScore >= 60;
  const isSafe = investigation.threatScore < 30;
  const plain = buildPlainSummary(investigation); // sentences built from the real result
  const originHop = investigation.transmissionPath.find((h) => h.isSenderOrigin) || investigation.transmissionPath[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 dark:bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070b14]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                THREATMAILER REPORT
              </span>
              <span className="text-xs font-mono text-slate-500">ID: {investigation.id}</span>
            </div>

            {/* Mode Switcher: Simple vs Technical */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setReportMode('simple')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  reportMode === 'simple'
                    ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Simple Summary
              </button>
              <button
                onClick={() => setReportMode('technical')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  reportMode === 'technical'
                    ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Technical Forensics
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#1e60dc] hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/25 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div id="printable-report" className="p-6 sm:p-10 overflow-y-auto flex-1 space-y-8 text-slate-800 dark:text-slate-200">
          {/* Header Banner */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                {isPhishing ? (
                  <ShieldAlert className="w-7 h-7 text-rose-600" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                )}
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Email Threat Security Report
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ThreatMailer Security Audit • Automated Threat Assessment
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
              <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">{investigation.id}</p>
              <p>Generated: {new Date(investigation.createdAt).toLocaleDateString()} at {new Date(investigation.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>

          {/* USER-FRIENDLY VIEW: PLAIN ENGLISH & INTUITIVE FOR ALL USERS */}
          {reportMode === 'simple' && (
            <div className="space-y-8">
              {/* Verdict Banner */}
              <div
                className={`p-6 rounded-3xl border ${
                  isPhishing
                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                    : isSafe
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                    : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        isPhishing
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                          : isSafe
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200'
                      }`}
                    >
                      {isPhishing ? '🚨 Dangerous Phishing Attack' : isSafe ? '✅ Verified Safe Email' : '⚠️ Suspicious Email'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {isPhishing
                        ? 'Do Not Trust This Email'
                        : isSafe
                        ? 'This Email Appears Legitimate'
                        : 'Exercise Caution Before Opening'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                      {investigation.summary}
                    </p>
                  </div>

                  {/* Visual Threat Meter */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shrink-0 min-w-[140px] shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Threat Score
                    </span>
                    <span
                      className={`text-3xl font-black ${
                        isPhishing ? 'text-rose-600' : isSafe ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {investigation.threatScore}
                    </span>
                    <span className="text-xs text-slate-400 font-bold block -mt-1">/ 100</span>
                    <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
                      {isPhishing ? 'Severe Risk' : isSafe ? 'Minimal Risk' : 'Moderate Risk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Plain English Key Findings Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>At a Glance: What We Discovered</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: Sender Truth */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span>Sender Identity</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {plain.sender}
                    </p>
                  </div>

                  {/* Card 2: Links & Buttons */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>Web Links & Buttons</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {plain.links}
                    </p>
                  </div>

                  {/* Card 3: Language & Urgency */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Psychological Triggers</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {plain.urgency}
                    </p>
                  </div>

                  {/* Card 4: Official Security Checks */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Lock className="w-4 h-4 text-emerald-500" />
                      <span>Cryptographic Checks</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {plain.auth}
                    </p>
                  </div>
                </div>
              </div>

              {/* What You Should Do Section */}
              <div className="p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-4">
                <h3 className="text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Recommended Action for Everyone</span>
                </h3>

                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {isPhishing ? (
                    <>
                      <li className="flex items-start gap-2.5">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span><strong>Do NOT click any links</strong> or enter login credentials.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span><strong>Do NOT open attachments</strong> (e.g., invoices or ZIP files).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>Delete or mark as phishing</strong> in your email client.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span><strong>If you already clicked or typed a password</strong>, immediately navigate directly to the official website and change your account password.</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Safe to read. No urgent security actions required.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Always ensure links take you to expected secure websites with HTTPS.</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* TECHNICAL VIEW: DEEP FORENSICS (FOR SOC ANALYSTS & AUDITORS) */}
          {reportMode === 'technical' && (
            <div className="space-y-6">
              {/* Technical Executive Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="sm:col-span-2 space-y-2">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    Classification & Heuristic Verdict
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{investigation.classification}</span>
                    <Badge level={investigation.riskLevel} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{investigation.summary}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[11px] font-mono text-slate-500 uppercase mb-2">Composite Score</span>
                  <ScoreGauge score={investigation.threatScore} riskLevel={investigation.riskLevel} size={100} />
                </div>
              </div>

              {/* Message Metadata */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-mono text-blue-600 uppercase tracking-wider">
                  RFC 5322 Metadata & Originating Host
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block">FROM:</span>
                    <span className="text-slate-800 dark:text-slate-200 break-all">{investigation.emailHeaders.from}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">TO:</span>
                    <span className="text-slate-800 dark:text-slate-200 break-all">{investigation.emailHeaders.to}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">REPLY-TO:</span>
                    <span className="text-slate-800 dark:text-slate-200 break-all">{investigation.emailHeaders.replyTo || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">SENDER ORIGIN IP:</span>
                    <span className="text-blue-600 font-bold">{originHop?.ip || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Authentication */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-mono text-blue-600 uppercase tracking-wider">
                  Cryptographic Authentication (SPF / DKIM / DMARC)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">SPF Record:</span>
                      <Badge level={investigation.authentication.spf.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{investigation.authentication.spf.details}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">DKIM Signature:</span>
                      <Badge level={investigation.authentication.dkim.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{investigation.authentication.dkim.details}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">DMARC Policy:</span>
                      <Badge level={investigation.authentication.dmarc.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{investigation.authentication.dmarc.details}</p>
                  </div>
                </div>
              </div>

              {/* Explainable Reasons */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold font-mono text-blue-600 uppercase tracking-wider">
                  Explainable Evidence Breakdown
                </h3>
                <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {investigation.explainableReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{reason.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{reason.evidence}</p>
                      </div>
                      <Badge level={reason.severity} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>ThreatMailer Cyber Defense SOC • Email Threat Analysis</span>
            <span>https://threatmailer.local • RFC 5322 Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};