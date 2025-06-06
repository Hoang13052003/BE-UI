// src/hooks/useAuditLogData.ts
import { useState, useEffect, useCallback } from 'react';
import { useStompContext } from '../contexts/StompContext'; // Hook để lấy trạng thái kết nối
import {
  auditLogStompService,
  AuditLogRealtimeDto,
  AuditLogRequest,
  // Bạn cần export PageResponse từ service hoặc định nghĩa lại ở đây/file types
  // Giả sử bạn đã export từ service hoặc có file types chung:
} from '../services/stompService';

// Định nghĩa lại PageResponse nếu chưa export từ service hoặc file types chung
// (Tốt nhất là nên có một file types chung)
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
// const INITIAL_SUBSCRIBE_CONFIRMATION_TOPIC = '/app/audit-logs'; // Cho @SubscribeMapping

interface UseAuditLogDataReturn {
  liveAuditLogs: AuditLogRealtimeDto[];
  pagedAuditLogData: PageResponse<AuditLogRealtimeDto> | null;
  isLoadingPagedLogs: boolean; // Để biết khi nào đang tải dữ liệu phân trang
  fetchAuditLogs: (request: AuditLogRequest) => Promise<void>;
  // Có thể thêm các state khác như lỗi khi fetch, v.v.
}

export const useAuditLogData = (): UseAuditLogDataReturn => {
  const { isConnected } = useStompContext(); // Lấy trạng thái kết nối

  const [liveAuditLogs, setLiveAuditLogs] = useState<AuditLogRealtimeDto[]>([]);
  const [pagedAuditLogData, setPagedAuditLogData] = useState<PageResponse<AuditLogRealtimeDto> | null>(null);
  const [isLoadingPagedLogs, setIsLoadingPagedLogs] = useState<boolean>(false);
  // const [initialSubscriptionMessage, setInitialSubscriptionMessage] = useState<string | null>(null);


  // Callback khi nhận được live audit log mới
  const handleNewLiveLog = useCallback((newLog: AuditLogRealtimeDto) => {
    console.log('useAuditLogData: Received new live audit log:', newLog);
    setLiveAuditLogs(prevLogs =>
      [newLog, ...prevLogs].slice(0, 50) // Giữ lại 50 logs mới nhất
    );
  }, []);

  // Callback khi nhận được phản hồi dữ liệu audit log phân trang
  const handlePagedLogsResponse = useCallback((response: PageResponse<AuditLogRealtimeDto>) => {
    console.log('useAuditLogData: Received paged audit logs response:', response);
    setPagedAuditLogData(response);
    setIsLoadingPagedLogs(false);
  }, []);

  // Callback cho message từ @SubscribeMapping (nếu bạn muốn xử lý)
  // const handleInitialSubscription = useCallback((data: AuditLogRealtimeDto | string) => {
  //   if (typeof data === 'string') {
  //     console.log('useAuditLogData: Initial subscription message:', data);
  //     setInitialSubscriptionMessage(data);
  //   } else {
  //     // Xử lý nếu @SubscribeMapping trả về AuditLogRealtimeDto
  //     console.log('useAuditLogData: Unexpected object from initial subscription:', data);
  //   }
  // }, []);


  // Effect để quản lý subscriptions
  useEffect(() => {
    if (isConnected) {
      console.log('useAuditLogData: STOMP connected, setting up subscriptions for audit logs.');

      // Subscribe vào live stream
      auditLogStompService.subscribeToRealtimeStream(handleNewLiveLog);

      // Subscribe vào response của paged data
      auditLogStompService.subscribeToAuditLogResponses(handlePagedLogsResponse);

      // (Tùy chọn) Subscribe vào kênh xác nhận ban đầu từ @SubscribeMapping
      // auditLogStompService.subscribeToAuditLogs(handleInitialSubscription);

      // Cleanup function: unsubscribe khi hook unmount hoặc isConnected thay đổi thành false
      return () => {
        console.log('useAuditLogData: Cleaning up audit log subscriptions.');
        auditLogStompService.unsubscribe(LIVE_AUDIT_LOGS_TOPIC);
        auditLogStompService.unsubscribe(PAGED_AUDIT_LOGS_RESPONSE_TOPIC);
        // auditLogStompService.unsubscribe(INITIAL_SUBSCRIBE_CONFIRMATION_TOPIC);
      };
    } else {
      // Nếu không kết nối, đảm bảo dọn dẹp state (nếu cần)
      setLiveAuditLogs([]);
      setPagedAuditLogData(null);
      // setInitialSubscriptionMessage(null);
      setIsLoadingPagedLogs(false);
      // Không cần gọi unsubscribe ở đây vì effect trên sẽ xử lý khi isConnected thay đổi
    }
  }, [isConnected, handleNewLiveLog, handlePagedLogsResponse /*, handleInitialSubscription */]);


  // Hàm để component gọi để yêu cầu dữ liệu audit log phân trang
  const fetchAuditLogs = useCallback(async (request: AuditLogRequest) => {
    if (!isConnected) {
      console.warn('useAuditLogData: Cannot fetch audit logs, STOMP not connected.');
      // Có thể throw error hoặc set state lỗi để component hiển thị
      return;
    }
    console.log('useAuditLogData: Requesting paged audit logs:', request);
    setIsLoadingPagedLogs(true);
    try {
      await auditLogStompService.requestAuditLogs(request);
      // Dữ liệu sẽ được nhận qua handlePagedLogsResponse và cập nhật state
    } catch (error) {
      console.error('useAuditLogData: Error requesting paged audit logs:', error);
      setIsLoadingPagedLogs(false);
      // Xử lý lỗi, ví dụ set một state lỗi
    }
  }, [isConnected]); // Phụ thuộc isConnected

  return {
    liveAuditLogs,
    pagedAuditLogData,
    isLoadingPagedLogs,
    fetchAuditLogs,
    // initialSubscriptionMessage, // Nếu bạn dùng
  };
};