// ChatWebSocket.ts
// Service for managing WebSocket chat connection with JWT authentication
// Focus on security, reconnection, and message handling

export type ChatMessageType = 'private_message' | 'group_message' | 'project_message' | 'subscribe' | 'typing' | 'mark_read';

export interface ChatMessage {
  type: ChatMessageType | string;
  [key: string]: any;
}

export type OnMessageCallback = (message: ChatMessage) => void;
export type OnErrorCallback = (error: Event | Error) => void;

export class ChatWebSocket {
  private socket: WebSocket | null = null;
  private token: string;
  private url: string;
  private reconnectInterval: number = 3000; // ms
  private reconnectTimeout: any = null;
  private onMessage: OnMessageCallback;
  private onError: OnErrorCallback;
  private isManuallyClosed: boolean = false;

  constructor(token: string, onMessage: OnMessageCallback, onError: OnErrorCallback, url: string = 'ws://localhost:8080/ws/chat') {
    this.token = token;
    this.url = url;
    this.onMessage = onMessage;
    this.onError = onError;
    this.connect();
  }

  // Establish WebSocket connection with JWT token
  connect() {
    if (!this.token) {
      throw new Error('JWT token is required for WebSocket connection');
    }
    this.isManuallyClosed = false;
    this.socket = new WebSocket(`${this.url}?token=${this.token}`);

    this.socket.onopen = () => {
      // Connection established
      // You can subscribe to topics here if needed
      // console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data);
        this.onMessage(message);
      } catch (e) {
        // Handle invalid JSON
        this.onError(new Error('Invalid message format'));
      }
    };

    this.socket.onerror = (error) => {
      this.onError(error);
      this.scheduleReconnect();
    };

    this.socket.onclose = (event) => {
      if (!this.isManuallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  // Send a message through WebSocket
  send(message: ChatMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.onError(new Error('WebSocket is not connected'));
    }
  }

  // Close the WebSocket connection manually
  close() {
    this.isManuallyClosed = true;
    if (this.socket) {
      this.socket.close();
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }

  // Reconnect logic with exponential backoff (basic)
  private scheduleReconnect() {
    if (this.isManuallyClosed) return;
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
      this.reconnectTimeout = null;
    }, this.reconnectInterval);
  }
} 