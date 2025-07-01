// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   ReactNode,
//   useRef,
// } from "react";
// import { message as antdMessage } from "antd";
// // import {
// //   ChatMessageResponse,
// //   ChatRoomResponse,
// //   UnreadMessageCountResponse,
// //   OnlineUsersResponse,
// //   getUserChatRooms,
// //   getUnreadMessageCount,
// //   getOnlineUsers,
// //   markMessageAsRead,
// //   ChatMessageRequest,
// //   ChatMessageType,
// //   ChatRoomType,
// //   subscribeToTopic as subscribeToTopicApi,
// // } from "../api/chatApi";
// // import chatServiceNew from "../services/ChatServiceNew";
// // import { useAuth } from "./AuthContext";

// // export interface ChatContextType {
// //   messages: ChatMessageResponse[];
// //   chatRooms: ChatRoomResponse[];
// //   activeChatRoom: ChatRoomResponse | null;
// //   unreadCount: UnreadMessageCountResponse | null;
// //   onlineUsers: OnlineUsersResponse | null;
// //   isConnected: boolean;
// //   loading: boolean;
// //   typingUsers: Array<{
// //     userId: number;
// //     senderName: string;
// //     userAvatar?: string;
// //   }>;

// //   sendChatMessage: (
// //     message: ChatMessageRequest
// //   ) => Promise<ChatMessageResponse>;
// //   selectChatRoom: (roomId: string, page: number, size: number) => void;
// //   markMessageRead: (messageId: string) => Promise<void>;
// //   loadChatHistory: (roomId: string, page?: number) => Promise<void>;
// //   refreshChatRooms: () => Promise<void>;
// //   refreshUnreadCount: () => Promise<void>;
// //   refreshOnlineUsers: () => Promise<void>;
// //   connectWebSocket: () => void;
// //   disconnectWebSocket: () => void;
// //   subscribeToTopic: (topic: string, projectId?: number) => Promise<void>;
// //   sendTypingActivity: () => void;
// // }

// // const ChatContext = createContext<ChatContextType | undefined>(undefined);

// // export const useChat = (): ChatContextType => {
// //   const context = useContext(ChatContext);
// //   if (!context) {
// //     throw new Error("useChat must be used within a ChatProvider");
// //   }
// //   return context;
// // };

// // interface ChatProviderProps {
// //   children: ReactNode;
// // }

// // export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
// //   const { isAuthenticated, userDetails } = useAuth();
// //   const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
// //   const [chatRooms, setChatRooms] = useState<ChatRoomResponse[]>([]);
// //   const [activeChatRoom, setActiveChatRoom] = useState<ChatRoomResponse | null>(
// //     null
// //   );
// //   const [unreadCount, setUnreadCount] =
// //     useState<UnreadMessageCountResponse | null>(null);
// //   const [onlineUsers, setOnlineUsers] = useState<OnlineUsersResponse | null>(
// //     null
// //   );
// //   const [isConnected, setIsConnected] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [typingUsers, setTypingUsers] = useState<
// //     Array<{ userId: number; senderName: string; userAvatar?: string }>
// //   >([]);
// //   const typingTimers = useRef<Record<string, NodeJS.Timeout>>({});

// //   const refreshChatRooms = useCallback(async () => {
// //     try {
// //       const rooms = await getUserChatRooms();
// //       setChatRooms(rooms);
// //     } catch (err) {
// //       console.error("Refresh rooms error:", err);
// //     }
// //   }, []);

// //   const refreshUnreadCount = useCallback(async () => {
// //     try {
// //       const count = await getUnreadMessageCount();
// //       setUnreadCount(count);
// //     } catch (err) {
// //       console.error("Refresh unread error:", err);
// //     }
// //   }, []);

