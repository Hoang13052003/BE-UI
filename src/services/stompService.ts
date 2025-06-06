// src/services/auditLogStompService.ts
import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription, Frame } from '@stomp/stompjs';

const VITE_API_URL_HTTP = import.meta.env.VITE_API_URL;
const STOMP_URL_SOCKJS = `${VITE_API_URL_HTTP}/ws/audit-logs`;
const STOMP_URL_DIRECT = `${VITE_API_URL_HTTP}/ws/audit-logs-direct`;

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

  connectionAttemptPromise = new Promise((resolve, reject) => {
    console.log("STOMP_SERVICE: Attempting to connect...");
    const token = localStorage.getItem('token');
    const socketUrl = useSockJS ? STOMP_URL_SOCKJS : STOMP_URL_DIRECT;
    let socket: any;

    if (useSockJS) {
        socket = new SockJS(socketUrl);
    } else {
        const protocol = socketUrl.startsWith('https:') ? 'wss:' : 'ws:';
        const urlWithoutProtocol = socketUrl.substring(socketUrl.indexOf('//') + 2);
        const wsUrl = `${protocol}//${urlWithoutProtocol}`;
        socket = new WebSocket(wsUrl);
    }

    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      debug: (str) => console.log('STOMP_DEBUG: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame: Frame) => {
        stompClient = client;
        connectionAttemptPromise = null;
        console.log('STOMP_SERVICE: Connected: ' + frame.headers.server);
        notifyStatusChange();
        activeCallbacks.forEach((callback, destination) => {
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
        console.error('STOMP_SERVICE: Broker error: ' + frame.headers['message'], frame.body);
        notifyStatusChange();
        reject(frame);
      },
      onWebSocketError: (event: Event) => {
        connectionAttemptPromise = null;
        console.error("STOMP_SERVICE: WebSocket error:", event);
        notifyStatusChange();
        reject(event);
      },
      onWebSocketClose: (event: CloseEvent) => {
        console.log("STOMP_SERVICE: WebSocket closed.", `Reason: ${event.reason}`, `Code: ${event.code}`, `Was clean: ${event.wasClean}`);
        activeSubscriptions.clear();
        if (!client.active) {
            stompClient = null; // Đảm bảo là null nếu không tự reconnect nữa
        }
        notifyStatusChange();
      }
    });
    client.activate();
  });
  return connectionAttemptPromise;
};

const disconnect = async (): Promise<void> => {
  connectionAttemptPromise = null; // Hủy bỏ mọi nỗ lực kết nối đang chờ
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
      client = await connect();
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
      client = await connect();
    } catch (error) {
      console.error(`STOMP_SERVICE: Failed to connect for publishing to ${destination}.`, error);
      throw new Error("Failed to connect before publishing.");
    }
  }
  if (client?.active) {
    client.publish({ destination, body, headers });
    console.log(`STOMP_SERVICE: Published to ${destination}`);
  } else {
    console.error(`STOMP_SERVICE: Cannot publish. Client not active after connection attempt for ${destination}.`);
    throw new Error("Client not active after connection attempt, cannot publish.");
  }
};

const isActive = (): boolean => !!stompClient && stompClient.active;

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
  // Đảm bảo backend AuditLogRealtimeController.handleAuditLogRequest dùng @Payload
  const bodyPayload = JSON.stringify(request);
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
  // Các hàm nghiệp vụ cho Audit Log
  subscribeToAuditLogs, // Cho @SubscribeMapping
  subscribeToRealtimeStream,
  subscribeToSeverityLevel,
  subscribeToAdminAlerts,
  requestAuditLogs,
  subscribeToAuditLogResponses,
  // Hàm chung nếu cần (ít dùng hơn khi có hàm nghiệp vụ)
  // subscribeGeneric: subscribe,
  // unsubscribeGeneric: unsubscribe,
  // publishGeneric: publish,
  addConnectionStatusListener: (listener: () => void) => statusListeners.add(listener),
  removeConnectionStatusListener: (listener: () => void) => statusListeners.delete(listener),
};