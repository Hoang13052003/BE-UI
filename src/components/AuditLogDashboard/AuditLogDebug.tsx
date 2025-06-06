// src/components/AuditLogDashboard/AuditLogDebug.tsx
import React from 'react';
import { Card, Descriptions, Tag, Button, Space } from 'antd';
import { useAuditLogData } from '../../hooks/useAuditLogData';
import { useStompContext } from '../../contexts/StompContext';

interface AuditLogDebugProps {
  visible?: boolean;
  onToggle?: () => void;
}

const AuditLogDebug: React.FC<AuditLogDebugProps> = ({ visible = false, onToggle }) => {
  const { 
    isLoadingPagedLogs, 
    pagedAuditLogData, 
    liveAuditLogs, 
    reconnectionStatus,
    error 
  } = useAuditLogData();
  
  const { isConnected } = useStompContext();

  if (!visible) {
    return onToggle ? (
      <Button size="small" onClick={onToggle} type="dashed">
        Show Debug Info
      </Button>
    ) : null;
  }

  return (
    <Card 
      title="Debug Information" 
      size="small"
      extra={
        onToggle && (
          <Button size="small" onClick={onToggle}>
            Hide
          </Button>
        )
      }
    >
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="WebSocket Connected">
          <Tag color={isConnected ? 'green' : 'red'}>
            {isConnected ? 'Yes' : 'No'}
          </Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Loading State">
          <Tag color={isLoadingPagedLogs ? 'orange' : 'green'}>
            {isLoadingPagedLogs ? 'Loading...' : 'Idle'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Paged Data">
          <Tag color={pagedAuditLogData ? 'blue' : 'default'}>
            {pagedAuditLogData ? `${pagedAuditLogData.totalElements} records` : 'No data'}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Live Logs">
          <Tag color={liveAuditLogs.length > 0 ? 'green' : 'default'}>
            {liveAuditLogs.length} logs
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Reconnection Attempts">
          <Tag color={reconnectionStatus.attempts > 0 ? 'warning' : 'default'}>
            {reconnectionStatus.attempts}/{reconnectionStatus.maxAttempts}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Error State">
          <Tag color={error ? 'red' : 'green'}>
            {error ? 'Has Error' : 'No Error'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      {error && (
        <div style={{ marginTop: 8 }}>
          <Tag color="red">Error: {error}</Tag>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <Space size="small">
          <span style={{ fontSize: 12, color: '#666' }}>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </Space>
      </div>
    </Card>
  );
};

export default AuditLogDebug;
