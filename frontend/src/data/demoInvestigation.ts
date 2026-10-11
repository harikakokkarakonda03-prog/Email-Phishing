import { InvestigationData } from '../types/forensic';

export const DEMO_INVESTIGATION: InvestigationData = {
  id: 'INV-2026-0001',
  createdAt: '2026-09-10T10:34:00+05:30',
  fileName: 'suspicious_paypal_urgent_notice.eml',
  subject: 'URGENT: Your account will be suspended within 24 hours',
  sender: 'security@paypa1-security.example',
  recipient: 'officer@defense-gov.in',
  threatScore: 92,
  riskLevel: 'CRITICAL',
  classification: 'CRITICAL – PHISHING',
  summary:
    'High-confidence credential harvesting phishing attack deploying brand impersonation, deceptive character substitution (homograph typosquatting), and weaponized HTTP redirection links. Originating IP is located on a bulletproof hosting provider with failing SPF/DKIM/DMARC cryptographic signatures.',
  emailHeaders: {
    from: 'PayPal Security Team <security@paypa1-security.example>',
    fromDisplayName: 'PayPal Security Team',
    fromEmail: 'security@paypa1-security.example',
    to: 'officer@defense-gov.in',
    replyTo: 'collector@paypa1-support.example',
    returnPath: '<bounce-service@phish-node-9.example>',
    messageId: '<20260910103144.98127.phish@paypa1-security.example>',
    date: 'Thu, 10 Sep 2026 10:31:12 +0530',
    subject: 'URGENT: Your account will be suspended within 24 hours',
    mimeVersion: '1.0',
    contentType: 'text/html; charset=UTF-8',
    userAgent: 'PHPMailer 6.8.0 (https://github.com/PHPMailer/PHPMailer)',
    xOriginatingIp: '185.220.101.5',
    rawHeaders: `Received: from relay-node4.anonym-net.example (relay-node4.anonym-net.example [194.26.29.12])
    by mx-in.defense-gov.in (Postfix) with ESMTPS id 4Vz8Xk19Zz901
    for <officer@defense-gov.in>; Thu, 10 Sep 2026 10:33:45 +0530 (IST)
Received: from mail-sender.paypa1-security.example (mail-sender.paypa1-security.example [185.220.101.5])
    by relay-node4.anonym-net.example with ESMTP id 88A92BC34;
    Thu, 10 Sep 2026 10:32:02 +0530
Authentication-Results: mx-in.defense-gov.in;
    dkim=fail reason="signature missing or invalid" header.d=paypa1-security.example;
    spf=fail (mx-in.defense-gov.in: domain of paypa1-security.example does not designate 185.220.101.5 as permitted sender) smtp.mailfrom=bounce-service@phish-node-9.example;
    dmarc=fail (p=reject dis=none) header.from=paypa1-security.example
From: "PayPal Security Team" <security@paypa1-security.example>
To: <officer@defense-gov.in>
Reply-To: <collector@paypa1-support.example>
Return-Path: <bounce-service@phish-node-9.example>
Subject: URGENT: Your account will be suspended within 24 hours
Date: Thu, 10 Sep 2026 10:31:12 +0530
Message-ID: <20260910103144.98127.phish@paypa1-security.example>
X-Originating-IP: [185.220.101.5]
X-Mailer: PHPMailer 6.8.0
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8`,
  },
  authentication: {
    spf: {
      status: 'FAIL',
      domain: 'paypa1-security.example',
      ip: '185.220.101.5',
      details: 'Sender IP 185.220.101.5 is not listed in SPF record for domain paypa1-security.example. Spoofing detected.',
    },
    dkim: {
      status: 'FAIL',
      selector: 'k1',
      domain: 'paypa1-security.example',
      details: 'Cryptographic DKIM signature verification failed. The message body or headers may have been forged.',
    },
    dmarc: {
      status: 'FAIL',
      policy: 'p=reject',
      details: 'DMARC alignment failed for both SPF and DKIM. Domain owner specifies rejection of unauthenticated emails.',
    },
  },
  transmissionPath: [
    {
      hopNumber: 1,
      ip: '185.220.101.5',
      hostname: 'mail-sender.paypa1-security.example',
      by: 'relay-node4.anonym-net.example',
      delay: '0s',
      country: 'Singapore',
      countryCode: 'SG',
      city: 'Jurong West',
      isp: 'Starlight Anonymized Cloud Hosting Ltd',
      asn: 'AS49210 (Bulletproof Hosting)',
      latitude: 1.3521,
      longitude: 103.8198,
      riskLevel: 'CRITICAL',
      isSenderOrigin: true,
      isSuspicious: true,
    },
    {
      hopNumber: 2,
      ip: '194.26.29.12',
      hostname: 'relay-node4.anonym-net.example',
      by: 'gateway.transit-hub.example',
      delay: '1m 43s',
      country: 'Germany',
      countryCode: 'DE',
      city: 'Frankfurt am Main',
      isp: 'Continental Transit Peering GmbH',
      asn: 'AS20035',
      latitude: 50.1109,
      longitude: 8.6821,
      riskLevel: 'MEDIUM',
      isSuspicious: false,
    },
    {
      hopNumber: 3,
      ip: '103.21.244.18',
      hostname: 'gateway.transit-hub.example',
      by: 'mx-in.defense-gov.in',
      delay: '42s',
      country: 'India',
      countryCode: 'IN',
      city: 'Mumbai',
      isp: 'National Gateway Exchange Network',
      asn: 'AS55836',
      latitude: 19.076,
      longitude: 72.8777,
      riskLevel: 'LOW',
      isSuspicious: false,
    },
    {
      hopNumber: 4,
      ip: '103.45.12.9',
      hostname: 'mx-in.defense-gov.in',
      by: 'internal-mailbox-srv.defense-gov.in',
      delay: '18s',
      country: 'India',
      countryCode: 'IN',
      city: 'New Delhi',
      isp: 'Government Informatics Cloud Services',
      asn: 'AS45820',
      latitude: 28.6139,
      longitude: 77.209,
      riskLevel: 'LOW',
      isSuspicious: false,
    },
  ],
  urls: [
    {
      id: 'url-1',
      url: 'http://paypa1-login.example/auth?token=9f83a812',
      defanged: 'hxxp://paypa1-login[.]example/auth?token=9f83a812',
      domain: 'paypa1-login.example',
      protocol: 'HTTP',
      redirectChain: ['http://paypa1-login.example/auth?token=9f83a812', 'http://185.220.101.5/session/verify.php'],
      risk: 'CRITICAL',
      reason: 'Unencrypted HTTP credential harvesting link using typosquatted brand name and direct IP redirect.',
      isLookalike: true,
      isIpBased: false,
      isShortener: false,
    },
    {
      id: 'url-2',
      url: 'http://paypa1-security.example/cancel-unauthorized-access',
      defanged: 'hxxp://paypa1-security[.]example/cancel-unauthorized-access',
      domain: 'paypa1-security.example',
      protocol: 'HTTP',
      redirectChain: ['http://paypa1-security.example/cancel-unauthorized-access'],
      risk: 'CRITICAL',
      reason: 'Malicious domain mimicking trusted financial brand with newly registered WHOIS record.',
      isLookalike: true,
      isIpBased: false,
      isShortener: false,
    },
    {
      id: 'url-3',
      url: 'https://cdn.legit-fonts.org/css2?family=Roboto',
      defanged: 'hxxps://cdn[.]legit-fonts[.]org/css2?family=Roboto',
      domain: 'legit-fonts.org',
      protocol: 'HTTPS',
      redirectChain: ['https://cdn.legit-fonts.org/css2?family=Roboto'],
      risk: 'LOW',
      reason: 'Standard CDN asset URL for font styling.',
      isLookalike: false,
      isIpBased: false,
      isShortener: false,
    },
  ],
  domainIntelligence: [
    {
      domain: 'paypa1-security.example',
      registrar: 'NameCheap Offshore Privacy Shield Inc.',
      creationDate: '2026-09-07T14:20:00Z',
      expiryDate: '2027-09-07T14:20:00Z',
      ageDays: 3,
      nameservers: ['ns1.bulletproof-dns.xyz', 'ns2.bulletproof-dns.xyz'],
      tld: '.example (mocked)',
      riskScore: 96,
      reputation: 'MALICIOUS',
      lookalikeTarget: 'paypal.com',
      similarityReason: "Domain uses character substitution ('1' for letter 'l') to imitate PayPal Inc.",
    },
    {
      domain: 'paypa1-login.example',
      registrar: 'Shady Domains Reg Ltd',
      creationDate: '2026-09-08T09:12:00Z',
      expiryDate: '2027-09-08T09:12:00Z',
      ageDays: 2,
      nameservers: ['ns1.bulletproof-dns.xyz', 'ns2.bulletproof-dns.xyz'],
      tld: '.example (mocked)',
      riskScore: 98,
      reputation: 'MALICIOUS',
      lookalikeTarget: 'paypal.com',
      similarityReason: 'Homoglyph attack impersonating financial portal login page.',
    },
  ],
  explainableReasons: [
    {
      id: 'exp-1',
      title: 'Sender domain resembles a trusted organization (Homoglyph Attack)',
      severity: 'CRITICAL',
      evidence: "Domain 'paypa1-security.example' uses digit '1' in place of letter 'l' to impersonate PayPal.",
      category: 'DOMAIN',
      weight: 35,
    },
    {
      id: 'exp-2',
      title: 'SPF authentication failed (Sender IP Unauthorized)',
      severity: 'CRITICAL',
      evidence: 'IP 185.220.101.5 is unauthorized to send emails on behalf of the claimed domain.',
      category: 'AUTHENTICATION',
      weight: 20,
    },
    {
      id: 'exp-3',
      title: 'DKIM cryptographic signature check failed',
      severity: 'HIGH',
      evidence: 'Missing or corrupt digital signature. Email transmission headers were modified in transit.',
      category: 'AUTHENTICATION',
      weight: 15,
    },
    {
      id: 'exp-4',
      title: 'Suspicious insecure redirect URL detected (Credential Theft)',
      severity: 'CRITICAL',
      evidence: 'URL links to unencrypted HTTP destination that redirects into an active harvesting form.',
      category: 'URL',
      weight: 20,
    },
    {
      id: 'exp-5',
      title: 'Domain appears newly registered (< 72 hours old)',
      severity: 'HIGH',
      evidence: 'Registration date is 3 days ago with privacy masked WHOIS credentials.',
      category: 'DOMAIN',
      weight: 10,
    },
    {
      id: 'exp-6',
      title: 'Sender IP has suspicious reputation on Threat Intelligence feeds',
      severity: 'HIGH',
      evidence: 'IP 185.220.101.5 matches known Tor exit node & automated credential stuffing infrastructure.',
      category: 'IP_REPUTATION',
      weight: 10,
    },
    {
      id: 'exp-7',
      title: 'Urgent social engineering psychological trigger',
      severity: 'MEDIUM',
      evidence: 'Language forces artificial panic ("account suspended within 24 hours") requesting rapid login.',
      category: 'BODY_CONTENT',
      weight: 10,
    },
  ],
  iocs: [
    {
      id: 'ioc-1',
      type: 'IP',
      indicator: '185.220.101.5',
      risk: 'CRITICAL',
      reason: 'Malicious sender origin relay identified on bulletproof hosting network.',
    },
    {
      id: 'ioc-2',
      type: 'Domain',
      indicator: 'paypa1-security.example',
      risk: 'CRITICAL',
      reason: 'Typosquatted domain mimicking financial service brand.',
    },
    {
      id: 'ioc-3',
      type: 'Domain',
      indicator: 'paypa1-login.example',
      risk: 'CRITICAL',
      reason: 'Harvesting landing domain registered 2 days ago.',
    },
    {
      id: 'ioc-4',
      type: 'URL',
      indicator: 'http://paypa1-login.example/auth?token=9f83a812',
      risk: 'CRITICAL',
      reason: 'Direct credential harvesting phishing link with session token.',
    },
    {
      id: 'ioc-5',
      type: 'Email',
      indicator: 'security@paypa1-security.example',
      risk: 'HIGH',
      reason: 'Spoofed sender email address.',
    },
    {
      id: 'ioc-6',
      type: 'Email',
      indicator: 'collector@paypa1-support.example',
      risk: 'HIGH',
      reason: 'Phishing reply-to address designed to intercept victim inquiries.',
    },
    {
      id: 'ioc-7',
      type: 'Hash',
      indicator: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      risk: 'MEDIUM',
      reason: 'SHA-256 hash of extracted suspicious email payload.',
    },
  ],
  timeline: [
    {
      time: '10:31:12 AM',
      stage: 'Email Received',
      description: 'Incoming message intercepted at mail border gateway with high urgency subject header.',
      status: 'COMPLETED',
    },
    {
      time: '10:31:45 AM',
      stage: 'Headers Parsed',
      description: 'Extracted RFC 5322 metadata: From, Reply-To, Message-ID, and X-Originating-IP [185.220.101.5].',
      status: 'COMPLETED',
    },
    {
      time: '10:32:04 AM',
      stage: 'IP Intelligence Extracted',
      description: 'Queried GeoIP & ASN databases. Geolocation mapped to Singapore. Autonomous System flagged as bulletproof host.',
      status: 'FLAGGED',
    },
    {
      time: '10:32:38 AM',
      stage: 'Domain & Typosquatting Analyzed',
      description: 'Levenshtein similarity test matched "paypal.com" with digit substitution. WHOIS age is only 3 days.',
      status: 'FLAGGED',
    },
    {
      time: '10:33:05 AM',
      stage: 'SPF / DKIM / DMARC Checked',
      description: 'SPF=FAIL, DKIM=FAIL, DMARC=FAIL. Sender identity spoofing confirmed mathematically.',
      status: 'FLAGGED',
    },
    {
      time: '10:33:30 AM',
      stage: 'URLs Analyzed & Defanged',
      description: 'Extracted 3 embedded URLs. Identified unencrypted HTTP credential harvesting link.',
      status: 'FLAGGED',
    },
    {
      time: '10:33:55 AM',
      stage: 'Threat Score Computed',
      description: 'Explainable AI heuristic model generated risk score of 92/100 (CRITICAL PHISHING).',
      status: 'FLAGGED',
    },
    {
      time: '10:34:00 AM',
      stage: 'Investigation Completed',
      description: 'Forensic dossier compiled, IOCs cataloged, and incident report generated for SOC escalation.',
      status: 'COMPLETED',
    },
  ],
  emailBody: `Dear Valued Customer,

We detected unauthorized sign-in attempts to your PayPal account from an unrecognized device in Vladivostok, Russia.
For your safety, we have temporarily restricted your access.

To prevent permanent account suspension, you must verify your identity within 24 hours:

>> CLICK HERE TO RESTORE YOUR ACCOUNT:
http://paypa1-login.example/auth?token=9f83a812

If you fail to verify your account within the required timeframe, your balance will remain locked pursuant to federal compliance regulations.

Thank you for choosing PayPal Security Services.
Case Reference: #PP-849204-SEC`,
};

