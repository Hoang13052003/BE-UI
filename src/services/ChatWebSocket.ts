import SockJS from 'sockjs-client';
import { Client, IMessage, IFrame } from '@stomp/stompjs';
import { ChatMessage, WebSocketReactionEvent, MessageReactionRequest } from '../api/chatApi';

export interface MessageStatusUpdate {
  roomId?: string;  // Đánh dấu là optional vì server có thể không gửi
  messageId: string;
  userId: number;
  status: 'SENT' | 'DELIVERED' | 'SEEN';
}

export interface TypingStatus {
  roomId: string;
  userId: number;
  typing: boolean;
  userName?: string;
}

export interface UserStatus {
  userId: number;
  online: boolean;
  lastSeen: string;
}

export interface ChatWebSocketCallbacks {
  onMessage?: (message: ChatMessage) => void;
  onMessageStatus?: (status: MessageStatusUpdate) => void;
  onTyping?: (status: TypingStatus) => void;
  onUserStatus?: (status: UserStatus) => void;
  onReaction?: (reactionEvent: WebSocketReactionEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class ChatWebSocketService {
  private client: Client | null = null;
  private callbacks: ChatWebSocketCallbacks = {};
  private subscriptions: { [key: string]: { id: string; unsubscribe: () => void } } = {};
  private token: string = '';
  // Thêm cache để lưu trữ messageId -> roomId
  private messageRoomCache: Map<string, string> = new Map();

  constructor() {}

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client) {
        this.disconnect();
      }
      
      // Lưu token
      this.token = token;

      this.client = new Client({
        // Cách 1: Chỉ dùng SockJS mà không có query param
        webSocketFactory: () => new SockJS('/ws'),
        
        // Cách 2: Gửi token qua connectHeaders (đúng cách)
        connectHeaders: {
          'Authorization': `Bearer ${token}`
        },
        
        debug: function(str) {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: () => {
          console.log('WebSocket connected successfully');
          this.subscribe();
          if (this.callbacks.onConnect) {
            this.callbacks.onConnect();
          }
          resolve();
        },
        
        onStompError: (frame: IFrame) => {
          console.error('STOMP protocol error', frame);
          if (this.callbacks.onError) {
            this.callbacks.onError(frame);
          }
          reject(frame);
        },
        
        onWebSocketClose: () => {
          console.log('WebSocket connection closed');
          if (this.callbacks.onDisconnect) {
            this.callbacks.onDisconnect();
          }
        }
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client) {
      this.unsubscribeAll();
      this.client.deactivate();
      this.client = null;
    }
  }

  private subscribe(): void {
    if (!this.client || !this.client.connected) {
      return;
    }

    // Subscribe to new messages
    this.subscriptions['messages'] = {
      id: 'messages',
      unsubscribe: this.client.subscribe('/user/queue/messages', (message: IMessage) => {
        if (this.callbacks.onMessage && message.body) {
          const chatMessage = JSON.parse(message.body) as ChatMessage;
          // Lưu messageId và roomId vào cache
          this.messageRoomCache.set(chatMessage.id, chatMessage.roomId);
          this.callbacks.onMessage(chatMessage);
        }
      }).unsubscribe
    };

    // Subscribe to message status updates
    this.subscriptions['message-status'] = {
      id: 'message-status',
      unsubscribe: this.client.subscribe('/user/queue/message-status', (message: IMessage) => {
        if (this.callbacks.onMessageStatus && message.body) {
          const statusUpdate = JSON.parse(message.body) as MessageStatusUpdate;
          
          // Nếu không có roomId trong thông báo, tìm trong cache
          if (!statusUpdate.roomId && statusUpdate.messageId) {
            const cachedRoomId = this.messageRoomCache.get(statusUpdate.messageId);
            if (cachedRoomId) {
              statusUpdate.roomId = cachedRoomId;
            }
          }
          
          // Chỉ gọi callback nếu có roomId
          if (statusUpdate.roomId) {
            this.callbacks.onMessageStatus(statusUpdate);
          } else {
            console.warn('Received message status update without roomId:', statusUpdate);
          }
        }
      }).unsubscribe
    };

    // Subscribe to typing status
    this.subscriptions['typing'] = {
      id: 'typing',
      unsubscribe: this.client.subscribe('/user/queue/typing', (message: IMessage) => {
        if (this.callbacks.onTyping && message.body) {
          const typingStatus = JSON.parse(message.body) as TypingStatus;
          this.callbacks.onTyping(typingStatus);
        }
      }).unsubscribe
    };

    // Subscribe to user status updates
    this.subscriptions['user-status'] = {
      id: 'user-status',
      unsubscribe: this.client.subscribe('/topic/user-status', (message: IMessage) => {
        if (this.callbacks.onUserStatus && message.body) {
          const userStatus = JSON.parse(message.body) as UserStatus;
          this.callbacks.onUserStatus(userStatus);
        }
      }).unsubscribe
    };

    // Subscribe to reaction events
    this.subscriptions['reactions'] = {
      id: 'reactions',
      unsubscribe: this.client.subscribe('/user/queue/reaction', (message: IMessage) => {
        if (this.callbacks.onReaction && message.body) {
          const reactionEvent = JSON.parse(message.body) as WebSocketReactionEvent;
          this.callbacks.onReaction(reactionEvent);
        }
      }).unsubscribe
    };
  }

  private unsubscribeAll(): void {
    Object.values(this.subscriptions).forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = {};
  }

  setCallbacks(callbacks: ChatWebSocketCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  sendMessage(message: any): void {
    if (!this.client || !this.client.connected) {
      console.error('Cannot send message: WebSocket not connected');
      return;
    }
    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(message),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  markRead(data: { roomId: string; messageIds: string[] }): void {
    if (!this.client || !this.client.connected) {
      console.error('Cannot mark read: WebSocket not connected');
      return;
    }
    
    // Lưu messageId và roomId vào cache
    data.messageIds.forEach(messageId => {
      this.messageRoomCache.set(messageId, data.roomId);
    });
    
    this.client.publish({
      destination: '/app/chat.markRead',
      body: JSON.stringify(data),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  setTyping(roomId: string, typing: boolean): void {
    if (!this.client || !this.client.connected) {
      console.error('Cannot send typing status: WebSocket not connected');
      return;
    }
    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ roomId, typing }),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  sendReaction(reactionData: MessageReactionRequest): void {
    if (!this.client || !this.client.connected) {
      console.error('Cannot send reaction: WebSocket not connected');
      return;
    }
    this.client.publish({
      destination: '/app/chat.reaction',
      body: JSON.stringify(reactionData),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  updateUserStatus(online: boolean): void {
    if (!this.client || !this.client.connected) {
      console.error('Cannot update status: WebSocket not connected');
      return;
    }
    const lastSeen = new Date().toISOString();
    this.client.publish({
      destination: '/app/chat.status',
      body: JSON.stringify({ online, lastSeen }),
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  isConnected(): boolean {
    return !!this.client && this.client.connected;
  }
}

// Export a singleton instance
const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService; 