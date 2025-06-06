// Updated ChatContext to match current Messages.tsx dependencies
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
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
  markMessageAsRead,
  ChatMessageRequest,
  ChatMessageType,
  ChatRoomType, // Ensure ChatRoomType is imported if not already
  subscribeToTopic as subscribeToTopicApi,
} from "../api/chatApi";
import chatServiceNew from "../services/ChatServiceNew";
import { useAuth } from "./AuthContext";

export interface ChatContextType {
  messages: ChatMessageResponse[];
  chatRooms: ChatRoomResponse[];
  activeChatRoom: ChatRoomResponse | null;
  unreadCount: UnreadMessageCountResponse | null;
  onlineUsers: OnlineUsersResponse | null;
  isConnected: boolean;
  loading: boolean;
  typingUsers: Array<{ userId: number; userName: string; userAvatar?: string }>; // Danh sách người đang gõ trong phòng active

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
  subscribeToTopic: (topic: string, projectId?: number) => Promise<void>;
  sendTypingActivity: () => void; // Hàm để gọi khi người dùng gõ
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
  console.log(
    "ChatProvider initialized, isAuthenticated:",
    isAuthenticated,
    "userDetails:",
    userDetails
  );
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
  const [typingUsers, setTypingUsers] = useState<
    Array<{ userId: number; userName: string; userAvatar?: string }>
  >([]);
  const typingTimers = useRef<Record<string, NodeJS.Timeout>>({});

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

  const sendTypingActivity = useCallback(() => {
    if (
      !activeChatRoom ||
      !userDetails ||
      !chatServiceNew.isSocketConnected()
    ) {
      console.log("[ChatContext.tsx] sendTypingActivity: Conditions not met", {
        activeChatRoom,
        userDetails,
        connected: chatServiceNew.isSocketConnected(),
      });
      return;
    }
    console.log(
      "[ChatContext.tsx] sendTypingActivity: Sending event for room:",
      activeChatRoom.id,
      "type:",
      activeChatRoom.roomType
    );
    chatServiceNew.sendGenericTypingEvent(
      activeChatRoom.id,
      activeChatRoom.roomType
    );
  }, [activeChatRoom, userDetails]);

