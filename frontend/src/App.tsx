import React, { useState, useEffect, useRef } from 'react';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { AnalyzeThreatPage } from './components/investigation/AnalyzeThreatPage';
import { AnalysisResultsDashboard } from './components/investigation/AnalysisResultsDashboard';
import { AboutView } from './components/about/AboutView';
import { ReportsListView } from './components/report/ReportsListView';
import { ForensicReportModal } from './components/report/ForensicReportModal';
import { ScanningProgressModal } from './components/investigation/ScanningProgressModal';
import { EmailUploadModal } from './components/investigation/EmailUploadModal';
import { ThreatIntelligenceView } from './components/intelligence/ThreatIntelligenceView';
import { LoginScreen } from './components/auth/LoginScreen';
import { ExtensionModal } from './components/extension/ExtensionModal';

import { InvestigationData } from './types/forensic';
import { DEMO_INVESTIGATION, SAFE_INVESTIGATION } from './data/demoInvestigation';
import { analyzeEmailThreat } from './services/threatAnalysisService';
import { analyzeEmail, listInvestigations, getToken, clearToken, ApiError } from './services/api';
import { exportIocsAsStix } from './utils/exportUtils';
import { Menu, LogOut } from 'lucide-react';

// Same rule the old frontend used to decide that the input is a web link, not an email.
// Link scans still use the old local analyzer until the backend link scanner is added.
function looksLikeUrl(raw: string, fileName?: string): boolean {
  const t = raw.trim();
  return (
    !!fileName?.startsWith('URL:') ||
    !!fileName?.startsWith('url_') ||
    t.startsWith('http://') ||
    t.startsWith('https://') ||
    (!t.includes('\n') && /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(t))
  );
}

// Pasted text without email headers is wrapped so the backend treats all of it as the message body.
function toRawEmail(raw: string, fileName?: string): string {
  const startsWithHeader = /^[A-Za-z][A-Za-z0-9-]*:\s?/.test(raw.trimStart());
  if (fileName === 'Email Body Content' || !startsWithHeader) {
    return `Subject: Pasted email content\r\nContent-Type: text/plain\r\n\r\n${raw}`;
  }
  return raw;
}

