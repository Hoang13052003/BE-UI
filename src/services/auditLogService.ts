import { AxiosResponse } from "axios";
import axiosClient from "../api/axiosClient";
import { AuditLog, AuthStats, Page } from "../types/auditLog.types";

const API_PREFIX = "/api/admin/audit-logs";

const auditLogService = {
  getRecentAuthLogs: (limit = 50): Promise<AxiosResponse<AuditLog[]>> => {
    return axiosClient.get(`${API_PREFIX}/recent`, { params: { limit } });
  },

  getAuthLogsByCategory: (
    page = 0,
    size = 20
  ): Promise<AxiosResponse<Page<AuditLog>>> => {
    return axiosClient.get(`${API_PREFIX}/category/AUTH`, {
      params: { page, size },
    });
  },

  getBasicAuthStats: (): Promise<AxiosResponse<AuthStats>> => {
    return axiosClient.get(`${API_PREFIX}/stats`);
  },
};

export default auditLogService;
