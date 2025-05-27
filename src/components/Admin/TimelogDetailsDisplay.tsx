import React, { useState, useEffect, useCallback } from 'react';
import { List, Typography, Spin, Alert, Space, Row, Col, Button, Popconfirm, message, Pagination, Card, Tag, Statistic, Empty } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  BarChartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getTimeLogsByProjectIdApi, TimeLogResponse, deleteTimeLogApi } from '../../api/timelogApi';
import AddTimeLogModal from './AddTimeLogModal';
import EditTimeLogModal from './EditTimeLogModal';
import FileDropUpload from '../../components/Admin/FileDropUpload/FileDropUpload';

const { Text, Title } = Typography;

interface TimelogDetailsDisplayProps {
  projectId: number;
  onEditTimeLog?: (timelogId: number) => void;
  users: { id: number; name: string }[];
  theme?: string;
}

const TimelogDetailsDisplay: React.FC<TimelogDetailsDisplayProps> = ({
  projectId,
  users = [],
  theme = 'light'
}) => {
  const [timelogs, setTimelogs] = useState<TimeLogResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTimelog, setEditingTimelog] = useState<TimeLogResponse | null>(null);
  const [showUploadArea, setShowUploadArea] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchTimelogs = useCallback(async () => {
    try {
      setLoading(true);
      const { timelogs: timelogData, totalItems: newTotalItems } = await getTimeLogsByProjectIdApi(
        projectId,
        currentPage,
        pageSize
      );
      setTimelogs(timelogData);
      setTotalItems(newTotalItems);
      setError(null);
    } catch (err) {
      setError('Failed to load time logs. Please try again later.');
      console.error('Error fetching time logs:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, currentPage, pageSize]);

  useEffect(() => {
    fetchTimelogs();
  }, [fetchTimelogs]);

  // Xử lý sự kiện thành công khi upload
  const handleUploadComplete = useCallback(() => {
    // Refresh danh sách timelogs sau khi upload thành công
    fetchTimelogs();
    // Hiển thị toast thành công (nếu muốn thêm)
    message.success('Time logs updated successfully');
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const totalHours = timelogs.reduce((sum, log) => sum + log.hoursSpent, 0);
    const uniqueUsers = new Set(timelogs.map(log => log.performerFullName)).size;
    const thisWeekLogs = timelogs.filter(log => 
      dayjs(log.taskDate).isAfter(dayjs().startOf('week'))
    ).length;
    
    return { totalHours, uniqueUsers, thisWeekLogs };
  };

  const stats = calculateStats();

  const formatDate = (dateString: string): string => {
    try {
      return dayjs(dateString).format('MMM D, YYYY');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getTimeColor = (hours: number) => {
    if (hours >= 8) return '#52c41a'; // Green
    if (hours >= 4) return '#faad14'; // Orange
    return '#1890ff'; // Blue
  };

  const handleDeleteTimeLog = async (timelogId: number) => {
    try {
      await deleteTimeLogApi(timelogId);
      message.success('Xóa bản ghi thành công');
      fetchTimelogs();
    } catch (err) {
      console.error('Error deleting time log:', err);
      message.error('Xóa bản ghi thất bại');
    }
  };

  const handleEditTimeLog = (timelogId: number) => {
    const timelog = timelogs.find(t => t.id === timelogId);
    if (timelog) {
      setEditingTimelog(timelog);
      setIsEditModalVisible(true);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const handleUploadError = useCallback(() => {
    fetchTimelogs();
  }, [fetchTimelogs]);

  if (loading && timelogs.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">Loading time logs...</Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert 
        message="Error Loading Timelogs" 
        description={error} 
        type="error" 
        showIcon 
        style={{ borderRadius: '8px' }}
      />
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Header Section */}
      <Card 
        style={{ 
          marginBottom: '20px',
          borderRadius: '12px',
          background: theme === 'dark' ? '#1f1f1f' : '#fafafa'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#262626' }}>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                Time Tracking
              </Title>
              <Text type="secondary">Monitor and manage project time entries</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="default"
                icon={<UploadOutlined />}
                onClick={() => setShowUploadArea(!showUploadArea)}
                style={{ borderRadius: '6px' }}
              >
                {showUploadArea ? 'Hide Upload' : 'Bulk Upload'}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}
                style={{ borderRadius: '6px' }}
              >
                Add Time Log
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Statistics Cards */}
        {timelogs.length > 0 && (
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={8}>
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
                  title="Total Hours"
                  value={stats.totalHours}
                  suffix="h"
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
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
                  title="Contributors"
                  value={stats.uniqueUsers}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
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
                  title="This Week"
                  value={stats.thisWeekLogs}
                  suffix="entries"
                  valueStyle={{ color: '#faad14' }}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Upload Area */}
        {showUploadArea && (
          <div style={{ 
            marginTop: '16px',
            padding: '16px',
            background: theme === 'dark' ? '#1a1a1a' : '#f9f9f9',
            borderRadius: '8px',
            border: `1px dashed ${theme === 'dark' ? '#434343' : '#d9d9d9'}`
          }}>
            <FileDropUpload
              projectId={projectId}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              width="100%"
            />
          </div>
        )}
      </Card>

      {/* Time Logs List */}
      {timelogs.length === 0 && !loading ? (
        <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '12px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical">
                <Text type="secondary">No time entries found for this project</Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalVisible(true)}
                >
                  Create First Time Log
                </Button>
              </Space>
            }
          />
        </Card>
      ) : (
        <Card style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
          <List
            className="timelog-list"
            itemLayout="horizontal"
            dataSource={timelogs}
            loading={loading}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{
                  padding: '20px',
                  borderBottom: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                className="timelog-item"
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTimeLog(item.id);
                    }}
                    style={{ borderRadius: '4px' }}
                  >
                    Edit
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Delete Time Log"
                    description="Are you sure you want to delete this time log entry?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteTimeLog(item.id);
                    }}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />} 
                      danger 
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                      style={{ borderRadius: '4px' }}
                    >
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong style={{ fontSize: '16px' }}>
                          {item.taskDescription}
                        </Text>
                      </Col>
                      <Col>
                        <Tag 
                          color={getTimeColor(item.hoursSpent)}
                          style={{ 
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          {item.hoursSpent}h
                        </Tag>
                      </Col>
                    </Row>
                  }
                  description={
                    <Row gutter={[16, 8]} style={{ marginTop: '8px' }}>
                      <Col xs={24} sm={12}>
                        <Space>
                          <UserOutlined style={{ color: '#1890ff' }} />
                          <Text type="secondary">{item.performerFullName}</Text>
                        </Space>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Space>
                          <CalendarOutlined style={{ color: '#52c41a' }} />
                          <Text type="secondary">{formatDate(item.taskDate)}</Text>
                        </Space>
                      </Col>
                    </Row>
                  }
                />
              </List.Item>
            )}
          />

          {/* Pagination */}
          {totalItems > 0 && (
            <div style={{ 
              padding: '16px 20px',
              borderTop: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
              background: theme === 'dark' ? '#1a1a1a' : '#fafafa'
            }}>
              <Row justify="end">
                <Pagination
                  current={currentPage + 1}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger
                  onShowSizeChange={handlePageSizeChange}
                  pageSizeOptions={['5', '10', '20', '50']}
                  showTotal={(total, range) => 
                    <Text type="secondary">{range[0]}-{range[1]} of {total} entries</Text>
                  }
                  style={{ margin: 0 }}
                />
              </Row>
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <AddTimeLogModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={fetchTimelogs}
        projectId={projectId}
        users={users}
      />

      <EditTimeLogModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={() => {
          setIsEditModalVisible(false);
          fetchTimelogs();
        }}
        initialValues={editingTimelog}
        projectId={projectId}
        users={users}
      />
    </div>
  );
};

export default TimelogDetailsDisplay;