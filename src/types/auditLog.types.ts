export enum AuditLogSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum AuditLogCategory {
  AUTH = 'AUTH',
  ACTION = 'ACTION',
  OTHER = 'OTHER',
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
  metadata?: Record<string, any>;
}

export interface AuditStats {
  totalLogs24h?: number;
  totalLogsWeek?: number;
  criticalLogs24h?: number;
  errorLogs24h?: number;
  warningLogs24h?: number;
  query_time_ms?: number;
  [key: string]: any;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}