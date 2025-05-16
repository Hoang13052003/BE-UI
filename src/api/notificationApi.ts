import axiosClient from "./axiosClient";

export type NotificationType =
  | "PROJECT_UPDATE"
  | "MILESTONE_DUE"
  | "TASK_ASSIGNED"
  | "COMMENT_ADDED"
  | "MENTION"
  | "SYSTEM_NOTICE";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
  entityId?: string;
  entityType?: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface NotificationQueryParams {
  page?: number;
  size?: number;
  type?: NotificationType;
  read?: boolean;
}

class WebSocketService {
  private static instance: WebSocketService | null = null;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(): void {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (this.ws?.readyState === WebSocket.OPEN) return;

    const wsUrl = `${
      import.meta.env.VITE_WS_URL
    }/ws/notifications?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket Connected");
      this.reconnectAttempts = 0;
      this.notifyListeners("connected", null);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyListeners("notification", data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      this.notifyListeners("disconnected", null);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(
          1000 * Math.pow(2, this.reconnectAttempts),
          30000
        );
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), delay);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.notifyListeners("error", error);
    };
  }

  addListener(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  removeListener(event: string, callback: (data: any) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

const notificationApi = {
  // WebSocket instance
  webSocket: WebSocketService.getInstance(),

  // Get notifications with pagination and filters
  async getNotifications(
    params: NotificationQueryParams = {}
  ): Promise<NotificationResponse> {
    const { data } = await axiosClient.get("/api/notifications", { params });
    return data;
  },

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    const { data } = await axiosClient.get("/api/notifications/unread-count");
    return data;
  },

  // Mark single notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await axiosClient.put(`/api/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await axiosClient.put("/api/notifications/mark-all-read");
  },

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    await axiosClient.delete(`/api/notifications/${notificationId}`);
  },
};

// React Hook for using notifications
import { useState, useEffect } from "react";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [notificationsRes, countRes] = await Promise.all([
          notificationApi.getNotifications(),
          notificationApi.getUnreadCount(),
        ]);

        setNotifications(notificationsRes.content);
        setUnreadCount(countRes);
        setError(null);
      } catch (err) {
        setError("Failed to fetch notifications");
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    // Connect WebSocket
    notificationApi.webSocket.connect();

    // Add WebSocket listeners
    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    notificationApi.webSocket.addListener(
      "notification",
      handleNewNotification
    );

    // Fetch initial data
    fetchInitialData();

    // Cleanup
    return () => {
      notificationApi.webSocket.removeListener(
        "notification",
        handleNewNotification
      );
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount(
        (prev) =>
          prev -
          (notifications.find((n) => n.id === notificationId && !n.read)
            ? 1
            : 0)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

export default notificationApi;
