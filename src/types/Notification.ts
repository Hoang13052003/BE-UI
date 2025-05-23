export enum MessageType {
  SUBSCRIBE_USER = "SUBSCRIBE_USER",
  UNSUBSCRIBE_USER = "UNSUBSCRIBE_USER",
  USER_UPDATE = "USER_UPDATE",
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_DELETED = "PROJECT_DELETED",
  PROJECT_ASSIGN = "PROJECT_ASSIGN",
  COMMENT_ADDED = "COMMENT_ADDED",
  REMINDER = "REMINDER",
  SYSTEM_NOTIFICATION = "SYSTEM_NOTIFICATION",
}

export enum NotificationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface NotificationPayload {
  messageType: MessageType;
  message?: string;
  unread?: number;

  // Full notification data fields (for new implementation)
  id?: string;
  userId?: number;
  title?: string;
  content?: string;
  type?: MessageType;
  priority?: NotificationPriority;
  read?: boolean;
  createdAt?: string; // ISO date string from backend
  metadata?: Record<string, unknown>;

  // Allow any additional fields
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: MessageType;
  priority: NotificationPriority;
  metadata?: Record<string, unknown>;
  read: boolean;
  timestamp: Date;
}

export interface NotificationResponse {
  id: string;
  userId: number;
  title: string;
  content: string;
  type: MessageType;
  priority: NotificationPriority;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdBy?: string;
  createdAt: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
}

export interface CreateNotificationRequestDto {
  userId: number;
  title: string;
  content: string;
  type: MessageType;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
}

export interface NotificationPageResponse {
  content: NotificationResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
