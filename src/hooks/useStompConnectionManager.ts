// src/hooks/useStompConnectionManager.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { message } from 'antd';
import { normalizeBaseUrl, toWebSocketUrl } from '../utils/urlUtils';

interface StompConnectionManagerOptions {
  autoConnect?: boolean;
  useSockJS?: boolean;
}

interface StompConnectionManager {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: Error | null;
  connectStomp: (useSockJS?: boolean) => Promise<void>;
  disconnectStomp: () => Promise<void>;
}

export const useStompConnectionManager = ({
  autoConnect = false,
  useSockJS = true,
}: StompConnectionManagerOptions = {}): StompConnectionManager => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  
  const stompClientRef = useRef<Client | null>(null);

  const connectStomp = useCallback(async (useWSSockJS: boolean = useSockJS) => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Clean up existing connection
      if (stompClientRef.current?.active) {
        await stompClientRef.current.deactivate();
      }

      const client = new Client({        // Configure WebSocket factory based on useSockJS option
        webSocketFactory: () => {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
          const cleanBaseUrl = normalizeBaseUrl(baseUrl);
          
          if (useWSSockJS) {
            return new SockJS(`${cleanBaseUrl}/ws?token=${token}`);
          } else {
            const wsUrl = toWebSocketUrl(cleanBaseUrl);
            return new WebSocket(`${wsUrl}/ws?token=${token}`);
          }
        },
        
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        
        debug: (str) => {
          console.log('[STOMP]', new Date(), str);
        },
        
        reconnectDelay: 5000,
      });

      client.onConnect = (frame) => {
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        console.log('✅ STOMP Connected:', frame);
        message.success("Connected to real-time updates");
      };

      client.onDisconnect = () => {
        setIsConnected(false);
        setIsConnecting(false);
        console.log('❌ STOMP Disconnected');
      };

      client.onStompError = (frame) => {
        const error = new Error(`STOMP error: ${frame.headers['message']}`);
        setConnectionError(error);
        setIsConnecting(false);
        setIsConnected(false);
        console.error('STOMP Error:', frame);
        message.error("Connection error occurred");
      };

      client.onWebSocketError = (error) => {
        const wsError = new Error(`WebSocket error: ${error}`);
        setConnectionError(wsError);
        setIsConnecting(false);
        setIsConnected(false);
        console.error('WebSocket Error:', error);
      };

      stompClientRef.current = client;
      await client.activate();
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown connection error');
      setConnectionError(err);
      setIsConnecting(false);
      setIsConnected(false);
      console.error('Failed to connect STOMP:', err);
      message.error(`Connection failed: ${err.message}`);
      throw err;
    }
  }, [isConnecting, isConnected, useSockJS]);

  const disconnectStomp = useCallback(async () => {
    if (stompClientRef.current?.active) {
      try {
        await stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(null);
        console.log('STOMP client disconnected');
      } catch (error) {
        console.error('Error disconnecting STOMP:', error);
      }
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connectStomp();
    }

    // Cleanup on unmount
    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
      }
    };
  }, [autoConnect, connectStomp]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    connectStomp,
    disconnectStomp,
  };
};
