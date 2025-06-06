// src/config/auditLogConfig.ts

export enum AuditLogDataSource {
  WEBSOCKET = 'websocket',
  SSE = 'sse',
  REST_ONLY = 'rest'
}

export interface AuditLogConfig {
  // Phương thức data source mặc định
  defaultDataSource: AuditLogDataSource;
  
  // Có tự động fallback sang REST API không
  enableRestFallback: boolean;
  
  // Có tự động fallback sang SSE từ WebSocket không
  enableSseFallback: boolean;
  
  // Thời gian timeout cho connection (ms)
  connectionTimeout: number;
  
  // Số lần retry tối đa
  maxRetryAttempts: number;
  
  // Interval để refresh stats (ms)
  statsRefreshInterval: number;
  
  // Số lượng logs tối đa trong live feed
  maxLiveLogs: number;
}

// Cấu hình mặc định
export const defaultAuditLogConfig: AuditLogConfig = {
  // Mặc định sử dụng WebSocket, có thể thay đổi thành SSE
  defaultDataSource: AuditLogDataSource.WEBSOCKET,
  
  enableRestFallback: true,
  enableSseFallback: true,
  connectionTimeout: 5000,
  maxRetryAttempts: 3,
  statsRefreshInterval: 30000, // 30 seconds
  maxLiveLogs: 50
};

// Hàm để override config từ environment variables
export const getAuditLogConfig = (): AuditLogConfig => {
  const config = { ...defaultAuditLogConfig };
  
  // Có thể override từ environment variables
  const envDataSource = import.meta.env.VITE_AUDIT_LOG_DATA_SOURCE as AuditLogDataSource;
  if (envDataSource && Object.values(AuditLogDataSource).includes(envDataSource)) {
    config.defaultDataSource = envDataSource;
  }
  
  const envRestFallback = import.meta.env.VITE_AUDIT_LOG_REST_FALLBACK;
  if (envRestFallback !== undefined) {
    config.enableRestFallback = envRestFallback === 'true';
  }
  
  const envSseFallback = import.meta.env.VITE_AUDIT_LOG_SSE_FALLBACK;
  if (envSseFallback !== undefined) {
    config.enableSseFallback = envSseFallback === 'true';
  }
  
  const envTimeout = import.meta.env.VITE_AUDIT_LOG_CONNECTION_TIMEOUT;
  if (envTimeout && !isNaN(Number(envTimeout))) {
    config.connectionTimeout = Number(envTimeout);
  }
  
  const envMaxRetry = import.meta.env.VITE_AUDIT_LOG_MAX_RETRY;
  if (envMaxRetry && !isNaN(Number(envMaxRetry))) {
    config.maxRetryAttempts = Number(envMaxRetry);
  }
  
  return config;
};

// Export instance để sử dụng
export const auditLogConfig = getAuditLogConfig();
