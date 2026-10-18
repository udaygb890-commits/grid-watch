import React, { useState } from 'react';
import { 
  X, Zap, Activity, AlertOctagon, AlertTriangle, CheckCircle2, 
  RotateCcw, ShieldAlert, Cpu, ArrowRight, Gauge, Thermometer,
  Wrench, Layers, Radio, Sparkles, Check
} from 'lucide-react';

export default function AnomalySimulationModal({
  isOpen,
  onClose,
  transformers = [],
  onSimulateAnomaly,
  onResetSimulation
}) {
  const [selectedTxId, setSelectedTxId] = useState(3); // Default Kadugodi T3
  const [selectedType, setSelectedType] = useState('type_a'); // 'type_a' | 'type_b' | 'type_c'
  const [selectedSeverity, setSelectedSeverity] = useState('severe'); // 'severe' | 'warning'
  const [executionNotice, setExecutionNotice] = useState('');

  if (!isOpen) return null;

  const targetTx = transformers.find(t => t.id === selectedTxId) || transformers[0];

  // Complete Simulation Matrix Definitions
  const simulationMatrix = {
    type_a: {
      name: 'Type A: Current Spike (Overcurrent)',
      category: 'Overcurrent',
      icon: Zap,
      severe: {
        title: 'Overcurrent Surge & Core Saturation',
        trigger: 'Current surging >920A on Phase B (Peak 945A)',
        threshold: '>920 A',
        rootCause: 'Sudden inductive load surge detected above 920A threshold on Phase B. Critical core saturation and thermal flashover hazard.',
        systemAction: 'Immediate Automated Transformer Trip / Circuit Breaker Shutdown executed, isolating busbar within 120ms.',
        furtherAction: 'Autonomous emergency dispatch of High-Voltage Diagnostic Engineer Mr. Raghavan (Badge #GW-FE-412) with GPS navigation.',
        telemetryEffect: {
          status: 'CRITICAL',
          loadCurrent: '0 A (Tripped from 945 A)',
          busVoltage: '0.0 kV (Bus Isolated)',
          breakerStatus: 'OPEN',
          loadPct: 0,
          oilTemp: 94.8,
          windingTemp: 104.2
        },
        engineer: 'Mr. Raghavan (GW-FE-412)'
      },
      warning: {
        title: 'Feeder Overload Variance',
        trigger: 'Current fluctuating between 750A - 850A',
        threshold: '750A - 850A',
        rootCause: 'Current fluctuating abnormally between 750A - 850A on secondary bus. Approaching conductor thermal throttling threshold.',
        systemAction: 'Dynamic load-rerouting executed: 35 MVA transferred to Auxiliary Feeder Bus B with thermal throttling alert.',
        furtherAction: 'High-frequency telemetry sampling increased to 2.4 kHz; automated advisory log dispatched to Grid Supervisory Console.',
        telemetryEffect: {
          status: 'WARNING',
          loadCurrent: '785 A',
          busVoltage: '226.8 kV',
          breakerStatus: 'CLOSED',
          loadPct: 84.5,
          oilTemp: 76.5,
          windingTemp: 83.0
        },
        engineer: 'Devon Reed (GW-FE-414)'
      }
    },
    type_b: {
      name: 'Type B: Voltage Spike / Surge',
      category: 'Voltage Surge',
      icon: Gauge,
      severe: {
        title: 'High-Voltage Transient Line Surge',
        trigger: 'Voltage soaring >250 kV on 220 kV line (Lightning/Surge Arrester Saturation)',
        threshold: '>250 kV',
        rootCause: 'Voltage soaring to 258.4 kV on 220 kV transmission line due to atmospheric lightning discharge & surge arrester saturation.',
        systemAction: 'Emergency Surge Diverter Engagement & Automated Line De-energization executed within 95ms.',
        furtherAction: 'Automated dispatch of Substation High-Voltage Testing Crew (Devon Reed & Sarah Chen) with dielectric breakdown clearance kit.',
        telemetryEffect: {
          status: 'CRITICAL',
          loadCurrent: '0 A',
          busVoltage: '0.0 kV (De-energized from 258.4 kV)',
          breakerStatus: 'OPEN',
          loadPct: 0,
          oilTemp: 64.0,
          windingTemp: 70.5
        },
        engineer: 'Devon Reed & Sarah Chen'
      },
      warning: {
        title: 'Bus Voltage Regulation Variance',
        trigger: 'Voltage sag/swell within ±10% tolerances (9.8% Swell)',
        threshold: '±10% Tolerance',
        rootCause: 'Bus voltage fluctuating (+9.8% swell at 242.5 kV) approaching tolerance threshold under peak reactive loading.',
        systemAction: 'Automatic On-Load Tap Changer (OLTC) step -2 adjustment and dynamic reactive power (VAR) compensation engaged.',
        furtherAction: 'Automated bus voltage stabilization advisory logged; grid equilibrium verified nominal at 230 kV bus.',
        telemetryEffect: {
          status: 'WARNING',
          loadCurrent: '380 A',
          busVoltage: '232.0 kV (Stabilized from 242.5 kV)',
          breakerStatus: 'CLOSED',
          loadPct: 68.0,
          oilTemp: 60.5,
          windingTemp: 66.0
        },
        engineer: 'Auto Tap Controller (Verified by Devon Reed)'
      }
    },
    type_c: {
      name: 'Type C: Thermal Overshoot (Oil / Winding)',
      category: 'Thermal Breakdown',
      icon: Thermometer,
      severe: {
        title: 'Accelerated Winding Hotspot Breakdown',
        trigger: 'Winding oil temp >95°C with accelerated gradient (>3.2°C/min)',
        threshold: '>95°C & >3.2°C/min',
        rootCause: 'Winding oil temperature exceeded 98.6°C with accelerated thermal gradient (>3.2°C/min). Severe dielectric insulation breakdown risk.',
        systemAction: 'Emergency Coolant Pump Activation & 45% Partial Load Shedding executed autonomously at 09:14 IST.',
        furtherAction: 'Automated emergency dispatch of Thermal Inspection Team with FLIR infrared thermal imaging apparatus (Mr. Raghavan & Amina Al-Mansoor).',
        telemetryEffect: {
          status: 'CRITICAL',
          loadCurrent: '510 A (Load Shed from 945 A)',
          busVoltage: '228.4 kV',
          breakerStatus: 'CLOSED',
          loadPct: 54.2,
          oilTemp: 98.6,
          windingTemp: 109.2
        },
        engineer: 'Mr. Raghavan & Amina Al-Mansoor'
      },
      warning: {
        title: 'Radiator Fin Thermal Gradient Rise',
        trigger: 'Oil temperature rising steadily between 80°C - 90°C',
        threshold: '80°C - 90°C',
        rootCause: 'Oil temperature rising steadily to 84.8°C due to restricted convection flow in cooling radiator bank.',
        systemAction: 'Forced-air cooling fan boost (Fan Stage 2 forced on) and automated advisory log generation executed.',
        furtherAction: 'Preventative work order #WO-9021 automatically generated for radiator fin flush and DGA dissolved gas chromatography.',
        telemetryEffect: {
          status: 'WARNING',
          loadCurrent: '440 A',
          busVoltage: '229.0 kV',
          breakerStatus: 'CLOSED',
          loadPct: 78.0,
          oilTemp: 84.8,
          windingTemp: 91.5
        },
        engineer: 'Amina Al-Mansoor (GW-FE-415)'
      }
    }
  };

  const currentSelection = simulationMatrix[selectedType][selectedSeverity];

  const handleExecute = () => {
    onSimulateAnomaly({
      txId: selectedTxId,
      anomalyType: selectedType,
      severity: selectedSeverity,
      config: currentSelection
    });

    setExecutionNotice(`⚡ AI Autonomous Response Executed on ${targetTx.code} (${targetTx.name})!`);
    setTimeout(() => {
      setExecutionNotice('');
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    onResetSimulation();
    setExecutionNotice('↺ Grid returned to healthy nominal equilibrium.');
    setTimeout(() => {
      setExecutionNotice('');
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-slate-300 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  AI Autonomous Engine
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Interactive Simulation Control Deck
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-slate-900 mt-1">
                AI Anomaly Simulation & Autonomous Response
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {executionNotice && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-900 font-mono text-xs font-bold flex items-center justify-between animate-fadeIn shadow-xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{executionNotice}</span>
              </span>
              <span className="animate-pulse">Active</span>
            </div>
          )}

          {/* Section 1: Target Transformer Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold text-slate-700 flex items-center justify-between">
              <span>Step 1: Choose Target Transformer Node</span>
              <span className="text-slate-400 font-normal">7 Units Monitored</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {transformers.slice(0, 7).map((t) => {
                const isSelected = selectedTxId === t.id;
                const isCrit = t.status === 'CRITICAL' && !t.anomaly?.resolved;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTxId(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 font-display">
                        {t.code}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${isCrit ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 truncate mt-1 block">
                      {t.name}
                    </span>
                    <span className="text-[9px] text-blue-700 font-bold mt-1 block">
                      {t.voltageRating?.split(' ')[0] || '230kV'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Choose Anomaly Type (A, B, C) */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold text-slate-700 flex items-center justify-between">
              <span>Step 2: Choose Anomaly Category</span>
              <span className="text-slate-400 font-normal">3 Standard IEEE Fault Types</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Type A */}
              <button
                type="button"
                onClick={() => setSelectedType('type_a')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedType === 'type_a'
                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-700">Type A</span>
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-900 mt-1">
                  Current Spike
                </h4>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Overcurrent, Phase B overload & busbar saturation
                </p>
              </button>

              {/* Type B */}
              <button
                type="button"
                onClick={() => setSelectedType('type_b')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedType === 'type_b'
                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-700">Type B</span>
                  <Gauge className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-900 mt-1">
                  Voltage Spike / Surge
                </h4>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Transient surge, arrester saturation & line regulation
                </p>
              </button>

              {/* Type C */}
              <button
                type="button"
                onClick={() => setSelectedType('type_c')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedType === 'type_c'
                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-700">Type C</span>
                  <Thermometer className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-display font-bold text-sm text-slate-900 mt-1">
                  Thermal Overshoot
                </h4>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Oil & winding hotspot, coolant failure & load shedding
                </p>
              </button>

            </div>
          </div>

          {/* Section 3: Choose Severity Tier (Severe vs Warning) */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase font-bold text-slate-700 flex items-center justify-between">
              <span>Step 3: Select Severity Tier</span>
              <span className="text-slate-400 font-normal">Triggers Autonomous Response Tier</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Severe Option */}
              <button
                type="button"
                onClick={() => setSelectedSeverity('severe')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedSeverity === 'severe'
                    ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    TIER 1: SEVERE (CRITICAL)
                  </span>
                  {selectedSeverity === 'severe' && <Check className="w-4 h-4 text-rose-600" />}
                </div>
                <div className="font-display font-bold text-sm text-slate-900 mt-2">
                  {simulationMatrix[selectedType].severe.trigger}
                </div>
                <div className="text-[11px] font-mono text-rose-700 mt-1">
                  Autonomous Action: {selectedType === 'type_a' ? 'Circuit Breaker Shutdown & Trip within 120ms' : selectedType === 'type_b' ? 'Surge Diverter & De-energization' : 'Coolant Pump & 45% Load Shedding'}
                </div>
              </button>

              {/* Warning Option */}
              <button
                type="button"
                onClick={() => setSelectedSeverity('warning')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedSeverity === 'warning'
                    ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    TIER 2: WARNING (MODERATE)
                  </span>
                  {selectedSeverity === 'warning' && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <div className="font-display font-bold text-sm text-slate-900 mt-2">
                  {simulationMatrix[selectedType].warning.trigger}
                </div>
                <div className="text-[11px] font-mono text-amber-700 mt-1">
                  Autonomous Action: {selectedType === 'type_a' ? 'Dynamic 35 MVA Load Reroute to Feeder B' : selectedType === 'type_b' ? 'Tap Changer (LTC) Adjustment & VAR' : 'Forced-Air Cooling Fan Boost'}
                </div>
              </button>

            </div>
          </div>

          {/* Section 4: Autonomous Execution Preview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-200/80 pb-2">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-700">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Autonomous AI Execution Sequence Preview</span>
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                Target: {targetTx.code} ({targetTx.name})
              </span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">1. Anomaly Classification & Root Cause:</span>
                <p className="text-slate-800 font-semibold mt-0.5">
                  {currentSelection.rootCause}
                </p>
              </div>

              <div>
                <span className="text-blue-600 block text-[10px] uppercase font-bold">2. Autonomous Immediate Action (Grid Hunter AI):</span>
                <p className="text-blue-900 font-semibold mt-0.5 bg-blue-50/70 p-2 rounded-lg border border-blue-200">
                  {currentSelection.systemAction}
                </p>
              </div>

              <div>
                <span className="text-emerald-700 block text-[10px] uppercase font-bold">3. Further Actions & Autonomous Field Coordination:</span>
                <p className="text-emerald-900 font-semibold mt-0.5 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                  {currentSelection.furtherAction}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 pt-4 border-t border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-300 transition-colors flex items-center gap-2 shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>Reset Grid to Nominal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecute}
              className={`px-6 py-2.5 rounded-xl text-white font-mono font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                selectedSeverity === 'severe'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Trigger Simulation & Autonomous Response</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
