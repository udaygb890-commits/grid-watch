import React, { useState } from 'react';
import { 
  Layers, ChevronDown, ChevronRight, Clock, History, 
  CheckCircle2, AlertOctagon, AlertTriangle, ArrowUpRight, Wrench 
} from 'lucide-react';
import { initialTransformers, controlUnitsConfig } from '../data/gridData';

export default function CascadingStatusLogs({
  controlUnits = controlUnitsConfig,
  transformers = initialTransformers,
  onSelectTransformer = () => {},
  selectedCluster = 'unit-1',
  isControlRoom = false,
  customLogs = {}
}) {
  const safeControlUnits = Array.isArray(controlUnits) && controlUnits.length > 0
    ? controlUnits
    : controlUnitsConfig;

  const safeTransformers = Array.isArray(transformers) && transformers.length > 0
    ? transformers
    : initialTransformers;

  // Track expanded control units and expanded history logs
  const [expandedUnits, setExpandedUnits] = useState({ 'unit-1': true, 'unit-2': true, 'unit-3': true });
  const [expandedHistory, setExpandedHistory] = useState({ 1: true, 2: true, 3: true, 5: true }); // Expand local cluster units by default

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleHistory = (id) => {
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Strictly filter control units for Control Room Operator: only unit-1 (no external control units)
  const displayUnits = isControlRoom
    ? safeControlUnits.filter(u => u.id === 'unit-1')
    : safeControlUnits;

  // Mocked historical log timelines matching sketch 06 February 2026
  const historicalLogs = {
    1: [
      { time: '18/10/2026, 06:00 IST', event: 'Daily supervisory telemetry sync normal.', type: 'info' },
      { time: '17/10/2026, 14:20 IST', event: 'Routine insulation oil dielectric test: Passed.', type: 'info' }
    ],
    2: [
      { time: '18/10/2026, 06:00 IST', event: 'Auxiliary reserve bay energized and standing by.', type: 'info' }
    ],
    3: [
      { time: '18/10/2026, 09:14:02 IST', event: 'Anomaly 1 occurred: Sudden current spike surge (920A) detected on Phase B.', type: 'critical' },
      { time: '18/10/2026, 09:16:30 IST', event: 'Supervisory alarm routed to Dispatch Commander Marcus Vance.', type: 'info' },
      { time: '18/10/2026, 09:18:00 IST', event: 'Field Engineer Mr. Raghavan deployed with emergency clearance kit.', type: 'deploy' },
      { time: '18/10/2026, 09:22:45 IST', event: 'Remote load reroute recommended: 45 MVA to Auxiliary Feeder Bus B.', type: 'action' },
      { time: '18/10/2026, 09:25:00 IST', event: 'Current status: Inspection & resolution in progress.', type: 'status' }
    ],
    4: [
      { time: '18/10/2026, 08:32:15 IST', event: 'Anomaly 2 occurred: Oil pressure variance & thermal gradient alert.', type: 'warning' },
      { time: '18/10/2026, 08:35:00 IST', event: 'Scheduled on-site inspection for 14:00 with Specialist Amina Al-Mansoor.', type: 'deploy' }
    ],
    5: [
      { time: '17/10/2026, 07:15:20 IST', event: 'Anomaly 1 occurred: Morning commercial load surge caused secondary bus voltage drop to 10.4 kV.', type: 'warning' },
      { time: '17/10/2026, 07:16:05 IST', event: 'Automatic on-load tap changer (OLTC) stepped +2 positions.', type: 'action' },
      { time: '17/10/2026, 07:18:10 IST', event: 'Resolved by: Auto tap change step +2. Voltage normalized to 11.2 kV.', type: 'resolved' }
    ],
    6: [
      { time: '18/10/2026, 07:00 IST', event: 'Hydro generator synchronization lock verified nominal.', type: 'info' }
    ],
    7: [
      { time: '18/10/2026, 06:30 IST', event: 'Apex industrial park feeder baseline voltage nominal at 34.5 kV.', type: 'info' }
    ]
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-blue-600" />
          <h2 className="font-display font-bold text-lg text-slate-900 tracking-tight">
            {isControlRoom ? 'Control Unit 1 · Cascading Status Logs' : 'Cascading Status Logs'}
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
          {isControlRoom ? 'Local Control Unit Scope' : 'Multi-Unit Hierarchy & History'}
        </span>
      </div>

      <p className="text-xs font-mono text-slate-500">
        {isControlRoom 
          ? 'Control Unit 1 → Substation 1 (Cascade North & Kadugodi) → 3 Assigned Transformers (TX-01, TX-02, TX-03)'
          : 'Supervisory Control Units → Substations → Transformers with timestamped incident logs'}
      </p>

      {/* Cascading Tree View */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {displayUnits.map((unit) => {
          const unitTxs = isControlRoom
            ? safeTransformers.filter(t => [1, 2, 3].includes(t.id))
            : safeTransformers.filter(t => unit.transformerIds.includes(t.id));
          const isUnitOpen = expandedUnits[unit.id];
          const isScoped = unit.id === selectedCluster;

          return (
            <div 
              key={unit.id} 
              className={`border rounded-xl overflow-hidden bg-white shadow-2xs transition-all ${
                isScoped ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200'
              }`}
            >
              
              {/* Level 1: Control Unit Header */}
              <div 
                onClick={() => toggleUnit(unit.id)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors border-l-4 ${
                  isScoped 
                    ? 'bg-blue-50/50 hover:bg-blue-50/80 border-blue-600' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isUnitOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                  <span className="font-display font-bold text-sm text-slate-900">
                    {unit.name}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-medium">
                    → {unit.substation}
                  </span>
                  {isScoped && (
                    <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      Active Cluster
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {unitTxs.length} Transformers
                  </span>
                </div>
              </div>

              {/* Level 2: Substations & Transformers List */}
              {isUnitOpen && (
                <div className="divide-y divide-slate-100 bg-white">
                  {unitTxs.map((tx) => {
                    const isTxHistoryOpen = expandedHistory[tx.id];
                    const logs = [
                      ...(customLogs[tx.id] || tx.dynamicLogs || []),
                      ...(historicalLogs[tx.id] || [])
                    ];
                    const isCritical = tx.status === 'CRITICAL' && !tx.anomaly?.resolved;
                    const isResolved = tx.anomaly?.resolved || tx.status === 'RESOLVED';

                    return (
                      <div key={tx.id} className="p-3 pl-8 hover:bg-slate-50/50 transition-colors">
                        
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${
                              isCritical ? 'bg-rose-600 animate-pulse' : tx.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            <span className="font-bold text-xs font-mono text-slate-800">
                              {tx.code}: {tx.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({tx.busVoltage} · {tx.loadCurrent})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* History Toggle Button */}
                            <button
                              onClick={() => toggleHistory(tx.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors flex items-center gap-1 ${
                                isTxHistoryOpen
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <History className="w-3 h-3" />
                              <span>{isTxHistoryOpen ? 'Hide History' : 'View History'}</span>
                            </button>

                            <button
                              onClick={() => onSelectTransformer(tx)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="Inspect Live Graphs"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Level 3: Historical Event Logs Viewer (from sketch 06 Feb) */}
                        {isTxHistoryOpen && (
                          <div className="mt-2.5 ml-4 pl-3 border-l-2 border-blue-200 space-y-1.5 font-mono text-[11px] bg-slate-50/70 p-2.5 rounded-r-lg border border-slate-200/60">
                            <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Event & Incident History:</span>
                            </div>

                            {logs.length > 0 ? (
                              logs.map((log, idx) => (
                                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="text-slate-400 text-[10px] whitespace-nowrap pt-0.5 font-medium">
                                    {log.time}
                                  </span>
                                  <span className="text-slate-400">→</span>
                                  <span className={`text-[11px] ${
                                    log.type === 'critical' ? 'text-rose-700 font-bold' :
                                    log.type === 'warning' ? 'text-amber-800 font-semibold' :
                                    log.type === 'deploy' ? 'text-blue-800 font-bold' :
                                    log.type === 'resolved' ? 'text-emerald-700 font-bold' :
                                    'text-slate-700'
                                  }`}>
                                    {log.event}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-slate-400 text-[10px]">No historical variances logged. Asset operating nominally.</div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
