import React from 'react';
import { Shield, Bell, ArrowRight, Activity } from 'lucide-react';

export default function Header({
  activeRole = 'admin',
  onSwitchRole,
  currentUser,
  currentStep,
  setCurrentStep,
  criticalCount = 2,
  onOpenSimulationModal
}) {
  const isSubstationMgr = activeRole === 'substation_manager';
  const isControlRoom = activeRole === 'control_room';
  const isFieldEngineer = activeRole === 'field_engineer';

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin / Chief Engineer';
      case 'control_room':
        return 'Control Room Operator';
      case 'substation_manager':
        return 'Substation Manager';
      case 'field_engineer':
        return 'Field Engineer (Mr. Raghavan)';
      default:
        return 'Admin / Chief Engineer';
    }
  };

  const getScopeSubtitle = () => {
    if (isFieldEngineer) return 'MONDAY, 17 OCTOBER 2026 · FIELD ENGINEER DISPATCH & GPS ROUTING';
    if (isSubstationMgr) return 'MONDAY, 17 OCTOBER 2026 · SUBSTATION SUPERVISORY (SINGLE TRANSFORMER)';
    if (isControlRoom) return 'MONDAY, 17 OCTOBER 2026 · CONTROL UNIT 1 (3 TRANSFORMERS CLUSTER)';
    return 'MONDAY, 17 OCTOBER 2026 · REGIONAL DISPATCH (CITY-WIDE MACRO VIEW)';
  };

  const getDefaultFirstName = () => {
    if (isFieldEngineer) return 'Mr. Raghavan';
    if (isSubstationMgr) return 'K.';
    if (isControlRoom) return 'Marcus';
    return 'Elena';
  };

  const handleNotificationClick = () => {
    if (!setCurrentStep) return;
    if (isFieldEngineer) {
      setCurrentStep('field_dispatch');
    } else if (isSubstationMgr) {
      setCurrentStep('substation_telemetry');
    } else {
      setCurrentStep('incidents');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      
      {/* Left: Date & Welcome Headline */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
          {getScopeSubtitle()}
        </div>
        <h1 className="text-xl font-bold font-display text-slate-900 mt-0.5 flex items-center gap-2">
          <span>Good morning, {currentUser?.full_name?.split(' ')[0] || getDefaultFirstName()}</span>
          <span className="text-amber-500 text-sm">✦</span>
        </h1>
      </div>

      {/* Right: Actions, Notifications & Role Indicator */}
      <div className="flex items-center gap-3">
        
        {/* Universal AI Anomaly Simulation Control Trigger */}
        {onOpenSimulationModal && (
          <button
            onClick={onOpenSimulationModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-mono font-bold shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            title="Open AI Anomaly Simulation & Autonomous Response Engine"
          >
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
            <span className="font-semibold">⚡ AI Simulation Engine</span>
          </button>
        )}

        {/* Live Grid Sync Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-medium">
            {isSubstationMgr ? '50.00 Hz · Single Unit Telemetry' : isControlRoom ? '50.01 Hz · Cluster 01 Synced' : '50.01 Hz · Live Telemetry'}
          </span>
        </div>

        {/* Notifications Icon Button (Navigates to role-appropriate telemetry or incidents) */}
        <button
          onClick={handleNotificationClick}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 transition-colors"
          title={isSubstationMgr ? 'Unit Telemetry & Incident Logs' : 'Priority Incident Queue'}
        >
          <Bell className="w-4 h-4" />
          {criticalCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Current Workspace Role Indicator */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
              WORKSPACE
            </span>
            <span className="text-xs font-bold text-slate-900 font-display">
              {getRoleDisplayName(activeRole)}
            </span>
          </div>

          <button
            onClick={onSwitchRole}
            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 flex items-center gap-1 transition-colors"
          >
            <span>Switch</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

    </header>
  );
}
