// src/services/ChatServiceNew.ts
import { ChatMessageType } from "../api/chatApi";
import { message as antdMessage } from "antd"; // antdMessage để tránh trùng tên

class ChatServiceNew {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private connectionStatusCallback: ((isConnected: boolean) => void) | null =
    null;

  setConnectionStatusCallback(callback: (isConnected: boolean) => void): void {
    this.connectionStatusCallback = callback;
  }

  connect(token: string): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      console.log("Chat WebSocket already connected or connecting");
      return;
    }

    this.token = token;
    const wsUrl = `${
      import.meta.env.VITE_WS_URL || "ws://localhost:8080"
    }/ws/chat?token=${token}`;

    console.log("Connecting to WebSocket:", wsUrl);
    this.socket = new WebSocket(wsUrl);
    this.socket.onopen = () => {
      console.log("Chat WebSocket connected successfully");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionStatusCallback?.(true);
      antdMessage.success("Đã kết nối chat");
    };
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string); // Đảm bảo event.data là string
        console.log("Received WebSocket message:", data);
        this.dispatchMessage(data);
      } catch (err) {
        console.error(
          "Error parsing WebSocket message or non-JSON message:",
          event.data,
          err
        );
        // Xử lý các thông báo dạng chuỗi đơn giản từ server nếu cần
        if (typeof event.data === "string") {
          if (
            event.data.includes("connected") ||
            event.data.includes("subscribed") ||
            event.data.includes("joined") ||
            event.data.includes("kicked")
          ) {
            // Thêm các case khác nếu có
            antdMessage.info(event.data);
          }
        }
      }
    };
    this.socket.onclose = (event) => {
      this.isConnected = false;
      console.log("Chat WebSocket closed", event);
      this.connectionStatusCallback?.(false);

      if (!event.wasClean && this.token) {
        antdMessage.warning("Mất kết nối chat. Đang thử kết nối lại...");
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (err) => {
      console.error("Chat WebSocket error:", err);
      this.connectionStatusCallback?.(false);
      // Không cần gọi attemptReconnect ở đây nữa vì onclose sẽ xử lý nếu kết nối không thành công
    };
  }
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      antdMessage.error("Không thể kết nối lại chat. Vui lòng thử lại sau.");
      this.reconnectAttempts = 0; // Reset để có thể thử lại thủ công nếu muốn
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Reconnecting chat (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);

    this.reconnectTimeoutId = setTimeout(() => {
      if (this.token && !this.isConnected) {
        // Chỉ kết nối lại nếu có token và chưa kết nối
        this.connect(this.token);
      }
    }, this.reconnectInterval * this.reconnectAttempts); // Tăng thời gian chờ sau mỗi lần thử
  }
  disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.socket) {
      this.socket.onclose = null; // Ngăn chặn reconnect khi tự disconnect
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.token = null; // Nên xóa token khi disconnect
    this.connectionStatusCallback?.(false);
    console.log("Chat WebSocket disconnected by client.");
  }
  // SỬA LẠI sendMessage
  sendMessage(msg: {
    receiverId?: number;
    topic?: string;
    projectId?: number;
    content: string;
    chatMessageType?: ChatMessageType; // Đổi tên từ messageType để rõ nghĩa hơn
    fileUrl?: string;
    fileName?: string;
  }): void {
    if (!this.isSocketConnected()) {
      console.error("Chat socket not connected, cannot send message.");
      antdMessage.error("Chưa kết nối chat. Tin nhắn chưa được gửi.");
      // Cân nhắc việc lưu tin nhắn vào queue và gửi lại khi kết nối hoặc thông báo lỗi rõ ràng hơn
      return;
    }

    let type: string;
    const messageData: any = {
      // Dữ liệu cụ thể của tin nhắn
      content: msg.content,
      chatMessageType: msg.chatMessageType || ChatMessageType.TEXT, // Sử dụng tên mới và default
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      // BE sẽ tự lấy senderId từ session WebSocket
    };

    if (msg.receiverId) {
      type = "private_message";
      messageData.receiverId = msg.receiverId;
    } else if (msg.topic) {
      type = "group_message";
      messageData.topic = msg.topic;
    } else if (msg.projectId) {
      type = "project_message";
      messageData.projectId = msg.projectId;
    } else {
      console.error(
        "Invalid message target: Missing receiverId, topic, or projectId."
      );
      antdMessage.error(
        "Không thể gửi tin nhắn: Thiếu thông tin người nhận/nhóm/dự án."
      );
      return;
    }

    const payload = {
      type: type, // Trường type chính cho BE routing
      ...messageData, // Các trường dữ liệu của tin nhắn
    };

    console.log("FE Sending WebSocket message:", payload);
    this.socket!.send(JSON.stringify(payload));
  }

  sendGenericTypingEvent(roomId: string, roomType: string): void {
    if (!this.isSocketConnected()) {
      console.error(
        "[ChatServiceNew.ts] Chat socket not connected, cannot send typing event."
      );
      return;
    }
    const payload = {
      type: "user_typing_start", // Client gửi sự kiện này khi bắt đầu gõ
      roomId: roomId,
      roomType: roomType,
      // Server sẽ tự thêm thông tin người gửi (senderId, senderName, senderAvatar)
      // và phát đi sự kiện "user_typing" cho các client khác.
    };
    console.log("[ChatServiceNew.ts] FE Sending typing start event:", payload);
    this.socket!.send(JSON.stringify(payload));
  }

  // SỬA LẠI subscribeToTopic
  subscribeToTopic(topic: string): void {
    if (!this.isSocketConnected()) {
      console.error("Chat socket not connected, cannot subscribe to topic.");
      return;
    }
    const payload = {
      type: "subscribe", // Đúng với BE mong đợi
      topic: topic,
    };
    console.log(`FE Subscribing to topic: ${topic} with payload:`, payload);
    this.socket!.send(JSON.stringify(payload));
  }

  // SỬA LẠI unsubscribeFromTopic
  unsubscribeFromTopic(topic: string): void {
    if (!this.isSocketConnected()) {
      console.error(
        "Chat socket not connected, cannot unsubscribe from topic."
      );
      return;
    }
    const payload = {
      type: "unsubscribe", // Đúng với BE mong đợi
      topic: topic,
    };
    console.log(`FE Unsubscribing from topic: ${topic} with payload:`, payload);
    this.socket!.send(JSON.stringify(payload));
  }

  // SỬA LẠI markMessageAsRead
  markMessageAsRead(messageId: string): void {
    if (!this.isSocketConnected()) {
      console.error("Chat socket not connected, cannot mark message as read.");
      return;
    }
    const payload = {
      type: "mark_read", // Đúng với BE mong đợi
      messageId: messageId,
    };
    console.log(
      `FE Marking message as read: ${messageId} with payload:`,
      payload
    );
    this.socket!.send(JSON.stringify(payload));
  } // SỬA LẠI dispatchMessage để xử lý đúng type từ BE
  private dispatchMessage(data: any): void {
    // data.type là type của gói tin WebSocket BE gửi (e.g., "private_message", "group_message", "message_sent")
    // data.chatMessageType là type của nội dung chat (e.g., "TEXT", "FILE") MÀ BE CẦN GỬI THÊM

    if (data.error) {
      // Xử lý lỗi từ BE trước
      console.error("WebSocket error from server:", data.error);
      antdMessage.error(`Lỗi từ server chat: ${data.error}`);
      return;
    }

    if (data.status) {
      // Xử lý các thông báo trạng thái từ BE (nếu có)
      console.log("WebSocket status from server:", data.status, data.value);
      // Ví dụ: có thể dispatch một event riêng cho status
      if (this.listeners.has("server_status")) {
        this.listeners.get("server_status")?.forEach((cb) => cb(data));
      }
      return;
    }

    const webSocketPacketType = data.type; // "private_message", "group_message", "message_sent" etc.

    // Các loại tin nhắn mà ChatContext đang lắng nghe (TEXT, FILE, etc.)
    // Giả định BE sẽ gửi thêm data.chatMessageType cho các tin nhắn chat
    const chatContentMessageType = data.chatMessageType;

    if (
      ["private_message", "group_message", "project_message"].includes(
        webSocketPacketType
      )
    ) {
      // Đây là tin nhắn chat thực sự
      if (
        chatContentMessageType &&
        this.listeners.has(chatContentMessageType)
      ) {
        // data ở đây là toàn bộ gói tin BE gửi, bao gồm webSocketPacketType, senderId, content, chatContentMessageType,...
        // ChatContext sẽ nhận được toàn bộ data này.
        this.listeners.get(chatContentMessageType)?.forEach((cb) => cb(data));
      } else if (this.listeners.has("all_chat_messages")) {
        // Listener chung cho mọi tin nhắn chat
        this.listeners.get("all_chat_messages")?.forEach((cb) => cb(data));
      } else {
        console.warn(
          "No specific listener for chatContentMessageType:",
          chatContentMessageType,
          "in chat packet:",
          data
        );
      }
    } else if (webSocketPacketType === "message_sent") {
      // Xử lý xác nhận tin nhắn đã gửi (nếu ChatContext cần)
      console.log("Message sent confirmation received:", data);
      if (this.listeners.has("message_sent_confirmation")) {
        this.listeners
          .get("message_sent_confirmation")
          ?.forEach((cb) => cb(data));
      }
    } else if (webSocketPacketType === "user_typing") {
      // Xử lý typing indicator từ server
      // Server sẽ gửi: { type: "user_typing", userId, userName, userAvatar, roomId, roomType }
      if (this.listeners.has("user_typing")) {
        console.log(
          "[ChatServiceNew.ts] Dispatching user_typing event to listeners:",
          data
        );
        this.listeners.get("user_typing")?.forEach((cb) => cb(data));
      }
    }
    // Thêm các case xử lý cho các `type` khác từ BE nếu cần
    // ví dụ: "topic_subscribed", "topic_unsubscribed"
    else if (
      webSocketPacketType === "topic_subscribed" ||
      webSocketPacketType === "topic_unsubscribed"
    ) {
      antdMessage.info(`Server: ${data.topic} - ${webSocketPacketType}`);
      if (this.listeners.has(webSocketPacketType)) {
        this.listeners.get(webSocketPacketType)?.forEach((cb) => cb(data));
      }
    } else {
      console.log(
        "Received unhandled WebSocket packet type from server:",
        webSocketPacketType,
        "Data:",
        data
      );
      // Có thể có một listener "generic" hoặc "unknown_type" ở đây nếu muốn
      if (this.listeners.has("all")) {
        this.listeners.get("all")?.forEach((cb) => cb(data));
      }
    }
  }
  addListener(messageType: string, callback: (data: any) => void): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)?.push(callback);
    console.log(`Listener added for type: ${messageType}`);
  }

  removeListener(messageType: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(messageType);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      console.log(`Listener removed for type: ${messageType}`);
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
    console.log("All listeners removed.");
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }
}

const chatServiceNew = new ChatServiceNew();
export default chatServiceNew;
