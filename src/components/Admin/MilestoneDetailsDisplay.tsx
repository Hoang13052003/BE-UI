// filepath: d:\labsparkmind\BE-UI\src\components\Admin\MilestoneDetailsDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { List, Typography, Spin, Alert, Tag, Space, Row, Col, Button, Popconfirm, message, Pagination, Card, Empty, Statistic } from 'antd';
import {
  CalendarOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import {
  getMilestonesByProjectIdApi,
  deleteMilestoneApi
} from '../../api/milestoneApi';
import { Milestone, MilestoneStatus } from '../../types/milestone';
import MilestoneInfo from './MilestoneDetailsDisplay/MilestoneInfo';

const { Text, Title } = Typography;

interface MilestoneDetailsDisplayProps {
  projectId: number;
  onAddMilestone: (onSuccessRefresh?: () => void) => void;
  onEditMilestone?: (milestoneId: number, projectId: number, onSuccessRefresh?: () => void) => void; // Làm optional
  milestoneCount?: number;
  theme?: string;
  onRefreshProgress?: () => void; // Thêm callback để refresh progress
}

const MilestoneDetailsDisplay: React.FC<MilestoneDetailsDisplayProps> = ({
  projectId,
  onAddMilestone,
  onEditMilestone, // Nhận prop (giờ là optional)
  theme = 'light',
  onRefreshProgress, // Thêm prop mới
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);  const [totalItems, setTotalItems] = useState(0);  // Helper function to check if milestone is completed
  const isMilestoneCompleted = (milestone: Milestone): boolean => {
    return milestone.completionDate !== null && 
           milestone.completionDate !== undefined && 
           milestone.completionDate !== '';
  };

  // Helper function to check if milestone is overdue
  const isOverdueMilestone = (milestone: Milestone): boolean => {
    if (!milestone.deadlineDate) return false;
    
    const deadlineDate = new Date(milestone.deadlineDate);
    
    // Determine if milestone is completed based on completionDate existence
    // Handle both null and undefined cases
    const isCompleted = isMilestoneCompleted(milestone);
    
    if (isCompleted) {
      // For completed milestones, only check if they completed after deadline
      const completionDate = new Date(milestone.completionDate!);
      const deadlineEndOfDay = new Date(deadlineDate);
      deadlineEndOfDay.setHours(23, 59, 59, 999);
      
      return completionDate > deadlineEndOfDay;
    } else {
      // For uncompleted milestones, check if current date is past deadline
      const currentDate = new Date();
      const deadlineEndOfDay = new Date(deadlineDate);
      deadlineEndOfDay.setHours(23, 59, 59, 999);
      
      return currentDate > deadlineEndOfDay;
    }
  };
  // Helper function to calculate days overdue
  const getOverdueDays = (milestone: Milestone): number => {
    if (!milestone.deadlineDate || !isOverdueMilestone(milestone)) return 0;
    
    const deadlineDate = new Date(milestone.deadlineDate);
    let comparisonDate: Date;
    
    if (isMilestoneCompleted(milestone)) {
      comparisonDate = new Date(milestone.completionDate!);
    } else {
      comparisonDate = new Date();
    }
    
    // Reset times to start of day for accurate day calculation
    const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    const comparisonDay = new Date(comparisonDate.getFullYear(), comparisonDate.getMonth(), comparisonDate.getDate());
    
    const diffTime = comparisonDay.getTime() - deadlineDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
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
      console.log('Milestone pagination data:', { 
        milestoneData: milestoneData?.length || 0, 
        totalItems, 
        currentPage, 
        pageSize 
      });
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
  }, [fetchMilestones]);  // Calculate statistics
  const calculateStats = () => {
    const total = milestones.length;
    // Use helper function to determine if milestone is completed
    const completed = milestones.filter(m => isMilestoneCompleted(m)).length;
    const inProgress = milestones.filter(m => !isMilestoneCompleted(m) && m.status === 'SENT').length;
    const pending = milestones.filter(m => !isMilestoneCompleted(m) && m.status === 'NEW').length;
      // Fixed overdue logic: check both completed late and not completed but past deadline
    const overdue = milestones.filter(m => isOverdueMilestone(m)).length;
    
    return { total, completed, inProgress, pending, overdue };
  };

  const stats = calculateStats();

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };
  const handleDeleteMilestone = async (milestoneId: number) => {
    try {
      await deleteMilestoneApi(milestoneId);
      message.success('Milestone deleted successfully');
      fetchMilestones();
      // Refresh progress overview after deleting milestone
      if (onRefreshProgress) onRefreshProgress();
    } catch (err: any) {
      console.error(`Error deleting milestone ${milestoneId}:`, err);
      message.error(err.response?.data?.message || 'Failed to delete milestone');
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getMilestoneStatusColor = (status: MilestoneStatus | null | undefined): string => {
    if (!status) return 'default';

    switch (String(status).toUpperCase()) {
      case 'NEW': return 'blue';
      case 'SENT': return 'orange';
      case 'REVIEWED': return 'green';
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
  const getMilestoneCardStyle = (item: Milestone): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      marginBottom: '16px',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      width: '100%',
    };    if (isMilestoneCompleted(item) && !isOverdueMilestone(item)) {
      // Completed on time - green
      return {
        ...baseStyle,
        background: theme === 'dark' ? '#162312' : '#f6ffed',
        border: `2px solid ${theme === 'dark' ? '#389e0d' : '#52c41a'}`,
        boxShadow: theme === 'dark' 
          ? '0 2px 8px rgba(82, 196, 26, 0.15)' 
          : '0 2px 8px rgba(82, 196, 26, 0.1)',
      };
    }

    const isOverdue = isOverdueMilestone(item);

    if (isOverdue) {
      if (isMilestoneCompleted(item)) {
        // Completed late - orange/yellow
        return {
          ...baseStyle,
          background: theme === 'dark' ? '#1d1a0f' : '#fffbe6',
          border: `2px solid ${theme === 'dark' ? '#d48806' : '#faad14'}`,
          boxShadow: theme === 'dark' 
            ? '0 2px 8px rgba(250, 173, 20, 0.15)' 
            : '0 2px 8px rgba(250, 173, 20, 0.1)',
        };
      } else {
        // Not completed and overdue - red
        return {
          ...baseStyle,
          background: theme === 'dark' ? '#1f1f1f' : '#ffffff', 
          border: `2px solid ${theme === 'dark' ? '#cf1322' : '#ff7875'}`, 
          boxShadow: theme === 'dark' 
            ? '0 2px 8px rgba(255, 77, 79, 0.15)' 
            : '0 2px 8px rgba(255, 77, 79, 0.1)',
        };
      }
    }

    return {
      ...baseStyle,
      background: theme === 'dark' ? '#1f1f1f' : '#ffffff',
      border: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
      boxShadow: theme === 'dark' 
        ? '0 2px 8px rgba(255,255,255,0.05)' 
        : '0 2px 8px rgba(0,0,0,0.06)',
    };
  };

  if (loading && milestones.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '12px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">Loading milestones...</Text>
        </div>
      </Card>
    );
  }

  if (error && milestones.length === 0) {
    return (
      <Alert 
        message="Error Loading Milestones" 
        description={error} 
        type="error" 
        showIcon 
        style={{ borderRadius: '8px' }}
      />
    );
  }

  return (
    <div>
      {/* Header Section */}
      <Card        style={{ 
          marginBottom: '20px',
          borderRadius: '12px',
          background: theme === 'dark' ? '#1f1f1f' : '#fafafa'
        }}
        styles={{ body: { padding: '20px' } }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#262626' }}>
                <TrophyOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                Project Milestones
              </Title>
              <Text type="secondary">Track and manage project deliverables</Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onAddMilestone(fetchMilestones)}
              style={{ borderRadius: '6px' }}
            >
              Add Milestone
            </Button>
          </Col>
        </Row>

        {/* Statistics Cards */}
        {milestones.length > 0 && (
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col xs={12} sm={6}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center',
                  background: theme === 'dark' ? '#262626' : '#fff',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                <Statistic
                  title="Total"
                  value={stats.total}
                  valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center',
                  background: theme === 'dark' ? '#262626' : '#fff',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                <Statistic
                  title="Completed"
                  value={stats.completed}
                  valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center',
                  background: theme === 'dark' ? '#262626' : '#fff',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                <Statistic
                  title="In Progress"
                  value={stats.inProgress}
                  valueStyle={{ color: '#faad14', fontSize: '20px' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center',
                  background: theme === 'dark' ? '#262626' : '#fff',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                <Statistic
                  title="Overdue"
                  value={stats.overdue}
                  valueStyle={{ color: '#ff4d4f', fontSize: '20px' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}
      </Card>

      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: '16px', borderRadius: '8px' }} 
        />
      )}

      {/* Empty State */}
      {(!Array.isArray(milestones) || milestones.length === 0) && !loading && !error && (
        <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '12px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical">
                <Text type="secondary">No milestones found for this project</Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => onAddMilestone(fetchMilestones)}
                >
                  Create First Milestone
                </Button>
              </Space>
            }
          />
        </Card>
      )}

      {/* Milestone List */}
      {Array.isArray(milestones) && milestones.length > 0 && (
        <>
          <List
            className="milestone-list"
            itemLayout="horizontal"
            dataSource={milestones}
            loading={loading && milestones.length > 0}            renderItem={(item) => {              
              return (
                <List.Item style={{ padding: 0, border: 'none' }}>                  <Card
                    style={getMilestoneCardStyle(item)}
                    styles={{ body: { padding: '20px' } }}
                    hoverable
                  >
                    <Row gutter={[16, 16]} align="middle">
                      <Col flex="auto">
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                          {/* Milestone Header */}
                          <Row justify="space-between" align="middle">
                            <Col>
                              <Space size={8}>
                                <Tag
                                  color={getMilestoneStatusColor(item.status)}
                                  icon={getStatusIcon(item.status)}
                                  style={{ 
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    border: 'none'
                                  }}
                                >                                  {item.status ? String(item.status).replace('_', ' ') : 'Not set'}
                                </Tag>                                {isMilestoneCompleted(item) && !isOverdueMilestone(item) && (
                                  <Tag color="green" style={{ borderRadius: '12px', border: 'none' }}>
                                    <CheckCircleOutlined /> Completed
                                  </Tag>
                                )}
                                {isOverdueMilestone(item) && (
                                  <Tag 
                                    color={isMilestoneCompleted(item) ? "orange" : "red"} 
                                    style={{ borderRadius: '12px', border: 'none' }}
                                  >
                                    <ExclamationCircleOutlined /> 
                                    {isMilestoneCompleted(item) ? 'Completed Late' : 'Overdue'}
                                    {getOverdueDays(item) > 0 && ` (${getOverdueDays(item)} day${getOverdueDays(item) > 1 ? 's' : ''})`}
                                  </Tag>
                                )}
                              </Space>
                            </Col>
                            <Col>
                              <Space size="small">
                                {/* Chỉ hiển thị nút Edit nếu onEditMilestone được truyền vào */}
                                {onEditMilestone && (
                                  <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => onEditMilestone(item.id, projectId, fetchMilestones)}
                                    style={{ borderRadius: '4px' }}
                                    size="small"
                                  >
                                    Edit
                                  </Button>
                                )}
                                <Popconfirm
                                  title="Delete Milestone"
                                  description="Are you sure you want to delete this milestone?"
                                  onConfirm={() => handleDeleteMilestone(item.id)}
                                  okText="Delete"
                                  cancelText="Cancel"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button 
                                    type="text" 
                                    icon={<DeleteOutlined />} 
                                    danger 
                                    size="small"
                                    style={{ borderRadius: '4px' }}
                                  >
                                    Delete
                                  </Button>
                                </Popconfirm>
                              </Space>
                            </Col>
                          </Row>

                          {/* Milestone Info */}                          <MilestoneInfo
                            name={item.name || ''}
                            description={item.description}
                            notes={item.notes}
                            completed={isMilestoneCompleted(item)}
                            completionPercentage={item.completionPercentage}
                          />

                          {/* Date Information */}
                          <Row gutter={[24, 8]}>
                            <Col xs={24} sm={8}>
                              <Space size={4}>
                                <CalendarOutlined style={{ color: '#52c41a' }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>Start:</Text>
                                <Text style={{ fontSize: '12px' }}>{formatDate(item.startDate)}</Text>
                              </Space>
                            </Col>                            <Col xs={24} sm={8}>
                              <Space size={4}>
                                <CalendarOutlined style={{ 
                                  color: isOverdueMilestone(item) 
                                    ? (isMilestoneCompleted(item) ? '#faad14' : '#ff4d4f') 
                                    : '#faad14' 
                                }} />
                                <Text type="secondary" style={{ fontSize: '12px' }}>Due:</Text>
                                <Text style={{ 
                                  fontSize: '12px', 
                                  color: isOverdueMilestone(item) 
                                    ? (isMilestoneCompleted(item) ? '#faad14' : '#ff4d4f') 
                                    : undefined 
                                }}>
                                  {formatDate(item.deadlineDate)}
                                </Text>
                              </Space>
                            </Col>
                            <Col xs={24} sm={8}>                              <Space size={4}>
                                {isMilestoneCompleted(item) ? (
                                  <>
                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Completed:</Text>
                                    <Text style={{ fontSize: '12px' }}>{formatDate(item.completionDate)}</Text>
                                  </>
                                ) : (
                                  <>
                                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Status: In Progress</Text>
                                  </>
                                )}
                              </Space>
                            </Col>
                          </Row>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              );
            }}
          />          {/* Pagination and Summary */}
          <Card style={{ borderRadius: '12px', marginTop: '16px' }} styles={{ body: { padding: '16px' } }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={4}>
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    Showing {Math.min((currentPage * pageSize) + 1, totalItems)}-{Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} milestones
                  </Text>
                  {totalItems > pageSize && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Page {currentPage + 1} of {Math.ceil(totalItems / pageSize)}
                    </Text>
                  )}
                </Space>
              </Col>
              <Col>
                {totalItems > pageSize && (
                  <Pagination
                    current={currentPage + 1}
                    pageSize={pageSize}
                    total={totalItems}
                    onChange={handlePageChange}
                    showSizeChanger
                    onShowSizeChange={handlePageSizeChange}
                    pageSizeOptions={['5', '10', '20', '50']}
                    showQuickJumper
                    size="small"
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} of ${total}`
                    }
                  />
                )}
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default MilestoneDetailsDisplay;