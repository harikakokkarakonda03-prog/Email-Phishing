import { IndicatorOfCompromise, InvestigationData } from '../types/forensic';

export function downloadFile(filename: string, content: string, contentType: string = 'application/json') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportIocsAsJson(iocs: IndicatorOfCompromise[], investigationId: string) {
  const payload = {
    investigationId,
    exportedAt: new Date().toISOString(),
    iocCount: iocs.length,
    indicators: iocs,
  };
  downloadFile(`${investigationId}_IOCs.json`, JSON.stringify(payload, null, 2), 'application/json');
}

export function exportIocsAsCsv(iocs: IndicatorOfCompromise[], investigationId: string) {
  const header = 'Type,Indicator,Risk Level,Reason\n';
  const rows = iocs
    .map(
      (ioc) =>
        `"${ioc.type}","${ioc.indicator.replace(/"/g, '""')}","${ioc.risk}","${ioc.reason.replace(/"/g, '""')}"`
    )
    .join('\n');
  downloadFile(`${investigationId}_IOCs.csv`, header + rows, 'text/csv');
}

/**
 * Export IOCs conforming to OASIS STIX 2.1 standard format for Cyber Threat Intelligence (CTI)
 */
export function exportIocsAsStix(iocs: IndicatorOfCompromise[], investigation: InvestigationData) {
  const now = new Date().toISOString();
  const bundleId = `bundle--${crypto.randomUUID()}`;
  const reportId = `report--${crypto.randomUUID()}`;

  const stixObjects: any[] = [
    {
      type: 'report',
      spec_version: '2.1',
      id: reportId,
      created: now,
      modified: now,
      name: `Email Threat Forensic Report: ${investigation.id}`,
      description: investigation.summary,
      report_types: ['threat-actor', 'indicator'],
      published: now,
    },
  ];

  iocs.forEach((ioc) => {
    const indicatorId = `indicator--${crypto.randomUUID()}`;
    let pattern = '';
    if (ioc.type === 'IP') {
      pattern = `[ipv4-addr:value = '${ioc.indicator}']`;
    } else if (ioc.type === 'Domain') {
      pattern = `[domain-name:value = '${ioc.indicator}']`;
    } else if (ioc.type === 'URL') {
      pattern = `[url:value = '${ioc.indicator}']`;
    } else if (ioc.type === 'Email') {
      pattern = `[email-addr:value = '${ioc.indicator}']`;
    } else {
      pattern = `[file:hashes.'SHA-256' = '${ioc.indicator}']`;
    }

    stixObjects.push({
      type: 'indicator',
      spec_version: '2.1',
      id: indicatorId,
      created: now,
      modified: now,
      name: `${ioc.type} IOC: ${ioc.indicator}`,
      description: ioc.reason,
      pattern: pattern,
      pattern_type: 'stix',
      valid_from: now,
      confidence: ioc.risk === 'CRITICAL' ? 95 : ioc.risk === 'HIGH' ? 80 : 50,
    });
  });

  const bundle = {
    type: 'bundle',
    id: bundleId,
    objects: stixObjects,
  };

  downloadFile(`${investigation.id}_STIX2.1.json`, JSON.stringify(bundle, null, 2), 'application/json');
}
