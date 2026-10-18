import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, ArrowRight, Eye, Clock } from 'lucide-react';

import { initialTransformers } from '../data/gridData';

export default function AnomalyAlertList({
  transformers = initialTransformers,
  onOpenAnomalyModal = () => {}
}) {
  const safeTransformers = Array.isArray(transformers) && transformers.length > 0
    ? transformers
    : initialTransformers;

  // Extract all transformers with anomalies
  const anomaliesList = safeTransformers
    .filter(t => t.anomaly)
    .sort((a, b) => (a.anomaly?.resolved === b.anomaly?.resolved ? 0 : a.anomaly?.resolved ? 1 : -1));

  const pendingCount = anomaliesList.filter(t => !t.anomaly?.resolved).length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h2 className="font-display font-bold text-base text-slate-900">
              Anomaly Alert List
            </h2>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            Orderly feed of flagged grid anomalies & root cause triggers
          </p>
        </div>

        {/* Pending Badge matching screenshot */}
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200">
          {pendingCount > 0 ? `${pendingCount} Pending` : 'All Resolved'}
        </span>
      </div>

      {/* Anomaly Feed */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {anomaliesList.map((tx, idx) => {
          const anom = tx.anomaly;
          const isResolved = anom?.resolved;
          const isCritical = anom?.severity === 'CRITICAL' && !isResolved;

          return (
            <div
              key={tx.id}
              className={`p-3.5 rounded-xl border transition-all text-left space-y-2.5 ${
                isResolved
                  ? 'bg-slate-50/70 border-slate-200 opacity-80 hover:opacity-100'
                  : isCritical
                  ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                  : 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
              }`}
            >
              {/* Anomaly Title, ID, and Status Pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Anomaly #{idx + 1}: {tx.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    ID: {tx.id === 3 ? '21001' : `2100${tx.id}`} ({tx.code}) · {tx.substation}
                  </div>
                </div>

                {/* Status Pill matching screenshot */}
                {isResolved ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Resolved</span>
                  </span>
                ) : isCritical ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800">
                    <span>Not Resolved</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    <span>Attention</span>
                  </span>
                )}
              </div>

              {/* Trigger Details & Timestamps in IST */}
              <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 font-mono leading-relaxed space-y-1">
                <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1 pb-1 border-b border-slate-100">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Detected at {anom.detectedAt}:</span>
                </div>
                <p className="line-clamp-2 pt-0.5 text-[11px] text-slate-800">
                  {anom.rootCause}
                </p>
              </div>

              {/* Bottom Bar: Telemetry & "View Details" Trigger */}
              <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                <span className="text-slate-600">
                  Oil: <strong className={tx.oilTemp > 85 ? 'text-rose-600' : 'text-slate-900'}>{tx.oilTemp}°C</strong> &nbsp;|&nbsp; Load: <strong className={tx.loadPct > 90 ? 'text-rose-600' : 'text-slate-900'}>{tx.loadPct}%</strong>
                </span>

                <button
                  onClick={() => onOpenAnomalyModal({ transformer: tx, anomaly: anom })}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold transition-colors inline-flex items-center gap-1 text-[11px]"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
