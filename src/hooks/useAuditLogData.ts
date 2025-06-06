// src/hooks/useAuditLogData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useStompContext } from '../contexts/StompContext';
import {
  auditLogStompService,
  AuditLogRealtimeDto,
  AuditLogRequest,
} from '../services/stompService';
import { auditLogApi } from '../api/auditLogApi';

// Re-export AuditLogRealtimeDto để các component khác có thể import
export type { AuditLogRealtimeDto };

// Định nghĩa lại PageResponse nếu chưa export từ service hoặc file types chung
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // trang hiện tại (0-indexed)
  size: number;
  last: boolean;
  first: boolean;
  // ... các thuộc tính khác của Page object từ Spring
}


const LIVE_AUDIT_LOGS_TOPIC = '/topic/audit-logs';
const PAGED_AUDIT_LOGS_RESPONSE_TOPIC = '/topic/audit-logs/response';

interface UseAuditLogDataReturn {
  liveAuditLogs: AuditLogRealtimeDto[];
  pagedAuditLogData: PageResponse<AuditLogRealtimeDto> | null;
  isLoadingPagedLogs: boolean;
  fetchAuditLogs: (request: AuditLogRequest) => Promise<void>;
  reconnectionStatus: {
    attempts: number;
    maxAttempts: number;
    shouldReconnect: boolean;
    canReconnect: boolean;
  };
  resetReconnection: () => void;
  error: string | null;
  clearError: () => void;
}

