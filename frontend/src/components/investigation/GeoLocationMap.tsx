import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Info } from 'lucide-react';
import { TransmissionHop } from '../../types/forensic';

interface GeoLocationMapProps {
  hops: TransmissionHop[];
  theme?: 'light' | 'dark';
}

export const GeoLocationMap: React.FC<GeoLocationMapProps> = ({ hops, theme = 'light' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const validHops = hops.filter((h) => typeof h.latitude === 'number' && typeof h.longitude === 'number');
    const centerLat = validHops.length > 0 ? validHops[0].latitude : 20.5937;
    const centerLng = validHops.length > 0 ? validHops[0].longitude : 78.9629;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 2,
      minZoom: 1,
      maxZoom: 14,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Standard OpenStreetMap engine - completely free, fast, and no watermarks!
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const routeCoords: [number, number][] = [];

    validHops.forEach((hop, idx) => {
      const isOrigin = hop.isSenderOrigin || idx === 0;
      const isCritical = hop.riskLevel === 'CRITICAL' || hop.riskLevel === 'HIGH';
      const markerColor = isOrigin ? '#ef4444' : isCritical ? '#f59e0b' : '#10b981';

      const customIcon = L.divIcon({
        className: 'cyber-map-pin',
        html: `
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background-color: ${markerColor};
              opacity: 0.35;
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: relative;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background-color: ${markerColor};
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px ${markerColor};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-family: monospace;
              font-weight: bold;
            ">${hop.hopNumber}</div>
          </div>
        `,
        iconSize: [28, 28],      // FIXED: Restored original height/width properties
        iconAnchor:[14, 14],    // FIXED: Restored structural anchors
        popupAnchor: [0, -14],
      });

      const popupHtml = `
        <div style="font-family: monospace; font-size: 11px; padding: 4px; min-width: 200px;">
          <div style="font-weight: bold; font-size: 12px; color: ${markerColor}; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px;">
            \${isOrigin ? '🚨 SENDER ORIGIN IP' : \`HOP #\${hop.hopNumber}: RELAY NODE\`}
          </div>
          <div><strong style="color: #64748b;">IP:</strong> <span style="color: #0284c7; font-weight: bold;">\${hop.ip}</span></div>
          <div><strong style="color: #64748b;">Location:</strong> \${hop.city}, \${hop.country}</div>
          <div><strong style="color: #64748b;">ISP:</strong> \${hop.isp}</div>
          <div><strong style="color: #64748b;">ASN:</strong> \${hop.asn}</div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #cbd5e1;">
            <strong style="color: #64748b;">Risk Level:</strong> 
            <span style="color: \${markerColor}; font-weight: bold;">\${hop.riskLevel}</span>
          </div>
        </div>
      `;

      const marker = L.marker([hop.latitude, hop.longitude], { icon: customIcon }).addTo(map);
      marker.bindPopup(popupHtml);

      if (isOrigin) {
        marker.openPopup();
      }

      routeCoords.push([hop.latitude, hop.longitude]);
    });

    if (routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#0891b2',
        weight: 3,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

     map.fitBounds(polyline.getBounds(), { padding: [40, 40], maxZoom: 6 });
 // FIXED: Restored padding arrays
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hops, theme]);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:bg-emerald-500/40 text-emerald-700 dark:text-emerald-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Geographical Relay & Infrastructure Map</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Global transmission vector tracing suspicious sender relays to destination mail exchange
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
          OpenStreetMap & CartoDB Geolocation
        </span>
      </div>

      <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-[10px] font-mono backdrop-blur-sm space-y-1.5 shadow-md">
          <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[9px]">Map Legend</div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
            <span>Sender Origin Relay</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
            <span>Authorized MTA Transit</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-cyan-600 dark:border-cyan-400" />
            <span>Transmission Vector</span>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900 dark:text-slate-200 font-bold">Regulatory Geolocation Notice:</strong> IP geolocation represents
          approximate network routing location of the mail relay server and must not be interpreted as the physical location of an individual or device.
        </p>
      </div>
    </div>
  );
};
