// src/components/AuditLogDashboard/LogTable.tsx
import React from 'react';
import { Card, Table, Tag, Button, Space, Tooltip, Typography } from 'antd';
import { 
  ReloadOutlined, 
  LeftOutlined, 
  RightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { AuditLogRealtimeDto, PageResponse } from '../../hooks/useAuditLogData';
import { getSeverityColor, getCategoryDisplayName, getSeverityIcon } from '../../types/auditLog';

const { Text } = Typography;

interface LogTableProps {
  logPage: PageResponse<AuditLogRealtimeDto> | null;
  onPageChange: (newPage: number) => void;
  onRefresh?: () => void;
  currentPage: number;
  isLoading: boolean;
}

const LogTable: React.FC<LogTableProps> = ({ 
  logPage, 
  onPageChange, 
  onRefresh,
  currentPage, 
  isLoading 
}) => {
  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 140,
      render: (timestamp: string) => (
        <div style={{ fontSize: '12px' }}>
          <div>{new Date(timestamp).toLocaleDateString()}</div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {new Date(timestamp).toLocaleTimeString()}
          </Text>
        </div>
      ),
    },
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (username: string, record: AuditLogRealtimeDto) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <UserOutlined style={{ fontSize: '12px', color: '#666' }} />
            <Text strong style={{ fontSize: '12px' }}>
              {username || 'System'}
            </Text>
          </div>
          {record.ipAddress && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <GlobalOutlined style={{ fontSize: '10px', color: '#999' }} />
              <Text code style={{ fontSize: '10px' }}>
                {record.ipAddress}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 150,
      render: (actionType: string) => (
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>
          {actionType}
        </Text>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => category ? (
        <Tag color="blue" style={{ fontSize: '11px', margin: 0 }}>
          {getCategoryDisplayName(category as any)}
        </Tag>
      ) : '-',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => (
        <Tag 
          color={getSeverityColor(severity as any)}
          style={{ fontSize: '11px', margin: 0, minWidth: '60px', textAlign: 'center' }}
        >
          {getSeverityIcon(severity as any)} {severity}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      width: 80,
      render: (success: boolean) => (
        <div style={{ textAlign: 'center' }}>
          {success ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
          )}
        </div>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details: string, record: AuditLogRealtimeDto) => (
        <div>
          {details ? (
            <Tooltip title={details} placement="topLeft">
              <Text style={{ fontSize: '12px' }} ellipsis>
                {details}
              </Text>
            </Tooltip>
          ) : (
            <Text type="secondary" style={{ fontSize: '12px' }}>-</Text>
          )}
          {record.targetEntity && (
            <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
              Target: {record.targetEntity}
              {record.targetEntityId && ` (${record.targetEntityId})`}
            </div>
          )}
        </div>
      ),
    },
  ];

  if (isLoading && !logPage) {
    return (
      <Card title="Paged Audit Logs" loading={true}>
        <div style={{ height: 400 }} />
      </Card>
    );
  }

  if (!logPage) {
    return (
      <Card title="Paged Audit Logs">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">No paged data available.</Text>
        </div>
      </Card>
    );  }

  const { content, totalPages, totalElements } = logPage;

  return (
    <Card 
      title="Audit Log History"
      extra={
        <Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {totalElements} total entries
          </Text>
          {onRefresh && (
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRefresh}
              loading={isLoading}
              size="small"
            >
              Refresh
            </Button>
          )}
        </Space>
      }
    >
      <Table
        dataSource={content}
        columns={columns}
        rowKey="id"
        pagination={false}
        loading={isLoading}
        size="small"
        scroll={{ x: 800 }}
        locale={{ emptyText: 'No audit logs found for this page.' }}
      />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '16px',
        padding: '0 8px'
      }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Page {currentPage + 1} of {totalPages} 
          ({totalElements} total, showing {content.length} entries)
        </Text>
        
        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0 || isLoading}
            size="small"
          >
            Previous
          </Button>
          <Button
            icon={<RightOutlined />}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || isLoading}
            size="small"
          >
            Next
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default LogTable;