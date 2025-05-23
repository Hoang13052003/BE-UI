// src/services/NotificationService.ts
import { message } from "antd";
import { MessageType } from "../types/Notification";

class NotificationService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 3000;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private token: string | null = null;

  /**
   * Connect to the WebSocket notification server
   * @param token JWT token for authentication
   */
  connect(token: string): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket is already connected");
      return;
    }

    this.token = token;

    try {
      // Replace with your backend WebSocket URL
      const wsUrl = `http://localhost:8080/ws/notifications`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("WebSocket connection established");
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Subscribe the user after connecting
        this.subscribeUser(token);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received notification:", data);

          // Check if there's a MESSAGE_TYPE field
          const messageType = data.MESSAGE_TYPE;
          if (messageType && this.listeners.has(messageType)) {
            this.listeners
              .get(messageType)
              ?.forEach((callback) => callback(data));
          }

          // Also notify 'all' listeners for any message
          if (this.listeners.has("all")) {
            this.listeners.get("all")?.forEach((callback) => callback(data));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        console.log("WebSocket connection closed", event);

        // Attempt to reconnect if not closed intentionally
        if (!event.wasClean && this.token) {
          this.attemptReconnect(this.token);
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        message.error("Connection error. Trying to reconnect...", 3);
      };
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
      message.error("Failed to connect to notification service");
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      if (this.reconnectTimeoutId) {
        clearTimeout(this.reconnectTimeoutId);
      }

      this.reconnectTimeoutId = setTimeout(() => {
        this.connect(token);
      }, this.reconnectInterval);
    } else {
      console.log("Max reconnection attempts reached");
      message.error(
        "Could not connect to notification service. Please refresh the page."
      );
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.socket) {
      if (this.socket.readyState === WebSocket.CONNECTING) {
        console.warn("Cannot disconnect: WebSocket is still connecting.");
        return;
      }

      if (this.socket.readyState === WebSocket.OPEN) {
        this.unsubscribeUser();
      }

      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      this.token = null;
      console.log("WebSocket disconnected");
    }
  }

  /**
   * Subscribe to user notifications
   */
  subscribeUser(token: string): void {
    if (!this.isConnected || !this.socket) {
      console.error("Cannot subscribe: WebSocket is not connected");
      return;
    }

    const subscribeMessage = {
      messageType: MessageType.SUBSCRIBE_USER,
      params: {
        sessionId: token,
      },
    };

    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(subscribeMessage));
      console.log("User subscription request sent");
    } else if (this.socket.readyState === WebSocket.CONNECTING) {
      console.warn("Socket not open. Waiting for connection...");
      this.socket.addEventListener(
        "open",
        () => {
          this.socket?.send(JSON.stringify(subscribeMessage));
          console.log("User subscription request sent (delayed)");
        },
        { once: true }
      );
    } else {
      console.error("Cannot subscribe: WebSocket is not in a valid state");
    }
  }

  /**
   * Unsubscribe from user notifications
   */
  unsubscribeUser(): void {
    if (
      !this.socket ||
      !this.token ||
      this.socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const unsubscribeMessage = {
      messageType: MessageType.UNSUBSCRIBE_USER,
      params: {
        sessionId: this.token,
      },
    };

    this.socket.send(JSON.stringify(unsubscribeMessage));
    console.log("User unsubscription request sent");
  }

  /**
   * Add a listener for a specific message type
   */
  addListener(messageType: string, callback: (data: any) => void): void {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType)?.push(callback);
  }

  /**
   * Remove a listener
   */
  removeListener(messageType: string, callback: (data: any) => void): void {
    if (this.listeners.has(messageType)) {
      const callbacks = this.listeners.get(messageType) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Send a test notification (for development/testing)
   */
  sendTestMessage(messageType: MessageType, payload: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("Cannot send test message: WebSocket is not connected");
      return;
    }

    const message = {
      messageType,
      ...payload,
    };

    this.socket.send(JSON.stringify(message));
    console.log("Test message sent:", message);
  }
}

// Create a singleton instance
const notificationService = new NotificationService();
export default notificationService;
