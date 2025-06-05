// src/components/AuditLogDashboard/AuditLogDashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useStomp } from '../../hooks/useStomp';
import { IMessage } from '@stomp/stompjs';
import LiveFeed from './LiveFeed';
import LogTable from './LogTable';

// Định nghĩa kiểu dữ liệu cho AuditLog DTO từ backend
interface AuditLogRealtimeDto {
  id: string;
  timestamp: string; // ISO 8601 string
  username: string | null;
  ipAddress: string | null;
  actionType: string; // Enum as string
  category: string;   // Enum as string
  severity: string;   // Enum as string
  targetEntity: string | null;
  targetEntityId: string | null;
  details: string | null;
  success: boolean;
}

// Định nghĩa kiểu dữ liệu cho Payload yêu cầu audit logs (khớp với backend)
interface AuditLogRequestPayload {
  page: number;
  size: number;
}

// Định nghĩa kiểu dữ liệu cho Page response từ backend
interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // Current page number (0-indexed)
  size: number;
  // ... các thuộc tính khác của Page nếu có
}

const AUDIT_LOGS_TOPIC = '/topic/audit-logs';
const AUDIT_LOGS_RESPONSE_TOPIC = '/topic/audit-logs/response';
const AUDIT_LOGS_REQUEST_DESTINATION = '/app/audit-logs/request';

const AuditLogDashboard: React.FC = () => {
  const { isConnected, connect, disconnect, subscribe, unsubscribe, publish } = useStomp();
  const [liveLogs, setLiveLogs] = useState<AuditLogRealtimeDto[]>([]);
  const [pagedLogs, setPagedLogs] = useState<Page<AuditLogRealtimeDto> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Callback khi nhận được live audit log mới
  const handleNewAuditLog = useCallback((message: IMessage) => {
    try {
      const newLog = JSON.parse(message.body) as AuditLogRealtimeDto;
      console.log("Dashboard: New live audit log:", newLog);
      setLiveLogs(prevLogs => [newLog, ...prevLogs.slice(0, 49)]); // Giữ lại tối đa 50 logs
    } catch (error) {
      console.error("Dashboard: Error parsing live audit log message:", error);
    }
  }, []);

  // Callback khi nhận được trang audit logs
  const handlePagedAuditLogs = useCallback((message: IMessage) => {
    try {
      const logPage = JSON.parse(message.body) as Page<AuditLogRealtimeDto>;
      console.log("Dashboard: Received paged audit logs:", logPage);
      setPagedLogs(logPage);
    } catch (error) {
      console.error("Dashboard: Error parsing paged audit log message:", error);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      console.log("Dashboard: STOMP connected, subscribing to topics...");
      subscribe(AUDIT_LOGS_TOPIC, handleNewAuditLog);
      subscribe(AUDIT_LOGS_RESPONSE_TOPIC, handlePagedAuditLogs);

      // Yêu cầu trang log đầu tiên sau khi subscribe
      requestAuditLogs(currentPage, pageSize);

      return () => {
        console.log("Dashboard: Unsubscribing from STOMP topics...");
        unsubscribe(AUDIT_LOGS_TOPIC);
        unsubscribe(AUDIT_LOGS_RESPONSE_TOPIC);
      };
    }
  }, [isConnected, subscribe, unsubscribe, handleNewAuditLog, handlePagedAuditLogs, currentPage, pageSize]);
  // Chú ý: currentPage, pageSize trong dependencies của useEffect này
  // có thể gây subscribe/unsubscribe liên tục nếu chúng thay đổi thường xuyên từ bên ngoài.
  // Cân nhắc việc chỉ gọi requestAuditLogs khi isConnected thay đổi,
  // và có hàm riêng để fetch khi page/size thay đổi.

  const requestAuditLogs = useCallback((page: number, size: number) => {
    if (isConnected) {
      const payload: AuditLogRequestPayload = { page, size };
      console.log("Dashboard: Requesting audit logs:", payload);
      publish(AUDIT_LOGS_REQUEST_DESTINATION, JSON.stringify(payload));
    } else {
      console.warn("Dashboard: Cannot request audit logs, STOMP not connected.");
    }
  }, [isConnected, publish]);


  const handleConnect = () => {
    console.log("Dashboard: Attempting to connect STOMP...");
    connect(); // useStomp.connect()
  };

  const handleDisconnect = () => {
    console.log("Dashboard: Attempting to disconnect STOMP...");
    disconnect(); // useStomp.disconnect()
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    requestAuditLogs(newPage, pageSize);
  };

  return (
    <div>
      <h1>Audit Log Dashboard</h1>
      <div>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
        {!isConnected && <button onClick={handleConnect}>Connect STOMP</button>}
        {isConnected && <button onClick={handleDisconnect}>Disconnect STOMP</button>}
      </div>

      <hr />
      <LiveFeed logs={liveLogs} />

      <hr />
      <LogTable
        logPage={pagedLogs}
        onPageChange={handlePageChange}
        currentPage={currentPage} // hoặc pagedLogs?.number
      />
       <button onClick={() => requestAuditLogs(currentPage, pageSize)}>Refresh Paged Logs</button>
    </div>
  );
};

export default AuditLogDashboard;