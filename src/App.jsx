import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ControlUnitDashboard from './components/ControlUnitDashboard';
import SubstationInspector from './components/SubstationInspector';
import IncidentQueue from './components/IncidentQueue';
import SubstationsView from './components/SubstationsView';
import FieldEngineersView from './components/FieldEngineersView';
import SubstationManagerView from './components/SubstationManagerView';
import FieldEngineerPortal from './components/FieldEngineerPortal';
import RoleSelection from './components/RoleSelection';
import AnomalySimulationModal from './components/AnomalySimulationModal';
import { initialTransformers, controlUnitsConfig, demoCredentials } from './data/gridData';

export default function App() {
  const [activeTab, setActiveTab] = useState('auth');
  const [activeRole, setActiveRole] = useState('admin');
  const [currentUser, setCurrentUser] = useState({
    username: 'admin.gridwatch',
    role: 'admin',
    full_name: 'Elena Rostova (Chief Security Officer)'
  });
  const [transformers, setTransformers] = useState(initialTransformers);
  const [controlUnits, setControlUnits] = useState(controlUnitsConfig);
  const [selectedTransformer, setSelectedTransformer] = useState(initialTransformers[2]); // Default Kadugodi T3
  const [substationTxId, setSubstationTxId] = useState(3); // Default Kadugodi T3 for Substation Manager
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [customLogs, setCustomLogs] = useState({});
  const [deploymentState, setDeploymentState] = useState({
    engineer: 'Mr. Raghavan',
    target: 'Transformer 3 (Kadugodi)',
    reason: 'Abnormal DGA gas evolution & thermal hotspot',
    status: 'Not done'
  });

  // Fetch initial telemetry from backend if available
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const res = await fetch('/api/admin/network-telemetry');
        if (res.ok) {
          const data = await res.json();
          if (data && data.deployment) {
            setDeploymentState(data.deployment);
          }
        }
      } catch (err) {
        // Fallback local state active
      }
    };
    fetchBackendData();
  }, []);

  // Strict role permissions & access control guard to prevent any feature bleed
  useEffect(() => {
    if (activeRole === 'field_engineer') {
      // Field Engineer: Strictly 'field_dispatch' or 'field_diagnostics'
      if (!['field_dispatch', 'field_diagnostics'].includes(activeTab) && activeTab !== 'auth') {
        setActiveTab('field_dispatch');
      }
    } else if (activeRole === 'substation_manager') {
      // Substation Manager: Strictly 'substation_selector', 'substation_telemetry', 'substation_manager'
      if (!['substation_selector', 'substation_telemetry', 'substation_manager'].includes(activeTab) && activeTab !== 'auth') {
        setActiveTab('substation_selector');
      }
    } else if (activeRole === 'control_room') {
      // Control Room Operator: 'dashboard', 'incidents', 'engineers'
      if (!['dashboard', 'incidents', 'engineers'].includes(activeTab) && activeTab !== 'auth') {
        setActiveTab('dashboard');
      }
    } else if (activeRole === 'admin') {
      // Admin: 'dashboard', 'incidents', 'substations', 'engineers', 'inspector'
      if (['substation_selector', 'substation_telemetry', 'substation_manager', 'field_dispatch', 'field_diagnostics'].includes(activeTab) && activeTab !== 'auth') {
        setActiveTab('dashboard');
      }
    }
  }, [activeRole, activeTab]);

  const handleLoginSuccess = ({ role, user }) => {
    setActiveRole(role);
    if (user) {
      setCurrentUser(user);
    }
    if (role === 'field_engineer') {
      setActiveTab('field_dispatch');
    } else if (role === 'substation_manager') {
      setActiveTab('substation_selector');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleSelectTransformer = (tx) => {
    if (activeRole === 'admin') {
      setSelectedTransformer(tx);
      setActiveTab('inspector');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResolveAnomaly = async (txId) => {
    const currentTx = transformers.find(t => t.id === txId);
    const currentlyResolved = currentTx?.anomaly?.resolved;
    const newResolvedState = !currentlyResolved;

    setTransformers(prev => prev.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          status: newResolvedState ? 'RESOLVED' : 'CRITICAL',
          anomaly: t.anomaly ? { ...t.anomaly, resolved: newResolvedState } : null
        };
      }
      return t;
    }));

    if (txId === 3) {
      setDeploymentState(prev => ({
        ...prev,
        status: newResolvedState ? 'Resolved' : 'Not done'
      }));
    }

    try {
      await fetch('/api/admin/resolve-anomaly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomalyId: txId === 3 ? 1 : txId,
          newStatus: newResolvedState ? 'Resolved' : 'Critical'
        })
      });
    } catch (e) {
      // Local state handled optimistically
    }
  };

  const handleRerouteLoad = (txId) => {
    setTransformers(prev => prev.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          loadPct: 56.4,
          oilTemp: 78.2,
          loadCurrent: '520 A'
        };
      }
      return t;
    }));
  };

  const handleToggleBreaker = (txId, newStatus) => {
    setTransformers(prev => prev.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          breakerStatus: newStatus
        };
      }
      return t;
    }));
  };

  // Autonomous AI Anomaly Simulation & Response Engine Execution
  const handleSimulateAnomaly = ({ txId, anomalyType, severity, config }) => {
    const targetTx = transformers.find(t => t.id === txId) || transformers[0];
    const isSevere = severity === 'severe';

    // 1. Update Transformer telemetry, breaker status, status & structured anomaly object
    setTransformers(prev => prev.map(t => {
      if (t.id === txId) {
        return {
          ...t,
          status: config.telemetryEffect.status,
          loadCurrent: config.telemetryEffect.loadCurrent,
          busVoltage: config.telemetryEffect.busVoltage,
          breakerStatus: config.telemetryEffect.breakerStatus,
          loadPct: config.telemetryEffect.loadPct,
          oilTemp: config.telemetryEffect.oilTemp,
          windingTemp: config.telemetryEffect.windingTemp,
          anomaly: {
            id: Date.now(),
            title: config.title,
            type: anomalyType === 'type_a' ? 'Current Spike (Phase B Overload)' : anomalyType === 'type_b' ? 'High-Voltage Transient Line Surge' : 'Thermal Hotspot Breakdown',
            category: anomalyType,
            severity: isSevere ? 'CRITICAL' : 'WARNING',
            rootCause: config.rootCause,
            immediateAction: config.systemAction,
            furtherActions: config.furtherAction,
            fieldEngineer: config.engineer,
            confidence: 99.4,
            detectedAt: 'Today, 09:14 IST',
            resolved: false
          }
        };
      }
      return t;
    }));

    // 2. Autonomous field crew deployment state update
    setDeploymentState({
      engineer: config.engineer,
      target: `Transformer ${txId} (${targetTx.name})`,
      reason: config.rootCause,
      status: isSevere ? 'Autonomous Dispatch Active' : 'Scheduled / Monitored'
    });

    // 3. Update cascading status logs with exact 4-step sequence:
    // [Anomaly detected -> AI classification -> Autonomous action taken -> Field engineer dispatched]
    const dateStr = '18/10/2026, ';
    const stepLogs = [
      {
        time: `${dateStr}09:14:02 IST`,
        event: `[STEP 1: ANOMALY DETECTED] ${config.trigger} on ${targetTx.code} (${targetTx.name}).`,
        type: isSevere ? 'critical' : 'warning'
      },
      {
        time: `${dateStr}09:14:04 IST`,
        event: `[STEP 2: AI CLASSIFICATION] Grid Hunter AI classified fault as "${config.title}" (Confidence: 99.4%). Root cause: ${config.rootCause}`,
        type: 'warning'
      },
      {
        time: `${dateStr}09:14:05 IST`,
        event: `[STEP 3: AUTONOMOUS ACTION TAKEN] ${config.systemAction}`,
        type: 'action'
      },
      {
        time: `${dateStr}09:14:15 IST`,
        event: `[STEP 4: FIELD ENGINEER DISPATCHED] ${config.furtherAction}`,
        type: 'deploy'
      }
    ];

    setCustomLogs(prev => ({
      ...prev,
      [txId]: [...stepLogs, ...(prev[txId] || [])]
    }));

    // Automatically synchronize Substation Manager active transformer
    setSubstationTxId(txId);
    setSelectedTransformer(prev => prev?.id === txId ? { ...prev, ...config.telemetryEffect } : prev);
  };

  // Full reset back to nominal grid baseline
  const handleResetSimulation = () => {
    setTransformers(initialTransformers);
    setCustomLogs({});
    setDeploymentState({
      engineer: 'Mr. Raghavan',
      target: 'Transformer 3 (Kadugodi)',
      reason: 'Abnormal DGA gas evolution & thermal hotspot',
      status: 'Not done'
    });
  };

  const handleLogout = () => {
    setActiveTab('auth');
  };

  const criticalCount = transformers.filter(t => t.status === 'CRITICAL' && !t.anomaly?.resolved).length;
  const activeIncidentCount = transformers.filter(t => t.anomaly && !t.anomaly.resolved).length;

  // If user is on Auth screen
  if (activeTab === 'auth') {
    return (
      <RoleSelection
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onLoginSuccess={handleLoginSuccess}
        onSkipToDashboard={() => setActiveTab(activeRole === 'field_engineer' ? 'field_dispatch' : activeRole === 'substation_manager' ? 'substation_selector' : 'dashboard')}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      
      {/* 1. Left Sidebar Navigation (Strictly isolated by role permissions) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        onSwitchRole={() => setActiveTab('auth')}
        onLogout={handleLogout}
        currentUser={currentUser}
        incidentCount={activeRole === 'control_room' ? transformers.filter(t => [1, 2, 3].includes(t.id) && t.anomaly && !t.anomaly.resolved).length : activeIncidentCount}
        transformers={transformers}
        onSelectTransformer={handleSelectTransformer}
        selectedTxId={substationTxId}
      />

      {/* 2. Main Application Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar Header */}
        <Header
          activeRole={activeRole}
          onSwitchRole={() => setActiveTab('auth')}
          currentUser={currentUser}
          currentStep={activeTab}
          setCurrentStep={setActiveTab}
          criticalCount={activeRole === 'control_room' ? transformers.filter(t => [1, 2, 3].includes(t.id) && t.status === 'CRITICAL' && !t.anomaly?.resolved).length : criticalCount}
          onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
        />

        {/* Content Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          
          {/* View 1: Network Map / Cluster Overview (Admin: City-wide / Control Room: Local 3 units only) */}
          {activeTab === 'dashboard' && activeRole !== 'substation_manager' && activeRole !== 'field_engineer' && (
            <ControlUnitDashboard
              transformers={transformers}
              onSelectTransformer={handleSelectTransformer}
              onResolveAnomaly={handleResolveAnomaly}
              onRerouteLoad={handleRerouteLoad}
              activeRole={activeRole}
              controlUnits={controlUnits}
              deploymentState={deploymentState}
              onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
              customLogs={customLogs}
            />
          )}

          {/* View 2: Incident Queue (Admin: City-wide / Control Room: Local 3 units only) */}
          {activeTab === 'incidents' && activeRole !== 'substation_manager' && activeRole !== 'field_engineer' && (
            <IncidentQueue
              transformers={activeRole === 'control_room' ? transformers.filter(t => [1, 2, 3].includes(t.id)) : transformers}
              onSelectTransformer={handleSelectTransformer}
              onResolveAnomaly={handleResolveAnomaly}
              activeRole={activeRole}
            />
          )}

          {/* View 3: Substation Manager Dedicated View (Transformer Select OR Unit Telemetry & History) */}
          {(activeTab === 'substation_selector' || activeTab === 'substation_telemetry' || activeTab === 'substation_manager') && activeRole === 'substation_manager' && (
            <SubstationManagerView
              transformers={transformers}
              onResolveAnomaly={handleResolveAnomaly}
              onRerouteLoad={handleRerouteLoad}
              onToggleBreaker={handleToggleBreaker}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedTxId={substationTxId}
              setSelectedTxId={setSubstationTxId}
            />
          )}

          {/* View 4: Substations Directory (Admin Only!) */}
          {activeTab === 'substations' && activeRole === 'admin' && (
            <SubstationsView
              transformers={transformers}
              onSelectTransformer={handleSelectTransformer}
              activeRole={activeRole}
            />
          )}

          {/* View 5: Field Engineers Fleet (Admin: City-wide / Control Room: Local 3 units only) */}
          {activeTab === 'engineers' && activeRole !== 'substation_manager' && activeRole !== 'field_engineer' && (
            <FieldEngineersView activeRole={activeRole} />
          )}

          {/* View 6: Substation Inspector (Admin only) */}
          {activeTab === 'inspector' && activeRole === 'admin' && (
            <SubstationInspector
              transformer={selectedTransformer}
              onBack={() => setActiveTab('dashboard')}
              onResolveAnomaly={handleResolveAnomaly}
              onRerouteLoad={handleRerouteLoad}
              onToggleBreaker={handleToggleBreaker}
            />
          )}

          {/* View 7: Dedicated Field Engineer Portal (Mr. Raghavan Direct Dispatch & Google Maps Routing) */}
          {(activeRole === 'field_engineer' || activeTab === 'field_dispatch' || activeTab === 'field_diagnostics') && (
            <FieldEngineerPortal
              transformers={transformers}
              onResolveAnomaly={handleResolveAnomaly}
              onRerouteLoad={handleRerouteLoad}
              onToggleBreaker={handleToggleBreaker}
              deploymentState={deploymentState}
            />
          )}

        </main>

        {/* Crisp Light-Themed Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>GRIDWATCH AI TELEMETRY · SUBSTATION POWER INTELLIGENCE</span>
            <span className="text-slate-400">GREATER BENGALURU REGIONAL GRID · 248 ASSETS MONITORED</span>
          </div>
        </footer>

      </div>

      {/* Interactive AI Anomaly Simulation & Autonomous Response Engine Modal */}
      <AnomalySimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        transformers={transformers}
        onSimulateAnomaly={handleSimulateAnomaly}
        onResetSimulation={handleResetSimulation}
      />

    </div>
  );
}
