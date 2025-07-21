import React, { createContext, useContext, useState, useEffect, useCallback, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
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
  attachments: {}
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
          [roomId as string]: [...existingMessages, action.payload]
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
  const navigate = useNavigate();

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
      // Lấy danh sách phòng chat từ response.data.content
      dispatch({ type: ActionType.SET_ROOMS, payload: response.data.content });
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      dispatch({ type: ActionType.SET_ERROR, payload: 'Failed to load chat rooms' });
      message.error('Failed to load chat rooms');
    } finally {
      dispatch({ type: ActionType.SET_LOADING, payload: false });
    }
  }, [isAuthenticated]);

  // Select a room and load its messages
  const selectRoom = useCallback(async (roomId: string) => {
    dispatch({ type: ActionType.SELECT_ROOM, payload: roomId });
    
    if (!state.messages[roomId]) {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      
      try {
        // Sử dụng endpoint phân trang
        const params = { page: 0, size: 30 }; // Lấy 40 tin nhắn gần nhất
        const response = await chatApi.getMessagesPaged(roomId, params);
        
        // Lấy danh sách tin nhắn từ trường content trong response
        const messages = response.data.content;
        
        dispatch({
          type: ActionType.SET_MESSAGES,
          payload: { roomId, messages }
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
  }, [state.messages, userDetails?.id]);

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
        const response = await chatApi.sendMessage(messageData);
        message.info('Sử dụng API để gửi tin nhắn do WebSocket không kết nối');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      message.error('Gửi tin nhắn thất bại');
    }
  }, [state.selectedRoomId]);

  // Mark messages as read
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
    getUserLastSeen
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