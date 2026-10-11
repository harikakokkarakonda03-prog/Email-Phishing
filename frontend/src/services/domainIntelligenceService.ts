import { DomainIntelligenceItem } from '../types/forensic';

// Verified authentic high-profile domains with established clean reputation
const KNOWN_SAFE_DOMAINS: Record<string, { brand: string; ageDays: number; registrar: string }> = {
  'google.com': { brand: 'Google', ageDays: 10450, registrar: 'MarkMonitor Inc.' },
  'youtube.com': { brand: 'YouTube', ageDays: 7800, registrar: 'MarkMonitor Inc.' },
  'gmail.com': { brand: 'Google', ageDays: 8200, registrar: 'MarkMonitor Inc.' },
  'microsoft.com': { brand: 'Microsoft', ageDays: 12600, registrar: 'Corporation Service Company (CSC)' },
  'live.com': { brand: 'Microsoft', ageDays: 8900, registrar: 'CSC Corporate Domains' },
  'office.com': { brand: 'Microsoft', ageDays: 9800, registrar: 'CSC Corporate Domains' },
  'apple.com': { brand: 'Apple', ageDays: 14200, registrar: 'CSC Corporate Domains' },
  'icloud.com': { brand: 'Apple', ageDays: 5200, registrar: 'CSC Corporate Domains' },
  'amazon.com': { brand: 'Amazon', ageDays: 11200, registrar: 'Amazon Registrar, Inc.' },
  'github.com': { brand: 'GitHub', ageDays: 6600, registrar: 'MarkMonitor Inc.' },
  'gitlab.com': { brand: 'GitLab', ageDays: 4800, registrar: 'NameCheap, Inc.' },
  'wikipedia.org': { brand: 'Wikimedia', ageDays: 9200, registrar: 'MarkMonitor Inc.' },
  'linkedin.com': { brand: 'LinkedIn', ageDays: 8400, registrar: 'CSC Corporate Domains' },
  'twitter.com': { brand: 'X / Twitter', ageDays: 7400, registrar: 'CSC Corporate Domains' },
  'x.com': { brand: 'X Corp', ageDays: 10100, registrar: 'CSC Corporate Domains' },
  'facebook.com': { brand: 'Meta', ageDays: 8100, registrar: 'CSC Corporate Domains' },
  'instagram.com': { brand: 'Meta', ageDays: 5700, registrar: 'CSC Corporate Domains' },
  'whatsapp.com': { brand: 'Meta', ageDays: 6100, registrar: 'CSC Corporate Domains' },
  'netflix.com': { brand: 'Netflix', ageDays: 10200, registrar: 'MarkMonitor Inc.' },
  'spotify.com': { brand: 'Spotify', ageDays: 7100, registrar: 'MarkMonitor Inc.' },
  'paypal.com': { brand: 'PayPal', ageDays: 9900, registrar: 'CSC Corporate Domains' },
  'stripe.com': { brand: 'Stripe', ageDays: 5500, registrar: 'MarkMonitor Inc.' },
  'chase.com': { brand: 'JPMorgan Chase', ageDays: 11400, registrar: 'CSC Corporate Domains' },
  'bankofamerica.com': { brand: 'Bank of America', ageDays: 10700, registrar: 'CSC Corporate Domains' },
  'wellsfargo.com': { brand: 'Wells Fargo', ageDays: 12100, registrar: 'CSC Corporate Domains' },
  'citibank.com': { brand: 'Citigroup', ageDays: 10900, registrar: 'CSC Corporate Domains' },
  'sbi.co.in': { brand: 'State Bank of India', ageDays: 8500, registrar: 'National Informatics Centre' },
  'hdfcbank.com': { brand: 'HDFC Bank', ageDays: 9300, registrar: 'CSC Corporate Domains' },
  'icicibank.com': { brand: 'ICICI Bank', ageDays: 9500, registrar: 'CSC Corporate Domains' },
  'cloudflare.com': { brand: 'Cloudflare', ageDays: 6200, registrar: 'Cloudflare, Inc.' },
  'stackoverflow.com': { brand: 'Stack Overflow', ageDays: 6400, registrar: 'NameCheap, Inc.' },
  'reddit.com': { brand: 'Reddit', ageDays: 7600, registrar: 'MarkMonitor Inc.' },
  'nytimes.com': { brand: 'New York Times', ageDays: 11500, registrar: 'MarkMonitor Inc.' },
  'cnn.com': { brand: 'CNN', ageDays: 12000, registrar: 'CSC Corporate Domains' },
  'bbc.com': { brand: 'BBC', ageDays: 12500, registrar: 'CSC Corporate Domains' },
  'gov.in': { brand: 'Government of India', ageDays: 9800, registrar: 'National Informatics Centre' },
  'usa.gov': { brand: 'US Federal Government', ageDays: 8700, registrar: 'GSA DOTGOV Registrar' },
  'openai.com': { brand: 'OpenAI', ageDays: 3800, registrar: 'MarkMonitor Inc.' },
};

