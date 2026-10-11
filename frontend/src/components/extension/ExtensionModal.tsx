import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  Puzzle,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  FolderArchive,
  ToggleRight,
  FolderOpen,
  MailCheck,
} from 'lucide-react';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: 1,
      title: 'Download & Unzip',
      desc: 'Download the extension package and extract the ZIP file into a folder on your computer.',
      icon: FolderArchive,
      badge: 'Step 1',
    },
    {
      num: 2,
      title: 'Open Chrome Extensions',
      desc: 'Type chrome://extensions in your Chrome address bar, or go to Menu → Extensions → Manage Extensions.',
      icon: ToggleRight,
      badge: 'Step 2',
      copyable: 'chrome://extensions',
    },
    {
      num: 3,
      title: 'Enable Developer Mode',
      desc: 'In the top-right corner of the Extensions page, switch the "Developer mode" toggle ON.',
      icon: ToggleRight,
      badge: 'Step 3',
    },
    {
      num: 4,
      title: 'Click "Load unpacked"',
      desc: 'Click "Load unpacked" in the top-left corner and select the extracted extension folder.',
      icon: FolderOpen,
      badge: 'Step 4',
    },
    {
      num: 5,
      title: 'Open Gmail & Protect',
      desc: 'Open mail.google.com. The ThreatMailer badge will protect your inbox and alert you to phishing emails!',
      icon: MailCheck,
      badge: 'Step 5',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Puzzle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">ThreatMailer Chrome Extension</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400 text-slate-900">
                  Live Cloud
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Real-time phishing & scam detection directly inside Gmail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Quick Download Card */}
          <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Extension Ready for Any Computer
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Connected to your live Render backend & Vercel intelligence engine.
              </p>
            </div>
            <a
              href="/email-forensics-extension.zip"
              download="email-forensics-extension.zip"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0 hover:scale-[1.02]"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span>Download (.ZIP)</span>
            </a>
          </div>

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              How to Install (Takes 30 seconds)
            </h4>

            <div className="space-y-3">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.num}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-4 transition-all hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {s.num}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {s.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {s.desc}
                      </p>

                      {s.copyable && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <code className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-blue-600 dark:text-blue-400">
                            {s.copyable}
                          </code>
                          <button
                            onClick={copyUrl}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Works on Google Chrome, Brave, and Edge
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
