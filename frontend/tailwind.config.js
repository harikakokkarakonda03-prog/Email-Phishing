/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#090d16',
          panel: '#0f172a',
          card: '#131d35',
          border: '#1e293b',
          accent: '#06b6d4',      // Neon Cyan
          success: '#10b981',     // Cyber Emerald
          warning: '#f59e0b',     // Amber
          danger: '#ef4444',      // Cyber Crimson
          purple: '#8b5cf6',      // Deep violet
          highlight: '#38bdf8',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace', 'ui-monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.4)',
        'neon-danger': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'neon-success': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'neon-amber': '0 0 20px -5px rgba(245, 158, 11, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
