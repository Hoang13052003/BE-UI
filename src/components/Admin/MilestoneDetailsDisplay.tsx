// filepath: d:\labsparkmind\BE-UI\src\components\Admin\MilestoneDetailsDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Spin, Alert, Tag, Space, Row, Col, Button, Popconfirm, message, Pagination, Card, Empty, Statistic, Table, Progress } from 'antd';
import {
  CalendarOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  SettingOutlined,
  CloseOutlined,
  SaveOutlined,
  DeleteFilled
} from '@ant-design/icons';
import {
  getMilestonesByProjectIdApi,
  deleteMilestoneApi,
  batchDeleteMilestonesApi
} from '../../api/milestoneApi';
import { Milestone, MilestoneStatus } from '../../types/milestone';
import { useInlineEditMilestone } from '../../hooks/useInlineEditMilestone';
import { createInlineEditMilestoneColumns } from './InlineEditMilestoneColumns';

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
}) => {  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Bulk edit states
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchDeleting, setBatchDeleting] = useState<boolean>(false);
  const [isInBatchMode, setIsInBatchMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card'); // New state for view mode

  // INLINE EDIT HOOK
  const {
    editedData,
    batchSaving,
    hasUnsavedChanges,
    handleInlineEdit,
    handleBatchSave,
    handleMarkSelectedAsCompleted,
    resetEditedData,
  } = useInlineEditMilestone({
    milestones,
    setMilestones,
    onRefreshData: () => {
      fetchMilestones();
      // Refresh progress overview after inline edit
      if (onRefreshProgress) onRefreshProgress();
    },
  });

  // Helper function to check if milestone is completed
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

  const handleToggleBatchMode = () => {
    setIsInBatchMode(!isInBatchMode);
    if (isInBatchMode) {
      setSelectedRowKeys([]);
      resetEditedData();
      setViewMode('card');
    } else {
      setViewMode('table');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.info('Please select milestones to delete.');
      return;
    }
    const idsToDelete = selectedRowKeys.map(key => Number(key));
    setBatchDeleting(true);
    try {
      await batchDeleteMilestonesApi(idsToDelete);
      message.success(`${selectedRowKeys.length} milestone(s) deleted successfully!`);
      setSelectedRowKeys([]);
      setIsInBatchMode(false);
      setViewMode('card');
      fetchMilestones();
      // Refresh progress overview after batch delete
      if (onRefreshProgress) onRefreshProgress();
    } catch (err) {
      console.error('Error batch deleting milestones:', err);
      if (err instanceof Error && err.message) {
        message.error(err.message);
      } else {
        message.error('Failed to delete selected milestones.');
      }
    } finally {
      setBatchDeleting(false);
    }
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
    }  };

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
    <div>      {/* Header Section */}
      <Card
        style={{ 
          marginBottom: '16px',
          borderRadius: '12px',
          background: theme === 'dark' ? '#1f1f1f' : '#fafafa'
        }}
        styles={{ body: { padding: '18px' } }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: '12px' }}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#262626' }}>
                <TrophyOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                Project Milestones
                {isInBatchMode && <Tag color="processing">Batch Mode</Tag>}
                {hasUnsavedChanges && <Tag color="warning">Unsaved Changes</Tag>}
              </Title>
              <Text type="secondary">
                {isInBatchMode ? 'Click directly on fields to edit, select items for batch actions' : 'Track and manage project deliverables'}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              {/* BATCH MODE ACTIONS */}
              {isInBatchMode && (
                <>
                  {hasUnsavedChanges && (
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleBatchSave}
                      loading={batchSaving}
                      disabled={batchDeleting}
                    >
                      Save Changes ({Object.keys(editedData).length})
                    </Button>
                  )}
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleMarkSelectedAsCompleted(selectedRowKeys)}
                    disabled={batchSaving || selectedRowKeys.length === 0}
                    loading={batchSaving}
                  >
                    Mark as Completed ({selectedRowKeys.length})
                  </Button>
                  <Popconfirm
                    title={`Delete ${selectedRowKeys.length} selected item(s)?`}
                    description="This action cannot be undone."
                    onConfirm={handleBatchDelete}
                    disabled={selectedRowKeys.length === 0 || batchDeleting || batchSaving}
                    okButtonProps={{ danger: true, loading: batchDeleting }}
                    okText="Yes, Delete"
                    cancelText="No"
                  >
                    <Button
                      danger
                      icon={<DeleteFilled />}
                      disabled={selectedRowKeys.length === 0 || batchDeleting || batchSaving}
                      loading={batchDeleting}
                    >
                      Delete Selected ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>
                  <Button 
                    icon={<CloseOutlined />}
                    onClick={handleToggleBatchMode}
                    disabled={batchSaving || batchDeleting}
                  >
                    Exit Batch Mode
                  </Button>
                </>
              )}

              {!isInBatchMode && milestones.length > 0 && (
                <Button 
                  icon={<SettingOutlined />}
                  onClick={handleToggleBatchMode}
                  loading={loading}
                >
                  Enter Batch Mode
                </Button>
              )}
              
              {/* NORMAL MODE ACTIONS */}
              {!isInBatchMode && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => onAddMilestone(fetchMilestones)}
                  style={{ borderRadius: '6px' }}
                >
                  Add Milestone
                </Button>
              )}

              {selectedRowKeys.length > 0 && (
                 <Text type="secondary" style={{ marginLeft: 8 }}> ({selectedRowKeys.length} item(s) selected)</Text>
              )}
            </Space>
          </Col>
        </Row>        {/* Statistics Cards */}
        {milestones.length > 0 && (
          <Row gutter={16} style={{ marginBottom: '12px' }}>
            <Col xs={12} sm={6}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center',
                  background: theme === 'dark' ? '#262626' : '#fff',
                  border: 'none',
                  borderRadius: '8px'
                }}
                styles={{ body: { padding: '10px' } }}
              >
                <Statistic
                  title="Total"
                  value={stats.total}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
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
                styles={{ body: { padding: '10px' } }}
              >
                <Statistic
                  title="Completed"
                  value={stats.completed}
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
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
                styles={{ body: { padding: '10px' } }}
              >
                <Statistic
                  title="In Progress"
                  value={stats.inProgress}
                  valueStyle={{ color: '#faad14', fontSize: '18px' }}
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
                styles={{ body: { padding: '10px' } }}
              >
                <Statistic
                  title="Overdue"
                  value={stats.overdue}
                  valueStyle={{ color: '#ff4d4f', fontSize: '18px' }}
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
      )}      {/* Milestone List */}
      {Array.isArray(milestones) && milestones.length > 0 && (
        <>
          {viewMode === 'table' && isInBatchMode ? (
            // Table view for batch editing
            <Card style={{ borderRadius: '12px' }} styles={{ body: { padding: '0' } }}>              <Table
                rowKey="id"
                dataSource={milestones}
                columns={createInlineEditMilestoneColumns({
                  isInBatchMode,
                  isAdmin: true,
                  editedData,
                  batchSaving,
                  batchDeleting,
                  onInlineEdit: handleInlineEdit,
                })}
                loading={loading || batchDeleting || batchSaving}
                pagination={false}
                rowSelection={{
                  selectedRowKeys,
                  onChange: (keys: React.Key[]) => { setSelectedRowKeys(keys); },
                }}
                size="small"
                bordered
              />
              {totalItems > 0 && (
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`, background: theme === 'dark' ? '#1a1a1a' : '#fafafa' }}>
                  <Row justify="end">
                    <Pagination
                      current={currentPage + 1}
                      pageSize={pageSize}
                      total={totalItems}
                      onChange={handlePageChange}
                      showSizeChanger
                      onShowSizeChange={handlePageSizeChange}
                      pageSizeOptions={['5', '10', '20', '50']}
                      showTotal={(total, range) => <Text type="secondary">{range[0]}-{range[1]} of {total} entries</Text>}
                      style={{ margin: 0 }}
                    />
                  </Row>
                </div>
              )}            </Card>
          ) : (
            // Table view (default) - Clean table layout như timelog
            <Card style={{ borderRadius: '12px' }} styles={{ body: { padding: '0' } }}>
              <Table
                rowKey="id"
                dataSource={milestones}
                loading={loading && milestones.length > 0}
                pagination={false}
                size="middle"                columns={[
                  {
                    title: 'Milestone Name',
                    dataIndex: 'name',
                    key: 'name',                    render: (text: string) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FlagOutlined style={{ color: '#1890ff' }} />
                        <Text strong>{text || 'Untitled Milestone'}</Text>
                      </div>
                    ),
                  },                  {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                    ellipsis: true,
                    render: (text: string) => (
                      <Text>{text || '-'}</Text>
                    ),
                  },
                  {
                    title: 'Notes',
                    dataIndex: 'notes',
                    key: 'notes',
                    ellipsis: true,
                    width: 150,
                    render: (text: string) => (
                      text ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Text style={{ color: '#666' }}>
                            📝 {text}
                          </Text>
                        </div>
                      ) : (
                        <Text style={{ color: '#ccc' }}>-</Text>
                      )
                    ),
                  },
                  {
                    title: 'Progress',
                    dataIndex: 'completionPercentage',
                    key: 'progress',
                    width: 120,
                    render: (percent: number) => (
                      <Progress
                        percent={percent || 0}
                        status={percent === 100 ? 'success' : 'active'}
                        strokeColor={percent === 100 ? '#52c41a' : '#1890ff'}
                      />
                    ),
                  },                  {
                    title: 'Start Date',
                    dataIndex: 'startDate',
                    key: 'startDate',
                    width: 120,
                    render: (date: string) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined style={{ color: '#52c41a' }} />
                        <Text>{formatDate(date)}</Text>
                      </div>
                    ),
                  },
                  {
                    title: 'Due Date',
                    dataIndex: 'deadlineDate',
                    key: 'deadlineDate',
                    width: 120,
                    render: (date: string, record: Milestone) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ClockCircleOutlined style={{ 
                          color: isOverdueMilestone(record) ? '#ff4d4f' : '#faad14'
                        }} />
                        <Text style={{ 
                          color: isOverdueMilestone(record) ? '#ff4d4f' : undefined
                        }}>{formatDate(date)}</Text>
                      </div>
                    ),
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    width: 100,
                    render: (status: MilestoneStatus, record: Milestone) => (                      <Space direction="vertical" size={2}>
                        <Tag
                          color={getMilestoneStatusColor(status)}
                          style={{ 
                            padding: '2px 8px',
                            borderRadius: '12px',
                            margin: 0
                          }}
                        >
                          {status ? String(status).replace('_', ' ') : 'New'}
                        </Tag>
                        {isMilestoneCompleted(record) && !isOverdueMilestone(record) && (
                          <Tag color="success" style={{ padding: '1px 4px', borderRadius: '8px', margin: 0 }}>
                            Done
                          </Tag>
                        )}
                        {isOverdueMilestone(record) && (
                          <Tag 
                            color={isMilestoneCompleted(record) ? "warning" : "error"} 
                            style={{ padding: '1px 4px', borderRadius: '8px', margin: 0 }}
                          >
                            {isMilestoneCompleted(record) ? 'Late' : 'Overdue'}
                          </Tag>
                        )}
                      </Space>
                    ),
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    width: 80,
                    render: (_, record: Milestone) => (
                      <Space size="small">
                        {onEditMilestone && (
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEditMilestone(record.id, projectId, fetchMilestones)}
                            size="small"
                          />
                        )}
                        <Popconfirm
                          title="Delete this milestone?"
                          onConfirm={() => handleDeleteMilestone(record.id)}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button 
                            type="text" 
                            icon={<DeleteOutlined />} 
                            danger 
                            size="small"
                          />
                        </Popconfirm>
                      </Space>
                    ),
                  },                ]}
              />
              {totalItems > pageSize && (
                <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`, background: theme === 'dark' ? '#1a1a1a' : '#fafafa' }}>
                  <Row justify="end">
                    <Pagination
                      current={currentPage + 1}
                      pageSize={pageSize}
                      total={totalItems}
                      onChange={handlePageChange}
                      showSizeChanger
                      onShowSizeChange={handlePageSizeChange}
                      pageSizeOptions={['5', '10', '20', '50']}
                      showTotal={(total, range) => <Text type="secondary">{range[0]}-{range[1]} of {total} entries</Text>}
                      style={{ margin: 0 }}
                    />
                  </Row>                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default MilestoneDetailsDisplay;