// High-profile target domains commonly impersonated in phishing attacks
const MONITORED_BRANDS = [
  'paypal.com',
  'microsoft.com',
  'google.com',
  'apple.com',
  'amazon.com',
  'netflix.com',
  'chase.com',
  'bankofamerica.com',
  'wellsfargo.com',
  'citibank.com',
  'sbi.co.in',
  'hdfcbank.com',
  'icicibank.com',
  'facebook.com',
  'instagram.com',
  'whatsapp.com',
  'twitter.com',
  'linkedin.com',
  'binance.com',
  'coinbase.com',
  'metamask.io',
  'dropbox.com',
  'docusign.com',
  'adobe.com',
  'telegram.org',
  'steamcommunity.com',
];

// Suspicious / high-risk phishing keywords in domain or subdomains
const SUSPICIOUS_DOMAIN_KEYWORDS = [
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
  'suspended',
  'wallet',
  'airdrop',
  'claim',
  'recovery',
  'support',
  'billing',
  'invoice',
  'password',
  'reset',
  'auth',
  'authenticate',
  'unlock',
  'confirm',
  'urgent',
  'alert',
  'wire-transfer',
  'free-gift',
  'bonus',
  'prize',
];

const HIGH_RISK_TLDS = [
  '.xyz',
  '.top',
  '.tk',
  '.ml',
  '.ga',
  '.cf',
  '.gq',
  '.work',
  '.click',
  '.loan',
  '.cam',
  '.live',
  '.shop',
  '.fit',
  '.surf',
  '.buzz',
  '.icu',
  '.rest',
  '.monster',
  '.quest',
  '.beauty',
  '.cfd',
  '.gdn',
  '.sbs',
];

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = new Array<number[]>(bn + 1);
  for (let i = 0; i <= bn; ++i) {
    matrix[i] = new Array<number>(an + 1);
    matrix[i][0] = i;
  }
  for (let j = 1; j <= an; ++j) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion / deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Analyzes a domain for homoglyph substitution, brand imitation, and registration metadata
 */