export const useAuditLogData = (): UseAuditLogDataReturn => {
  const { isConnected } = useStompContext();
  const [liveAuditLogs, setLiveAuditLogs] = useState<AuditLogRealtimeDto[]>([]);
  const [pagedAuditLogData, setPagedAuditLogData] = useState<PageResponse<AuditLogRealtimeDto> | null>(null);
  const [isLoadingPagedLogs, setIsLoadingPagedLogs] = useState<boolean>(false);  const [reconnectionStatus, setReconnectionStatus] = useState(auditLogStompService.getReconnectionStatus());
  const [error, setError] = useState<string | null>(null);
  // Use useRef to store timeouts to avoid dependency issues
  const pendingTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  // Track which page is currently requested to avoid stale timeouts firing fallback
  const lastRequestedPageRef = useRef<number | null>(null);
  // Track WS response arrival to prevent fallback after response
  const hasPagedResponseRef = useRef<boolean>(false);

  // Clear error function
  const clearError = useCallback(() => {
    console.log('useAuditLogData: Clearing error state');
    setError(null);
  }, []);


  // Callback khi nhận được live audit log mới
  const handleNewLiveLog = useCallback((newLog: AuditLogRealtimeDto) => {
    console.log('useAuditLogData: Received new live audit log:', newLog);
    setLiveAuditLogs(prevLogs =>
      [newLog, ...prevLogs].slice(0, 50) // Giữ lại 50 logs mới nhất
    );
  }, []);  // Callback khi nhận được phản hồi dữ liệu audit log phân trang
  const handlePagedLogsResponse = useCallback((response: PageResponse<AuditLogRealtimeDto>) => {
    console.log('useAuditLogData: Received paged audit logs response:', response);
    setPagedAuditLogData(response);
    setIsLoadingPagedLogs(false);
    setError(null);

    // Mark that we got a response, so timeout fallback should not fire
    hasPagedResponseRef.current = true;

    // Clear any pending timeouts since we got the response
    pendingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    pendingTimeoutsRef.current.clear();

    // Reset the last requested page so no stale fallback fires
    lastRequestedPageRef.current = null;
  }, []);
  // Effect để quản lý subscriptions
  useEffect(() => {
    setReconnectionStatus(auditLogStompService.getReconnectionStatus());
    
    if (isConnected) {
      console.log('useAuditLogData: STOMP connected, setting up subscriptions for audit logs.');

      // Subscribe vào live stream
      auditLogStompService.subscribeToRealtimeStream(handleNewLiveLog);

      // Subscribe vào response của paged data
      auditLogStompService.subscribeToAuditLogResponses(handlePagedLogsResponse);

      // Clear any connection errors
      setError(null);

      // Cleanup function
      return () => {
        console.log('useAuditLogData: Cleaning up audit log subscriptions.');        auditLogStompService.unsubscribe(LIVE_AUDIT_LOGS_TOPIC);
        auditLogStompService.unsubscribe(PAGED_AUDIT_LOGS_RESPONSE_TOPIC);
        
        // Clear any pending timeouts
        pendingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        pendingTimeoutsRef.current.clear();
      };
    } else {      // Nếu không kết nối, đảm bảo dọn dẹp state và reset loading
      setLiveAuditLogs([]);
      setIsLoadingPagedLogs(false);
      
      // Clear any pending timeouts
      pendingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      pendingTimeoutsRef.current.clear();
    }
  }, [isConnected, handleNewLiveLog, handlePagedLogsResponse]);
  // Hàm để component gọi để yêu cầu dữ liệu audit log phân trang
  const fetchAuditLogs = useCallback(async (request: AuditLogRequest) => {
    const pageNum = request.page || 0;
    // before sending, reset response flag
    hasPagedResponseRef.current = false;
    lastRequestedPageRef.current = pageNum;
    setIsLoadingPagedLogs(true);
    setError(null);

    try {
      if (isConnected) {
        console.log('useAuditLogData: Requesting paged audit logs via WebSocket:', request);
        await auditLogStompService.requestAuditLogs(request);

        // Set a timeout to prevent infinite loading if WebSocket fails
        const timeoutId = setTimeout(() => {
          // skip fallback if response has arrived or page changed
          if (hasPagedResponseRef.current || lastRequestedPageRef.current !== pageNum) {
            return;
          }
          console.warn('useAuditLogData: WebSocket response timeout, falling back to REST API');
          pendingTimeoutsRef.current.delete(timeoutId);

          // Fallback to REST API
          auditLogApi.getRecentAuditLogs(pageNum, request.size || 50)
            .then(response => {
              setPagedAuditLogData(response);
              setIsLoadingPagedLogs(false);
            })
            .catch(err => {
              console.error('useAuditLogData: REST API fallback failed:', err);
              setError('Failed to fetch audit logs. Please try again.');
              setIsLoadingPagedLogs(false);
            });
        }, 10000); // 10 second timeout

        pendingTimeoutsRef.current.add(timeoutId);
      } else {
        // Fallback to REST API
        console.log('useAuditLogData: WebSocket not connected, using REST API fallback:', request);
        const response = await auditLogApi.getRecentAuditLogs(
          request.page || 0, 
          request.size || 50
        );
        setPagedAuditLogData(response);
        setIsLoadingPagedLogs(false);
      }
    } catch (error) {
      console.error('useAuditLogData: Error requesting paged audit logs:', error);
      setError('Failed to fetch audit logs. Please try again.');
      setIsLoadingPagedLogs(false);
    }
  }, [isConnected]);
  // Hàm để reset reconnection từ component
  const resetReconnection = useCallback(() => {
    auditLogStompService.resetReconnection();
    setReconnectionStatus(auditLogStompService.getReconnectionStatus());
    setError(null);
    // Also reset loading state to prevent stuck loading
    setIsLoadingPagedLogs(false);    // Clear any pending timeouts
    pendingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    pendingTimeoutsRef.current.clear();
  }, []);

  // Auto-fetch initial data when component mounts
  useEffect(() => {
    const initialFetch = async () => {
      try {
        await fetchAuditLogs({ page: 0, size: 50 });
      } catch (error) {
        console.error('useAuditLogData: Failed to fetch initial audit logs:', error);
      }
    };
    
    initialFetch();
  }, [fetchAuditLogs]);

  // Effect để cleanup timeouts khi component unmount
  useEffect(() => {
    return () => {
      console.log(`useAuditLogData: Component unmounting, clearing timeouts...`);
      pendingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      pendingTimeoutsRef.current.clear();
    };
  }, []); // Remove pendingTimeouts from dependency array to prevent infinite loop

  // Effect để tự động reset loading state nếu bị stuck quá lâu
  useEffect(() => {
    if (isLoadingPagedLogs) {
      const maxLoadingTime = setTimeout(() => {
        console.warn('useAuditLogData: Loading state stuck, auto-resetting...');
        setIsLoadingPagedLogs(false);
        setError('Request timeout. Please try refreshing.');
      }, 10000); // 10 seconds max loading time

      return () => clearTimeout(maxLoadingTime);
    }
  }, [isLoadingPagedLogs]);

  return {
    liveAuditLogs,
    pagedAuditLogData,
    isLoadingPagedLogs,
    fetchAuditLogs,
    reconnectionStatus,
    resetReconnection,
    error,
    clearError,
  };
};
