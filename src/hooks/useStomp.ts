// src/hooks/useStomp.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { stompService } from '../services/stompService';
import { IMessage, StompSubscription } from '@stomp/stompjs';

interface UseStompOptions {
  autoConnect?: boolean; // Tự động kết nối khi hook được sử dụng
}

interface UseStompSubscription {
  destination: string;
  callback: (message: IMessage) => void;
  id?: string; // Optional ID để quản lý subscription nếu cần
}

export const useStomp = (options?: UseStompOptions) => {
  const [isConnected, setIsConnected] = useState(stompService.isActive());
  const subscriptionsRef = useRef<Map<string, StompSubscription | undefined>>(new Map());

  const handleConnectionStatus = useCallback(() => {
    setIsConnected(stompService.isActive());
  }, []);

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái kết nối từ stompService (nếu service có emitter)
    // Hoặc đơn giản là kiểm tra định kỳ hoặc khi có hành động
    // Ở đây, chúng ta sẽ dựa vào việc connect/disconnect được gọi tường minh
    // và trạng thái ban đầu.
    // `stompClient.onConnect` và `onWebSocketClose` trong service sẽ cập nhật trạng thái ngầm.
    // Hook này cần một cách để biết khi nào trạng thái thay đổi.
    // Một giải pháp đơn giản là service có thể có một listener chung:
    // Ví dụ trong stompService:
    // let statusListeners: (() => void)[] = [];
    // const addStatusListener = (listener: () => void) => statusListeners.push(listener);
    // const removeStatusListener = (listener: () => void) => ...
    // onConnect/onWebSocketClose/onError -> statusListeners.forEach(l => l());
    //
    // Sau đó trong hook:
    // useEffect(() => {
    //   const listener = () => setIsConnected(stompService.isActive());
    //   stompService.addStatusListener(listener);
    //   return () => stompService.removeStatusListener(listener);
    // }, []);
    //
    // Vì stompService hiện tại không có cơ chế đó, chúng ta sẽ làm đơn giản hơn:
    // Component sẽ phải tự quản lý việc gọi connect.

    if (options?.autoConnect) {
      stompService.connect().then(handleConnectionStatus).catch(handleConnectionStatus);
    }

    // Clean up khi hook unmount
    return () => {
      // Không tự động disconnect ở đây trừ khi đó là ý muốn
      // Việc disconnect nên được quản lý bởi component cha hoặc App
      // subscriptionsRef.current.forEach(sub => sub?.unsubscribe());
      // subscriptionsRef.current.clear();
    };
  }, [options?.autoConnect, handleConnectionStatus]);


  const connect = useCallback(async () => {
    try {
      await stompService.connect();
      handleConnectionStatus();
    } catch (error) {
      console.error("useStomp: Failed to connect", error);
      handleConnectionStatus(); // Cập nhật trạng thái dù lỗi
    }
  }, [handleConnectionStatus]);

  const disconnect = useCallback(async () => {
    await stompService.disconnect();
    handleConnectionStatus();
  }, [handleConnectionStatus]);

  const subscribe = useCallback((destination: string, callback: (message: IMessage) => void) => {
    const sub = stompService.subscribe(destination, callback);
    if (sub) {
      subscriptionsRef.current.set(destination, sub);
    }
    // Không trả về sub trực tiếp vì nó có thể undefined nếu chưa connect
    // Component nên dựa vào callback để nhận data
  }, []);

  const unsubscribe = useCallback((destination: string) => {
    stompService.unsubscribe(destination);
    subscriptionsRef.current.delete(destination);
  }, []);

  const publish = useCallback(
    (destination: string, body?: string, headers?: { [key: string]: any }) => {
      stompService.publish(destination, body, headers);
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
    stompClient: stompService.getClient(), // Để có thể truy cập client nếu cần
  };
};