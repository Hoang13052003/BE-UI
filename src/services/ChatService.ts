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
  private connectionStatusCallback: ((isConnected: boolean) => void) | null = null;

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
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("Chat WebSocket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionStatusCallback?.(true);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle system responses
        if (data.status) {
          console.log(`System status: ${data.status} - ${data.value}`);
          this.dispatchMessage({ type: 'system', ...data });
          return;
        }
        
        // Handle error responses
        if (data.error) {
          console.error("WebSocket error:", data.error);
          message.error(`Chat error: ${data.error}`);
          return;
        }
        
        // Handle regular messages
        this.dispatchMessage(data);
      } catch (err) {
        console.error("Failed to parse chat message:", err);
        console.log("Raw message:", event.data);
      }
    };

    this.socket.onclose = (event) => {
      this.isConnected = false;
      console.log("Chat WebSocket closed", event);
      this.connectionStatusCallback?.(false);
      if (!event.wasClean && this.token) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (err) => {
      console.error("Chat WebSocket error:", err);
      message.error("Mất kết nối chat. Đang thử kết nối lại...");
      this.connectionStatusCallback?.(false);
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
    this.connectionStatusCallback?.(false);
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
      message.error("Chưa kết nối chat. Đang thử kết nối lại...");
      return;
    }

    const payload = {
      ...msg,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Sending message:', payload);
    this.socket.send(JSON.stringify(payload));
  }

  // Subscribe to group chat topic
  subscribeToTopic(topic: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("Chat socket not connected");
      return;
    }
    
    console.log(`Subscribing to topic: ${topic}`);
    this.socket.send(`subscribe:${topic}`);
  }

  // Unsubscribe from group chat topic
  unsubscribeFromTopic(topic: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("Chat socket not connected");
      return;
    }
    
    console.log(`Unsubscribing from topic: ${topic}`);
    this.socket.send(`unsubscribe:${topic}`);  }

  // Mark message as read
  markMessageAsRead(messageId: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("Chat socket not connected");
      return;
    }
    
    console.log(`Marking message as read: ${messageId}`);
    this.socket.send(`read:${messageId}`);
  }

  private dispatchMessage(data: any): void {
    // Dispatch to specific message type listeners
    if (data.messageType && this.listeners.has(data.messageType)) {
      this.listeners.get(data.messageType)?.forEach((cb) => cb(data));
    }

    // Dispatch to system listeners
    if (data.type === 'system' && this.listeners.has('system')) {
      this.listeners.get('system')?.forEach((cb) => cb(data));
    }

    // Dispatch to all listeners
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
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  // Get connection state
  getConnectionState(): string {
    if (!this.socket) return 'DISCONNECTED';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}

const chatService = new ChatService();
export default chatService;
