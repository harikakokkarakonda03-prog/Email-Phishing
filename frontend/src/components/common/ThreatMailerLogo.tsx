import React from 'react';

interface ThreatMailerLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const ThreatMailerLogo: React.FC<ThreatMailerLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
}) => {
  const pixelSizes = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 64,
  };

  const dim = pixelSizes[size] || 38;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm"
        style={{ width: dim, height: dim }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Background Gradient */}
            <linearGradient id="tmBgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            {/* Shield Outline Gradient */}
            <linearGradient id="tmShieldGrad" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* Threat Warning Accent */}
            <linearGradient id="tmWarnGrad" x1="50" y1="35" x2="50" y2="65" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            <filter id="tmGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Rounded Shield Card */}
          <rect width="100" height="100" rx="22" fill="url(#tmBgGrad)" />

          {/* Subtle Grid Overlay */}
          <path
            d="M20 50 H80 M50 20 V80"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Cyber Shield Outer Contour */}
          <path
            d="M50 16 L78 28 C78 52 66 74 50 84 C34 74 22 52 22 28 Z"
            fill="#090d16"
            fillOpacity="0.82"
            stroke="url(#tmShieldGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Mail Envelope Facets */}
          {/* Envelope Body */}
          <path
            d="M32 38 H68 C70 38 71 39 71 41 V63 C71 65 70 66 68 66 H32 C30 66 29 65 29 63 V41 C29 39 30 38 32 38 Z"
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {/* Envelope Flap */}
          <path
            d="M29 40 L50 54 L71 40"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Threat Radar Target / Exclamation Pin */}
          <circle cx="50" cy="53" r="10" fill="url(#tmWarnGrad)" opacity="0.9" filter="url(#tmGlow)" />
          <path
            d="M50 48 V54 M50 57 V58"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Digital Scanning Pulse Dots */}
          <circle cx="26" cy="24" r="2.5" fill="#38bdf8" opacity="0.8" />
          <circle cx="74" cy="24" r="2.5" fill="#10b981" opacity="0.8" />
          <circle cx="50" cy="88" r="2" fill="#06b6d4" opacity="0.6" />
        </svg>
      </div>

      {/* Brand Text (Optional) */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 dark:from-cyan-400 dark:via-sky-300 dark:to-indigo-400 bg-clip-text text-transparent">
            ThreatMailer
          </span>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 -mt-0.5">
            Email Threat SOC
          </span>
        </div>
      )}
    </div>
  );
};
