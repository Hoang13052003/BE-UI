// src/services/auditLogService.ts

import { AxiosResponse } from 'axios';
import axiosClient from '../api/axiosClient';
import { 
  AuditLog, 
  Page, 
  RealtimeStatistics, 
  FilterOptions, 
  DashboardData 
} from '../types/auditLog.types';

export interface FilterParams {
  page?: number;
  size?: number;
  action?: string;
  username?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}

// === TIỀN TỐ API ĐÃ ĐƯỢC PHÂN TÁCH RÕ RÀNG ===
const ANALYTICS_PREFIX = '/api/admin/audit-logs';
const REALTIME_PREFIX = '/api/admin/audit-logs/realtime';

const auditLogService = {
  /**
   * Lấy dữ liệu tổng quan ban đầu cho Dashboard Real-time.
   * Gọi các endpoint từ AuditLogRealtimeController.
   */
  getRealtimeDashboardInitialData: async (): Promise<{
    logsPage: Page<AuditLog>;
    stats: RealtimeStatistics;
    filterOptions: FilterOptions;
  }> => {
    const [logsResponse, statsResponse, filterOptionsResponse] = await Promise.all([
      // Gọi đến /realtime/recent
      axiosClient.get<Page<AuditLog>>(`${REALTIME_PREFIX}/recent`, { params: { size: 50 } }),
      // Gọi đến /realtime/stats
      axiosClient.get<RealtimeStatistics>(`${REALTIME_PREFIX}/stats`),
      // Gọi đến /realtime/filter-options
      axiosClient.get<FilterOptions>(`${REALTIME_PREFIX}/filter-options`),
    ]);

    return {
      logsPage: logsResponse.data,
      stats: statsResponse.data,
      filterOptions: filterOptionsResponse.data,
    };
  },
  /**
   * Lấy dữ liệu cho trang Analytics phức tạp.
   * Gọi đến endpoint /dashboard trong AuditLogController.
   */
  getAnalyticsDashboardData: (params: FilterParams): Promise<AxiosResponse<DashboardData>> => {
    // Gọi đến /dashboard
    return axiosClient.get<DashboardData>(`${ANALYTICS_PREFIX}/dashboard`, { params });
  },

  /**
   * Lấy dữ liệu log đã lọc từ Real-time endpoint.
   * Trả về Page<AuditLog> đơn giản để dễ dàng sử dụng với Ant Design Table.
   */
  getFilteredRealtimeLogs: (params: FilterParams): Promise<AxiosResponse<Page<AuditLog>>> => {
    return axiosClient.get<Page<AuditLog>>(`${REALTIME_PREFIX}/filtered`, { params });
  },

  /**
   * Xuất dữ liệu audit log ra file.
   * Gọi đến ANALYTICS_PREFIX cho xuất dữ liệu.
   */
  exportLogs: (format: 'csv' | 'json', params: Omit<FilterParams, 'page' | 'size'>): Promise<AxiosResponse<Blob>> => {
    const exportParams = { ...params, format };
    return axiosClient.get(`${ANALYTICS_PREFIX}/export`, {
      params: exportParams,
      responseType: 'blob',
    });
  },
};

export default auditLogService;