// src/utils/styleUtils.ts

import { AuditLogSeverity } from '../types/auditLog.types';

/**
 * Trả về màu sắc tương ứng của Ant Design Tag cho mỗi mức độ nghiêm trọng.
 * @param severity - Mức độ nghiêm trọng của log.
 * @returns Tên màu của Ant Design.
 */
export const getSeverityTagColor = (severity: AuditLogSeverity): string => {
  switch (severity) {
    case AuditLogSeverity.CRITICAL:
      return 'volcano'; // Màu đỏ đậm
    case AuditLogSeverity.ERROR:
      return 'error';   // Màu đỏ
    case AuditLogSeverity.WARNING:
      return 'warning'; // Màu vàng
    case AuditLogSeverity.INFO:
      return 'processing'; // Màu xanh dương
    default:
      return 'default'; // Màu xám
  }
};