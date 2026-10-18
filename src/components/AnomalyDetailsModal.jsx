import React, { useState } from 'react';
import { 
  X, ArrowLeft, AlertOctagon, AlertTriangle, CheckCircle2, 
  Cpu, Wrench, Zap, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function AnomalyDetailsModal({
  anomalyData,
  isOpen,
  onClose,
  onToggleResolve,
  onRerouteLoad
}) {
  const [rerouted, setRerouted] = useState(false);
  const [notice, setNotice] = useState('');

  if (!isOpen || !anomalyData) return null;

  const transformer = anomalyData?.transformer || (anomalyData?.code ? anomalyData : { code: 'TX-03', id: 3, substation: 'Kadugodi Substation', status: 'CRITICAL' });
  const anomaly = anomalyData?.anomaly || anomalyData || {};
  const isResolved = Boolean(anomaly?.resolved || transformer?.status === 'RESOLVED');
  const isCritical = anomaly?.severity === 'CRITICAL' && !isResolved;

  const handleReroute = () => {
    setRerouted(true);
    setNotice('Remote load rerouting successful: 45 MVA transferred to Reserve Feeder Bus B.');
    if (onRerouteLoad && transformer?.id) onRerouteLoad(transformer.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-slate-300 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                  Anomaly Deep-Dive Diagnostic
                </span>
                <span className="text-xs font-mono text-slate-500 font-bold">
                  {transformer.code}
                </span>
              </div>
              <h2 className="text-lg font-bold font-display text-slate-900 mt-0.5">
                {anomaly.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isResolved ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>STATUS: RESOLVED</span>
              </span>
            ) : isCritical ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>STATUS: NOT RESOLVED</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>STATUS: WARNING ATTENTION</span>
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

        {/* Modal Content (Exact structure from sketch: Trigger, Severity, AI Insights, Waveform, Engineer, Interactive tools) */}
        <div className="p-6 space-y-6">
          
          {notice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notice}</span>
            </div>
          )}

          {/* Section 1: Trigger Details & Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Trigger Timestamp</span>
              <span className="font-extrabold text-slate-900 mt-0.5 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {anomaly.detectedAt}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Transformer Target</span>
              <span className="font-extrabold text-slate-900 mt-0.5 block">
                ID: {transformer.id === 3 ? '21001' : `2100${transformer.id}`} ({transformer.code})
              </span>
              <span className="text-[10px] text-slate-500 truncate block">{transformer.substation}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Severity Level</span>
              <span className={`font-extrabold mt-0.5 block ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}>
                {anomaly.severity}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Classification</span>
              <span className="font-extrabold text-slate-900 mt-0.5 block">
                {anomaly.type}
              </span>
            </div>
          </div>

          {/* Section 2: AI Diagnostic Insights */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>AI Diagnostic Insights</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                CONFIDENCE {anomaly.confidence || 94.8}%
              </span>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed pt-1 space-y-1.5">
              <p>
                <strong>Root cause:</strong> {anomaly.rootCause}
              </p>
              {anomaly.diagnosticInsight && (
                <p className="text-slate-600 text-[11px]">
                  <strong>Core analysis:</strong> {anomaly.diagnosticInsight}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: "Before vs After Spike" Comparison Waveform (Exact from sketch page 05) */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-slate-900 flex items-center justify-between">
              <span>Waveform Diagnostic Comparison: Before vs After Spike</span>
              <span className="text-[10px] text-slate-500">IEEE Transient Waveform Log</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Spike */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700">Before Spike (Pre-fault)</span>
                  <span className="text-[10px] text-slate-500">THD: 1.2%</span>
                </div>
                <div className="h-20 bg-white rounded-lg border border-slate-200 p-2 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 200 50">
                    <path d="M 0,25 Q 25,5 50,25 T 100,25 T 150,25 T 200,25" fill="none" stroke="#059669" strokeWidth="2.5" />
                  </svg>
                </div>
                <p className="text-[10px] text-slate-500">Pure sinusoidal 50.0 Hz; balanced phases and nominal core flux.</p>
              </div>

              {/* After Spike */}
              <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-700">After Spike (Transient Surge)</span>
                  <span className="text-[10px] text-rose-600 font-bold">THD: 14.8%</span>
                </div>
                <div className="h-20 bg-white rounded-lg border border-slate-200 p-2 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 200 50">
                    <path d="M 0,25 Q 15,2 30,28 Q 45,45 60,8 Q 75,2 90,40 Q 110,2 130,32 T 160,20 T 200,25" fill="none" stroke="#DC2626" strokeWidth="2.5" />
                  </svg>
                </div>
                <p className="text-[10px] text-rose-800">Severe harmonic saturation and sudden inductive back-EMF surge.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Assigned Field Engineer Status */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Assigned Field Engineer</div>
                <div className="font-bold text-slate-900 text-sm">{anomaly.fieldEngineer || 'Mr. Raghavan'}</div>
                <div className="text-slate-500 text-[11px]">{anomaly.fieldStatus || 'Deployed on-site · Badge #GW-FE-412'}</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">On-Site Dispatch</span>
              <span className="font-bold text-emerald-700">Clearance Level 4 Verified</span>
            </div>
          </div>

        </div>

        {/* Modal Footer: Interactive Tools (Change Resolution Status & Load Rerouting) */}
        <div className="p-5 border-t border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            {/* Interactive Tool 1: Resolution Status Toggle */}
            <button
              onClick={() => onToggleResolve(transformer.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                isResolved
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isResolved ? 'Re-open Anomaly (Set Not Resolved)' : 'Mark Anomaly as Resolved'}</span>
            </button>

            {/* Interactive Tool 2: Remote Load Rerouting */}
            <button
              onClick={handleReroute}
              disabled={rerouted}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                rerouted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{rerouted ? '✓ 45 MVA Rerouted' : 'Remote Load Rerouting (45 MVA to Bus B)'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}
