
export interface AuditLogEntry {
  action:
    | "ROLE_CHANGE"
    | "EMPLOYEE_ACTIVATION"
    | "EMPLOYEE_DEACTIVATION"
    | "REFUND_ATTEMPT"
    | "UNAUTHORIZED_ATTEMPT";
  actorId: string;
  targetId?: string;
  storeId?: string;
  details?: Record<string, unknown>;
}

export function logAuditEvent(entry: AuditLogEntry): void {
  const timestamp = new Date().toISOString();
  console.log(
    `[AUDIT LOG ${timestamp}] Action: ${entry.action} | Actor: ${entry.actorId} | Store: ${entry.storeId || "N/A"} | Target: ${entry.targetId || "N/A"}`,
    entry.details ? JSON.stringify(entry.details) : "",
  );
}
