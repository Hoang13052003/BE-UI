// src/types/auditLog.types.ts

// --- ENUMS (Không đổi) ---
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

// --- INTERFACE CHÍNH CHO AUDIT LOG (Không đổi) ---
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

// --- INTERFACE CHO PAGE OBJECT (Không đổi) ---
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

// ==========================================================
// MỚI: ĐỊNH NGHĨA CHI TIẾT CHO CÁC API PHỨC TẠP
// ==========================================================

/**
 * Kiểu dữ liệu cho một người dùng hoạt động tích cực nhất.
 * Tương ứng với `top_users` trong `RealtimeStatistics`.
 */
export interface TopUser {
  username: string;
  activity_count: number;
}

/**
 * Kiểu dữ liệu cho xu hướng hoạt động theo giờ.
 * Tương ứng với `hourly_trend` trong `RealtimeStatistics`.
 */
export interface HourlyTrend {
  hour: string; // ISO DateTime string
  count: number;
}

/**
 * Interface chi tiết cho các số liệu thống kê real-time.
 * Phản ánh chính xác cấu trúc Map trả về từ BE.
 */
export interface RealtimeStatistics {
  total_logs: number;
  successful_actions: number;
  failed_actions: number;
  success_rate: number;
  category_breakdown: Record<string, number>; // Ví dụ: { "AUTH": 10, "ACTION": 50 }
  severity_breakdown: Record<string, number>; // Ví dụ: { "INFO": 100, "ERROR": 5 }
  top_users: TopUser[];
  hourly_trend: HourlyTrend[];
  query_time_ms?: number;
  period_start?: string;
  period_end?: string;
}

/**
 * Interface cho dữ liệu trả về từ endpoint /dashboard.
 * Đây là cấu trúc dữ liệu phức hợp nhất.
 */
export interface DashboardData {
  // Lưu ý: BE trả về List<AuditLog> chứ không phải Page<AuditLog> trong Map này.
  auditLogs: AuditLog[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  statistics: RealtimeStatistics;
  filter_applied: Record<string, any>;
  query_time_ms?: number;
  last_updated?: string;
}

/**
 * Interface cho các tùy chọn bộ lọc.
 * Tương ứng với endpoint /filter-options.
 */
export interface FilterOptions {
  actions: string[];
  users: string[];
  resources: string[];
  categories: string[];
  severities: string[];
}