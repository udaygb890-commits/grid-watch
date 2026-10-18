import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Activity, Zap, Gauge, Thermometer, Clock, 
  History, AlertOctagon, CheckCircle2, AlertTriangle, ShieldCheck, 
  Wrench, Check, RefreshCw, Cpu, Layers, Radio, MapPin, Compass,
  ChevronRight, Phone, Send, AlertCircle
} from 'lucide-react';
import { initialTransformers } from '../data/gridData';

export default function SubstationManagerView({
  transformers: inputTransformers = initialTransformers,
  onResolveAnomaly,
  onRerouteLoad,
  onToggleBreaker,
  activeTab = 'substation_selector',
  setActiveTab,
  selectedTxId: externalSelectedTxId,
  setSelectedTxId: setExternalSelectedTxId
}) {
  const transformers = Array.isArray(inputTransformers) && inputTransformers.length > 0
    ? inputTransformers
    : initialTransformers;

  // Mode: 'selector' (Choose transformer list) | 'focused' (Single-transformer telemetry)
  const [viewMode, setViewMode] = useState(activeTab === 'substation_telemetry' ? 'focused' : 'selector');
  
  // Default to Kadugodi T3 (ID 3) or first transformer
  const defaultTx = transformers.find(t => t.id === 3) || transformers[0] || initialTransformers[2];
  const [localSelectedTxId, setLocalSelectedTxId] = useState(defaultTx?.id || 3);
  const activeSelectedId = externalSelectedTxId || localSelectedTxId;

  // Micro-animation ticker for live running waveforms
  const [liveTick, setLiveTick] = useState(0);
  const [actionNotice, setActionNotice] = useState('');
  const [rerouted, setRerouted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick(prev => (prev + 1) % 100);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const currentTx = transformers.find(t => t.id === activeSelectedId) || defaultTx;
  const isCritical = currentTx.status === 'CRITICAL' && !currentTx.anomaly?.resolved;
  const isResolved = currentTx.anomaly?.resolved || currentTx.status === 'RESOLVED';
  const isCurrentTripped = currentTx.breakerStatus === 'OPEN' || currentTx.loadCurrent?.includes('0 A') || currentTx.loadCurrent === '0 A';
  const isVoltageDeEnergized = currentTx.busVoltage?.includes('0.0 kV') || (currentTx.breakerStatus === 'OPEN' && currentTx.status === 'CRITICAL');

  // Dedicated anomaly history logs with exact timestamps and handling details
  const anomalyHistories = {
    3: [
      { time: '18/10/2026, 09:14:02 IST', event: 'Anomaly Occurred: Sudden inductive current spike surge (920A peak) detected on Phase B.', type: 'critical' },
      { time: '18/10/2026, 09:16:30 IST', event: 'Control Room alert dispatched to Marcus Vance & console operators.', type: 'warning' },
      { time: '18/10/2026, 09:18:00 IST', event: 'Field Engineer Mr. Raghavan deployed with emergency clearance kit (Badge #GW-FE-412).', type: 'deploy' },
      { time: '18/10/2026, 09:22:45 IST', event: 'Action taken: Remote load rerouting of 45 MVA transferred to Auxiliary Feeder Bus B.', type: 'action' },
      { time: '18/10/2026, 09:25:00 IST', event: 'Current status: Winding hotspot cooling from 104°C to 78°C. Field verification active.', type: 'resolved' }
    ],
    1: [
      { time: '18/10/2026, 06:00:00 IST', event: 'Daily telemetry health check: Normal. Peak load 380A nominal.', type: 'normal' },
      { time: '17/10/2026, 14:20:00 IST', event: 'Routine insulation dielectric sampling verified within IEEE limits.', type: 'normal' }
    ],
    2: [
      { time: '18/10/2026, 06:00:00 IST', event: 'Auxiliary reserve bus standing by at 69.1 kV nominal. Interlock locked.', type: 'normal' }
    ],
    4: [
      { time: '18/10/2026, 08:32:15 IST', event: 'Anomaly Occurred: Oil pressure variance & thermal gradient alert on Bushing C.', type: 'warning' },
      { time: '18/10/2026, 08:35:00 IST', event: 'Specialist Amina Al-Mansoor scheduled for on-site inspection at 14:00 IST.', type: 'deploy' }
    ],
    5: [
      { time: '17/10/2026, 07:15:20 IST', event: 'Anomaly Occurred: Morning commercial load surge caused secondary bus voltage drop to 10.4 kV.', type: 'warning' },
      { time: '17/10/2026, 07:16:05 IST', event: 'Automatic on-load tap changer (OLTC) stepped +2 positions.', type: 'action' },
      { time: '17/10/2026, 07:18:10 IST', event: 'Handled & Resolved by: Auto tap change step +2. Voltage stabilized at 11.2 kV nominal.', type: 'resolved' }
    ],
    6: [
      { time: '18/10/2026, 07:00:00 IST', event: 'Hydro generator synchronization lock verified nominal at 500.2 kV.', type: 'normal' }
    ],
    7: [
      { time: '18/10/2026, 06:30:00 IST', event: 'Apex industrial park feeder baseline voltage nominal at 34.5 kV.', type: 'normal' }
    ]
  };

  const currentHistory = anomalyHistories[currentTx.id] || [];

  // Direct Transformer List directly reflecting the user's sketch:
  // (1) Transformer 1: ID: 21001, location details
  // (2) Transformer 2
  // (3) Transformer 3
  const directTransformers = [
    {
      id: 3,
      indexNumber: '1',
      sketchTitle: 'Transformer 1: ID: 21001',
      code: 'TX-03',
      name: 'Kadugodi T3 Distribution Transformer',
      substation: 'Kadugodi Substation 1',
      rating: '230kV / 11kV · 100 MVA',
      address: '#29, opp. market, Kadugodi, Chanasandra, Bengaluru - 560067',
      gps: '12°59\'40" N, 77°45\'30" E',
      status: (transformers.find(t => t.id === 3)?.anomaly?.resolved || transformers.find(t => t.id === 3)?.status === 'RESOLVED') ? 'RESOLVED' : 'CRITICAL',
      oilTemp: transformers.find(t => t.id === 3)?.oilTemp || 94.8,
      loadPct: transformers.find(t => t.id === 3)?.loadPct || 98.2,
      busVoltage: transformers.find(t => t.id === 3)?.busVoltage || '228.4 kV',
      loadCurrent: transformers.find(t => t.id === 3)?.loadCurrent || '920 A',
      fieldEngineer: 'Mr. Raghavan (GW-FE-412)',
      fieldPhone: '+91 (555) 019-4120'
    },
    {
      id: 1,
      indexNumber: '2',
      sketchTitle: 'Transformer 2: ID: 21002',
      code: 'TX-01',
      name: 'Cascade Main Step-Down Transformer',
      substation: 'Cascade North Substation 11A',
      rating: '500kV / 230kV · 350 MVA',
      address: '#14 North Transmission Grid, Sector 11',
      gps: '13°08\'12" N, 77°35\'20" E',
      status: 'NORMAL',
      oilTemp: transformers.find(t => t.id === 1)?.oilTemp || 58.2,
      loadPct: transformers.find(t => t.id === 1)?.loadPct || 68.4,
      busVoltage: transformers.find(t => t.id === 1)?.busVoltage || '231.2 kV',
      loadCurrent: transformers.find(t => t.id === 1)?.loadCurrent || '380 A',
      fieldEngineer: 'Devon Reed (GW-FE-414)',
      fieldPhone: '+1 (555) 019-9182'
    },
    {
      id: 2,
      indexNumber: '3',
      sketchTitle: 'Transformer 3: ID: 21003',
      code: 'TX-02',
      name: 'Cascade Reserve Auxiliary Transformer',
      substation: 'Cascade North Substation 11A',
      rating: '230kV / 69kV · 150 MVA',
      address: '#16 North Transmission Grid, Sector 11',
      gps: '13°08\'15" N, 77°35\'24" E',
      status: 'NORMAL',
      oilTemp: transformers.find(t => t.id === 2)?.oilTemp || 51.5,
      loadPct: transformers.find(t => t.id === 2)?.loadPct || 42.1,
      busVoltage: transformers.find(t => t.id === 2)?.busVoltage || '69.1 kV',
      loadCurrent: transformers.find(t => t.id === 2)?.loadCurrent || '110 A',
      fieldEngineer: 'Devon Reed (GW-FE-414)',
      fieldPhone: '+1 (555) 019-9182'
    },
    {
      id: 4,
      indexNumber: '4',
      sketchTitle: 'Transformer 4: ID: 21004',
      code: 'TX-04',
      name: 'Metro Central Urban Incomer Transformer',
      substation: 'Metro Central Terminal Substation',
      rating: '230kV / 69kV · 200 MVA',
      address: 'Station Plaza East, Central Metro Sub-surface Vault 3',
      gps: '12°58\'10" N, 77°36\'40" E',
      status: 'WARNING',
      oilTemp: transformers.find(t => t.id === 4)?.oilTemp || 76.5,
      loadPct: transformers.find(t => t.id === 4)?.loadPct || 84.2,
      busVoltage: transformers.find(t => t.id === 4)?.busVoltage || '68.4 kV',
      loadCurrent: transformers.find(t => t.id === 4)?.loadCurrent || '295 A',
      fieldEngineer: 'Amina Al-Mansoor (GW-FE-415)',
      fieldPhone: '+1 (555) 019-6612'
    },
    {
      id: 5,
      indexNumber: '5',
      sketchTitle: 'Transformer 5: ID: 21005',
      code: 'TX-05',
      name: 'Lakeview Distribution Transformer 5',
      substation: 'Lakeview Distribution Substation',
      rating: '66kV / 11kV · 25 MVA',
      address: '#78 Outer Ring Road, Lakeview Sector',
      gps: '12°55\'18" N, 77°40\'44" E',
      status: 'RESOLVED',
      oilTemp: transformers.find(t => t.id === 5)?.oilTemp || 58.0,
      loadPct: transformers.find(t => t.id === 5)?.loadPct || 68.0,
      busVoltage: transformers.find(t => t.id === 5)?.busVoltage || '11.2 kV',
      loadCurrent: transformers.find(t => t.id === 5)?.loadCurrent || '88 A',
      fieldEngineer: 'Devon Reed (GW-FE-414)',
      fieldPhone: '+1 (555) 019-9182'
    },
    {
      id: 6,
      indexNumber: '6',
      sketchTitle: 'Transformer 6: ID: 21006',
      code: 'TX-06',
      name: 'Crestview Primary Substation Unit',
      substation: 'Crestview Transmission Bay',
      rating: '500kV / 138kV · 400 MVA',
      address: '#52 Crestview Ridge, Sector 9',
      gps: '13°02\'45" N, 77°33\'15" E',
      status: 'NORMAL',
      oilTemp: transformers.find(t => t.id === 6)?.oilTemp || 54.0,
      loadPct: transformers.find(t => t.id === 6)?.loadPct || 58.0,
      busVoltage: transformers.find(t => t.id === 6)?.busVoltage || '138.0 kV',
      loadCurrent: transformers.find(t => t.id === 6)?.loadCurrent || '290 A',
      fieldEngineer: 'Ravi Menon (GW-FE-308)',
      fieldPhone: '+91 (555) 019-3308'
    },
    {
      id: 7,
      indexNumber: '7',
      sketchTitle: 'Transformer 7: ID: 21007',
      code: 'TX-07',
      name: 'Apex Industrial Feeder Transformer',
      substation: 'Apex Industrial Substation',
      rating: '66kV / 33kV · 40 MVA',
      address: '#88 South Industrial Bypass, Tech Zone',
      gps: '12°52\'10" N, 77°42\'55" E',
      status: 'NORMAL',
      oilTemp: transformers.find(t => t.id === 7)?.oilTemp || 49.0,
      loadPct: transformers.find(t => t.id === 7)?.loadPct || 46.0,
      busVoltage: transformers.find(t => t.id === 7)?.busVoltage || '33.2 kV',
      loadCurrent: transformers.find(t => t.id === 7)?.loadCurrent || '160 A',
      fieldEngineer: 'Sarah Chen (GW-SO-209)',
      fieldPhone: '+1 (555) 019-4321'
    }
  ];

  // Instant Telemetry Workspace Switch: Single click directly transitions view to focused telemetry
  const handleSelectAndOpen = (txId) => {
    if (setExternalSelectedTxId) setExternalSelectedTxId(txId);
    setLocalSelectedTxId(txId);
    if (setActiveTab) {
      setActiveTab('substation_telemetry');
    }
    setViewMode('focused');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSelector = () => {
    if (setActiveTab) {
      setActiveTab('substation_selector');
    }
    setViewMode('selector');
  };

  const handleReroute = () => {
    setRerouted(true);
    setActionNotice('Remote load rerouting successful: 45 MVA transferred to Auxiliary Feeder Bus B.');
    if (onRerouteLoad) onRerouteLoad(currentTx.id);
  };

  const handleToggleBreakerAction = () => {
    const nextStatus = currentTx.breakerStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    setActionNotice(`Circuit Breaker toggled to ${nextStatus}.`);
    if (onToggleBreaker) onToggleBreaker(currentTx.id, nextStatus);
  };

  // Find metadata for the currently active transformer
  const activeTxMetadata = directTransformers.find(t => t.id === currentTx.id) || directTransformers[0];

  // Determine whether we are in focused single-unit view or transformer choice list
  const isFocused = activeTab === 'substation_telemetry' || (viewMode === 'focused' && activeTab !== 'substation_selector');

  // =========================================================================
  // VIEW 1: Direct "choose transformer:" Selection List (Matches Sketch Exactly)
  // Replaces multi-step branch cards with a direct, clean selection box
  // =========================================================================
  if (!isFocused) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-2">
        
        {/* Intro Portal Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg shadow-2xs">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  Substation Manager Portal
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  SCOPE: SINGLE INDIVIDUAL TRANSFORMER
                </span>
              </div>
              <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">
                Substation Unit Supervisory Control
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Direct unit telemetry selector · Click any transformer to instantly launch its dedicated live waveforms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-mono text-emerald-800 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Grid Synchronized · Live Telemetry Ready</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THE EXACT NOTEBOOK BOX: "choose transformer:"                            */}
        {/* Directly lists individual units with IDs & location details              */}
        {/* ========================================================================= */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-5">
          
          {/* Header matching notebook sketch */}
          <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
                <span>choose transformer:</span>
                <span className="text-blue-600 text-base">✦</span>
              </h2>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Select an individual transformer unit below to immediately switch to its dedicated telemetry workspace
              </p>
            </div>

            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
              {directTransformers.length} Units Online
            </span>
          </div>

          {/* Direct Transformer Choice List */}
          <div className="space-y-3.5">
            {directTransformers.map((item) => {
              const isCrit = item.status === 'CRITICAL';
              const isWarn = item.status === 'WARNING';
              const isRes = item.status === 'RESOLVED';

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectAndOpen(item.id)}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 cursor-pointer transition-all shadow-xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left Section: Numbering, ID, Name & Location Details */}
                  <div className="flex items-start gap-4">
                    
                    {/* Index circle indicator matching sketch: (1), (2), (3) */}
                    <div className="w-9 h-9 rounded-xl border-2 border-slate-200 group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white bg-slate-50 text-slate-700 flex items-center justify-center font-display font-extrabold text-sm transition-colors flex-shrink-0 mt-0.5">
                      ({item.indexNumber})
                    </div>

                    <div className="space-y-1">
                      {/* Title & ID Badge */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                          {item.sketchTitle}
                        </h3>
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {item.code}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {item.name}
                        </span>
                      </div>

                      {/* Location Details block (prominently displayed per user sketch) */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="font-semibold text-slate-800">{item.address}</span>
                      </div>

                      {/* Substation & Technical Rating */}
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.substation} · {item.rating} · GPS: {item.gps}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Telemetry Snapshot, Status Pill & Direct Action Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-13 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    
                    <div className="text-right font-mono text-xs hidden md:block">
                      <div className="text-slate-600">
                        Oil: <strong className={item.oilTemp > 85 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}>{item.oilTemp}°C</strong>
                      </div>
                      <div className="text-slate-600">
                        Current: <strong className={item.loadPct > 90 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}>{item.loadCurrent}</strong>
                      </div>
                    </div>

                    {isCrit ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-extrabold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 animate-pulse">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>CRITICAL HOTSPOT</span>
                      </span>
                    ) : isWarn ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        WARNING
                      </span>
                    ) : isRes ? (
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        RESOLVED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        HEALTHY
                      </span>
                    )}

                    {/* Instant Transition Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndOpen(item.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white text-xs font-mono font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Quick Tip Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Tip: Clicking any transformer immediately loads live running Current (A) & Voltage (V) waveforms.</span>
            <span className="text-blue-600 font-bold">Direct 1-Click Navigation</span>
          </div>

        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: Dedicated Single-Transformer Control Window (Matches Notebook Sketch)
  // - Top Row: 3 Boxes side-by-side
  //   [1] Current graph  |  [2] Voltage graph  |  [3] Parameter box
  // - Bottom Row: 2 Boxes side-by-side
  //   [4] Anomaly History  |  [5] Controls & Dispatch
  // =========================================================================
  return (
    <div className="space-y-6">
      
      {/* Top Navigation & Single Transformer Metadata Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          <div className="flex items-center gap-3.5">
            {/* Direct Switch Back to Choice List */}
            <button
              onClick={handleBackToSelector}
              className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-mono font-bold border border-slate-300 flex items-center gap-2 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>← Choose transformer</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  Substation Manager Console
                </span>
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  SCOPE: SINGLE INDIVIDUAL TRANSFORMER
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  ID: {activeTxMetadata.sketchTitle.split('ID: ')[1] || `2100${currentTx.id}`} ({currentTx.code})
                </span>
              </div>
              
              <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">
                {activeTxMetadata.sketchTitle} · {currentTx.name}
              </h1>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {currentTx.substation} · Dedicated single-unit telemetry waveforms & historical incident log
              </p>
            </div>
          </div>

          {/* Status Pill */}
          <div className="flex items-center gap-3">
            {isCritical ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>HOTSPOT CRITICAL ANOMALY</span>
              </span>
            ) : isResolved ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>STATUS: RESOLVED / NORMAL</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>STATUS: NORMAL</span>
              </span>
            )}
          </div>

        </div>

        {/* Location & Routing Metadata Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono text-slate-700">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Substation Bay:</span>
            <span className="font-bold text-slate-900 mt-0.5 block">{currentTx.substation}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Location Details:</span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate" title={currentTx.address}>
              {currentTx.address}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">GPS Co-ordinates:</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{currentTx.gps}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Voltage & Capacity:</span>
            <span className="font-bold text-blue-700 mt-0.5 block">{currentTx.voltageRating} · {currentTx.mva}</span>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-mono flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionNotice}</span>
            </span>
            <button onClick={() => setActionNotice('')} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PROMINENT RED ALERT CARD (Structured strictly per specification)          */}
      {/* ========================================================================= */}
      {currentTx.anomaly && !isResolved && (
        <div className={`p-6 rounded-2xl border-2 shadow-sm space-y-4 ${
          currentTx.anomaly.severity === 'CRITICAL'
            ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-500/20'
            : 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20'
        }`}>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-200/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded border border-rose-200">
                  Grid Hunter AI Autonomous Response Alert · {currentTx.anomaly.severity}
                </span>
                <h2 className="text-xl font-bold font-display text-slate-900 mt-0.5">
                  <strong>Anomaly Alert:</strong> {currentTx.anomaly.title} ({currentTx.anomaly.type || 'Electrical Variance'})
                </h2>
              </div>
            </div>

            <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-white text-rose-800 border border-rose-300 shadow-2xs">
              {currentTx.anomaly.detectedAt || 'Today, 09:14 IST'}
            </span>
          </div>

          {/* The 3 Core Structured Action Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-mono text-xs">
            
            {/* Field 1: Reason / Root Cause */}
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs space-y-1.5">
              <div className="text-[10px] text-rose-700 uppercase font-extrabold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Reason / Root Cause:</span>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed">
                {currentTx.anomaly.rootCause || 'Current sudden spike detected above 920A threshold on Phase B (Peak 945A).'}
              </p>
            </div>

            {/* Field 2: Immediate Action Taken by Grid Hunter AI */}
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs space-y-1.5">
              <div className="text-[10px] text-blue-700 uppercase font-extrabold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Immediate Action Taken by Grid Hunter AI:</span>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed">
                {currentTx.anomaly.immediateAction || currentTx.anomaly.recommendedAction || 'Transformer Shutdown / Automated Circuit Breaker Trip executed at 09:14 IST, isolating busbar within 120ms.'}
              </p>
            </div>

            {/* Field 3: Further Actions Taken */}
            <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs space-y-1.5">
              <div className="text-[10px] text-emerald-700 uppercase font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Further Actions Taken:</span>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed">
                {currentTx.anomaly.furtherActions || `Field Engineer ${currentTx.anomaly.fieldEngineer || 'Mr. Raghavan'} automatically dispatched with diagnostic data and transformer site location details.`}
              </p>
            </div>

          </div>

          {/* Execution Footer Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-rose-900 font-semibold border-t border-rose-200/60">
            <span>Automated Protection Execution: Busbar Isolation & Trip Response completed within 120ms.</span>
            <span className="text-slate-600 font-normal">Supervisory Telemetry Verified · Model Confidence: {currentTx.anomaly.confidence || 98.4}%</span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP SECTION: 3 Side-by-Side Boxes Matching the Notebook Sketch             */}
      {/* [Box 1: Current Graph] | [Box 2: Voltage Graph] | [Box 3: Parameter Box]  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* BOX 1: Current (A) Graph (matching sketch "current graph") */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-mono">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <h2 className="font-display font-bold text-base text-slate-900">
                    Current (A)
                  </h2>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block">Peak Load</span>
                  <span className={`text-base font-extrabold ${
                    isCurrentTripped ? 'text-rose-600 animate-pulse' : isCritical ? 'text-rose-600 animate-pulse' : 'text-slate-900'
                  }`}>
                    {currentTx.loadCurrent}
                  </span>
                </div>
              </div>

              {/* Live Waveform Canvas (Reacts to trip shutdown) */}
              <div className="relative h-44 bg-slate-50/80 rounded-xl border border-slate-200 p-3 overflow-hidden light-grid-bg flex items-center justify-center">
                {isCurrentTripped ? (
                  <div className="w-full h-full relative flex flex-col items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 400 100">
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="6 3" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50/60 font-mono text-center p-2 rounded-lg">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>TRIP EXECUTED · CURRENT: 0 A</span>
                      </span>
                      <span className="text-[10px] text-rose-600 font-medium mt-0.5">
                        Automated Circuit Breaker Shutdown in 118ms · Busbar Isolated
                      </span>
                    </div>
                  </div>
                ) : (
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="20" x2="400" y2="20" stroke="#FCA5A5" strokeDasharray="2 2" strokeWidth="1" />
                    <line x1="0" y1="80" x2="400" y2="80" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="1" />

                    <path
                      d={`M 0,50 Q ${35 + (liveTick % 20)},${isCritical ? 10 : 20} 70,50 T 140,50 T 210,50 T 280,50 T 350,50 T 400,50`}
                      fill="none"
                      stroke={isCritical ? '#DC2626' : '#2563EB'}
                      strokeWidth="2.5"
                    />

                    {isCritical && (
                      <circle cx="210" cy="10" r="4.5" fill="#DC2626" className="animate-ping" />
                    )}
                  </svg>
                )}

                <div className="absolute top-2 right-3 text-[9px] font-mono text-slate-500 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
                  {isCurrentTripped ? 'Breaker: OPEN' : 'Phase B · 50.0 Hz Lock'}
                </div>
                <div className="absolute bottom-1.5 left-3 text-[9px] font-mono text-slate-400">
                  {isCurrentTripped ? 'De-energized Baseline' : 'Continuous Telemetry · 1.2 kHz'}
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>{isCurrentTripped ? 'Busbar State: Isolated' : 'Nominal Base: 380 A'}</span>
                <span className={isCurrentTripped ? 'text-rose-600 font-bold' : isCritical ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                  {isCurrentTripped ? '0 A (Breaker Shutdown)' : isCritical ? '+142% Overload Spike' : 'Balanced Load'}
                </span>
              </div>
            </div>

            {/* BOX 2: Voltage (V) Graph (matching sketch "voltage graph") */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-mono">
                  <Gauge className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-display font-bold text-base text-slate-900">
                    Voltage (V)
                  </h2>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block">Bus RMS</span>
                  <span className={`text-base font-extrabold ${isVoltageDeEnergized ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {currentTx.busVoltage}
                  </span>
                </div>
              </div>

              {/* Live Voltage Waveform Canvas */}
              <div className="relative h-44 bg-slate-50/80 rounded-xl border border-slate-200 p-3 overflow-hidden light-grid-bg flex items-center justify-center">
                {isVoltageDeEnergized ? (
                  <div className="w-full h-full relative flex flex-col items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 400 100">
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="6 3" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50/60 font-mono text-center p-2 rounded-lg">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>LINE DE-ENERGIZED · 0.0 kV</span>
                      </span>
                      <span className="text-[10px] text-rose-600 font-medium mt-0.5">
                        Surge Diverter Engaged · Arrester Protection Active
                      </span>
                    </div>
                  </div>
                ) : (
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#CBD5E1" strokeDasharray="3 3" strokeWidth="1" />

                    <path
                      d={`M 0,50 Q ${35 + (liveTick % 10)},${currentTx.busVoltage?.includes('258') ? 5 : 20} 70,50 T 140,50 T 210,50 T 280,50 T 350,50 T 400,50`}
                      fill="none"
                      stroke={currentTx.busVoltage?.includes('258') ? '#DC2626' : '#059669'}
                      strokeWidth="2.5"
                    />

                    {currentTx.busVoltage?.includes('258') && (
                      <circle cx="210" cy="5" r="5" fill="#DC2626" className="animate-ping" />
                    )}
                  </svg>
                )}

                <div className="absolute top-2 right-3 text-[9px] font-mono text-slate-500 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
                  {isVoltageDeEnergized ? 'Line: Isolated' : 'RMS ±0.4% IEEE Standard'}
                </div>
                <div className="absolute bottom-1.5 left-3 text-[9px] font-mono text-slate-400">
                  {isVoltageDeEnergized ? 'Protection Active' : 'THD < 1.2% · Synchronized'}
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>{isVoltageDeEnergized ? 'Line Status: De-energized' : 'Grid Regulation: Locked'}</span>
                <span className={isVoltageDeEnergized ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                  {isVoltageDeEnergized ? '0.0 kV (Surge Diverted)' : '50.00 Hz Lock'}
                </span>
              </div>
            </div>

        {/* BOX 3: Parameter Box (matching the 3rd box on the top row in notebook sketch) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              <h2 className="font-display font-bold text-base text-slate-900">
                Operational Parameters
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Sensor Bus Live
            </span>
          </div>

          {/* Grid of 6 Key Parameters */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            
            {/* 1. Oil Temp */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Oil Temp</span>
              <span className={`text-base font-bold block ${currentTx.oilTemp > 85 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
                {currentTx.oilTemp}°C
              </span>
              <span className="text-[9px] text-slate-400 truncate block">
                {currentTx.oilTemp > 85 ? 'Hotspot Alert' : 'Nominal'}
              </span>
            </div>

            {/* 2. Winding Temp */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Winding Temp</span>
              <span className={`text-base font-bold block ${currentTx.windingTemp > 95 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
                {currentTx.windingTemp}°C
              </span>
              <span className="text-[9px] text-slate-400 truncate block">Core Insulation</span>
            </div>

            {/* 3. Frequency */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Frequency</span>
              <span className="text-base font-bold text-slate-900 block">
                {currentTx.frequency}
              </span>
              <span className="text-[9px] text-emerald-600 font-bold truncate block">Synchronized</span>
            </div>

            {/* 4. Power Factor */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Power Factor</span>
              <span className="text-base font-bold text-slate-900 block">
                {currentTx.powerFactor}
              </span>
              <span className="text-[9px] text-slate-400 truncate block">Cos φ</span>
            </div>

            {/* 5. Load % */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Load Factor</span>
              <span className={`text-base font-bold block ${currentTx.loadPct > 90 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
                {currentTx.loadPct}%
              </span>
              <span className="text-[9px] text-slate-400 truncate block">{currentTx.mva} cap</span>
            </div>

            {/* 6. Breaker Status */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Breaker</span>
              <span className={`text-xs font-bold block ${currentTx.breakerStatus === 'OPEN' ? 'text-amber-600' : 'text-emerald-700'}`}>
                {currentTx.breakerStatus}
              </span>
              <button
                onClick={handleToggleBreakerAction}
                className="text-[9px] text-blue-600 hover:text-blue-800 font-bold underline block"
              >
                Toggle Trip
              </button>
            </div>

          </div>

          {/* DGA Diagnostics Bar */}
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[10px] flex items-center justify-between">
            <span className="text-slate-400 font-bold">DGA Gas:</span>
            <span className={`font-bold truncate max-w-[170px] ${currentTx.dgaStatus?.includes('CRITICAL') ? 'text-rose-700' : 'text-slate-800'}`}>
              {currentTx.dgaStatus}
            </span>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: 2 Boxes Matching the Notebook Sketch                      */}
      {/* [Box 4: Anomaly History] (Left)  |  [Box 5: Actions & Controls] (Right)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT BOTTOM: Dedicated "Anomaly History" Panel (Matches Notebook Sketch) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <h2 className="font-display font-bold text-base text-slate-900">
                Anomaly History:
              </h2>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
              {currentHistory.length} Incident Logs
            </span>
          </div>

          <p className="text-xs font-mono text-slate-500">
            Timestamped incident events, control room triggers, and historical handling logs for this unit
          </p>

          {/* Scrollable Anomaly History Timeline */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {currentHistory.length > 0 ? (
              currentHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs space-y-1.5"
                >
                  <div className="text-[10px] text-slate-400 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.time}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] ${
                      item.type === 'critical' ? 'bg-rose-100 text-rose-800' :
                      item.type === 'warning' ? 'bg-amber-100 text-amber-800' :
                      item.type === 'deploy' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'action' ? 'bg-indigo-100 text-indigo-800' :
                      item.type === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {item.type}
                    </span>
                  </div>

                  <p className={`leading-relaxed text-xs ${
                    item.type === 'critical' ? 'text-rose-700 font-bold' :
                    item.type === 'warning' ? 'text-amber-800 font-semibold' :
                    item.type === 'deploy' ? 'text-blue-800 font-bold' :
                    item.type === 'action' ? 'text-indigo-800 font-semibold' :
                    item.type === 'resolved' ? 'text-emerald-700 font-bold' :
                    'text-slate-700'
                  }`}>
                    {item.event}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl text-xs font-mono text-slate-400">
                No historical incidents on file. Unit operating within standard tolerances.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT BOTTOM: Substation Supervisory Controls & Dispatch Actions */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <h2 className="font-display font-bold text-base text-slate-900">
                Supervisory Actions
              </h2>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg border border-blue-200">
              Interlock Ready
            </span>
          </div>

          <p className="text-xs font-mono text-slate-500">
            Direct operational interventions, load rerouting & emergency field team coordination
          </p>

          {/* Quick Actions */}
          <div className="space-y-3 font-mono text-xs">
            <button
              onClick={handleReroute}
              className="w-full py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Reroute Load (45 MVA to Feeder Bus B)</span>
            </button>

            <button
              onClick={() => onResolveAnomaly && onResolveAnomaly(currentTx.id)}
              className={`w-full py-3 px-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs ${
                isResolved
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isResolved ? 'Reopen Incident' : '✓ Mark Anomaly Resolved'}</span>
            </button>

            <button
              onClick={handleToggleBreakerAction}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Breaker Status: {currentTx.breakerStatus} (Click to toggle)</span>
            </button>
          </div>

          {/* Assigned Field Engineer Snapshot */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Assigned Field Team:
            </span>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">{activeTxMetadata.fieldEngineer}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{activeTxMetadata.fieldPhone}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                On-Site
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
