// filepath: d:\labsparkmind\BE-UI\src\components\Admin\MilestoneDetailsDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { List, Typography, Spin, Alert, Tag, Space, Row, Col, Button, Popconfirm, message, Pagination } from 'antd';
import {
  CalendarOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import {
  getMilestonesByProjectIdApi,
  deleteMilestoneApi
} from '../../api/milestoneApi';
import { Milestone, MilestoneStatus } from '../../types/milestone';
import MilestoneInfo from './MilestoneDetailsDisplay/MilestoneInfo';

const { Text } = Typography;

interface MilestoneDetailsDisplayProps {
  projectId: number;
  onAddMilestone: (onSuccessRefresh?: () => void) => void;
  onEditMilestone: (milestoneId: number, projectId: number, onSuccessRefresh?: () => void) => void;
}

const MilestoneDetailsDisplay: React.FC<MilestoneDetailsDisplayProps> = ({ projectId, onAddMilestone, onEditMilestone }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchMilestones = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      setError("Invalid Project ID provided.");
      setMilestones([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { milestones: milestoneData, totalItems } = await getMilestonesByProjectIdApi(
        projectId,
        currentPage,
        pageSize
      );
      setMilestones(Array.isArray(milestoneData) ? milestoneData : []);
      setTotalItems(totalItems);
    } catch (err: any) {
      console.error(`Failed to fetch milestones for project ${projectId}:`, err);
      setError(err.response?.data?.message || 'Failed to load milestone details.');
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, currentPage, pageSize]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // Chuyển từ 1-based sang 0-based index
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi kích thước
  };

  const handleDeleteMilestone = async (milestoneId: number) => {
    try {
      await deleteMilestoneApi(milestoneId);
      message.success('Xóa milestone thành công');
      fetchMilestones();
    } catch (err: any) {
      console.error(`Error deleting milestone ${milestoneId}:`, err);
      message.error(err.response?.data?.message || 'Xóa milestone thất bại');
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'emty';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid Date encountered:", dateString);
        return 'emty';
      }
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'emty';
    }
  };

  const getMilestoneStatusColor = (status: MilestoneStatus | null | undefined): string => {
    if (!status) return 'default';

    switch (String(status).toUpperCase()) {
      case 'NEW': return 'processing';
      case 'SENT': return 'blue';
      case 'REVIEWED': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: MilestoneStatus | null | undefined) => {
    if (!status) return null;

    switch (String(status).toUpperCase()) {
      case 'NEW': return <FlagOutlined />;
      case 'SENT': return <ClockCircleOutlined />;
      case 'REVIEWED': return <CheckCircleOutlined />;
      default: return null;
    }
  };

  if (loading && milestones.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
  }

  if (error && milestones.length === 0) {
    return <Alert message="Error Loading Milestones" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onAddMilestone(fetchMilestones)}
          >
            Add Milestone
          </Button>
        </Col>
      </Row>
      {error && <Alert message="Error" description={error} type="error" showIcon style={{marginBottom: 10}} />}

      {(!Array.isArray(milestones) || milestones.length === 0) && !loading && !error && (
        <Text type="secondary">No milestones found for this project. Click "Add Milestone" to create one.</Text>
      )}

      {Array.isArray(milestones) && milestones.length > 0 && (
        <>
          <List
            className="milestone-list"
            itemLayout="horizontal"
            dataSource={milestones}
            loading={loading && milestones.length > 0}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                className={`milestone-item ${item.completed ? 'milestone-completed' : ''}`}
                style={{
                  padding: '16px',
                  borderRadius: '6px',
                  background: item.completed ? '#f6ffed' : '#ffffff',
                  marginBottom: '12px',
                  border: `1px solid ${item.completed ? '#b7eb8f' : '#f0f0f0'}`,
                  transition: 'background 0.3s ease, border 0.3s ease'
                }}
              >
                <Row gutter={[16, 16]} style={{ width: '100%' }} align="middle">                  <Col flex="auto">
                    <MilestoneInfo
                      name={item.name || ''}
                      description={item.description}
                      notes={item.notes}
                      completed={item.completed}
                      completionPercentage={item.completionPercentage}
                    />
                  </Col>

                  <Col xs={24} sm={8} md={7} style={{ textAlign: 'right' }}>
                    <Space direction="vertical" size={8} align="end">
                      {item.id && (
                        <Space size="middle">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEditMilestone(item.id, projectId, fetchMilestones)}
                          >
                            Edit
                          </Button>
                          <Popconfirm
                            title="Bạn có chắc muốn xóa milestone này?"
                            onConfirm={() => handleDeleteMilestone(item.id)}
                            okText="Có"
                            cancelText="Không"
                          >
                            <Button type="text" icon={<DeleteOutlined />} danger>
                              Delete
                            </Button>
                          </Popconfirm>
                        </Space>
                      )}
                      <Tag
                        color={getMilestoneStatusColor(item.status)}
                        icon={getStatusIcon(item.status)}
                        style={{ padding: '2px 8px', fontSize: '13px', margin: 0 }}
                      >
                        {item.status ? String(item.status).replace('_', ' ') : 'emty'}
                      </Tag>
                      <Space direction="vertical" size={4} style={{ fontSize: '12px' }}>
                        <Space size={4}>
                          <CalendarOutlined />
                          <Text type="secondary">Start: {formatDate(item.startDate)}</Text>
                        </Space>
                        <Space size={4}>
                          <CalendarOutlined />
                          <Text type="secondary">Due: {formatDate(item.deadlineDate)}</Text>
                        </Space>
                        <Space size={4}>
                          {item.completionDate ? (
                            <>
                              <CheckCircleOutlined style={{ color: '#52c41a' }} />
                              <Text type="secondary">Completed: {formatDate(item.completionDate)}</Text>
                            </>
                          ) : (
                            <>
                              <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                              <Text type="secondary">Incomplete</Text>
                            </>
                          )}
                        </Space>
                      </Space>
                    </Space>
                  </Col>
                </Row>
              </List.Item>
            )}
          />

          {/* Thêm phân trang */}
          <Row justify="end" style={{ marginTop: 16 }}>
            <Pagination
              current={currentPage + 1} // Chuyển từ 0-based index trong code sang 1-based index cho UI
              pageSize={pageSize}
              total={totalItems}
              onChange={handlePageChange}
              showSizeChanger
              onShowSizeChange={handlePageSizeChange}
              pageSizeOptions={['5', '10', '20', '50']}
              showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            />
          </Row>
        </>
      )}
    </div>
  );
};

export default MilestoneDetailsDisplay;