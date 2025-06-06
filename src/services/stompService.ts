// src/services/auditLogStompService.ts
import { Client, IMessage, StompSubscription, Frame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const VITE_API_URL_HTTP = import.meta.env.VITE_API_URL;

// Helper function to create WebSocket URL safely
const createWebSocketUrl = (baseUrl: string, path: string): string => {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanPath = path.replace(/^\/+/, ''); // Remove leading slashes
  const wsUrl = cleanBaseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  return `${wsUrl}/${cleanPath}`;
};

// Helper function to create SockJS URL
const createSockJSUrl = (baseUrl: string, path: string): string => {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanPath = path.replace(/^\/+/, ''); // Remove leading slashes
  return `${cleanBaseUrl}/${cleanPath}`;
};

// SockJS endpoint URL (for SockJS connection)
const STOMP_URL_SOCKJS = createSockJSUrl(VITE_API_URL_HTTP || 'http://localhost:8080', 'ws/audit-logs');

// Direct WebSocket URL (for native WebSocket)
const STOMP_URL_WEBSOCKET = createWebSocketUrl(VITE_API_URL_HTTP || 'http://localhost:8080', 'ws/audit-logs-direct');

console.log('STOMP_SERVICE: SockJS URL:', STOMP_URL_SOCKJS);
console.log('STOMP_SERVICE: WebSocket URL:', STOMP_URL_WEBSOCKET);

// === Types ===
export interface AuditLogRealtimeDto {
  id: string;
  timestamp: string;
  username: string | null; // Sửa lại vì backend AuditLogRealtimeDto có thể null
  ipAddress: string | null; // Sửa lại
  actionType: string;
  category: string;
  severity: string;
  targetEntity: string | null; // Sửa lại
  targetEntityId: string | null; // Sửa lại
  details: string | null; // Sửa lại
  success: boolean;
}

export interface AuditLogStats {
  totalLogs24h: number;
  totalLogsWeek: number;
  criticalLogs24h: number;
  errorLogs24h: number;
  warningLogs24h: number;
}

export interface UserActivitySummary {
  username: string;
  activityCount: number;
}

export interface AuditLogRequest {
  page?: number;
  size?: number;
  category?: string;
  severity?: string;
  startTime?: string; // Nên là ISO string nếu gửi cho backend
  endTime?: string;   // Nên là ISO string
}

// === End Types ===

const statusListeners = new Set<() => void>();
const notifyStatusChange = () => {
  console.log("STOMP_SERVICE: Notifying status change. Client active:", stompClient?.active ?? false);
  statusListeners.forEach(listener => listener());
};

let stompClient: Client | null = null;
let connectionAttemptPromise: Promise<Client> | null = null; // Để tránh gọi connect nhiều lần đồng thời

// Reconnection management
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 1;
let shouldReconnect = true;

// Lưu trữ các callbacks cho từng destination
const activeCallbacks = new Map<string, (message: IMessage) => void>();
// Lưu trữ các subscriptions đang hoạt động
const activeSubscriptions = new Map<string, StompSubscription>();

const connect = (useSockJS: boolean = true): Promise<Client> => {
  if (stompClient && stompClient.active) {
    return Promise.resolve(stompClient);
  }
  if (connectionAttemptPromise) {
    return connectionAttemptPromise;
  }

  // Check if we should stop reconnecting
  if (!shouldReconnect || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`STOMP_SERVICE: Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping reconnection.`);
    return Promise.reject(new Error('Maximum reconnection attempts reached'));
  }

  connectionAttemptPromise = new Promise((resolve, reject) => {
    reconnectAttempts++;    console.log(`STOMP_SERVICE: Attempting to connect using ${useSockJS ? 'SockJS' : 'WebSocket'}... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    const token = localStorage.getItem('token');
    
    // Create client with SockJS or native WebSocket
    const client = new Client({
      // Use SockJS or native WebSocket based on parameter
      ...(useSockJS 
        ? { 
            webSocketFactory: () => new SockJS(STOMP_URL_SOCKJS),
            debug: (str) => console.log('STOMP_DEBUG (SockJS): ' + str)
          }
        : { 
            brokerURL: STOMP_URL_WEBSOCKET,
            debug: (str) => console.log('STOMP_DEBUG (WebSocket): ' + str)
          }
      ),
      connectHeaders: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // Disable automatic reconnection - we'll handle it manually
      onConnect: (frame: Frame) => {
        stompClient = client;
        connectionAttemptPromise = null;
        // Reset reconnection counter on successful connection
        reconnectAttempts = 0;
        shouldReconnect = true;
        console.log(`STOMP_SERVICE: Connected using ${useSockJS ? 'SockJS' : 'WebSocket'}: ` + frame.headers.server);
        notifyStatusChange();
        
        // Re-subscribe to existing destinations
        activeCallbacks.forEach((_, destination) => {
          if (!activeSubscriptions.has(destination)) {
            console.log(`STOMP_SERVICE: Re-subscribing to ${destination} after connection.`);
            const subscription = client.subscribe(destination, (message: IMessage) => {
              activeCallbacks.get(destination)?.(message);
            });
            activeSubscriptions.set(destination, subscription);
          }
        });
        resolve(client);
      },
      onStompError: (frame: Frame) => {
        connectionAttemptPromise = null;
        console.error(`STOMP_SERVICE: Broker error (${useSockJS ? 'SockJS' : 'WebSocket'}): ` + frame.headers['message'], frame.body);
        console.error(`STOMP_SERVICE: Connection failed (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        notifyStatusChange();
        reject(frame);
      },
      onWebSocketError: (event: Event) => {
        connectionAttemptPromise = null;
        console.error(`STOMP_SERVICE: WebSocket error (${useSockJS ? 'SockJS' : 'WebSocket'}):`, event);
        console.error(`STOMP_SERVICE: Connection failed (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        notifyStatusChange();
        reject(event);
      },
      onWebSocketClose: (event: CloseEvent) => {
        console.log(`STOMP_SERVICE: WebSocket closed (${useSockJS ? 'SockJS' : 'WebSocket'}).`, `Reason: ${event.reason}`, `Code: ${event.code}`, `Was clean: ${event.wasClean}`);
        activeSubscriptions.clear();
        if (!client.active) {
            stompClient = null;
        }
        notifyStatusChange();
        
        // Check if we should attempt reconnection
        if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS && !event.wasClean) {          console.log(`STOMP_SERVICE: Connection lost. Will attempt to reconnect using ${useSockJS ? 'SockJS' : 'WebSocket'} (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
          setTimeout(() => {
            if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
              connect(useSockJS).catch(error => {
                console.error(`STOMP_SERVICE: Auto-reconnection failed (${useSockJS ? 'SockJS' : 'WebSocket'}):`, error);
              });
            }
          }, 5000); // Wait 5 seconds before reconnecting
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error(`STOMP_SERVICE: Maximum reconnection attempts reached. Auto-reconnection disabled.`);
          shouldReconnect = false;
        }
      }
    });
    client.activate();
  });
  return connectionAttemptPromise;
};

