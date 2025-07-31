import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { showNotification } from "../utils/notificationUtils";

class NotificationService {
  private stompClient: Stomp.Client | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private token: string | null = null;
  private isConnecting: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  connect(token: string): void {
    if (this.stompClient && (this.isConnected || this.isConnecting)) {
      console.log("WebSocket connection already exists or is connecting. Skipping new connection.");
      return;
    }

    this.token = token;
    this.isConnecting = true;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      
      if (this.stompClient) {
        this.disconnect();
      }
      this.stompClient = new Stomp.Client({
        webSocketFactory: () => new SockJS(`${baseUrl}/ws/notifications`),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: function () {
          // console.log(str); // Tắt log không cần thiết
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.stompClient.onConnect = () => {
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        import("../utils/notificationUtils").then(({ showNotification }) => {
          showNotification.custom.success("Connected to notifications service");
        });
        
        this.stompClient?.subscribe('/user/queue/notifications', (message) => {
          this.handleMessage(message);
        });
        
        this.stompClient?.subscribe('/user/queue/notification-count', (message) => {
          this.handleMessage(message);
        });
        
        this.stompClient?.subscribe('/topic/notifications', (message) => {
          this.handleMessage(message);
        });
      };

      this.stompClient.onStompError = (frame) => {
        this.isConnected = false;
        this.isConnecting = false;
        showNotification.custom.error(`Connection error: ${frame.headers['message']}`);
        
        if (this.token) {
          this.attemptReconnect(this.token);
        }
      };

      this.stompClient.activate();

    } catch (error) {
      this.isConnecting = false;
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
      this.isConnecting = false;
      this.token = null;
    }
  }

  subscribeUser(_token: string): void {
  }

  unsubscribeUser(): void {
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

  ensureConnected(token: string): void {
    if (!this.stompClient || !this.isConnected) {
      this.connect(token);
      return;
    }
  }
  startHealthCheck(token: string): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.healthCheckInterval = setInterval(() => {
      this.ensureConnected(token);
    }, 30000);
  }
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
  start(token: string): void {
    this.connect(token);
    this.startHealthCheck(token);
  }
  stop(): void {
    this.stopHealthCheck();
    this.disconnect();
  }
}

const notificationService = new NotificationService();
export default notificationService;
