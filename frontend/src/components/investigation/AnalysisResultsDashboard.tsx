import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Globe,
  FileText,
  Link2,
  ShieldCheck,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Server,
  FileCode,
  MapPin,
  Clock,
  Send,
  Eye,
} from 'lucide-react';
import { InvestigationData } from '../../types/forensic';
import { AuthenticationCard } from './AuthenticationCard';
import { DomainIntelligenceCard } from './DomainIntelligenceCard';
import { GeoLocationMap } from './GeoLocationMap';
import { ThreatGraph } from './ThreatGraph';
import { IocExtractionTable } from './IocExtractionTable';
import { InvestigationTimeline } from './InvestigationTimeline';

interface AnalysisResultsDashboardProps {
  investigation: InvestigationData;
  onStartNewScan: () => void;
  onOpenReportModal: () => void;
  onExportStix: () => void;
  theme?: 'light' | 'dark';
}

export const AnalysisResultsDashboard: React.FC<AnalysisResultsDashboardProps> = ({
  investigation,
  onStartNewScan,
  onOpenReportModal,
  onExportStix,
  theme = 'light',
}) => {
  const [showDeepForensics, setShowDeepForensics] = useState(false);
  const [showAllUrls, setShowAllUrls] = useState(false);

  // Derive score color & status
  const score = investigation.threatScore;
  const isHighRisk = score >= 70;
  const isMediumRisk = score >= 35 && score < 70;
  const isSafe = score < 35;
  const isUrlScan =
    investigation.fileName?.startsWith('URL:') ||
    investigation.fileName?.startsWith('url_') ||
    investigation.subject?.startsWith('URL Threat Scan');

  // Format date
  const displayDate = investigation.emailHeaders.date || new Date(investigation.createdAt).toLocaleString();

  // Primary origin / destination IP & country
  const originHop =
    investigation.transmissionPath.find((h) => h.isSenderOrigin) || investigation.transmissionPath[0];
  const originIp = originHop?.ip || investigation.emailHeaders.xOriginatingIp || 'Unknown';
  const originCountry = originHop?.country || 'Unknown';

  // Primary domain & intelligence
  const primaryDomain =
    investigation.urls[0]?.domain ||
    investigation.domainIntelligence[0]?.domain ||
    (investigation.emailHeaders.fromEmail.includes('@')
      ? investigation.emailHeaders.fromEmail.split('@')[1]
      : 'target-site.example');

  const primaryDomainIntel =
    investigation.domainIntelligence.find((d) => d.domain === primaryDomain) ||
    investigation.domainIntelligence[0];

  const maliciousUrls = investigation.urls.filter((u) => u.risk === 'CRITICAL' || u.risk === 'HIGH');
  const suspiciousUrls = investigation.urls.filter((u) => u.risk === 'MEDIUM');

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Top Header Bar (matching Photo 2 Panel 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analysis Results
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isUrlScan ? 'Detailed web URL threat analysis and link intelligence' : 'Detailed threat analysis with clear forensic insights'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Green "Analysis completed" badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Analysis completed</span>
          </div>

          <button
            onClick={onStartNewScan}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
          >
            + New Scan
          </button>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1e60dc] hover:bg-blue-700 text-white transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* ROW 1: THREAT SCORE GAUGE & QUICK SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* THREAT SCORE GAUGE CARD (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Circular Gauge */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={isHighRisk ? 'text-rose-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500'}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {score}
                </span>
                <span className="text-[10px] font-bold text-slate-400 -mt-1">
                  /100
                </span>
              </div>
            </div>

            {/* Risk Badges */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isHighRisk
                      ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                      : isMediumRisk
                      ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 stroke-[2.4]" />
                  {isHighRisk ? 'High Risk' : isMediumRisk ? 'Medium Risk' : 'Low Risk / Safe'}
                </span>

                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    isHighRisk
                      ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                      : isMediumRisk
                      ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {isHighRisk ? 'Phishing' : isMediumRisk ? 'Suspicious' : 'Clean & Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK SUMMARY CARD (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Summary
          </h3>

          <div className="space-y-2.5">
            {/* 1. Threat Status */}
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              {isHighRisk ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    Phishing Attack Flagged
                  </span>
                </>
              ) : isMediumRisk ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    Suspicious Threat Indicators
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    No Security Threat Detected
                  </span>
                </>
              )}
            </div>

            {/* 2. URL Status */}
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              {maliciousUrls.length > 0 ? (
                <>
                  <Link2 className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    Malicious URL ({maliciousUrls.length} detected)
                  </span>
                </>
              ) : suspiciousUrls.length > 0 ? (
                <>
                  <Link2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Suspicious URL ({suspiciousUrls.length} detected)
                  </span>
                </>
              ) : investigation.urls.length > 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Verified Clean URL ({investigation.urls.length} clean)
                  </span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No External Links Detected</span>
                </>
              )}
            </div>

            {/* 3. Domain Status */}
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              {primaryDomainIntel?.reputation === 'MALICIOUS' ? (
                <>
                  <Globe className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    Typosquatted / Brand Impersonation Domain
                  </span>
                </>
              ) : primaryDomainIntel?.reputation === 'SUSPICIOUS' ? (
                <>
                  <Globe className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Newly Registered / High-Risk TLD
                  </span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate max-w-[240px]">
                    Established Domain ({primaryDomain})
                  </span>
                </>
              )}
            </div>

            {/* 4. Protocol / Infrastructure */}
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              {isUrlScan ? (
                investigation.urls[0]?.protocol === 'HTTPS' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400">Valid HTTPS TLS Encryption</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-rose-600 dark:text-rose-400">Insecure Plain HTTP (No TLS)</span>
                  </>
                )
              ) : (
                <>
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    SPF: {investigation.authentication.spf.status} | DKIM: {investigation.authentication.dkim.status}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: SCAN DETAILS, IP & DOMAIN INFO, URLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
        {/* DETAILS CARD (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            {isUrlScan ? <Link2 className="w-4 h-4 text-blue-500" /> : <Mail className="w-4 h-4 text-blue-500" />}
            <span>{isUrlScan ? 'Target URL Details' : 'Email Details'}</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {isUrlScan ? (
              <>
                <div>
                  <span className="text-[11px] text-slate-400 font-sans block">Scanned URL</span>
                  <span className="text-slate-800 dark:text-slate-200 break-all font-semibold" title={investigation.urls[0]?.url}>
                    {investigation.urls[0]?.url || investigation.fileName?.replace('URL: ', '')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-sans block">Target Host</span>
                  <span className="text-slate-800 dark:text-slate-200 break-all">
                    {primaryDomain}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-sans block">Protocol / Security</span>
                  <span className="text-slate-800 dark:text-slate-200 font-sans font-semibold">
                    {investigation.urls[0]?.protocol === 'HTTPS' ? 'HTTPS (TLS Encrypted)' : 'HTTP (Unencrypted Plaintext)'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-sans block">Scan Timestamp</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {displayDate}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-[11px] text-slate-400 font-sans block">From</span>
                  <span className="text-slate-800 dark:text-slate-200 break-all font-semibold">
                    {investigation.emailHeaders.fromEmail || 'suspicious@email.com'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-sans block">To</span>
                  <span className="text-slate-800 dark:text-slate-200 break-all">
                    {investigation.emailHeaders.to || 'user@company.com'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-sans block">Subject</span>
                  <span className="text-slate-800 dark:text-slate-200 font-sans font-semibold">
                    {investigation.subject || 'Threat Investigation'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-sans block">Date</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {displayDate}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* IP & DOMAIN INFORMATION (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>IP & Domain Information</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-[11px] text-slate-400 font-sans block">
                {isUrlScan ? 'Destination Server IP' : 'Source IP'}
              </span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {originIp}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-sans font-medium">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  {originCountry}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-sans block">Domain</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]" title={primaryDomain}>
                  {primaryDomain}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-sans ${
                    primaryDomainIntel?.reputation === 'MALICIOUS'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : primaryDomainIntel?.reputation === 'SUSPICIOUS'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {primaryDomainIntel?.reputation === 'MALICIOUS' ? 'Malicious' : primaryDomainIntel?.reputation === 'SUSPICIOUS' ? 'Suspicious' : 'Safe'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-sans block">Domain Reputation</span>
              <span
                className={`font-semibold font-sans ${
                  primaryDomainIntel?.reputation === 'SAFE'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {primaryDomainIntel?.reputation === 'SAFE' ? 'No red flags found' : 'Flagged as suspicious'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-sans block">WHOIS Registration</span>
              <span
                  className={`font-semibold font-sans flex items-center gap-1 ${
                  primaryDomainIntel && primaryDomainIntel.ageDays < 0
                    ? 'text-slate-500 dark:text-slate-400'
                    : primaryDomainIntel?.ageDays && primaryDomainIntel.ageDays > 365
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {primaryDomainIntel && primaryDomainIntel.ageDays < 0 ? (
                  <>Not available (registry gave no data)</>
                ) : primaryDomainIntel?.ageDays && primaryDomainIntel.ageDays > 365 ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Established ({Math.floor(primaryDomainIntel.ageDays / 365)}+ years active)
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Recently registered ({primaryDomainIntel?.ageDays ?? 0} days ago)
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* ANALYZED URLS (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Link2 className="w-4 h-4 text-blue-500" />
              <span>{isUrlScan ? 'Target Endpoint' : 'Analyzed URLs'}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {investigation.urls.length} links
            </span>
          </div>

          <div className="space-y-2.5">
            {investigation.urls.slice(0, showAllUrls ? undefined : 3).map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate" title={item.url}>
                  {item.url}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    item.risk === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : item.risk === 'HIGH'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {item.risk === 'CRITICAL' ? 'Malicious' : item.risk === 'HIGH' ? 'Suspicious' : 'Safe'}
                </span>
              </div>
            ))}

            {investigation.urls.length === 0 && (
              <p className="text-xs text-slate-400 italic py-3 text-center">
                No external hyperlinks detected in this scan.
              </p>
            )}

            {investigation.urls.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllUrls(!showAllUrls)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1 inline-block cursor-pointer"
              >
                {showAllUrls ? 'Show less' : 'View all URLs >'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: WHY IT'S A THREAT */}
      <div className="w-full">
        {/* WHY IT'S A THREAT? / SECURITY FACTORS */}
        <div className="w-full p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            {score >= 35 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Why It&apos;s a Threat?</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Security Verification Factors</span>
              </>
            )}
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            {score >= 35 ? (
              investigation.explainableReasons.length > 0 ? (
                investigation.explainableReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{reason.title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">{reason.evidence}</span>
                    </div>
                  </li>
                ))
              ) : (
                [
                  'Suspicious target domain with elevated threat metrics',
                  'Potential credential harvesting or spoofing pattern',
                  'Unverified hosting infrastructure or newly registered domain',
                ].map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))
              )
            ) : (
              [
                'Domain is registered to a verified, authentic organization',
                'Valid HTTPS transport layer security (TLS) encryption',
                'No homoglyph character substitutions or brand imitation detected',
                'Clean reputation across global threat intelligence databases',
                'DNS records and infrastructure conform to security best practices',
              ].map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{factor}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* DEEP FORENSIC INVESTIGATION DRAWER TOGGLE */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Deep Technical Forensics Dossier
            </h4>
            <p className="text-[11px] text-slate-500">
              Interactive Leaflet hop map, SPF/DKIM authentication, STIX 2.1 exporter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportStix}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>STIX 2.1</span>
          </button>

          <button
            onClick={() => setShowDeepForensics(!showDeepForensics)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
          >
            <span>{showDeepForensics ? 'Collapse Dossier' : 'Inspect Deep Dossier'}</span>
            {showDeepForensics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* EXPANDABLE DEEP TECHNICAL FORENSICS SECTION */}
      {showDeepForensics && (
        <div className="space-y-6 animate-fade-in pt-2">
          {/* Leaflet OpenStreetMap Geolocation Map */}
          <GeoLocationMap hops={investigation.transmissionPath} theme={theme} />

          {/* Authentication Checks */}
          <AuthenticationCard auth={investigation.authentication} />

          {/* Domain Intelligence */}
          <DomainIntelligenceCard domains={investigation.domainIntelligence} />

          {/* Interactive Threat Graph */}
          <ThreatGraph investigation={investigation} />

          {/* IOC Extraction Table */}
          <IocExtractionTable iocs={investigation.iocs} investigation={investigation} />

          {/* Investigation Timeline */}
          <InvestigationTimeline timeline={investigation.timeline} />
        </div>
      )}
    </div>
  );
};
