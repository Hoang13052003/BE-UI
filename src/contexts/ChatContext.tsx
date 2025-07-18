import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ChatWebSocket, ChatMessage } from '../services/ChatWebSocket';

// Chat state structure
interface ChatState {
  isConnected: boolean;
  privateChats: Map<string, ChatMessage[]>;
  groupChats: Map<string, ChatMessage[]>;
  projectChats: Map<string, ChatMessage[]>;
  onlineUsers: Set<string>;
  activeChat: string | null;
  typingUsers: Map<string, boolean>;
}

// Context value type
interface ChatContextType extends ChatState {
  sendMessage: (msg: ChatMessage) => void;
  setActiveChat: (chatId: string | null) => void;
  subscribeToProjectRooms: (roomIds: string[]) => void; // Add this to the interface
  // Add more actions as needed
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Extend ChatMessage for local status
export interface LocalChatMessage extends ChatMessage {
  localId?: string; // For optimistic update
  status?: 'sending' | 'sent' | 'failed';
}

// Provider component
export const ChatProvider: React.FC<{ token: string; children: React.ReactNode }> = ({ token, children }) => {
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [privateChats, setPrivateChats] = useState<Map<string, ChatMessage[]>>(new Map());
  const [groupChats, setGroupChats] = useState<Map<string, ChatMessage[]>>(new Map());
  const [projectChats, setProjectChats] = useState<Map<string, ChatMessage[]>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());

  // WebSocket ref
  const wsRef = useRef<ChatWebSocket | null>(null);

  // Handle incoming messages
  const handleMessage = (message: ChatMessage) => {
    switch (message.type) {
      case 'private_message_received': {
        const userId = message.senderId?.toString();
        setPrivateChats(prev => {
          const newMap = new Map(prev);
          const msgs = newMap.get(userId) || [];
          newMap.set(userId, [...msgs, message]);
          return newMap;
        });
        break;
      }
      case 'group_message_received': {
        const topic = message.topic;
        setGroupChats(prev => {
          const newMap = new Map(prev);
          const msgs = newMap.get(topic) || [];
          newMap.set(topic, [...msgs, message]);
          return newMap;
        });
        break;
      }
      case 'project_message_received': {
        const projectId = message.projectId;
        setProjectChats(prev => {
          const newMap = new Map(prev);
          const msgs = newMap.get(projectId) || [];
          // Nếu có message local đang sending với cùng content, cập nhật thành sent
          let updated = false;
          const updatedMsgs = msgs.map(m => {
            if (!updated && m.content === message.content && (m as LocalChatMessage).status === 'sending') {
              updated = true;
              return { ...message, status: 'sent' };
            }
            return m;
          });
          // Nếu không trùng, push mới
          if (!updated) updatedMsgs.push({ ...message, status: 'sent' });
          newMap.set(projectId, updatedMsgs);
          return newMap;
        });
        break;
      }
      case 'user_typing': {
        const userId = message.senderId?.toString();
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, message.isTyping);
          return newMap;
        });
        break;
      }
      case 'online_users': {
        setOnlineUsers(new Set(message.users));
        break;
      }
      case 'notification': {
        // Handle notification if needed
        break;
      }
      case 'auth_failed': {
        // Handle authentication failure (security)
        // For example: redirect to login
        break;
      }
      default:
        // Handle other message types
        break;
    }
  };

  // Handle WebSocket errors
  const handleError = (error: Event | Error) => {
    // Optionally log or show error notification
    setIsConnected(false);
  };

  // Initialize WebSocket connection
  useEffect(() => {
    console.log("[ChatProvider] useEffect, token:", token);
    if (!token) return;
    wsRef.current = new ChatWebSocket(token, handleMessage, handleError);
    setIsConnected(true);
    return () => {
      wsRef.current?.close();
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Send message via WebSocket with optimistic update for project chat
  const sendMessage = (msg: ChatMessage) => {
    // Only handle project_message for optimistic update
    if (msg.type === 'project_message' && msg.projectId) {
      const localId = `${Date.now()}_${Math.random()}`;
      const optimisticMsg: LocalChatMessage = {
        ...msg,
        localId,
        status: 'sending',
        senderId: 'Me', // Or get from user context
      };
      setProjectChats(prev => {
        const newMap = new Map(prev);
        const msgs = newMap.get(msg.projectId) || [];
        newMap.set(msg.projectId, [...msgs, optimisticMsg]);
        return newMap;
      });
      try {
        wsRef.current?.send(msg);
      } catch (e) {
        // Mark as failed if send error
        setProjectChats(prev => {
          const newMap = new Map(prev);
          const msgs = newMap.get(msg.projectId) || [];
          newMap.set(
            msg.projectId,
            msgs.map(m =>
              (m as LocalChatMessage).localId === localId ? { ...m, status: 'failed' } : m
            )
          );
          return newMap;
        });
      }
    } else {
      wsRef.current?.send(msg);
    }
  };

  // Subscribe to project chat rooms
  const subscribeToProjectRooms = (roomIds: string[]) => {
    roomIds.forEach(roomId => {
      wsRef.current?.send({ type: 'subscribe', topic: roomId });
    });
  };

  // Context value
  const value: ChatContextType = {
    isConnected,
    privateChats,
    groupChats,
    projectChats,
    onlineUsers,
    activeChat,
    typingUsers,
    sendMessage,
    setActiveChat,
    subscribeToProjectRooms, // new
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook for using chat context
export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}; 