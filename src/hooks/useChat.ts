// import { useState, useEffect, useCallback } from "react";
// import { message as antdMessage } from "antd";
// import {
//   ChatMessageResponse,
//   getPrivateChatHistory,
//   getProjectChatHistory,
//   getGroupChatHistory,
// } from "../api/chatApi";

// export const useChatHistory = (roomId: string | null, roomType: string) => {
//   const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [page, setPage] = useState(0);

//   const loadMessages = useCallback(
//     async (pageNum: number = 0, reset: boolean = false) => {
//       if (!roomId || loading) return;

//       try {
//         setLoading(true);
//         let response;

//         // Load messages based on room type
//         switch (roomType) {
//           case "PRIVATE":
//             // Extract user ID from room (you might need to adjust this logic)
//             const userId = parseInt(roomId); // Adjust as needed
//             response = await getPrivateChatHistory(userId, pageNum);
//             break;
//           case "PROJECT_CHAT":
//             const projectId = parseInt(roomId); // Adjust as needed
//             response = await getProjectChatHistory(projectId, pageNum);
//             break;
//           case "GROUP":
//             response = await getGroupChatHistory(roomId, pageNum);
//             break;
//           default:
//             return;
//         }

//         if (response) {
//           if (reset || pageNum === 0) {
//             setMessages(response.messages);
//           } else {
//             setMessages((prev) => [...prev, ...response.messages]);
//           }
//           setHasMore(response.hasNext);
//         }
//       } catch (error) {
//         console.error("Failed to load messages:", error);
//         antdMessage.error("Failed to load messages");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [roomId, roomType, loading]
//   );

//   const loadMore = useCallback(() => {
//     if (hasMore && !loading) {
//       const nextPage = page + 1;
//       setPage(nextPage);
//       loadMessages(nextPage);
//     }
//   }, [hasMore, loading, page, loadMessages]);

//   const refresh = useCallback(() => {
//     setPage(0);
//     loadMessages(0, true);
//   }, [loadMessages]);

//   useEffect(() => {
//     if (roomId) {
//       setPage(0);
//       loadMessages(0, true);
//     } else {
//       setMessages([]);
//     }
//   }, [roomId, loadMessages]);

//   return {
//     messages,
//     loading,
//     hasMore,
//     loadMore,
//     refresh,
//     addMessage: (message: ChatMessageResponse) => {
//       setMessages((prev) => [...prev, message]);
//     },
//   };
// };
