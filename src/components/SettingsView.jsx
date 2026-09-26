import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Globe, 
  Terminal, 
  RefreshCw, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Sliders,
  FileCode
} from 'lucide-react';
import { 
  getPolicyForOrigin, 
  savePolicyForOrigin, 
  resetPolicyForOrigin, 
  getAllWebsitePolicies,
  DEFAULT_RULES,
  PRIVACY_MODES
} from '../core/policies.js';
import { getEvents, clearEvents } from '../core/eventLog.js';

export default function SettingsView({ 
  isProtected, 
  setIsProtected, 
  privacyMode, 
  setPrivacyMode,
  activeTabOrigin,
  onPolicyUpdated 
}) {
  const [activeSubSection, setActiveSubSection] = useState('rules'); // 'rules' | 'policies' | 'events' | 'about'
  const [selectedOrigin, setSelectedOrigin] = useState(activeTabOrigin || "isro-portal.local");
  const [currentPolicy, setCurrentPolicy] = useState(() => getPolicyForOrigin(activeTabOrigin || "isro-portal.local"));
  const [policySaveStatus, setPolicySaveStatus] = useState(null);
  const [eventsList, setEventsList] = useState(() => getEvents());
  const [selectedEventFilter, setSelectedEventFilter] = useState('ALL');

  const allConfiguredPolicies = getAllWebsitePolicies();

  const handleOriginChange = (orig) => {
    setSelectedOrigin(orig);
    setCurrentPolicy(getPolicyForOrigin(orig));
    setPolicySaveStatus(null);
  };

  const handleRuleActionChange = (field, action) => {
    // CRITICAL guard: Cannot weaken passwords or API keys
    if (field === 'password' || field === 'apiKey') {
      return; // Locked to BLOCK
    }
    setCurrentPolicy(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [field]: action
      }
    }));
  };

  const handleSavePolicy = () => {
    savePolicyForOrigin(selectedOrigin, currentPolicy);
    setPolicySaveStatus("Policy saved successfully and enforced on-device.");
    if (onPolicyUpdated) {
      onPolicyUpdated(selectedOrigin);
    }
    setTimeout(() => setPolicySaveStatus(null), 3000);
  };

  const handleResetPolicy = () => {
    const def = resetPolicyForOrigin(selectedOrigin);
    setCurrentPolicy(def);
    setPolicySaveStatus("Reset policy to standard prototype defaults.");
    if (onPolicyUpdated) {
      onPolicyUpdated(selectedOrigin);
    }
    setTimeout(() => setPolicySaveStatus(null), 3000);
  };

  const refreshEvents = () => {
    setEventsList(getEvents());
  };

  const filteredEvents = eventsList.filter(evt => {
    if (selectedEventFilter === 'ALL') return true;
    return evt.type === selectedEventFilter;
  });

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-6 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            AI Privacy Firewall — Settings & Configuration
          </h2>
          <p className="text-xs text-slate-400">
            Manage on-device protection parameters, user-approved website policies, and background audit logs.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center overflow-x-auto bg-[#070a12] border border-slate-800 p-1 rounded font-mono text-xs gap-1 scrollbar-none">
          <button
            onClick={() => setActiveSubSection('rules')}
            className={`px-2.5 sm:px-3 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeSubSection === 'rules' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Data Rules
          </button>
          <button
            onClick={() => setActiveSubSection('policies')}
            className={`px-2.5 sm:px-3 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeSubSection === 'policies' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Policies
          </button>
          <button
            onClick={() => {
              setActiveSubSection('events');
              refreshEvents();
            }}
            className={`px-2.5 sm:px-3 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeSubSection === 'events' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Event Log
          </button>
          <button
            onClick={() => setActiveSubSection('about')}
            className={`px-2.5 sm:px-3 py-1 rounded transition-colors whitespace-nowrap shrink-0 ${
              activeSubSection === 'about' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            About
          </button>
        </div>
      </div>

      {/* SUBSECTION 1: GLOBAL PROTECTION & DATA RULES */}
      {activeSubSection === 'rules' && (
        <div className="space-y-6">
          {/* Master Toggle & Mode */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-[#0a0e17] border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Firewall Protection State:</span>
                <span className="text-[11px] text-slate-400">Controls active on-device interception and sanitization</span>
              </div>
              <button
                onClick={() => setIsProtected(!isProtected)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                  isProtected ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isProtected ? 'ACTIVE (ON) 🟢' : 'DISABLED (OFF) ⚪'}
              </button>
            </div>

            <div className="bg-[#0a0e17] border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Global Privacy Mode:</span>
                <span className="text-[11px] text-slate-400">Strict (Max blocking), Balanced (Semantic preservation), Custom</span>
              </div>
              <select
                value={privacyMode}
                onChange={(e) => setPrivacyMode(e.target.value)}
                className="bg-[#111622] border border-slate-700 text-xs font-mono text-slate-200 rounded px-2.5 py-1 focus:outline-none"
              >
                <option value="BALANCED">Balanced Mode</option>
                <option value="STRICT">Strict Mode</option>
                <option value="CUSTOM">Custom Mode</option>
              </select>
            </div>
          </div>

          {/* Sensitive Data Classification Rules Table */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded overflow-hidden">
            <div className="bg-[#111622] px-4 py-2.5 border-b border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-slate-300">Data Type & Sensitivity Level Configuration</span>
              <span className="text-slate-500">Enforcement Action</span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs font-mono">
              {Object.entries(DEFAULT_RULES).map(([key, rule]) => (
                <div key={key} className="px-3 sm:px-4 py-3 flex flex-wrap items-start sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white font-semibold">{rule.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${
                        rule.level === 'CRITICAL' ? 'bg-red-950 text-red-300 border-red-800' :
                        rule.level === 'HIGH' ? 'bg-orange-950 text-orange-300 border-orange-800' :
                        rule.level === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {rule.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      {rule.level === 'CRITICAL' && 'Authentication credentials, keys, and tokens. Never passed to AI.'}
                      {rule.level === 'HIGH' && 'Personal contact information. Redacted to semantic tokens.'}
                      {rule.level === 'MEDIUM' && 'Individual names and identity descriptors. Redacted by default.'}
                      {rule.level === 'LOW' && 'Standard UI buttons and navigation links. Preserved for AI reasoning.'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {rule.canWeaken ? (
                      <span className="text-xs text-slate-300 px-2.5 py-1 rounded bg-[#111622] border border-slate-700">
                        {rule.action}
                      </span>
                    ) : (
                      <span className="text-xs text-red-400 font-bold px-2.5 py-1 rounded bg-red-950/60 border border-red-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {rule.action} (Locked)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 2: USER-APPROVED WEBSITE PRIVACY POLICIES */}
      {activeSubSection === 'policies' && (
        <div className="space-y-5">
          <div className="bg-[#0a0e17] border border-slate-800 rounded p-4 text-xs space-y-1">
            <span className="font-bold text-white">User-Approved Website Privacy Policies:</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Users can explicitly define and approve per-website policies. This feature operates purely under user control and does not involve AI learning user secrets. Policies are stored locally on-device and applied automatically upon domain match.
            </p>
          </div>

          {/* Select Origin */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-400">Target Origin:</span>
            <select
              value={selectedOrigin}
              onChange={(e) => handleOriginChange(e.target.value)}
              className="bg-[#0a0e17] border border-slate-700 text-slate-200 rounded px-3 py-1.5 focus:outline-none"
            >
              {allConfiguredPolicies.map(p => (
                <option key={p.origin} value={p.origin}>{p.origin} ({p.name})</option>
              ))}
            </select>
          </div>

          {/* Policy Editor Table */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded overflow-hidden text-xs font-mono">
            <div className="bg-[#111622] px-4 py-2.5 border-b border-slate-800 flex justify-between items-center">
              <span className="font-bold text-slate-300">Origin: {selectedOrigin}</span>
              <span className="text-emerald-400">User Approved ✓</span>
            </div>

            <div className="divide-y divide-slate-800/80 p-4 space-y-3">
              {/* Email Rule */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-white font-semibold block">Email Addresses:</span>
                  <span className="text-[11px] text-slate-500">Contact identification for {selectedOrigin}</span>
                </div>
                <select
                  value={currentPolicy.rules?.email || "REDACT"}
                  onChange={(e) => handleRuleActionChange('email', e.target.value)}
                  className="bg-[#111622] border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
                >
                  <option value="REDACT">REDACT → [EMAIL]</option>
                  <option value="ALLOW">ALLOW (Transmit)</option>
                  <option value="BLOCK">BLOCK (Strip field)</option>
                </select>
              </div>

              {/* Phone Rule */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-white font-semibold block">Phone Numbers:</span>
                  <span className="text-[11px] text-slate-500">Telephone telemetry for {selectedOrigin}</span>
                </div>
                <select
                  value={currentPolicy.rules?.phone || "REDACT"}
                  onChange={(e) => handleRuleActionChange('phone', e.target.value)}
                  className="bg-[#111622] border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
                >
                  <option value="REDACT">REDACT → [PHONE]</option>
                  <option value="ALLOW">ALLOW (Transmit)</option>
                  <option value="BLOCK">BLOCK (Strip field)</option>
                </select>
              </div>

              {/* Name Rule */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-white font-semibold block">Identity / Name:</span>
                  <span className="text-[11px] text-slate-500">Full identity label for {selectedOrigin}</span>
                </div>
                <select
                  value={currentPolicy.rules?.name || "REDACT"}
                  onChange={(e) => handleRuleActionChange('name', e.target.value)}
                  className="bg-[#111622] border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
                >
                  <option value="REDACT">REDACT → [NAME]</option>
                  <option value="ALLOW">ALLOW (Transmit)</option>
                  <option value="BLOCK">BLOCK (Strip field)</option>
                </select>
              </div>

              {/* Password Rule (Guarded) */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-white font-semibold block">Passwords:</span>
                  <span className="text-[11px] text-red-400">Critical credential — locked to BLOCK</span>
                </div>
                <span className="text-red-400 font-bold px-2 py-1 bg-red-950/60 rounded border border-red-800">
                  BLOCK (Guarded)
                </span>
              </div>

              {/* API Key Rule (Guarded) */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-white font-semibold block">API Keys & Tokens:</span>
                  <span className="text-[11px] text-red-400">Cryptographic secret — locked to BLOCK</span>
                </div>
                <span className="text-red-400 font-bold px-2 py-1 bg-red-950/60 rounded border border-red-800">
                  BLOCK (Guarded)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-[#111622] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={handleResetPolicy}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center space-x-1 cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Policy</span>
              </button>

              <button
                onClick={handleSavePolicy}
                className="px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center space-x-1.5 cursor-pointer text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Policy</span>
              </button>
            </div>
          </div>

          {policySaveStatus && (
            <div className="p-2.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{policySaveStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* SUBSECTION 3: BACKGROUND EVENT LOG */}
      {activeSubSection === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Filter Event:</span>
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="bg-[#0a0e17] border border-slate-700 text-slate-200 rounded px-2 py-1"
              >
                <option value="ALL">All Events</option>
                <option value="DATA_DETECTED">DATA_DETECTED</option>
                <option value="DATA_BLOCKED">DATA_BLOCKED</option>
                <option value="DATA_REDACTED">DATA_REDACTED</option>
                <option value="CROSS_TAB_REQUEST_BLOCKED">CROSS_TAB_REQUEST_BLOCKED</option>
                <option value="AI_REQUEST_ALLOWED">AI_REQUEST_ALLOWED</option>
              </select>
            </div>

            <button
              onClick={refreshEvents}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Ledger</span>
            </button>
          </div>

          {/* Event Log Table */}
          <div className="bg-[#0a0e17] border border-slate-800 rounded overflow-hidden">
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-800 text-xs font-mono">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(evt => (
                  <div key={evt.id} className="p-3 hover:bg-[#111622] transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">{evt.timestamp}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          evt.type.includes('BLOCKED') ? 'bg-red-950 text-red-300 border border-red-800' :
                          evt.type.includes('REDACTED') ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {evt.type}
                        </span>
                        <span className="text-slate-300 font-semibold">{evt.origin} (Tab #{evt.tabId})</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{evt.securityBoundary}</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{evt.summary}</p>
                    <p className="text-slate-500 text-[10px]">{evt.details}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500">
                  No events match the selected filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBSECTION 4: ABOUT & ARCHITECTURE */}
      {activeSubSection === 'about' && (
        <div className="bg-[#0a0e17] border border-slate-800 rounded p-5 text-xs space-y-3 font-mono">
          <h3 className="font-bold text-white text-sm">About AI Privacy Firewall Prototype</h3>
          <p className="text-slate-400 leading-relaxed font-sans">
            Built for Smart India Hackathon 2026 under ISRO Problem Statement SIH26171. The software provides an on-device visual and DOM perception firewall acting as a trusted boundary between local browser sessions and remote AI browser agents.
          </p>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-slate-300 font-bold block">Prototype Technical Boundaries:</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
              <li><strong>Current Implementation:</strong> Deterministic DOM inspection, multi-signal sensitivity classification, regex matching, local vault delegation, and tab process isolation simulation.</li>
              <li><strong>Future Work:</strong> WebGPU-accelerated lightweight Vision-Language Model (ONNX Runtime Web / MobileViT) for pure screenshot/canvas visual perception.</li>
              <li><strong>Zero Real Credentials:</strong> Uses synthetic demo accounts only. Never transmits real secrets.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
