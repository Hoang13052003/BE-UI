// Updated ChatContext to match current Messages.tsx dependencies
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { message as antdMessage } from "antd";
import {
  ChatMessageResponse,
  ChatRoomResponse,
  UnreadMessageCountResponse,
  OnlineUsersResponse,
  getUserChatRooms,
  getUnreadMessageCount,
  getOnlineUsers,
  sendMessage,
  markMessageAsRead,
  ChatMessageRequest,
  joinProjectChat as joinProjectChatApi,
  subscribeToTopic as subscribeToTopicApi,
} from "../api/chatApi";
import chatService from "../services/ChatService";
import { useAuth } from "./AuthContext";

export interface ChatContextType {
  messages: ChatMessageResponse[];
  chatRooms: ChatRoomResponse[];
  activeChatRoom: ChatRoomResponse | null;
  unreadCount: UnreadMessageCountResponse | null;
  onlineUsers: OnlineUsersResponse | null;
  isConnected: boolean;
  loading: boolean;

  sendChatMessage: (
    message: ChatMessageRequest
  ) => Promise<ChatMessageResponse>;
  selectChatRoom: (roomId: string) => void;
  markMessageRead: (messageId: string) => Promise<void>;
  loadChatHistory: (roomId: string, page?: number) => Promise<void>;
  refreshChatRooms: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  refreshOnlineUsers: () => Promise<void>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  joinProjectChat: (projectId: number) => Promise<void>;
  subscribeToTopic: (topic: string, projectId?: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { isAuthenticated, userDetails } = useAuth();
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoomResponse[]>([]);
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoomResponse | null>(
    null
  );
  const [unreadCount, setUnreadCount] =
    useState<UnreadMessageCountResponse | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUsersResponse | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMessage = useCallback(
    (message: any) => {
      if (!message || !message.id) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });

      if (message.senderId !== userDetails?.id) {
        antdMessage.info(
          `New message from ${message.senderName}: ${message.content}`
        );
      }

      refreshUnreadCount();
    },
    [userDetails?.id]
  );

  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ Set callback to update connection status
    chatService.setConnectionStatusCallback(setIsConnected);
    
    chatService.connect(token);
    chatService.addListener("TEXT", handleMessage);
    chatService.addListener("FILE", handleMessage);
    chatService.addListener("all", handleMessage);
    
    // ✅ Remove this line as it will be handled by callback
    // setIsConnected(chatService.isSocketConnected());
  }, [handleMessage]);

  const disconnectWebSocket = useCallback(() => {
    chatService.disconnect();
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
  }, [isAuthenticated, connectWebSocket, disconnectWebSocket]);

  const sendChatMessage = useCallback(async (msg: ChatMessageRequest) => {
    try {
      const response = await sendMessage(msg);
      if (chatService.isSocketConnected()) {
        chatService.sendMessage({ ...msg });
      }
      return response;
    } catch (error) {
      console.error("Send message error:", error);
      antdMessage.error("Failed to send message");
      throw error;
    }
  }, []);

  const selectChatRoom = useCallback(
    (roomId: string) => {
      const room = chatRooms.find((r) => r.id === roomId);
      setActiveChatRoom(room || null);
      if (room) loadChatHistory(roomId);
    },
    [chatRooms]
  );

  const markMessageRead = useCallback(async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
      );
      refreshUnreadCount();
    } catch (error) {
      console.error("Mark read error:", error);
      antdMessage.error("Failed to mark message as read");
    }
  }, []);

  const loadChatHistory = useCallback(
    async (roomId: string, page = 0) => {
      if (!activeChatRoom) return;
      try {
        setLoading(true);
        let history;
        if (
          activeChatRoom.roomType === "PRIVATE" &&
          activeChatRoom.participants.length >= 2
        ) {
          const other = activeChatRoom.participants.find(
            (p) => p.userId !== userDetails?.id
          );
          if (other) {
            const { getPrivateChatHistory } = await import("../api/chatApi");
            history = await getPrivateChatHistory(other.userId, page);
          }
        } else if (activeChatRoom.roomType === "PROJECT_CHAT") {
          const { getProjectChatHistory } = await import("../api/chatApi");
          history = await getProjectChatHistory(
            activeChatRoom.projectId!,
            page
          );
        } else if (activeChatRoom.roomType === "GROUP") {
          const { getGroupChatHistory } = await import("../api/chatApi");
          history = await getGroupChatHistory(activeChatRoom.roomName, page);
        }

        if (history) {
          setMessages((prev) =>
            page === 0 ? history.messages : [...history.messages, ...prev]
          );
        }
      } catch (err) {
        console.error("Load history error:", err);
        antdMessage.error("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    },
    [activeChatRoom, userDetails?.id]
  );

  const refreshChatRooms = useCallback(async () => {
    try {
      const rooms = await getUserChatRooms();
      setChatRooms(rooms);
    } catch (err) {
      console.error("Refresh rooms error:", err);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadMessageCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Refresh unread error:", err);
    }
  }, []);

  const refreshOnlineUsers = useCallback(async () => {
    try {
      const users = await getOnlineUsers();
      setOnlineUsers(users);
    } catch (err) {
      console.error("Refresh online error:", err);
    }
  }, []);

  const joinProjectChat = useCallback(
    async (projectId: number) => {
      try {
        await joinProjectChatApi(projectId);
        await refreshChatRooms();
      } catch (err) {
        console.error("Join project chat error:", err);
        antdMessage.error("Failed to join project chat");
      }
    },
    [refreshChatRooms]
  );

  const subscribeToTopic = useCallback(
    async (topic: string, projectId?: number) => {
      try {
        await subscribeToTopicApi({ topic, projectId });
      } catch (err) {
        console.error("Subscribe topic error:", err);
        antdMessage.error("Failed to subscribe to topic");
      }
    },
    []
  );

  const contextValue: ChatContextType = {
    messages,
    chatRooms,
    activeChatRoom,
    unreadCount,
    onlineUsers,
    isConnected,
    loading,
    sendChatMessage,
    selectChatRoom,
    markMessageRead,
    loadChatHistory,
    refreshChatRooms,
    refreshUnreadCount,
    refreshOnlineUsers,
    connectWebSocket,
    disconnectWebSocket,
    joinProjectChat,
    subscribeToTopic,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export default ChatProvider;
