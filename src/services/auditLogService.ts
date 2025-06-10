// src/services/auditLogService.ts

import { AxiosResponse } from 'axios';
import axiosClient from '../api/axiosClient'; // Giả sử bạn đã có file này
import { AuditLog, AuthStats, Page } from '../types/auditLog.types';

const API_PREFIX = '/api/admin/audit-logs';

const auditLogService = {
  /**
   * Lấy các log xác thực gần đây. BE trả về List<AuditLog>.
   */
  getRecentAuthLogs: (limit = 50): Promise<AxiosResponse<AuditLog[]>> => {
    return axiosClient.get(`${API_PREFIX}/recent`, { params: { limit } });
  },

  /**
   * Lấy các log thuộc danh mục AUTH, có phân trang.
   */
  getAuthLogsByCategory: (page = 0, size = 20): Promise<AxiosResponse<Page<AuditLog>>> => {
    // Chỉ gọi với category AUTH như logic của BE
    return axiosClient.get(`${API_PREFIX}/category/AUTH`, { params: { page, size } });
  },

  /**
   * Lấy các thống kê cơ bản.
   */
  getBasicAuthStats: (): Promise<AxiosResponse<AuthStats>> => {
    return axiosClient.get(`${API_PREFIX}/stats`);
  },
};

export default auditLogService;