import { InvestigationData } from '../types/forensic';
import { DEMO_INVESTIGATION } from './demoInvestigation';

export interface PresetEmail {
  id: string;
  name: string;
  badge: string;
  description: string;
  rawHeaders: string;
  rawBody: string;
  investigation: InvestigationData;
}

export const PRESET_EMAILS: PresetEmail[] = [
  {
    id: 'demo-paypal',
    name: 'Demo Case: PayPal Account Suspension Phishing',
    badge: 'CRITICAL (92/100)',
    description: 'Deceptive homoglyph domain, failed SPF/DKIM, HTTP harvesting URL, origin IP in bulletproof hosting.',
    rawHeaders: DEMO_INVESTIGATION.emailHeaders.rawHeaders,
    rawBody: DEMO_INVESTIGATION.emailBody,
    investigation: DEMO_INVESTIGATION,
  },
  {
    id: 'bec-wire-transfer',
    name: 'CEO Fraud: Urgent Vendor Wire Transfer (BEC)',
    badge: 'HIGH (78/100)',
    description: 'Executive impersonation, altered reply-to routing, psychological pressure, banking change request.',
    rawHeaders: `Received: from mail-relay.executive-cloud.org ([195.154.122.88])
    by mx.enterprise-corp.com with ESMTP id 82B991F
    for <cfo@enterprise-corp.com>; Thu, 10 Sep 2026 09:15:20 +0530
From: "Robert Henderson (CEO)" <robert.henderson@enterprise-corp-exec.org>
To: "Sarah Jenkins (CFO)" <cfo@enterprise-corp.com>
Reply-To: <executive.confidential77@protonmail-offshore.org>
Date: Thu, 10 Sep 2026 09:14:50 +0530
Subject: CONFIDENTIAL: Urgent Acquisition Wire Transfer
Message-ID: <bec.20260910.82910@enterprise-corp-exec.org>
X-Originating-IP: [195.154.122.88]
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8`,
    rawBody: `Sarah,

I am currently in an all-day closed-door M&A committee meeting and cannot take calls.

We are concluding the final escrow agreement for the strategic acquisition discussed last month. Due to regulatory timelines, we need an immediate advance wire transfer of $148,500 to our legal counsel's trust account before 2:00 PM today.

Please confirm you can execute this immediately from our primary operating account. I will send the revised routing and beneficiary coordinates upon your prompt reply.

Keep this strictly confidential between us until the press release is approved.

Regards,
Robert Henderson
Chief Executive Officer`,
    investigation: {
      id: 'INV-2026-0002',
      createdAt: '2026-09-10T09:20:00+05:30',
      fileName: 'urgent_ceo_wire_transfer.eml',
      subject: 'CONFIDENTIAL: Urgent Acquisition Wire Transfer',
      sender: 'robert.henderson@enterprise-corp-exec.org',
      recipient: 'cfo@enterprise-corp.com',
      threatScore: 78,
      riskLevel: 'HIGH',
      classification: 'HIGH – BUSINESS EMAIL COMPROMISE (BEC)',
      summary:
        'Targeted Business Email Compromise (BEC) attack executing executive impersonation. Sender domain registers resemblance to corporate entity while Reply-To diverts replies to an external encrypted mail provider.',
      emailHeaders: {
        from: 'Robert Henderson (CEO) <robert.henderson@enterprise-corp-exec.org>',
        fromDisplayName: 'Robert Henderson (CEO)',
        fromEmail: 'robert.henderson@enterprise-corp-exec.org',
        to: 'Sarah Jenkins (CFO) <cfo@enterprise-corp.com>',
        replyTo: 'executive.confidential77@protonmail-offshore.org',
        returnPath: '<bounce@enterprise-corp-exec.org>',
        messageId: '<bec.20260910.82910@enterprise-corp-exec.org>',
        date: 'Thu, 10 Sep 2026 09:14:50 +0530',
        subject: 'CONFIDENTIAL: Urgent Acquisition Wire Transfer',
        xOriginatingIp: '195.154.122.88',
        rawHeaders: `From: "Robert Henderson (CEO)" <robert.henderson@enterprise-corp-exec.org>\nTo: <cfo@enterprise-corp.com>\nReply-To: <executive.confidential77@protonmail-offshore.org>\nSubject: CONFIDENTIAL: Urgent Acquisition Wire Transfer`,
      },
      authentication: {
        spf: {
          status: 'SOFTFAIL',
          domain: 'enterprise-corp-exec.org',
          ip: '195.154.122.88',
          details: 'Domain designates 195.154.122.88 as non-permitted sender via ~all directive.',
        },
        dkim: {
          status: 'NONE',
          selector: 'default',
          domain: 'enterprise-corp-exec.org',
          details: 'No cryptographic DKIM signature found on incoming message.',
        },
        dmarc: {
          status: 'NONE',
          policy: 'p=none',
          details: 'Domain has no published DMARC policy record in public DNS.',
        },
      },
      transmissionPath: [
        {
          hopNumber: 1,
          ip: '195.154.122.88',
          hostname: 'mail-relay.executive-cloud.org',
          delay: '0s',
          country: 'France',
          countryCode: 'FR',
          city: 'Paris',
          isp: 'Iliad Enterprise Dedicated Hosting',
          asn: 'AS12876',
          latitude: 48.8566,
          longitude: 2.3522,
          riskLevel: 'HIGH',
          isSenderOrigin: true,
          isSuspicious: true,
        },
        {
          hopNumber: 2,
          ip: '103.24.18.5',
          hostname: 'mx.enterprise-corp.com',
          delay: '30s',
          country: 'India',
          countryCode: 'IN',
          city: 'Bengaluru',
          isp: 'Tata Communications Ltd',
          asn: 'AS4755',
          latitude: 12.9716,
          longitude: 77.5946,
          riskLevel: 'LOW',
          isSuspicious: false,
        },
      ],
      urls: [],
      domainIntelligence: [
        {
          domain: 'enterprise-corp-exec.org',
          registrar: 'Tucows Domains Inc',
          creationDate: '2026-08-28T10:00:00Z',
          expiryDate: '2027-08-28T10:00:00Z',
          ageDays: 13,
          nameservers: ['ns1.dns-hosting.org', 'ns2.dns-hosting.org'],
          tld: '.org',
          riskScore: 82,
          reputation: 'SUSPICIOUS',
          lookalikeTarget: 'enterprise-corp.com',
          similarityReason: 'Domain appends "-exec" to legitimate corporate brand domain.',
        },
      ],
      explainableReasons: [
        {
          id: 'bec-1',
          title: 'Reply-To Divergence Detected',
          severity: 'CRITICAL',
          evidence: 'Replies will be diverted to external address: executive.confidential77@protonmail-offshore.org.',
          category: 'AUTHENTICATION',
          weight: 30,
        },
        {
          id: 'bec-2',
          title: 'Executive Impersonation (Display Name Spoofing)',
          severity: 'HIGH',
          evidence: 'Display name "Robert Henderson (CEO)" uses newly acquired non-corporate domain.',
          category: 'DOMAIN',
          weight: 25,
        },
        {
          id: 'bec-3',
          title: 'High-Risk Financial Keywords & Urgency',
          severity: 'HIGH',
          evidence: 'Contains high-frequency BEC triggers: "wire transfer", "confidential", "before 2:00 PM".',
          category: 'BODY_CONTENT',
          weight: 23,
        },
      ],
      iocs: [
        {
          id: 'ioc-b1',
          type: 'IP',
          indicator: '195.154.122.88',
          risk: 'HIGH',
          reason: 'Unauthorized relay IP used for executive spear-phishing.',
        },
        {
          id: 'ioc-b2',
          type: 'Domain',
          indicator: 'enterprise-corp-exec.org',
          risk: 'HIGH',
          reason: 'Lookalike domain registered 13 days ago.',
        },
        {
          id: 'ioc-b3',
          type: 'Email',
          indicator: 'executive.confidential77@protonmail-offshore.org',
          risk: 'CRITICAL',
          reason: 'Exfiltration reply-to mailbox.',
        },
      ],
      timeline: [
        { time: '09:14:50 AM', stage: 'Email Ingested', description: 'Message arrived at recipient border gateway.', status: 'COMPLETED' },
        { time: '09:15:10 AM', stage: 'Header Forensics', description: 'Reply-To divergence detected against From header.', status: 'FLAGGED' },
        { time: '09:15:30 AM', stage: 'Content Semantic Analysis', description: 'NLP flagged high-risk wire fraud intent with urgency coercion.', status: 'FLAGGED' },
        { time: '09:16:00 AM', stage: 'Analysis Finalized', description: 'Risk score 78/100 assigned with BEC classification.', status: 'COMPLETED' },
      ],
      emailBody: `Sarah,\n\nI am currently in an all-day closed-door M&A committee meeting and cannot take calls.\n\nWe are concluding the final escrow agreement for the strategic acquisition discussed last month...`,
    },
  },
  {
    id: 'clean-google-alert',
    name: 'Clean Email: Google Workspace Security Notification',
    badge: 'LOW (4/100)',
    description: 'Cryptographically verified DKIM signature, valid SPF record, clean IP reputation, legitimate domain.',
    rawHeaders: `Received: from mail-sor-f69.google.com (mail-sor-f69.google.com [209.85.220.69])
    by mx.defense-gov.in with ESMTPS id 9912BA8
    for <officer@defense-gov.in>; Thu, 10 Sep 2026 08:00:15 +0530
Authentication-Results: mx.defense-gov.in;
    dkim=pass header.i=@accounts.google.com header.s=20230601;
    spf=pass (mx.defense-gov.in: domain of accounts.google.com designates 209.85.220.69 as permitted sender);
    dmarc=pass (p=reject dis=none) header.from=accounts.google.com
From: Google <no-reply@accounts.google.com>
To: officer@defense-gov.in
Subject: Security alert: New sign-in on Chrome on Windows
Date: Thu, 10 Sep 2026 08:00:10 +0530
Message-ID: <notification-92817291@accounts.google.com>
X-Originating-IP: [209.85.220.69]
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8`,
    rawBody: `Hi Officer,

Your Google Account was just signed in to from a new Chrome browser on Windows.

Device: Chrome on Windows 11
Time: September 10, 2026, 8:00 AM IST
Location: New Delhi, India

If this was you, you don't need to do anything. If not, we'll help you secure your account:
https://myaccount.google.com/notifications

Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA`,
    investigation: {
      id: 'INV-2026-0003',
      createdAt: '2026-09-10T08:05:00+05:30',
      fileName: 'google_security_alert.eml',
      subject: 'Security alert: New sign-in on Chrome on Windows',
      sender: 'no-reply@accounts.google.com',
      recipient: 'officer@defense-gov.in',
      threatScore: 4,
      riskLevel: 'LOW',
      classification: 'LOW – CLEAN / AUTHENTICATED',
      summary:
        'Legitimate transactional security alert with valid cryptographic signatures. Full SPF, DKIM, and DMARC alignment verified against authorized Google production infrastructure.',
      emailHeaders: {
        from: 'Google <no-reply@accounts.google.com>',
        fromDisplayName: 'Google',
        fromEmail: 'no-reply@accounts.google.com',
        to: 'officer@defense-gov.in',
        replyTo: 'no-reply@accounts.google.com',
        returnPath: '<3_z4tYwoTA9cGH-UHSODFFRXQWV.JRRJOH.FRP@gaia.bounces.google.com>',
        messageId: '<notification-92817291@accounts.google.com>',
        date: 'Thu, 10 Sep 2026 08:00:10 +0530',
        subject: 'Security alert: New sign-in on Chrome on Windows',
        xOriginatingIp: '209.85.220.69',
        rawHeaders: `From: Google <no-reply@accounts.google.com>\nTo: officer@defense-gov.in\nSubject: Security alert: New sign-in on Chrome on Windows`,
      },
      authentication: {
        spf: {
          status: 'PASS',
          domain: 'accounts.google.com',
          ip: '209.85.220.69',
          details: 'Sender IP matches authorized Google netblock in public SPF record.',
        },
        dkim: {
          status: 'PASS',
          selector: '20230601',
          domain: 'accounts.google.com',
          details: 'RSA-SHA256 signature cryptographically verified and intact.',
        },
        dmarc: {
          status: 'PASS',
          policy: 'p=reject',
          details: 'DMARC alignment verified with strict enforcement policy.',
        },
      },
      transmissionPath: [
        {
          hopNumber: 1,
          ip: '209.85.220.69',
          hostname: 'mail-sor-f69.google.com',
          delay: '0s',
          country: 'United States',
          countryCode: 'US',
          city: 'Mountain View',
          isp: 'Google LLC',
          asn: 'AS15169',
          latitude: 37.422,
          longitude: -122.084,
          riskLevel: 'LOW',
          isSenderOrigin: true,
          isSuspicious: false,
        },
        {
          hopNumber: 2,
          ip: '103.45.12.9',
          hostname: 'mx.defense-gov.in',
          delay: '5s',
          country: 'India',
          countryCode: 'IN',
          city: 'New Delhi',
          isp: 'National Informatics Network',
          asn: 'AS45820',
          latitude: 28.6139,
          longitude: 77.209,
          riskLevel: 'LOW',
          isSuspicious: false,
        },
      ],
      urls: [
        {
          id: 'url-clean-1',
          url: 'https://myaccount.google.com/notifications',
          defanged: 'hxxps://myaccount[.]google[.]com/notifications',
          domain: 'google.com',
          protocol: 'HTTPS',
          redirectChain: ['https://myaccount.google.com/notifications'],
          risk: 'LOW',
          reason: 'Official Google Account settings URL over TLS 1.3.',
          isLookalike: false,
          isIpBased: false,
          isShortener: false,
        },
      ],
      domainIntelligence: [
        {
          domain: 'google.com',
          registrar: 'MarkMonitor Inc.',
          creationDate: '1997-09-15T04:00:00Z',
          expiryDate: '2028-09-14T04:00:00Z',
          ageDays: 10588,
          nameservers: ['ns1.google.com', 'ns2.google.com'],
          tld: '.com',
          riskScore: 1,
          reputation: 'SAFE',
        },
      ],
      explainableReasons: [
        {
          id: 'clean-1',
          title: 'Full Cryptographic Authentication Passed',
          severity: 'LOW',
          evidence: 'SPF, DKIM, and DMARC checks are 100% aligned with verified Google infrastructure.',
          category: 'AUTHENTICATION',
          weight: 0,
        },
        {
          id: 'clean-2',
          title: 'High-Reputation Established Domain',
          severity: 'LOW',
          evidence: 'Domain google.com has been established for > 28 years with clean historical telemetry.',
          category: 'DOMAIN',
          weight: 0,
        },
      ],
      iocs: [],
      timeline: [
        { time: '08:00:10 AM', stage: 'Email Ingestion', description: 'Message arrived from Google MTA.', status: 'COMPLETED' },
        { time: '08:00:15 AM', stage: 'Authentication Verified', description: 'DKIM and SPF verified cleanly.', status: 'COMPLETED' },
        { time: '08:00:20 AM', stage: 'Analysis Completed', description: 'Email classified as Legitimate (Threat Score: 4/100).', status: 'COMPLETED' },
      ],
      emailBody: `Hi Officer,\n\nYour Google Account was just signed in to from a new Chrome browser on Windows...`,
    },
  },
];
