// src/hooks/useAuditLogs.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import auditLogService, { FilterParams } from '../services/auditLogService';
import { AuditLog, AuditStats, Page, AuditLogSeverity } from '../types/auditLog.types';

// Import các thư viện STOMP
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Custom Hook để quản lý toàn bộ state và logic của trang Audit Log,
 * bao gồm cả việc tải dữ liệu ban đầu và cập nhật real-time qua WebSocket.
 */
export const useAuditLogs = () => {
  // === STATE CHO DỮ LIỆU ===
  const [logsPage, setLogsPage] = useState<Page<AuditLog> | null>(null);
  const [stats, setStats] = useState<AuditStats | null>(null);
  
  // === STATE CHO UI ===
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false); // State cho trạng thái kết nối WS

  // useRef để giữ instance của stompClient không bị tạo lại mỗi lần render
  const stompClientRef = useRef<Client | null>(null);
  // === CÁC HÀM GỌI API (KHÔNG ĐỔI) ===
  /**
   * Tải dữ liệu ban đầu cho dashboard.
   * Sử dụng useCallback để tránh việc hàm này được tạo lại một cách không cần thiết.
   */
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { logs, stats } = await auditLogService.getDashboardInitialData();
      setLogsPage(logs);
      setStats(stats);
    } catch (err: any) {
      console.error("Failed to fetch initial data:", err);
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy dữ liệu log dựa trên các bộ lọc và phân trang.
   */
  const fetchFilteredLogs = useCallback(async (params: FilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditLogService.getFilteredLogs(params);
      setLogsPage(response.data);
    } catch (err: any) {
      console.error("Failed to fetch filtered logs:", err);
      setError(err.message || "Could not apply filters.");
    } finally {
      setLoading(false);
    }
  }, []);
  // === LOGIC TẢI DỮ LIỆU BAN ĐẦU (KHÔNG ĐỔI) ===
  // useEffect để gọi hàm tải dữ liệu ban đầu một lần khi hook được sử dụng lần đầu.
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // ==========================================================
  // MỚI: useEffect ĐỂ QUẢN LÝ VÒNG ĐỜI KẾT NỐI WEBSOCKET
  // ==========================================================
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
            setStats(currentStats => {
                if (!currentStats) return null;
                const newTotal = (currentStats.totalLogs24h || 0) + 1;
                let newCritical = currentStats.criticalLogs24h || 0;
                let newError = currentStats.errorLogs24h || 0;
                let newWarning = currentStats.warningLogs24h || 0;

                if(newLog.severity === AuditLogSeverity.CRITICAL) newCritical++;
                if(newLog.severity === AuditLogSeverity.ERROR) newError++;
                if(newLog.severity === AuditLogSeverity.WARNING) newWarning++;
                
                return {...currentStats, totalLogs24h: newTotal, criticalLogs24h: newCritical, errorLogs24h: newError, warningLogs24h: newWarning };
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

  // Trả về tất cả state và các hàm cần thiết cho component UI.
  return {
    logs: logsPage?.content ?? [], // Luôn trả về một mảng để tránh lỗi
    pagination: {
      totalPages: logsPage?.totalPages ?? 0,
      totalElements: logsPage?.totalElements ?? 0,
      currentPage: logsPage?.number ?? 0,
      size: logsPage?.size ?? 50,
    },
    stats,
    loading,
    error,
    isConnected, // Trả về trạng thái kết nối để UI có thể hiển thị
    fetchFilteredLogs, // Cung cấp hàm này để UI có thể gọi khi người dùng lọc
    refetch: fetchInitialData, // Cung cấp hàm để tải lại toàn bộ dữ liệu
  };
};