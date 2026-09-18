/**
 * Frozen DOC-10 Central Admin execution states. Presentation lives in the
 * Admin application; authority and transition meaning remain upstream.
 */
export const ADMIN_EXECUTION_STATES = [
  "ST10-LOADING",
  "ST10-READY",
  "ST10-EMPTY",
  "ST10-DIRTY",
  "ST10-VALIDATING",
  "ST10-SAVING",
  "ST10-SUCCESS",
  "ST10-ERROR-RETRY",
  "ST10-DENIED",
  "ST10-NOT-FOUND",
  "ST10-CONFLICT",
  "ST10-STALE-CONTEXT",
  "ST10-CONFIRMING",
] as const;

export type AdminExecutionState = (typeof ADMIN_EXECUTION_STATES)[number];

export const ADMIN_EXECUTION_STATE_LABELS: Record<AdminExecutionState, string> = {
  "ST10-LOADING": "Loading",
  "ST10-READY": "Ready",
  "ST10-EMPTY": "Empty",
  "ST10-DIRTY": "Unsaved changes",
  "ST10-VALIDATING": "Validating",
  "ST10-SAVING": "Saving",
  "ST10-SUCCESS": "Success",
  "ST10-ERROR-RETRY": "Retryable error",
  "ST10-DENIED": "Access denied",
  "ST10-NOT-FOUND": "Not found",
  "ST10-CONFLICT": "Conflict",
  "ST10-STALE-CONTEXT": "Stale context",
  "ST10-CONFIRMING": "Confirming",
};
