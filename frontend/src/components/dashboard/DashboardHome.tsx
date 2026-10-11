import React from 'react';
import {
  Search,
  Mail,
  Shield,
  ShieldCheck,
  Brain,
  FileText,
  AlertTriangle,
  ArrowRight,
  Check,
  Fish,
  Bug,
  Lock,
  Send,
  PlayCircle,
} from 'lucide-react';
import { NavTab } from '../common/Sidebar';

interface DashboardHomeProps {
  onNavigate: (tab: NavTab) => void;
  onAnalyzeContent: (content: string, sampleName?: string) => void;
  onLoadSample: (sampleType: 'safe' | 'suspicious') => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onNavigate,
  onLoadSample,
}) => {
  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 w-full max-w-[1700px] mx-auto animate-fade-in">
      {/* Top Header Row with AI Powered badge */}
      <div className="flex items-center justify-between">
        <div className="md:hidden">
          <span className="text-xl font-bold text-slate-900 dark:text-white">ThreatMailer</span>
        </div>
        <div className="hidden md:block" />

        {/* AI Powered Status Badge (matching top right of Photo 1) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>AI Powered</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </div>
      </div>

      {/* FULLSIZE MAIN WORKSPACE */}
      <div className="w-full space-y-8">
        {/* HERO BANNER CARD - FULL WIDTH */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-blue-100/90 dark:border-slate-800 p-8 sm:p-12 lg:p-14 shadow-xs">
          {/* Background subtle mesh glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Automated Email Forensic SOC</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                AI-Powered Email{' '}
                <span className="text-[#1e60dc] dark:text-blue-400">Threat Intelligence</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                Analyze - Detect - Report   </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('analyze')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#1e60dc] hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Analyze Email</span>
                </button>
              </div>
            </div>

            {/* Right Illustration: Shield with Envelope & Orbiting Badges */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                {/* Outer Dashed Orbit Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300/60 dark:border-blue-700/40 animate-[spin_60s_linear_infinite]" />

                {/* Inner Glow Circle */}
                <div className="absolute w-44 h-44 rounded-full bg-blue-100/50 dark:bg-blue-900/30 blur-xl" />

                {/* Central Shield Graphic */}
                <div className="relative w-32 h-36 rounded-3xl bg-gradient-to-b from-blue-500 to-[#1e60dc] flex items-center justify-center text-white shadow-2xl shadow-blue-500/35">
                  <div className="relative flex items-center justify-center">
                    <Shield className="w-24 h-24 fill-white/20 text-white stroke-[1.8]" />
                    <Mail className="w-10 h-10 text-white absolute top-5 drop-shadow-sm" />
                  </div>
                </div>

                {/* Orbiting Satellite Badges (matching Photo 1) */}
                {/* Top Right: Mail badge */}
                <div className="absolute top-2 right-8 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 shadow-md flex items-center justify-center text-blue-500 hover:scale-110 transition-transform">
                  <Mail className="w-4.5 h-4.5" />
                </div>

                {/* Mid Right: Warning Triangle */}
                <div className="absolute top-1/4 -right-2 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-slate-700 shadow-md flex items-center justify-center text-rose-500 hover:scale-110 transition-transform">
                  <AlertTriangle className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>

                {/* Mid-Low Right: Phishing Hook */}
                <div className="absolute bottom-1/4 -right-1 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow-md flex items-center justify-center text-sky-500 hover:scale-110 transition-transform">
                  <Fish className="w-4.5 h-4.5" />
                </div>

                {/* Bottom Right: Bug / Malware */}
                <div className="absolute bottom-2 right-10 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 shadow-md flex items-center justify-center text-purple-500 hover:scale-110 transition-transform">
                  <Bug className="w-4.5 h-4.5" />
                </div>

                {/* Bottom Left: Lock / Security */}
                <div className="absolute bottom-6 left-6 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 shadow-md flex items-center justify-center text-blue-600 hover:scale-110 transition-transform">
                  <Lock className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 FEATURE CARDS - FULL WIDTH (matching Photo 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Email Analysis */}
          <div
            onClick={() => onNavigate('analyze')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-blue-100/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Email Analysis
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Check for phishing, malware and suspicious links.
              </p>
            </div>
            <div className="mt-6 pt-2">
              <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* 2. Threat Overview */}
          <div
            onClick={() => onNavigate('intelligence')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Threat Overview
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Get latest threat indicators and patterns.
              </p>
            </div>
            <div className="mt-6 pt-2">
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* 3. AI Detection */}
          <div
            onClick={() => onNavigate('analyze')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-100/90 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                AI Detection
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Uses machine learning to classify threats.
              </p>
            </div>
            <div className="mt-6 pt-2">
              <span className="text-purple-600 dark:text-purple-400 text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* 4. Reports */}
          <div
            onClick={() => onNavigate('reports')}
            className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-orange-100/90 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Reports
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                View detailed analysis and risk score.
              </p>
            </div>
            <div className="mt-6 pt-2">
              <span className="text-orange-600 dark:text-orange-400 text-sm font-semibold flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS SECTION - FULL WIDTH (matching Photo 1) */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              How It Works
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              4-Step Automated Threat Pipeline
            </span>
          </div>

          {/* 4 Step Horizontal Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            {/* Step 1: Paste Email */}
            <div className="flex flex-col items-start space-y-2.5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 text-blue-600 flex items-center justify-center mb-1 shadow-xs">
                <Mail className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                1. Paste Email
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter the email content, raw headers, URL, or upload sample files.
              </p>
            </div>

            {/* Step 2: Analyze */}
            <div className="flex flex-col items-start space-y-2.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 text-emerald-600 flex items-center justify-center mb-1 shadow-xs">
                <Search className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                2. Analyze
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Our AI scans for threats, typosquatting domains, and suspicious patterns.
              </p>
            </div>

            {/* Step 3: Get Results */}
            <div className="flex flex-col items-start space-y-2.5">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200/80 dark:border-purple-800 text-purple-600 flex items-center justify-center mb-1 shadow-xs">
                <Shield className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                3. Get Results
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                See threat score, risk level, IP telemetry, and detailed evidence.
              </p>
            </div>

            {/* Step 4: Stay Safe */}
            <div className="flex flex-col items-start space-y-2.5">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800 text-teal-600 flex items-center justify-center mb-1 shadow-xs">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                4. Stay Safe
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Take action, download forensic reports, and export IOC STIX packages.
              </p>
            </div>
          </div>

          {/* Bottom Callout Banner - FULL WIDTH (matching Photo 1 bottom) */}
          <div className="relative rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/60 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/80 border border-blue-100/90 dark:border-slate-700/80 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
            <div className="flex items-start sm:items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                  <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    Protect yourself
                  </span>{' '}
                  from phishing, malware and social engineering attacks.
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  With AI, threat detection is faster, smarter and more accurate.
                </p>
              </div>
            </div>

            {/* Decorative flying mail icon on right */}
            <div className="hidden sm:flex items-center gap-2 text-blue-400 dark:text-blue-500/70 shrink-0">
              <div className="w-9 h-9 rounded-full border border-blue-200 dark:border-slate-700 flex items-center justify-center bg-white/50 dark:bg-slate-800/50">
                <Send className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
