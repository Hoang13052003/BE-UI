// src/components/AuditLogDashboard/LiveFeed.tsx
import React from 'react';
// Giả sử AuditLogRealtimeDto được import từ dashboard hoặc một file types chung
import { AuditLogRealtimeDto } from './AuditLogDashboard'; // Hoặc import từ file types

interface LiveFeedProps {
  logs: AuditLogRealtimeDto[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ logs }) => {
  return (
    <div>
      <h2>Live Audit Feed (/topic/audit-logs)</h2>
      <div style={{ height: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '5px' }}>
        {logs.length === 0 && <p>No new logs yet...</p>}
        {logs.map((log) => (
          <div key={log.id} style={{ marginBottom: '5px', fontSize: '0.9em', borderBottom: '1px dotted #eee' }}>
            <small>{new Date(log.timestamp).toLocaleString()}</small> - <strong>{log.username || 'System'}</strong>: {log.actionType}
            <br />
            <small>Severity: {log.severity} | Details: {log.details || 'N/A'}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;