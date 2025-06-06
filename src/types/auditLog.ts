// src/types/auditLog.ts
export enum AuditLogCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATA_ACCESS = 'DATA_ACCESS',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  FILE_OPERATIONS = 'FILE_OPERATIONS',
  API_ACCESS = 'API_ACCESS',
  SECURITY_EVENT = 'SECURITY_EVENT',
  OTHER = 'OTHER'
}

export enum AuditLogSeverity {
  CRITICAL = 'CRITICAL',
  ERROR = 'ERROR', 
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface AuditLogFilter {
  category?: AuditLogCategory;
  severity?: AuditLogSeverity;
  startTime?: Date;
  endTime?: Date;
  username?: string;
  actionType?: string;
  success?: boolean;
}

export interface AuditLogStats {
  totalLogs24h: number;
  totalLogsWeek: number;
  criticalLogs24h: number;
  errorLogs24h: number;
  warningLogs24h: number;
  categoryBreakdown: { [key: string]: number };
  severityBreakdown: { [key: string]: number };
}

export interface UserActivitySummary {
  username: string;
  activityCount: number;
  lastActivity?: string;
  topActions?: string[];
}

export const getCategoryDisplayName = (category: AuditLogCategory): string => {
  const categoryNames: Record<AuditLogCategory, string> = {
    [AuditLogCategory.AUTHENTICATION]: 'Authentication',
    [AuditLogCategory.AUTHORIZATION]: 'Authorization',
    [AuditLogCategory.DATA_ACCESS]: 'Data Access',
    [AuditLogCategory.SYSTEM_CONFIG]: 'System Config',
    [AuditLogCategory.USER_MANAGEMENT]: 'User Management',
    [AuditLogCategory.PROJECT_MANAGEMENT]: 'Project Management',
    [AuditLogCategory.FILE_OPERATIONS]: 'File Operations',
    [AuditLogCategory.API_ACCESS]: 'API Access',
    [AuditLogCategory.SECURITY_EVENT]: 'Security Event',
    [AuditLogCategory.OTHER]: 'Other'
  };
  return categoryNames[category] || category;
};

export const getSeverityColor = (severity: AuditLogSeverity): string => {
  const severityColors: Record<AuditLogSeverity, string> = {
    [AuditLogSeverity.CRITICAL]: '#ff4d4f',
    [AuditLogSeverity.ERROR]: '#ff7875', 
    [AuditLogSeverity.WARNING]: '#fa8c16',
    [AuditLogSeverity.INFO]: '#1890ff',
    [AuditLogSeverity.DEBUG]: '#52c41a'
  };
  return severityColors[severity] || '#d9d9d9';
};

export const getSeverityIcon = (severity: AuditLogSeverity): string => {
  const severityIcons: Record<AuditLogSeverity, string> = {
    [AuditLogSeverity.CRITICAL]: '🚨',
    [AuditLogSeverity.ERROR]: '❌',
    [AuditLogSeverity.WARNING]: '⚠️', 
    [AuditLogSeverity.INFO]: 'ℹ️',
    [AuditLogSeverity.DEBUG]: '🔍'
  };
  return severityIcons[severity] || '📝';
};
