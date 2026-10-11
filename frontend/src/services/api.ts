import { InvestigationData } from '../types/forensic';

// Address of the Python backend. When you deploy, set VITE_API_URL to the deployed backend link.
const BASE: string = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const TOKEN_KEY = 'threatmailer_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface ThreatStats {
  metrics: {
    totalAnalyzed: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    maliciousIps: number;
    suspiciousDomains: number;
    phishingDetected: number;
  };
  trend: { day: string; date: string; phishing: number; bec: number; malware: number; total: number }[];
  categories: { name: string; value: number; color: string }[];
  risk: { level: string; count: number; fill: string }[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`; // proves who the user is on every call

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'Cannot reach the ThreatMailer server. Is the backend running?');
  }

  if (!res.ok) {
    let detail = 'Request failed';
    try {
      const body = await res.json();
      if (typeof body.detail === 'string') detail = body.detail;
    } catch {
      /* keep the default message */
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<void> {
  const data = await request<{ token: string }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
}

export async function register(email: string, password: string): Promise<void> {
  const data = await request<{ token: string }>('/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
}

export const analyzeEmail = (raw: string, fileName?: string) =>
  request<InvestigationData>('/api/analyze', { method: 'POST', body: JSON.stringify({ raw, fileName }) });

export const listInvestigations = () => request<InvestigationData[]>('/api/investigations');

export const getStats = () => request<ThreatStats>('/api/stats');