export function App() {
  // Login state: the token is kept in the browser after login
  const [authed, setAuthed] = useState<boolean>(!!getToken());

  // Theme State: Light mode default per user wireframe designs
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('threatmailer_theme') || localStorage.getItem('sih_theme');
      return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
    } catch {
      return 'light';
    }
  });

  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Synchronize theme on document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('threatmailer_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Main navigation tab: 'home' | 'analyze' | 'intelligence' | 'reports' | 'about'
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Subview for 'analyze' tab: 'input' or 'results'
  const [analyzeSubView, setAnalyzeSubView] = useState<'input' | 'results'>('input');

  // Reports now come from the backend (the user's own saved investigations)
  const [investigations, setInvestigations] = useState<InvestigationData[]>([]);
  const [activeInvestigation, setActiveInvestigation] = useState<InvestigationData>(DEMO_INVESTIGATION);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isScanningOpen, setIsScanningOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  // Error message shown at the top of the screen
  const [notice, setNotice] = useState<string | null>(null);

  // The analysis runs in the background while the scanning animation plays
  const analysisRef = useRef<Promise<InvestigationData> | null>(null);
  const completingRef = useRef(false);

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
    setInvestigations([]);
    setActiveInvestigation(DEMO_INVESTIGATION);
    setCurrentTab('home');
    setAnalyzeSubView('input');
    setIsScanningOpen(false);
    setIsReportOpen(false);
  };

  const handleApiError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      handleLogout(); // login expired
      return;
    }
    setNotice(err instanceof Error ? err.message : 'Something went wrong');
  };

  // Load this user's saved reports after login
  useEffect(() => {
    if (!authed) return;
    listInvestigations()
            .then((list) => {
        setInvestigations(list);
        if (list.length > 0) setActiveInvestigation(list[0]);

        // Opened from the extension's alert: http://localhost:5173/?report=INV-2026-0007
        const wanted = new URLSearchParams(window.location.search).get('report');
        if (wanted) {
          const found = list.find((i) => i.id === wanted);
          if (found) {
            setActiveInvestigation(found);
            setCurrentTab('analyze');
            setAnalyzeSubView('results');
          }
          window.history.replaceState({}, '', window.location.pathname); // remove ?report=... from the address bar
        }
      })
      .catch(handleApiError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  // Start the analysis and show the scanning animation at the same time
  const handleStartAnalysis = (rawContent: string, fileName?: string): void => {
    setNotice(null);
    const job = looksLikeUrl(rawContent, fileName)
      ? analyzeEmailThreat(rawContent, fileName)
      : analyzeEmail(toRawEmail(rawContent, fileName), fileName);
    job.catch(() => {}); // the error is handled when the animation finishes
    analysisRef.current = job;
    setIsScanningOpen(true);
  };

  // Called by the animation when it finishes. If the backend is still working, we wait for it.
  const handleScanCompleted = async () => {
    const job = analysisRef.current;
    if (!job || completingRef.current) return; // ignore duplicate calls
    completingRef.current = true;
    try {
      const result = await job;
      analysisRef.current = null;
      setIsScanningOpen(false);
      setInvestigations((prev) => [result, ...prev.filter((i) => i.id !== result.id)]);
      setActiveInvestigation(result);
      setCurrentTab('analyze');
      setAnalyzeSubView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      analysisRef.current = null;
      setIsScanningOpen(false);
      handleApiError(err);
    } finally {
      completingRef.current = false;
    }
  };

  // Load Preset Sample (Safe vs Suspicious)
  const handleLoadSample = (sampleType: 'safe' | 'suspicious') => {
    if (sampleType === 'safe') {
      setActiveInvestigation(SAFE_INVESTIGATION);
    } else {
      setActiveInvestigation(DEMO_INVESTIGATION);
    }
    setCurrentTab('analyze');
    setAnalyzeSubView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Not logged in: show only the login screen
  if (!authed) {
    return <LoginScreen onAuthenticated={() => setAuthed(true)} />;
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#070b14] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* LEFT SIDEBAR NAVIGATION */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
      />

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed top-3 right-4 z-40 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Logout</span>
      </button>

      {/* Error message */}
      {notice && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[60] max-w-md flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 text-xs font-medium shadow-lg">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="font-bold cursor-pointer" aria-label="Close message">×</button>
        </div>
      )}

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Mobile Top App Bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#0b101c] border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900 dark:text-white">ThreatMailer</span>
          <div className="w-8" />
        </div>

        {/* VIEW 1: HOME / DASHBOARD */}
        {currentTab === 'home' && (
          <DashboardHome
            onNavigate={(tab) => {
              setCurrentTab(tab);
              if (tab === 'analyze') {
                setAnalyzeSubView('input');
              }
            }}
            onAnalyzeContent={handleStartAnalysis}
            onLoadSample={handleLoadSample}
            onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
          />
        )}

        {/* VIEW 2: ANALYZE PAGE */}
        {currentTab === 'analyze' && (
          <div>
            {analyzeSubView === 'input' ? (
              <AnalyzeThreatPage
                onAnalyze={handleStartAnalysis}
                onOpenReportHistory={() => setCurrentTab('reports')}
              />
            ) : (
              <AnalysisResultsDashboard
                investigation={activeInvestigation}
                onStartNewScan={() => setAnalyzeSubView('input')}
                onOpenReportModal={() => setIsReportOpen(true)}
                onExportStix={() => exportIocsAsStix(activeInvestigation.iocs, activeInvestigation)}
                theme={theme}
              />
            )}
          </div>
        )}

        {/* VIEW 3: THREAT OVERVIEW */}
        {currentTab === 'intelligence' && (
          <ThreatIntelligenceView
            activeInvestigation={activeInvestigation}
            onStartNewScan={() => {
              setCurrentTab('analyze');
              setAnalyzeSubView('input');
            }}
          />
        )}

        {/* VIEW 4: REPORTS LIST */}
        {currentTab === 'reports' && (
          <div className="p-6 sm:p-8 max-w-[1600px] mx-auto animate-fade-in">
            {investigations.length === 0 ? (
              <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">No reports yet</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Analyze an email and its forensic report will be saved here.
                </p>
                <button
                  onClick={() => {
                    setCurrentTab('analyze');
                    setAnalyzeSubView('input');
                  }}
                  className="mt-5 px-5 py-2.5 rounded-2xl bg-[#1e60dc] hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Analyze an email
                </button>
              </div>
            ) : (
              <ReportsListView
                investigations={investigations}
                onOpenReport={(inv) => {
                  setActiveInvestigation(inv);
                  setIsReportOpen(true);
                }}
                onSelectInvestigation={(id) => {
                  const found = investigations.find((i) => i.id === id);
                  if (found) {
                    setActiveInvestigation(found);
                    setCurrentTab('analyze');
                    setAnalyzeSubView('results');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 5: ABOUT */}
        {currentTab === 'about' && <AboutView />}
      </div>

      {/* MODALS */}
      <EmailUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmitEmail={handleStartAnalysis}
      />

      <ScanningProgressModal
        isOpen={isScanningOpen}
        onComplete={handleScanCompleted}
      />

      <ForensicReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        investigation={activeInvestigation}
      />

      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
      />
    </div>
  );
}

export default App;