// //   const refreshOnlineUsers = useCallback(async () => {
// //     try {
// //       const users = await getOnlineUsers();
// //       setOnlineUsers(users);
// //     } catch (err) {
// //       console.error("Refresh online error:", err);
// //     }
// //   }, []);
// //   const sendTypingActivity = useCallback(() => {
// //     if (
// //       !activeChatRoom ||
// //       !userDetails ||
// //       !chatServiceNew.isSocketConnected()
// //     ) {
// //       return;
// //     }
// //     chatServiceNew.sendGenericTypingEvent(
// //       activeChatRoom.id,
// //       activeChatRoom.roomType
// //     );
// //   }, [activeChatRoom, userDetails]);
// //   const handleUserTypingEvent = useCallback(
// //     (data: any) => {
// //       if (
// //         data.roomId !== activeChatRoom?.id ||
// //         data.userId === userDetails?.id
// //       ) {
// //         return;
// //       }
// //       setTypingUsers((prev) => {
// //         const existingUser = prev.find(
// //           (u) => u.userId === (data.userId ?? data.senderId)
// //         );
// //         if (existingUser) return prev;
// //         let senderName = data.senderName;
// //         if (!senderName && activeChatRoom) {
// //           const participant = activeChatRoom.participants.find(
// //             (p) => p.userId === (data.userId ?? data.senderId)
// //           );
// //           senderName =
// //             participant?.fullName || `User ${data.userId ?? data.senderId}`;
// //         }
// //         return [
// //           ...prev,
// //           {
// //             userId: data.userId ?? data.senderId,
// //             senderName: senderName,
// //             userAvatar: data.userAvatar,
// //           },
// //         ];
// //       });

// //       if (typingTimers.current[data.userId]) {
// //         clearTimeout(typingTimers.current[data.userId]);
// //       }

// //       typingTimers.current[data.userId] = setTimeout(() => {
// //         setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
// //         delete typingTimers.current[data.userId];
// //       }, 3000);
// //     },
// //     [activeChatRoom?.id, userDetails?.id]
// //   );

// //   const handleWebSocketMessage = useCallback(
// //     (receivedData: any) => {
// //       if (
// //         ["private_message", "group_message", "project_message"].includes(
// //           receivedData.type
// //         )
// //       ) {
// //         let senderName = receivedData.senderName;
// //         if (!senderName) {
// //           if (receivedData.senderId === userDetails?.id && userDetails) {
// //             senderName = userDetails.fullName || "You";
// //           } else {
// //             const participant = activeChatRoom?.participants.find(
// //               (p) => p.userId === receivedData.senderId
// //             );
// //             senderName =
// //               participant?.fullName || `User ${receivedData.senderId}`;
// //           }
// //         }

// //         const newMessage: ChatMessageResponse = {
// //           id: receivedData.messageId || receivedData.id,
// //           senderId: receivedData.senderId,
// //           senderName: senderName,
// //           senderImageProfile: receivedData.senderImageProfile,
// //           receiverId: receivedData.receiverId,
// //           topic: receivedData.topic,
// //           projectId: receivedData.projectId,
// //           projectName: receivedData.projectName,
// //           content: receivedData.content,
// //           timestamp: receivedData.timestamp,
// //           isRead:
// //             receivedData.isRead || receivedData.senderId === userDetails?.id,
// //           isDelivered: true,
// //           messageType: receivedData.chatMessageType as ChatMessageType,
// //           fileUrl: receivedData.fileUrl,
// //           fileName: receivedData.fileName,
// //           createdAt: receivedData.timestamp || receivedData.createdAt,
// //         };

// //         if (
// //           activeChatRoom &&
// //           ((activeChatRoom.roomType === ChatRoomType.PRIVATE &&
// //             ((newMessage.senderId === userDetails?.id &&
// //               newMessage.receiverId ===
// //                 activeChatRoom.participants.find(
// //                   (p) => p.userId !== userDetails?.id
// //                 )?.userId) ||
// //               (newMessage.receiverId === userDetails?.id &&
// //                 newMessage.senderId ===
// //                   activeChatRoom.participants.find(
// //                     (p) => p.userId !== userDetails?.id
// //                   )?.userId))) ||
// //             (activeChatRoom.roomType === ChatRoomType.PROJECT_CHAT &&
// //               newMessage.projectId === activeChatRoom.projectId) ||
// //             (activeChatRoom.roomType === ChatRoomType.GROUP &&
// //               newMessage.topic === activeChatRoom.roomName))
// //         ) {
// //           if (typingTimers.current[newMessage.senderId]) {
// //             clearTimeout(typingTimers.current[newMessage.senderId]);
// //             delete typingTimers.current[newMessage.senderId];
// //           }
// //           setTypingUsers((prev) =>
// //             prev.filter((u) => u.userId !== newMessage.senderId)
// //           );
// //         }

