// src/components/AuditLogDashboard/UserActivityPanel.tsx
import React, { useEffect, useState } from 'react';
import { Card, List, Avatar, Spin, Alert, Tag } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { UserActivitySummary } from '../../types/auditLog';
import { auditLogApi } from '../../api/auditLogApi';

interface UserActivityPanelProps {
  refreshTrigger?: number;
  limit?: number;
}

const UserActivityPanel: React.FC<UserActivityPanelProps> = ({ 
  refreshTrigger, 
  limit = 10 
}) => {
  const [users, setUsers] = useState<UserActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await auditLogApi.getTopActiveUsers(limit);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching top active users:', err);
      setError('Failed to load user activity data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUsers();
  }, [refreshTrigger, limit]);

  const getActivityColor = (count: number) => {
    if (count > 100) return '#ff4d4f';
    if (count > 50) return '#fa8c16';
    if (count > 20) return '#1890ff';
    return '#52c41a';
  };

  if (loading) {
    return (
      <Card title="Top Active Users" style={{ marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Top Active Users" style={{ marginBottom: 16 }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={fetchTopUsers} style={{ border: 'none', background: 'none', color: '#1890ff', cursor: 'pointer' }}>
              Retry
            </button>
          }
        />
      </Card>
    );
  }

  return (
    <Card 
      title="Top Active Users" 
      style={{ marginBottom: 16 }}
      extra={
        <Tag color="blue">
          {users.length} users
        </Tag>
      }
    >
      <List
        dataSource={users}
        renderItem={(user, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: getActivityColor(user.activityCount),
                    fontSize: '16px'
                  }}
                >
                  {index + 1}
                </Avatar>
              }
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>
                    {user.username || 'Unknown User'}
                  </span>
                  <Tag color={getActivityColor(user.activityCount) === '#52c41a' ? 'green' : 
                           getActivityColor(user.activityCount) === '#1890ff' ? 'blue' :
                           getActivityColor(user.activityCount) === '#fa8c16' ? 'orange' : 'red'}>
                    {user.activityCount} actions
                  </Tag>
                </div>
              }
              description={
                <div>
                  {user.lastActivity && (
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      <ClockCircleOutlined style={{ marginRight: '4px' }} />
                      Last activity: {new Date(user.lastActivity).toLocaleString()}
                    </div>
                  )}
                  {user.topActions && user.topActions.length > 0 && (
                    <div style={{ fontSize: '12px' }}>
                      Top actions: {user.topActions.slice(0, 3).join(', ')}
                      {user.topActions.length > 3 && '...'}
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'No user activity data available' }}
        size="small"
        style={{ maxHeight: 400, overflowY: 'auto' }}
      />
    </Card>
  );
};

export default UserActivityPanel;
