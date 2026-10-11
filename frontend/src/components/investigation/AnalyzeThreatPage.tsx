import React, { useState, useRef } from 'react';
import {
  Link2,
  Mail,
  FileText,
  Paperclip,
  UploadCloud,
  Search,
  CheckCircle2,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

type InputTab = 'url' | 'headers' | 'body' | 'pdf' | 'other';

interface AnalyzeThreatPageProps {
  onAnalyze: (content: string, fileName?: string) => void;
  onOpenReportHistory?: () => void;
}

export const AnalyzeThreatPage: React.FC<AnalyzeThreatPageProps> = ({
  onAnalyze,
}) => {
  const [activeTab, setActiveTab] = useState<InputTab>('url');

  // Input states
  const [urlInput, setUrlInput] = useState('');
  const [headersInput, setHeadersInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTabSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'url') {
      if (!urlInput.trim()) return;
      const clean = urlInput.trim();
      const normalized = clean.startsWith('http://') || clean.startsWith('https://') ? clean : `https://${clean}`;
      onAnalyze(normalized, `URL: ${normalized}`);
    } else if (activeTab === 'headers') {
      if (!headersInput.trim()) return;
      onAnalyze(headersInput.trim(), 'Raw Email Headers');
    } else if (activeTab === 'body') {
      if (!bodyInput.trim()) return;
      // Send only what the user pasted. The old code added a made-up sender that was then analysed as real.
      onAnalyze(bodyInput.trim(), 'Email Body Content');
    } else if (activeTab === 'pdf' || activeTab === 'other') {
      // The old code analysed a made-up invoice when no file was chosen. Now nothing happens until a file is chosen.
      if (!selectedFile) return;
      if (!/\.(eml|txt)$/i.test(selectedFile.name)) {
        window.alert('Only .eml or .txt email files can be analysed right now.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        if (text.trim()) onAnalyze(text, selectedFile.name);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* Top Bar with "Smarter Analysis. Safer You." (matching Photo 2 header) */}
      <div className="flex items-center justify-between">
        <div className="md:hidden">
          <span className="text-xl font-bold text-slate-900 dark:text-white">ThreatMailer</span>
        </div>
        <div className="hidden md:block" />

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
          Smarter Analysis. Safer You.
        </div>
      </div>

      {/* Main Container Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analyze a Threat
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter the details below to analyze the email, URL, file or attachment.
          </p>
        </div>

        {/* 5-Tab Switcher (matching Photo 2 Tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'url'
              ? 'bg-[#1e60dc] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Link2 className="w-4 h-4" />
            <span>URL</span>
          </button>

          <button
            onClick={() => setActiveTab('headers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'headers'
              ? 'bg-[#1e60dc] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Headers</span>
          </button>

          <button
            onClick={() => setActiveTab('body')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'body'
              ? 'bg-[#1e60dc] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Email Body</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'pdf'
              ? 'bg-[#1e60dc] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <FileCode className="w-4 h-4" />
            <span>PDF / File</span>
          </button>

          <button
            onClick={() => setActiveTab('other')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'other'
              ? 'bg-[#1e60dc] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Other Files</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <form onSubmit={handleTabSubmit}>
          <div className="w-full space-y-4">
            {/* TAB 1: URL INPUT */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Enter URL
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Website address or direct download link
                  </span>
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full text-xs font-mono p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {/* TAB 2: EMAIL HEADERS INPUT (matching Photo 2 Panel 3) */}
            {activeTab === 'headers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Headers
                  </label>
                  <span className="text-[11px] text-slate-400">
                    RFC 5322 Raw Headers
                  </span>
                </div>
                <textarea
                  value={headersInput}
                  onChange={(e) => setHeadersInput(e.target.value)}
                  rows={8}
                  placeholder="From: example@domain.com&#10;To: user@company.com&#10;Subject: Invoice Update&#10;Received: from ..."
                  className="w-full text-xs font-mono p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                />
              </div>
            )}

            {/* TAB 3: EMAIL BODY INPUT (matching Photo 2 Panel 4) */}
            {activeTab === 'body' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Body
                </label>
                <textarea
                  value={bodyInput}
                  onChange={(e) => setBodyInput(e.target.value)}
                  rows={8}
                  placeholder="Paste the email content here..."
                  className="w-full text-xs font-mono p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                />
              </div>
            )}

            {/* TAB 4 & 5: PDF / FILE & OTHER FILES (matching Photo 2 Panel 5) */}
            {(activeTab === 'pdf' || activeTab === 'other') && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.png,.eml,.msg"
                />

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${isDragging
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/80'
                    }`}
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-7 h-7 stroke-[1.8]" />
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Drag & drop a file here
                  </p>
                  <p className="text-[11px] text-slate-400 my-2">or</p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Choose File
                  </button>

                  {selectedFile && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100/70 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono">
                      <span>{selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Supported formats: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (Max 10MB)
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1e60dc] hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.005]"
            >
              <Search className="w-4 h-4 stroke-[2.4]" />
              <span>Analyze</span>
            </button>
          </div>
        </form>
      </div>

      {/* WORKFLOW SECTION (matching Photo 2 bottom) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Workflow
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            From input to threat report in a few simple steps
          </p>
        </div>

        {/* 4 Blue Circular Steps Connected by Arrows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                1. Provide Input
              </span>
              <p className="text-[11px] text-slate-500">
                (URL / Headers / Body / File)
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                2. Extract Information
              </span>
              <p className="text-[11px] text-slate-500">
                (links, domains, IPs, keywords)
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                3. Analyze
              </span>
              <p className="text-[11px] text-slate-500">
                (AI / NLP heuristics)
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                4. Show Results
              </span>
              <p className="text-[11px] text-slate-500">
                (Threat score + Evidence)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
