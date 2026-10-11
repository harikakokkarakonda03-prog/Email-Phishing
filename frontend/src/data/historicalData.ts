import { DashboardMetrics } from '../types/forensic';

export const INITIAL_DASHBOARD_METRICS: DashboardMetrics = {
  totalAnalyzed: 1428,
  highRiskCount: 194,
  mediumRiskCount: 342,
  lowRiskCount: 892,
  maliciousIps: 87,
  suspiciousDomains: 115,
  phishingDetected: 289,
};

export const THREAT_TREND_DATA = [
  { day: 'Mon', phishing: 32, bec: 12, malware: 8, total: 52 },
  { day: 'Tue', phishing: 45, bec: 15, malware: 11, total: 71 },
  { day: 'Wed', phishing: 28, bec: 9, malware: 6, total: 43 },
  { day: 'Thu', phishing: 64, bec: 22, malware: 18, total: 104 },
  { day: 'Fri', phishing: 82, bec: 31, malware: 24, total: 137 },
  { day: 'Sat', phishing: 21, bec: 6, malware: 5, total: 32 },
  { day: 'Sun', phishing: 17, bec: 4, malware: 3, total: 24 },
];

export const CATEGORY_DISTRIBUTION = [
  { name: 'Phishing', value: 48, color: '#ef4444' },
  { name: 'BEC / Impersonation', value: 24, color: '#f59e0b' },
  { name: 'Credential Harvesting', value: 16, color: '#8b5cf6' },
  { name: 'Malware Attachment', value: 8, color: '#ec4899' },
  { name: 'Spam / Scam', value: 4, color: '#06b6d4' },
];

export const RISK_DISTRIBUTION = [
  { level: 'Critical (81-100)', count: 124, fill: '#ef4444' },
  { level: 'High (61-80)', count: 194, fill: '#f97316' },
  { level: 'Medium (31-60)', count: 342, fill: '#eab308' },
  { level: 'Low (0-30)', count: 768, fill: '#10b981' },
];

export interface RecentInvestigationSummary {
  id: string;
  sender: string;
  subject: string;
  score: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  timestamp: string;
}

export const RECENT_INVESTIGATIONS_FEED: RecentInvestigationSummary[] = [
  {
    id: 'INV-2026-0001',
    sender: 'security@paypa1-security.example',
    subject: 'URGENT: Your account will be suspended within 24 hours',
    score: 92,
    riskLevel: 'CRITICAL',
    category: 'Phishing',
    timestamp: '10 Sep 2026, 10:34 AM',
  },
  {
    id: 'INV-2026-0002',
    sender: 'robert.henderson@enterprise-corp-exec.org',
    subject: 'CONFIDENTIAL: Urgent Acquisition Wire Transfer',
    score: 78,
    riskLevel: 'HIGH',
    category: 'BEC / Wire Fraud',
    timestamp: '10 Sep 2026, 09:20 AM',
  },
  {
    id: 'INV-2026-0003',
    sender: 'no-reply@accounts.google.com',
    subject: 'Security alert: New sign-in on Chrome on Windows',
    score: 4,
    riskLevel: 'LOW',
    category: 'Clean Email',
    timestamp: '10 Sep 2026, 08:05 AM',
  },
  {
    id: 'INV-2026-0004',
    sender: 'it-helpdesk@micros0ft-support.xyz',
    subject: 'Action Required: Microsoft 365 Password Expiration in 2 Hours',
    score: 89,
    riskLevel: 'CRITICAL',
    category: 'Credential Harvest',
    timestamp: '09 Sep 2026, 17:45 PM',
  },
  {
    id: 'INV-2026-0005',
    sender: 'billing@aws-cloud-invoices.top',
    subject: 'Unpaid AWS Balance Invoice #84102',
    score: 65,
    riskLevel: 'HIGH',
    category: 'Spoofed Invoice',
    timestamp: '09 Sep 2026, 14:10 PM',
  },
];
