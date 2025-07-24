import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import notificationService from "../services/NotificationService";
import apiNotification, {
  deleteMultipleNotifications,
} from "../api/apiNotification";
import { useAuth } from "./AuthContext";
import {
  MessageType,
  Notification,
  NotificationPriority,
  NotificationResponse,
} from "../types/Notification";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (page?: number, size?: number) => Promise<void>;
  fetchUnread: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => void;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

const mapApiNotificationToInternal = (
  notification: NotificationResponse
): Notification => ({
  id: notification.id,
  title: notification.title,
  content: notification.content,
  message: notification.content, // Thêm message để tương thích với component NotificationBell
  type: notification.type,
  priority: notification.priority,
  metadata: notification.metadata,
  read: notification.read,
  timestamp: new Date(notification.createdAt),
  createdAt: notification.createdAt, // Thêm createdAt để tương thích với component NotificationBell
  link: notification.metadata?.link as string // Thêm link từ metadata
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { token, isAuthenticated, userDetails } = useAuth();

  const fetchNotifications = useCallback(
    async (page = 0, size = 10) => {
      if (!isAuthenticated || !userDetails) return;

      setLoading(true);
      try {
        const response = await apiNotification.getUserNotifications(
          userDetails.id,
          page,
          size
        );
        const mappedNotifications = response.content.map(
          mapApiNotificationToInternal
        );

        // Sắp xếp thêm một lần nữa để đảm bảo thông báo mới nhất ở trên cùng
        const sortedNotifications = [...mappedNotifications].sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        );

        setNotifications(sortedNotifications);
        updateUnreadCount(sortedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, userDetails]
  );

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated || !userDetails) return;

    setLoading(true);
    try {
      const response = await apiNotification.getUnreadNotifications(
        userDetails.id
      );
      const unreadNotifications = response.map(mapApiNotificationToInternal);

      const existingReadNotifications = notifications.filter((n) => n.read);
      setNotifications([...unreadNotifications, ...existingReadNotifications]);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userDetails, notifications]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !userDetails) return;

    try {
      const count = await apiNotification.countUnreadNotifications(
        userDetails.id
      );
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [isAuthenticated, userDetails]);

  useEffect(() => {
    if (isAuthenticated && token && userDetails) {
      fetchNotifications();
      fetchUnreadCount();

      // Kết nối đến service thông báo
      notificationService.start(token);

      // Lắng nghe các loại thông báo từ STOMP
      notificationService.addListener("all", handleNotificationFromSocket);

      return () => {
        notificationService.removeListener("all", handleNotificationFromSocket);
        // Không ngắt kết nối khi component bị hủy, chỉ xóa listener
        // Kết nối sẽ được tái sử dụng cho các lần tiếp theo
        // notificationService.stop();
      };
    }
  }, [
    isAuthenticated,
    token,
    userDetails,
    fetchNotifications,
    fetchUnreadCount,
  ]);

  const handleNotificationFromSocket = useCallback((socketMessage: any) => {
    // Xử lý cập nhật unreadCount
    if (socketMessage.type === "NOTIFICATION_COUNT_UPDATE") {
      setUnreadCount(socketMessage.count);
      return;
    }
    
    // Xử lý thông báo mới
    const data = socketMessage.payload || socketMessage;

    if (data && data.id && data.title && data.content) {
      const newNotification: Notification = {
        id: data.id.toString(),
        title: data.title,
        content: data.content,
        message: data.content,
        type: data.type || null,
        priority: data.priority ?? NotificationPriority.MEDIUM,
        metadata: data.metadata ?? {},
        read: data.read ?? false,
        timestamp: data.createdAt ? new Date(data.createdAt) : new Date(),
        createdAt: data.createdAt || new Date().toISOString(),
        link: data.metadata?.link
      };

      // Thêm thông báo mới vào đầu danh sách
      setNotifications((prev) => {
        // Đảm bảo thông báo mới nhất ở trên cùng
        const updated = [newNotification, ...prev];
        return updated;
      });

      if (!newNotification.read) {
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          return newCount;
        });
      }
    }
  }, []);

  const markAsRead = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await apiNotification.markAsRead(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );

      updateUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated || !userDetails) return;

    try {
      await apiNotification.markAllAsRead(userDetails.id);

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiNotification.deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );

      updateUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);

    const allIds = notifications.map((n) => n.id);
    try {
      await deleteMultipleNotifications(allIds);
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const updateUnreadCount = (notifs = notifications) => {
    const count = notifs.filter((notification) => !notification.read).length;
    setUnreadCount(count);
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnread,
    markAsRead,
    markAllAsRead,
    clearAll,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