export const SAFE_INVESTIGATION: InvestigationData = {
  id: 'INV-2026-SAFE-01',
  createdAt: '2026-09-12T14:15:00+05:30',
  fileName: 'legitimate_quarterly_update.eml',
  subject: 'Q3 Product Roadmap & Engineering All-Hands Meeting',
  sender: 'communications@techcorp-internal.com',
  recipient: 'developer@defense-gov.in',
  threatScore: 8,
  riskLevel: 'LOW',
  classification: 'SAFE – VERIFIED LEGITIMATE',
  summary:
    'No threat indicators detected. SPF, DKIM, and DMARC cryptographic signatures are fully authenticated. The sending IP belongs to an authorized corporate mail gateway with reputable history.',
  emailHeaders: {
    from: 'Internal Communications <communications@techcorp-internal.com>',
    fromDisplayName: 'Internal Communications',
    fromEmail: 'communications@techcorp-internal.com',
    to: 'developer@defense-gov.in',
    replyTo: 'support@techcorp-internal.com',
    returnPath: '<bounce@techcorp-internal.com>',
    messageId: '<20260912.safe1892@techcorp-internal.com>',
    date: 'Sat, 12 Sep 2026 14:10:00 +0530',
    subject: 'Q3 Product Roadmap & Engineering All-Hands Meeting',
    mimeVersion: '1.0',
    contentType: 'text/html; charset=UTF-8',
    userAgent: 'Corporate Exchange Mail 16.0',
    xOriginatingIp: '142.250.190.46',
    rawHeaders: `Received: from mail.techcorp-internal.com (mail.techcorp-internal.com [142.250.190.46])
    by mx-in.defense-gov.in with ESMTPS id 8Vx9124K;
    Sat, 12 Sep 2026 14:10:15 +0530
Authentication-Results: mx-in.defense-gov.in;
    dkim=pass header.d=techcorp-internal.com;
    spf=pass (permitted sender);
    dmarc=pass (p=reject)`,
  },
  authentication: {
    spf: {
      status: 'PASS',
      domain: 'techcorp-internal.com',
      ip: '142.250.190.46',
      details: 'Sender IP is explicitly authorized in corporate SPF DNS record.',
    },
    dkim: {
      status: 'PASS',
      selector: 's1',
      domain: 'techcorp-internal.com',
      details: 'Valid 2048-bit RSA cryptographic signature verified.',
    },
    dmarc: {
      status: 'PASS',
      policy: 'p=reject',
      details: 'Strict DMARC alignment matched for SPF and DKIM.',
    },
  },
  transmissionPath: [
    {
      hopNumber: 1,
      ip: '142.250.190.46',
      hostname: 'mail.techcorp-internal.com',
      by: 'mx-in.defense-gov.in',
      delay: '0s',
      country: 'United States',
      countryCode: 'US',
      city: 'Mountain View',
      isp: 'Google Enterprise Cloud',
      asn: 'AS15169',
      latitude: 37.422,
      longitude: -122.0841,
      riskLevel: 'LOW',
      isSenderOrigin: true,
      isSuspicious: false,
    },
  ],
  urls: [
    {
      id: 'safe-url-1',
      url: 'https://docs.techcorp-internal.com/roadmap-q3',
      defanged: 'hxxps://docs[.]techcorp-internal[.]com/roadmap-q3',
      domain: 'docs.techcorp-internal.com',
      protocol: 'HTTPS',
      redirectChain: ['https://docs.techcorp-internal.com/roadmap-q3'],
      risk: 'LOW',
      reason: 'Valid internal documentation resource encrypted over HTTPS.',
      isLookalike: false,
      isIpBased: false,
      isShortener: false,
    },
  ],
  domainIntelligence: [
    {
      domain: 'techcorp-internal.com',
      registrar: 'MarkMonitor Inc.',
      creationDate: '2015-04-12T00:00:00Z',
      expiryDate: '2028-04-12T00:00:00Z',
      ageDays: 4160,
      nameservers: ['ns1.techcorp-internal.com', 'ns2.techcorp-internal.com'],
      tld: '.com',
      riskScore: 4,
      reputation: 'SAFE',
      lookalikeTarget: undefined,
      similarityReason: undefined,
    },
  ],
  explainableReasons: [
    {
      id: 'safe-exp-1',
      title: 'Full cryptographic email authentication verified',
      severity: 'LOW',
      evidence: 'SPF, DKIM, and DMARC checks all PASSED with 100% domain alignment.',
      category: 'AUTHENTICATION',
      weight: 0,
    },
    {
      id: 'safe-exp-2',
      title: 'Established domain with reputable WHOIS history',
      severity: 'LOW',
      evidence: 'Domain has been registered and operational for over 11 years.',
      category: 'DOMAIN',
      weight: 0,
    },
  ],
  iocs: [],
  timeline: [
    {
      time: '14:10:00',
      stage: 'Email Received',
      description: 'Incoming message received at mail gateway.',
      status: 'COMPLETED',
    },
    {
      time: '14:10:05',
      stage: 'Security Signatures Verified',
      description: 'SPF=PASS, DKIM=PASS, DMARC=PASS verified.',
      status: 'COMPLETED',
    },
    {
      time: '14:10:10',
      stage: 'Threat Analysis Complete',
      description: 'Risk score 8/100. Message classified as SAFE.',
      status: 'COMPLETED',
    },
  ],
  emailBody: `Hi Team,

Please find the agenda for our Q3 Engineering All-Hands attached below.
We will review our roadmap and sprint milestones:
https://docs.techcorp-internal.com/roadmap-q3

Best regards,
Engineering Leadership`,
};
