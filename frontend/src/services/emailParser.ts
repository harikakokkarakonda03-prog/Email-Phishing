import { EmailHeaderInfo } from '../types/forensic';

export interface ParsedEmailRaw {
  headers: EmailHeaderInfo;
  body: string;
  extractedUrls: string[];
  extractedIps: string[];
}

/**
 * Extracts display name and email address from RFC 5322 From/To fields
 * e.g. "PayPal Security" <security@paypa1-security.example> -> { name: "PayPal Security", email: "security@paypa1-security.example" }
 */
export function parseAddressField(field: string): { name: string; email: string } {
  if (!field) return { name: '', email: '' };

  const angleMatch = field.match(/^(.*?)(?:<(.+?)>)/);
  if (angleMatch) {
    const name = angleMatch[1].trim().replace(/^["']|["']$/g, '');
    const email = angleMatch[2].trim();
    return { name: name || email, email };
  }

  const directEmail = field.trim().replace(/^["']|["']$/g, '');
  return { name: directEmail, email: directEmail };
}

/**
 * Parses raw .eml text or pasted email into structured header and body components
 */
export function parseRawEmail(rawContent: string): ParsedEmailRaw {
  // Normalize line breaks
  const normalized = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Headers and body are separated by two consecutive newlines
  const separatorIndex = normalized.search(/\n\n/);
  let rawHeaderSection = '';
  let bodySection = '';

  if (separatorIndex !== -1) {
    rawHeaderSection = normalized.slice(0, separatorIndex);
    bodySection = normalized.slice(separatorIndex + 2);
  } else {
    // If no double newline, treat whole text as headers if it contains typical header prefixes, else body
    if (/^(From|To|Subject|Date|Received):/im.test(normalized)) {
      rawHeaderSection = normalized;
      bodySection = '';
    } else {
      rawHeaderSection = '';
      bodySection = normalized;
    }
  }

  // Unfold multi-line headers (RFC 5322 folding whitespace)
  const unfoldedHeaders = rawHeaderSection.replace(/\n([ \t]+)/g, ' ');
  const headerLines = unfoldedHeaders.split('\n');

  const headerMap: Record<string, string> = {};
  const receivedHeaders: string[] = [];

  for (const line of headerLines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();

      if (key === 'received') {
        receivedHeaders.push(value);
      } else if (!headerMap[key]) {
        headerMap[key] = value;
      }
    }
  }

  const rawFrom = headerMap['from'] || 'Unknown Sender';
  const { name: fromDisplayName, email: fromEmail } = parseAddressField(rawFrom);
  const to = headerMap['to'] || 'Undisclosed Recipients';
  const subject = headerMap['subject'] || '(No Subject)';
  const date = headerMap['date'] || new Date().toUTCString();
  const messageId = headerMap['message-id'] || `<generated-${Date.now()}@cyber-soc.local>`;
  const replyTo = headerMap['reply-to'];
  const returnPath = headerMap['return-path'];
  const mimeVersion = headerMap['mime-version'];
  const contentType = headerMap['content-type'];
  const userAgent = headerMap['user-agent'] || headerMap['x-mailer'];

  // Extract X-Originating-IP or IP from first Received header
  let xOriginatingIp = headerMap['x-originating-ip'] || headerMap['x-sender-ip'];
  if (xOriginatingIp) {
    xOriginatingIp = xOriginatingIp.replace(/[\[\]]/g, '').trim();
  }

  // Extract URLs from body & headers
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
  const allText = `${rawContent} ${bodySection}`;
  const rawUrls = Array.from(new Set(allText.match(urlRegex) || []));

  // Extract IPv4 addresses
  const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const allIps = Array.from(new Set(allText.match(ipv4Regex) || []));

  // Filter out private / loopback IPs from originating candidate if possible
  const publicIps = allIps.filter(
    (ip) => !ip.startsWith('127.') && !ip.startsWith('10.') && !ip.startsWith('192.168.')
  );

  if (!xOriginatingIp && publicIps.length > 0) {
    xOriginatingIp = publicIps[0];
  } else if (!xOriginatingIp) {
    xOriginatingIp = '185.220.101.5'; // fallback to standard demo IP if none present
  }

  const headers: EmailHeaderInfo = {
    from: rawFrom,
    fromDisplayName,
    fromEmail,
    to,
    replyTo,
    returnPath,
    messageId,
    date,
    subject,
    mimeVersion,
    contentType,
    userAgent,
    xOriginatingIp,
    rawHeaders: rawHeaderSection || 'From: ' + rawFrom + '\nSubject: ' + subject,
  };

  return {
    headers,
    body: bodySection || rawContent,
    extractedUrls: rawUrls,
    extractedIps: publicIps.length > 0 ? publicIps : [xOriginatingIp],
  };
}
