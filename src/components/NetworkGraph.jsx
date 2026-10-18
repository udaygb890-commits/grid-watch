import React, { useState } from 'react';
import { 
  Activity, Zap, MapPin, Gauge, AlertOctagon, CheckCircle2, 
  AlertTriangle, ArrowUpRight, Radio 
} from 'lucide-react';

import { initialTransformers } from '../data/gridData';

export default function NetworkGraph({
  transformers = initialTransformers,
  onOpenInspectorModal = () => {},
  isClusterOnly = false,
  activeRole = 'admin'
}) {
  const [hoveredTx, setHoveredTx] = useState(null);

  const safeTransformers = Array.isArray(transformers) && transformers.length > 0
    ? transformers
    : initialTransformers;

  const isLocalCluster = isClusterOnly || activeRole === 'control_room';

  // For Control Room Operator: exactly the 3 connected transformers of the localized cluster
  // For Admin: the 7 core assets
  const displayNodes = isLocalCluster
    ? safeTransformers.filter(t => [1, 2, 3].includes(t.id)).map(tx => {
        if (tx.id === 1) return { ...tx, x: 25, y: 34, clusterRole: 'Primary 500kV Incomer' };
        if (tx.id === 2) return { ...tx, x: 75, y: 34, clusterRole: 'Auxiliary Reserve Bay (Bus B)' };
        if (tx.id === 3) return { ...tx, x: 50, y: 72, clusterRole: 'Local Step-Down Unit (Hotspot)' };
        return tx;
      })
    : safeTransformers.filter(t => t.id <= 7);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600" />
            <h2 className="font-display font-bold text-base text-slate-900">
              {isLocalCluster ? 'Substation Cluster Topology Map' : 'Transformer Network Map'}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            {isLocalCluster
              ? 'Local Cluster 01 · 3 interconnected units (Cascade North & Kadugodi)'
              : 'Interactive node graph · Click any node to open live waveforms & telemetry modal'}
          </p>
        </div>

        {/* Right Label */}
        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
          {isLocalCluster ? '3 Connected Units' : '7 Core Assets'}
        </span>
      </div>

      {/* Network Map Graph Canvas */}
      <div className="relative w-full h-[420px] bg-slate-50/90 rounded-xl border border-slate-200 overflow-hidden light-grid-bg select-none">
        
        {/* SVG Power Interconnection Bus Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="netBusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="netAlertGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="netAuxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {isLocalCluster ? (
            /* ========================================================== */
            /* 3-TRANSFORMER CONNECTED CLUSTER TOPOLOGY (Control Room)   */
            /* ========================================================== */
            <>
              {/* Regional Ground Grid Accent */}
              <circle cx="50%" cy="50%" r="160" fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Bus Line 1: TX-01 to TX-02 (230kV Inter-Tie Transmission Bus) */}
              <line x1="25%" y1="34%" x2="75%" y2="34%" stroke="url(#netBusGrad)" strokeWidth="4" />
              
              {/* Bus Line 2: TX-01 to TX-03 (230kV / 11kV Radial Primary Feeder) */}
              <line x1="25%" y1="34%" x2="50%" y2="72%" stroke="url(#netAlertGrad)" strokeWidth="4" />

              {/* Bus Line 3: TX-02 to TX-03 (Auxiliary Standby Reroute Bus B) */}
              <line x1="75%" y1="34%" x2="50%" y2="72%" stroke="url(#netAuxGrad)" strokeWidth="3" strokeDasharray="6 4" />

              {/* Animated Power Flow Particles */}
              <circle cx="50%" cy="34%" r="4" fill="#059669" className="animate-ping" />
              <circle cx="37.5%" cy="53%" r="4.5" fill="#DC2626" className="animate-ping" />

              {/* Bus Annotations */}
              <text x="50%" y="30%" textAnchor="middle" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">
                230 kV Inter-Tie Bus
              </text>
              <text x="31%" y="56%" textAnchor="middle" fill="#DC2626" fontSize="10" fontFamily="monospace" fontWeight="bold" transform="rotate(38, 140, 220)">
                Primary Feeder (920A Surge)
              </text>
              <text x="69%" y="56%" textAnchor="middle" fill="#0284C7" fontSize="10" fontFamily="monospace" fontWeight="bold" transform="rotate(-38, 310, 220)">
                Auxiliary Bus B (45 MVA Reroute)
              </text>
            </>
          ) : (
            /* ========================================================== */
            /* 7-TRANSFORMER GLOBAL GRID MAP (Admin)                      */
            /* ========================================================== */
            <>
              <path d="M 320 -20 Q 370 180 300 300 T 320 450" fill="none" stroke="#E0F2FE" strokeWidth="24" opacity="0.6" />
              <line x1="5%" y1="50%" x2="95%" y2="46%" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
              <line x1="25%" y1="10%" x2="70%" y2="90%" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="28%" y1="20%" x2="48%" y2="18%" stroke="url(#netBusGrad)" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="48%" y1="18%" x2="76%" y2="32%" stroke="url(#netAlertGrad)" strokeWidth="3.5" />
              <line x1="76%" y1="32%" x2="35%" y2="52%" stroke="url(#netAlertGrad)" strokeWidth="3" strokeDasharray="4 4" />
              <line x1="35%" y1="52%" x2="62%" y2="58%" stroke="url(#netBusGrad)" strokeWidth="2.5" />
              <line x1="62%" y1="58%" x2="82%" y2="65%" stroke="url(#netBusGrad)" strokeWidth="2.5" />
              <line x1="62%" y1="58%" x2="50%" y2="84%" stroke="url(#netBusGrad)" strokeWidth="2.5" />
              <line x1="28%" y1="20%" x2="35%" y2="52%" stroke="url(#netBusGrad)" strokeWidth="2" strokeOpacity="0.3" />
            </>
          )}
        </svg>

        {/* Localized Substation Sector Banner */}
        <div className="absolute top-3 left-4 text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase pointer-events-none">
          {isLocalCluster ? 'CLUSTER 01 · 3 CONNECTED UNITS (CASCADE NORTH & KADUGODI)' : 'SUBSTATION 1 - CASCADE NORTH & KADUGODI'}
        </div>

        {/* Nodes matching screenshot */}
        {displayNodes.map((tx) => {
          const isHovered = hoveredTx?.id === tx.id;
          const isCritical = tx.status === 'CRITICAL' && !tx.anomaly?.resolved;
          const isWarning = tx.status === 'WARNING';

          let nodeColor = 'bg-emerald-500 text-white border-white ring-4 ring-emerald-100';
          if (isCritical) {
            nodeColor = 'bg-rose-500 text-white border-white ring-4 ring-rose-200 animate-pulse';
          } else if (isWarning) {
            nodeColor = 'bg-amber-500 text-white border-white ring-4 ring-amber-100';
          }

          return (
            <div
              key={tx.id}
              style={{ left: `${tx.x}%`, top: `${tx.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              onMouseEnter={() => setHoveredTx(tx)}
              onMouseLeave={() => setHoveredTx(null)}
              onClick={() => onOpenInspectorModal(tx)}
            >
              {/* Node Marker */}
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-transform transform group-hover:scale-125 shadow-md ${nodeColor}`}>
                {isCritical ? '!' : isWarning ? '◒' : '✓'}
              </div>

              {/* Node Label */}
              <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white border border-slate-200 px-2 py-0.5 rounded shadow-xs text-[10px] font-mono font-bold text-slate-800 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">
                {tx.code}
              </div>

              {/* Hover Tooltip */}
              {isHovered && (
                <div className="absolute bottom-11 left-1/2 -translate-x-1/2 w-56 bg-white border border-slate-300 rounded-xl p-3 shadow-xl text-xs font-mono z-30 pointer-events-none">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1 flex items-center justify-between">
                    <span>{tx.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      {tx.id === 3 ? 'ID: 21001' : `ID: 2100${tx.id}`}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mb-2 truncate">
                    {tx.substation}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                    <div>Bus V: <strong className="text-slate-900">{tx.busVoltage}</strong></div>
                    <div>Load I: <strong className="text-slate-900">{tx.loadCurrent}</strong></div>
                    <div>Oil: <strong className={tx.oilTemp > 85 ? 'text-rose-600' : 'text-slate-900'}>{tx.oilTemp}°C</strong></div>
                    <div>Load: <strong className={tx.loadPct > 90 ? 'text-rose-600' : 'text-slate-900'}>{tx.loadPct}%</strong></div>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 text-[10px] font-bold text-blue-600 text-center">
                    Click to Open Live Waveforms Modal →
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-4 text-[10px] font-mono text-slate-600 shadow-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-semibold text-slate-800">Critical Anomaly</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-semibold text-slate-800">Variance Warning</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">Healthy</span>
          </span>
        </div>

      </div>

    </div>
  );
}
