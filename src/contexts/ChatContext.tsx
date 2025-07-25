import React, { createContext, useContext, useEffect, useCallback, useReducer } from 'react';
import { message } from 'antd';
import chatApi, { ChatRoom, ChatMessage, SendMessageRequest, ChatAttachment } from '../api/chatApi';
import chatWebSocketService, { MessageStatusUpdate, TypingStatus, UserStatus } from '../services/ChatWebSocket';
import { useAuth } from './AuthContext';

// Type cho người dùng đang gõ (mở rộng từ userId thành object chứa userId và userName)
interface TypingUserInfo {
  userId: number;
  userName?: string;
}

// Types
interface ChatState {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  loading: boolean;
  error: string | null;
  typingUsers: Record<string, Set<TypingUserInfo>>;
  onlineUsers: Set<number>;
  lastSeenAt: Record<number, string>;
  attachments: Record<string, ChatAttachment[]>;
  messagesPagination: Record<string, { page: number, hasMore: boolean }>;
}

interface ChatContextType {
  state: ChatState;
  loadChatRooms: (page?: number, size?: number, sort?: string) => Promise<void>;
  selectRoom: (roomId: string) => Promise<void>;
  sendMessage: (content: string, attachmentIds?: string[], replyToMessageId?: string, mentionUserIds?: string[]) => Promise<void>;
  markMessagesAsRead: (roomId: string, messageIds: string[]) => void;
  createChatRoom: (name: string, type: string, participantIds: number[], projectId?: string) => Promise<ChatRoom | undefined>;
  setTyping: (roomId: string, typing: boolean) => void;
  uploadAttachment: (roomId: string, file: File) => Promise<ChatAttachment | undefined>;
  disconnectWebSocket: () => void;
  reconnectWebSocket: () => Promise<void>;
  isUserTyping: (roomId: string, userId: number) => boolean;
  isUserOnline: (userId: number) => boolean;
  getUserLastSeen: (userId: number) => string | null;
  loadMoreMessages: (roomId: string, page: number, size: number) => Promise<boolean>;
}

// Initial state
const initialState: ChatState = {
  rooms: [],
  selectedRoomId: null,
  messages: {},
  loading: false,
  error: null,
  typingUsers: {},
  onlineUsers: new Set<number>(),
  lastSeenAt: {},
  attachments: {},
  messagesPagination: {}
};

// Actions
enum ActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_ROOMS = 'SET_ROOMS',
  ADD_ROOM = 'ADD_ROOM',
  SELECT_ROOM = 'SELECT_ROOM',
  SET_MESSAGES = 'SET_MESSAGES',
  ADD_MESSAGE = 'ADD_MESSAGE',
  UPDATE_MESSAGE_STATUS = 'UPDATE_MESSAGE_STATUS',
  SET_TYPING_STATUS = 'SET_TYPING_STATUS',
  SET_USER_STATUS = 'SET_USER_STATUS',
  ADD_ATTACHMENT = 'ADD_ATTACHMENT',
  UPDATE_PAGINATION = 'UPDATE_PAGINATION',
  RESET = 'RESET'
}

type Action = 
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_ERROR; payload: string | null }
  | { type: ActionType.SET_ROOMS; payload: ChatRoom[] }
  | { type: ActionType.ADD_ROOM; payload: ChatRoom }
  | { type: ActionType.SELECT_ROOM; payload: string | null }
  | { type: ActionType.SET_MESSAGES; payload: { roomId: string; messages: ChatMessage[] } }
  | { type: ActionType.ADD_MESSAGE; payload: ChatMessage }
  | { type: ActionType.UPDATE_MESSAGE_STATUS; payload: MessageStatusUpdate }
  | { type: ActionType.SET_TYPING_STATUS; payload: TypingStatus }
  | { type: ActionType.SET_USER_STATUS; payload: UserStatus }
  | { type: ActionType.ADD_ATTACHMENT; payload: ChatAttachment }
  | { type: ActionType.UPDATE_PAGINATION; payload: { roomId: string; page: number; hasMore: boolean } }
  | { type: ActionType.RESET };

