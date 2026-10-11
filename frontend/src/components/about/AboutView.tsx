import React from 'react';
import {
  Shield,
  Brain,
  Mail,
  Zap,
  Lock,
  Search,
  CheckCircle2,
  FileText,
  Terminal,
  Cpu,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-[1400px] mx-auto animate-fade-in">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About ThreatMailer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Next-generation AI email threat detection, forensic header parsing, and cyber incident intelligence platform.
        </p>
      </div>

      {/* Main Mission Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-blue-100/90 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Shield className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI-Powered Email Security & Forensics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Engineered for SOC teams, fraud analysts, and enterprise incident response.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          ThreatMailer inspects inbound email communications across multiple threat vectors: RFC 5322 header forensics, cryptographic authentication (SPF/DKIM/DMARC), homoglyph brand impersonation detection, weaponized redirection link detangling, and IP hop infrastructure mapping.
        </p>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Explainable AI Scoring
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Multi-vector heuristic AI models break down threat factors into explainable, weighted evidence points for rapid SOC triage.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Header Parsing & Routing
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Extracts Received hops, validating each relay against GeoIP databases, ASN telemetry, and bulletproof host indicators.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            STIX 2.1 & PDF Reports
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Export extracted Indicators of Compromise (IOCs) in open threat-sharing standards or generate clean executive reports.
          </p>
        </div>
      </div>
    </div>
  );
};