const disconnect = async (): Promise<void> => {
  connectionAttemptPromise = null; // Hủy bỏ mọi nỗ lực kết nối đang chờ
  shouldReconnect = false; // Stop auto-reconnection
  reconnectAttempts = 0; // Reset counter
  
  if (stompClient?.active) {
    try {
      activeSubscriptions.forEach(sub => sub.unsubscribe());
      activeSubscriptions.clear();
      await stompClient.deactivate();
      console.log("STOMP_SERVICE: Deactivated successfully.");
    } catch (error) {
      console.error("STOMP_SERVICE: Error during deactivation:", error);
    }
  }
  stompClient = null;
  notifyStatusChange();
};

const subscribe = async (destination: string, callback: (message: IMessage) => void): Promise<void> => {
  activeCallbacks.set(destination, callback);
  let client = stompClient;
  if (!client || !client.active) {
    console.warn(`STOMP_SERVICE: Client not active. Attempting to connect before subscribing to ${destination}.`);
    try {
      client = await connect(true); // Use SockJS by default
    } catch (error) {
      console.error(`STOMP_SERVICE: Failed to connect for subscription to ${destination}.`, error);
      return;
    }
  }

  if (client?.active && !activeSubscriptions.has(destination)) {
    console.log(`STOMP_SERVICE: Subscribing to new destination ${destination} after connect.`);
    const subscription = client.subscribe(destination, (message: IMessage) => {
        activeCallbacks.get(destination)?.(message);
    });
    activeSubscriptions.set(destination, subscription);
  } else if (client?.active && activeSubscriptions.has(destination)) {
      console.log(`STOMP_SERVICE: Already subscribed to ${destination}, callback updated.`);
  }
};

const unsubscribe = (destination: string): void => {
  const subscription = activeSubscriptions.get(destination);
  if (subscription) {
    subscription.unsubscribe();
    activeSubscriptions.delete(destination);
    console.log(`STOMP_SERVICE: Unsubscribed from ${destination}`);
  }
  activeCallbacks.delete(destination); // Xóa callback để không re-subscribe vô ích
};

const publish = async (destination: string, body?: string, headers?: { [key: string]: any }): Promise<void> => {
  let client = stompClient;
  if (!client || !client.active) {
    console.warn(`STOMP_SERVICE: Client not active. Attempting to connect before publishing to ${destination}.`);
    try {
      client = await connect(true); // Use SockJS by default
    } catch (error) {
      console.error(`STOMP_SERVICE: Failed to connect for publishing to ${destination}.`, error);
      throw new Error("Failed to connect before publishing.");
    }
  }
  if (client?.active) {
    // Add detailed logging for debugging WebSocket messages
    console.log(`STOMP_SERVICE: Publishing to ${destination}`);
    console.log(`STOMP_SERVICE: Message body:`, body);
    console.log(`STOMP_SERVICE: Message headers:`, headers);
    
    client.publish({ destination, body, headers });
    console.log(`STOMP_SERVICE: Successfully published to ${destination}`);
  } else {
    console.error(`STOMP_SERVICE: Cannot publish. Client not active after connection attempt for ${destination}.`);
    throw new Error("Client not active after connection attempt, cannot publish.");
  }
};

