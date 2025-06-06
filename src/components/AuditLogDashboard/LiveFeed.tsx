// src/components/AuditLogDashboard/LiveFeed.tsx
import React from 'react';
import { Card, List, Tag, Avatar, Typography, Empty } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { AuditLogRealtimeDto } from '../../hooks/useAuditLogData';
import { getSeverityColor, getSeverityIcon, getCategoryDisplayName } from '../../types/auditLog';

const { Text } = Typography;

interface LiveFeedProps {
  logs: AuditLogRealtimeDto[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ logs }) => {
  const getSuccessIcon = (success: boolean) => success ? '✅' : '❌';
  
  return (
    <Card 
      title="Live Audit Feed" 
      style={{ marginBottom: 16 }}
      extra={
        <Tag color="green">
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          Live ({logs.length})
        </Tag>
      }
    >
      <div style={{ height: '300px', overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <Empty 
            description="No new logs yet..." 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ paddingTop: 60 }}
          />
        ) : (
          <List
            dataSource={logs}
            renderItem={(log, index) => (
              <List.Item 
                key={log.id}
                style={{ 
                  padding: '8px 0',
                  borderBottom: index < logs.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<UserOutlined />}
                      size="small"
                      style={{ 
                        backgroundColor: getSeverityColor(log.severity as any),
                        fontSize: '12px'
                      }}
                    >
                      {getSeverityIcon(log.severity as any)}
                    </Avatar>
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: '13px' }}>
                        {log.username || 'System'} - {log.actionType}
                      </Text>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <Tag 
                          color={getSeverityColor(log.severity as any)} 
                          style={{ margin: 0, fontSize: '11px', padding: '0 4px' }}
                        >
                          {log.severity}
                        </Tag>
                        <span style={{ fontSize: '11px' }}>
                          {getSuccessIcon(log.success)}
                        </span>
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {new Date(log.timestamp).toLocaleString()}
                        {log.category && (
                          <>
                            {' | '}
                            {getCategoryDisplayName(log.category as any)}
                          </>
                        )}
                        {log.ipAddress && (
                          <>
                            {' | IP: '}
                            <Text code style={{ fontSize: '10px' }}>{log.ipAddress}</Text>
                          </>
                        )}
                      </div>
                      {log.details && (
                        <Text 
                          style={{ fontSize: '11px', color: '#333' }}
                          ellipsis={{ tooltip: log.details }}
                        >
                          {log.details}
                        </Text>
                      )}
                      {log.targetEntity && (
                        <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                          Target: {log.targetEntity}
                          {log.targetEntityId && ` (ID: ${log.targetEntityId})`}
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
            size="small"
          />
        )}
      </div>
    </Card>
  );
};

export default LiveFeed;