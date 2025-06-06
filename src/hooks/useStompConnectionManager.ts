// src/hooks/useStompConnectionManager.ts
import { useEffect, useState, useCallback } from 'react';
import { auditLogStompService } from '../services/stompService';

interface UseStompConnectionManagerOptions {
  autoConnect?: boolean;
  useSockJS?: boolean;
}

export const useStompConnectionManager = (options?: UseStompConnectionManagerOptions) => {
  const { autoConnect = false, useSockJS = true } = options || {};

  const [isConnected, setIsConnected] = useState(auditLogStompService.isActive());
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  const handleStatusChange = useCallback(() => {
    setIsConnected(auditLogStompService.isActive());
  }, []);

  useEffect(() => {
    auditLogStompService.addConnectionStatusListener(handleStatusChange);
    handleStatusChange(); // Initial status check
    return () => {
      auditLogStompService.removeConnectionStatusListener(handleStatusChange);
    };
  }, [handleStatusChange]);

  const connect = useCallback(async (connectUsingSockJS: boolean = true) => {
    if (auditLogStompService.isActive() || isConnecting) {
      console.log('useStompConnectionManager: Already connected or connection in progress.');
      return;
    }
    setIsConnecting(true);
    setConnectionError(null);
    console.log('useStompConnectionManager: Attempting to connect...');
    try {
      await auditLogStompService.connect(connectUsingSockJS);
    } catch (error) {
      console.error('useStompConnectionManager: Failed to connect.', error);
      setConnectionError(error instanceof Error ? error : new Error('Unknown connection error'));
    } finally {
      setIsConnecting(false);
      // handleStatusChange sẽ được gọi bởi service, nhưng gọi ở đây để đảm bảo UI cập nhật ngay sau khi isConnecting = false
      handleStatusChange();
    }
  }, [isConnecting, handleStatusChange]);

  const disconnect = useCallback(async () => {
    if (!auditLogStompService.isActive() && !isConnecting) {
        console.log('useStompConnectionManager: Already disconnected or not connecting.');
        return;
    }
    console.log('useStompConnectionManager: Attempting to disconnect...');
    try {
      await auditLogStompService.disconnect();
    } catch (error) {
      console.error('useStompConnectionManager: Error during disconnect.', error);
    } finally {
        // handleStatusChange sẽ được gọi bởi service
        handleStatusChange();
    }
  }, [isConnecting, handleStatusChange]);

  useEffect(() => {
    if (autoConnect && !auditLogStompService.isActive() && !isConnecting) {
      console.log('useStompConnectionManager: Auto-connecting...');
      connect(useSockJS);
    }
  }, [autoConnect, useSockJS, connect, isConnecting]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    connectStomp: connect,
    disconnectStomp: disconnect,
  };
};