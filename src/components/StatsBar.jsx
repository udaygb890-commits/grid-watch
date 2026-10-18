import React from 'react';
import { Activity, AlertOctagon, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Plus } from 'lucide-react';

export default function StatsBar({
  totalCount = 248,
  highRiskCount = 3,
  attentionCount = 3,
  healthyCount = 221,
  scopeLabel = null
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Total Transformers */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider font-mono">
            TOTAL TRANSFORMERS
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            <Plus className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            {totalCount}
          </span>
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4.2%</span>
          </span>
        </div>

        <div className="mt-2 text-[11px] text-slate-400 font-mono">
          {scopeLabel || 'Greater Bengaluru Grid · 248 assets monitored'}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* 2. High Risk / Critical */}
      <div className="bg-white border border-rose-200/90 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-rose-600 uppercase tracking-wider font-mono">
            HIGH RISK
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
            !
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-display text-rose-600 tracking-tight">
            {String(highRiskCount).padStart(2, '0')}
          </span>
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 font-mono">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>2 resolved today</span>
          </span>
        </div>

        <div className="mt-2 text-[11px] text-rose-700/80 font-mono font-medium">
          Requires immediate triage & dispatch
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* 3. Needs Attention */}
      <div className="bg-white border border-amber-200/90 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-amber-600 uppercase tracking-wider font-mono">
            NEEDS ATTENTION
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            ◒
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-display text-amber-600 tracking-tight">
            {attentionCount}
          </span>
          <span className="text-xs font-medium text-amber-600 flex items-center gap-0.5 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>3 new variances</span>
          </span>
        </div>

        <div className="mt-2 text-[11px] text-amber-700/80 font-mono font-medium">
          Insulation & load variance monitoring
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* 4. Healthy Assets */}
      <div className="bg-white border border-emerald-200/90 rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider font-mono">
            HEALTHY ASSETS
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            ✓
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold font-display text-emerald-600 tracking-tight">
            {healthyCount}
          </span>
          <span className="text-xs font-medium text-emerald-600 font-mono">
            88.3% of fleet
          </span>
        </div>

        <div className="mt-2 text-[11px] text-emerald-700/80 font-mono font-medium">
          Operating within standard IEEE margins
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

    </div>
  );
}
