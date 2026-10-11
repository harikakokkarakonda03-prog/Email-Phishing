export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface EmailHeaderInfo {
  from: string;
  fromDisplayName: string;
  fromEmail: string;
  to: string;
  replyTo?: string;
  returnPath?: string;
  messageId: string;
  date: string;
  subject: string;
  mimeVersion?: string;
  contentType?: string;
  userAgent?: string;
  xOriginatingIp?: string;
  rawHeaders: string;
}

export interface TransmissionHop {
  hopNumber: number;
  ip: string;
  hostname?: string;
  by?: string;
  delay?: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  asn: string;
  latitude: number;
  longitude: number;
  riskLevel: RiskLevel;
  isSenderOrigin?: boolean;
  isSuspicious?: boolean;
}

export interface AuthenticationResult {
  spf: {
    status: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NONE';
    domain: string;
    ip: string;
    details: string;
  };
  dkim: {
    status: 'PASS' | 'FAIL' | 'NONE';
    selector: string;
    domain: string;
    details: string;
  };
  dmarc: {
    status: 'PASS' | 'FAIL' | 'NONE';
    policy: string;
    details: string;
  };
}

export interface UrlAnalysisItem {
  id: string;
  url: string;
  defanged: string;
  domain: string;
  protocol: 'HTTP' | 'HTTPS';
  redirectChain: string[];
  risk: RiskLevel;
  reason: string;
  isLookalike: boolean;
  isIpBased: boolean;
  isShortener: boolean;
}

export interface DomainIntelligenceItem {
  domain: string;
  registrar: string;
  creationDate: string;
  expiryDate: string;
  ageDays: number;
  nameservers: string[];
  tld: string;
  riskScore: number;
  reputation: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
  lookalikeTarget?: string;
  similarityReason?: string;
}

export interface ExplainableReason {
  id: string;
  title: string;
  severity: RiskLevel;
  evidence: string;
  category: 'AUTHENTICATION' | 'DOMAIN' | 'URL' | 'BODY_CONTENT' | 'IP_REPUTATION' | 'ATTACHMENT';
  weight: number;
}

export interface IndicatorOfCompromise {
  id: string;
  type: 'IP' | 'Domain' | 'URL' | 'Email' | 'Hash' | 'Attachment';
  indicator: string;
  risk: RiskLevel;
  reason: string;
}

export interface InvestigationTimelineEvent {
  time: string;
  stage: string;
  description: string;
  status: 'COMPLETED' | 'FLAGGED' | 'IN_PROGRESS';
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'email' | 'sender' | 'domain' | 'ip' | 'url' | 'server' | 'location';
  risk: 'safe' | 'warning' | 'danger';
  details?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface InvestigationData {
  id: string;
  createdAt: string;
  fileName?: string;
  subject: string;
  sender: string;
  recipient: string;
  threatScore: number; // 0 - 100
  riskLevel: RiskLevel;
  classification: string; // e.g. "CRITICAL – PHISHING"
  summary: string;
  emailHeaders: EmailHeaderInfo;
  authentication: AuthenticationResult;
  transmissionPath: TransmissionHop[];
  urls: UrlAnalysisItem[];
  domainIntelligence: DomainIntelligenceItem[];
  explainableReasons: ExplainableReason[];
  iocs: IndicatorOfCompromise[];
  timeline: InvestigationTimelineEvent[];
  emailBody: string;
}

export interface DashboardMetrics {
  totalAnalyzed: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  maliciousIps: number;
  suspiciousDomains: number;
  phishingDetected: number;
}
