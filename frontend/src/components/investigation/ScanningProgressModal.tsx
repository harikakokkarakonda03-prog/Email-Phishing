import React, { useEffect, useState } from 'react';
import {
  FileCode,
  ShieldCheck,
  Globe,
  Network,
  Link,
  Cpu,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface ScanningProgressModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface ScanStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SCAN_STEPS: ScanStep[] = [
  { id: 'parse', label: 'Parsing Email Structure & MIME Segments', icon: FileCode },
  { id: 'headers', label: 'Analyzing RFC 5322 Headers & Message-ID', icon: FileCode },
  { id: 'auth', label: 'Checking SPF, DKIM & DMARC Cryptographic Proofs', icon: ShieldCheck },
  { id: 'urls', label: 'Analyzing Embedded URLs & Redirection Vectors', icon: Link },
  { id: 'domains', label: 'Analyzing Domains & Homoglyph Typosquatting', icon: Globe },
  { id: 'ips', label: 'Analyzing IP Addresses & Geolocation Hops', icon: Network },
  { id: 'score', label: 'Synthesizing Explainable AI Threat Score', icon: Cpu },
];

export const ScanningProgressModal: React.FC<ScanningProgressModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const currentStep = SCAN_STEPS[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / SCAN_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/40 p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-center">
        {/* Radar Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-500/50 animate-spin" />
          <div className="relative w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-xl font-extrabold text-white mb-1 tracking-wide">
          Analyzing Email Threat Telemetry
        </h3>
        <p className="text-xs font-mono text-cyan-400 mb-6">
          AI-Powered Email Threat Detection, GeoLocation & Forensics
        </p>

        {/* Step Progression List */}
        <div className="space-y-2.5 text-left mb-6 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          {SCAN_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between text-xs font-mono transition-all ${
                  isCurrent
                    ? 'text-cyan-300 font-bold bg-cyan-950/40 px-2.5 py-1.5 rounded-lg border border-cyan-500/40'
                    : isCompleted
                    ? 'text-slate-300 px-2.5 py-1'
                    : 'text-slate-600 px-2.5 py-1'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-cyan-400 animate-pulse' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span className="truncate">{step.label}</span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <span className="text-[10px] text-slate-700">WAITING</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Active Pipeline: {currentStep?.label}</span>
          <span className="font-bold text-cyan-400">{progressPercent}%</span>
        </div>
      </div>
    </div>
  );
};
