import { MessageType } from "../types/Notification";
import { toWebSocketUrl } from "../utils/urlUtils";
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { showNotification, showError } from "../utils/notificationUtils";

class NotificationService {
  private stompClient: Stomp.Client | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private token: string | null = null;
  private isConnecting: boolean = false; // Thêm biến theo dõi trạng thái đang kết nối
  private healthCheckInterval: NodeJS.Timeout | null = null;

  connect(token: string): void {
    // Kiểm tra nếu đã kết nối hoặc đang trong quá trình kết nối
    if (this.stompClient && (this.isConnected || this.isConnecting)) {
      console.log("WebSocket connection already exists or is connecting. Skipping new connection.");
      return;
    }

    this.token = token;
    this.isConnecting = true; // Đánh dấu đang bắt đầu kết nối

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const cleanBaseUrl = baseUrl.startsWith('ws') ? baseUrl : baseUrl.replace(/^http/, 'ws');
      
      // Ngắt kết nối cũ nếu tồn tại
      if (this.stompClient) {
        this.disconnect();
      }
      
      // Khởi tạo STOMP client
      this.stompClient = new Stomp.Client({
        webSocketFactory: () => new SockJS(`${baseUrl}/ws/notifications`),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: function (str) {
          // console.log(str); // Tắt log không cần thiết
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Xử lý khi kết nối thành công
      this.stompClient.onConnect = (frame) => {
        this.isConnected = true;
        this.isConnecting = false; // Đánh dấu kết nối đã hoàn thành
        this.reconnectAttempts = 0;
        // Sử dụng showNotification thay vì message trực tiếp
        import("../utils/notificationUtils").then(({ showNotification }) => {
          showNotification.custom.success("Connected to notifications service");
        });
        
        // Đăng ký nhận thông báo riêng
        this.stompClient?.subscribe('/user/queue/notifications', (message) => {
          this.handleMessage(message);
        });
        
        // Đăng ký nhận cập nhật số lượng thông báo
        this.stompClient?.subscribe('/user/queue/notification-count', (message) => {
          this.handleMessage(message);
        });
        
        // Đăng ký nhận thông báo broadcast
        this.stompClient?.subscribe('/topic/notifications', (message) => {
          this.handleMessage(message);
        });
      };

      // Xử lý khi mất kết nối
      this.stompClient.onStompError = (frame) => {
        this.isConnected = false;
        this.isConnecting = false; // Đánh dấu kết nối đã kết thúc (thất bại)
        showNotification.custom.error(`Connection error: ${frame.headers['message']}`);
        
        if (this.token) {
          this.attemptReconnect(this.token);
        }
      };

      // Kết nối đến server
      this.stompClient.activate();

    } catch (error) {
      this.isConnecting = false; // Đánh dấu kết nối đã kết thúc (thất bại)
      console.error('Failed to connect to notification service:', error);
      showNotification.custom.error("Failed to connect to notification service");
    }
  }

  private handleMessage(stompMessage: Stomp.IMessage): void {
    try {
      const data = JSON.parse(stompMessage.body);
      
      const messageType = data.messageType || data.type;

      if (messageType && this.listeners.has(messageType)) {
        this.listeners
          .get(messageType)
          ?.forEach((callback) => callback(data));
      }

      if (this.listeners.has("all")) {
        this.listeners.get("all")?.forEach((callback) => callback(data));
      }
    } catch (error) {
      console.error("Error parsing STOMP message:", error);
      showNotification.custom.error("Received invalid message from server");
    }
  }

  private attemptReconnect(token: string): void {
    // Nếu đang kết nối, không thử kết nối lại
    if (this.isConnecting) {
      return;
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      if (this.reconnectTimeoutId) {
        clearTimeout(this.reconnectTimeoutId);
      }

      this.reconnectTimeoutId = setTimeout(() => {
        console.log(`Attempt to reconnect #${this.reconnectAttempts}`);
        this.connect(token);
      }, this.reconnectInterval);
    } else {
      showNotification.custom.error(
        "Could not connect to notification service. Please refresh the page."
      );
    }
  }

  disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.stompClient) {
      if (this.stompClient.connected) {
        this.stompClient.deactivate();
      }
      
      this.stompClient = null;
      this.isConnected = false;
      this.isConnecting = false;  // Đảm bảo cả trạng thái đang kết nối cũng bị reset
      this.token = null;
    }
  }

  subscribeUser(token: string): void {
    // Đã được xử lý trong hàm connect qua các đăng ký STOMP
    // Giữ lại phương thức để tương thích với code cũ
  }

  unsubscribeUser(): void {
    // Giữ lại phương thức để tương thích với code cũ
    this.disconnect();
  }

  addListener(messageType: string, callback: (data: any) => void): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)?.push(callback);
  }

  removeListener(messageType: string, callback: (data: any) => void): void {
    if (this.listeners.has(messageType)) {
      const callbacks = this.listeners.get(messageType) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Kiểm tra kết nối và thực hiện kết nối lại nếu cần thiết
   */
  ensureConnected(token: string): void {
    // Nếu không có kết nối hoặc kết nối đã đóng
    if (!this.stompClient || !this.isConnected) {
      this.connect(token);
      return;
    }
    
    // Kết nối vẫn ổn, không cần làm gì
  }
  
  /**
   * Bắt đầu kiểm tra sức khỏe kết nối định kỳ
   */
  startHealthCheck(token: string): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Kiểm tra mỗi 30 giây
    this.healthCheckInterval = setInterval(() => {
      this.ensureConnected(token);
    }, 30000);
  }
  
  /**
   * Dừng việc kiểm tra sức khỏe kết nối
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
  
  /**
   * Khởi động dịch vụ thông báo với token
   */
  start(token: string): void {
    this.connect(token);
    this.startHealthCheck(token);
  }
  
  /**
   * Dừng dịch vụ thông báo
   */
  stop(): void {
    this.stopHealthCheck();
    this.disconnect();
  }
}

const notificationService = new NotificationService();
export default notificationService;
