// src/api/chatApi.ts
import axiosClient from "./axiosClient";
import { SortConfig, PaginatedResult } from './apiUtils';

export enum ChatMessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION'
}

export enum ChatRoomType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
  PROJECT_CHAT = 'PROJECT_CHAT'
}

// Request DTOs
export interface ChatMessageRequest {
  receiverId?: number;
  topic?: string;
  projectId?: number;
  content: string;
  messageType?: ChatMessageType;
  fileUrl?: string;
  fileName?: string;
}

export interface CreateChatRoomRequest {
  roomName: string;
  participantIds: number[];
  projectId?: number;
}

export interface TopicSubscriptionRequest {
  topic: string;
  projectId?: number;
}

// Response DTOs
export interface ChatMessageResponse {
  id: string;
  senderId: number;
  senderName: string;
  senderImageProfile?: string;
  receiverId?: number;
  receiverName?: string;
  receiverImageProfile?: string;
  content: string;
  topic?: string;
  projectId?: number;
  projectName?: string;
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  messageType: ChatMessageType;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatParticipant {
  userId: number;
  fullName: string;
  imageProfile?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatRoomResponse {
  id: string;
  roomName: string;
  roomType: ChatRoomType;
  projectId?: number;
  projectName?: string;
  participants: ChatParticipant[];
  createdBy: number;
  createdByName: string;
  isActive: boolean;
  lastMessageAt?: string;
  lastMessage?: ChatMessageResponse;
  unreadCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatHistoryResponse extends PaginatedResult<ChatMessageResponse> {
  messages: ChatMessageResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TopicSubscriptionResponse {
  id: string;
  userId: string;
  topic: string;
  projectId?: number;
  projectName?: string;
  subscribedAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserConnectionResponse {
  userId: string;
  fullName: string;
  imageProfile?: string;
  isConnected: boolean;
  lastConnectedTime?: string;
  sessionId?: string;
}

export interface OnlineUsersResponse {
  onlineUsers: UserConnectionResponse[];
  totalCount: number;
  lastUpdated: string;
}

export interface UnreadMessageCountResponse {
  userId: number;
  totalUnreadCount: number;
  privateMessageCount: number;
  groupMessageCount: number;
  projectMessageCount: number;
  unreadBySource?: {
    sourceType: string;
    sourceId: string;
    sourceName: string;
    count: number;
  }[];
}

export interface ChatNotificationResponse {
  type: string;
  message: string;
  data?: any;
  timestamp: string;
}

// ===============================
// Message APIs
// ===============================

export const sendMessage = async (request: ChatMessageRequest): Promise<ChatMessageResponse> => {
  const { data } = await axiosClient.post('/api/chat/messages', request);
  return data;
};

export const sendMessageWithFile = async (request: ChatMessageRequest): Promise<ChatMessageResponse> => {
  const { data } = await axiosClient.post('/api/chat/messages/file', request);
  return data;
};

export const getPrivateChatHistory = async (
  userId: number,
  page: number = 0,
  size: number = 20,
  sortConfig?: SortConfig
): Promise<ChatHistoryResponse> => {
  const params = {
    page,
    size,
    sortBy: sortConfig?.property || 'timestamp',
    sortDir: sortConfig?.direction || 'desc'
  };
  
  const { data } = await axiosClient.get(`/api/chat/messages/private/${userId}`, { params });
  return data;
};

export const getGroupChatHistory = async (
  topic: string,
  page: number = 0,
  size: number = 20,
  sortConfig?: SortConfig
): Promise<ChatHistoryResponse> => {
  const params = {
    page,
    size,
    sortBy: sortConfig?.property || 'timestamp',
    sortDir: sortConfig?.direction || 'desc'
  };
  
  const { data } = await axiosClient.get(`/api/chat/messages/group/${topic}`, { params });
  return data;
};

export const getProjectChatHistory = async (
  projectId: number,
  page: number = 0,
  size: number = 20,
  sortConfig?: SortConfig
): Promise<ChatHistoryResponse> => {
  const params = {
    page,
    size,
    sortBy: sortConfig?.property || 'timestamp',
    sortDir: sortConfig?.direction || 'desc'
  };
  
  const { data } = await axiosClient.get(`/api/chat/messages/project/${projectId}`, { params });
  return data;
};

export const getMessageById = async (messageId: string): Promise<ChatMessageResponse> => {
  const { data } = await axiosClient.get(`/api/chat/messages/${messageId}`);
  return data;
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  await axiosClient.put(`/api/chat/messages/${messageId}/read`);
};

export const markMultipleMessagesAsRead = async (messageIds: string[]): Promise<void> => {
  await axiosClient.put('/api/chat/messages/read', messageIds);
};

export const searchMessages = async (
  query: string,
  page: number = 0,
  size: number = 20
): Promise<ChatHistoryResponse> => {
  const params = { query, page, size };
  const { data } = await axiosClient.get('/api/chat/messages/search', { params });
  return data;
};

export const getFileHistory = async (
  page: number = 0,
  size: number = 20
): Promise<ChatHistoryResponse> => {
  const params = { page, size };
  const { data } = await axiosClient.get('/api/chat/messages/files', { params });
  return data;
};

// ===============================
// Chat Room APIs
// ===============================

export const getUserChatRooms = async (): Promise<ChatRoomResponse[]> => {
  const { data } = await axiosClient.get('/api/chat/rooms');
  return data;
};

export const createGroupChatRoom = async (request: CreateChatRoomRequest): Promise<ChatRoomResponse> => {
  const { data } = await axiosClient.post('/api/chat/rooms', request);
  return data;
};

export const getChatRoomById = async (roomId: string): Promise<ChatRoomResponse> => {
  const { data } = await axiosClient.get(`/api/chat/rooms/${roomId}`);
  return data;
};

export const updateChatRoom = async (
  roomId: string,
  request: CreateChatRoomRequest
): Promise<ChatRoomResponse> => {
  const { data } = await axiosClient.put(`/api/chat/rooms/${roomId}`, request);
  return data;
};

export const addUserToChatRoom = async (roomId: string, userId: number): Promise<void> => {
  await axiosClient.post(`/api/chat/rooms/${roomId}/participants`, { userId });
};

export const removeUserFromChatRoom = async (roomId: string, userId: number): Promise<void> => {
  await axiosClient.delete(`/api/chat/rooms/${roomId}/participants/${userId}`);
};

export const leaveChatRoom = async (roomId: string): Promise<void> => {
  await axiosClient.delete(`/api/chat/rooms/${roomId}/leave`);
};

export const searchChatRooms = async (query: string): Promise<ChatRoomResponse[]> => {
  const params = { query };
  const { data } = await axiosClient.get('/api/chat/rooms/search', { params });
  return data;
};

// ===============================
// Topic Subscription APIs
// ===============================

export const subscribeToTopic = async (request: TopicSubscriptionRequest): Promise<void> => {
  await axiosClient.post('/api/chat/topics/subscribe', request);
};

export const unsubscribeFromTopic = async (topic: string): Promise<void> => {
  await axiosClient.delete(`/api/chat/topics/${topic}/unsubscribe`);
};

export const getUserSubscriptions = async (): Promise<TopicSubscriptionResponse[]> => {
  const { data } = await axiosClient.get('/api/chat/topics/subscriptions');
  return data;
};

export const getTopicSubscribers = async (topic: string): Promise<TopicSubscriptionResponse[]> => {
  const { data } = await axiosClient.get(`/api/chat/topics/${topic}/subscribers`);
  return data;
};

// ===============================
// Project Chat APIs
// ===============================

export const joinProjectChat = async (projectId: number): Promise<void> => {
  await axiosClient.post(`/api/chat/projects/${projectId}/join`);
};

export const leaveProjectChat = async (projectId: number): Promise<void> => {
  await axiosClient.delete(`/api/chat/projects/${projectId}/leave`);
};

export const getProjectChatParticipants = async (projectId: number): Promise<ChatParticipant[]> => {
  const { data } = await axiosClient.get(`/api/chat/projects/${projectId}/participants`);
  return data;
};

export const getUserProjectChats = async (): Promise<ChatRoomResponse[]> => {
  const { data } = await axiosClient.get('/api/chat/projects');
  return data;
};

// ===============================
// User Connection APIs
// ===============================

export const getOnlineUsers = async (): Promise<OnlineUsersResponse> => {
  const { data } = await axiosClient.get('/api/chat/users/online');
  return data;
};

export const getUserConnectionStatus = async (userId: string): Promise<UserConnectionResponse> => {
  const { data } = await axiosClient.get(`/api/chat/users/${userId}/status`);
  return data;
};

// ===============================
// Unread Message APIs
// ===============================

export const getUnreadMessageCount = async (): Promise<UnreadMessageCountResponse> => {
  const { data } = await axiosClient.get('/api/chat/unread/count');
  return data;
};

export const getUnreadMessages = async (
  page: number = 0,
  size: number = 20
): Promise<ChatHistoryResponse> => {
  const params = { page, size };
  const { data } = await axiosClient.get('/api/chat/unread/messages', { params });
  return data;
};

// ===============================
// Notification APIs (Admin only)
// ===============================

export const notifyProjectMembers = async (
  projectId: number,
  notification: ChatNotificationResponse
): Promise<void> => {
  await axiosClient.post(`/api/chat/notifications/project/${projectId}`, notification);
};

export const notifyTopicSubscribers = async (
  topic: string,
  notification: ChatNotificationResponse
): Promise<void> => {
  await axiosClient.post(`/api/chat/notifications/topic/${topic}`, notification);
};

export const notifyUsers = async (
  userIds: number[],
  notification: ChatNotificationResponse
): Promise<void> => {
  const params = { userIds: userIds.join(',') };
  await axiosClient.post('/api/chat/notifications/users', notification, { params });
};