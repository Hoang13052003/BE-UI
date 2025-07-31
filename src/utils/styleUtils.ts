import { AuditLogSeverity } from "../types/auditLog.types";

export const getSeverityTagColor = (severity: AuditLogSeverity): string => {
  switch (severity) {
    case AuditLogSeverity.CRITICAL:
      return "volcano";
    case AuditLogSeverity.ERROR:
      return "error";
    case AuditLogSeverity.WARNING:
      return "warning";
    case AuditLogSeverity.INFO:
      return "processing";
    default:
      return "default";
  }
};
