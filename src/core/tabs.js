/**
 * AI Privacy Firewall — Multi-Tab Isolation Engine
 * ISRO Problem Statement SIH26171
 * 
 * Represents browser tabs as distinct, isolated execution contexts.
 * Guarantees that AI agent sessions on one tab cannot access or leak
 * context from other open tabs without explicit user authorization.
 */

import { recordEvent, EVENT_TYPES } from './eventLog.js';

export const INITIAL_TABS = [
  {
    id: 12,
    tabNumber: 12,
    origin: "isro-portal.local",
    title: "ISRO Mission Telemetry — Operator Profile",
    url: "https://isro-portal.local/user/profile",
    agentSessionId: "session-agent-alpha-12",
    privacyMode: "BALANCED",
    isProtected: true,
    data: {
      name: "",
      email: "",
      phone: "",
      password: "",
      apiKey: ""
    }
  },
  {
    id: 13,
    tabNumber: 13,
    origin: "mail.internal.local",
    title: "Internal Communications & Comms Relay",
    url: "https://mail.internal.local/inbox",
    agentSessionId: "session-agent-beta-13",
    privacyMode: "STRICT",
    isProtected: true,
    data: {
      name: "",
      email: "",
      phone: "",
      password: "",
      apiKey: ""
    }
  },
  {
    id: 14,
    tabNumber: 14,
    origin: "vault.bank.local",
    title: "Institutional Bank & Financial Authorization",
    url: "https://vault.bank.local/accounts/auth",
    agentSessionId: "session-agent-gamma-14",
    privacyMode: "STRICT",
    isProtected: true,
    data: {
      name: "",
      email: "",
      phone: "",
      password: "",
      apiKey: ""
    }
  }
];

let activeTabList = [...INITIAL_TABS];
let activeTabId = 12;

/**
 * Get the currently active tab
 */
export function getActiveTab() {
  return activeTabList.find(t => t.id === activeTabId) || activeTabList[0];
}

/**
 * Get all open tabs
 */
export function getAllTabs() {
  return activeTabList;
}

/**
 * Switch active tab
 */
export function setActiveTabId(tabId) {
  activeTabId = tabId;
  const tab = getActiveTab();
  recordEvent({
    tabId: tab.id,
    origin: tab.origin,
    type: EVENT_TYPES.CONTEXT_REQUEST,
    level: "LOW",
    action: "FOCUS",
    summary: `Switched browser focus to Tab #${tab.id} (${tab.origin})`,
    details: `Scoped agent session: ${tab.agentSessionId}`,
    securityBoundary: "BROWSER_TAB_CONTEXT"
  });
  return tab;
}

/**
 * Update tab data or protection
 */
export function updateTab(tabId, updates) {
  activeTabList = activeTabList.map(tab => {
    if (tab.id === tabId) {
      return { ...tab, ...updates };
    }
    return tab;
  });
  return activeTabList.find(t => t.id === tabId);
}

/**
 * Evaluate cross-tab context request authorization.
 * If an agent scoped to tab A requests context from tab B, this intercepts it.
 */
export function verifyTabContextAccess(requestingScope, requestedTabId) {
  const currentTab = getActiveTab();

  // If the agent is requesting its own scoped tab, access is authorized
  if (requestedTabId === currentTab.id && requestingScope.tabId === currentTab.id) {
    return {
      authorized: true,
      reason: "Request within current-tab execution boundary",
      tabId: currentTab.id,
      origin: currentTab.origin
    };
  }

  // Cross-tab context request detected without user approval -> BLOCK
  const blockedTab = activeTabList.find(t => t.id === requestedTabId) || { origin: "unknown-tab" };
  const reason = "CROSS-TAB CONTEXT ACCESS NOT AUTHORIZED";

  recordEvent({
    tabId: requestedTabId,
    origin: blockedTab.origin,
    type: EVENT_TYPES.CROSS_TAB_REQUEST_BLOCKED,
    level: "CRITICAL",
    action: "BLOCKED",
    summary: `Blocked unauthorized cross-tab request from Tab #${requestingScope.tabId} to Tab #${requestedTabId}`,
    details: `Agent session ${requestingScope.agentSessionId || 'unknown'} attempted cross-tab context leak. Reason: ${reason}`,
    securityBoundary: "TAB_ISOLATION_BARRIER"
  });

  return {
    authorized: false,
    reason,
    violatingTabId: requestedTabId,
    violatingOrigin: blockedTab.origin,
    action: "BLOCKED"
  };
}
