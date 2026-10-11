import React from 'react';
import { Clock } from 'lucide-react';
import { InvestigationTimelineEvent } from '../../types/forensic';

interface InvestigationTimelineProps {
  timeline: InvestigationTimelineEvent[];
}

export const InvestigationTimeline: React.FC<InvestigationTimelineProps> = ({ timeline }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Investigation Chronology & Forensic Timeline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Timestamped sequence of forensic detection stages from message ingress to risk classification
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-800 dark:text-cyan-400 font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {timeline.length} Ingress Milestones
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {timeline.map((event, index) => {
          const isFlagged = event.status === 'FLAGGED';

          return (
            <div key={index} className="relative group">
              {/* Timeline Pin */}
              <div
                className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-slate-900 transition-all ${
                  isFlagged
                    ? 'border-red-500 bg-red-50 dark:bg-red-950 shadow-[0_0_8px_#ef4444]'
                    : 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950 shadow-[0_0_8px_#06b6d4]'
                }`}
              />

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white tracking-wide">
                    {event.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 font-semibold">{event.time}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        isFlagged
                          ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/80 dark:text-red-400 dark:border-red-800/80'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800/80'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
