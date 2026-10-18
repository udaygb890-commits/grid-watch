import React from 'react';
import { Building2, Zap, AlertTriangle, CheckCircle2, AlertOctagon, ArrowUpRight } from 'lucide-react';
import { initialTransformers } from '../data/gridData';

export default function SubstationsView({
  transformers = initialTransformers,
  onSelectTransformer,
  activeRole = 'admin'
}) {
  const isControlRoom = activeRole === 'control_room';
  const safeTransformers = Array.isArray(transformers) && transformers.length > 0
    ? transformers
    : initialTransformers;

  const allSubstations = [
    {
      id: 'sub-1',
      name: 'Cascade North Substation 11A',
      region: 'Northern High-Voltage Sector',
      voltage: '500kV / 230kV',
      capacity: '500 MVA',
      txIds: [1, 2],
      status: 'OPERATIONAL'
    },
    {
      id: 'sub-2',
      name: 'Kadugodi Substation 1',
      region: 'Eastern Commercial Sub-grid',
      voltage: '230kV / 11kV',
      capacity: '100 MVA',
      txIds: [3],
      status: 'CRITICAL'
    },
    {
      id: 'sub-3',
      name: 'Metro Central Terminal Substation',
      region: 'Metropolitan Core Hub',
      voltage: '230kV / 69kV',
      capacity: '200 MVA',
      txIds: [4],
      status: 'WARNING'
    },
    {
      id: 'sub-4',
      name: 'Lakeview Distribution Substation',
      region: 'Outer Ring Road Sector',
      voltage: '66kV / 11kV',
      capacity: '25 MVA',
      txIds: [5],
      status: 'OPERATIONAL'
    },
    {
      id: 'sub-5',
      name: 'Valley Hydro Generation Station',
      region: 'Western Hydro Basin',
      voltage: '500kV Step-Up',
      capacity: '450 MVA',
      txIds: [6],
      status: 'OPERATIONAL'
    },
    {
      id: 'sub-6',
      name: 'Apex Industrial Park Feeder',
      region: 'Southern Manufacturing Corridor',
      voltage: '115kV / 34.5kV',
      capacity: '80 MVA',
      txIds: [7],
      status: 'OPERATIONAL'
    },
    {
      id: 'sub-7',
      name: 'Yelahanka Substation · Bengaluru',
      region: 'Bengaluru North Urban Sector',
      voltage: '11 kV / 433 V',
      capacity: '10 MVA',
      txIds: [101],
      status: 'CRITICAL'
    },
    {
      id: 'sub-8',
      name: 'Indiranagar Substation · Bengaluru',
      region: 'Bengaluru East Commercial Sector',
      voltage: '11 kV / 433 V',
      capacity: '32 MVA',
      txIds: [102, 105, 107],
      status: 'CRITICAL'
    },
    {
      id: 'sub-9',
      name: 'Jayanagar Substation · Bengaluru',
      region: 'Bengaluru South Civic Sector',
      voltage: '11 kV / 433 V',
      capacity: '35 MVA',
      txIds: [103, 106, 108],
      status: 'WARNING'
    }
  ];

  // Strictly filter for Control Room Operator: only Substation 1 (Cascade & Kadugodi bays)
  const substationsList = isControlRoom
    ? allSubstations.filter(s => s.txIds.some(id => [1, 2, 3].includes(id)))
    : allSubstations;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>
              {isControlRoom ? 'Assigned Substation 1 (Control Unit 1)' : 'Substation Infrastructure Directory'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {isControlRoom
              ? 'Control Unit 1 transmission and distribution bays: Cascade North & Kadugodi Cluster'
              : 'Regional power transmission terminals, step-down stations & feeder bays across Greater Bengaluru'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            <strong>{substationsList.length}</strong> {isControlRoom ? 'Assigned Bays' : 'Active Stations'}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold">
            {isControlRoom ? '1 Hotspot Flagged' : '3 With Anomalies'}
          </span>
        </div>
      </div>

      {/* Grid of Substations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {substationsList.map((sub) => {
          const subTxs = safeTransformers.filter(t => sub.txIds.includes(t.id));
          const hasCritical = subTxs.some(t => t.status === 'CRITICAL' && !t.anomaly?.resolved);
          const hasWarning = subTxs.some(t => t.status === 'WARNING');

          return (
            <div 
              key={sub.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-4 hover:shadow-md ${
                hasCritical 
                  ? 'border-rose-300 ring-1 ring-rose-200' 
                  : hasWarning 
                  ? 'border-amber-300 ring-1 ring-amber-200' 
                  : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    {sub.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {sub.region}
                  </div>
                </div>

                {hasCritical ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3 text-rose-600" />
                    CRITICAL
                  </span>
                ) : hasWarning ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    ATTENTION
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    HEALTHY
                  </span>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Voltage Rating</span>
                  <span className="font-bold text-slate-800">{sub.voltage}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Total Capacity</span>
                  <span className="font-bold text-slate-800">{sub.capacity}</span>
                </div>
              </div>

              {/* Assets in this Substation */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Transformers ({subTxs.length})
                </span>

                <div className="space-y-1.5">
                  {subTxs.map(tx => (
                    <div 
                      key={tx.id}
                      onClick={() => onSelectTransformer(tx)}
                      className="p-2 rounded-lg bg-slate-50/70 hover:bg-blue-50 border border-slate-200/60 flex items-center justify-between cursor-pointer transition-colors text-xs font-mono group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          tx.status === 'CRITICAL' && !tx.anomaly?.resolved 
                            ? 'bg-rose-600 animate-pulse' 
                            : tx.status === 'WARNING' 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                        }`} />
                        <span className="font-semibold text-slate-800 group-hover:text-blue-700">{tx.code}</span>
                        <span className="text-slate-400 text-[10px]">({tx.busVoltage})</span>
                      </div>

                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
