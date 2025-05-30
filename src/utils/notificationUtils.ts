import { MessageType, NotificationPriority } from "../types/Notification";

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getPriorityConfig = (priority?: NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.URGENT:
      return { color: "#ff4d4f", text: "Urgent", icon: "🚨" };
    case NotificationPriority.HIGH:
      return { color: "#fa8c16", text: "High", icon: "⚠️" };
    case NotificationPriority.MEDIUM:
      return { color: "#1890ff", text: "Medium", icon: "ℹ️" };
    case NotificationPriority.LOW:
      return { color: "#52c41a", text: "Low", icon: "✅" };
    default:
      return { color: "#d9d9d9", text: "Unknown", icon: "❓" };
  }
};

export const getTypeIcon = (type: MessageType): string => {
  switch (type) {
    case MessageType.PROJECT_UPDATED:
      return "🔄";
    case MessageType.COMMENT_ADDED:
      return "💬";
    case MessageType.USER_UPDATE:
      return "👤";
    default:
      return "📣";
  }
};

export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    NEW: "blue",
    PENDING: "orange",
    PROGRESS: "cyan",
    AT_RISK: "volcano",
    COMPLETED: "green",
    CLOSED: "purple",
  };
  return statusMap[status] || "default";
};
