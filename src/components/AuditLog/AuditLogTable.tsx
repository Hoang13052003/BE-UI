// src/components/AuditLogTable.tsx

import React, { useState } from 'react';
import { AuditLog } from '../../types/auditLog.types';
import AuditLogDetailModal from './AuditLogDetailModal'; // Import modal

import './AuditLogTable.css'; // File CSS cho table

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
}

/**
 * Component hiển thị bảng dữ liệu Audit Log với skeleton loading và modal chi tiết.
 */
const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs, isLoading }) => {
  // State để quản lý log nào đang được chọn để xem chi tiết
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const handleRowClick = (log: AuditLog) => {
    setSelectedLog(log);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
  };

  // Component cho một hàng skeleton
  const SkeletonRow = () => (
    <tr>
      {Array.from({ length: 6 }).map((_, index) => (
        <td key={index}><div className="skeleton-text"></div></td>
      ))}
    </tr>
  );

  return (
    <>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Username</th>
              <th>Action</th>
              <th>Severity</th>
              <th>Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Hiển thị 10 hàng skeleton khi đang tải
              Array.from({ length: 10 }).map((_, index) => <SkeletonRow key={index} />)
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} onClick={() => handleRowClick(log)} className="clickable-row">
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.username ?? 'N/A'}</td>
                  <td>{log.actionType}</td>
                  <td>
                    <span className={`severity-badge severity-${log.severity?.toLowerCase()}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="details-cell">{log.details}</td>
                  <td>
                    {log.success ? (
                      <span className="status-badge status-success">Success</span>
                    ) : (
                      <span className="status-badge status-failure">Failure</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No audit logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Render modal. Nó chỉ hiển thị khi selectedLog không phải là null */}
      <AuditLogDetailModal log={selectedLog} onClose={handleCloseModal} />
    </>
  );
};

export default AuditLogTable;