const isActive = (): boolean => !!stompClient && stompClient.active;

const resetReconnection = (): void => {
  reconnectAttempts = 0;
  shouldReconnect = true;
  console.log("STOMP_SERVICE: Reconnection reset. Auto-reconnection enabled.");
};

const getReconnectionStatus = () => ({
  attempts: reconnectAttempts,
  maxAttempts: MAX_RECONNECT_ATTEMPTS,
  shouldReconnect,
  canReconnect: reconnectAttempts < MAX_RECONNECT_ATTEMPTS
});

// --- AUDIT LOG SPECIFIC METHODS ---
const subscribeToAuditLogs = async (callback: (data: AuditLogRealtimeDto | string) => void): Promise<void> => {
  await subscribe('/app/audit-logs', (message: IMessage) => { // Sửa thành /app/audit-logs cho @SubscribeMapping
    try {
      if (message.body.includes("Subscribed to audit logs")) { // Check for confirmation string
        callback(message.body); // Gửi chuỗi xác nhận
      } else {
        const auditLog: AuditLogRealtimeDto = JSON.parse(message.body); // Nếu là object
        callback(auditLog);
      }
    } catch (error) {
      console.error('STOMP_SERVICE: Error parsing @SubscribeMapping/audit-logs message:', error);
      // callback(message.body); // Or send raw body on error
    }
  });
};

const subscribeToRealtimeStream = async (callback: (auditLog: AuditLogRealtimeDto) => void): Promise<void> => {
  await subscribe('/topic/audit-logs', (message: IMessage) => {
    try {
      const auditLog: AuditLogRealtimeDto = JSON.parse(message.body);
      callback(auditLog);
    } catch (error) {
      console.error('STOMP_SERVICE: Error parsing /topic/audit-logs message:', error);
    }
  });
};

const subscribeToSeverityLevel = async (severity: 'critical' | 'error' | 'warning' | 'info', callback: (auditLog: AuditLogRealtimeDto) => void): Promise<void> => {
  await subscribe(`/topic/audit-logs/${severity.toLowerCase()}`, (message: IMessage) => {
    try {
      const auditLog: AuditLogRealtimeDto = JSON.parse(message.body);
      callback(auditLog);
    } catch (error) {
      console.error(`STOMP_SERVICE: Error parsing /topic/audit-logs/${severity} message:`, error);
    }
  });
};

const subscribeToAdminAlerts = async (callback: (auditLog: AuditLogRealtimeDto) => void): Promise<void> => {
  await subscribe('/topic/admin-alerts', (message: IMessage) => {
     try {
      const auditLog: AuditLogRealtimeDto = JSON.parse(message.body);
      callback(auditLog);
    } catch (error) {
      console.error('STOMP_SERVICE: Error parsing /topic/admin-alerts message:', error);
    }
  });
};

const requestAuditLogs = async (request: AuditLogRequest = {}): Promise<void> => {
  // Server expects AuditLogRequestDto as JSON payload, not empty body
  // Build proper JSON object to match backend AuditLogRequestDto structure
  const requestData = {
    page: request.page || 0,
    size: request.size || 20,
    // Include other optional fields if provided
    ...(request.category && { category: request.category }),
    ...(request.severity && { severity: request.severity }),
    ...(request.startTime && { startTime: request.startTime }),
    ...(request.endTime && { endTime: request.endTime })
  };
  
  // Send JSON payload to match server @Payload AuditLogRequestDto expectation
  const bodyPayload = JSON.stringify(requestData);
  console.log("STOMP_SERVICE: Sending audit log request:", bodyPayload);
  await publish('/app/audit-logs/request', bodyPayload);
};

const subscribeToAuditLogResponses = async (callback: (response: any) => void): Promise<void> => { // 'any' vì Page<AuditLogRealtimeDto>
  await subscribe('/topic/audit-logs/response', (message: IMessage) => {
    try {
      const response = JSON.parse(message.body);
      callback(response);
    } catch (error) {
      console.error('STOMP_SERVICE: Error parsing /topic/audit-logs/response message:', error);
    }
  });
};
// --- END AUDIT LOG SPECIFIC METHODS ---

export const auditLogStompService = {
  connect,
  disconnect,
  isActive,
  resetReconnection,
  getReconnectionStatus,
  // Các hàm nghiệp vụ cho Audit Log
  subscribeToAuditLogs, // Cho @SubscribeMapping
  subscribeToRealtimeStream,
  subscribeToSeverityLevel,
  subscribeToAdminAlerts,
  requestAuditLogs,
  subscribeToAuditLogResponses,
  unsubscribe: unsubscribe,
  addConnectionStatusListener: (listener: () => void) => statusListeners.add(listener),
  removeConnectionStatusListener: (listener: () => void) => statusListeners.delete(listener),
};