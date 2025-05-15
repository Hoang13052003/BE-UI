import React, { useState, useEffect } from 'react';
import { List, Typography, Spin, Alert, Space, Row, Col, Button, Popconfirm, message } from 'antd';
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

const { Text, Title } = Typography;

interface TimelogDetailsDisplayProps {
  projectId: number;
  onEditTimeLog?: (timelogId: number) => void;
  users: { id: number; name: string }[]; // Array of users for the dropdown
}

const TimelogDetailsDisplay: React.FC<TimelogDetailsDisplayProps> = ({ 
  projectId, 
  users = [] // Default to empty array if not provided
}) => {
  const [timelogs, setTimelogs] = useState<TimeLogResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTimelog, setEditingTimelog] = useState<TimeLogResponse | null>(null);

  // Fetch timelogs data
  const fetchTimelogs = async () => {
    try {
      setLoading(true);
      const data = await getTimeLogsByProjectIdApi(projectId);
      setTimelogs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load time logs. Please try again later.');
      console.error('Error fetching time logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelogs();
  }, [projectId]);

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return dayjs(dateString).format('MMMM D, YYYY');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Handle delete time log
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

  if (loading && timelogs.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
  }

  if (error) {
    return <Alert message="Error Loading Timelogs" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={5}>Project Time Tracking</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalVisible(true)}
          >
            Add Time Log
          </Button>
        </Col>
      </Row>

      {timelogs.length === 0 && !loading && (
        <Text type="secondary">No time entries found for this project. Click "Add Time Log" to create one.</Text>
      )}

      {timelogs.length > 0 && (
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
      )}

      {/* Add Time Log Modal */}
      <AddTimeLogModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={fetchTimelogs}
        projectId={projectId}
        users={users}
      />

      {/* Edit Time Log Modal */}
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