// src/api/auditLogApi.ts
import axiosClient from './axiosClient';
import { AuditLogFilter, AuditLogStats, UserActivitySummary } from '../types/auditLog';
import { AuditLogRealtimeDto, PageResponse } from '../hooks/useAuditLogData';

export const auditLogApi = {
  // Get recent audit logs
  getRecentAuditLogs: async (page: number = 0, size: number = 50): Promise<PageResponse<AuditLogRealtimeDto>> => {
    const response = await axiosClient.get('/api/admin/audit-logs/recent', {
      params: { page, size }
    });
    return response.data;
  },

  // Get filtered audit logs
  getFilteredAuditLogs: async (
    filter: AuditLogFilter,
    page: number = 0,
    size: number = 50
  ): Promise<PageResponse<AuditLogRealtimeDto>> => {
    const params: any = { page, size };
    
    if (filter.category) params.category = filter.category;
    if (filter.severity) params.severity = filter.severity;
    if (filter.startTime) params.startTime = filter.startTime.toISOString();
    if (filter.endTime) params.endTime = filter.endTime.toISOString();
    
    const response = await axiosClient.get('/api/admin/audit-logs/filtered', {
      params
    });
    return response.data;
  },

  // Get audit log statistics
  getAuditLogStats: async (): Promise<AuditLogStats> => {
    const response = await axiosClient.get('/api/admin/audit-logs/stats');
    return response.data;
  },

  // Get top active users
  getTopActiveUsers: async (limit: number = 10): Promise<UserActivitySummary[]> => {
    const response = await axiosClient.get('/api/admin/audit-logs/top-users', {
      params: { limit }
    });
    return response.data;
  }
};
