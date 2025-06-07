// src/services/auditLogService.ts

import { AxiosResponse } from 'axios';
import axiosClient from '../api/axiosClient'; // Import "cỗ máy" API của bạn
import { AuditLog, AuditStats, Page } from '../types/auditLog.types';

/**
 * Định nghĩa kiểu dữ liệu cho các tham số lọc.
 * Giúp code an toàn và dễ dàng mở rộng khi có thêm bộ lọc mới.
 */
export interface FilterParams {
  page?: number;
  size?: number;
  action?: string;
  username?: string;
  resource?: string;
  // Gửi ngày tháng ở định dạng ISO 8601 để tương thích với @DateTimeFormat của Spring
  startDate?: string; 
  endDate?: string;
}

/**
 * Base URL cho tất cả các API endpoint của audit logs
 */
const BASE_URL = '/admin/audit-logs';

/**
 * Service object chứa tất cả các hàm gọi API liên quan đến Audit Log.
 * Mỗi hàm tương ứng với một endpoint ở backend.
 */
const auditLogService = {
  /**
   * Lấy dữ liệu log gần đây với phân trang.
   * @param page - Số trang (mặc định 0)
   * @param size - Kích thước trang (mặc định 50)
   * @returns Promise chứa Page<AuditLog>
   */
  getRecentLogs: (page = 0, size = 50): Promise<AxiosResponse<Page<AuditLog>>> => {
    return axiosClient.get(`${BASE_URL}/recent?page=${page}&size=${size}`);
  },

  /**
   * Lấy thống kê hiệu suất của audit logs.
   * @returns Promise chứa AuditStats
   */
  getPerformanceStats: (): Promise<AxiosResponse<AuditStats>> => {
    return axiosClient.get(`${BASE_URL}/performance-stats`);
  },

  /**
   * Lấy các tùy chọn lọc có sẵn.
   * @returns Promise chứa các tùy chọn lọc
   */
  getFilterOptions: (): Promise<AxiosResponse<Record<string, string[]>>> => {
    return axiosClient.get(`${BASE_URL}/filter-options`);
  },

  /**
   * Lấy dữ liệu tổng quan cho Dashboard.
   * Gộp nhiều lời gọi API để tải dữ liệu ban đầu cho trang.
   * @returns Một object chứa logs, stats, và các tùy chọn lọc.
   */
  getDashboardInitialData: async () => {
    // Sử dụng Promise.all để gửi các request song song, tăng tốc độ tải trang.
    const [logsResponse, statsResponse, filterOptionsResponse] = await Promise.all([
      auditLogService.getRecentLogs(0, 50),
      auditLogService.getPerformanceStats(),
      auditLogService.getFilterOptions(),
    ]);

    return {
      logs: logsResponse.data,
      stats: statsResponse.data,
      filterOptions: filterOptionsResponse.data,
    };
  },

  /**
   * Lấy dữ liệu log đã được lọc và phân trang.
   * Tương ứng với API: GET /admin/audit-logs/dashboard (hoặc /filtered)
   * @param params - Object chứa các tham số lọc.
   * @returns Một Promise chứa Page<AuditLog>.
   */
  getFilteredLogs: (params: FilterParams): Promise<AxiosResponse<Page<AuditLog>>> => {
    // axios sẽ tự động chuyển đổi object `params` thành query string, ví dụ: ?page=1&size=20
    return axiosClient.get<Page<AuditLog>>(`${BASE_URL}/dashboard`, { params });
  },

  /**
   * Xuất dữ liệu audit log ra file.
   * @param format - Định dạng file ('csv' hoặc 'json').
   * @param params - Các tham số lọc để xác định dữ liệu cần xuất.
   * @returns Dữ liệu file dưới dạng Blob.
   */
  exportLogs: (format: 'csv' | 'json', params: Omit<FilterParams, 'page' | 'size'>): Promise<AxiosResponse<Blob>> => {
    const exportParams = { ...params, format };
    return axiosClient.get(`${BASE_URL}/export`, {
      params: exportParams,
      responseType: 'blob', // Rất quan trọng: Yêu cầu axios trả về dữ liệu dạng file.
    });
  }
};

export default auditLogService;