import React, { useState, useEffect } from 'react';
import { 
  X, ArrowLeft, Activity, Gauge, Thermometer, 
  Zap, Radio, MapPin, Compass, Building2, CheckCircle2, 
  AlertOctagon, History, Clock, Wrench, ShieldCheck
} from 'lucide-react';

export default function TransformerInspectorModal({
  transformer,
  isOpen,
  onClose
}) {
  const [liveTick, setLiveTick] = useState(0);

  // Micro-animation for live running telemetry waveform
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLiveTick(prev => (prev + 1) % 100);
    }, 150);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !transformer) return null;

  const isCritical = transformer.status === 'CRITICAL' && !transformer.anomaly?.resolved;
  const isResolved = transformer.anomaly?.resolved || transformer.status === 'RESOLVED';

  // Dedicated anomaly history logs with exact timestamps and resolution details (matching sketch page 05 & 06)
  const anomalyHistories = {
    1: [
      { time: '18/10/2026, 06:00:00 IST', event: 'Daily telemetry health check: Normal. Peak load 380A nominal.', type: 'normal' },
      { time: '17/10/2026, 14:20:00 IST', event: 'Routine insulation dielectric sampling verified within IEEE limits.', type: 'normal' }
    ],
    2: [
      { time: '18/10/2026, 06:00:00 IST', event: 'Auxiliary reserve bus standing by at 69.1 kV.', type: 'normal' }
    ],
    3: [
      { time: '18/10/2026, 09:14:02 IST', event: 'Anomaly Occurred: Sudden inductive current spike surge (920A peak) detected on Phase B.', type: 'critical' },
      { time: '18/10/2026, 09:16:30 IST', event: 'Control Room alert dispatched to Marcus Vance & console operators.', type: 'warning' },
      { time: '18/10/2026, 09:18:00 IST', event: 'Field Engineer Mr. Raghavan deployed with emergency clearance kit (Badge #GW-FE-412).', type: 'deploy' },
      { time: '18/10/2026, 09:22:45 IST', event: 'Action taken: Remote load rerouting of 45 MVA transferred to Auxiliary Feeder Bus B.', type: 'action' },
      { time: '18/10/2026, 09:25:00 IST', event: 'Current status: Winding hotspot cooling from 104°C to 78°C. Field verification active.', type: 'resolved' }
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

  const currentHistory = anomalyHistories[transformer.id] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-slate-300 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  Transformer Inspector · Live Telemetry
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  ID: {transformer.id === 3 ? '21001' : `2100${transformer.id}`} ({transformer.code})
                </span>
              </div>
              <h2 className="text-lg font-bold font-display text-slate-900 mt-0.5">
                {transformer.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCritical ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>CRITICAL ANOMALY</span>
              </span>
            ) : isResolved ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>RESOLVED / NORMAL</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>NORMAL</span>
              </span>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Top 2 Primary Waveforms: Current (A) and Voltage (V) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Graph 1: Current (A) Waveform */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Current (A) Waveform</span>
                </span>
                <span className="text-slate-500 font-bold">
                  Peak: <strong className={isCritical ? 'text-rose-600' : 'text-slate-900'}>{transformer.loadCurrent}</strong>
                </span>
              </div>

              <div className="relative h-28 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70">
                  <path
                    d={`M 0,35 Q ${35 + (liveTick % 20)},${isCritical ? 5 : 15} 75,35 T 150,35 T 225,35 T 300,35`}
                    fill="none"
                    stroke={isCritical ? '#DC2626' : '#2563EB'}
                    strokeWidth="2.5"
                  />
                  {isCritical && (
                    <circle cx="75" cy="5" r="4" fill="#DC2626" className="animate-ping" />
                  )}
                </svg>
                <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400">
                  Phase B Surge · 50.0 Hz
                </div>
              </div>
            </div>

            {/* Graph 2: Voltage (V) Waveform */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  <span>Voltage (V) Waveform</span>
                </span>
                <span className="text-slate-500 font-bold">
                  RMS: <strong className="text-slate-900">{transformer.busVoltage}</strong>
                </span>
              </div>

              <div className="relative h-28 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70">
                  <path
                    d={`M 0,35 Q 35,${20 + (liveTick % 5)} 75,35 T 150,35 T 225,35 T 300,35`}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                  />
                </svg>
                <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-400">
                  Nominal Bus Voltage (±0.4%)
                </div>
              </div>
            </div>

          </div>

          {/* 3 Secondary Telemetry Graphs: Winding/Oil Temp, Grid Frequency, Power Factor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Graph 3: Winding & Oil Temperature */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Winding & Oil Temp</span>
                </span>
                <span className={transformer.oilTemp > 85 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                  {transformer.oilTemp}°C
                </span>
              </div>

              <div className="relative h-24 bg-white rounded-lg border border-slate-200 p-2 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 150 50">
                  <line x1="0" y1="18" x2="150" y2="18" stroke="#EF4444" strokeDasharray="3 3" strokeWidth="1" />
                  <path d="M 0,40 Q 50,38 90,26 T 150,15" fill="none" stroke="#D97706" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-1 left-2 text-[9px] font-mono text-slate-400">
                  Wdg: {transformer.windingTemp}°C · Oil: {transformer.oilTemp}°C
                </div>
              </div>
            </div>

            {/* Graph 4: Grid Frequency */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Grid Frequency</span>
                </span>
                <span className="font-bold text-slate-900">{transformer.frequency}</span>
              </div>

              <div className="relative h-24 bg-white rounded-lg border border-slate-200 p-2 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 150 50">
                  <line x1="0" y1="25" x2="150" y2="25" stroke="#CBD5E1" strokeDasharray="2 2" strokeWidth="1" />
                  <path d="M 0,25 Q 20,20 40,25 T 80,25 T 120,25 T 150,25" fill="none" stroke="#2563EB" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-1 left-2 text-[9px] font-mono text-slate-400">
                  Stable 50.00 Hz Lock
                </div>
              </div>
            </div>

            {/* Graph 5: Power Factor */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Power Factor</span>
                </span>
                <span className="font-bold text-slate-900">{transformer.powerFactor}</span>
              </div>

              <div className="relative h-24 bg-white rounded-lg border border-slate-200 p-2 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 150 50">
                  <path d="M 0,30 Q 30,15 75,30 T 150,30" fill="none" stroke="#059669" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-1 left-2 text-[9px] font-mono text-slate-400">
                  Cos φ: {transformer.powerFactor} (Optimal)
                </div>
              </div>
            </div>

          </div>

          {/* Metadata Block (Exact format from sketch: Location, GPS, Substation, Control unit) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operational Metadata & Supervisory Routing
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-700">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Transformer ID:</span>
                <span className="font-extrabold text-slate-900">{transformer.id === 3 ? 'ID: 21001' : `ID: 2100${transformer.id}`}</span>
                <span className="text-slate-500 text-[10px] block font-medium">({transformer.code})</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Location Address:</span>
                <span className="font-semibold text-slate-800 block truncate" title={transformer.address || transformer.location}>
                  {transformer.address || transformer.location}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">GPS Co-ordinates:</span>
                <span className="font-semibold text-slate-800">{transformer.gps}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Parent Substation:</span>
                <span className="font-semibold text-slate-800">{transformer.substation}</span>
                <span className="text-blue-600 text-[10px] block font-bold">({transformer.controlUnit})</span>
              </div>
            </div>
          </div>

          {/* DEDICATED ANOMALY HISTORY SECTION (As specifically requested in prompt & sketch 06 Feb) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <History className="w-4 h-4 text-blue-600" />
                <span>Dedicated Anomaly History & Incident Resolution Log</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 font-bold border border-slate-200">
                {currentHistory.length} Recorded Events
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {currentHistory.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-start gap-2.5 text-[11px]"
                >
                  <span className="text-slate-400 font-semibold text-[10px] whitespace-nowrap pt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{item.time}</span>
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className={`flex-1 leading-relaxed ${
                    item.type === 'critical' ? 'text-rose-700 font-bold' :
                    item.type === 'warning' ? 'text-amber-800 font-semibold' :
                    item.type === 'deploy' ? 'text-blue-700 font-bold' :
                    item.type === 'action' ? 'text-indigo-700 font-semibold' :
                    item.type === 'resolved' ? 'text-emerald-700 font-bold' :
                    'text-slate-700'
                  }`}>
                    {item.event}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">
            Control Room Telemetry Console · Supervisory Feedback Active
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-mono font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back to Map</span>
          </button>
        </div>

      </div>
    </div>
  );
}
