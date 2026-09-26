import React, { useState } from 'react';
import { 
  Lock, RotateCw, ArrowLeft, ArrowRight, Download, FileText, 
  KeyRound, CheckCircle2, Eye, EyeOff, Settings, Shield,
  AlertTriangle, X, ChevronDown, Scan, Layers
} from 'lucide-react';

export default function SimulatedBrowser({ 
  isProtected, 
  activeTab, 
  allTabs, 
  onSelectTab, 
  pageData, 
  setPageData, 
  detections = [], 
  fusedElements = [],
  showHighlights, 
  lastActionExecution, 
  onSimulateUserAction,
  onOpenSettings,
  extensionOpen,
  onToggleExtension,
  showPerceptionOverlay = false,
  onTogglePerceptionOverlay
}) {
  const [showPasswordText, setShowPasswordText] = useState(false);

  const isExecutingLogin = lastActionExecution && 
    (lastActionExecution.command?.target === 'Login' || lastActionExecution.command?.action === 'FILL_AND_LOGIN');

  const isExecutingDownload = lastActionExecution &&
    lastActionExecution.command?.target === 'Download Report';

  // Helper to find fused element
  const getFused = (type) => fusedElements.find(f => f.type === type);
  const nameFused = getFused('NAME');
  const emailFused = getFused('EMAIL');
  const phoneFused = getFused('PHONE');
  const passFused = getFused('PASSWORD');
  const keyFused = getFused('API_KEY');
  const sealFused = getFused('VISUAL_ACCOUNT_SEAL');
  const faceFused = getFused('FACE');

  // Fallback detection helper
  const getDet = (type) => detections.find(d => d.type === type);
  const nameDet = getDet('NAME');
  const emailDet = getDet('EMAIL');
  const phoneDet = getDet('PHONE');
  const passDet = getDet('PASSWORD');
  const keyDet = getDet('API_KEY');

  // Visual Perception overlay badge
  const PerceptionBadge = ({ fused, defaultSource = "DOM + VISION", defaultType = "" }) => {
    if (!showPerceptionOverlay) return null;
    const source = fused?.source || defaultSource;
    const action = fused?.action || "REDACT";
    const agreement = fused?.agreement || "HIGH";
    const type = fused?.type || defaultType;

    const badgeColor = 
      source === 'VISION' ? 'bg-purple-100 text-purple-800 border-purple-300' :
      source === 'DOM' ? 'bg-blue-100 text-blue-800 border-blue-300' :
      'bg-emerald-100 text-emerald-800 border-emerald-300';

    const protectionText = 
      type === 'FACE' ? 'BLURRED' :
      type === 'PASSWORD' || type === 'API_KEY' ? 'MASKED' :
      type === 'EMAIL' || type === 'PHONE' || type === 'NAME' ? 'TOKENIZED' :
      type === 'VISUAL_ACCOUNT_SEAL' ? 'MASKED' :
      action === 'BLOCK' ? 'BLOCKED' : action === 'ALLOW' ? 'TASK RELEVANT' : 'SANITIZED';

    const protectionColor =
      protectionText === 'MASKED' || protectionText === 'BLOCKED' ? 'bg-red-100 text-red-700 border-red-300' :
      protectionText === 'BLURRED' ? 'bg-purple-100 text-purple-700 border-purple-300' :
      protectionText === 'TASK RELEVANT' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
      'bg-amber-100 text-amber-700 border-amber-300';

    return (
      <div className="flex items-center gap-1.5 text-[10px] font-mono mt-1 pt-1 border-t border-dashed border-gray-200">
        <span className={`px-1.5 py-0.2 rounded border font-semibold ${badgeColor}`}>
          Source: {source}
        </span>
        <span className={`px-1.5 py-0.2 rounded border font-semibold ${protectionColor}`}>
          Protection: {protectionText}
        </span>
        <span className="text-gray-400">
          Agreement: {agreement}
        </span>
      </div>
    );
  };

  // Detection highlight style
  const highlightClass = (det, fused) => {
    if (!isProtected || !showHighlights) return '';
    if (showPerceptionOverlay) {
      if (fused?.source === 'VISION') return 'ring-2 ring-purple-400 bg-purple-50/70';
      if (det?.action === 'BLOCK') return 'ring-2 ring-red-400 bg-red-50/70';
      if (det?.action === 'REDACT') return 'ring-2 ring-amber-400 bg-amber-50/70';
    } else {
      if (det?.action === 'BLOCK') return 'ring-2 ring-red-300 bg-red-50/40';
      if (det?.action === 'REDACT') return 'ring-2 ring-amber-300 bg-amber-50/40';
    }
    return '';
  };

  // Detection badge — rendered BELOW the input row to avoid overflow on mobile
  const DetBadge = ({ det }) => {
    if (!isProtected || !showHighlights || !det) return null;
    const colors = det.action === 'BLOCK' 
      ? 'bg-red-100 text-red-700 border-red-200' 
      : 'bg-amber-100 text-amber-700 border-amber-200';
    // Shorten sanitizedValue for display
    const displayVal = det.sanitizedValue?.length > 16
      ? det.sanitizedValue.slice(0, 16) + '…'
      : det.sanitizedValue;
    return (
      <span className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${colors}`}>
        {det.action === 'BLOCK' ? '🔒 BLOCKED' : '🔸 REDACTED'}
        <span className="font-mono">→ {displayVal}</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* 1. Browser Tab Bar */}
      <div className="bg-gray-100 border-b border-gray-200 flex items-center px-2 pt-2 gap-1 select-none overflow-x-auto scrollbar-none">
        {allTabs.map(tab => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-t-lg text-xs transition-colors cursor-pointer shrink-0 ${
                isActive 
                  ? 'bg-white text-gray-800 border-t border-x border-gray-200 font-medium shadow-sm' 
                  : 'bg-gray-50 text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isProtected ? 'bg-emerald-400' : 'bg-gray-400'}`} />
              <span className="truncate max-w-[80px] sm:max-w-[120px]">
                {tab.title.split('—')[0].trim()}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. URL & Navigation Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2 text-xs">
        <div className="hidden sm:flex items-center space-x-1.5 text-gray-400 shrink-0">
          <ArrowLeft className="w-3.5 h-3.5 cursor-pointer hover:text-gray-600" />
          <ArrowRight className="w-3.5 h-3.5 cursor-pointer hover:text-gray-600" />
          <RotateCw className="w-3.5 h-3.5 cursor-pointer hover:text-gray-600" />
        </div>

        {/* Address Bar */}
        <div className="flex-1 min-w-0 flex items-center bg-white border border-gray-300 rounded-full px-3 py-1.5 text-xs">
          <Lock className="w-3 h-3 text-emerald-600 mr-1.5 shrink-0" />
          <span className="text-gray-500 shrink-0">https://</span>
          <span className="text-gray-800 font-medium truncate">{activeTab.origin}</span>
          <span className="text-gray-400 shrink-0 hidden sm:inline">/portal/auth</span>
        </div>

        {/* V2.1 Feature: Local Visual Protection Toggle */}
        <button
          onClick={onTogglePerceptionOverlay}
          className={`hidden sm:flex px-2.5 py-1 rounded-md text-xs font-medium items-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
            showPerceptionOverlay 
              ? 'bg-purple-600 text-white border-purple-700 shadow-sm' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
          title="Toggle Local Visual Perception & Redaction Overlays"
        >
          <Scan className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{showPerceptionOverlay ? 'Visual Protection: ON' : 'Local Visual Protection'}</span>
          <span className="md:hidden">Vision</span>
        </button>

        {/* Mobile: perception toggle icon-only */}
        <button
          onClick={onTogglePerceptionOverlay}
          className={`sm:hidden p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
            showPerceptionOverlay ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-200 text-gray-500'
          }`}
          title="Local Visual Protection"
        >
          <Scan className="w-4 h-4" />
        </button>

        {/* Extension Icon (clickable) */}
        <button
          onClick={onToggleExtension}
          className={`p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
            extensionOpen ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-gray-200 text-gray-500'
          }`}
          title="AI Privacy Firewall Extension"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Settings Icon */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer shrink-0"
          title="Security Dashboard"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Protection Status Bar */}
      {isProtected && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium shrink-0">AI Privacy Protected</span>
            <span className="text-emerald-600 truncate hidden sm:inline">— {detections.length} items detected</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showPerceptionOverlay && (
              <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-medium border border-purple-200">
                Vision Active
              </span>
            )}
            <span className="text-emerald-500 text-[10px]">Firewall Active</span>
          </div>
        </div>
      )}

      {/* 3. Main Webpage Content */}
      <div className={`flex-1 overflow-y-auto ${
        isProtected ? 'border-l-4 border-emerald-500' : 'border-l-4 border-gray-300'
      }`}>
        
        {/* Action Feedback Toast */}
        {lastActionExecution && (
          <div className={`mx-4 mt-3 p-3 rounded-lg text-xs flex items-center justify-between ${
            lastActionExecution.command?.action === 'BLOCKED' 
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{lastActionExecution.feedback}</span>
            </div>
            <span className="text-[10px] text-blue-400 whitespace-nowrap ml-2">
              {lastActionExecution.executedAt?.slice(11, 19)}
            </span>
          </div>
        )}

        {/* Synthetic Demo Label */}
        <div className="mx-4 mt-3 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span><strong>Demo Environment</strong> — Synthetic test data only. No real credentials or financial data are used.</span>
        </div>

        {/* Page Content: SecureBank Demo */}
        <div className="p-4 md:p-6">
          {/* Page Header */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Lock className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">SecureBank Demo</h1>
                <p className="text-xs text-gray-500">Realistic Synthetic Enterprise Website — Demo Environment</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* V2.1 Biometric Face Region: Profile Avatar */}
              <div className={`p-2 rounded-lg border flex items-center gap-2.5 transition-colors ${
                showPerceptionOverlay 
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400' 
                  : 'bg-white border-gray-200 shadow-xs'
              }`}>
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center border border-amber-300">
                  <span className="text-lg">👨‍💻</span>
                  {isProtected && (
                    <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[7px] font-bold text-amber-900 bg-amber-100/90 px-1 py-0.2 rounded">
                        BLURRED
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                    <span>Vrushabh Tonge</span>
                    <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-mono">
                      FACE
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500">Biometric Identity Photo</div>
                  <PerceptionBadge fused={faceFused} defaultSource="VISION" defaultType="FACE" />
                </div>
              </div>

              {/* V2 Vision-Only Case: Rendered Security Seal */}
              <div className={`p-2 rounded-lg border flex items-center gap-2.5 transition-colors ${
                showPerceptionOverlay 
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400' 
                  : 'bg-indigo-50/70 border-indigo-200'
              }`}>
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm">
                  🛡️
                </div>
                <div>
                  <div className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                    <span>CONFIDENTIAL SEAL</span>
                    <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1 rounded font-mono">
                      ACCT-849204
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-700">
                    Rendered security watermark
                  </div>
                  <PerceptionBadge fused={sealFused} defaultSource="VISION" defaultType="VISUAL_ACCOUNT_SEAL" />
                </div>
              </div>
            </div>
          </div>

          {/* Account Profile Card */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Account Profile & Credentials
              </h2>
              {showPerceptionOverlay && (
                <span className="text-[10px] text-indigo-600 font-mono">
                  [Bounding Box & Multimodal Overlay Active]
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div className={`py-2 px-2 rounded border border-transparent ${highlightClass(nameDet, nameFused)}`}>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-20 shrink-0">Name</label>
                  <input 
                    type="text" 
                    value={pageData.name || ''} 
                    onChange={(e) => setPageData({...pageData, name: e.target.value})}
                    className="flex-1 min-w-0 text-sm text-gray-800 bg-transparent border-b border-gray-200 focus:border-indigo-400 focus:outline-none px-1 py-0.5"
                  />
                </div>
                {isProtected && showHighlights && nameDet && <DetBadge det={nameDet} />}
                <PerceptionBadge fused={nameFused} defaultSource="DOM + VISION" defaultType="NAME" />
              </div>

              {/* Email */}
              <div className={`py-2 px-2 rounded border border-transparent ${highlightClass(emailDet, emailFused)}`}>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-20 shrink-0">Email</label>
                  <input 
                    type="email" 
                    value={pageData.email || ''} 
                    onChange={(e) => setPageData({...pageData, email: e.target.value})}
                    className="flex-1 min-w-0 text-sm text-gray-800 bg-transparent border-b border-gray-200 focus:border-indigo-400 focus:outline-none px-1 py-0.5"
                  />
                </div>
                {isProtected && showHighlights && emailDet && <DetBadge det={emailDet} />}
                <PerceptionBadge fused={emailFused} defaultSource="DOM + VISION" defaultType="EMAIL" />
              </div>

              {/* Phone */}
              <div className={`py-2 px-2 rounded border border-transparent ${highlightClass(phoneDet, phoneFused)}`}>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-20 shrink-0">Phone</label>
                  <input 
                    type="tel" 
                    value={pageData.phone || ''} 
                    onChange={(e) => setPageData({...pageData, phone: e.target.value})}
                    className="flex-1 min-w-0 text-sm text-gray-800 bg-transparent border-b border-gray-200 focus:border-indigo-400 focus:outline-none px-1 py-0.5"
                  />
                </div>
                {isProtected && showHighlights && phoneDet && <DetBadge det={phoneDet} />}
                <PerceptionBadge fused={phoneFused} defaultSource="DOM + VISION" defaultType="PHONE" />
              </div>

              {/* Password */}
              <div className={`py-2 px-2 rounded border border-transparent ${highlightClass(passDet, passFused)}`}>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-20 shrink-0">Password</label>
                  <div className="flex-1 min-w-0 flex items-center border-b border-gray-200">
                    <input 
                      type={showPasswordText ? 'text' : 'password'} 
                      value={pageData.password || ''} 
                      onChange={(e) => setPageData({...pageData, password: e.target.value})}
                      className="flex-1 min-w-0 text-sm text-gray-800 bg-transparent focus:outline-none px-1 py-0.5"
                    />
                    <button onClick={() => setShowPasswordText(!showPasswordText)} className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer shrink-0">
                      {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {isProtected && showHighlights && passDet && <DetBadge det={passDet} />}
                <PerceptionBadge fused={passFused} defaultSource="DOM + VISION" defaultType="PASSWORD" />
              </div>

              {/* API Key */}
              <div className={`py-2 px-2 rounded border border-transparent ${highlightClass(keyDet, keyFused)}`}>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-20 shrink-0">API Key</label>
                  <div className="flex-1 min-w-0 flex items-center overflow-hidden">
                    <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200 truncate max-w-full">
                      {pageData.apiKey || ''}
                    </span>
                  </div>
                </div>
                {isProtected && showHighlights && keyDet && <DetBadge det={keyDet} />}
                <PerceptionBadge fused={keyFused} defaultSource="DOM + VISION" defaultType="API_KEY" />
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => onSimulateUserAction('Login')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                  isExecutingLogin 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                {isExecutingLogin ? '✓ Login Successful' : 'Login'}
              </button>

              <button 
                onClick={() => onSimulateUserAction('Download Report')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer flex items-center gap-2 ${
                  isExecutingDownload
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Download className="w-4 h-4" />
                {isExecutingDownload ? '✓ Report Downloaded' : 'Download Report'}
              </button>

              <button 
                onClick={() => onSimulateUserAction('View Report')}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View Report
              </button>
            </div>

            {showPerceptionOverlay && (
              <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-gray-500">
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Target Buttons Source: DOM + VISION
                </span>
                <span>Buttons classified as Task-Relevant Action Targets</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
