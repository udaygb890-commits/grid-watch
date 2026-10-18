import React, { useState } from 'react';
import { 
  AlertOctagon, AlertTriangle, CheckCircle2, ArrowUpRight, 
  Filter, Download, Check, Wrench, Search, Clock
} from 'lucide-react';
import { initialTransformers } from '../data/gridData';

export default function IncidentQueue({
  transformers = initialTransformers,
  onSelectTransformer,
  onResolveAnomaly,
  activeRole = 'admin'
}) {
  const isControlRoom = activeRole === 'control_room';
  const safeTransformers = Array.isArray(transformers) && transformers.length > 0
    ? transformers
    : initialTransformers;
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [acknowledgedTickets, setAcknowledgedTickets] = useState([]);

  // Extract all transformers with anomalies + construct incident tickets
  const incidents = safeTransformers
    .filter(t => t.anomaly)
    .map(t => ({
      ticket: `INC-2026-TX${t.id.toString().padStart(2, '0')}`,
      transformer: t,
      title: t.anomaly.title,
      type: t.anomaly.type,
      severity: t.anomaly.resolved ? 'RESOLVED' : t.anomaly.severity,
      time: t.anomaly.detectedAt,
      rootCause: t.anomaly.rootCause,
      engineer: t.anomaly.fieldEngineer || 'Unassigned',
      resolved: t.anomaly.resolved
    }));

  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity === 'critical') return inc.severity === 'CRITICAL';
    if (filterSeverity === 'warning') return inc.severity === 'WARNING';
    if (filterSeverity === 'resolved') return inc.resolved;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.ticket.toLowerCase().includes(q) ||
        inc.transformer.name.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.engineer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAcknowledge = (ticket) => {
    setAcknowledgedTickets(prev => [...prev, ticket]);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl text-slate-900">
              {isControlRoom ? 'Cluster Incident Queue (Control Unit 1)' : 'Active Incident Queue'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {incidents.filter(i => !i.resolved).length} Action Required
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {isControlRoom 
              ? 'Localized anomaly triage for Control Unit 1 (TX-01, TX-02, TX-03) · Filtered to local operational cluster'
              : 'Automated ML telemetry alerts & city-wide grid operator incident dispatch queue'}
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticket, asset, engineer..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 w-56"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterSeverity === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({incidents.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterSeverity === 'critical' ? 'bg-rose-50 text-rose-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Critical ({incidents.filter(i => i.severity === 'CRITICAL').length})
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterSeverity === 'warning' ? 'bg-amber-50 text-amber-800 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Warning ({incidents.filter(i => i.severity === 'WARNING').length})
            </button>
            <button
              onClick={() => setFilterSeverity('resolved')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filterSeverity === 'resolved' ? 'bg-emerald-50 text-emerald-700 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Resolved ({incidents.filter(i => i.resolved).length})
            </button>
          </div>
        </div>
      </div>

      {/* Incident Tickets Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                <th className="py-3 px-4">Ticket & Severity</th>
                <th className="py-3 px-4">Transformer Asset</th>
                <th className="py-3 px-4">Classification & Root Cause</th>
                <th className="py-3 px-4">Assigned Engineer</th>
                <th className="py-3 px-4">Time Detected</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((inc) => {
                const isAcked = acknowledgedTickets.includes(inc.ticket);

                return (
                  <tr 
                    key={inc.ticket}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      inc.severity === 'CRITICAL' ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inc.ticket}</div>
                      <div className="mt-1">
                        {inc.resolved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            RESOLVED
                          </span>
                        ) : inc.severity === 'CRITICAL' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertOctagon className="w-3 h-3 text-rose-600 animate-pulse" />
                            CRITICAL SPIKE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            VARIANCE
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inc.transformer.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {inc.transformer.substation} ({inc.transformer.code})
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-800">{inc.title}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {inc.rootCause}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Wrench className="w-3.5 h-3.5 text-blue-600" />
                        <span>{inc.engineer}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {inc.resolved ? 'Inspection verified' : 'Dispatched on-site'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{inc.time}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Automated ML Flag</div>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectTransformer(inc.transformer)}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onResolveAnomaly(inc.transformer.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                          inc.resolved
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200'
                        }`}
                      >
                        {inc.resolved ? 'Re-open' : '✓ Resolve'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
