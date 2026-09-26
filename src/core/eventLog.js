/**
 * AI Privacy Firewall — Background Event Log Store
 * ISRO Problem Statement SIH26171
 * 
 * Records on-device security events, outbound context requests,
 * data redactions, and cross-tab isolation intercepts.
 * Stores strictly synthetic demo metadata; never real secrets.
 */

export const EVENT_TYPES = {
  CONTEXT_REQUEST: "CONTEXT_REQUEST",
  DATA_DETECTED: "DATA_DETECTED",
  DATA_REDACTED: "DATA_REDACTED",
  DATA_BLOCKED: "DATA_BLOCKED",
  AI_REQUEST_ALLOWED: "AI_REQUEST_ALLOWED",
  AI_REQUEST_BLOCKED: "AI_REQUEST_BLOCKED",
  CROSS_TAB_REQUEST_BLOCKED: "CROSS_TAB_REQUEST_BLOCKED",
  USER_POLICY_APPLIED: "USER_POLICY_APPLIED",
  VISION_DETECTED: "VISION_DETECTED",
  VISUAL_REGION_SANITIZED: "VISUAL_REGION_SANITIZED",
  VISUAL_REGION_BLOCKED: "VISUAL_REGION_BLOCKED",
  VISUAL_PAYLOAD_ALLOWED: "VISUAL_PAYLOAD_ALLOWED",
  VISUAL_PAYLOAD_BLOCKED: "VISUAL_PAYLOAD_BLOCKED"
};

// In-memory event ledger pre-populated with realistic background sessions
let eventLogLedger = [
  {
    id: "evt-101",
    timestamp: "10:14:02 AM",
    isoTime: "2026-09-11T10:14:02Z",
    tabId: 12,
    origin: "isro-portal.local",
    type: EVENT_TYPES.USER_POLICY_APPLIED,
    level: "LOW",
    action: "APPLIED",
    summary: "Loaded user-approved Balanced policy for isro-portal.local",
    details: "Rules applied: Passwords BLOCK, Emails REDACT, Phones REDACT",
    securityBoundary: "LOCAL_POLICY_STORE"
  },
  {
    id: "evt-102",
    timestamp: "10:14:15 AM",
    isoTime: "2026-09-11T10:14:15Z",
    tabId: 12,
    origin: "isro-portal.local",
    type: EVENT_TYPES.DATA_DETECTED,
    level: "CRITICAL",
    action: "FLAGGED",
    summary: "Detected passwordField and apiKey in DOM",
    details: "input[type=password] and DEMO_API_KEY pattern classified as CRITICAL",
    securityBoundary: "ON_DEVICE_DETECTOR"
  },
  {
    id: "evt-103",
    timestamp: "10:14:16 AM",
    isoTime: "2026-09-11T10:14:16Z",
    tabId: 12,
    origin: "isro-portal.local",
    type: EVENT_TYPES.DATA_BLOCKED,
    level: "CRITICAL",
    action: "BLOCKED",
    summary: "Credential blocked from outbound AI context",
    details: "Password delegated to Local Vault; API Key removed from wire payload",
    securityBoundary: "OUTBOUND_PRIVACY_GATE"
  },
  {
    id: "evt-104",
    timestamp: "10:21:40 AM",
    isoTime: "2026-09-11T10:21:40Z",
    tabId: 14,
    origin: "vault.bank.local",
    type: EVENT_TYPES.CROSS_TAB_REQUEST_BLOCKED,
    level: "CRITICAL",
    action: "BLOCKED",
    summary: "Cross-tab context request intercepted and blocked",
    details: "Agent requested Tab #14 context while scoped to Tab #12. Reason: CROSS-TAB CONTEXT ACCESS NOT AUTHORIZED",
    securityBoundary: "TAB_ISOLATION_BARRIER"
  }
];

let eventIdCounter = 105;

/**
 * Record a new background event
 */
export function recordEvent({
  tabId = 12,
  origin = "isro-portal.local",
  type = EVENT_TYPES.DATA_DETECTED,
  level = "MEDIUM",
  action = "REDACTED",
  summary = "",
  details = "",
  securityBoundary = "ON_DEVICE_PERCEPTION"
}) {
  const newEvent = {
    id: `evt-${eventIdCounter++}`,
    timestamp: new Date().toLocaleTimeString(),
    isoTime: new Date().toISOString(),
    tabId,
    origin,
    type,
    level,
    action,
    summary,
    details,
    securityBoundary
  };

  eventLogLedger.unshift(newEvent); // newest first
  if (eventLogLedger.length > 100) {
    eventLogLedger.pop();
  }

  return newEvent;
}

/**
 * Get all events, optionally filtered by tab or type
 */
export function getEvents({ tabId = null, type = null } = {}) {
  return eventLogLedger.filter(evt => {
    if (tabId && evt.tabId !== tabId) return false;
    if (type && evt.type !== type) return false;
    return true;
  });
}

/**
 * Clear event log
 */
export function clearEvents() {
  eventLogLedger = [];
}
