// src/types/auditLog.types.ts

// Enum để code an toàn hơn
export enum AuditLogCategory {
  AUTH = 'AUTH',
  ACTION = 'ACTION',
  OTHER = 'OTHER',
}

// Interface này giờ đây phản ánh AuditLog entity từ backend
export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: number;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  actionType: string; 
  category: AuditLogCategory;
  severity: AuditLogSeverity; // Giữ là string vì BE có thể có nhiều giá trị
  targetEntity?: string;
  targetEntityId?: string;
  details?: string;
  success: boolean;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  deleted: boolean;
}

// Interface cho API /stats
export interface AuthStats {
  total_auth_logs: number;
  today_logs: number;
  total_logs: number;
  query_time_ms: number;
  generated_at: string;
}

// Interface cho Page object từ Spring (nếu có)
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export enum AuditLogSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}