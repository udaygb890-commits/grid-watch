import React, { useState } from 'react';
import StatsBar from './StatsBar';
import NetworkGraph from './NetworkGraph';
import AnomalyAlertList from './AnomalyAlertList';
import CascadingStatusLogs from './CascadingStatusLogs';
import FieldEngineerDeploymentCard from './FieldEngineerDeploymentCard';
import TransformerInspectorModal from './TransformerInspectorModal';
import AnomalyDetailsModal from './AnomalyDetailsModal';
import { initialTransformers, controlUnitsConfig } from '../data/gridData';

export default function ControlUnitDashboard({
  transformers = initialTransformers,
  onResolveAnomaly = () => {},
  onRerouteLoad = () => {},
  activeRole = 'admin',
  controlUnits = controlUnitsConfig,
  deploymentState = {},
  onOpenSimulationModal,
  customLogs = {}
}) {
  const isControlRoom = activeRole === 'control_room';

  // Defensive array guards
  const safeTransformers = Array.isArray(transformers) && transformers.length > 0
    ? transformers
    : initialTransformers;

  const safeControlUnits = Array.isArray(controlUnits) && controlUnits.length > 0
    ? controlUnits
    : controlUnitsConfig;

  // Scoped assets: Control Room Operator manages a localized cluster of 3 connected transformers
  const activeTransformers = isControlRoom 
    ? safeTransformers.filter(t => [1, 2, 3].includes(t.id))
    : safeTransformers;

  const activeControlUnits = isControlRoom
    ? safeControlUnits.filter(u => u.id === 'unit-1')
    : safeControlUnits;

  // Modal states
  const [selectedTxForModal, setSelectedTxForModal] = useState(null);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);

  const [selectedAnomalyForModal, setSelectedAnomalyForModal] = useState(null);
  const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);

  // Open Live Telemetry Inspector Modal
  const handleOpenInspector = (tx) => {
    setSelectedTxForModal(tx);
    setIsInspectorModalOpen(true);
  };

  // Open Anomaly Details Modal
  const handleOpenAnomaly = (anomalyObj) => {
    setSelectedAnomalyForModal(anomalyObj);
    setIsAnomalyModalOpen(true);
  };

  const highRiskCount = activeTransformers.filter(t => t.status === 'CRITICAL' && !t.anomaly?.resolved).length;
  const attentionCount = isControlRoom ? 0 : safeTransformers.filter(t => t.status === 'WARNING').length;
  const healthyCount = isControlRoom 
    ? activeTransformers.filter(t => t.status === 'NORMAL' || t.status === 'RESOLVED' || t.anomaly?.resolved).length
    : safeTransformers.filter(t => t.status === 'NORMAL' || t.status === 'RESOLVED' || t.anomaly?.resolved).length + 212;

  return (
    <div className="space-y-6">
      
      {/* Control Room Operator Cluster Scope Banner */}
      {isControlRoom && (
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                CONTROL ROOM OPERATOR CONSOLE · CLUSTER 01 SCOPE
              </span>
              <h2 className="text-lg font-bold font-display text-slate-900 mt-0.5">
                Localized Substation Cluster (3 Connected Transformers)
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Supervisory inter-tie bus routing, localized anomaly triage & field crew deployment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Units: TX-01 (500kV) · TX-02 (230kV) · TX-03 (230kV)
            </span>
            {onOpenSimulationModal && (
              <button
                onClick={onOpenSimulationModal}
                className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>⚡ Simulate Anomaly</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Metrics Summary Cards */}
      <StatsBar
        totalCount={isControlRoom ? 3 : 248}
        highRiskCount={highRiskCount}
        attentionCount={attentionCount}
        healthyCount={healthyCount}
        scopeLabel={isControlRoom ? 'Local Cluster 01 · 3 Connected Units' : 'Greater Bengaluru Grid · 248 assets monitored'}
      />

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN SECTION: (Left: Anomaly Alert List / Right: Network Map)  */}
      {/* Direct match to reference screenshot                                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Anomaly Alert List */}
        <div className="lg:col-span-5">
          <AnomalyAlertList
            transformers={activeTransformers}
            onOpenAnomalyModal={handleOpenAnomaly}
          />
        </div>

        {/* Right Column: Transformer Network Map */}
        <div className="lg:col-span-7">
          <NetworkGraph
            transformers={activeTransformers}
            onOpenInspectorModal={handleOpenInspector}
            isClusterOnly={isControlRoom}
            activeRole={activeRole}
          />
        </div>

      </div>

      {/* ======================================================================================= */}
      {/* LOWER SECTION: (Left: Cascading Status Logs / Right: Field Engineer Deployment Tracker) */}
      {/* ======================================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Bottom-Left Section: Cascading Status Logs */}
        <div className="lg:col-span-7">
          <CascadingStatusLogs
            controlUnits={activeControlUnits}
            transformers={activeTransformers}
            onSelectTransformer={handleOpenInspector}
            isControlRoom={isControlRoom}
            selectedCluster="unit-1"
            customLogs={customLogs}
          />
        </div>

        {/* Bottom-Right Section: Field Engineer Deployment Status */}
        <div className="lg:col-span-5">
          <FieldEngineerDeploymentCard
            deploymentState={deploymentState}
            onResolveAnomaly={onResolveAnomaly}
            isControlRoom={isControlRoom}
          />
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL I: Transformer Inspector Modal (Clicking any transformer node)     */}
      {/* ========================================================================= */}
      <TransformerInspectorModal
        transformer={selectedTxForModal}
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
      />

      {/* ========================================================================= */}
      {/* MODAL II: Anomaly Details Modal (Clicking "View Details" on anomaly card) */}
      {/* ========================================================================= */}
      <AnomalyDetailsModal
        anomalyData={selectedAnomalyForModal}
        isOpen={isAnomalyModalOpen}
        onClose={() => setIsAnomalyModalOpen(false)}
        onToggleResolve={(txId) => {
          onResolveAnomaly(txId);
          setIsAnomalyModalOpen(false);
        }}
        onRerouteLoad={onRerouteLoad}
      />

    </div>
  );
}