// Reducer
function chatReducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionType.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ActionType.SET_ROOMS:
      return { ...state, rooms: action.payload };
    
    case ActionType.ADD_ROOM:
      return { 
        ...state, 
        rooms: [action.payload, ...state.rooms.filter(room => room.id !== action.payload.id)]
      };
    
    case ActionType.SELECT_ROOM:
      return { ...state, selectedRoomId: action.payload };
    
    case ActionType.SET_MESSAGES:
      // Kiểm tra roomId có tồn tại không
      if (!action.payload.roomId) return state;
      
      return { 
        ...state, 
        messages: { 
          ...state.messages, 
          [action.payload.roomId as string]: action.payload.messages 
        } 
      };
    
    case ActionType.ADD_MESSAGE: {
      const roomId = action.payload.roomId;
      
      // Kiểm tra roomId có tồn tại không
      if (!roomId) return state;
      
      const existingMessages = state.messages[roomId] || [];
      
      // Update the room's last message
      const updatedRooms = state.rooms.map((room: ChatRoom) => {
        if (room.id === roomId) {
          return { ...room, lastMessage: action.payload };
        }
        return room;
      });

      return {
        ...state,
        rooms: updatedRooms,
        messages: {
          ...state.messages,
          [roomId as string]: [action.payload, ...existingMessages]
        }
      };
    }
    
    case ActionType.UPDATE_MESSAGE_STATUS: {
      const { roomId, messageId, userId, status } = action.payload;
      
      // Kiểm tra roomId có tồn tại không
      if (!roomId) return state;
      
      const roomMessages = state.messages[roomId];
      
      if (!roomMessages) return state;
      
      const updatedMessages = roomMessages.map((msg: ChatMessage) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            messageStatus: { ...msg.messageStatus, [userId]: status }
          };
        }
        return msg;
      });
      
      return {
        ...state,
        messages: { ...state.messages, [roomId as string]: updatedMessages }
      };
    }
    
    case ActionType.SET_TYPING_STATUS: {
      const { roomId, userId, typing, userName } = action.payload;
      
      // Kiểm tra roomId có tồn tại không
      if (!roomId) return state;
      
      // Khởi tạo Set mới nếu chưa có
      let updatedTypingUsers = new Set(state.typingUsers[roomId] || []);
      
      if (typing) {
        // Khi status là typing=true, thêm hoặc cập nhật user
        const newUserInfo: TypingUserInfo = { userId, userName };
        
        // Xóa user cũ (nếu có) và thêm user mới để tránh trùng lặp
        updatedTypingUsers = new Set(
          Array.from(updatedTypingUsers).filter((user: TypingUserInfo) => user.userId !== userId)
        );
        updatedTypingUsers.add(newUserInfo);
      } else {
        // Khi status là typing=false, xóa user
        updatedTypingUsers = new Set(
          Array.from(updatedTypingUsers).filter((user: TypingUserInfo) => user.userId !== userId)
        );
      }
      
      return {
        ...state,
        typingUsers: { ...state.typingUsers, [roomId as string]: updatedTypingUsers }
      };
    }
    
    case ActionType.SET_USER_STATUS: {
      const { userId, online, lastSeen } = action.payload;
      const onlineUsers = new Set(state.onlineUsers);
      
      if (online) {
        onlineUsers.add(userId);
      } else {
        onlineUsers.delete(userId);
      }
      
      return {
        ...state,
        onlineUsers,
        lastSeenAt: { ...state.lastSeenAt, [userId]: lastSeen }
      };
    }
    
    case ActionType.ADD_ATTACHMENT: {
      const attachment = action.payload;
      const messageId = attachment.messageId;
      const existingAttachments = state.attachments[messageId] || [];
      
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [messageId]: [...existingAttachments, attachment]
        }
      };
    }
    
    case ActionType.UPDATE_PAGINATION:
      return {
        ...state,
        messagesPagination: {
          ...state.messagesPagination,
          [action.payload.roomId]: {
            page: action.payload.page,
            hasMore: action.payload.hasMore
          }
        }
      };
    
    case ActionType.RESET:
      return initialState;
    
    default:
      return state;
  }
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { isAuthenticated, token, userDetails } = useAuth();

  // WebSocket connection management
  const connectWebSocket = useCallback(async () => {
    if (isAuthenticated && token) {
      try {
        await chatWebSocketService.connect(token);
        // Set online status when connected
        chatWebSocketService.updateUserStatus(true);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        message.error('Failed to connect to chat service. Please refresh the page.');
      }
    }
  }, [isAuthenticated, token]);

  const disconnectWebSocket = useCallback(() => {
    if (chatWebSocketService.isConnected()) {
      // Update status to offline before disconnecting
      chatWebSocketService.updateUserStatus(false);
      chatWebSocketService.disconnect();
    }
  }, []);

  // Mark messages as read - Di chuyển khai báo lên trước để khắc phục dependency cycle
  const markMessagesAsRead = useCallback((roomId: string, messageIds: string[]) => {
    const markReadData = { roomId, messageIds };
    
    // Ưu tiên sử dụng WebSocket nếu đã kết nối
    if (chatWebSocketService.isConnected()) {
      // Chỉ gửi qua WebSocket nếu đã kết nối
      chatWebSocketService.markRead(markReadData);
    } else {
      // Nếu WebSocket không kết nối, sử dụng REST API
      chatApi.markRead(markReadData).catch(error => {
        console.error('Đánh dấu tin nhắn đã đọc thất bại:', error);
      });
    }
  }, []);
  
  // Select a room and load its messages
  const selectRoom = useCallback(async (roomId: string) => {
    dispatch({ type: ActionType.SELECT_ROOM, payload: roomId });
    
    // Chỉ tải tin nhắn khi chưa có tin nhắn trong cache
    if (!state.messages[roomId]) {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      
      try {
        // Luôn bắt đầu với page=0 khi mới vào phòng chat
        const params = { page: 0, size: 30 };
        const response = await chatApi.getMessagesPaged(roomId, params);
        
        // Lấy danh sách tin nhắn từ trường content trong response
        const messages = response.data.content;
        const totalPages = response.data.totalPages || 0;
        
        dispatch({
          type: ActionType.SET_MESSAGES,
          payload: { roomId, messages }
        });
        
        // Cập nhật trạng thái phân trang
        dispatch({
          type: ActionType.UPDATE_PAGINATION,
          payload: { 
            roomId, 
            page: 0, 
            hasMore: messages.length === params.size && totalPages > 1
          }
        });
        
        // Mark all messages as read
        if (userDetails?.id) {
          const userId = userDetails.id;
          const unreadMessages = messages
            .filter(msg => msg.senderId !== userId && 
                           (!msg.messageStatus[userId] || 
                            msg.messageStatus[userId] !== 'SEEN'))
            .map(msg => msg.id);
          
          if (unreadMessages.length > 0) {
            markMessagesAsRead(roomId, unreadMessages);
          }
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        dispatch({ type: ActionType.SET_ERROR, payload: 'Failed to load messages' });
        message.error('Failed to load messages');
      } finally {
        dispatch({ type: ActionType.SET_LOADING, payload: false });
      }
    }
  }, [state.messages, userDetails?.id, markMessagesAsRead]);

  // Set up WebSocket callbacks
  useEffect(() => {
    chatWebSocketService.setCallbacks({
      onMessage: (message) => {
        dispatch({ type: ActionType.ADD_MESSAGE, payload: message });
      },
      onMessageStatus: (status) => {
        dispatch({ type: ActionType.UPDATE_MESSAGE_STATUS, payload: status });
      },
      onTyping: (status) => {
        dispatch({ type: ActionType.SET_TYPING_STATUS, payload: status });
      },
      onUserStatus: (status) => {
        dispatch({ type: ActionType.SET_USER_STATUS, payload: status });
      },
      onConnect: () => {
        console.log('WebSocket connected');
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        message.error('Chat service connection error. Please refresh the page.');
      }
    });
  }, []);

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, connectWebSocket, disconnectWebSocket]);

  // Update online status when page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (chatWebSocketService.isConnected()) {
        chatWebSocketService.updateUserStatus(!document.hidden);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load chat rooms
  const loadChatRooms = useCallback(async (page = 0, size = 20, sort = 'createdAt,desc') => {
    if (!isAuthenticated) return;
    
    dispatch({ type: ActionType.SET_LOADING, payload: true });
    
    try {
      const response = await chatApi.getRooms({ page, size, sort });
      // Map latestMessage từ API sang lastMessage cho từng phòng chat
      const rooms = response.data.content.map((room: any) => ({
        ...room,
        lastMessage: room.latestMessage || room.lastMessage // Ưu tiên latestMessage nếu có
      }));
      dispatch({ type: ActionType.SET_ROOMS, payload: rooms });
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      dispatch({ type: ActionType.SET_ERROR, payload: 'Failed to load chat rooms' });
      message.error('Failed to load chat rooms');
    } finally {
      dispatch({ type: ActionType.SET_LOADING, payload: false });
    }
  }, [isAuthenticated]);

  // Send a message
  const sendMessage = useCallback(async (
    content: string, 
    attachmentIds: string[] = [], 
    replyToMessageId?: string, 
    mentionUserIds?: string[]
  ): Promise<void> => {
    if (!state.selectedRoomId) return;
    
    const messageData: SendMessageRequest = {
      roomId: state.selectedRoomId,
      content,
      attachmentIds,
      replyToMessageId,
      mentionUserIds
    };
    
    try {
      // Ưu tiên sử dụng WebSocket nếu đã kết nối
      if (chatWebSocketService.isConnected()) {
        // Chỉ gửi qua WebSocket nếu đã kết nối
        chatWebSocketService.sendMessage(messageData);
      } else {
        // Nếu WebSocket không kết nối, sử dụng REST API
        message.info('Sử dụng API để gửi tin nhắn do WebSocket không kết nối');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      message.error('Gửi tin nhắn thất bại');
    }
  }, [state.selectedRoomId]);

  // Create a new chat room
  const createChatRoom = useCallback(async (
    name: string, 
    type: string, 
    participantIds: number[], 
    projectId?: string
  ) => {
    dispatch({ type: ActionType.SET_LOADING, payload: true });
    
    try {
      const response = await chatApi.createRoom({
        name,
        type: type as 'PROJECT' | 'SUPPORT' | 'PRIVATE',
        participantIds,
        projectId
      });
      
      dispatch({ type: ActionType.ADD_ROOM, payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Failed to create chat room:', error);
      dispatch({ type: ActionType.SET_ERROR, payload: 'Failed to create chat room' });
      message.error('Failed to create chat room');
    } finally {
      dispatch({ type: ActionType.SET_LOADING, payload: false });
    }
  }, []);

  // Update typing status
  const setTyping = useCallback((roomId: string, typing: boolean) => {
    chatWebSocketService.updateTyping(roomId, typing);
  }, []);

  // Upload attachment
  const uploadAttachment = useCallback(async (roomId: string, file: File) => {
    try {
      const response = await chatApi.uploadAttachment(roomId, file);
      dispatch({ type: ActionType.ADD_ATTACHMENT, payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      message.error('Failed to upload attachment');
    }
  }, []);

  // Check if user is typing in a room
  const isUserTyping = useCallback((roomId: string, userId: number): boolean => {
    if (!state.typingUsers[roomId]) return false;
    
    // Kiểm tra xem userId có trong danh sách người đang gõ không
    let found = false;
    state.typingUsers[roomId].forEach(user => {
      if (user.userId === userId) {
        found = true;
      }
    });
    return found;
  }, [state.typingUsers]);

  // Check if user is online
  const isUserOnline = useCallback((userId: number): boolean => {
    return state.onlineUsers.has(userId);
  }, [state.onlineUsers]);

  // Get user's last seen timestamp
  const getUserLastSeen = useCallback((userId: number): string | null => {
    return state.lastSeenAt[userId] || null;
  }, [state.lastSeenAt]);

  // Add loadMoreMessages function
  const loadMoreMessages = useCallback(async (roomId: string, page: number, size: number): Promise<boolean> => {
    if (!roomId) return false;
    
    dispatch({ type: ActionType.SET_LOADING, payload: true });
    
    try {
      const params = { page, size };
      const response = await chatApi.getMessagesPaged(roomId, params);
      const olderMessages = response.data.content;
      
      if (olderMessages.length === 0) {
        dispatch({ 
          type: ActionType.UPDATE_PAGINATION, 
          payload: { roomId, page, hasMore: false } 
        });
        return false; // Không còn tin nhắn để tải
      }
      
      // Kết hợp tin nhắn cũ với tin nhắn hiện có
      const currentMessages = state.messages[roomId] || [];
      const allMessages = [...currentMessages, ...olderMessages];
      
      // Giới hạn số lượng tin nhắn để tránh vấn đề hiệu suất
      const MAX_MESSAGES = 200;
      const finalMessages = allMessages.length > MAX_MESSAGES 
        ? allMessages.slice(0, MAX_MESSAGES) 
        : allMessages;
      
      dispatch({
        type: ActionType.SET_MESSAGES,
        payload: { roomId, messages: finalMessages }
      });
      
      dispatch({ 
        type: ActionType.UPDATE_PAGINATION, 
        payload: { roomId, page, hasMore: olderMessages.length === size } 
      });
      
      return olderMessages.length === size; // Còn tin nhắn nếu nhận đủ số lượng yêu cầu
    } catch (error) {
      console.error('Failed to load more messages:', error);
      dispatch({ type: ActionType.SET_ERROR, payload: 'Failed to load more messages' });
      return false;
    } finally {
      dispatch({ type: ActionType.SET_LOADING, payload: false });
    }
  }, [state.messages, dispatch]);

  // Value object
  const value: ChatContextType = {
    state,
    loadChatRooms,
    selectRoom,
    sendMessage,
    markMessagesAsRead,
    createChatRoom,
    setTyping,
    uploadAttachment,
    disconnectWebSocket,
    reconnectWebSocket: connectWebSocket,
    isUserTyping,
    isUserOnline,
    getUserLastSeen,
    loadMoreMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use the chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};

export default ChatContext; 