// //         setMessages((prev) => {
// //           if (prev.some((m) => m.id === newMessage.id)) return prev;

// //           if (activeChatRoom) {
// //             if (activeChatRoom.roomType === "PRIVATE") {
// //               const otherUserId = activeChatRoom.participants.find(
// //                 (p) => p.userId !== userDetails?.id
// //               )?.userId;
// //               if (
// //                 !(
// //                   (newMessage.senderId === userDetails?.id &&
// //                     newMessage.receiverId === otherUserId) ||
// //                   (newMessage.receiverId === userDetails?.id &&
// //                     newMessage.senderId === otherUserId)
// //                 )
// //               ) {
// //                 return prev;
// //               }
// //             } else if (activeChatRoom.roomType === "PROJECT_CHAT") {
// //               if (newMessage.projectId !== activeChatRoom.projectId) {
// //                 return prev;
// //               }
// //             } else if (activeChatRoom.roomType === "GROUP") {
// //               if (newMessage.topic !== activeChatRoom.roomName) {
// //                 return prev;
// //               }
// //             }
// //           }

// //           return [...prev, newMessage].sort(
// //             (a, b) =>
// //               new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
// //           );
// //         });

// //         if (newMessage.senderId !== userDetails?.id) {
// //           antdMessage.success(`New message from ${newMessage.senderName}`);
// //         }

// //         refreshUnreadCount();
// //         refreshChatRooms();
// //       }
// //     },
// //     [
// //       userDetails,
// //       activeChatRoom,
// //       refreshUnreadCount,
// //       refreshChatRooms,
// //       typingTimers,
// //     ]
// //   );
// //   const handleMessageSentConfirmation = useCallback(
// //     (confirmationData: any) => {
// //       setMessages((prevMessages) =>
// //         prevMessages
// //           .map((msg) => {
// //             if (confirmationData.tempId && msg.id === confirmationData.tempId) {
// //               return {
// //                 ...msg,
// //                 id: confirmationData.messageId,
// //                 isDelivered: confirmationData.delivered || true,
// //                 timestamp: confirmationData.timestamp || msg.timestamp,
// //               };
// //             }
// //             if (
// //               msg.senderId === userDetails?.id &&
// //               msg.id === confirmationData.messageId
// //             ) {
// //               return {
// //                 ...msg,
// //                 isDelivered: confirmationData.delivered || true,
// //                 timestamp: confirmationData.timestamp || msg.timestamp,
// //               };
// //             }
// //             return msg;
// //           })
// //           .sort(
// //             (a, b) =>
// //               new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
// //           )
// //       );
// //     },
// //     [userDetails]
// //   );
// //   const connectWebSocket = useCallback(() => {
// //     const token = localStorage.getItem("token");
// //     if (!token) return;

// //     chatServiceNew.disconnect();

// //     chatServiceNew.setConnectionStatusCallback(setIsConnected);

// //     chatServiceNew.connect(token);

// //     chatServiceNew.removeAllListeners();

