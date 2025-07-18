import axiosClient from "./axiosClient";

// ChatRoom type (should match backend)
export interface ChatRoom {
  id: string;
  roomName: string;
  roomType: string;
  projectId?: string;
  participantIds: number[];
  createdBy: number;
  isActive: boolean;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Get all project chat rooms for current user
export const getProjectChatRooms = async (): Promise<ChatRoom[]> => {
  const { data } = await axiosClient.get<ChatRoom[]>("/api/chat/rooms");
  // Filter only project chat rooms
  return data.filter(room => room.roomType === "PROJECT_CHAT");
};

// Chat message response type (chuẩn backend)
export interface ChatMessageResponseDto {
  id: string;
  senderId: number;
  senderName: string;
  senderImageProfile?: string;
  receiverId?: number;
  receiverName?: string;
  receiverImageProfile?: string;
  content: string;
  topic?: string;
  projectId: string;
  projectName?: string;
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  messageType: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatHistoryResponseDto {
  messages: ChatMessageResponseDto[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Get project chat history (with pagination)
export const getProjectChatHistory = async (
  projectId: string,
  page: number = 0,
  size: number = 20
): Promise<ChatHistoryResponseDto> => {
  const { data } = await axiosClient.get(`/api/chat/messages/project/${projectId}`, {
    params: {
      page,
      size,
      sortBy: 'timestamp',
      sortDir: 'desc',
    },
  });
  return data;
}; 