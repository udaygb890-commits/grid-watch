import React from 'react';
import { 
  Activity, Map, AlertOctagon, Building2, Users, 
  Shield, LogOut, CheckCircle2, AlertTriangle, Zap, Radio, ChevronRight, Cpu, Layers,
  Compass, Wrench
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeRole,
  onSwitchRole,
  onLogout,
  currentUser,
  incidentCount = 6,
  onSelectTransformer,
  transformers = [],
  selectedTxId = 3
}) {
  const isControlRoom = activeRole === 'control_room';
  const isSubstationMgr = activeRole === 'substation_manager';
  const isFieldEngineer = activeRole === 'field_engineer';
  const isAdmin = !isControlRoom && !isSubstationMgr && !isFieldEngineer;

  // =========================================================================
  // 1. STRICT ROLE-BASED NAVIGATION PERMISSIONS (Zero feature bleed)
  // =========================================================================
  const navItems = isFieldEngineer ? [
    // Field Engineer: Emergency dispatch & on-site diagnostic actions
    { id: 'field_dispatch', label: 'Emergency Dispatch & GPS', icon: Compass, badge: incidentCount > 0 ? 1 : null, desc: 'Active ticket & Google Maps' },
    { id: 'field_diagnostics', label: 'On-Site Diagnostic Tools', icon: Wrench, badge: null, desc: 'Dielectric & breaker triage' }
  ] : isSubstationMgr ? [
    // Substation Manager: Strictly 2 items only. Strip out all global menus.
    { id: 'substation_selector', label: 'Transformer Select', icon: Cpu, badge: null, desc: 'Choose individual unit' },
    { id: 'substation_telemetry', label: 'Unit Telemetry & History', icon: Activity, badge: null, desc: 'Live waveforms & log' }
  ] : isControlRoom ? [
    // Control Room Operator: Strictly 3 items for localized operational cluster.
    { id: 'dashboard', label: 'Cluster Overview (3 Transformers)', icon: Map, badge: null, desc: 'Control Unit 1 topology' },
    { id: 'incidents', label: 'Cluster Incident Queue', icon: AlertOctagon, badge: incidentCount, desc: 'Control Unit 1 triage' },
    { id: 'engineers', label: 'Assigned Field Engineers', icon: Users, badge: null, desc: 'Cluster response team' }
  ] : [
    // Admin / Chief Engineer: Full access to all 4 global macro view menus.
    { id: 'dashboard', label: 'Network Map', icon: Map, badge: null, desc: 'City-wide grid topology' },
    { id: 'incidents', label: 'Incident Queue', icon: AlertOctagon, badge: incidentCount, desc: 'Priority anomaly triage' },
    { id: 'substations', label: 'Substations Directory', icon: Building2, badge: null, desc: 'Regional transmission bays' },
    { id: 'engineers', label: 'Field Engineers', icon: Users, badge: null, desc: 'Global personnel roster' }
  ];

  // Currently active transformer for Substation Manager focus card
  const activeMonitoredTx = transformers.find(t => t.id === selectedTxId) || transformers.find(t => t.id === 3) || transformers[0];
  const isTxCritical = activeMonitoredTx?.status === 'CRITICAL' && !activeMonitoredTx?.anomaly?.resolved;

  // Watchlist strictly scoped to Control Unit 1 for Control Room Operator; macro regional fleet for Admin
  const watchlistAssets = isControlRoom ? [
    { id: 3, code: 'TX-03', name: 'Kadugodi T3', temp: '94.8°C', load: '98.2%', status: 'CRITICAL' },
    { id: 1, code: 'TX-01', name: 'Cascade North', temp: '58.2°C', load: '68.4%', status: 'NORMAL' },
    { id: 2, code: 'TX-02', name: 'Cascade Reserve', temp: '51.5°C', load: '42.1%', status: 'NORMAL' }
  ] : [
    { id: 3, code: 'TX-03', name: 'Kadugodi T3', temp: '94.8°C', load: '98.2%', status: 'CRITICAL' },
    { id: 4, code: 'TX-04', name: 'Metro Incomer', temp: '76.5°C', load: '84.2%', status: 'WARNING' },
    { id: 101, code: 'BLR-1042', name: 'Yelahanka SS', temp: '94.8°C', load: '98.2%', status: 'CRITICAL' }
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 min-h-screen select-none">
      
      {/* Top Section */}
      <div className="space-y-4">
        
        {/* Brand Header */}
        <div className="p-6 pb-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/10 flex-shrink-0">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="font-header text-2xl tracking-wider font-extrabold text-slate-900 leading-none">
                GRID<span className="text-blue-600">WATCH</span>
              </div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block mt-1 font-semibold">
                Transformer Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Role Scope Indicator Pill */}
        <div className="px-4">
          <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center justify-between ${
            isFieldEngineer
              ? 'bg-amber-50/80 border-amber-300 text-amber-900'
              : isSubstationMgr 
              ? 'bg-blue-50/70 border-blue-200 text-blue-800'
              : isControlRoom
              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-800'
              : 'bg-purple-50/70 border-purple-200 text-purple-800'
          }`}>
            <span>
              {isFieldEngineer
                ? 'ROLE: FIELD ENGINEER'
                : isSubstationMgr 
                ? 'ROLE: SUBSTATION MANAGER' 
                : isControlRoom 
                ? 'ROLE: CONTROL ROOM OPERATOR' 
                : 'ROLE: ADMIN / CHIEF ENGINEER'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white font-extrabold shadow-2xs">
              {isFieldEngineer ? 'ON-SITE GPS' : isSubstationMgr ? '1 UNIT' : isControlRoom ? '3 UNITS' : 'ALL 7'}
            </span>
          </div>
        </div>

        {/* Main Navigation Menu */}
        <div className="px-4 space-y-2">
          <div className="text-xs font-mono uppercase text-slate-500 px-3 py-1 font-bold tracking-wider flex items-center justify-between">
            <span>Operations Menu</span>
            <span className="text-[10px] text-slate-400">{navItems.length} Menus</span>
          </div>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || 
                (item.id === 'substation_selector' && activeTab === 'substation_manager');

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/80 ring-1 ring-blue-500/20'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <div className="text-left">
                      <span className="block text-sm font-bold leading-tight">{item.label}</span>
                      <span className="block text-[11px] text-slate-400 font-mono font-normal">{item.desc}</span>
                    </div>
                  </div>

                  {item.badge !== null && item.badge > 0 && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold shadow-2xs ${
                      isActive ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MIDDLE SECTION: ROLE-SPECIFIC WORKSPACE CARDS                             */}
        {/* ========================================================================= */}

        {/* CASE A: Substation Manager -> Dedicated Single Monitored Asset Card */}
        {isSubstationMgr && (
          <div className="px-4 space-y-3">
            
            {/* Active Transformer Quick Status */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Monitored Asset</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isTxCritical ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isTxCritical ? 'CRITICAL' : 'NORMAL'}
                </span>
              </div>

              {/* Unit Info */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs text-slate-900">
                    {activeMonitoredTx?.code || 'TX-03'} · ID: {activeMonitoredTx?.id === 3 ? '21001' : `2100${activeMonitoredTx?.id}`}
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold">LIVE SYNC</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {activeMonitoredTx?.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {activeMonitoredTx?.address}
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px]">OIL TEMP</span>
                    <span className={`font-bold ${activeMonitoredTx?.oilTemp > 85 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {activeMonitoredTx?.oilTemp || 94.8}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">LOAD</span>
                    <span className="font-bold text-slate-800">
                      {activeMonitoredTx?.loadPct || 98.2}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Authority Badge */}
              <div className="text-[10px] font-mono text-slate-500 bg-blue-50/60 p-2 rounded-lg border border-blue-200/60 text-center">
                Authority: Single Individual Unit Supervision
              </div>
            </div>

          </div>
        )}

        {/* CASE B: Control Room Operator & Admin Health Score Card */}
        {!isSubstationMgr && (
          <div className="px-4">
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isControlRoom ? 'Control Unit 1 Health' : 'Fleet Health Score'}</span>
                </span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  {isControlRoom ? '66.7%' : '91.4%'}
                </span>
              </div>

              {/* Segmented Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full" 
                  style={{ width: isControlRoom ? '67%' : '88%' }} 
                  title={isControlRoom ? 'Healthy: 2' : 'Healthy: 219'} 
                />
                <div 
                  className="bg-amber-400 h-full" 
                  style={{ width: isControlRoom ? '0%' : '8%' }} 
                  title={isControlRoom ? 'Attention: 0' : 'Attention: 17'} 
                />
                <div 
                  className="bg-rose-500 h-full" 
                  style={{ width: isControlRoom ? '33%' : '4%' }} 
                  title={isControlRoom ? 'Critical: 1' : 'Critical: 6'} 
                />
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-center font-mono">
                <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-bold">NORMAL</span>
                  <span className="text-xs font-bold text-emerald-700">{isControlRoom ? '02' : '219'}</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-bold">WARN</span>
                  <span className="text-xs font-bold text-amber-700">{isControlRoom ? '00' : '17'}</span>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-bold">HIGH</span>
                  <span className="text-xs font-bold text-rose-700">{isControlRoom ? '01' : '06'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE C: Control Room Operator & Admin Watchlist */}
        {!isSubstationMgr && (
          <div className="px-4 space-y-2">
            <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
              <span>{isControlRoom ? 'Control Unit 1 Units' : 'Priority Asset Watchlist'}</span>
              <span className="text-[10px] text-slate-400">
                {isControlRoom ? '3 ASSIGNED' : '3 CRITICAL'}
              </span>
            </div>

            <div className="space-y-1.5">
              {watchlistAssets.map((asset) => {
                const isCrit = asset.status === 'CRITICAL';

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      if (onSelectTransformer) {
                        const found = transformers?.find(t => t.id === asset.id);
                        if (found) onSelectTransformer(found);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs font-mono group ${
                      isCrit 
                        ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 hover:border-rose-300' 
                        : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isCrit ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'}`} />
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-700">
                          {asset.code}
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {asset.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-extrabold ${isCrit ? 'text-rose-700' : 'text-amber-800'}`}>
                        {asset.temp}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Load: {asset.load}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Section: Operational Telemetry Badge & User Profile */}
      <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/70 mt-4">
        
        {/* Live Grid Sync Badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="leading-tight">
            <div className="font-bold text-emerald-900 text-xs">
              {isSubstationMgr 
                ? 'Unit Telemetry Synced' 
                : isControlRoom 
                ? 'Cluster 01 Synced' 
                : 'Grid Dispatch Synchronized'}
            </div>
            <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
              {isSubstationMgr 
                ? '50.00 Hz · 1.2 kHz Waveforms' 
                : isControlRoom 
                ? '50.01 Hz · 3 Units Active' 
                : '50.01 Hz · 248 Assets Active'}
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-extrabold flex items-center justify-center flex-shrink-0 shadow-2xs">
              {currentUser?.username?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.full_name || (isFieldEngineer ? 'Mr. Raghavan' : isSubstationMgr ? 'K. Balaji' : isControlRoom ? 'Marcus Vance' : 'Elena Rostova')}
              </div>
              <div className="text-[11px] text-slate-500 font-mono capitalize">
                {isFieldEngineer ? 'Field Engineer (HV Diagnostic)' : isSubstationMgr ? 'Substation Manager' : isControlRoom ? 'Control Room Operator' : 'Admin / Chief Engineer'}
              </div>
            </div>
          </div>

          <button
            onClick={onSwitchRole}
            title="Switch Workspace / Role"
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors flex-shrink-0"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>

        {/* Exit Session Button */}
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-3 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200/80 bg-white"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Session</span>
        </button>

      </div>
    </aside>
  );
}
