// import { ChatMessageType } from "../api/chatApi";
// import { message as antdMessage } from "antd";
// import { normalizeBaseUrl } from "../utils/urlUtils";

// class ChatServiceNew {
//   private socket: WebSocket | null = null;
//   private token: string | null = null;
//   private isConnected = false;
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;
//   private reconnectInterval = 3000;
//   private reconnectTimeoutId: NodeJS.Timeout | null = null;
//   private listeners: Map<string, Array<(data: any) => void>> = new Map();
//   private connectionStatusCallback: ((isConnected: boolean) => void) | null =
//     null;

//   setConnectionStatusCallback(callback: (isConnected: boolean) => void): void {
//     this.connectionStatusCallback = callback;
//   }

//   connect(token: string): void {
//     if (
//       this.socket &&
//       (this.socket.readyState === WebSocket.OPEN ||
//         this.socket.readyState === WebSocket.CONNECTING)
//     ) {
//       return;
//     }
//     this.token = token;
//     const baseUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
//     const cleanBaseUrl = normalizeBaseUrl(baseUrl);
//     const wsUrl = `${cleanBaseUrl}/ws/chat?token=${token}`;

//     this.socket = new WebSocket(wsUrl);
//     this.socket.onopen = () => {
//       this.isConnected = true;
//       this.reconnectAttempts = 0;
//       this.connectionStatusCallback?.(true);
//       antdMessage.success("Chat connected successfully!");
//     };

//     this.socket.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data as string);
//         this.dispatchMessage(data);
//       } catch (err) {
//         if (typeof event.data === "string") {
//           if (
//             event.data.includes("connected") ||
//             event.data.includes("subscribed") ||
//             event.data.includes("joined") ||
//             event.data.includes("kicked")
//           ) {
//             antdMessage.info(event.data);
//           }
//         }
//       }
//     };

//     this.socket.onclose = (event) => {
//       this.isConnected = false;
//       this.connectionStatusCallback?.(false);

//       if (!event.wasClean && this.token) {
//         antdMessage.warning("Chat disconnected. Attempting to reconnect...");
//         this.attemptReconnect();
//       }
//     };

//     this.socket.onerror = () => {
//       this.connectionStatusCallback?.(false);
//     };
//   }

//   private attemptReconnect(): void {
//     if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//       antdMessage.error("Unable to reconnect to chat. Please try again later.");
//       this.reconnectAttempts = 0;
//       return;
//     }

//     this.reconnectAttempts++;

//     if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);

//     this.reconnectTimeoutId = setTimeout(() => {
//       if (this.token && !this.isConnected) {
//         this.connect(this.token);
//       }
//     }, this.reconnectInterval * this.reconnectAttempts);
//   }

//   disconnect(): void {
//     if (this.reconnectTimeoutId) {
//       clearTimeout(this.reconnectTimeoutId);
//       this.reconnectTimeoutId = null;
//     }
//     if (this.socket) {
//       this.socket.onclose = null;
//       this.socket.close();
//       this.socket = null;
//     }
//     this.isConnected = false;
//     this.token = null;
//     this.connectionStatusCallback?.(false);
//   }

//   sendMessage(msg: {
//     receiverId?: number;
//     topic?: string;
//     projectId?: number;
//     content: string;
//     chatMessageType?: ChatMessageType;
//     fileUrl?: string;
//     fileName?: string;
//   }): void {
//     if (!this.isSocketConnected()) {
//       antdMessage.error("Chat not connected. Message not sent.");
//       return;
//     }

//     let type: string;
//     const messageData: any = {
//       content: msg.content,
//       chatMessageType: msg.chatMessageType || ChatMessageType.TEXT,
//       fileUrl: msg.fileUrl,
//       fileName: msg.fileName,
//     };

//     if (msg.receiverId) {
//       type = "private_message";
//       messageData.receiverId = msg.receiverId;
//     } else if (msg.topic) {
//       type = "group_message";
//       messageData.topic = msg.topic;
//     } else if (msg.projectId) {
//       type = "project_message";
//       messageData.projectId = msg.projectId;
//     } else {
//       antdMessage.error(
//         "Unable to send message: Missing recipient/group/project information."
//       );
//       return;
//     }

