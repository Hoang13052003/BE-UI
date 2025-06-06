// src/services/auditLogSseService.ts
import { AuditLogRealtimeDto } from '../hooks/useAuditLogData';

interface SSEServiceConfig {
  url: string;
  onMessage: (log: AuditLogRealtimeDto) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

class AuditLogSSEService {
  private eventSource: EventSource | null = null;
  private config: SSEServiceConfig | null = null;
  private reconnectAttempts = 0;
  private isManualDisconnect = false;

  connect(config: SSEServiceConfig) {
    this.config = config;
    this.isManualDisconnect = false;
    this.createConnection();
  }

  private createConnection() {
    if (!this.config) return;

    console.log('SSE_SERVICE: Connecting to', this.config.url);
    
    this.eventSource = new EventSource(this.config.url);

    this.eventSource.onopen = () => {
      console.log('SSE_SERVICE: Connected successfully');
      this.reconnectAttempts = 0;
      this.config?.onOpen?.();
    };

    this.eventSource.addEventListener('audit-log', (event) => {
      try {
        const auditLog: AuditLogRealtimeDto = JSON.parse(event.data);
        this.config?.onMessage(auditLog);
      } catch (error) {
        console.error('SSE_SERVICE: Error parsing audit log data:', error);
      }
    });

    this.eventSource.addEventListener('connected', (event) => {
      console.log('SSE_SERVICE: Connection confirmed:', event.data);
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE_SERVICE: Connection error:', error);
      this.config?.onError?.(error);
      
      if (!this.isManualDisconnect) {
        this.handleReconnection();
      }
    };
  }

  private handleReconnection() {
    if (!this.config) return;
    
    const maxAttempts = this.config.maxReconnectAttempts || 5;
    const interval = this.config.reconnectInterval || 5000;

    if (this.reconnectAttempts < maxAttempts) {
      this.reconnectAttempts++;
      console.log(`SSE_SERVICE: Attempting to reconnect (${this.reconnectAttempts}/${maxAttempts}) in ${interval}ms`);
      
      setTimeout(() => {
        if (!this.isManualDisconnect) {
          this.disconnect();
          this.createConnection();
        }
      }, interval);
    } else {
      console.log('SSE_SERVICE: Max reconnection attempts reached');
    }
  }

  disconnect() {
    this.isManualDisconnect = true;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    console.log('SSE_SERVICE: Disconnected');
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

export const auditLogSSEService = new AuditLogSSEService();
