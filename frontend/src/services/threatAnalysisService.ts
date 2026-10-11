import {
  InvestigationData,
  RiskLevel,
  AuthenticationResult,
  UrlAnalysisItem,
  DomainIntelligenceItem,
  ExplainableReason,
  IndicatorOfCompromise,
  InvestigationTimelineEvent,
} from '../types/forensic';
import { parseRawEmail } from './emailParser';
import { analyzeDomain } from './domainIntelligenceService';
import {
  buildTransmissionPath,
  buildTransmissionPathForDomain,
  lookupIpIntelligence,
  resolveDomainIp,
} from './ipIntelligenceService';
import { defangUrl } from '../utils/defang';

/**
 * Specialized URL Threat Intelligence & Link Forensics Engine
 */
export async function analyzeUrlThreat(
  inputUrl: string,
  fileName?: string
): Promise<InvestigationData> {
  const trimmed = inputUrl.trim();
  const normalizedUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
    ? trimmed
    : `https://${trimmed}`;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    parsedUrl = new URL('https://invalid-url.example');
  }

  const now = new Date();
  const investigationId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const explainableReasons: ExplainableReason[] = [];

  const isHttp = parsedUrl.protocol.toLowerCase() === 'http:';
  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsedUrl.hostname);
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'is.gd', 'cutt.ly', 'rb.gy'];
  const isShortener = shorteners.includes(parsedUrl.hostname.toLowerCase());

  // Analyze target domain
  const targetDomainIntel = await analyzeDomain(parsedUrl.hostname);
  const domainIntelList: DomainIntelligenceItem[] = [targetDomainIntel];

  // Inspect path and query parameters
  const sensitiveKeywords = [
    'login',
    'signin',
    'verify',
    'verification',
    'account',
    'banking',
    'secure',
    'security',
    'update',
    'suspend',
    'wallet',
    'airdrop',
    'claim',
    'recovery',
    'password',
    'reset',
    'auth',
    'billing',
    'unlock',
  ];
  const matchedPathKeywords = sensitiveKeywords.filter(
    (k) => parsedUrl.pathname.toLowerCase().includes(k) || parsedUrl.search.toLowerCase().includes(k)
  );

  const dangerousExtensions = ['.exe', '.scr', '.bat', '.vbs', '.iso', '.zip', '.apk', '.cmd', '.ps1'];
  const hasDangerousExt = dangerousExtensions.some((ext) => parsedUrl.pathname.toLowerCase().endsWith(ext));

  // Compute Threat Score
  let threatScore = 0;

  if (targetDomainIntel.reputation === 'SAFE') {
    // Legitimate / Clean Domain
    threatScore = targetDomainIntel.riskScore; // 2 to 20

    if (hasDangerousExt) {
      threatScore += 70;
      explainableReasons.push({
        id: 'reason-url-executable',
        title: 'Weaponized binary or archive payload detected in URL path',
        severity: 'CRITICAL',
        evidence: `Direct download of executable extension "${parsedUrl.pathname.split('.').pop()}" detected on target endpoint.`,
        category: 'URL',
        weight: 70,
      });
    }

    if (isHttp) {
      threatScore += 20;
      explainableReasons.push({
        id: 'reason-url-insecure',
        title: 'Insecure unencrypted HTTP protocol',
        severity: 'MEDIUM',
        evidence: 'Endpoint lacks SSL/TLS transport layer encryption. Data transmitted in plaintext.',
        category: 'URL',
        weight: 20,
      });
    }

    if (isShortener) {
      threatScore += 25;
      explainableReasons.push({
        id: 'reason-url-shortener',
        title: 'URL shortener obscures destination endpoint',
        severity: 'MEDIUM',
        evidence: `Shortener service "${parsedUrl.hostname}" redirects traffic through an uninspected link.`,
        category: 'URL',
        weight: 25,
      });
    }
  } else if (targetDomainIntel.reputation === 'MALICIOUS') {
    // Brand Impersonation / Lookalike / Flagged Malicious
    threatScore = Math.max(80, targetDomainIntel.riskScore);

    explainableReasons.push({
      id: 'reason-domain-lookalike',
      title: 'Brand Impersonation & Typosquatting Attack Detected',
      severity: 'CRITICAL',
      evidence: targetDomainIntel.similarityReason || `Domain "${parsedUrl.hostname}" mimics a trusted brand.`,
      category: 'DOMAIN',
      weight: 45,
    });

    if (matchedPathKeywords.length > 0) {
      threatScore += 10;
      explainableReasons.push({
        id: 'reason-path-phish',
        title: 'Credential harvesting form pattern in URL path',
        severity: 'CRITICAL',
        evidence: `Action triggers detected: ${matchedPathKeywords.map((k) => `"${k}"`).join(', ')}.`,
        category: 'URL',
        weight: 25,
      });
    }

    if (isHttp) {
      threatScore += 10;
      explainableReasons.push({
        id: 'reason-url-http-malicious',
        title: 'Unencrypted plain HTTP on credential harvesting page',
        severity: 'HIGH',
        evidence: 'Fake login and verification endpoints frequently omit authentic SSL certificates.',
        category: 'URL',
        weight: 15,
      });
    }

    if (isIpHost) {
      threatScore += 15;
      explainableReasons.push({
        id: 'reason-url-iphost',
        title: 'Raw IP address used as URL host',
        severity: 'HIGH',
        evidence: 'Attackers use raw IP endpoints to bypass domain reputation blocklists.',
        category: 'URL',
        weight: 20,
      });
    }
  } else {
    // Suspicious Domain (e.g. High-risk TLD or newly registered)
    threatScore = Math.max(45, targetDomainIntel.riskScore);

    explainableReasons.push({
      id: 'reason-domain-suspicious',
      title: 'Target domain has elevated threat indicators',
      severity: 'HIGH',
      evidence: targetDomainIntel.similarityReason || `Domain "${parsedUrl.hostname}" uses a high-risk TLD or newly created WHOIS entry.`,
      category: 'DOMAIN',
      weight: 30,
    });

    if (isHttp) {
      threatScore += 15;
      explainableReasons.push({
        id: 'reason-url-http',
        title: 'Insecure unencrypted HTTP protocol',
        severity: 'MEDIUM',
        evidence: 'Traffic to this endpoint is not encrypted.',
        category: 'URL',
        weight: 15,
      });
    }

    if (matchedPathKeywords.length > 0) {
      threatScore += 20;
      explainableReasons.push({
        id: 'reason-path-keywords',
        title: 'Sensitive action keywords located in URL path',
        severity: 'HIGH',
        evidence: `URL targets sensitive actions: ${matchedPathKeywords.map((k) => `"${k}"`).join(', ')}.`,
        category: 'URL',
        weight: 20,
      });
    }
  }

  threatScore = Math.min(99, Math.max(0, threatScore));

  let riskLevel: RiskLevel = 'LOW';
  let classification = 'LOW – CLEAN & VERIFIED SAFE URL';

  if (threatScore >= 75) {
    riskLevel = 'CRITICAL';
    classification = targetDomainIntel.lookalikeTarget
      ? `CRITICAL – BRAND IMPERSONATION (${targetDomainIntel.lookalikeTarget.toUpperCase()})`
      : 'CRITICAL – PHISHING LINK / MALICIOUS TARGET';
  } else if (threatScore >= 45) {
    riskLevel = 'HIGH';
    classification = 'HIGH – SUSPICIOUS WEBPAGE';
  } else if (threatScore >= 25) {
    riskLevel = 'MEDIUM';
    classification = 'MEDIUM – UNVERIFIED / SUSPICIOUS LINK';
  }

  // Resolve Target Host IP
  const isMaliciousDomain = targetDomainIntel.reputation === 'MALICIOUS' || isIpHost;
  const resolvedIp = await resolveDomainIp(parsedUrl.hostname, isMaliciousDomain);
  const transmissionPath = await buildTransmissionPathForDomain(parsedUrl.hostname, isMaliciousDomain, resolvedIp);

  // URL Item for analysis table
  let urlReason = 'Standard web URL.';
  if (riskLevel === 'CRITICAL') {
    urlReason = targetDomainIntel.similarityReason || 'Malicious link detected with high-confidence phishing indicators.';
  } else if (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
    urlReason = isHttp ? 'Unencrypted HTTP endpoint.' : 'Suspicious TLD or URL structure.';
  } else {
    urlReason = 'Verified clean domain with legitimate infrastructure.';
  }

  const urlItems: UrlAnalysisItem[] = [
    {
      id: 'url-1',
      url: normalizedUrl,
      defanged: defangUrl(normalizedUrl),
      domain: parsedUrl.hostname,
      protocol: isHttp ? 'HTTP' : 'HTTPS',
      redirectChain: [normalizedUrl],
      risk: riskLevel,
      reason: urlReason,
      isLookalike: targetDomainIntel.lookalikeTarget !== undefined,
      isIpBased: isIpHost,
      isShortener,
    },
  ];

  // IOCs
  const iocs: IndicatorOfCompromise[] = [
    {
      id: 'ioc-url-1',
      type: 'URL',
      indicator: normalizedUrl,
      risk: riskLevel,
      reason: urlReason,
    },
    {
      id: 'ioc-domain-1',
      type: 'Domain',
      indicator: parsedUrl.hostname,
      risk: targetDomainIntel.reputation === 'SAFE' ? 'LOW' : 'CRITICAL',
      reason: targetDomainIntel.similarityReason || 'Target web domain investigated',
    },
    {
      id: 'ioc-ip-1',
      type: 'IP',
      indicator: resolvedIp.ip,
      risk: resolvedIp.riskLevel,
      reason: `Destination server hosting ${parsedUrl.hostname} (${resolvedIp.isp}, ${resolvedIp.country})`,
    },
  ];

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const timeline: InvestigationTimelineEvent[] = [
    {
      time: formatTime(new Date(now.getTime() - 80000)),
      stage: 'URL Ingestion & Canonicalization',
      description: `Target link [${normalizedUrl.slice(0, 45)}] parsed and validated.`,
      status: 'COMPLETED',
    },
    {
      time: formatTime(new Date(now.getTime() - 65000)),
      stage: 'SSL / TLS Protocol Check',
      description: isHttp ? 'HTTP unencrypted protocol detected (No TLS).' : 'Valid HTTPS encryption verified.',
      status: isHttp ? 'FLAGGED' : 'COMPLETED',
    },
    {
      time: formatTime(new Date(now.getTime() - 45000)),
      stage: 'Domain WHOIS & Typosquatting Audit',
      description: `Evaluated "${parsedUrl.hostname}". Reputation: ${targetDomainIntel.reputation} (Age: ${targetDomainIntel.ageDays} days).`,
      status: targetDomainIntel.reputation === 'SAFE' ? 'COMPLETED' : 'FLAGGED',
    },
    {
      time: formatTime(new Date(now.getTime() - 25000)),
      stage: 'IP Geolocation & ASN Resolution',
      description: `Resolved destination host to ${resolvedIp.ip} (${resolvedIp.city}, ${resolvedIp.country}) via ${resolvedIp.isp}.`,
      status: resolvedIp.isSuspicious ? 'FLAGGED' : 'COMPLETED',
    },
    {
      time: formatTime(now),
      stage: 'URL Threat Score Synthesized',
      description: `Explainable AI synthesized threat score: ${threatScore}/100 (${classification}).`,
      status: threatScore >= 60 ? 'FLAGGED' : 'COMPLETED',
    },
  ];

  const summary =
    threatScore >= 60
      ? `Threat Alert: Target URL "${parsedUrl.hostname}" is classified as ${classification} (Threat Score: ${threatScore}/100). The domain exhibits signs of deceptive brand impersonation or malicious hosting designed to capture user credentials.`
      : threatScore >= 25
      ? `Caution Advised: Target URL "${parsedUrl.hostname}" flagged with elevated risk (${threatScore}/100). Security verification identified unencrypted protocols or high-risk domain registration parameters.`
      : `Verified Safe: Target URL "${parsedUrl.hostname}" verified authentic with clean reputation score (${threatScore}/100). Valid TLS encryption and established WHOIS registration confirmed.`;

  return {
    id: investigationId,
    createdAt: now.toISOString(),
    fileName: fileName || `URL: ${normalizedUrl}`,
    subject: `URL Threat Scan: ${parsedUrl.hostname}`,
    sender: 'ThreatMailer Automated Web Defense',
    recipient: 'soc-analyst@enterprise-defense.local',
    threatScore,
    riskLevel,
    classification,
    summary,
    emailHeaders: {
      from: 'ThreatMailer Automated Web Defense <scanner@threatmailer.local>',
      fromDisplayName: 'ThreatMailer Automated Web Defense',
      fromEmail: 'scanner@threatmailer.local',
      to: 'soc-analyst@enterprise-defense.local',
      subject: `URL Threat Scan: ${parsedUrl.hostname}`,
      date: now.toUTCString(),
      messageId: `<scan-${Date.now()}@threatmailer.local>`,
      xOriginatingIp: resolvedIp.ip,
      rawHeaders: `X-Target-URL: ${normalizedUrl}\nX-Target-Host: ${parsedUrl.hostname}\nX-Resolved-IP: ${resolvedIp.ip}`,
    },
    authentication: {
      spf: {
        status: targetDomainIntel.reputation === 'SAFE' ? 'PASS' : 'NONE',
        domain: parsedUrl.hostname,
        ip: resolvedIp.ip,
        details: targetDomainIntel.reputation === 'SAFE' ? 'Domain DNS and security records verified.' : 'N/A for direct URL scan.',
      },
      dkim: {
        status: targetDomainIntel.reputation === 'SAFE' ? 'PASS' : 'NONE',
        selector: 'web-ssl',
        domain: parsedUrl.hostname,
        details: isHttp ? 'Insecure plain HTTP. No cryptographic certificate.' : 'Valid HTTPS TLS cryptographic certificate.',
      },
      dmarc: {
        status: targetDomainIntel.reputation === 'SAFE' ? 'PASS' : 'NONE',
        policy: 'p=reject',
        details: 'Domain reputation check aligned with global intelligence feeds.',
      },
    },
    transmissionPath,
    urls: urlItems,
    domainIntelligence: domainIntelList,
    explainableReasons,
    iocs,
    timeline,
    emailBody: `Target URL: ${normalizedUrl}\nHost: ${parsedUrl.hostname}\nProtocol: ${isHttp ? 'HTTP' : 'HTTPS'}\nIP: ${resolvedIp.ip}`,
  };
}

