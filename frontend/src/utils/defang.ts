/**
 * Safe defanging of URLs and IP addresses for cybersecurity SOC display
 */
export function defangUrl(url: string): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\//i, (match) => (match.toLowerCase() === 'https://' ? 'hxxps://' : 'hxxp://'))
    .replace(/\./g, '[.]');
}

export function defangIp(ip: string): string {
  if (!ip) return '';
  return ip.replace(/\./g, '[.]');
}

export function refang(str: string): string {
  if (!str) return '';
  return str
    .replace(/^hxxps:\/\//i, 'https://')
    .replace(/^hxxp:\/\//i, 'http://')
    .replace(/\[\.\]/g, '.');
}
