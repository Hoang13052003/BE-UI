// src/components/AuditLogTable.tsx

import React, { useState } from 'react';
import { Table, Tag, Tooltip } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { FilterValue } from 'antd/es/table/interface';
import { AuditLog, AuditLogSeverity } from '../../types/auditLog.types';
import AuditLogDetailModal from './AuditLogDetailModal';
import { getSeverityTagColor } from '../../utils/styleUtils';

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  pagination: TablePaginationConfig; // Sử dụng kiểu của Antd
  handleTableChange: (
    pagination: TablePaginationConfig, 
    filters: Record<string, FilterValue | null>
  ) => void;
}

/**
 * Component hiển thị bảng dữ liệu Audit Log sử dụng Ant Design Table.
 */
const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  loading,
  pagination,
  handleTableChange,
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const columns: ColumnsType<AuditLog> = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: true, // Bật sorter, logic sẽ được xử lý ở `handleTableChange`
      width: 200,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => text || 'N/A',
      sorter: true,
      width: 150,
    },
    {
      title: 'Action',
      dataIndex: 'actionType',
      key: 'actionType',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: AuditLogSeverity) => (
        <Tag color={getSeverityTagColor(severity)}>{severity}</Tag>
      ),
      filters: Object.values(AuditLogSeverity).map(s => ({ text: s, value: s })),
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      render: (success: boolean) => (
        success ? <Tag color="success">Success</Tag> : <Tag color="error">Failure</Tag>
      ),
      filters: [
        { text: 'Success', value: true },
        { text: 'Failure', value: false },
      ],
      width: 120,
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: { showTitle: false }, // Cắt bớt text dài
      render: (details) => (
        <Tooltip placement="topLeft" title={details}>
          {details}
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Table<AuditLog> // Cung cấp kiểu dữ liệu cho Table
        rowKey="id"
        columns={columns}
        dataSource={logs}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange} // Hàm callback chính
        onRow={(record) => ({
          onClick: () => setSelectedLog(record),
        })}
        scroll={{ x: 'max-content' }} // Cho phép cuộn ngang nếu nội dung quá dài
        rowClassName={() => 'clickable-row'}
        style={{ cursor: 'pointer' }}
      />
      
      <AuditLogDetailModal 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </>
  );
};

export default AuditLogTable;