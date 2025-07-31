import { message } from 'antd';
import { MessageType as NotificationMessageType, NotificationPriority } from "../types/Notification";

// Utility functions for notification formatting and display
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

export const getTypeIcon = (type: NotificationMessageType): string => {
  switch (type) {
    case NotificationMessageType.PROJECT_UPDATED:
      return "🔄";
    case NotificationMessageType.COMMENT_ADDED:
      return "💬";
    case NotificationMessageType.USER_UPDATE:
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

// Centralized notification messages to prevent duplicates
export const NotificationMessages = {
  // Notification management
  NOTIFICATIONS_REFRESHED: "Notifications refreshed",
  NOTIFICATIONS_REFRESH_FAILED: "Failed to refresh notifications",
  ALL_MARKED_AS_READ: "All notifications marked as read",
  NOTIFICATION_DELETED: "Notification deleted",
  NOTIFICATION_DELETE_FAILED: "Failed to delete notification",
  
  // Project management
  PROJECT_CREATED: "Project created successfully",
  PROJECT_UPDATED: "Project updated successfully",
  PROJECT_DELETED: "Project deleted successfully",
  PROJECT_DELETE_FAILED: "Failed to delete project",
  PROJECT_CREATE_FAILED: "Failed to create project",
  PROJECT_LOAD_FAILED: "Failed to load projects",
  
  // Milestone management
  MILESTONE_CREATED: "Milestone created successfully",
  MILESTONE_UPDATED: "Milestone updated successfully",
  MILESTONE_DELETED: "Milestone deleted successfully",
  MILESTONE_DELETE_FAILED: "Failed to delete milestone",
  MILESTONE_LOAD_FAILED: "Failed to load milestones",
  
  // Time log management
  TIMELOG_CREATED: "Time log created successfully",
  TIMELOG_UPDATED: "Time log updated successfully",
  TIMELOG_DELETED: "Time log deleted successfully",
  TIMELOG_DELETE_FAILED: "Failed to delete time log",
  TIMELOG_CREATE_FAILED: "Failed to create time log",
  TIMELOG_LOAD_FAILED: "Failed to load time logs",
  TIMELOG_UPLOAD_SUCCESS: "Time logs uploaded successfully",
  
  // User management
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_DELETE_FAILED: "Failed to delete user",
  USER_LOAD_FAILED: "Failed to load users",
  USER_UPDATE_FAILED: "Failed to update user",
  PASSWORD_MISMATCH: "Passwords do not match",
  EMAIL_EXISTS: "Email already exists. Please use a different email.",
  
  // Project updates
  PROJECT_UPDATE_CREATED: "Project update created successfully",
  PROJECT_UPDATE_UPDATED: "Project update updated successfully",
  PROJECT_UPDATE_DELETED: "Project update deleted successfully",
  PROJECT_UPDATE_DELETE_FAILED: "Failed to delete project update",
  PROJECT_UPDATE_LOAD_FAILED: "Failed to load project updates",
  
  // Feedback
  FEEDBACK_SENT: "Feedback sent successfully",
  FEEDBACK_MARKED_READ: "Feedback marked as read successfully",
  FEEDBACK_MARK_READ_FAILED: "Failed to mark feedback as read",
  
  // Authentication
  LOGIN_SUCCESS: "Login successful",
  LOGIN_FAILED: "Login failed",
  LOGOUT_SUCCESS: "Logout successful",
  SESSION_EXPIRED: "Session expired. Please login again.",
  EMAIL_VERIFICATION_SUCCESS: "Email verification successful!",
  EMAIL_VERIFICATION_FAILED: "Email verification failed",
  VERIFICATION_EMAIL_SENT: "Verification email sent successfully!",
  VERIFICATION_EMAIL_FAILED: "Failed to send verification email",
  
  // File operations
  FILE_UPLOAD_SUCCESS: "File uploaded successfully",
  FILE_UPLOAD_FAILED: "File upload failed",
  FILE_DELETE_SUCCESS: "File deleted successfully",
  FILE_DELETE_FAILED: "Failed to delete file",
  
  // Chat/Messages
  MESSAGE_SENT: "Message sent successfully",
  MESSAGE_SEND_FAILED: "Failed to send message",
  CHAT_ROOM_CREATED: "Chat room created successfully",
  CHAT_ROOM_CREATE_FAILED: "Failed to create chat room",
  
  // General
  OPERATION_SUCCESS: "Operation completed successfully",
  OPERATION_FAILED: "Operation failed",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error occurred",
  VALIDATION_ERROR: "Please check your input and try again",
  SELECT_ITEMS_REQUIRED: "Please select items to perform this action",
} as const;

// Type for message types
export type MessageType = keyof typeof NotificationMessages;

// Centralized message display functions
export const showNotification = {
  success: (messageKey: MessageType, customMessage?: string) => {
    const messageText = customMessage || NotificationMessages[messageKey];
    message.success(messageText);
  },
  
  error: (messageKey: MessageType, customMessage?: string) => {
    const messageText = customMessage || NotificationMessages[messageKey];
    message.error(messageText);
  },
  
  warning: (messageKey: MessageType, customMessage?: string) => {
    const messageText = customMessage || NotificationMessages[messageKey];
    message.warning(messageText);
  },
  
  info: (messageKey: MessageType, customMessage?: string) => {
    const messageText = customMessage || NotificationMessages[messageKey];
    message.info(messageText);
  },
  
  // For dynamic messages that don't fit predefined keys
  custom: {
    success: (text: string) => message.success(text),
    error: (text: string) => message.error(text),
    warning: (text: string) => message.warning(text),
    info: (text: string) => message.info(text),
  }
};

// Helper function to show error with fallback
export const showError = (error: unknown, fallbackKey: MessageType = 'OPERATION_FAILED') => {
  if (error instanceof Error) {
    showNotification.error(fallbackKey, error.message);
  } else {
    showNotification.error(fallbackKey);
  }
};

// Helper function to show success with optional custom message
export const showSuccess = (messageKey: MessageType, customMessage?: string) => {
  showNotification.success(messageKey, customMessage);
};
