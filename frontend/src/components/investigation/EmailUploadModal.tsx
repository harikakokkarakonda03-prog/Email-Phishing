import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileCode,
  FileText,
  Sparkles,
  Link,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { PRESET_EMAILS } from '../../data/presets';
import { parseRawEmail } from '../../services/emailParser';

interface EmailUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitEmail: (rawContent: string, fileName?: string) => void;
}

export const EmailUploadModal: React.FC<EmailUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'presets' | 'upload' | 'headers' | 'body'>('url');
  const [inputUrl, setInputUrl] = useState('');
  const [pastedHeaders, setPastedHeaders] = useState('');
  const [pastedBody, setPastedBody] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle drag and drop .eml file
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };
    reader.readAsText(file);
  };

  // Preview extracted fields if file or pasted text exists
  const currentContentToPreview =
    activeTab === 'upload'
      ? fileContent
      : activeTab === 'headers'
      ? `${pastedHeaders}\n\n${pastedBody}`
      : activeTab === 'body'
      ? pastedBody
      : activeTab === 'url' && inputUrl
      ? `Subject: Security Alert regarding URL\nFrom: scanner@sec-soc.in\nTo: triage@defense-gov.in\n\nSuspicious URL target: ${inputUrl}`
      : '';

  const parsedPreview = currentContentToPreview ? parseRawEmail(currentContentToPreview) : null;

  const handleSubmit = () => {
    if (activeTab === 'url' && inputUrl.trim()) {
      const trimmedUrl = inputUrl.trim();
      const normalizedUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
        ? trimmedUrl
        : `https://${trimmedUrl}`;
      onSubmitEmail(normalizedUrl, `URL: ${normalizedUrl}`);
    } else if (activeTab === 'upload' && fileContent) {
      onSubmitEmail(fileContent, selectedFile?.name || 'uploaded_email.eml');
    } else if (activeTab === 'headers' && pastedHeaders) {
      onSubmitEmail(`${pastedHeaders}\n\n${pastedBody}`, 'pasted_headers.eml');
    } else if (activeTab === 'body' && pastedBody) {
      onSubmitEmail(pastedBody, 'pasted_body.txt');
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_EMAILS.find((p) => p.id === presetId);
    if (preset) {
      const full = `${preset.rawHeaders}\n\n${preset.rawBody}`;
      onSubmitEmail(full, `${preset.id}.eml`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0c1222]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Start Email Threat Investigation</h2>
              <p className="text-xs text-slate-400 font-mono">
                Upload .eml file, paste headers/body, scan URL, or choose a test preset
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Mode Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'url'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5 text-cyan-400" />
            Analyze URL / Domain
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Demo Presets (Instant)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload .EML File
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'headers'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Paste Raw Headers
          </button>
          <button
            onClick={() => setActiveTab('body')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'body'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Email Body
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 0: URL / LINK SCANNER */}
          {activeTab === 'url' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-200 font-bold">
                    Target URL or Domain (Fake or Real):
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                    HTTP, HTTPS, or raw IP supported
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Enter any URL, e.g. http://paypa1-security.example or https://paypal.com"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none shadow-inner"
                  />
                  {inputUrl && (
                    <button
                      type="button"
                      onClick={() => setInputUrl('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1.5">
                  You can input simulated phishing links, typosquatted domains, or real websites to assess threat telemetry.
                </p>
              </div>

              {/* Sample Quick-Test Presets for URLs */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 block mb-2 font-semibold uppercase tracking-wider">
                  Or click a quick scenario to load:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setInputUrl('http://paypa1-login.example/auth?token=9f83a812')}
                    className="p-3 rounded-xl bg-slate-950/80 border border-red-900/60 hover:border-red-500 text-left text-xs font-mono transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-red-400 font-bold">🚨 Fake: Homoglyph Brand Typosquat</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-300">CRITICAL</span>
                    </div>
                    <span className="text-slate-400 text-[11px] truncate block group-hover:text-slate-300">
                      http://paypa1-login.example/auth?token=...
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputUrl('http://185.220.101.5/session/verify.php')}
                    className="p-3 rounded-xl bg-slate-950/80 border border-amber-900/60 hover:border-amber-500 text-left text-xs font-mono transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-amber-400 font-bold">⚠️ Fake: Raw IP Phishing Host</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300">HIGH</span>
                    </div>
                    <span className="text-slate-400 text-[11px] truncate block group-hover:text-slate-300">
                      http://185.220.101.5/session/verify.php
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputUrl('http://micros0ft-account-secure.xyz/portal')}
                    className="p-3 rounded-xl bg-slate-950/80 border border-purple-900/60 hover:border-purple-500 text-left text-xs font-mono transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-purple-400 font-bold">🔍 Fake: Character '0' Substitution</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300">CRITICAL</span>
                    </div>
                    <span className="text-slate-400 text-[11px] truncate block group-hover:text-slate-300">
                      http://micros0ft-account-secure.xyz/portal
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputUrl('https://accounts.google.com/signin')}
                    className="p-3 rounded-xl bg-slate-950/80 border border-emerald-900/60 hover:border-emerald-500 text-left text-xs font-mono transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-emerald-400 font-bold">🛡️ Real: Authenticated HTTPS Domain</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300">CLEAN</span>
                    </div>
                    <span className="text-slate-400 text-[11px] truncate block group-hover:text-slate-300">
                      https://accounts.google.com/signin
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-mono">
                Select an pre-configured threat scenario to test the multi-step forensic engine immediately:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {PRESET_EMAILS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:animate-ping" />
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {preset.name}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{preset.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Subject: "{preset.investigation.subject.slice(0, 40)}..."</span>
                      <span className="text-cyan-400 group-hover:underline">Launch Scan →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/30'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".eml,.msg,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processFile(e.target.files[0]);
                    }
                  }}
                />
                <Upload className="w-10 h-10 mx-auto text-cyan-400 mb-3 animate-bounce" />
                <p className="text-sm font-semibold text-white">
                  {selectedFile ? selectedFile.name : 'Drop your .eml file here or browse files'}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Supports standard MIME/RFC 5322 .eml format exported from Outlook, Gmail, or Thunderbird
                </p>
                {selectedFile && (
                  <p className="text-xs font-mono text-emerald-400 mt-2 font-semibold">
                    ✓ File loaded ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PASTE HEADERS */}
          {activeTab === 'headers' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                  Raw Headers (RFC 5322)
                </label>
                <textarea
                  rows={6}
                  value={pastedHeaders}
                  onChange={(e) => setPastedHeaders(e.target.value)}
                  placeholder={`From: "Security Team" <security@paypa1-security.example>
To: <target@victim-org.com>
Subject: URGENT: Action required
Date: Thu, 10 Sep 2026 10:31:00 +0530
X-Originating-IP: [185.220.101.5]
Received: from mail.phish.example ([185.220.101.5])...`}
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                  Email Body (Optional)
                </label>
                <textarea
                  rows={3}
                  value={pastedBody}
                  onChange={(e) => setPastedBody(e.target.value)}
                  placeholder="Paste email body or message text containing links..."
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PASTE EMAIL BODY */}
          {activeTab === 'body' && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
                Email Content / Body Text
              </label>
              <textarea
                rows={8}
                value={pastedBody}
                onChange={(e) => setPastedBody(e.target.value)}
                placeholder="Paste the suspicious email text or HTML body. The engine will extract embedded URLs, domains, and semantic coercion triggers..."
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}

          {/* EXTRACTED PREVIEW SUMMARY CARD (Requirement #6: File name, Sender, Recipient, Subject, Date, Message ID) */}
          {parsedPreview && (
            <div className="mt-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Extracted Email Header Metadata
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">FILE NAME:</span>
                  <span className="text-slate-200 truncate block">
                    {selectedFile ? selectedFile.name : 'custom_input.eml'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SENDER:</span>
                  <span className="text-slate-200 truncate block">
                    {parsedPreview.headers.from || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">RECIPIENT:</span>
                  <span className="text-slate-200 truncate block">
                    {parsedPreview.headers.to || 'Not specified'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">SUBJECT:</span>
                  <span className="text-slate-200 truncate block">
                    {parsedPreview.headers.subject || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DATE:</span>
                  <span className="text-slate-200 truncate block">
                    {parsedPreview.headers.date || 'Not specified'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500 block text-[10px]">MESSAGE-ID:</span>
                  <span className="text-slate-300 truncate block">
                    {parsedPreview.headers.messageId}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0c1222]">
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Files are parsed client-side in memory for strict privacy</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            {activeTab !== 'presets' && (
              <button
                onClick={handleSubmit}
                disabled={
                  (activeTab === 'url' && !inputUrl.trim()) ||
                  (activeTab === 'upload' && !fileContent) ||
                  (activeTab === 'headers' && !pastedHeaders) ||
                  (activeTab === 'body' && !pastedBody)
                }
                className="px-5 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Analyze Threat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
