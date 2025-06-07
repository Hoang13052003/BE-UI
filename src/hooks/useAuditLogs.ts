// src/hooks/useAuditLogs.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import auditLogService, { FilterParams } from '../services/auditLogService';
import { AuditLog, RealtimeStatistics, Page, FilterOptions } from '../types/auditLog.types';

// Import các kiểu dữ liệu từ Ant Design để gõ kiểu cho callback
import { TablePaginationConfig } from 'antd/es/table';
import { SorterResult, FilterValue } from 'antd/es/table/interface';

// Import WebSocket
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Custom Hook để quản lý toàn bộ state và logic của trang Audit Log.
 * Hỗ trợ tải dữ liệu, phân trang, lọc, sắp xếp, và cập nhật real-time.
 */
export const useAuditLogs = () => {
  // State cho dữ liệu
  const [logsPage, setLogsPage] = useState<Page<AuditLog> | null>(null);
  const [stats, setStats] = useState<RealtimeStatistics | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  
  // State cho UI
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // State để lưu các tham số truy vấn hiện tại (bao gồm cả phân trang, lọc, sắp xếp)
  const [queryParams, setQueryParams] = useState<FilterParams>({
    page: 0,
    size: 10,
    sort: 'timestamp,desc', // Sắp xếp mặc định theo timestamp giảm dần
  });

  const stompClientRef = useRef<Client | null>(null);  /**
   * Hàm fetch dữ liệu chính, được gọi mỗi khi queryParams thay đổi.
   */
  const fetchLogs = useCallback(async (params: FilterParams) => {
    setLoading(true);
    setError(null);
    try {
      // Chúng ta sẽ dùng endpoint /filtered vì nó trả về Page<DTO> đơn giản hơn
      const response = await auditLogService.getFilteredRealtimeLogs(params);
      setLogsPage(response.data);
    } catch (err: any) {
      console.error("Failed to fetch logs:", err);
      setError(err.message || "Could not load audit log data.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * useEffect chính để theo dõi sự thay đổi của queryParams và gọi lại API.
   */
  useEffect(() => {
    fetchLogs(queryParams);
  }, [queryParams, fetchLogs]);

  /**
   * Tải các dữ liệu không thay đổi (stats, filter options) một lần duy nhất.
   */
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const { stats: initialStats, filterOptions: initialOptions } = 
          await auditLogService.getRealtimeDashboardInitialData();
        setStats(initialStats);
        setFilterOptions(initialOptions);
      } catch (err: any) {
        // Chỉ ghi log lỗi, không hiển thị lỗi lớn cho người dùng
        console.error("Failed to load static dashboard data:", err);
      }
    };
    fetchStaticData();
  }, []);
  // useEffect cho WebSocket (logic không đổi, chỉ cập nhật state cho đúng)
  useEffect(() => {
    // Chỉ thiết lập kết nối nếu chưa có
    if (!stompClientRef.current) {
      // Lấy JWT từ localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, WebSocket connection aborted.");
        return;
      }
      
      // Tạo một stomp client mới
      const client = new Client({
        // Dùng SockJS làm transport fallback
        webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`),
        
        // Gửi token trong header để backend xác thực
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        
        // Bật debug để xem log kết nối trong console
        debug: (str) => {
          console.log(new Date(), str);
        },
        
        // Tự động kết nối lại sau 5 giây nếu mất kết nối
        reconnectDelay: 5000,
      });

      // Xử lý khi kết nối thành công
      client.onConnect = (frame) => {
        setIsConnected(true);
        console.log('✅ WebSocket Connected:', frame);

        // Đăng ký (subscribe) vào kênh chính để nhận log mới
        client.subscribe('/topic/audit-logs', (message: IMessage) => {
          try {
            const newLog: AuditLog = JSON.parse(message.body);
            
            // Thêm log mới vào đầu danh sách
            setLogsPage(currentPage => {
              if (!currentPage) return null; // Trường hợp chưa có dữ liệu
              
              const newContent = [newLog, ...currentPage.content];
              // Giới hạn số lượng log hiển thị để tránh quá tải UI
              if (newContent.length > 100) {
                newContent.pop();
              }
              
              return {
                ...currentPage,
                content: newContent,
                totalElements: currentPage.totalElements + 1,
              };
            });

            // Cập nhật thống kê (cách đơn giản)
            setStats((currentStats: RealtimeStatistics | null) => {
                if (!currentStats) return null;
                const newTotal = (currentStats.total_logs || 0) + 1;
                const newSeverityBreakdown = { ...currentStats.severity_breakdown };
                
                // Cập nhật severity breakdown
                if (newLog.severity) {
                  const severityKey = newLog.severity.toUpperCase();
                  newSeverityBreakdown[severityKey] = (newSeverityBreakdown[severityKey] || 0) + 1;
                }
                
                // Cập nhật success/failure counts
                const newSuccessful = newLog.success 
                  ? (currentStats.successful_actions || 0) + 1 
                  : currentStats.successful_actions || 0;
                const newFailed = !newLog.success 
                  ? (currentStats.failed_actions || 0) + 1 
                  : currentStats.failed_actions || 0;
                
                return {
                  ...currentStats, 
                  total_logs: newTotal,
                  successful_actions: newSuccessful,
                  failed_actions: newFailed,
                  success_rate: newTotal > 0 ? (newSuccessful / newTotal) * 100 : 0,
                  severity_breakdown: newSeverityBreakdown
                };
            });

          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        });

        // Đăng ký vào kênh cảnh báo
        client.subscribe('/topic/admin-alerts', (message: IMessage) => {
          const alert: AuditLog = JSON.parse(message.body);
          // TODO: Hiển thị một toast notification, ví dụ dùng react-toastify
          // toast.error(`CRITICAL ACTION: ${alert.details}`);
          console.error(`🚨 CRITICAL ACTION: ${alert.details}`);
        });
      };

      // Xử lý khi mất kết nối
      client.onDisconnect = () => {
        setIsConnected(false);
        console.log('❌ WebSocket Disconnected');
      };

      // Xử lý lỗi STOMP
      client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      };

      // Kích hoạt client và lưu vào ref
      client.activate();
      stompClientRef.current = client;
    }

    // Hàm dọn dẹp: sẽ được gọi khi component unmount
    return () => {
      if (stompClientRef.current?.active) {
        console.log('Deactivating WebSocket client...');
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, []); // [] đảm bảo effect này chỉ chạy một lần duy nhất trong vòng đời của hook

  /**
   * Hàm callback chính được truyền cho prop `onChange` của Ant Design Table.
   * Xử lý cả 3 sự kiện: phân trang, lọc, và sắp xếp.
   */
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<AuditLog> | SorterResult<AuditLog>[]
  ) => {
    // Xây dựng các tham số truy vấn mới
    const newParams: FilterParams = {
      page: (pagination.current ?? 1) - 1, // Antd page bắt đầu từ 1
      size: pagination.pageSize ?? 10,
    };

    // Xử lý sắp xếp
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    if (singleSorter.field && singleSorter.order) {
      const direction = singleSorter.order === 'ascend' ? 'asc' : 'desc';
      newParams.sort = `${String(singleSorter.field)},${direction}`;
    } else {
      newParams.sort = 'timestamp,desc'; // Mặc định
    }    // Xử lý lọc
    Object.keys(filters).forEach(key => {
      const filterValue = filters[key];
      if (filterValue && filterValue.length > 0) {
        // Antd trả về một mảng, chúng ta lấy phần tử đầu tiên
        // API của bạn có thể cần xử lý mảng (ví dụ: /api?severity=INFO&severity=ERROR)
        (newParams as any)[key] = String(filterValue[0]);
      }
    });
    
    // Cập nhật state queryParams, điều này sẽ trigger useEffect để gọi lại API
    setQueryParams(newParams);
  };
  return {
    logs: logsPage?.content ?? [],
    // Cấu hình pagination cho Ant Design Table
    paginationConfig: {
      current: (logsPage?.number ?? 0) + 1,
      pageSize: logsPage?.size ?? 10,
      total: logsPage?.totalElements ?? 0,
      showSizeChanger: true,
      showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} items`,
    },
    stats,
    filterOptions,
    loading,
    error,
    isConnected,
    handleTableChange, // Trả về hàm callback này cho component
  };
};