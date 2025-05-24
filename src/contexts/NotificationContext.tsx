// src/contexts/NotificationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import notificationService from "../services/NotificationService";
import apiNotification from "../api/apiNotification";
import { useAuth } from "./AuthContext";
import {
  MessageType,
  Notification,
  // NotificationPayload,
  NotificationPriority,
  NotificationResponse,
} from "../types/Notification";

// Interface cho notifications để sử dụng trong context

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

// Mapper function to convert API notification to our internal format
const mapApiNotificationToInternal = (
  notification: NotificationResponse
): Notification => ({
  id: notification.id,
  title: notification.title,
  content: notification.content,
  type: notification.type,
  priority: notification.priority,
  metadata: notification.metadata,
  read: notification.read,
  timestamp: new Date(notification.createdAt),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { token, isAuthenticated, userDetails } = useAuth();

  // Fetch notifications from API
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

        setNotifications(mappedNotifications);
        // Update unread count based on API response
        updateUnreadCount(mappedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, userDetails]
  );

  // Fetch only unread notifications
  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated || !userDetails) return;

    setLoading(true);
    try {
      const response = await apiNotification.getUnreadNotifications(
        userDetails.id
      );
      const unreadNotifications = response.map(mapApiNotificationToInternal);

      // Merge unread with existing read notifications
      const existingReadNotifications = notifications.filter((n) => n.read);
      setNotifications([...unreadNotifications, ...existingReadNotifications]);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userDetails, notifications]);

  // Fetch unread count
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

  // Initial load of notifications and WebSocket setup
  useEffect(() => {
    if (isAuthenticated && token && userDetails) {
      // // Load initial notifications
      fetchNotifications();
      fetchUnreadCount();

      // Connect to WebSocket for real-time updates
      notificationService.connect(token);

      // Add listener for notification updates
      notificationService.addListener(
        MessageType.USER_UPDATE,
        handleNotificationFromSocket
      );

      // Clean up on unmount
      return () => {
        notificationService.removeListener(
          MessageType.USER_UPDATE,
          handleNotificationFromSocket
        );
        notificationService.disconnect();
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
    console.log("=== Socket Message Received ===");
    console.log("Full message:", socketMessage);

    const data = socketMessage.payload as NotificationResponse;

    console.log("Notification data:", data);

    // Validate required fields
    if (data && data.id && data.title && data.content) {
      const newNotification: Notification = {
        id: data.id.toString(),
        title: data.title,
        content: data.content,
        type: data.type || null,
        priority: data.priority ?? NotificationPriority.MEDIUM,
        metadata: data.metadata ?? {},
        read: data.read ?? false,
        timestamp: data.createdAt ? new Date(data.createdAt) : new Date(),
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        return updated;
      });

      if (!newNotification.read) {
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          return newCount;
        });
      }
    } else {
      console.warn("Invalid notification data - missing required fields:");
    }
  }, []);

  // Mark a notification as read
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

      // Update unread count
      updateUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated || !userDetails) return;

    try {
      await apiNotification.markAllAsRead(userDetails.id);

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string) => {
    try {
      await apiNotification.deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );

      // Update unread count
      updateUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Clear all notifications (local only, doesn't delete from API)
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Update the unread count based on notifications array
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
