import React, { useState } from 'react';
import { 
  Users, Wrench, CheckCircle2, ChevronDown, ChevronRight, 
  MapPin, Phone, ShieldCheck, AlertCircle, RefreshCw 
} from 'lucide-react';

export default function FieldEngineerDeploymentCard({
  deploymentState,
  onResolveAnomaly,
  isControlRoom = false
}) {
  const [expandedEngineer, setExpandedEngineer] = useState(1); // Default expand Mr. Raghavan as in sketch
  const [personnelList, setPersonnelList] = useState([
    {
      id: 1,
      name: 'Mr. Raghavan',
      status: 'Active',
      role: 'High-Voltage Diagnostic Engineer',
      badge: 'GW-FE-412',
      phone: '+91 (555) 019-4120',
      headedTo: 'Transformer 3 (Kadugodi) · ID: 21001',
      location: '#29, opp. market, Kadugodi - 100',
      targetTxIds: [3],
      reason: 'Sudden inductive current spike surge & rapid core hotspot evolution',
      progress: deploymentState?.status === 'Resolved' ? 'Anomaly Resolved' : 'Inspection in Progress (On-Site)',
      isResolved: deploymentState?.status === 'Resolved'
    },
    {
      id: 2,
      name: 'Rahul Sharma',
      status: 'Active',
      role: 'Grid Feeder Technician',
      badge: 'GW-FE-310',
      phone: '+91 (555) 019-3310',
      headedTo: 'Yelahanka Substation · BLR-1042',
      location: 'NH 44 North Bypass, Yelahanka',
      targetTxIds: [101],
      reason: 'Radiator fin thermal gradient and forced-air cooling check',
      progress: 'En Route (ETA 4 min)',
      isResolved: false
    },
    {
      id: 3,
      name: 'Devon Reed',
      role: 'Senior Diagnostic Specialist',
      status: 'Active',
      badge: 'GW-FE-414',
      phone: '+1 (555) 019-9182',
      headedTo: 'Transformer 1 & 2 (Cascade North 11A) · TX-01 / TX-02',
      location: 'Sector 11 Transmission Yard',
      targetTxIds: [1, 2],
      reason: '230kV inter-tie bus synchronization & auxiliary reserve bay check',
      progress: 'On-Site Diagnostic Clearance',
      isResolved: true
    },
    {
      id: 4,
      name: 'Amina Al-Mansoor',
      role: 'Transformer Fleet Specialist',
      status: 'Active',
      badge: 'GW-FE-415',
      phone: '+1 (555) 019-6612',
      headedTo: 'Metro Central Substation · TX-04',
      location: 'Sub-surface Vault 3, Central Hub',
      targetTxIds: [4],
      reason: 'Bushing C dielectric dissipation factor variance',
      progress: 'Scheduled On-Site 14:00 IST',
      isResolved: false
    }
  ]);

  // Strictly filter for Control Room Operator: only engineers actively dispatched to Control Unit 1 (TX-01, TX-02, TX-03)
  const displayedPersonnel = isControlRoom
    ? personnelList.filter(eng => eng.targetTxIds?.some(id => [1, 2, 3].includes(id)))
    : personnelList;

  const toggleExpand = (id) => {
    setExpandedEngineer(prev => (prev === id ? null : id));
  };

  const handleToggleStatus = (engId) => {
    if (engId === 1) {
      onResolveAnomaly(3);
    }
    setPersonnelList(prev => prev.map(eng => {
      if (eng.id === engId) {
        const nextResolved = !eng.isResolved;
        return {
          ...eng,
          isResolved: nextResolved,
          progress: nextResolved ? 'Anomaly Resolved' : 'Inspection in Progress (On-Site)'
        };
      }
      return eng;
    }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Wrench className="w-5 h-5 text-blue-600" />
          <h2 className="font-display font-bold text-lg text-slate-900 tracking-tight">
            Field Engineer Deployment Status
          </h2>
        </div>
        <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
          {isControlRoom ? 'Cluster 01 Local Roster' : 'Personnel Dispatch Card'}
        </span>
      </div>

      <p className="text-xs font-mono text-slate-500">
        {isControlRoom
          ? 'Active field teams dispatched to Control Unit 1 transformers (TX-01, TX-02, TX-03) · Filtered to local cluster'
          : 'Active field teams, real-time target transformer dispatch, operational reasons & resolution tracking'}
      </p>

      {/* Engineers Personnel List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {displayedPersonnel.map((eng) => {
          const isExpanded = expandedEngineer === eng.id;
          const isCurrentResolved = eng.id === 1 ? deploymentState?.status === 'Resolved' : eng.isResolved;

          return (
            <div 
              key={eng.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
            >
              {/* Personnel Summary Row */}
              <div 
                onClick={() => toggleExpand(eng.id)}
                className="p-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <span className="font-bold text-xs text-slate-900 font-display">
                      {eng.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {eng.role} ({eng.badge})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    eng.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {eng.status === 'Active' ? 'Active' : 'Not Active'}
                  </span>
                </div>
              </div>

              {/* Deployment Details Drawer (Expanded) */}
              {isExpanded && (
                <div className="p-3.5 space-y-3 bg-white border-t border-slate-100 font-mono text-xs">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Headed To Target:</span>
                      <span className="font-bold text-blue-700 block mt-0.5">{eng.headedTo}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{eng.location}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Progress:</span>
                      <span className={`font-bold block mt-0.5 ${
                        isCurrentResolved ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {isCurrentResolved ? 'Anomaly Resolved' : eng.progress}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Contact: {eng.phone}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Operational Reason:</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">
                      {eng.reason}
                    </p>
                  </div>

                  {/* Interactive Resolve Status Toggle */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Resolve Status: <strong className={isCurrentResolved ? 'text-emerald-700' : 'text-rose-700'}>
                        {isCurrentResolved ? 'Resolved' : 'Not done'}
                      </strong>
                    </span>

                    <button
                      onClick={() => handleToggleStatus(eng.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isCurrentResolved
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {isCurrentResolved ? 'Re-open Incident' : '✓ Mark Anomaly Resolved'}
                    </button>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
