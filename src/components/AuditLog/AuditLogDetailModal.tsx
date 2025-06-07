// src/components/AuditLogDetailModal.tsx

import React from 'react';
import { AuditLog } from '../../types/auditLog.types';
import './AuditLogDetailModal.css';

interface ModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

/**
 * Modal hiển thị toàn bộ chi tiết của một bản ghi Audit Log.
 */
const AuditLogDetailModal: React.FC<ModalProps> = ({ log, onClose }) => {
  if (!log) {
    return null; // Không render gì cả nếu không có log nào được chọn
  }

  // Hàm để render một cặp key-value, bỏ qua nếu value là null/undefined
  const renderDetailRow = (label: string, value: any) => {
    if (value === null || value === undefined) return null;
    return (
      <div className="detail-row">
        <strong className="detail-label">{label}:</strong>
        <span className="detail-value">{String(value)}</span>
      </div>
    );
  };

  return (
    // Backdrop để làm mờ nền
    <div className="modal-backdrop" onClick={onClose}>
      {/* Ngăn việc click vào content modal làm đóng modal */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log Details</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {renderDetailRow('ID', log.id)}
          {renderDetailRow('Timestamp', new Date(log.timestamp).toLocaleString())}
          {renderDetailRow('Username', log.username)}
          {renderDetailRow('User ID', log.userId)}
          {renderDetailRow('IP Address', log.ipAddress)}
          {renderDetailRow('User Agent', log.userAgent)}
          <hr />
          {renderDetailRow('Action', log.actionType)}
          {renderDetailRow('Category', log.category)}
          {renderDetailRow('Severity', log.severity)}
          {renderDetailRow('Status', log.success ? 'Success' : 'Failure')}
          <hr />
          {renderDetailRow('Target Entity', log.targetEntity)}
          {renderDetailRow('Target Entity ID', log.targetEntityId)}
          <div className="detail-row full-width">
            <strong className="detail-label">Details:</strong>
            <pre className="detail-pre">{log.details || 'No details provided.'}</pre>
          </div>
          {log.metadata && (
            <div className="detail-row full-width">
              <strong className="detail-label">Metadata:</strong>
              {/* Dùng JSON.stringify để hiển thị đẹp object metadata */}
              <pre className="detail-pre">{JSON.stringify(log.metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal;