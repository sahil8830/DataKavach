import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  Pause, 
  FileText, 
  Settings, 
  Layers, 
  BarChart2, 
  CheckCircle2, 
  SlidersHorizontal,
  Compass,
  Download
} from 'lucide-react';

export default function TopNavbar({ 
  isProtected, 
  setIsProtected, 
  activeTab, 
  setActiveTab,
  isPresentationMode,
  setIsPresentationMode,
  activeBrowserTab,
  privacyMode,
  onTriggerAiTask,
  isAiRunning
}) {
  return (
    <header className="bg-[#0e1420] border-b border-slate-800 sticky top-0 z-40 px-4 py-2 text-slate-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Project Branding & Scope */}
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              🛡️ <span className="hidden xs:inline">AI PRIVACY FIREWALL</span><span className="xs:hidden">FIREWALL</span>
            </span>
            <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              ISRO SIH26171
            </span>
          </div>
          <span className="hidden md:inline text-xs text-slate-400 font-mono truncate">
            On-device Visual Perception for Browser Agents
          </span>
        </div>

        {/* Center: Controls & State */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Active Tab Scope Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300">
            <span className="text-slate-500">Scope:</span>
            <span className="text-emerald-400 font-semibold">Tab #{activeBrowserTab.id}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{activeBrowserTab.origin}</span>
          </div>

          {/* Privacy Mode Badge */}
          <div className="hidden sm:flex items-center space-x-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono">
            <span className="text-slate-500">Mode:</span>
            <span className="text-blue-400 font-semibold">{privacyMode}</span>
          </div>

          {/* Master Protection Toggle */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">Firewall:</span>
            <button
              onClick={() => setIsProtected(!isProtected)}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                isProtected 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isProtected ? 'bg-white' : 'bg-slate-400'}`}></span>
              <span>{isProtected ? 'ON 🟢' : 'OFF ⚪'}</span>
            </button>
          </div>
        </div>

        {/* Right: Actions & Demo Tour */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Direct Download DOCX Report */}
          <a
            href="/AI_Privacy_Firewall_SIH26171_Project_Report.docx"
            download="AI_Privacy_Firewall_SIH26171_Project_Report.docx"
            className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600 transition-colors cursor-pointer"
            title="Download formatted Microsoft Word document (.docx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">📥 Download .docx</span>
          </a>

          {/* 2-Minute Demo Tour Button (Preserved) */}
          <button
            onClick={() => setIsPresentationMode(!isPresentationMode)}
            className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
              isPresentationMode 
                ? 'bg-amber-600 border-amber-500 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
            }`}
            title="Automated 2-minute demonstration flow for SIH judges"
          >
            {isPresentationMode ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isPresentationMode ? 'Pause Tour' : '▶ 2-Min Demo'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <nav className="max-w-7xl mx-auto flex items-center space-x-0.5 mt-2 pt-2 border-t border-slate-800/80 text-xs overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pb-1">
        <button
          onClick={() => setActiveTab('studio')}
          className={`px-2 sm:px-3 py-1 rounded font-medium transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
            activeTab === 'studio' 
              ? 'bg-slate-800 text-white border border-slate-700 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Browser &amp; Agent Studio</span>
          <span className="sm:hidden">Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-2 sm:px-3 py-1 rounded font-medium transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
            activeTab === 'comparison' 
              ? 'bg-slate-800 text-white border border-slate-700 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="hidden sm:inline">Original vs. Sanitized</span>
          <span className="sm:hidden">Diff</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-2 sm:px-3 py-1 rounded font-medium transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
            activeTab === 'report' 
              ? 'bg-slate-800 text-white border border-slate-700 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">Detailed Privacy Report</span>
          <span className="sm:hidden">Report</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluation')}
          className={`px-2 sm:px-3 py-1 rounded font-medium transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
            activeTab === 'evaluation' 
              ? 'bg-slate-800 text-white border border-slate-700 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden sm:inline">Detection Metrics &amp; Benchmark</span>
          <span className="sm:hidden">Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-2 sm:px-3 py-1 rounded font-medium transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
            activeTab === 'settings' 
              ? 'bg-slate-800 text-white border border-slate-700 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Settings &amp; Policies</span>
          <span className="sm:hidden">Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('alignment')}
          className={`px-2 sm:px-3 py-1 rounded font-medium transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
            activeTab === 'alignment' 
              ? 'bg-slate-800 text-white border border-slate-700 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="hidden sm:inline">SIH26171 Architecture</span>
          <span className="sm:hidden">Arch.</span>
        </button>
      </nav>
    </header>
  );
}
