// src/hooks/useStomp.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { auditLogStompService } from '../services/stompService';
import { IMessage, StompSubscription } from '@stomp/stompjs';

interface UseStompOptions {
  autoConnect?: boolean;
}

interface UseStompSubscription {
  destination: string;
  callback: (message: IMessage) => void;
  id?: string;
}

export const useStomp = (options?: UseStompOptions) => {
  const [isConnected, setIsConnected] = useState(auditLogStompService.isActive());
  const subscriptionsRef = useRef<Map<string, StompSubscription | undefined>>(new Map());

  const handleConnectionStatus = useCallback(() => {
    setIsConnected(auditLogStompService.isActive());
  }, []);

  useEffect(() => {
  const updateStatus = () => setIsConnected(auditLogStompService.isActive());
  auditLogStompService.addConnectionStatusListener(updateStatus);
  updateStatus();
  return () => {
    auditLogStompService.removeConnectionStatusListener(updateStatus);
  };
}, []);


  const connect = useCallback(async () => {
    try {
      await auditLogStompService.connect();
      handleConnectionStatus();
    } catch (error) {
      console.error("useStomp: Failed to connect", error);
      handleConnectionStatus(); // Cập nhật trạng thái dù lỗi
    }
  }, [handleConnectionStatus]);

  const disconnect = useCallback(async () => {
    await auditLogStompService.disconnect();
    handleConnectionStatus();
  }, [handleConnectionStatus]);

  const subscribe = useCallback((destination: string, callback: (message: IMessage) => void) => {
  auditLogStompService.subscribe(destination, callback);
  return () => {
    auditLogStompService.unsubscribe(destination);
  };
}, []);

  const unsubscribe = useCallback((destination: string) => {
    auditLogStompService.unsubscribe(destination);
    subscriptionsRef.current.delete(destination);
  }, []);

  const publish = useCallback(
    (destination: string, body?: string, headers?: { [key: string]: any }) => {
      auditLogStompService.publish(destination, body, headers);
    },
    []
  );

  return {
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
    stompClient: auditLogStompService.getClient(), // Để có thể truy cập client nếu cần
  };
};