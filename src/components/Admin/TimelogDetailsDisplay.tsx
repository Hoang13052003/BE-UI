import React, { useState, useEffect, useCallback } from 'react';
import { List, Typography, Spin, Alert, Space, Row, Col, Button, Popconfirm, message, Pagination } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
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
}

const TimelogDetailsDisplay: React.FC<TimelogDetailsDisplayProps> = ({
  projectId,
  users = []
}) => {
  const [timelogs, setTimelogs] = useState<TimeLogResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTimelog, setEditingTimelog] = useState<TimeLogResponse | null>(null);

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

  const formatDate = (dateString: string): string => {
    try {
      return dayjs(dateString).format('MMMM D, YYYY');
    } catch (e) {
      return 'Invalid date';
    }
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

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const handleUploadError = useCallback(() => {
    fetchTimelogs();
  }, [fetchTimelogs]);

  if (loading && timelogs.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
  }

  if (error) {
    return <Alert message="Error Loading Timelogs" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ position: 'relative' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={5}>Project Time Tracking</Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Add Time Log
            </Button>
          </Space>
        </Col>
      </Row>
      <div style={{ marginBottom: '34px', marginTop: '8px' }}>
        <FileDropUpload
          projectId={projectId}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          width="100%"
        />
      </div>

      {/* Nội dung hiện tại của bạn: danh sách timelogs, phân trang, modals */}
      {timelogs.length === 0 && !loading && (
        <Text type="secondary">No time entries found for this project. Click "Add Time Log" to create one.</Text>
      )}

      {timelogs.length > 0 && (
        <>
          <List
            className="timelog-list"
            itemLayout="horizontal"
            dataSource={timelogs}
            loading={loading}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  marginBottom: '8px',
                  border: '1px solid #f0f0f0',
                  transition: 'background 0.3s ease'
                }}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEditTimeLog(item.id)}
                  >
                    Edit
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Bạn có chắc muốn xóa bản ghi này?"
                    onConfirm={() => handleDeleteTimeLog(item.id)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button type="text" icon={<DeleteOutlined />} danger size="small">
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{item.taskDescription}</Text>}
                  description={
                    <Space direction="vertical" size={2}>
                      <Row>
                        <Col xs={24} md={12}>
                          <Space>
                            <UserOutlined />
                            <Text type="secondary">{item.performerFullName}</Text>
                          </Space>
                        </Col>
                        <Col xs={24} md={12}>
                          <Space>
                            <ClockCircleOutlined />
                            <Text type="secondary">{item.hoursSpent} hours</Text>
                          </Space>
                        </Col>
                      </Row>
                      <Space>
                        <CalendarOutlined />
                        <Text type="secondary">{formatDate(item.taskDate)}</Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />

          {totalItems > 0 && (
            <Row justify="end" style={{ marginTop: 16 }}>
              <Pagination
                current={currentPage + 1}
                pageSize={pageSize}
                total={totalItems}
                onChange={handlePageChange}
                showSizeChanger
                onShowSizeChange={handlePageSizeChange}
                pageSizeOptions={['5', '10', '20', '50']}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
              />
            </Row>
          )}
        </>
      )}

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