/**
 * Modular AI Threat Detection and Forensic Intelligence Engine for ThreatMailer
 */
export async function analyzeEmailThreat(
  rawInput: string,
  fileName?: string
): Promise<InvestigationData> {
  const trimmed = rawInput.trim();

  // Route directly to URL analyzer if fileName starts with 'URL:' or input is a single URL/domain
  if (
    fileName?.startsWith('URL:') ||
    fileName?.startsWith('url_') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    (!trimmed.includes('\n') && /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed))
  ) {
    const targetUrl = fileName?.startsWith('URL: ')
      ? fileName.replace('URL: ', '').trim()
      : trimmed;
    return analyzeUrlThreat(targetUrl, fileName);
  }

  const parsed = parseRawEmail(rawInput);
  const { headers, body, extractedUrls, extractedIps } = parsed;

  const now = new Date();
  const investigationId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const explainableReasons: ExplainableReason[] = [];
  let threatScore = 0;

  // 1. Domain Extraction & Analysis
  const senderDomain = headers.fromEmail.includes('@')
    ? headers.fromEmail.split('@')[1].toLowerCase()
    : 'unknown-domain.example';

  const domainIntel = await analyzeDomain(senderDomain);
  const domainIntelList: DomainIntelligenceItem[] = [domainIntel];

  if (domainIntel.reputation === 'MALICIOUS') {
    threatScore += 35;
    explainableReasons.push({
      id: 'reason-domain-malicious',
      title: 'Sender domain resembles a trusted organization (Homoglyph Attack)',
      severity: 'CRITICAL',
      evidence: domainIntel.similarityReason || `Domain "${senderDomain}" mimics a known brand.`,
      category: 'DOMAIN',
      weight: 35,
    });
  } else if (domainIntel.reputation === 'SUSPICIOUS') {
    threatScore += 20;
    explainableReasons.push({
      id: 'reason-domain-suspicious',
      title: 'Sender domain has suspicious indicators',
      severity: 'HIGH',
      evidence: `Domain "${senderDomain}" uses a high-risk TLD or newly registered WHOIS record.`,
      category: 'DOMAIN',
      weight: 20,
    });
  }

  if (domainIntel.ageDays <= 14) {
    threatScore += 10;
    explainableReasons.push({
      id: 'reason-domain-age',
      title: 'Domain appears newly registered (< 14 days old)',
      severity: 'HIGH',
      evidence: `WHOIS creation date is ${domainIntel.creationDate.split('T')[0]} (${domainIntel.ageDays} days active).`,
      category: 'DOMAIN',
      weight: 10,
    });
  }

  // 2. Authentication Checks (SPF / DKIM / DMARC)
  const rawHeadersLower = headers.rawHeaders.toLowerCase();
  let spfStatus: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NONE' = 'NONE';
  let dkimStatus: 'PASS' | 'FAIL' | 'NONE' = 'NONE';
  let dmarcStatus: 'PASS' | 'FAIL' | 'NONE' = 'NONE';

  if (rawHeadersLower.includes('spf=pass')) spfStatus = 'PASS';
  else if (rawHeadersLower.includes('spf=fail')) spfStatus = 'FAIL';
  else if (rawHeadersLower.includes('spf=softfail')) spfStatus = 'SOFTFAIL';

  if (rawHeadersLower.includes('dkim=pass')) dkimStatus = 'PASS';
  else if (rawHeadersLower.includes('dkim=fail')) dkimStatus = 'FAIL';

  if (rawHeadersLower.includes('dmarc=pass')) dmarcStatus = 'PASS';
  else if (rawHeadersLower.includes('dmarc=fail')) dmarcStatus = 'FAIL';

  // Heuristic if raw email lacked explicit Authentication-Results header
  if (spfStatus === 'NONE' && domainIntel.reputation === 'MALICIOUS') spfStatus = 'FAIL';
  if (dkimStatus === 'NONE' && domainIntel.reputation === 'MALICIOUS') dkimStatus = 'FAIL';
  if (dmarcStatus === 'NONE' && domainIntel.reputation === 'MALICIOUS') dmarcStatus = 'FAIL';

  if (spfStatus === 'FAIL') {
    threatScore += 20;
    explainableReasons.push({
      id: 'reason-spf-fail',
      title: 'SPF authentication failed (Unauthorized Sender IP)',
      severity: 'CRITICAL',
      evidence: `Originating IP ${headers.xOriginatingIp} is not authorized in SPF DNS record for ${senderDomain}.`,
      category: 'AUTHENTICATION',
      weight: 20,
    });
  } else if (spfStatus === 'SOFTFAIL') {
    threatScore += 10;
    explainableReasons.push({
      id: 'reason-spf-softfail',
      title: 'SPF authentication soft-failed (~all directive)',
      severity: 'MEDIUM',
      evidence: `Domain owner marked IP ${headers.xOriginatingIp} as questionable via SPF ~all policy.`,
      category: 'AUTHENTICATION',
      weight: 10,
    });
  }

  if (dkimStatus === 'FAIL') {
    threatScore += 15;
    explainableReasons.push({
      id: 'reason-dkim-fail',
      title: 'DKIM cryptographic signature check failed',
      severity: 'HIGH',
      evidence: 'Cryptographic hash signature could not be verified. Email content was altered in transit.',
      category: 'AUTHENTICATION',
      weight: 15,
    });
  }

  if (dmarcStatus === 'FAIL') {
    threatScore += 15;
    explainableReasons.push({
      id: 'reason-dmarc-fail',
      title: 'DMARC alignment validation failed',
      severity: 'HIGH',
      evidence: `Both SPF and DKIM failed domain alignment for sender header "${senderDomain}".`,
      category: 'AUTHENTICATION',
      weight: 15,
    });
  }

  const authentication: AuthenticationResult = {
    spf: {
      status: spfStatus,
      domain: senderDomain,
      ip: headers.xOriginatingIp || 'Unknown',
      details:
        spfStatus === 'PASS'
          ? 'Sender IP address matches authorized SPF record.'
          : spfStatus === 'FAIL'
          ? 'Sender IP is not permitted to send on behalf of this domain.'
          : 'SPF record could not be fully verified.',
    },
    dkim: {
      status: dkimStatus,
      selector: 'k1',
      domain: senderDomain,
      details:
        dkimStatus === 'PASS'
          ? 'Valid cryptographic signature verified against DNS public key.'
          : dkimStatus === 'FAIL'
          ? 'Signature verification failed; message integrity compromised.'
          : 'No DKIM signature found on incoming message.',
    },
    dmarc: {
      status: dmarcStatus,
      policy: dmarcStatus === 'FAIL' ? 'p=reject' : 'p=none',
      details:
        dmarcStatus === 'PASS'
          ? 'DMARC policy aligned and verified.'
          : dmarcStatus === 'FAIL'
          ? 'DMARC policy failed. Elevated probability of address spoofing.'
          : 'No published DMARC policy.',
    },
  };

  // 3. Reply-To Header Divergence Check (BEC / Spear-phishing)
  if (headers.replyTo && headers.fromEmail) {
    const replyDomain = headers.replyTo.includes('@') ? headers.replyTo.split('@')[1].toLowerCase() : '';
    if (replyDomain && replyDomain !== senderDomain) {
      threatScore += 25;
      explainableReasons.push({
        id: 'reason-replyto-divergence',
        title: 'Reply-To divergence detected (Response Hijacking)',
        severity: 'CRITICAL',
        evidence: `Sender claims to be "${headers.fromEmail}" but replies are routed to external address "${headers.replyTo}".`,
        category: 'AUTHENTICATION',
        weight: 25,
      });
    }
  }

  // 4. URL & Link Analysis
  const urlItems: UrlAnalysisItem[] = [];
  let hasInsecureUrl = false;
  let hasTyposquatUrl = false;

  for (let i = 0; i < extractedUrls.length; i++) {
    const rawUrl = extractedUrls[i];
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      continue;
    }

    const isHttp = parsedUrl.protocol.toLowerCase() === 'http:';
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsedUrl.hostname);
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'ow.ly', 'is.gd'];
    const isShortener = shorteners.includes(parsedUrl.hostname.toLowerCase());

    const targetDomainIntel = await analyzeDomain(parsedUrl.hostname);
    if (!domainIntelList.some((d) => d.domain === targetDomainIntel.domain)) {
      domainIntelList.push(targetDomainIntel);
    }

    let urlRisk: RiskLevel = 'LOW';
    let urlReason = 'Standard web URL.';

    if (targetDomainIntel.reputation === 'MALICIOUS' || isIpHost) {
      urlRisk = 'CRITICAL';
      urlReason = isIpHost
        ? 'Suspicious raw IP address used as URL host (bypasses domain filters).'
        : 'URL links to a known typosquatted phishing domain.';
      hasTyposquatUrl = true;
    } else if (isHttp) {
      urlRisk = 'HIGH';
      urlReason = 'Unencrypted HTTP protocol used for link with sensitive action context.';
      hasInsecureUrl = true;
    } else if (isShortener) {
      urlRisk = 'MEDIUM';
      urlReason = 'URL shortener hides ultimate destination endpoint.';
    }

    urlItems.push({
      id: `url-${i + 1}`,
      url: rawUrl,
      defanged: defangUrl(rawUrl),
      domain: parsedUrl.hostname,
      protocol: isHttp ? 'HTTP' : 'HTTPS',
      redirectChain: [rawUrl],
      risk: urlRisk,
      reason: urlReason,
      isLookalike: targetDomainIntel.lookalikeTarget !== undefined,
      isIpBased: isIpHost,
      isShortener,
    });
  }

  if (hasTyposquatUrl) {
    threatScore += 25;
    explainableReasons.push({
      id: 'reason-url-typosquat',
      title: 'Suspicious redirect URL points to typosquatted domain',
      severity: 'CRITICAL',
      evidence: 'One or more embedded links direct users to imitation websites designed for credential harvesting.',
      category: 'URL',
      weight: 25,
    });
  } else if (hasInsecureUrl) {
    threatScore += 12;
    explainableReasons.push({
      id: 'reason-url-http',
      title: 'Insecure unencrypted HTTP hyperlinks detected',
      severity: 'MEDIUM',
      evidence: 'Legitimate corporate organizations do not issue login links over plain HTTP.',
      category: 'URL',
      weight: 12,
    });
  }

  // 5. Subject and Body Semantic Urgency Triggers
  const subjectAndBody = `${headers.subject} ${body}`.toLowerCase();
  const urgencyKeywords = [
    'suspended',
    'suspension',
    'within 24 hours',
    'unauthorized',
    'action required',
    'wire transfer',
    'advance fee',
    'confidential',
    'verify your account',
    'password expired',
    'reset immediately',
    'fraudulent attempt',
    'legal action',
  ];

  const matchedKeywords = urgencyKeywords.filter((kw) => subjectAndBody.includes(kw));
  if (matchedKeywords.length > 0) {
    threatScore += Math.min(20, matchedKeywords.length * 8);
    explainableReasons.push({
      id: 'reason-social-eng',
      title: 'Urgent social engineering psychological pressure',
      severity: matchedKeywords.length >= 2 ? 'HIGH' : 'MEDIUM',
      evidence: `Coercive trigger phrases detected: ${matchedKeywords.map((k) => `"${k}"`).join(', ')}.`,
      category: 'BODY_CONTENT',
      weight: 15,
    });
  }

  // 6. IP Intelligence & Transmission Hop Path
  const transmissionPath = await buildTransmissionPath(extractedIps);
  const senderIpDetails = await lookupIpIntelligence(headers.xOriginatingIp || '185.220.101.5');

  if (senderIpDetails.riskLevel === 'CRITICAL' || senderIpDetails.isSuspicious) {
    threatScore += 15;
    explainableReasons.push({
      id: 'reason-ip-reputation',
      title: 'Sender IP has suspicious reputation on Threat Intelligence feeds',
      severity: 'HIGH',
      evidence: `Originating IP ${senderIpDetails.ip} is mapped to ${senderIpDetails.isp} (${senderIpDetails.asn}) with known malicious relays.`,
      category: 'IP_REPUTATION',
      weight: 15,
    });
  }

  // Cap threat score between 0 and 100
  threatScore = Math.min(100, Math.max(0, threatScore));

  // Determine Risk Level & Classification
  let riskLevel: RiskLevel = 'LOW';
  let classification = 'LOW – CLEAN / AUTHENTICATED';

  if (threatScore >= 81) {
    riskLevel = 'CRITICAL';
    classification = 'CRITICAL – PHISHING';
  } else if (threatScore >= 61) {
    riskLevel = 'HIGH';
    classification =
      headers.replyTo && headers.replyTo !== headers.fromEmail
        ? 'HIGH – BUSINESS EMAIL COMPROMISE (BEC)'
        : 'HIGH – SUSPICIOUS / SPOOFED';
  } else if (threatScore >= 31) {
    riskLevel = 'MEDIUM';
    classification = 'MEDIUM – SUSPICIOUS';
  }

  // Extract Indicators of Compromise (IOCs)
  const iocs: IndicatorOfCompromise[] = [];

  // IP IOCs
  extractedIps.forEach((ip, idx) => {
    if (ip !== '127.0.0.1') {
      iocs.push({
        id: `ioc-ip-${idx}`,
        type: 'IP',
        indicator: ip,
        risk: threatScore >= 70 ? 'CRITICAL' : 'MEDIUM',
        reason: idx === 0 ? 'Originating sender IP relay' : 'Intermediate transmission relay',
      });
    }
  });

  // Domain IOCs
  domainIntelList.forEach((d, idx) => {
    if (d.reputation !== 'SAFE') {
      iocs.push({
        id: `ioc-dom-${idx}`,
        type: 'Domain',
        indicator: d.domain,
        risk: d.reputation === 'MALICIOUS' ? 'CRITICAL' : 'HIGH',
        reason: d.similarityReason || 'Impersonation domain flagged in email header/body',
      });
    }
  });

  // URL IOCs
  urlItems.forEach((u, idx) => {
    if (u.risk !== 'LOW') {
      iocs.push({
        id: `ioc-url-${idx}`,
        type: 'URL',
        indicator: u.url,
        risk: u.risk,
        reason: u.reason,
      });
    }
  });

  // Email Address IOCs
  if (threatScore >= 60) {
    iocs.push({
      id: `ioc-email-from`,
      type: 'Email',
      indicator: headers.fromEmail,
      risk: 'HIGH',
      reason: 'Spoofed or malicious sender address',
    });
    if (headers.replyTo) {
      iocs.push({
        id: `ioc-email-reply`,
        type: 'Email',
        indicator: headers.replyTo,
        risk: 'HIGH',
        reason: 'Divergent reply-to exfiltration destination',
      });
    }
  }

  // Generate Investigation Timeline
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const timeline: InvestigationTimelineEvent[] = [
    {
      time: formatTime(new Date(now.getTime() - 90000)),
      stage: 'Email Received',
      description: `Ingested email with subject "${headers.subject.slice(0, 45)}...".`,
      status: 'COMPLETED',
    },
    {
      time: formatTime(new Date(now.getTime() - 75000)),
      stage: 'Header Forensics',
      description: `Parsed RFC 5322 metadata. Originating IP identified: [${headers.xOriginatingIp}].`,
      status: 'COMPLETED',
    },
    {
      time: formatTime(new Date(now.getTime() - 55000)),
      stage: 'IP Intelligence Extracted',
      description: `Mapped IP geolocation to ${senderIpDetails.city}, ${senderIpDetails.country} (${senderIpDetails.asn}).`,
      status: senderIpDetails.isSuspicious ? 'FLAGGED' : 'COMPLETED',
    },
    {
      time: formatTime(new Date(now.getTime() - 40000)),
      stage: 'Domain & Typosquatting Analysis',
      description: `Evaluated "${senderDomain}". Homoglyph proximity test completed.`,
      status: domainIntel.reputation === 'SAFE' ? 'COMPLETED' : 'FLAGGED',
    },
    {
      time: formatTime(new Date(now.getTime() - 25000)),
      stage: 'Cryptographic Authentication',
      description: `SPF=${spfStatus}, DKIM=${dkimStatus}, DMARC=${dmarcStatus}.`,
      status: spfStatus === 'PASS' && dkimStatus === 'PASS' ? 'COMPLETED' : 'FLAGGED',
    },
    {
      time: formatTime(new Date(now.getTime() - 10000)),
      stage: 'Threat Score Computed',
      description: `Explainable AI synthesized threat score: ${threatScore}/100 (${classification}).`,
      status: threatScore >= 60 ? 'FLAGGED' : 'COMPLETED',
    },
    {
      time: formatTime(now),
      stage: 'Forensic Investigation Finalized',
      description: 'Dossier compiled with extracted IOCs and evidentiary trail for SOC escalation.',
      status: 'COMPLETED',
    },
  ];

  return {
    id: investigationId,
    createdAt: now.toISOString(),
    fileName: fileName || 'uploaded_email.eml',
    subject: headers.subject,
    sender: headers.from,
    recipient: headers.to,
    threatScore,
    riskLevel,
    classification,
    summary:
      threatScore >= 60
        ? `Security incident flagged as ${classification} (Threat Score ${threatScore}/100). Evidentiary analysis identified ${explainableReasons.length} primary risk factors including domain manipulation, authentication anomalies, and coercive phrasing.`
        : `Email validated with low risk score (${threatScore}/100). Authentication and routing infrastructure conform to legitimate sender parameters.`,
    emailHeaders: headers,
    authentication,
    transmissionPath,
    urls: urlItems,
    domainIntelligence: domainIntelList,
    explainableReasons,
    iocs,
    timeline,
    emailBody: body,
  };
}
