// src/components/AuditLogDashboard/AuditLogFilters.tsx
import React from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Space, Input } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { AuditLogCategory, AuditLogSeverity, AuditLogFilter, getCategoryDisplayName } from '../../types/auditLog';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface AuditLogFiltersProps {
  filter: AuditLogFilter;
  onFilterChange: (filter: AuditLogFilter) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filter,
  onFilterChange,
  onClearFilters,
  loading = false
}) => {
  const handleFilterChange = (key: keyof AuditLogFilter, value: any) => {
    onFilterChange({
      ...filter,
      [key]: value
    });
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      onFilterChange({
        ...filter,
        startTime: dates[0].toDate(),
        endTime: dates[1].toDate()
      });
    } else {
      onFilterChange({
        ...filter,
        startTime: undefined,
        endTime: undefined
      });
    }
  };

  const hasActiveFilters = Object.values(filter).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <Card 
      title={
        <Space>
          <FilterOutlined />
          Audit Log Filters
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Category</label>
          <Select
            placeholder="Select category"
            value={filter.category}
            onChange={(value) => handleFilterChange('category', value)}
            allowClear
            style={{ width: '100%' }}
            disabled={loading}
          >
            {Object.values(AuditLogCategory).map(category => (
              <Option key={category} value={category}>
                {getCategoryDisplayName(category)}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Severity</label>
          <Select
            placeholder="Select severity"
            value={filter.severity}
            onChange={(value) => handleFilterChange('severity', value)}
            allowClear
            style={{ width: '100%' }}
            disabled={loading}
          >
            {Object.values(AuditLogSeverity).map(severity => (
              <Option key={severity} value={severity}>
                <span style={{ textTransform: 'capitalize' }}>{severity.toLowerCase()}</span>
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Success Status</label>
          <Select
            placeholder="Select status"
            value={filter.success}
            onChange={(value) => handleFilterChange('success', value)}
            allowClear
            style={{ width: '100%' }}
            disabled={loading}
          >
            <Option value={true}>Success</Option>
            <Option value={false}>Failed</Option>
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Username</label>
          <Input
            placeholder="Enter username"
            value={filter.username}
            onChange={(e) => handleFilterChange('username', e.target.value)}
            allowClear
            disabled={loading}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Action Type</label>
          <Input
            placeholder="Enter action type"
            value={filter.actionType}
            onChange={(e) => handleFilterChange('actionType', e.target.value)}
            allowClear
            disabled={loading}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Date Range</label>
          <RangePicker
            value={filter.startTime && filter.endTime ? [dayjs(filter.startTime), dayjs(filter.endTime)] : null}
            onChange={handleDateRangeChange}
            style={{ width: '100%' }}
            disabled={loading}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={4}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>&nbsp;</label>
          <Button
            icon={<ClearOutlined />}
            onClick={onClearFilters}
            disabled={!hasActiveFilters || loading}
            block
          >
            Clear Filters
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default AuditLogFilters;
