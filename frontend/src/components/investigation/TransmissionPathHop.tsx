import React from 'react';
import { Network, ArrowDown, MapPin, Clock } from 'lucide-react';
import { TransmissionHop } from '../../types/forensic';
import { Badge } from '../common/Badge';

interface TransmissionPathHopProps {
  hops: TransmissionHop[];
}

export const TransmissionPathHop: React.FC<TransmissionPathHopProps> = ({ hops }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Email Transmission Path (Received Hops)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Reconstructed routing relays from origin sender to recipient mailbox
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-800 dark:text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800">
          {hops.length} Network Hops Traced
        </span>
      </div>

      {/* Hop Cards Progression */}
      <div className="space-y-4 relative">
        {hops.map((hop, index) => {
          const isOrigin = hop.isSenderOrigin || index === 0;
          const isFinal = index === hops.length - 1;

          return (
            <div key={hop.hopNumber} className="relative">
              {/* Card */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isOrigin
                    ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-900/80 shadow-sm'
                    : isFinal
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/80 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-cyan-700 dark:text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      {hop.hopNumber}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                      {isOrigin ? 'Originating Sender Relay' : isFinal ? 'Destination MX Gateway' : 'Intermediate Transit MTA'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hop.delay && (
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        Delay: {hop.delay}
                      </span>
                    )}
                    <Badge level={hop.riskLevel} size="sm" />
                  </div>
                </div>

                {/* Details Grid: IP, Country, City, ISP, ASN */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono bg-white dark:bg-black/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">IP ADDRESS:</span>
                    <span className="text-cyan-700 dark:text-cyan-300 font-bold break-all">{hop.ip}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">GEOLOCATION:</span>
                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-rose-500 dark:text-rose-400 shrink-0" />
                      {hop.city}, {hop.country}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 text-[10px] block font-semibold">ISP / HOST:</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate block font-medium" title={hop.isp}>
                      {hop.isp}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">AUTONOMOUS SYS:</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate block font-medium">{hop.asn}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">HOSTNAME / BY:</span>
                    <span className="text-slate-500 dark:text-slate-400 truncate block" title={hop.hostname}>
                      {hop.hostname || 'relay.cloud'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting arrow between hops */}
              {!isFinal && (
                <div className="flex items-center justify-center my-1 text-cyan-600 dark:text-cyan-500/60">
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
