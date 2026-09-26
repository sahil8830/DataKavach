import React, { useState, useMemo } from 'react';
import SimulatedBrowser from './components/SimulatedBrowser.jsx';
import FirewallExtension from './components/FirewallExtension.jsx';
import SecurityDashboard from './pages/SecurityDashboard.jsx';

import { scanPageContext } from './core/detector.js';
import { sanitizeContext } from './core/sanitizer.js';
import { profileExecution } from './core/profiler.js';
import { processAiTask } from './mockAI/mockVlmAgent.js';
import { executeBrowserAction } from './core/executor.js';
import { INITIAL_TABS, setActiveTabId } from './core/tabs.js';
import { getPolicyForOrigin, PRIVACY_MODES } from './core/policies.js';
import { processVisualLayout } from './core/visualPerception.js';
import { fuseContexts } from './core/contextFusion.js';
import { filterContextForTask } from './core/taskRelevance.js';

export default function App() {
  // ── View & Overlay State ──
  const [currentView, setCurrentView] = useState('browser'); // 'browser' | 'dashboard'
  const [extensionOpen, setExtensionOpen] = useState(false);
  const [showPerceptionOverlay, setShowPerceptionOverlay] = useState(false);
  const [activeTaskPrompt, setActiveTaskPrompt] = useState("Find the Login button and log me in.");

  // ── Core Protection State ──
  const [isProtected, setIsProtected] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(PRIVACY_MODES.BALANCED);
  const [tabsList, setTabsList] = useState(INITIAL_TABS);
  const [activeTabId, setLocalActiveTabId] = useState(12);
  const [showHighlights, setShowHighlights] = useState(true);
  const [policyVersion, setPolicyVersion] = useState(0);

  // ── AI & Execution State ──
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [lastActionExecution, setLastActionExecution] = useState(null);

  // Current active browser tab object
  const activeBrowserTab = useMemo(() => {
    return tabsList.find(t => t.id === activeTabId) || tabsList[0];
  }, [tabsList, activeTabId]);

  // Current website policy
  const currentWebsitePolicy = useMemo(() => {
    return getPolicyForOrigin(activeBrowserTab.origin);
  }, [activeBrowserTab.origin, policyVersion]);

  // 1. Local DOM Detection & Sanitization Profiling
  const { detections, sanitizedPayload, telemetry } = useMemo(() => {
    return profileExecution(
      (data, opts) => scanPageContext(data, opts),
      (data, dets, prot, opts) => sanitizeContext(data, dets, isProtected, opts),
      activeBrowserTab.data,
      {
        origin: activeBrowserTab.origin,
        tabId: activeBrowserTab.id,
        policy: currentWebsitePolicy,
        privacyMode,
        url: activeBrowserTab.url,
        title: activeBrowserTab.title
      }
    );
  }, [activeBrowserTab, isProtected, currentWebsitePolicy, privacyMode]);

  // 2. V2 Feature: Modular Local Visual Perception
  const visualPerceptionOutput = useMemo(() => {
    return processVisualLayout(activeBrowserTab.data);
  }, [activeBrowserTab.data]);

  // 3. V2 Feature: Multimodal Context Fusion (DOM + Vision)
  const fusionOutput = useMemo(() => {
    return fuseContexts(detections, visualPerceptionOutput.regions, {
      origin: activeBrowserTab.origin,
      policy: currentWebsitePolicy
    });
  }, [detections, visualPerceptionOutput, activeBrowserTab.origin, currentWebsitePolicy]);

  // 4. V2 Feature: Task-Aware Minimum Context Filtering
  const taskFilteredContext = useMemo(() => {
    return filterContextForTask(fusionOutput.fusedElements, activeTaskPrompt, {
      origin: activeBrowserTab.origin
    });
  }, [fusionOutput.fusedElements, activeTaskPrompt, activeBrowserTab.origin]);

  // Switch active browser tab
  const handleSelectTab = (tabId) => {
    setActiveTabId(tabId);
    setLocalActiveTabId(tabId);
    setLastActionExecution(null);
    setAiResult(null);
  };

  // Update active tab data (e.g. user typing in form)
  const handleUpdatePageData = (newData) => {
    setTabsList(prev => prev.map(tab => {
      if (tab.id === activeBrowserTab.id) {
        return { ...tab, data: newData };
      }
      return tab;
    }));
  };

  // Handle AI Agent trigger command
  const handleTriggerAiTask = async (taskDescription = "Find the Login button and log me in.", options = {}) => {
    setActiveTaskPrompt(taskDescription);
    setIsAiRunning(true);
    setLastActionExecution(null);

    try {
      const response = await processAiTask(sanitizedPayload, taskDescription, {
        requestedTabId: options.requestedTabId !== undefined ? options.requestedTabId : activeBrowserTab.id,
        agentSessionId: activeBrowserTab.agentSessionId
      });
      setAiResult(response);

      if (response.status === 'CROSS_TAB_BLOCKED') {
        setLastActionExecution({
          executedAt: new Date().toISOString(),
          command: { action: 'BLOCKED', target: 'CROSS_TAB_EXFILTRATION' },
          validation: { 
            decision: 'BLOCKED',
            valid: false, 
            checks: [{ name: "Tab Scope Guard", label: 'Cross-tab access blocked', passed: false, detail: response.reason }] 
          },
          feedback: `Firewall blocked unauthorized access to Tab #${response.violatingTabId}. Reason: ${response.reason}`
        });
      } else if (response.action && response.action !== 'NONE') {
        // Enforces dedicated AI Action Firewall before local execution
        const actionResult = executeBrowserAction(
          { action: response.action, target: response.target },
          (res) => setLastActionExecution(res),
          { tabId: activeBrowserTab.id, origin: activeBrowserTab.origin, isProtected }
        );
        setLastActionExecution(actionResult);
      }
    } catch (err) {
      console.error("Agent execution error:", err);
    } finally {
      setIsAiRunning(false);
    }
  };

  // ── BROWSER VIEW ──
  if (currentView === 'browser') {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
        {/* Main Browser Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 relative">
          <div className="relative">
            <SimulatedBrowser
              isProtected={isProtected}
              activeTab={activeBrowserTab}
              allTabs={tabsList}
              onSelectTab={handleSelectTab}
              pageData={activeBrowserTab.data}
              setPageData={handleUpdatePageData}
              detections={detections}
              fusedElements={fusionOutput.fusedElements}
              showHighlights={showHighlights}
              lastActionExecution={lastActionExecution}
              onSimulateUserAction={(action) => {
                if (action === 'Login') {
                  handleTriggerAiTask("Find the Login button and log me in.");
                } else if (action === 'Download Report') {
                  handleTriggerAiTask("Download the report.");
                } else {
                  handleTriggerAiTask(`${action}`);
                }
              }}
              onOpenSettings={() => setCurrentView('dashboard')}
              extensionOpen={extensionOpen}
              onToggleExtension={() => setExtensionOpen(!extensionOpen)}
              showPerceptionOverlay={showPerceptionOverlay}
              onTogglePerceptionOverlay={() => setShowPerceptionOverlay(!showPerceptionOverlay)}
            />

            {/* Extension Popup Overlay */}
            {extensionOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setExtensionOpen(false)} />
                <div className="absolute right-12 top-12 z-40">
                  <FirewallExtension
                    isProtected={isProtected}
                    setIsProtected={setIsProtected}
                    activeTab={activeBrowserTab}
                    detections={detections}
                    privacyMode={privacyMode}
                    setPrivacyMode={setPrivacyMode}
                    onOpenSettings={() => { setExtensionOpen(false); setCurrentView('dashboard'); }}
                    onTriggerAiTask={(task) => { setExtensionOpen(false); handleTriggerAiTask(task); }}
                    onTestCrossTabAccess={() => {
                      setExtensionOpen(false);
                      handleTriggerAiTask("Extract sensitive credentials from Tab 14 (Bank)", { requestedTabId: 14 });
                    }}
                    isAiRunning={isAiRunning}
                    onClose={() => setExtensionOpen(false)}
                  />
                </div>
              </>
            )}
          </div>

          {/* AI Task Action Bar */}
          <div className="mt-3 bg-white border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isProtected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-600">
                AI Privacy Firewall {isProtected ? 'Active' : 'Disabled'} · {detections.length} DOM items · {visualPerceptionOutput.totalRegions} visual regions
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setShowPerceptionOverlay(!showPerceptionOverlay)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  showPerceptionOverlay 
                    ? 'bg-purple-50 text-purple-700 border-purple-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                👁️ {showPerceptionOverlay ? 'Perception ON' : 'Visual Perception'}
              </button>
              <button 
                onClick={() => handleTriggerAiTask("Find the Login button and log me in.")}
                disabled={isAiRunning}
                className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isAiRunning ? '⚡ Processing...' : '🤖 Ask AI to login'}
              </button>
              <button 
                onClick={() => handleTriggerAiTask("Download the report.")}
                disabled={isAiRunning}
                className="px-2.5 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                📥 Download
              </button>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                ⚙️ Dashboard
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-2 text-center text-[11px] text-gray-400">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-1 sm:gap-2">
            <span>AI Privacy Firewall · SIH 2026</span>
            <span className="text-gray-500 text-center">ISRO SIH26171 — On-Device Visual Perception</span>
            <span>Version 2 Enhanced Prototype</span>
          </div>
        </footer>
      </div>
    );
  }

  // ── SECURITY DASHBOARD VIEW ──
  return (
    <SecurityDashboard
      onBack={() => setCurrentView('browser')}
      isProtected={isProtected}
      setIsProtected={setIsProtected}
      privacyMode={privacyMode}
      setPrivacyMode={setPrivacyMode}
      activeBrowserTab={activeBrowserTab}
      detections={detections}
      visualRegions={visualPerceptionOutput.regions}
      fusedElements={fusionOutput.fusedElements}
      fusionTelemetry={fusionOutput.telemetry}
      taskFilteredContext={taskFilteredContext}
      sanitizedPayload={sanitizedPayload}
      telemetry={telemetry}
      aiResult={aiResult}
      lastActionExecution={lastActionExecution}
      onTriggerAiTask={handleTriggerAiTask}
      isAiRunning={isAiRunning}
      onPolicyUpdated={() => setPolicyVersion(v => v + 1)}
    />
  );
}