// //     chatServiceNew.addListener(ChatMessageType.TEXT, handleWebSocketMessage);
// //     chatServiceNew.addListener(ChatMessageType.FILE, handleWebSocketMessage);
// //     chatServiceNew.addListener(ChatMessageType.IMAGE, handleWebSocketMessage);
// //     chatServiceNew.addListener(ChatMessageType.VIDEO, handleWebSocketMessage);
// //     chatServiceNew.addListener(ChatMessageType.AUDIO, handleWebSocketMessage);
// //     chatServiceNew.addListener(
// //       ChatMessageType.SYSTEM_NOTIFICATION,
// //       handleWebSocketMessage
// //     );
// //     chatServiceNew.addListener(
// //       "message_sent_confirmation",
// //       handleMessageSentConfirmation
// //     );
// //     chatServiceNew.addListener("user_typing", handleUserTypingEvent);
// //   }, [
// //     handleWebSocketMessage,
// //     handleMessageSentConfirmation,
// //     handleUserTypingEvent,
// //   ]);

// //   const disconnectWebSocket = useCallback(() => {
// //     chatServiceNew.disconnect();
// //     setIsConnected(false);
// //   }, []);

// //   useEffect(() => {
// //     if (isAuthenticated) {
// //       connectWebSocket();
// //       chatServiceNew.removeAllListeners();

// //       chatServiceNew.addListener(ChatMessageType.TEXT, handleWebSocketMessage);
// //       chatServiceNew.addListener(ChatMessageType.FILE, handleWebSocketMessage);
// //       chatServiceNew.addListener(ChatMessageType.IMAGE, handleWebSocketMessage);
// //       chatServiceNew.addListener(ChatMessageType.VIDEO, handleWebSocketMessage);
// //       chatServiceNew.addListener(ChatMessageType.AUDIO, handleWebSocketMessage);
// //       chatServiceNew.addListener(
// //         ChatMessageType.SYSTEM_NOTIFICATION,
// //         handleWebSocketMessage
// //       );
// //       chatServiceNew.addListener(
// //         "message_sent_confirmation",
// //         handleMessageSentConfirmation
// //       );
// //       chatServiceNew.addListener("user_typing", handleUserTypingEvent);
// //     } else {
// //       disconnectWebSocket();
// //     }
// //     return () => {
// //       chatServiceNew.removeListener(
// //         ChatMessageType.TEXT,
// //         handleWebSocketMessage
// //       );
// //       chatServiceNew.removeListener(
// //         ChatMessageType.FILE,
// //         handleWebSocketMessage
// //       );
// //       chatServiceNew.removeListener(
// //         ChatMessageType.IMAGE,
// //         handleWebSocketMessage
// //       );
// //       chatServiceNew.removeListener(
// //         ChatMessageType.VIDEO,
// //         handleWebSocketMessage
// //       );
// //       chatServiceNew.removeListener(
// //         ChatMessageType.AUDIO,
// //         handleWebSocketMessage
// //       );
// //       chatServiceNew.removeListener(
// //         ChatMessageType.SYSTEM_NOTIFICATION,
// //         handleWebSocketMessage
// //       );
// //       chatServiceNew.removeListener(
// //         "message_sent_confirmation",
// //         handleMessageSentConfirmation
// //       );
// //       chatServiceNew.removeListener("user_typing", handleUserTypingEvent);
// //     };
// //   }, [
// //     isAuthenticated,
// //     connectWebSocket,
// //     disconnectWebSocket,
// //     handleWebSocketMessage,
// //     handleMessageSentConfirmation,
// //     handleUserTypingEvent,
// //   ]);

// //   useEffect(() => {
// //     return () => {
// //       Object.values(typingTimers.current).forEach(clearTimeout);
// //       typingTimers.current = {};
// //     };
// //   }, []);

// //   return (
// //     <ChatContext.Provider
// //       value={{
// //         messages,
// //         chatRooms,
// //         activeChatRoom,
// //         unreadCount,
// //         onlineUsers,
// //         isConnected,
// //         loading,
// //         typingUsers,
// //         sendChatMessage,
// //         selectChatRoom,
// //         markMessageRead,
// //         loadChatHistory,
// //         refreshChatRooms,
// //         refreshUnreadCount,
// //         refreshOnlineUsers,
// //         connectWebSocket,
// //         disconnectWebSocket,
// //         subscribeToTopic,
// //         sendTypingActivity,
// //       }}
// //     >
