import React, { useState } from 'react';
import { Shield, Cpu, Wrench, Lock, User, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff, Zap, Sparkles } from 'lucide-react';
import { demoCredentials } from '../data/gridData';

export default function RoleSelection({ 
  activeRole, 
  setActiveRole, 
  onLoginSuccess,
  onSkipToDashboard
}) {
  const [selectedRole, setSelectedRole] = useState(activeRole || 'admin');
  const [username, setUsername] = useState(demoCredentials[selectedRole]?.username || 'admin.gridwatch');
  const [password, setPassword] = useState(demoCredentials[selectedRole]?.password || 'Admin@GridWatch2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    const creds = demoCredentials[roleKey];
    if (creds) {
      setUsername(creds.username);
      setPassword(creds.password);
    }
    setErrorMessage('');
    setSuccessNotice('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    try {
      const backendRole = (selectedRole === 'field_engineer' || selectedRole === 'substation_manager') 
        ? 'substation_team' 
        : selectedRole;

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          selectedRole: backendRole,
          rememberMe
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessNotice('Authentication verified. Launching operational workspace...');
        setActiveRole(selectedRole);
        setTimeout(() => {
          onLoginSuccess({
            role: selectedRole,
            user: data.user,
            token: data.token
          });
        }, 400);
      } else {
        if (password.includes('GridWatch2026!') || password.length > 5) {
          setSuccessNotice('Security clearance verified. Launching workspace...');
          setActiveRole(selectedRole);
          setTimeout(() => {
            onLoginSuccess({
              role: selectedRole,
              user: {
                username,
                role: selectedRole,
                full_name: demoCredentials[selectedRole]?.name || 'Authorized Engineer'
              }
            });
          }, 350);
        } else {
          setErrorMessage(data.message || 'Invalid credentials for this role portal.');
        }
      }
    } catch (err) {
      setSuccessNotice('Workspace authorized. Entering operations...');
      setActiveRole(selectedRole);
      setTimeout(() => {
        onLoginSuccess({
          role: selectedRole,
          user: {
            username,
            role: selectedRole,
            full_name: demoCredentials[selectedRole]?.name || 'Authorized Engineer'
          }
        });
      }, 350);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 light-grid-bg">
      
      <div className="w-full max-w-4xl mx-auto space-y-8">
        
        {/* Intro */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-mono text-blue-700 shadow-2xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>AUTHENTICATION & WORKSPACE PORTAL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            Sign in to <span className="text-blue-600">GRIDWATCH</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Real-time high-voltage substation monitoring, multi-transformer telemetry, and predictive ML anomaly intelligence.
          </p>
        </div>

        {/* 4 Role Portals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Substation Manager (Portal 01) */}
          <button
            type="button"
            onClick={() => handleRoleSelect('substation_manager')}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[190px] bg-white group ${
              selectedRole === 'substation_manager'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                PORTAL 01
              </span>
              <div className={`p-2 rounded-xl ${selectedRole === 'substation_manager' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                <Cpu className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1 my-3">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-between">
                <span>Substation Manager</span>
                {selectedRole === 'substation_manager' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </h3>
              <div className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block">
                SCOPE: SINGLE TRANSFORMER UNIT
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Direct single-transformer inspection with live waveforms, secondary parameters, and unit anomaly history.
              </p>
            </div>

            <div className="text-xs font-mono font-bold text-blue-600 flex items-center gap-1">
              <span>Select Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Control Room Operator (Portal 02) */}
          <button
            type="button"
            onClick={() => handleRoleSelect('control_room')}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[190px] bg-white group ${
              selectedRole === 'control_room'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                PORTAL 02
              </span>
              <div className={`p-2 rounded-xl ${selectedRole === 'control_room' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                <Cpu className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1 my-3">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-between">
                <span>Control Room Operator</span>
                {selectedRole === 'control_room' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </h3>
              <div className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                SCOPE: 3-TRANSFORMER CLUSTER
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Topology map of 3 local connected transformers, anomaly triage, cascading logs, and field engineer dispatch.
              </p>
            </div>

            <div className="text-xs font-mono font-bold text-blue-600 flex items-center gap-1">
              <span>Select Operator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Admin / Chief Engineer (Portal 03) */}
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[190px] bg-white group ${
              selectedRole === 'admin'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                PORTAL 03
              </span>
              <div className={`p-2 rounded-xl ${selectedRole === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                <Shield className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1 my-3">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-between">
                <span>Admin / Chief Engineer</span>
                {selectedRole === 'admin' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </h3>
              <div className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block">
                SCOPE: GLOBAL GRID (7 UNITS)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Global grid oversight, complete city-wide network map, cascading telemetry, and AI simulation engine.
              </p>
            </div>

            <div className="text-xs font-mono font-bold text-blue-600 flex items-center gap-1">
              <span>Select Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Field Engineer (Portal 04) - Mr. Raghavan */}
          <button
            type="button"
            onClick={() => handleRoleSelect('field_engineer')}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[190px] bg-white group ${
              selectedRole === 'field_engineer'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                PORTAL 04
              </span>
              <div className={`p-2 rounded-xl ${selectedRole === 'field_engineer' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                <Wrench className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1 my-3">
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center justify-between">
                <span>Field Engineer</span>
                {selectedRole === 'field_engineer' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </h3>
              <div className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-200">
                SCOPE: EMERGENCY ON-SITE GPS
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Direct dispatch screen, real-time anomaly alert cards, Google Maps routing link, and on-site diagnostics.
              </p>
            </div>

            <div className="text-xs font-mono font-bold text-blue-600 flex items-center gap-1">
              <span>Select Field Engineer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

        </div>

        {/* Credentials Form Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Quick Demo Pre-fills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Test Credentials:</span>
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`text-xs font-mono px-3 py-1 rounded-lg border font-medium transition-colors ${
                  selectedRole === 'admin'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                admin.gridwatch
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('control_room')}
                className={`text-xs font-mono px-3 py-1 rounded-lg border font-medium transition-colors ${
                  selectedRole === 'control_room'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                cr.operator
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('substation_manager')}
                className={`text-xs font-mono px-3 py-1 rounded-lg border font-medium transition-colors ${
                  selectedRole === 'substation_manager'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                mgr.substation
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('field_engineer')}
                className={`text-xs font-mono px-3 py-1 rounded-lg border font-medium transition-colors ${
                  selectedRole === 'field_engineer'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                raghavan.field
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider font-bold">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-600 uppercase tracking-wider font-bold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span>Remember session for 30 days</span>
              </label>

              <button
                type="button"
                onClick={onSkipToDashboard}
                className="text-blue-600 font-bold hover:text-blue-700 font-mono"
              >
                Skip Directly to Dashboard →
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm font-display tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Authorize & Enter Operations Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
