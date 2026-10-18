import React, { useState } from 'react';
import { Users, Wrench, Phone, ShieldCheck, MapPin, CheckCircle2, Clock, Send } from 'lucide-react';

export default function FieldEngineersView({
  activeRole = 'admin'
}) {
  const isControlRoom = activeRole === 'control_room';
  const [dispatchedNotice, setDispatchedNotice] = useState('');

  const allEngineers = [
    {
      id: 1,
      name: 'Mr. Raghavan',
      role: 'High-Voltage Diagnostic Specialist',
      badge: 'GW-FE-412',
      phone: '+91 (555) 019-4120',
      location: 'Kadugodi Yard, Substation 1',
      assignedAsset: 'Kadugodi T3 (TX-03)',
      status: 'DEPLOYED ON-SITE',
      activeIncident: 'Current Spike & Dielectric Hotspot Triage',
      clearance: 'Level 4 High-Voltage Certified'
    },
    {
      id: 2,
      name: 'Devon Reed',
      role: 'Senior Diagnostic Field Engineer',
      badge: 'GW-FE-414',
      phone: '+1 (555) 019-9182',
      location: 'Cascade North Yard 11A',
      assignedAsset: 'Cascade Step-Down (TX-01)',
      status: 'AVAILABLE (ON STANDBY)',
      activeIncident: 'Routine Dissolved Gas Sampling',
      clearance: 'Level 5 Chief Diagnostic Authority'
    },
    {
      id: 3,
      name: 'Amina Al-Mansoor',
      role: 'Transformer Fleet Specialist',
      badge: 'GW-FE-415',
      phone: '+1 (555) 019-6612',
      location: 'Metro Central Sub-surface Vault',
      assignedAsset: 'Metro Incomer (TX-04)',
      status: 'SCHEDULED (14:00 IST)',
      activeIncident: 'Bushing C Insulation & Partial Discharge Inspection',
      clearance: 'Level 4 High-Voltage Certified'
    },
    {
      id: 4,
      name: 'Ravi Menon',
      role: 'Emergency Response Technician',
      badge: 'GW-FE-308',
      phone: '+91 (555) 019-3308',
      location: 'NH 44 North Sector',
      assignedAsset: 'Yelahanka Substation (BLR-1042)',
      status: 'EN ROUTE (ETA 6 MIN)',
      activeIncident: 'Thermal Overload Radiator Forced Air Verification',
      clearance: 'Level 3 Substation Field Clearance'
    },
    {
      id: 5,
      name: 'Sarah Chen',
      role: 'Senior Substation Control Operator',
      badge: 'GW-SO-209',
      phone: '+1 (555) 019-4321',
      location: 'Cascade Primary Control Bay',
      assignedAsset: 'Supervisory Control Unit 1',
      status: 'ACTIVE ON CONSOLE',
      activeIncident: 'Substation Switching & Breaker Interlock Clearance',
      clearance: 'Level 5 Grid Switching Clearance'
    }
  ];

  // Strictly filter for Control Room Operator: only engineers assigned to Control Unit 1 (Cascade & Kadugodi)
  const engineers = isControlRoom
    ? allEngineers.filter(e => e.id === 1 || e.id === 2 || e.id === 5)
    : allEngineers;

  const handleDispatch = (name) => {
    setDispatchedNotice(`Urgent dispatch alert transmitted to ${name}. ETA tracker initialized.`);
    setTimeout(() => setDispatchedNotice(''), 4500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>
              {isControlRoom ? 'Control Unit 1 · Assigned Field Response Team' : 'Field Diagnostic Engineering Fleet'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {isControlRoom 
              ? 'On-site diagnostic engineers and technicians for Substation 1 (Cascade North & Kadugodi Cluster)'
              : 'Certified high-voltage field technicians, emergency dispatch status & safety clearances'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            {engineers.length} {isControlRoom ? 'Assigned Engineers' : 'Engineers Active'}
          </span>
        </div>
      </div>

      {dispatchedNotice && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{dispatchedNotice}</span>
        </div>
      )}

      {/* Engineers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {engineers.map((eng) => (
          <div 
            key={eng.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  {eng.name}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {eng.role}
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                eng.status.includes('DEPLOYED') 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : eng.status.includes('EN ROUTE') 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {eng.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Badge ID:</span>
                <span className="font-bold text-slate-800">{eng.badge}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Location:</span>
                <span className="font-semibold text-slate-800">{eng.location}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Assigned Target:</span>
                <span className="font-bold text-blue-700">{eng.assignedAsset}</span>
              </div>
            </div>

            {/* Current Work Order */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Active Assignment
              </span>
              <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-mono">
                {eng.activeIncident}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{eng.phone}</span>
              </span>

              <button
                onClick={() => handleDispatch(eng.name)}
                className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold transition-colors inline-flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Dispatch</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