  const handleUserTypingEvent = useCallback(
    (data: any) => {
      console.log("[ChatContext.tsx] handleUserTypingEvent received:", data);
      // Server gửi: { type: "user_typing", userId, userName, userAvatar, roomId, roomType }
      if (
        data.roomId !== activeChatRoom?.id ||
        data.userId === userDetails?.id
      ) {
        console.log("[ChatContext.tsx] handleUserTypingEvent: Event ignored", {
          currentRoomId: activeChatRoom?.id,
          eventRoomId: data.roomId,
          eventUserId: data.userId,
          currentUserId: userDetails?.id,
        });
        // Bỏ qua nếu không phải cho phòng chat hiện tại hoặc là sự kiện từ chính mình
        return;
      }

      console.log(
        "[ChatContext.tsx] handleUserTypingEvent: Processing for user:",
        data.userId
      );
      setTypingUsers((prev) => {
        const existingUser = prev.find((u) => u.userId === data.userId);
        if (existingUser) return prev; // Đã hiển thị rồi
        return [
          ...prev,
          {
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
          },
        ];
      });

      if (typingTimers.current[data.userId]) {
        clearTimeout(typingTimers.current[data.userId]);
      }

      typingTimers.current[data.userId] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        delete typingTimers.current[data.userId];
      }, 3000); // Ẩn sau 3 giây nếu không có hoạt động mới
    },
    [activeChatRoom?.id, userDetails?.id]
  );

  // Xử lý tin nhắn nhận được từ WebSocket
  const handleWebSocketMessage = useCallback(
    (receivedData: any) => {
      // receivedData là object BE gửi về, đã được dispatchMessage của service xử lý
      // và có dạng { type: "private_message", messageId: ..., senderId: ..., content: ..., chatMessageType: "TEXT", ... }

      console.log("ChatContext received data for listener:", receivedData); // Kiểm tra xem có phải tin nhắn chat không (BE đã thêm trường `type`)
      if (
        ["private_message", "group_message", "project_message"].includes(
          receivedData.type
        )
      ) {
        // Xử lý senderName với logic fallback tốt hơn
        let senderName = receivedData.senderName;
        if (!senderName) {
          // Nếu là tin nhắn của chính mình
          if (receivedData.senderId === userDetails?.id && userDetails) {
            senderName = userDetails.fullName || "You";
          } else {
            // Thử tìm tên từ danh sách participants trong activeChatRoom
            const participant = activeChatRoom?.participants.find(
              (p) => p.userId === receivedData.senderId
            );
            senderName =
              participant?.fullName || `User ${receivedData.senderId}`;
          }
        }

        const newMessage: ChatMessageResponse = {
          id: receivedData.messageId || receivedData.id,
          senderId: receivedData.senderId,
          senderName: senderName,
          senderImageProfile: receivedData.senderImageProfile,
          receiverId: receivedData.receiverId,
          topic: receivedData.topic,
          projectId: receivedData.projectId,
          projectName: receivedData.projectName,
          content: receivedData.content,
          timestamp: receivedData.timestamp,
          isRead:
            receivedData.isRead || receivedData.senderId === userDetails?.id,
          isDelivered: true,
          messageType: receivedData.chatMessageType as ChatMessageType,
          fileUrl: receivedData.fileUrl,
          fileName: receivedData.fileName,
          createdAt: receivedData.timestamp || receivedData.createdAt,
        };

        // Nếu có tin nhắn mới từ người đang gõ, xóa họ khỏi danh sách đang gõ
        if (
          activeChatRoom &&
          ((activeChatRoom.roomType === ChatRoomType.PRIVATE &&
            ((newMessage.senderId === userDetails?.id &&
              newMessage.receiverId ===
                activeChatRoom.participants.find(
                  (p) => p.userId !== userDetails?.id
                )?.userId) ||
              (newMessage.receiverId === userDetails?.id &&
                newMessage.senderId ===
                  activeChatRoom.participants.find(
                    (p) => p.userId !== userDetails?.id
                  )?.userId))) ||
            (activeChatRoom.roomType === ChatRoomType.PROJECT_CHAT &&
              newMessage.projectId === activeChatRoom.projectId) ||
            (activeChatRoom.roomType === ChatRoomType.GROUP &&
              newMessage.topic === activeChatRoom.roomName))
        ) {
          if (typingTimers.current[newMessage.senderId]) {
            clearTimeout(typingTimers.current[newMessage.senderId]);
            delete typingTimers.current[newMessage.senderId];
          }
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== newMessage.senderId)
          );
        }

        setMessages((prev) => {
          // Tránh thêm tin nhắn trùng lặp
          if (prev.some((m) => m.id === newMessage.id)) return prev;

          // Chỉ thêm message vào state nếu thuộc về active room
          if (activeChatRoom) {
            if (activeChatRoom.roomType === "PRIVATE") {
              const otherUserId = activeChatRoom.participants.find(
                (p) => p.userId !== userDetails?.id
              )?.userId;
              if (
                !(
                  (newMessage.senderId === userDetails?.id &&
                    newMessage.receiverId === otherUserId) ||
                  (newMessage.receiverId === userDetails?.id &&
                    newMessage.senderId === otherUserId)
                )
              ) {
                return prev;
              }
            } else if (activeChatRoom.roomType === "PROJECT_CHAT") {
              if (newMessage.projectId !== activeChatRoom.projectId) {
                return prev;
              }
            } else if (activeChatRoom.roomType === "GROUP") {
              if (newMessage.topic !== activeChatRoom.roomName) {
                return prev;
              }
            }
          }

          return [...prev, newMessage].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

        // Thông báo nếu không phải tin của mình
        if (newMessage.senderId !== userDetails?.id) {
          antdMessage.success(`Tin nhắn mới từ ${newMessage.senderName}`);
        }

        refreshUnreadCount();
        refreshChatRooms();
      }
    },
    [
      userDetails,
      activeChatRoom,
      refreshUnreadCount,
      refreshChatRooms,
      typingTimers,
    ] // Add typingTimers
  );

  // Xử lý xác nhận tin nhắn đã gửi từ server
  const handleMessageSentConfirmation = useCallback(
    (confirmationData: any) => {
      console.log("Message sent confirmation in Context:", confirmationData);
      setMessages((prevMessages) =>
        prevMessages
          .map((msg) => {
            // Nếu BE trả về tempId mà FE đã gửi
            if (confirmationData.tempId && msg.id === confirmationData.tempId) {
              return {
                ...msg,
                id: confirmationData.messageId,
                isDelivered: confirmationData.delivered || true,
                timestamp: confirmationData.timestamp || msg.timestamp,
              };
            }
            // Nếu không có tempId, dựa vào messageId
            if (
              msg.senderId === userDetails?.id &&
              msg.id === confirmationData.messageId
            ) {
              return {
                ...msg,
                isDelivered: confirmationData.delivered || true,
                timestamp: confirmationData.timestamp || msg.timestamp,
              };
            }
            return msg;
          })
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
      );
    },
    [userDetails]
  );

  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem("token");
    console.log(
      "Attempting to connect WebSocket, token:",
      token ? "exists" : "missing"
    );
    if (!token) return;

    // Disconnect and clean up any existing connection first
    chatServiceNew.disconnect();

    // Set callback to update connection status
    chatServiceNew.setConnectionStatusCallback(setIsConnected);

    chatServiceNew.connect(token);

    // Clear existing listeners first to avoid duplicates
    chatServiceNew.removeAllListeners();

    // Add listeners
    chatServiceNew.addListener(ChatMessageType.TEXT, handleWebSocketMessage);
    chatServiceNew.addListener(ChatMessageType.FILE, handleWebSocketMessage);
    chatServiceNew.addListener(ChatMessageType.IMAGE, handleWebSocketMessage);
    chatServiceNew.addListener(ChatMessageType.VIDEO, handleWebSocketMessage);
    chatServiceNew.addListener(ChatMessageType.AUDIO, handleWebSocketMessage);
    chatServiceNew.addListener(
      ChatMessageType.SYSTEM_NOTIFICATION,
      handleWebSocketMessage
    );
    chatServiceNew.addListener(
      "message_sent_confirmation",
      handleMessageSentConfirmation
    );
    // Add listener for typing events
    chatServiceNew.addListener("user_typing", handleUserTypingEvent);
  }, [
    handleWebSocketMessage,
    handleMessageSentConfirmation,
    handleUserTypingEvent,
  ]);

  const disconnectWebSocket = useCallback(() => {
    chatServiceNew.disconnect();
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();
      // Clear existing listeners first to avoid duplicates before adding new ones
      chatServiceNew.removeAllListeners();

      // Add listeners for message types
      chatServiceNew.addListener(ChatMessageType.TEXT, handleWebSocketMessage);
      chatServiceNew.addListener(ChatMessageType.FILE, handleWebSocketMessage);
      chatServiceNew.addListener(ChatMessageType.IMAGE, handleWebSocketMessage);
      chatServiceNew.addListener(ChatMessageType.VIDEO, handleWebSocketMessage);
      chatServiceNew.addListener(ChatMessageType.AUDIO, handleWebSocketMessage);
      chatServiceNew.addListener(
        ChatMessageType.SYSTEM_NOTIFICATION,
        handleWebSocketMessage
      );
      chatServiceNew.addListener(
        "message_sent_confirmation",
        handleMessageSentConfirmation
      );
      // Add listener for typing events
      chatServiceNew.addListener("user_typing", handleUserTypingEvent);
    } else {
      disconnectWebSocket();
    }
    // Cleanup listener on component unmount or when isAuthenticated changes
    return () => {
      // Consider if removeAllListeners here is too broad if other components might use the service
      // chatServiceNew.removeAllListeners();
      // Or more specifically:
      chatServiceNew.removeListener(
        ChatMessageType.TEXT,
        handleWebSocketMessage
      );
      chatServiceNew.removeListener(
        ChatMessageType.FILE,
        handleWebSocketMessage
      );
      chatServiceNew.removeListener(
        ChatMessageType.IMAGE,
        handleWebSocketMessage
      );
      chatServiceNew.removeListener(
        ChatMessageType.VIDEO,
        handleWebSocketMessage
      );
      chatServiceNew.removeListener(
        ChatMessageType.AUDIO,
        handleWebSocketMessage
      );
      chatServiceNew.removeListener(
        ChatMessageType.SYSTEM_NOTIFICATION,
        handleWebSocketMessage
      );
      chatServiceNew.removeListener(
        "message_sent_confirmation",
        handleMessageSentConfirmation
      );
      chatServiceNew.removeListener("user_typing", handleUserTypingEvent);
    };
  }, [
    isAuthenticated,
    connectWebSocket,
    disconnectWebSocket,
    handleWebSocketMessage,
    handleMessageSentConfirmation,
    handleUserTypingEvent,
  ]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimers.current).forEach(clearTimeout);
      typingTimers.current = {};
    };
  }, []);

  useEffect(() => {
    setTypingUsers([]); // Xóa người đang gõ khi chuyển phòng
    Object.values(typingTimers.current).forEach(clearTimeout);
    typingTimers.current = {};
  }, [activeChatRoom]);

  const sendChatMessage = useCallback(
    async (msgRequest: ChatMessageRequest) => {
      // msgRequest là từ FE, có các trường như receiverId, topic, content, messageType
      if (!isAuthenticated || !userDetails) {
        antdMessage.error("Bạn cần đăng nhập để gửi tin nhắn.");
        throw new Error("User not authenticated");
      }

      try {
        // Chuẩn bị message cho chatService.sendMessage
        const serviceMessagePayload = {
          receiverId: msgRequest.receiverId,
          topic: msgRequest.topic,
          projectId: msgRequest.projectId,
          content: msgRequest.content,
          chatMessageType: msgRequest.messageType || ChatMessageType.TEXT, // Chuyển messageType thành chatMessageType
          fileUrl: msgRequest.fileUrl,
          fileName: msgRequest.fileName,
        };

        // Tạo một tempId để map với confirmation từ server
        const tempId = `temp_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        // Gửi qua WebSocket nếu kết nối
        if (chatServiceNew.isSocketConnected()) {
          // Gửi payload đã chuẩn bị
          chatServiceNew.sendMessage({ ...serviceMessagePayload });

          // Tạo mock response cho UI update ngay lập tức
          const mockResponse: ChatMessageResponse = {
            id: tempId, // Sử dụng tempId
            senderId: userDetails.id,
            senderName: userDetails.fullName || "You",
            senderImageProfile: userDetails.image || undefined,
            receiverId: msgRequest.receiverId,
            topic: msgRequest.topic,
            projectId: msgRequest.projectId,
            content: msgRequest.content,
            timestamp: new Date().toISOString(),
            isRead: true, // Tin nhắn của mình tự đọc
            isDelivered: false, // Sẽ được cập nhật khi có confirmation từ server
            messageType: msgRequest.messageType || ChatMessageType.TEXT,
            fileUrl: msgRequest.fileUrl,
            fileName: msgRequest.fileName,
            createdAt: new Date().toISOString(),
          };

          // Thêm tin nhắn tạm thời này vào messages state
          setMessages((prevMessages) =>
            [...prevMessages, mockResponse].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            )
          );

          return mockResponse; // Trả về mock response
        } else {
          // Fallback: Gửi qua API (nếu muốn)
          antdMessage.warning(
            "Không có kết nối WebSocket, đang thử gửi qua API..."
          );
          throw new Error(
            "WebSocket not connected, API fallback not implemented for sendChatMessage in context."
          );
        }
      } catch (error) {
        console.error("Error sending chat message in context:", error);
        antdMessage.error("Gửi tin nhắn thất bại.");
        throw error;
      }
    },
    [isAuthenticated, userDetails]
  );
  const loadChatHistory = useCallback(
    async (roomId: string, page = 0) => {
      // Tìm room từ roomId thay vì dựa vào activeChatRoom state
      const room = chatRooms.find((r) => r.id === roomId);
      if (!room) {
        console.log("LoadChatHistory: No room found with ID:", roomId);
        return;
      }
      console.log("LoadChatHistory: Loading for room", room);
      try {
        setLoading(true);
        let history;
        if (room.roomType === "PRIVATE" && room.participants.length >= 2) {
          const other = room.participants.find(
            (p) => p.userId !== userDetails?.id
          );
          if (other) {
            console.log("Loading private chat history for user:", other.userId);
            const { getPrivateChatHistory } = await import("../api/chatApi");
            history = await getPrivateChatHistory(other.userId, page);
          }
        } else if (room.roomType === "PROJECT_CHAT") {
          console.log(
            "Loading project chat history for project:",
            room.projectId
          );
          const { getProjectChatHistory } = await import("../api/chatApi");
          history = await getProjectChatHistory(room.projectId!, page);
        } else if (room.roomType === "GROUP") {
          console.log("Loading group chat history for topic:", room.roomName);
          const { getGroupChatHistory } = await import("../api/chatApi");
          history = await getGroupChatHistory(room.roomName, page);
        }

        if (history) {
          console.log(
            "LoadChatHistory: Got history with",
            history.messages?.length,
            "messages"
          );
          setMessages((prev) =>
            page === 0 ? history.messages : [...history.messages, ...prev]
          );
        } else {
          console.log("LoadChatHistory: No history received");
        }
      } catch (err) {
        console.error("Load history error:", err);
        antdMessage.error("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    },
    [chatRooms, userDetails?.id]
  );
  const selectChatRoom = useCallback(
    (roomId: string) => {
      console.log("SelectChatRoom: Selecting room with ID:", roomId);
      const room = chatRooms.find((r) => r.id === roomId);
      console.log("SelectChatRoom: Found room:", room);
      setActiveChatRoom(room || null);
      if (room) {
        console.log(
          "SelectChatRoom: Calling loadChatHistory for room:",
          room.id
        );
        loadChatHistory(roomId);
      } else {
        console.log("SelectChatRoom: No room found with ID:", roomId);
      }
    },
    [chatRooms, loadChatHistory]
  );

  const markMessageReadInContext = useCallback(
    async (messageId: string) => {
      try {
        // Gọi qua WebSocket nếu kết nối
        if (chatServiceNew.isSocketConnected()) {
          chatServiceNew.markMessageAsRead(messageId);
        } else {
          // Fallback API
          await markMessageAsRead(messageId);
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
        );

        await Promise.all([
          refreshUnreadCount(), // Cập nhật số lượng tin chưa đọc
          refreshChatRooms(), // Cập nhật trạng thái phòng chat
        ]);
      } catch (error) {
        console.error("Mark read error in context:", error);
        antdMessage.error("Failed to mark message as read");
      }
    },
    [refreshUnreadCount, refreshChatRooms]
  );

  const subscribeToTopic = useCallback(
    async (topic: string, projectId?: number) => {
      if (!isAuthenticated) {
        antdMessage.error("User not authenticated");
        return Promise.reject("User not authenticated");
      }

      try {
        if (chatServiceNew.isSocketConnected()) {
          // projectId hiện tại không được dùng trong chatServiceNew.subscribeToTopic
          // Nếu BE cần projectId cho subscribe, cần cập nhật cả BE và FE service
          chatServiceNew.subscribeToTopic(topic);
          await subscribeToTopicApi({ topic, projectId }); // Vẫn gọi API để BE lưu trữ
          antdMessage.success(`Đã đăng ký nhận tin từ ${topic}`);
        } else {
          antdMessage.error("Chưa kết nối chat, không thể đăng ký topic.");
          throw new Error("WebSocket not connected for topic subscription");
        }
      } catch (err) {
        console.error("Subscribe topic error:", err);
        antdMessage.error("Không thể đăng ký topic");
        throw err;
      }
    },
    [isAuthenticated]
  );

  const contextValue: ChatContextType = {
    messages,
    chatRooms,
    activeChatRoom,
    unreadCount,
    onlineUsers,
    isConnected,
    loading,
    typingUsers, // Thêm vào context
    sendChatMessage,
    selectChatRoom,
    markMessageRead: markMessageReadInContext,
    loadChatHistory,
    refreshChatRooms,
    refreshUnreadCount,
    refreshOnlineUsers,
    connectWebSocket,
    disconnectWebSocket,
    subscribeToTopic,
    sendTypingActivity, // Thêm vào context
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export default ChatProvider;
