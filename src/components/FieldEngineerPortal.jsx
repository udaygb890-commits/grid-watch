import React, { useState } from 'react';
import { 
  AlertOctagon, AlertTriangle, CheckCircle2, MapPin, Compass, 
  ExternalLink, Wrench, Zap, Gauge, Thermometer, ShieldCheck, 
  Clock, Navigation, Phone, Radio, ChevronRight, Check, RefreshCw,
  Cpu, FileText, ArrowRight
} from 'lucide-react';
import { initialTransformers } from '../data/gridData';

export default function FieldEngineerPortal({
  transformers: inputTransformers = initialTransformers,
  onResolveAnomaly,
  onRerouteLoad,
  onToggleBreaker,
  deploymentState
}) {
  const transformers = Array.isArray(inputTransformers) && inputTransformers.length > 0
    ? inputTransformers
    : initialTransformers;

  // Find current dispatched transformer or default to Kadugodi T3 (ID 3)
  // An anomaly simulated on any transformer will automatically be prioritized
  const criticalTx = transformers.find(t => t.status === 'CRITICAL' && !t.anomaly?.resolved);
  const warningTx = transformers.find(t => t.status === 'WARNING' && !t.anomaly?.resolved);
  const activeDispatchedTx = criticalTx || warningTx || transformers.find(t => t.id === 3) || transformers[0] || initialTransformers[2];

  const [selectedTxId, setSelectedTxId] = useState(activeDispatchedTx?.id || 3);
  const [engineerStatus, setEngineerStatus] = useState('En Route'); // 'Dispatched' | 'En Route' | 'On-Site' | 'Completed'
  const [checklist, setChecklist] = useState({
    breakerLock: true,
    thermalScan: false,
    dgaTest: false,
    clearanceCheck: false
  });
  const [actionNotice, setActionNotice] = useState('');

  const currentTx = transformers.find(t => t.id === selectedTxId) || activeDispatchedTx;
  const hasActiveAnomaly = currentTx?.anomaly && !currentTx?.anomaly?.resolved;
  const isCritical = currentTx?.status === 'CRITICAL' && hasActiveAnomaly;
  const isResolved = currentTx?.status === 'RESOLVED' || currentTx?.anomaly?.resolved;

  const toggleChecklistItem = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenGoogleMaps = () => {
    // Generate high-accuracy Google Maps query using GPS coordinates and address
    const query = currentTx.gps ? currentTx.gps.replace(/['"]/g, '') : currentTx.address;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ', Bengaluru')}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleAcknowledgeEnRoute = () => {
    setEngineerStatus('En Route');
    setActionNotice('Dispatched acknowledged: GPS routing initialized. ETA: 8 minutes.');
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleCheckInOnSite = () => {
    setEngineerStatus('On-Site');
    setActionNotice('Check-in confirmed: Mr. Raghavan verified at Substation Yard.');
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleResolveWorkOrder = () => {
    onResolveAnomaly(currentTx.id);
    setEngineerStatus('Completed');
    setActionNotice(`Work Order closed: ${currentTx.code} (${currentTx.name}) cleared & verified nominal.`);
    setTimeout(() => setActionNotice(''), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Engineer Identity & Readiness Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-display font-extrabold text-xl shadow-md shadow-blue-500/20">
            MR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                FIELD ENGINEER DISPATCH PORTAL
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Badge #GW-FE-412
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 mt-1 flex items-center gap-2">
              <span>Mr. Raghavan</span>
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Level 4 High-Voltage Diagnostic Specialist
              </span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 mt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Zone: Greater Bengaluru · Sector 11 & Kadugodi Corridor</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>VHF Radio: Channel 14 · Dispatch Synced</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+91 (555) 019-4120</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dispatch Status Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Dispatch State</span>
            <span className={`text-sm font-extrabold ${
              hasActiveAnomaly ? 'text-rose-600 animate-pulse' : 'text-emerald-700'
            }`}>
              {hasActiveAnomaly ? '● ACTIVE DISPATCH PRIORITY 1' : 'STANDBY · TELEMETRY NOMINAL'}
            </span>
          </div>
          <span className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
            hasActiveAnomaly 
              ? 'bg-rose-50 border-rose-200 text-rose-700' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {engineerStatus}
          </span>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-mono text-xs font-bold flex items-center justify-between shadow-2xs animate-fadeIn">
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{actionNotice}</span>
          </span>
          <button 
            onClick={() => setActionNotice('')}
            className="text-emerald-600 hover:text-emerald-800 text-xs px-2 py-0.5 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PROMINENT ANOMALY DISPATCH ALERT CARD (Direct user requirement)        */}
      {/* ========================================================================= */}
      {hasActiveAnomaly ? (
        <div className="bg-white border-2 border-rose-400 rounded-3xl p-6 sm:p-8 shadow-lg shadow-rose-500/5 ring-4 ring-rose-500/10 space-y-6">
          
          {/* Headline Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-rose-100">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/20">
                <AlertOctagon className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded border border-rose-300">
                    EMERGENCY DISPATCH TICKET · PRIORITY 1
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {currentTx.anomaly.detectedAt || 'Today, 09:14 IST'}
                  </span>
                </div>
                {/* Specific Title Requirement */}
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mt-1">
                  Anomaly detected at Transformer {currentTx.code} ({currentTx.name})
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Assigned Substation: {currentTx.substation} · Voltage: {currentTx.voltageRating} · {currentTx.mva}
                </p>
              </div>
            </div>

            {/* Direct Google Maps Action Button */}
            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-mono font-bold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center gap-2.5"
              title="Open location in Google Maps routing"
            >
              <Navigation className="w-4 h-4 text-blue-100" />
              <span>Open location on Google Maps</span>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </button>
          </div>

          {/* Diagnostic Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                1. Failure Classification
              </span>
              <span className="font-extrabold text-sm text-slate-900 block">
                {currentTx.anomaly.title || 'Overcurrent Core Saturation'}
              </span>
              <span className="text-[11px] text-blue-700 font-semibold block">
                {currentTx.anomaly.type || 'Phase B Overload'}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                2. Trigger Timestamp & Severity
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  {currentTx.anomaly.severity || 'CRITICAL'}
                </span>
                <span className="font-bold text-slate-800">
                  {currentTx.anomaly.detectedAt || '09:14 IST'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                AI Confidence: {currentTx.anomaly.confidence || 99.4}%
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 lg:col-span-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                3. Operational Reason / Root Cause
              </span>
              <p className="font-semibold text-slate-800 text-[11px] leading-relaxed">
                {currentTx.anomaly.rootCause || 'Sudden inductive load surge detected above 920A threshold on Phase B. Critical core saturation and thermal flashover hazard.'}
              </p>
            </div>

          </div>

          {/* Autonomous System Action & Protection Badge */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-blue-900 font-bold">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Autonomous Action Taken by Grid Hunter AI:</span>
              </span>
              <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded text-blue-800 font-extrabold">
                120ms Reaction Verified
              </span>
            </div>
            <p className="text-blue-950 font-medium leading-relaxed">
              {currentTx.anomaly.immediateAction || 'Immediate Automated Transformer Trip / Circuit Breaker Shutdown executed, isolating busbar within 120ms.'}
            </p>
            <div className="text-[11px] text-blue-800 font-semibold pt-1 border-t border-blue-200/60">
              Autonomous Dispatch: {currentTx.anomaly.furtherActions || 'Autonomous emergency dispatch of High-Voltage Diagnostic Engineer Mr. Raghavan (Badge #GW-FE-412) with GPS navigation.'}
            </div>
          </div>

          {/* Live Asset Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Load Current</span>
              <span className="font-extrabold text-base text-slate-900 mt-0.5 block">{currentTx.loadCurrent}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Bus Voltage</span>
              <span className="font-extrabold text-base text-slate-900 mt-0.5 block">{currentTx.busVoltage}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Oil Temperature</span>
              <span className={`font-extrabold text-base mt-0.5 block ${
                currentTx.oilTemp > 85 ? 'text-rose-600' : 'text-slate-900'
              }`}>{currentTx.oilTemp}°C</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Breaker Status</span>
              <span className={`font-extrabold text-base mt-0.5 block ${
                currentTx.breakerStatus === 'OPEN' ? 'text-rose-600' : 'text-emerald-700'
              }`}>{currentTx.breakerStatus}</span>
            </div>
          </div>

          {/* Location & GPS Strip */}
          <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Site Address & Coordinates:</span>
              <span className="font-bold text-slate-900 block">{currentTx.address}</span>
              <span className="text-blue-700 font-semibold block">GPS: {currentTx.gps}</span>
            </div>

            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-bold border border-blue-200 shadow-2xs transition-colors flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Field Actions for Mr. Raghavan */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAcknowledgeEnRoute}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition-colors"
              >
                1. Set En Route
              </button>
              <button
                type="button"
                onClick={handleCheckInOnSite}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-bold transition-colors"
              >
                2. Check-In On Site
              </button>
            </div>

            <button
              type="button"
              onClick={handleResolveWorkOrder}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-mono font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Anomaly Resolved & Close Work Order</span>
            </button>
          </div>

        </div>
      ) : (
        /* Standby Nominal Card when no active dispatch is pending */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  TELEMETRY NOMINAL · NO PENDING CRITICAL TICKETS
                </span>
                <h2 className="text-xl font-bold font-display text-slate-900 mt-1">
                  Transformer {currentTx.code} ({currentTx.name}) Operating in Equilibrium
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Substation: {currentTx.substation} · Address: {currentTx.address}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-mono font-bold text-xs border border-slate-300 transition-colors flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Open Substation in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Load Current</span>
              <span className="font-extrabold text-slate-900 mt-0.5 block">{currentTx.loadCurrent}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Bus Voltage</span>
              <span className="font-extrabold text-slate-900 mt-0.5 block">{currentTx.busVoltage}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Oil Temp</span>
              <span className="font-extrabold text-slate-900 mt-0.5 block">{currentTx.oilTemp}°C</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Breaker</span>
              <span className="font-extrabold text-emerald-700 mt-0.5 block">{currentTx.breakerStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FIELD DIAGNOSTIC CHECKLIST & SECTOR ASSET SELECTOR                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Field Engineer On-Site Diagnostic Checklist */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <h3 className="font-display font-bold text-base text-slate-900">
                On-Site Diagnostic Protocols (Mr. Raghavan)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              IEEE C57 / IEC 60076 Compliant
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            
            <label 
              onClick={() => toggleChecklistItem('breakerLock')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                checklist.breakerLock ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={checklist.breakerLock} 
                  onChange={() => {}}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 block">1. Breaker & Busbar Isolation Lock</span>
                  <span className="text-[11px] text-slate-500 block">Verify circuit breaker mechanism is physically open and busbar grounded.</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                LOTO Active
              </span>
            </label>

            <label 
              onClick={() => toggleChecklistItem('thermalScan')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                checklist.thermalScan ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={checklist.thermalScan} 
                  onChange={() => {}}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 block">2. Infrared FLIR Thermal Bushing Scan</span>
                  <span className="text-[11px] text-slate-500 block">Inspect Phase A, B, and C turret bushings for localized hotspot delta &gt;10°C.</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                FLIR E8-XT
              </span>
            </label>

            <label 
              onClick={() => toggleChecklistItem('dgaTest')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                checklist.dgaTest ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={checklist.dgaTest} 
                  onChange={() => {}}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 block">3. DGA Gas & Moisture Dielectric Sampling</span>
                  <span className="text-[11px] text-slate-500 block">Sample bottom drain valve for acetylene (C2H2) and hydrogen (H2) evolution.</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                ASTM D3612
              </span>
            </label>

            <label 
              onClick={() => toggleChecklistItem('clearanceCheck')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                checklist.clearanceCheck ? 'bg-blue-50/60 border-blue-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={checklist.clearanceCheck} 
                  onChange={() => {}}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 block">4. Clearance & Re-energization Authorization</span>
                  <span className="text-[11px] text-slate-500 block">Coordinate with Control Room Operator Marcus Vance for step-closure test.</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                Auth Req
              </span>
            </label>

          </div>
        </div>

        {/* Right Column: Assigned Sector Transformers Switcher */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h3 className="font-display font-bold text-base text-slate-900">
                Sector Transformer Assets
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              7 Units Monitored
            </span>
          </div>

          <p className="text-xs font-mono text-slate-500">
            Quickly switch inspected assets to verify telemetry or respond to multi-transformer events.
          </p>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {transformers.slice(0, 5).map(tx => {
              const isSelected = tx.id === selectedTxId;
              const isTxCrit = tx.status === 'CRITICAL' && !tx.anomaly?.resolved;

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxId(tx.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      isTxCrit ? 'bg-rose-500 animate-pulse' : tx.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs font-mono text-slate-900">{tx.code}</span>
                        <span className="text-[11px] font-medium text-slate-600 truncate max-w-[150px]">{tx.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">{tx.substation}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px]">
                    <span className={`font-bold ${isTxCrit ? 'text-rose-600' : 'text-slate-700'}`}>
                      {tx.loadCurrent}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{tx.oilTemp}°C</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
