import axiosClient from './axiosClient';

export interface ChatRoom {
  id: string;
  name: string;
  type: 'PROJECT' | 'SUPPORT' | 'PRIVATE';
  projectId?: string;
  participantIds: number[];
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: number;
  senderName?: string;
  senderAvatar?: string | null;
  content: string;
  sentAt: string;
  messageStatus: Record<number, 'SENT' | 'DELIVERED' | 'SEEN'>;
  attachmentIds?: string[];
  attachments?: ChatAttachment[];
  replyToMessageId?: string;
  replyMessage?: ChatMessage | null;
  mentionUserIds: string[];
  deleted: boolean;
  edited: boolean;
  editedAt?: string;
  seenCount?: number;
  deliveredCount?: number;
  sentCount?: number;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: number;
  userFullName: string;
  userAvatar?: string | null;
  emoji: string;
  createdAt: string;
}

export interface MessageReactionRequest {
  messageId: string;
  emoji: string;
  addReaction: boolean;
}

export interface MessageReactionResponse {
  messageId: string;
  reactionCounts: Record<string, number>;
  currentUserReactions: string[];
  reactionUsers: Record<string, Array<{
    userId: number;
    userFullName: string;
    userAvatar?: string | null;
  }>>;
}

export interface WebSocketReactionEvent {
  messageId: string;
  userId: number;
  userName: string;
  userAvatar?: string | null;
  emoji: string;
  addReaction: boolean;
}

export interface ChatAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileType: string;
  attachmentType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER';
  fileUrl: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface CreateChatRoomRequest {
  name: string;
  type: 'PROJECT' | 'SUPPORT' | 'PRIVATE';
  projectId?: string;
  participantIds: number[];
}

export interface SendMessageRequest {
  roomId: string;
  content: string;
  attachmentIds?: string[];
  replyToMessageId?: string;
  mentionUserIds?: string[];
}

export interface MarkReadRequest {
  roomId: string;
  messageIds: string[];
}

export interface PaginationParams {
  page: number;
  size: number;
}

// Thêm interface mới cho kết quả phân trang
export interface PaginationResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page number
  first: boolean; // is first page
  last: boolean; // is last page
  empty: boolean; // is empty page
}

export interface ChatAttachmentResponse {
  id: string;
  fileName: string;
  fileType: string;
  attachmentType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER';
  fileUrl: string;
  thumbnailUrl?: string | null;
  size: number;
  uploadedAt: string;
  uploadedBy: number;
}

const chatApi = {
  // Chat Room endpoints
  // Đổi getRooms thành gọi endpoint phân trang, nhận params page, size, sort
  getRooms: (params = { page: 0, size: 20, sort: 'createdAt,desc' }) =>
    axiosClient.get('/api/chat/rooms/paged', { params }),
  
  getRoomsPaged: (params: PaginationParams) => 
    axiosClient.get<PaginationResponse<ChatRoom>>('/api/chat/rooms/paged', { params }),
  
  getRoomById: (id: string) => 
    axiosClient.get<ChatRoom>(`/api/chat/rooms/${id}`),
  
  createRoom: (data: CreateChatRoomRequest) => 
    axiosClient.post<ChatRoom>('/api/chat/rooms', data),
  
  addUserToRoom: (roomId: string, userId: number) => 
    axiosClient.post(`/api/chat/rooms/${roomId}/users/${userId}`),
  
  removeUserFromRoom: (roomId: string, userId: number) => 
    axiosClient.delete(`/api/chat/rooms/${roomId}/users/${userId}`),
  
  // Chat Message endpoints
  getMessages: (roomId: string) => 
    axiosClient.get<ChatMessage[]>(`/api/chat/rooms/${roomId}/messages`),
  
  getMessagesPaged: (roomId: string, params: PaginationParams) => 
    axiosClient.get<PaginationResponse<ChatMessage>>(`/api/chat/rooms/${roomId}/messages/paged`, { params }),
  
  sendMessage: (data: SendMessageRequest) => 
    axiosClient.post<ChatMessage>('/api/chat/messages', data),
  
  markRead: (data: MarkReadRequest) => 
    axiosClient.post('/api/chat/messages/mark-read', data),

  // Chat Attachment
  uploadAttachment: (roomId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    
    return axiosClient.post<ChatAttachment>('/api/chat/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Upload attachment for chat message (new API)
  uploadChatAttachment: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return axiosClient.post<ChatAttachmentResponse>('/api/chat/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Message Reactions endpoints
  addOrRemoveReaction: (data: MessageReactionRequest) => {
    return axiosClient.post<MessageReaction>('/api/chat/messages/reactions', data);
  },

  getMessageReactions: (messageId: string) => {
    return axiosClient.get<MessageReactionResponse>(`/api/chat/messages/${messageId}/reactions`);
  },

  getCurrentUserReactions: (messageId: string) => {
    return axiosClient.get<MessageReactionResponse>(`/api/chat/messages/${messageId}/reactions/user`);
  },
};

export default chatApi;