import React, { useState } from 'react';
import { 
  ArrowLeft, Activity, AlertTriangle, AlertOctagon, CheckCircle2, 
  Zap, Wrench, ShieldAlert, Cpu, ChevronRight, 
  MapPin, Compass, Thermometer, Gauge, Clock, Radio, Check
} from 'lucide-react';

export default function SubstationInspector({
  transformer,
  onBack,
  onResolveAnomaly,
  onRerouteLoad,
  onToggleBreaker
}) {
  const [scrubberTime, setScrubberTime] = useState(10);
  const [rerouted, setRerouted] = useState(false);
  const [breakerClosed, setBreakerClosed] = useState(transformer?.breakerStatus !== 'OPEN');
  const [actionNotice, setActionNotice] = useState('');

  if (!transformer) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
        <Activity className="w-12 h-12 text-blue-600 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-slate-900 font-display">No Transformer Selected</h3>
        <p className="text-sm text-slate-500">Please select an asset from the Network Map or Incident Queue to inspect.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-mono font-bold transition-colors"
        >
          ← Return to Network Map
        </button>
      </div>
    );
  }

  const anom = transformer.anomaly;
  const isResolved = anom?.resolved;
  const isCritical = transformer.status === 'CRITICAL' && !isResolved;

  // Handle load reroute action
  const handleRerouteClick = () => {
    setRerouted(true);
    setActionNotice('Emergency load rerouted: 45 MVA transferred to Auxiliary Bus B. Core current dropping.');
    if (onRerouteLoad) onRerouteLoad(transformer.id);
  };

  // Handle breaker toggle
  const handleBreakerToggle = () => {
    const newState = !breakerClosed;
    setBreakerClosed(newState);
    setActionNotice(`Circuit Breaker manually toggled to ${newState ? 'CLOSED (Energized)' : 'OPEN (Isolated)'}.`);
    if (onToggleBreaker) onToggleBreaker(transformer.id, newState ? 'CLOSED' : 'OPEN');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Location Details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-500 text-slate-600 hover:text-blue-600 transition-colors"
              title="Return to Network Map"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  SUBSTATION INSPECTOR VIEW
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  {transformer.code}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-1">
                {transformer.name}
              </h1>
            </div>
          </div>

          {/* Status Badge & Resolution Action */}
          <div className="flex items-center gap-3">
            {isCritical ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>CRITICAL ANOMALY DETECTED</span>
              </span>
            ) : isResolved ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>RESOLVED / NORMALIZED</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>OPERATING NOMINALLY</span>
              </span>
            )}

            {anom && (
              <button
                onClick={() => onResolveAnomaly(transformer.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-xs ${
                  isResolved
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isResolved ? 'Re-open Anomaly' : '✓ Mark Anomaly Resolved'}
              </button>
            )}
          </div>
        </div>

        {/* Location & GPS Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Address</span>
              <span className="font-semibold text-slate-900 truncate block">{transformer.address || transformer.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
            <Compass className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">GPS Coordinates</span>
              <span className="font-semibold text-slate-900">{transformer.gps}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
            <Radio className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Substation & Unit</span>
              <span className="font-semibold text-slate-900">{transformer.substation}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
            <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Rating & Breaker</span>
              <span className="font-semibold text-slate-900">{transformer.voltageRating} ({breakerClosed ? 'CLOSED' : 'OPEN'})</span>
            </div>
          </div>
        </div>

      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice('')} className="text-slate-400 hover:text-slate-700 text-sm font-bold">
            ×
          </button>
        </div>
      )}

      {/* 4 Core Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Bus Voltage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>BUS VOLTAGE (RMS)</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold font-display text-slate-900">
            {transformer.busVoltage}
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Nominal: {transformer.voltageRating.split('/')[0]}</span>
            <span className="text-emerald-600 font-bold">±0.4% Dev</span>
          </div>
        </div>

        {/* Metric 2: Load Current */}
        <div className={`bg-white border rounded-xl p-4 space-y-2 shadow-xs ${
          isCritical ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>LOAD CURRENT</span>
            <Zap className={`w-4 h-4 ${isCritical ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-3xl font-extrabold font-display">
            <span className={isCritical ? 'text-rose-600' : 'text-slate-900'}>
              {rerouted ? '520 A' : transformer.loadCurrent}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Peak: {isCritical ? '1,245 A surge' : 'Nominal'}</span>
            <span className={isCritical ? 'text-rose-600 font-bold' : 'text-slate-500'}>
              {rerouted ? 'Load Dropped' : isCritical ? '+41.5% Surge' : 'In Range'}
            </span>
          </div>
        </div>

        {/* Metric 3: Oil Temperature */}
        <div className={`bg-white border rounded-xl p-4 space-y-2 shadow-xs ${
          transformer.oilTemp > 85 ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>OIL TEMPERATURE</span>
            <Thermometer className={`w-4 h-4 ${transformer.oilTemp > 85 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-3xl font-extrabold font-display">
            <span className={transformer.oilTemp > 85 ? 'text-rose-600' : 'text-slate-900'}>
              {rerouted ? '78.2°C' : `${transformer.oilTemp}°C`}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Winding: {transformer.windingTemp}°C</span>
            <span className={transformer.oilTemp > 85 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
              {transformer.oilTemp > 85 ? '▲ Hotspot +3.2°C/m' : 'Normal Gradient'}
            </span>
          </div>
        </div>

        {/* Metric 4: Load Percentage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>LOAD CAPACITY %</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold font-display">
            <span className={transformer.loadPct > 90 && !rerouted ? 'text-rose-600' : 'text-slate-900'}>
              {rerouted ? '56.4%' : `${transformer.loadPct}%`}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                rerouted ? 'bg-emerald-500' : transformer.loadPct > 90 ? 'bg-rose-500' : 'bg-blue-600'
              }`}
              style={{ width: `${rerouted ? 56.4 : Math.min(transformer.loadPct, 100)}%` }}
            />
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between pt-1">
            <span>Freq: {transformer.frequency}</span>
            <span>PF: {transformer.powerFactor}</span>
          </div>
        </div>

      </div>

      {/* Main Inspection Grid: 10-Min Trend Chart + ML Model Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): 10-Minute Rolling Trend Charts & Diagnostic Waveforms */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>10-Minute Rolling Telemetry & Waveform Trends</span>
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Continuous high-speed sensor stream (Current, Voltage, Oil Temp)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Time Window: <strong>T - {scrubberTime}m to Live</strong></span>
            </div>
          </div>

          {/* SVG 10-Minute Current Surge Waveform */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-800 font-bold">1. Phase Current (Amps) Surge Waveform</span>
              <span className="text-rose-600 flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Transient Current Spike at T - 4.2m
              </span>
            </div>

            <div className="relative h-32 bg-slate-50/90 rounded-xl border border-slate-200 overflow-hidden p-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="currentGradLight" x1="0%" y1="0%" x2="0%" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area */}
                <path 
                  d="M 0,65 L 50,64 L 100,66 L 150,63 L 200,65 L 250,64 L 300,65 L 340,64 L 360,15 L 380,85 L 400,20 L 420,75 L 450,30 L 480,55 L 520,38 L 560,35 L 600,32 L 600,100 L 0,100 Z"
                  fill="url(#currentGradLight)"
                />

                {/* Sinusoidal Current Waveform with Sudden Spike */}
                <path 
                  d="M 0,65 Q 25,50 50,65 T 100,65 T 150,65 T 200,65 T 250,65 T 300,65 T 340,65 C 350,65 355,10 365,15 C 375,20 380,95 390,85 C 400,75 410,15 425,25 C 440,35 460,70 480,50 C 500,30 520,40 550,35 L 600,32"
                  fill="none" 
                  stroke={isCritical ? '#DC2626' : '#0284C7'} 
                  strokeWidth="2.5" 
                />

                <circle cx="365" cy="15" r="4" fill="#DC2626" className="animate-ping" />
                <circle cx="365" cy="15" r="3" fill="#DC2626" />
              </svg>

              <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] font-mono text-slate-500">
                <span>T - 10m (Normal)</span>
                <span>T - 7m</span>
                <span className="text-rose-600 font-bold">Surge Trigger (920A Peak)</span>
                <span>T - 2m</span>
                <span>Now (Continuous)</span>
              </div>
            </div>
          </div>

          {/* SVG Thermal Heating Curve */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-800 font-bold">2. Thermal Gradient: Oil vs Winding Heat Curve (°C)</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-rose-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Winding Temp
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Oil Temp
                </span>
              </div>
            </div>

            <div className="relative h-28 bg-slate-50/90 rounded-xl border border-slate-200 overflow-hidden p-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 80" preserveAspectRatio="none">
                <line x1="0" y1="28" x2="600" y2="28" stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                <text x="5" y="24" fill="#DC2626" fontSize="8" fontFamily="monospace" fontWeight="bold">Safety Trip Threshold (90°C)</text>

                {/* Winding Curve (Rose) */}
                <path d="M 0,65 C 150,63 300,60 350,55 C 380,30 450,18 600,12" fill="none" stroke="#DC2626" strokeWidth="2.5" />

                {/* Oil Curve (Amber) */}
                <path d="M 0,72 C 150,70 300,68 360,65 C 400,45 470,30 600,22" fill="none" stroke="#D97706" strokeWidth="2.5" />
              </svg>

              <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] font-mono text-slate-500">
                <span>T - 10m (58°C)</span>
                <span>T - 6m (64°C)</span>
                <span>T - 4m (Hotspot Accelerates)</span>
                <span className="text-rose-600 font-bold">Now (94.8°C Oil / 104°C Wdg)</span>
              </div>
            </div>
          </div>

          {/* Before vs After Spike Diagnostic Comparison */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-800">
              Waveform Diagnostic Comparison: Pre-Fault Baseline vs Post-Fault Surge
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pre-Fault Baseline */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span>Pre-Fault Baseline (Normal)</span>
                  <span>THD: 1.2%</span>
                </div>
                <div className="h-14 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 200 40">
                    <path d="M 0,20 Q 25,5 50,20 T 100,20 T 150,20 T 200,20" fill="none" stroke="#059669" strokeWidth="2" />
                  </svg>
                </div>
                <p className="text-[10px] text-slate-500">Pure sinusoidal 50.0 Hz wave; nominal flux density and balanced phases.</p>
              </div>

              {/* Post-Fault Transient Surge */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-rose-700 font-bold">
                  <span>Post-Fault Transient Surge</span>
                  <span>THD: 14.8%</span>
                </div>
                <div className="h-14 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 200 40">
                    <path d="M 0,20 Q 15,2 30,22 Q 45,38 60,10 Q 75,5 90,35 Q 110,2 130,28 T 160,18 T 200,20" fill="none" stroke="#DC2626" strokeWidth="2" />
                  </svg>
                </div>
                <p className="text-[10px] text-slate-600">High harmonic saturation with rapid inductive back-EMF ringing.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): ML Model Diagnostic & Actionable Controls */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* ML Anomaly Detection Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <h3 className="font-display font-bold text-sm text-slate-900">
                  ML Anomaly Classifier
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
                AI CONFIDENCE {anom?.confidence || 94.8}%
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Classification</span>
                <span className="font-bold text-slate-900 text-sm">
                  {anom?.title || 'Nominal Supervised Operation'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Root Cause Analysis</span>
                <p className="text-slate-700 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1">
                  {anom?.rootCause || 'All parameters within IEEE C57.104 standard operating envelopes.'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Dissolved Gas Analysis (DGA)</span>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 mt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hydrogen (H2):</span>
                    <span className={isCritical ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {isCritical ? '342.5 ppm (Warning > 100)' : '18.2 ppm'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Acetylene (C2H2):</span>
                    <span className={isCritical ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {isCritical ? '14.2 ppm (Active Arcing)' : '0.1 ppm'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">DGA Status:</span>
                    <span className={isCritical ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                      {transformer.dgaStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Assigned Field Engineer</span>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-slate-900">
                      {anom?.fieldEngineer || 'Devon Reed'}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold">
                    {anom?.fieldStatus || 'Standby'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Remote Engineering Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Actionable Recommendations</span>
            </h3>

            {/* Recommendation 1: Remote Load Rerouting */}
            <div className="space-y-1.5">
              <button
                onClick={handleRerouteClick}
                disabled={rerouted}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all ${
                  rerouted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>{rerouted ? '✓ 45 MVA Rerouted to Bus B' : 'Execute Remote Load Rerouting'}</span>
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] font-mono text-slate-500 leading-tight">
                Transfers 45 MVA of industrial load to Reserve Feeder Bus B to rapidly reduce hotspot temperature.
              </p>
            </div>

            {/* Recommendation 2: Emergency Breaker Trip / Reclose */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <button
                onClick={handleBreakerToggle}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between transition-all ${
                  breakerClosed
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{breakerClosed ? 'Trip Circuit Breaker (Isolate)' : 'Re-close Circuit Breaker (Energize)'}</span>
                </span>
                <span className="text-[10px] font-bold">
                  {breakerClosed ? 'CLOSED' : 'OPEN'}
                </span>
              </button>
            </div>

            {/* Recommendation 3: Dispatch Field Diagnostic Team */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActionNotice('Emergency Work Order WO-2026-TX03 dispatched to Mr. Raghavan with urgent DGA test kit.')}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Dispatch Field Diagnostic Team</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
