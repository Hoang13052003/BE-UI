// filepath: d:\labsparkmind\BE-UI\src\components\Admin\MilestoneDetailsDisplay.tsx
import React, { useState, useEffect } from 'react';
import { List, Typography, Spin, Alert, Tag, Space, Row, Col } from 'antd';
import { CalendarOutlined, FlagOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getMilestonesByProjectIdApi } from '../../api/milestoneApi';
import { Milestone, MilestoneStatus } from '../../types/milestone';

const { Text, Title } = Typography;

interface MilestoneDetailsDisplayProps {
  projectId: number;
}

const MilestoneDetailsDisplay: React.FC<MilestoneDetailsDisplayProps> = ({ projectId }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      if (!projectId) {
        setLoading(false);
        setError("Invalid Project ID provided.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getMilestonesByProjectIdApi(projectId);
        setMilestones(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(`Failed to fetch milestones for project ${projectId}:`, err);
        setError(err.response?.data?.message || 'Failed to load milestone details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  // Chuyển đổi định dạng ngày từ ISO string sang định dạng dễ đọc
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to get status color, handles null status
  const getMilestoneStatusColor = (status: MilestoneStatus | null): string => {
    if (!status) return 'default';
    
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'processing';
      case 'PENDING': return 'default';
      case 'DELAYED': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  // Function to get icon based on status
  const getStatusIcon = (status: MilestoneStatus | null) => {
    if (!status) return null;
    
    switch (status.toUpperCase()) {
      case 'COMPLETED': return <CheckCircleOutlined />;
      case 'IN_PROGRESS': return <ClockCircleOutlined />;
      case 'PENDING': return <FlagOutlined />;
      default: return null;
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  if (!Array.isArray(milestones) || milestones.length === 0) {
    return <Text type="secondary">No milestones found for this project.</Text>;
  }

  // Cải thiện thiết kế: Phương án 1 - Dùng List với layout tốt hơn
  return (
    <List
      className="milestone-list"
      itemLayout="horizontal"
      dataSource={milestones}
      renderItem={(item) => (
        <List.Item
          key={item.id}
          className="milestone-item"
          style={{
            padding: '16px',
            borderRadius: '6px',
            background: '#fafafa',
            marginBottom: '8px',
            border: '1px solid #f0f0f0'
          }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            {/* Cột bên trái: Tiêu đề và mô tả */}
            <Col xs={24} sm={16} md={18}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: '16px' }}>
                  {item.title || 'Untitled Milestone'}
                </Text>
                
                {item.description && (
                  <Text type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
                    {item.description}
                  </Text>
                )}
              </Space>
            </Col>
            
            {/* Cột bên phải: Status và thông tin ngày tháng */}
            <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
              <Space direction="vertical" size={8} align="end">
                {item.status && (
                  <Tag 
                    color={getMilestoneStatusColor(item.status)}
                    icon={getStatusIcon(item.status)}
                    style={{ padding: '2px 8px', fontSize: '13px' }}
                  >
                    {item.status}
                  </Tag>
                )}
                
                <Space direction="vertical" size={2} style={{ fontSize: '12px' }}>
                  {item.startDate && (
                    <Space size={4}>
                      <CalendarOutlined /> 
                      <Text type="secondary">Start: {formatDate(item.startDate)}</Text>
                    </Space>
                  )}
                  
                  {item.endDate && (
                    <Space size={4}>
                      <CalendarOutlined />
                      <Text type="secondary">Due: {formatDate(item.endDate)}</Text>
                    </Space>
                  )}
                </Space>
              </Space>
            </Col>
          </Row>
        </List.Item>
      )}
    />
  );
};

export default MilestoneDetailsDisplay;