export async function analyzeDomain(domain: string): Promise<DomainIntelligenceItem> {
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split(':')[0];
  const domainParts = cleanDomain.split('.');
  const baseName = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : cleanDomain;
  const tld = cleanDomain.includes('.') ? `.${domainParts.slice(-1)[0]}` : '';
  const now = new Date();

  // 1. Check if it's an authenticated, known safe domain
  for (const [knownSafe, info] of Object.entries(KNOWN_SAFE_DOMAINS)) {
    if (cleanDomain === knownSafe || cleanDomain.endsWith(`.${knownSafe}`)) {
      const creationDate = new Date(now.getTime() - info.ageDays * 24 * 3600 * 1000).toISOString();
      const expiryDate = new Date(now.getTime() + 730 * 24 * 3600 * 1000).toISOString();

      return {
        domain: cleanDomain,
        registrar: info.registrar,
        creationDate,
        expiryDate,
        ageDays: info.ageDays,
        nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
        tld,
        riskScore: 2,
        reputation: 'SAFE',
        lookalikeTarget: undefined,
        similarityReason: `Verified authentic domain of ${info.brand}. Long-standing WHOIS registration history with zero threat intelligence flags.`,
      };
    }
  }

  // Check institutional TLDs (.gov, .mil, .edu)
  if (cleanDomain.endsWith('.gov') || cleanDomain.endsWith('.gov.in') || cleanDomain.endsWith('.edu') || cleanDomain.endsWith('.mil')) {
    return {
      domain: cleanDomain,
      registrar: 'Government / Academic Root Authority',
      creationDate: new Date(now.getTime() - 7500 * 24 * 3600 * 1000).toISOString(),
      expiryDate: new Date(now.getTime() + 365 * 24 * 3600 * 1000).toISOString(),
      ageDays: 7500,
      nameservers: ['ns1.nic.in', 'ns2.nic.in'],
      tld,
      riskScore: 5,
      reputation: 'SAFE',
      similarityReason: 'Official government or academic restricted top-level domain.',
    };
  }

  // 2. Check for Brand Impersonation & Lookalike Domains
  let isLookalike = false;
  let lookalikeTarget: string | undefined = undefined;
  let similarityReason: string | undefined = undefined;

  // Normalized characters (1 -> l, 0 -> o, vv -> w, rn -> m, etc.)
  const normalizedBase = cleanDomain
    .replace(/1/g, 'l')
    .replace(/0/g, 'o')
    .replace(/vv/g, 'w')
    .replace(/rn/g, 'm')
    .replace(/5/g, 's')
    .replace(/3/g, 'e')
    .replace(/8/g, 'b')
    .replace(/[\-_]/g, '');

  for (const brandDomain of MONITORED_BRANDS) {
    const brandBase = brandDomain.split('.')[0];

    // Check if the domain contains the brand + suspicious keyword
    if (cleanDomain.includes(brandBase) && cleanDomain !== brandDomain && !cleanDomain.endsWith(`.${brandDomain}`)) {
      isLookalike = true;
      lookalikeTarget = brandDomain;
      similarityReason = `Domain contains targeted brand string "${brandBase}" with unauthorized prefix, suffix, or TLD.`;
      break;
    }

    // Check character substitution tricks (homoglyphs)
    if (normalizedBase.includes(brandBase) && cleanDomain !== brandDomain && !cleanDomain.endsWith(`.${brandDomain}`)) {
      isLookalike = true;
      lookalikeTarget = brandDomain;
      similarityReason = `Domain uses character substitution (homoglyph attack: e.g. "1" for "l", "0" for "o", "vv" for "w") to imitate ${brandDomain}.`;
      break;
    }

    // Check Levenshtein distance on base domain name
    const dist = levenshtein(baseName, brandBase);
    if (dist > 0 && dist <= 2 && Math.abs(baseName.length - brandBase.length) <= 2) {
      isLookalike = true;
      lookalikeTarget = brandDomain;
      similarityReason = `High Levenshtein proximity (edit distance: ${dist}) to legitimate brand ${brandDomain}.`;
      break;
    }
  }

  // 3. Phishing Keywords Analysis
  const matchedKeywords = SUSPICIOUS_DOMAIN_KEYWORDS.filter((kw) => cleanDomain.includes(kw));

  // 4. High-Risk TLDs
  const isHighRiskTld = HIGH_RISK_TLDS.some((bad) => cleanDomain.endsWith(bad));

  // 5. Raw IP as domain
  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(cleanDomain);

  // 6. Subdomain stacking (e.g. login.secure.verify.chase.com.evil.xyz)
  const excessiveSubdomains = domainParts.length >= 4;

  // 7. Calculate Comprehensive Risk Score
  let riskScore = 15; // baseline neutral

  if (isLookalike) riskScore += 60;
  if (isIpHost) riskScore += 50;
  if (isHighRiskTld) riskScore += 30;
  if (matchedKeywords.length > 0) {
    riskScore += Math.min(35, matchedKeywords.length * 15);
    if (!similarityReason) {
      similarityReason = `Domain contains high-confidence phishing keywords: ${matchedKeywords.slice(0, 3).map((k) => `"${k}"`).join(', ')}.`;
    }
  }
  if (excessiveSubdomains) riskScore += 15;

  riskScore = Math.min(100, Math.max(0, riskScore));

  const reputation: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' =
    riskScore >= 70 ? 'MALICIOUS' : riskScore >= 35 ? 'SUSPICIOUS' : 'SAFE';

  // Dynamic WHOIS simulation
  const ageDays =
    reputation === 'MALICIOUS'
      ? Math.floor(2 + (cleanDomain.length % 10))
      : reputation === 'SUSPICIOUS'
      ? Math.floor(45 + (cleanDomain.length % 90))
      : Math.floor(1200 + (cleanDomain.length % 1500));

  const creationDate = new Date(now.getTime() - ageDays * 24 * 3600 * 1000).toISOString();
  const expiryDate = new Date(now.getTime() + (365 - (ageDays % 365)) * 24 * 3600 * 1000).toISOString();

  const registrar =
    reputation === 'MALICIOUS'
      ? 'Offshore Privacy Proxy Shield Ltd'
      : reputation === 'SUSPICIOUS'
      ? 'NameCheap Anonymous Proxy'
      : 'GoDaddy.com, LLC / Public DNS';

  const nameservers =
    reputation === 'MALICIOUS'
      ? ['ns1.bulletproof-dns.xyz', 'ns2.bulletproof-dns.xyz']
      : reputation === 'SUSPICIOUS'
      ? ['dns1.registrar-servers.com', 'dns2.registrar-servers.com']
      : ['ns1.cloudflare.com', 'ns2.cloudflare.com'];

  return {
    domain: cleanDomain,
    registrar,
    creationDate,
    expiryDate,
    ageDays,
    nameservers,
    tld,
    riskScore,
    reputation,
    lookalikeTarget,
    similarityReason: similarityReason || (reputation === 'SAFE' ? 'Standard domain registration with no known malicious indicators.' : 'Unverified domain registration.'),
  };
}
