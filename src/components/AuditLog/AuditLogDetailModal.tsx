// src/components/AuditLogDetailModal.tsx

import React from 'react';
import { Modal, Descriptions, Tag, Typography, Divider } from 'antd';
import { AuditLog } from '../../types/auditLog.types';
import { getSeverityTagColor } from '../../utils/styleUtils'; // Import hàm tiện ích

const { Paragraph, Text } = Typography;

interface ModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

/**
 * Modal hiển thị toàn bộ chi tiết của một bản ghi Audit Log, sử dụng các component của Ant Design.
 */
const AuditLogDetailModal: React.FC<ModalProps> = ({ log, onClose }) => {
  // Không render gì cả nếu không có log nào được chọn.
  // Việc quản lý hiển thị sẽ do prop `open` của Modal đảm nhiệm.
  if (!log) {
    return null;
  }

  return (
    <Modal
      title="Audit Log Details"
      open={true} // `open` được điều khiển bởi sự tồn tại của `log` ở component cha
      onCancel={onClose}
      footer={null} // Không hiển thị các nút OK/Cancel mặc định
      width={800}
      destroyOnClose // Hủy các state bên trong modal khi nó đóng
    >
      <Descriptions bordered layout="vertical" column={{ xs: 1, sm: 2 }}>
        {/* Phần thông tin chung */}
        <Descriptions.Item label="ID" span={2}>{log.id}</Descriptions.Item>
        <Descriptions.Item label="Timestamp">{new Date(log.timestamp).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Username">{log.username ?? 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="User ID">{log.userId ?? 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="IP Address">{log.ipAddress}</Descriptions.Item>
        <Descriptions.Item label="User Agent" span={2}>
          <Text type="secondary" style={{ fontSize: '0.8em' }}>{log.userAgent ?? 'N/A'}</Text>
        </Descriptions.Item>

        {/* Phần thông tin hành động */}
        <Descriptions.Item label="Action" span={2}>
          <Text strong>{log.actionType}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          <Tag>{log.category}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Severity">
          <Tag color={getSeverityTagColor(log.severity)}>{log.severity}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {log.success ? <Tag color="success">Success</Tag> : <Tag color="error">Failure</Tag>}
        </Descriptions.Item>
        
        {/* Phần thông tin Target */}
        <Descriptions.Item label="Target Entity">
          <Text code>{log.targetEntity ?? 'N/A'}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Target Entity ID">
          <Text code>{log.targetEntityId ?? 'N/A'}</Text>
        </Descriptions.Item>

        {/* Phần dữ liệu thô */}
        <Descriptions.Item label="Details" span={2}>
          <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {log.details || 'No details provided.'}
          </Paragraph>
        </Descriptions.Item>
        {log.metadata && (
          <Descriptions.Item label="Metadata" span={2}>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', maxHeight: 200, overflowY: 'auto', margin: 0 }}>
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};

export default AuditLogDetailModal;