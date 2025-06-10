// src/contexts/StompContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useStompConnectionManager } from '../hooks/useStompConnectionManager';

interface StompContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: Error | null;
  connectStomp: (useSockJS?: boolean) => Promise<void>;
  disconnectStomp: () => Promise<void>;
}

const StompContext = createContext<StompContextType | undefined>(undefined);

interface StompProviderProps {
  children: ReactNode;
  autoConnect?: boolean; // Cho phép truyền config autoConnect vào Provider
  useSockJS?: boolean;   // Cho phép truyền config useSockJS vào Provider
}

export const StompProvider: React.FC<StompProviderProps> = ({
  children,
  autoConnect = false,
  useSockJS = true,
}) => {
  const stompConnection = useStompConnectionManager({
    autoConnect: autoConnect,
    useSockJS: useSockJS,
  });

  return (
    <StompContext.Provider value={stompConnection}>
      {children}
    </StompContext.Provider>
  );
};

export const useStompContext = (): StompContextType => {
  const context = useContext(StompContext);
  if (context === undefined) {
    throw new Error('useStompContext must be used within a StompProvider');
  }
  return context;
};