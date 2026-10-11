import React from 'react';
import {
  Home,
  Search,
  Database,
  FileText,
  Info,
  Shield,
  Mail,
  Sun,
  Moon,
} from 'lucide-react';

export type NavTab = 'home' | 'analyze' | 'intelligence' | 'reports' | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  theme,
  onToggleTheme,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'analyze' as NavTab, label: 'Analyze Email', icon: Search },
    { id: 'intelligence' as NavTab, label: 'Threat Overview', icon: Database },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'about' as NavTab, label: 'About', icon: Info },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 flex flex-col justify-between border-r transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          theme === 'dark'
            ? 'bg-[#0b101c] border-slate-800 text-slate-200'
            : 'bg-white border-slate-200/90 text-slate-800'
        }`}
      >
        {/* Top Header & Logo */}
        <div className="p-6">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              onSelectTab('home');
              onCloseMobile?.();
            }}
          >
            {/* Custom Shield Emblem matching Photo 1 */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="relative flex items-center justify-center">
                <Shield className="w-6 h-6 fill-white/20 text-white stroke-[2.2]" />
                <Mail className="w-3.5 h-3.5 text-white absolute top-1.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  ThreatMailer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                AI-Powered Email Threat Detection
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#eaf1fb] dark:bg-blue-600/20 text-[#1e60dc] dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-[#1e60dc] dark:text-blue-400 stroke-[2.4]'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Shield Artwork + Slogan + Theme toggle */}
        <div className="p-6 pt-0">
          <div className="relative rounded-2xl bg-gradient-to-b from-blue-50/70 to-indigo-50/50 dark:from-slate-900/80 dark:to-slate-900/40 border border-blue-100/80 dark:border-slate-800 p-5 text-center overflow-hidden">
            {/* Soft decorative background shield icon */}
            <div className="w-14 h-14 mx-auto mb-2.5 rounded-2xl bg-white dark:bg-slate-800/80 shadow-xs border border-blue-100 dark:border-slate-700/60 flex items-center justify-center text-blue-500">
              <div className="relative flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-500/80 stroke-[1.8]" />
                <Mail className="w-4 h-4 text-blue-600 absolute top-2" />
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Smarter Emails.
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Safer You.
            </p>

            <div className="mt-3 pt-3 border-t border-blue-100/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI Online
              </span>
              <button
                onClick={onToggleTheme}
                className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
