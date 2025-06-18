export enum AuditLogCategory {
  AUTH = "AUTH",
  ACTION = "ACTION",
  OTHER = "OTHER",
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: number;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  actionType: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  targetEntity?: string;
  targetEntityId?: string;
  details?: string;
  success: boolean;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  deleted: boolean;
}

export interface AuthStats {
  total_auth_logs: number;
  today_logs: number;
  total_logs: number;
  query_time_ms: number;
  generated_at: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export enum AuditLogSeverity {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}
