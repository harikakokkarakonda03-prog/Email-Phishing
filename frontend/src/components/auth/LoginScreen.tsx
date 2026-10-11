import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { ThreatMailerLogo } from '../common/ThreatMailerLogo';
import { login, register } from '../../services/api';

interface LoginScreenProps {
  onAuthenticated: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
      onAuthenticated();
    } catch (err) {
      // The server's message is shown as it is, e.g. "Password needs at least one symbol"
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc] dark:bg-[#070b14]">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <ThreatMailerLogo size="lg" />
          <h1 className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">ThreatMailer</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mode === 'register' && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Use at least 8 characters with a capital letter, a small letter, a number and a symbol.
            </p>
          )}

          {error && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e60dc] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm cursor-pointer"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
          className="mt-5 w-full text-center text-xs text-blue-600 dark:text-blue-400 cursor-pointer"
        >
          {mode === 'login' ? 'No account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};