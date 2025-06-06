// src/components/AuditLogDashboard/AuditLogDetailModal.tsx
import React from 'react';
import { Modal, Descriptions, Tag, Typography, Space, Divider } from 'antd';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  GlobalOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { AuditLogRealtimeDto } from '../../hooks/useAuditLogData';
import { getSeverityColor, getCategoryDisplayName, getSeverityIcon } from '../../types/auditLog';

const { Text } = Typography;

interface AuditLogDetailModalProps {
  visible: boolean;
  onClose: () => void;
  log: AuditLogRealtimeDto | null;
}

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  visible,
  onClose,
  log
}) => {
  if (!log) return null;

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      iso: date.toISOString()
    };
  };

  const { date, time, iso } = formatDateTime(log.timestamp);

  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          Audit Log Details
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Log ID" span={2}>
          <Text code>{log.id}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Timestamp">
          <div>
            <div>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {date} {time}
            </div>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {iso}
            </Text>
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <div style={{ textAlign: 'center' }}>
            {log.success ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Success
              </Tag>
            ) : (
              <Tag color="error" icon={<CloseCircleOutlined />}>
                Failed
              </Tag>
            )}
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="User">
          <div>
            <UserOutlined style={{ marginRight: 4 }} />
            <Text strong>{log.username || 'System'}</Text>
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="IP Address">
          {log.ipAddress ? (
            <div>
              <GlobalOutlined style={{ marginRight: 4 }} />
              <Text code>{log.ipAddress}</Text>
            </div>
          ) : (
            <Text type="secondary">Not available</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Action Type" span={2}>
          <Tag color="blue" style={{ fontSize: '12px' }}>
            {log.actionType}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Category">
          {log.category ? (
            <Tag color="cyan">
              {getCategoryDisplayName(log.category as any)}
            </Tag>
          ) : (
            <Text type="secondary">Not specified</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Severity">
          <Tag 
            color={getSeverityColor(log.severity as any)}
            style={{ minWidth: 80, textAlign: 'center' }}
          >
            {getSeverityIcon(log.severity as any)} {log.severity}
          </Tag>
        </Descriptions.Item>

        {log.targetEntity && (
          <Descriptions.Item label="Target Entity">
            <Text code>{log.targetEntity}</Text>
          </Descriptions.Item>
        )}

        {log.targetEntityId && (
          <Descriptions.Item label="Target Entity ID">
            <Text code>{log.targetEntityId}</Text>
          </Descriptions.Item>
        )}

        {log.details && (
          <Descriptions.Item label="Details" span={2}>
            <div style={{ 
              maxHeight: 150, 
              overflowY: 'auto',
              padding: '8px',
              backgroundColor: '#fafafa',
              border: '1px solid #d9d9d9',
              borderRadius: '4px'
            }}>
              <Text style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {log.details}
              </Text>
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          This audit log entry contains all available information about the recorded action.
        </Text>
      </div>
    </Modal>
  );
};

export default AuditLogDetailModal;
