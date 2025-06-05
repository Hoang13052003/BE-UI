// src/components/AuditLogDashboard/LogTable.tsx
import React from 'react';
// Giả sử AuditLogRealtimeDto và Page được import
import { AuditLogRealtimeDto, Page } from './AuditLogDashboard'; // Hoặc import từ file types

interface LogTableProps {
  logPage: Page<AuditLogRealtimeDto> | null;
  onPageChange: (newPage: number) => void;
  currentPage: number;
}

const LogTable: React.FC<LogTableProps> = ({ logPage, onPageChange, currentPage }) => {
  if (!logPage) {
    return <p>Loading paged logs or no data...</p>;
  }

  const { content, totalPages, number } = logPage;

  return (
    <div>
      <h2>Paged Audit Logs (/topic/audit-logs/response)</h2>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>Username</th>
            <th>Action</th>
            <th>Severity</th>
            <th>Details</th>
            <th>Success</th>
          </tr>
        </thead>
        <tbody>
          {content.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.username || 'N/A'}</td>
              <td>{log.actionType}</td>
              <td>{log.severity}</td>
              <td>{log.details || 'N/A'}</td>
              <td>{log.success ? 'Yes' : 'No'}</td>
            </tr>
          ))}
          {content.length === 0 && (
            <tr>
              <td colSpan={7}>No audit logs found for this page.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <span>Page {number + 1} of {totalPages}</span>
        <button onClick={() => onPageChange(number - 1)} disabled={number === 0}>
          Previous
        </button>
        <button onClick={() => onPageChange(number + 1)} disabled={number >= totalPages - 1}>
          Next
        </button>
      </div>
    </div>
  );
};

export default LogTable;