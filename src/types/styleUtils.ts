// src/utils/styleUtils.ts (PHIÊN BẢN CẬP NHẬT)

// Import enum đã định nghĩa
import { AuditLogSeverity } from '../types/auditLog.types';

/**
 * Trả về tên màu tương ứng của Ant Design Tag cho mỗi mức độ nghiêm trọng.
 * @param severity - Mức độ nghiêm trọng của log (dạng enum).
 * @returns Tên màu của Ant Design.
 */
export const getSeverityTagColor = (severity: AuditLogSeverity): string => {
  // Bây giờ chúng ta so sánh trực tiếp với enum, không cần .toUpperCase()
  switch (severity) {
    case AuditLogSeverity.CRITICAL:
      return 'volcano';
    case AuditLogSeverity.ERROR:
      return 'error';
    case AuditLogSeverity.WARNING:
      return 'warning';
    case AuditLogSeverity.INFO:
      return 'processing';
    default:
      // Trường hợp này gần như không bao giờ xảy ra nhờ TypeScript,
      // nhưng vẫn là một thói quen tốt để có fallback.
      return 'default';
  }
};