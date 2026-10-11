import { TransmissionHop, RiskLevel } from '../types/forensic';

export interface IpDetails {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  asn: string;
  latitude: number;
  longitude: number;
  riskLevel: RiskLevel;
  isSuspicious: boolean;
}

// Built-in GeoIP and Threat Intelligence database for ThreatMailer
const MOCK_IP_DB: Record<string, Partial<IpDetails>> = {
  '185.220.101.5': {
    country: 'Singapore',
    countryCode: 'SG',
    city: 'Jurong West',
    isp: 'Starlight Anonymized Cloud Hosting Ltd',
    asn: 'AS49210 (Bulletproof Hosting)',
    latitude: 1.3521,
    longitude: 103.8198,
    riskLevel: 'CRITICAL',
    isSuspicious: true,
  },
  '194.26.29.12': {
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
  '195.154.122.88': {
    country: 'France',
    countryCode: 'FR',
    city: 'Paris',
    isp: 'Iliad Enterprise Dedicated Hosting',
    asn: 'AS12876',
    latitude: 48.8566,
    longitude: 2.3522,
    riskLevel: 'HIGH',
    isSuspicious: true,
  },
  '209.85.220.69': {
    country: 'United States',
    countryCode: 'US',
    city: 'Mountain View',
    isp: 'Google LLC',
    asn: 'AS15169',
    latitude: 37.422,
    longitude: -122.084,
    riskLevel: 'LOW',
    isSuspicious: false,
  },
  '103.21.244.18': {
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
  '103.45.12.9': {
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
  '142.250.190.46': {
    country: 'United States',
    countryCode: 'US',
    city: 'Mountain View',
    isp: 'Google LLC',
    asn: 'AS15169',
    latitude: 37.422,
    longitude: -122.084,
    riskLevel: 'LOW',
    isSuspicious: false,
  },
  '20.112.52.29': {
    country: 'United States',
    countryCode: 'US',
    city: 'Redmond',
    isp: 'Microsoft Corporation',
    asn: 'AS8075',
    latitude: 47.674,
    longitude: -122.1215,
    riskLevel: 'LOW',
    isSuspicious: false,
  },
  '17.253.144.10': {
    country: 'United States',
    countryCode: 'US',
    city: 'Cupertino',
    isp: 'Apple Inc.',
    asn: 'AS714',
    latitude: 37.323,
    longitude: -122.0322,
    riskLevel: 'LOW',
    isSuspicious: false,
  },
  '140.82.121.4': {
    country: 'United States',
    countryCode: 'US',
    city: 'San Francisco',
    isp: 'GitHub Inc. / Fastly CDN',
    asn: 'AS54113',
    latitude: 37.7749,
    longitude: -122.4194,
    riskLevel: 'LOW',
    isSuspicious: false,
  },
  '54.239.28.85': {
    country: 'United States',
    countryCode: 'US',
    city: 'Seattle',
    isp: 'Amazon.com, Inc.',
    asn: 'AS16509',
    latitude: 47.6062,
    longitude: -122.3321,
    riskLevel: 'LOW',
    isSuspicious: false,
  },
  '104.16.132.229': {
    country: 'United States',
    countryCode: 'US',
    city: 'San Francisco',
    isp: 'Cloudflare, Inc.',
    asn: 'AS13335',
    latitude: 37.7749,
    longitude: -122.4194,
    riskLevel: 'LOW',
    isSuspicious: false,
  },
  '64.4.250.36': {
    country: 'United States',
    countryCode: 'US',
    city: 'San Jose',
    isp: 'PayPal, Inc.',
    asn: 'AS11643',
    latitude: 37.3382,
    longitude: -121.8863,
    riskLevel: 'LOW',
    isSuspicious: false,
  },
  '208.80.154.224': {
    country: 'United States',
    countryCode: 'US',
    city: 'San Francisco',
    isp: 'Wikimedia Foundation Inc.',
    asn: 'AS14907',
    latitude: 37.7749,
    longitude: -122.4194,
    riskLevel: 'LOW',
    isSuspicious: false,
  },
};

/**
 * Resolves IP intelligence, approximate Geolocation, ASN, and Threat score
 */
export async function lookupIpIntelligence(ip: string): Promise<IpDetails> {
  if (MOCK_IP_DB[ip]) {
    return {
      ip,
      country: MOCK_IP_DB[ip].country || 'Unknown Country',
      countryCode: MOCK_IP_DB[ip].countryCode || 'UN',
      city: MOCK_IP_DB[ip].city || 'Unknown City',
      isp: MOCK_IP_DB[ip].isp || 'Generic Cloud Provider',
      asn: MOCK_IP_DB[ip].asn || 'AS00000',
      latitude: MOCK_IP_DB[ip].latitude || 20.5937,
      longitude: MOCK_IP_DB[ip].longitude || 78.9629,
      riskLevel: MOCK_IP_DB[ip].riskLevel || 'LOW',
      isSuspicious: MOCK_IP_DB[ip].isSuspicious || false,
    };
  }

  // Dynamic heuristic for any unknown IP
  const hash = ip.split('.').reduce((acc, octet) => acc + parseInt(octet || '0', 10), 0);
  const isSuspicious = hash % 2 === 0;

  return {
    ip,
    country: isSuspicious ? 'Seychelles' : 'India',
    countryCode: isSuspicious ? 'SC' : 'IN',
    city: isSuspicious ? 'Victoria' : 'Bengaluru',
    isp: isSuspicious ? 'Offshore VPS Cloud Hosting' : 'National Internet Gateway',
    asn: `AS${30000 + (hash % 15000)}`,
    latitude: isSuspicious ? -4.6796 : 12.9716,
    longitude: isSuspicious ? 55.492 : 77.5946,
    riskLevel: isSuspicious ? 'HIGH' : 'LOW',
    isSuspicious,
  };
}

/**
 * Simulates DNS A record resolution for a given domain
 */
export async function resolveDomainIp(domain: string, isMalicious?: boolean): Promise<IpDetails> {
  const clean = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split(':')[0];

  // Check known major domains
  if (clean.includes('google') || clean.includes('youtube')) return lookupIpIntelligence('142.250.190.46');
  if (clean.includes('microsoft') || clean.includes('office') || clean.includes('live.com')) return lookupIpIntelligence('20.112.52.29');
  if (clean.includes('apple') || clean.includes('icloud')) return lookupIpIntelligence('17.253.144.10');
  if (clean.includes('github')) return lookupIpIntelligence('140.82.121.4');
  if (clean.includes('amazon') || clean.includes('aws')) return lookupIpIntelligence('54.239.28.85');
  if (clean.includes('wikipedia')) return lookupIpIntelligence('208.80.154.224');
  if (clean.includes('cloudflare')) return lookupIpIntelligence('104.16.132.229');
  if (clean === 'paypal.com') return lookupIpIntelligence('64.4.250.36');

  // If it's a raw IP
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(clean)) {
    return lookupIpIntelligence(clean);
  }

  // If malicious phishing domain, point to offshore bulletproof host
  if (isMalicious) {
    return lookupIpIntelligence('185.220.101.5');
  }

  // Otherwise, deterministically resolve to a safe anycast CDN node
  return lookupIpIntelligence('104.16.132.229');
}

/**
 * Builds email transmission path hops from extracted IPs
 */
export async function buildTransmissionPath(ips: string[]): Promise<TransmissionHop[]> {
  const hops: TransmissionHop[] = [];
  const uniqueIps = Array.from(new Set(ips));

  // Ensure at least 2 hops (Origin -> Gateway)
  if (uniqueIps.length === 1) {
    uniqueIps.push('103.45.12.9'); // Recipient Mail Gateway
  }

  for (let i = 0; i < uniqueIps.length; i++) {
    const ip = uniqueIps[i];
    const details = await lookupIpIntelligence(ip);
    hops.push({
      hopNumber: i + 1,
      ip: details.ip,
      hostname: `relay-node-${i + 1}.host-net.example`,
      by: i < uniqueIps.length - 1 ? `mta-relay-${i + 2}.transit.example` : 'recipient-mx-server',
      delay: `${i * 35}s`,
      country: details.country,
      countryCode: details.countryCode,
      city: details.city,
      isp: details.isp,
      asn: details.asn,
      latitude: details.latitude,
      longitude: details.longitude,
      riskLevel: details.riskLevel,
      isSenderOrigin: i === 0,
      isSuspicious: details.isSuspicious,
    });
  }

  return hops;
}

/**
 * Builds web request routing hops for a direct URL scan
 */
export async function buildTransmissionPathForDomain(
  domain: string,
  isMalicious: boolean,
  resolvedIp?: IpDetails
): Promise<TransmissionHop[]> {
  const targetIpDetails = resolvedIp || (await resolveDomainIp(domain, isMalicious));
  const hops: TransmissionHop[] = [];

  // Hop 1: Local SOC Client / Security Gateway
  hops.push({
    hopNumber: 1,
    ip: '103.21.244.18',
    hostname: 'soc-edge-resolver.threatmailer.internal',
    by: 'dns-resolver-recursive',
    delay: '4ms',
    country: 'India',
    countryCode: 'IN',
    city: 'Mumbai',
    isp: 'National Gateway Exchange Network',
    asn: 'AS55836',
    latitude: 19.076,
    longitude: 72.8777,
    riskLevel: 'LOW',
    isSenderOrigin: false,
    isSuspicious: false,
  });

  // Hop 2: Transit Relay / Anonymizer or Anycast CDN
  if (isMalicious) {
    hops.push({
      hopNumber: 2,
      ip: '194.26.29.12',
      hostname: 'anonym-relay-node4.transit-net.example',
      by: 'fast-flux-director',
      delay: '48ms',
      country: 'Germany',
      countryCode: 'DE',
      city: 'Frankfurt am Main',
      isp: 'Continental Transit Peering GmbH',
      asn: 'AS20035',
      latitude: 50.1109,
      longitude: 8.6821,
      riskLevel: 'MEDIUM',
      isSenderOrigin: false,
      isSuspicious: true,
    });
  } else {
    hops.push({
      hopNumber: 2,
      ip: '104.16.132.229',
      hostname: 'edge-anycast-node.cloudflare.net',
      by: 'tls-terminator',
      delay: '18ms',
      country: 'United States',
      countryCode: 'US',
      city: 'San Francisco',
      isp: 'Cloudflare, Inc.',
      asn: 'AS13335',
      latitude: 37.7749,
      longitude: -122.4194,
      riskLevel: 'LOW',
      isSenderOrigin: false,
      isSuspicious: false,
    });
  }

  // Hop 3: Destination Host Server
  hops.push({
    hopNumber: isMalicious ? 3 : 3,
    ip: targetIpDetails.ip,
    hostname: `origin-host.${domain}`,
    by: 'http-application-server',
    delay: isMalicious ? '142ms' : '24ms',
    country: targetIpDetails.country,
    countryCode: targetIpDetails.countryCode,
    city: targetIpDetails.city,
    isp: targetIpDetails.isp,
    asn: targetIpDetails.asn,
    latitude: targetIpDetails.latitude,
    longitude: targetIpDetails.longitude,
    riskLevel: targetIpDetails.riskLevel,
    isSenderOrigin: true,
    isSuspicious: targetIpDetails.isSuspicious,
  });

  return hops;
}
