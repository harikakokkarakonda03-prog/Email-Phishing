import { InvestigationData } from '../types/forensic';

// Plain-English sentences for the "At a Glance" cards.
// Every sentence is built from the real analysis result, so it never claims something that was not checked.
export function buildPlainSummary(inv: InvestigationData) {
  const reason = (id: string) => inv.explainableReasons.find((r) => r.id === id);

  // 1. Who sent it
  let sender: string;
  const domainIntel = inv.domainIntelligence[0];
  const impersonation =
    reason('reason-display-name') || reason('reason-domain-malicious') || reason('reason-replyto-divergence');
  if (impersonation) {
    sender = impersonation.evidence;
  } else if (domainIntel) {
    sender = `The sender domain (${domainIntel.domain}) shows no signs of impersonation.`;
  } else {
    sender = 'No sender domain was found in this message.';
  }

  // 2. Links
  const total = inv.urls.length;
  const dangerous = inv.urls.filter((u) => u.risk === 'CRITICAL' || u.risk === 'HIGH');
  const weak = inv.urls.filter((u) => u.risk === 'MEDIUM');
  let links: string;
  if (total === 0) links = 'This message contains no web links.';
  else if (dangerous.length > 0) links = `${dangerous.length} of ${total} link(s) look dangerous: ${dangerous[0].reason}`;
  else if (weak.length > 0) links = `${weak.length} of ${total} link(s) use plain HTTP or a URL shortener.`;
  else links = `${total} link(s) checked. No impersonation or high-risk indicators were found.`;

  // 3. Pressure language
  const urgency = reason('reason-social-eng')?.evidence || 'No pressure or threatening language was found.';

  // 4. Email authentication (taken from the real headers)
  const a = inv.authentication;
  const checks: [string, string][] = [
    ['SPF', a.spf.status],
    ['DKIM', a.dkim.status],
    ['DMARC', a.dmarc.status],
  ];
  const failed = checks.filter(([, s]) => s === 'FAIL' || s === 'SOFTFAIL').map(([n]) => n);
  const passed = checks.filter(([, s]) => s === 'PASS').map(([n]) => n);
  let auth: string;
  if (failed.length > 0) auth = `${failed.join(' and ')} check failed, so the sender may have been forged.`;
  else if (passed.length === 0) auth = 'No SPF, DKIM or DMARC results were found in the headers, so the sender could not be verified.';
  else auth = `${passed.join(', ')} verification passed.`;

  return { sender, links, urgency, auth };
}