//     const payload = {
//       type: type,
//       ...messageData,
//     };

//     this.socket!.send(JSON.stringify(payload));
//   }

//   sendGenericTypingEvent(roomId: string, roomType: string): void {
//     if (!this.isSocketConnected()) {
//       return;
//     }
//     const payload = {
//       type: "user_typing_start",
//       roomId: roomId,
//       roomType: roomType,
//     };
//     this.socket!.send(JSON.stringify(payload));
//   }

//   subscribeToTopic(topic: string): void {
//     if (!this.isSocketConnected()) {
//       return;
//     }
//     const payload = {
//       type: "subscribe",
//       topic: topic,
//     };
//     this.socket!.send(JSON.stringify(payload));
//   }

//   unsubscribeFromTopic(topic: string): void {
//     if (!this.isSocketConnected()) {
//       return;
//     }
//     const payload = {
//       type: "unsubscribe",
//       topic: topic,
//     };
//     this.socket!.send(JSON.stringify(payload));
//   }

//   markMessageAsRead(messageId: string): void {
//     if (!this.isSocketConnected()) {
//       return;
//     }
//     const payload = {
//       type: "mark_read",
//       messageId: messageId,
//     };
//     this.socket!.send(JSON.stringify(payload));
//   }

//   private dispatchMessage(data: any): void {
//     if (data.error) {
//       antdMessage.error(`Chat server error: ${data.error}`);
//       return;
//     }

//     if (data.status) {
//       if (this.listeners.has("server_status")) {
//         this.listeners.get("server_status")?.forEach((cb) => cb(data));
//       }
//       return;
//     }

//     const webSocketPacketType = data.type;

//     const chatContentMessageType = data.chatMessageType;

//     if (
//       ["private_message", "group_message", "project_message"].includes(
//         webSocketPacketType
//       )
//     ) {
//       if (
//         chatContentMessageType &&
//         this.listeners.has(chatContentMessageType)
//       ) {
//         this.listeners.get(chatContentMessageType)?.forEach((cb) => cb(data));
//       } else if (this.listeners.has("all_chat_messages")) {
//         this.listeners.get("all_chat_messages")?.forEach((cb) => cb(data));
//       }
//     } else if (webSocketPacketType === "message_sent") {
//       if (this.listeners.has("message_sent_confirmation")) {
//         this.listeners
//           .get("message_sent_confirmation")
//           ?.forEach((cb) => cb(data));
//       }
//     } else if (webSocketPacketType === "user_typing_event") {
//       const typingData = {
//         type: "user_typing",
//         userId: data.senderId,
//         userName: "",
//         userAvatar: "",
//         roomId: data.roomId,
//         roomType: data.roomType,
//         isTyping: data.isTyping,
//       };
//       if (this.listeners.has("user_typing")) {
//         this.listeners.get("user_typing")?.forEach((cb) => cb(typingData));
//       }
//     } else if (
//       webSocketPacketType === "topic_subscribed" ||
//       webSocketPacketType === "topic_unsubscribed"
//     ) {
//       antdMessage.info(`Server: ${data.topic} - ${webSocketPacketType}`);
//       if (this.listeners.has(webSocketPacketType)) {
//         this.listeners.get(webSocketPacketType)?.forEach((cb) => cb(data));
//       }
//     } else {
//       if (this.listeners.has("all")) {
//         this.listeners.get("all")?.forEach((cb) => cb(data));
//       }
//     }
//   }

//   addListener(messageType: string, callback: (data: any) => void): void {
//     if (!this.listeners.has(messageType)) {
//       this.listeners.set(messageType, []);
//     }
//     this.listeners.get(messageType)?.push(callback);
//   }

//   removeListener(messageType: string, callback: (data: any) => void): void {
//     const callbacks = this.listeners.get(messageType);
//     if (!callbacks) return;

//     const index = callbacks.indexOf(callback);
//     if (index !== -1) {
//       callbacks.splice(index, 1);
//     }
//   }

//   removeAllListeners(): void {
//     this.listeners.clear();
//   }

//   isSocketConnected(): boolean {
//     return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
//   }
// }

// const chatServiceNew = new ChatServiceNew();
// export default chatServiceNew;
