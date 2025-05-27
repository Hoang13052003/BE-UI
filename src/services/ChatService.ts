// src/services/ChatService.ts
import { ChatMessageType } from "../api/chatApi";
import { message } from "antd";

class ChatService {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

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
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("Chat WebSocket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.dispatchMessage(data);
      } catch (err) {
        console.error("Failed to parse chat message:", err);
        message.error("Lỗi phân tích dữ liệu chat");
      }
    };

    this.socket.onclose = (event) => {
      this.isConnected = false;
      console.log("Chat WebSocket closed", event);
      if (!event.wasClean && this.token) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (err) => {
      console.error("Chat WebSocket error:", err);
      message.error("Mất kết nối chat. Đang thử kết nối lại...");
      if (!this.isConnected && this.token) {
        this.attemptReconnect();
      }
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      message.error("Không thể kết nối lại chat. Vui lòng thử lại sau.");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Reconnecting chat (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);

    this.reconnectTimeoutId = setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, this.reconnectInterval);
  }

  disconnect(): void {
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.token = null;
  }

  sendMessage(msg: {
    receiverId?: number;
    topic?: string;
    projectId?: number;
    content: string;
    messageType?: ChatMessageType;
    fileUrl?: string;
    fileName?: string;
  }): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("Chat socket not connected");
      return;
    }

    const payload = {
      ...msg,
      timestamp: new Date().toISOString(),
    };
    this.socket.send(JSON.stringify(payload));
  }

  private dispatchMessage(data: any): void {
    if (data.messageType && this.listeners.has(data.messageType)) {
      this.listeners.get(data.messageType)?.forEach((cb) => cb(data));
    }

    if (this.listeners.has("all")) {
      this.listeners.get("all")?.forEach((cb) => cb(data));
    }
  }

  addListener(messageType: string, callback: (data: any) => void): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)?.push(callback);
  }

  removeListener(messageType: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(messageType);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

const chatService = new ChatService();
export default chatService;
