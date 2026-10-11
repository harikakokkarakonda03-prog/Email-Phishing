import React, { useState } from 'react';
import {
  Share2,
  Mail,
  User,
  Globe,
  Network,
  Link,
  Server,
  MapPin,
} from 'lucide-react';
import { InvestigationData, GraphNode } from '../../types/forensic';

interface ThreatGraphProps {
  investigation: InvestigationData;
}

export const ThreatGraph: React.FC<ThreatGraphProps> = ({ investigation }) => {
  const originHop = investigation.transmissionPath.find((h) => h.isSenderOrigin) || investigation.transmissionPath[0];
  const primaryDomain = investigation.domainIntelligence[0]?.domain || 'Unknown domain';
  const primaryUrl = investigation.urls[0]?.url || 'No link found';
  const originIp = originHop?.ip || 'Unknown IP';
  const locationName = originHop ? `${originHop.city}, ${originHop.country}` : 'Unknown location';
  const mailServer = originHop?.hostname || 'Unknown mail server';
  // Graph Nodes
  const nodes: GraphNode[] = [
    {
      id: 'node-email',
      label: 'Suspicious Email',
      type: 'email',
      risk: investigation.threatScore >= 60 ? 'danger' : 'safe',
      details: `Subject: "${investigation.subject}" • Score: ${investigation.threatScore}/100`,
    },
    {
      id: 'node-sender',
      label: investigation.emailHeaders.fromDisplayName || 'Claimed Sender',
      type: 'sender',
      risk: investigation.threatScore >= 60 ? 'danger' : 'safe',
      details: investigation.emailHeaders.fromEmail,
    },
    {
      id: 'node-domain',
      label: primaryDomain,
      type: 'domain',
      risk: investigation.domainIntelligence[0]?.reputation === 'MALICIOUS' ? 'danger' : 'warning',
            details: `WHOIS Age: ${(investigation.domainIntelligence[0]?.ageDays ?? -1) >= 0 ? investigation.domainIntelligence[0].ageDays + ' days' : 'unknown'} • Registrar: ${investigation.domainIntelligence[0]?.registrar || 'Unknown'}`,
    },
    {
      id: 'node-ip',
      label: originIp,
      type: 'ip',
      risk: originHop?.riskLevel === 'CRITICAL' ? 'danger' : 'warning',
      details: `ASN: ${originHop?.asn || 'AS49210'} • ISP: ${originHop?.isp || 'Cloud Hosting'}`,
    },
    {
      id: 'node-url',
      label: primaryUrl.length > 25 ? `${primaryUrl.slice(0, 25)}...` : primaryUrl,
      type: 'url',
      risk: investigation.urls[0]?.risk === 'CRITICAL' ? 'danger' : 'warning',
      details: investigation.urls[0]?.reason || 'Embedded credential harvesting link',
    },
    {
      id: 'node-server',
      label: mailServer,
      type: 'server',
      risk: 'warning',
      details: `Relay MTA: ${mailServer} (Hop #1)`,
    },
    {
      id: 'node-location',
      label: locationName,
      type: 'location',
      risk: 'safe',
      details: `Approximate routing coordinates: [${originHop?.latitude || 1.35}, ${originHop?.longitude || 103.81}]`,
    },
  ];

  const [selectedNode, setSelectedNode] = useState<GraphNode>(nodes[0]);

  const nodePositions: Record<string, { x: number; y: number }> = {
    'node-email': { x: 80, y: 170 },
    'node-sender': { x: 230, y: 90 },
    'node-url': { x: 230, y: 250 },
    'node-domain': { x: 380, y: 90 },
    'node-ip': { x: 500, y: 170 },
    'node-location': { x: 650, y: 90 },
    'node-server': { x: 650, y: 250 },
  };

  const edges = [
    { from: 'node-email', to: 'node-sender', label: 'claimed_from' },
    { from: 'node-email', to: 'node-url', label: 'contains_link' },
    { from: 'node-sender', to: 'node-domain', label: 'operates_on' },
    { from: 'node-domain', to: 'node-ip', label: 'resolves_to' },
    { from: 'node-ip', to: 'node-location', label: 'routed_in' },
    { from: 'node-ip', to: 'node-server', label: 'hosted_by' },
  ];

  const getNodeIcon = (type: GraphNode['type']) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sender':
        return <User className="w-4 h-4" />;
      case 'domain':
        return <Globe className="w-4 h-4" />;
      case 'ip':
        return <Network className="w-4 h-4" />;
      case 'url':
        return <Link className="w-4 h-4" />;
      case 'server':
        return <Server className="w-4 h-4" />;
      case 'location':
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Threat Intelligence Relationship Graph</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Interactive entity relationship topology connecting attacker infrastructure to targeted victims
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-800 dark:text-cyan-400 font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          Click Nodes to Inspect
        </span>
      </div>

      {/* Visual Canvas Diagram */}
      <div className="relative w-full overflow-x-auto rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 min-w-[700px] shadow-inner">
        <svg className="w-full h-80" viewBox="0 0 760 340">
          {/* Edges / Connector Lines */}
          {edges.map((edge, idx) => {
            const start = nodePositions[edge.from];
            const end = nodePositions[edge.to];
            if (!start || !end) return null;

            return (
              <g key={idx}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="#94a3b8"
                  className="dark:stroke-slate-700"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <circle
                  cx={(start.x + end.x) / 2}
                  cy={(start.y + end.y) / 2}
                  r={3.5}
                  fill="#0891b2"
                  className="animate-pulse"
                />
              </g>
            );
          })}

          {/* Node Render Loop */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isSelected = selectedNode.id === node.id;
            let strokeColor = '#059669';
            let fillColor = '#ecfdf5';
            if (node.risk === 'danger') {
              strokeColor = '#dc2626';
              fillColor = '#fef2f2';
            } else if (node.risk === 'warning') {
              strokeColor = '#d97706';
              fillColor = '#fffbeb';
            }

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                {/* Glowing Outer Ring if Selected */}
                {isSelected && (
                  <circle
                    r={34}
                    fill="none"
                    stroke="#0891b2"
                    strokeWidth={2.5}
                    className="animate-pulse"
                  />
                )}

                {/* Base Node Circle */}
                <circle
                  r={26}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="transition-all duration-300 group-hover:scale-110 shadow-sm"
                />

                {/* Node Label Text */}
                <text
                  y={40}
                  textAnchor="middle"
                  fill="#0f172a"
                  className="dark:fill-slate-100"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.label.length > 18 ? `${node.label.slice(0, 16)}...` : node.label}
                </text>

                <text
                  y={52}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  style={{ textTransform: 'uppercase' }}
                >
                  [{node.type}]
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Inspector Detail Card */}
        {selectedNode && (
          <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-cyan-400 dark:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-md">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-lg border ${
                  selectedNode.risk === 'danger'
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/80 dark:border-red-500/60 dark:text-red-400'
                    : selectedNode.risk === 'warning'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:border-amber-500/60 dark:text-amber-400'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-500/60 dark:text-emerald-400'
                }`}
              >
                {getNodeIcon(selectedNode.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedNode.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 uppercase font-semibold">
                    Entity: {selectedNode.type}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-1 font-sans text-xs">{selectedNode.details}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Threat Posture:</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  selectedNode.risk === 'danger'
                    ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
                    : selectedNode.risk === 'warning'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                }`}
              >
                {selectedNode.risk === 'danger' ? 'MALICIOUS' : selectedNode.risk === 'warning' ? 'SUSPICIOUS' : 'BENIGN'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
