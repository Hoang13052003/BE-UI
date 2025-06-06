// src/components/AuditLogDashboard/AuditLogStats.tsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import { 
  SafetyCertificateOutlined, 
  ExclamationCircleOutlined, 
  WarningOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BugOutlined
} from '@ant-design/icons';
import { AuditLogStats } from '../../types/auditLog';
import { auditLogApi } from '../../api/auditLogApi';

interface AuditLogStatsProps {
  refreshTrigger?: number; // Trigger để refresh data từ bên ngoài
}

const AuditLogStatsComponent: React.FC<AuditLogStatsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await auditLogApi.getAuditLogStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching audit log stats:', err);
      setError('Failed to load audit log statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card title="Audit Log Statistics" style={{ marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Audit Log Statistics" style={{ marginBottom: 16 }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={fetchStats} style={{ border: 'none', background: 'none', color: '#1890ff', cursor: 'pointer' }}>
              Retry
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <Card title="Audit Log Statistics" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Statistic
            title="24h Total"
            value={stats?.totalLogs24h || 0}
            prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        
        <Col xs={12} sm={8} md={6} lg={4}>
          <Statistic
            title="Week Total"
            value={stats?.totalLogsWeek || 0}
            prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>

        <Col xs={12} sm={8} md={6} lg={4}>
          <Statistic
            title="Critical (24h)"
            value={stats?.criticalLogs24h || 0}
            prefix={<SafetyCertificateOutlined style={{ color: '#ff4d4f' }} />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Col>

        <Col xs={12} sm={8} md={6} lg={4}>
          <Statistic
            title="Errors (24h)"
            value={stats?.errorLogs24h || 0}
            prefix={<ExclamationCircleOutlined style={{ color: '#ff7875' }} />}
            valueStyle={{ color: '#ff7875' }}
          />
        </Col>

        <Col xs={12} sm={8} md={6} lg={4}>
          <Statistic
            title="Warnings (24h)"
            value={stats?.warningLogs24h || 0}
            prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Col>

        <Col xs={12} sm={8} md={6} lg={4}>
          <Statistic
            title="Debug Mode"
            value={stats ? 'Active' : 'N/A'}
            prefix={<BugOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
      </Row>

      {/* Category and Severity Breakdown */}
      {stats && (stats.categoryBreakdown || stats.severityBreakdown) && (
        <Row gutter={16} style={{ marginTop: 24 }}>
          {stats.categoryBreakdown && (
            <Col xs={24} lg={12}>
              <Card size="small" title="Category Breakdown" style={{ height: '100%' }}>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                    <div key={category} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '4px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>{category.toLowerCase().replace('_', ' ')}</span>
                      <span style={{ fontWeight: 500 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          )}

          {stats.severityBreakdown && (
            <Col xs={24} lg={12}>
              <Card size="small" title="Severity Breakdown" style={{ height: '100%' }}>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {Object.entries(stats.severityBreakdown).map(([severity, count]) => (
                    <div key={severity} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '4px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>{severity.toLowerCase()}</span>
                      <span style={{ fontWeight: 500 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </Card>
  );
};

export default AuditLogStatsComponent;
