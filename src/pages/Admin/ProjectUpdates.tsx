import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Tag,
  Typography,
  Space,
  Button,
  Row,
  Spin,
  Alert,
  message
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  PlusOutlined,
  ClockCircleOutlined, // Add ClockCircleOutlined for Timelog
  FlagOutlined // Add FlagOutlined for Milestone
} from '@ant-design/icons';
import { getProjectsApi, deleteProjectApi } from '../../api/projectApi';
import { Project } from '../../types/project';
import AddProjectModal from '../../components/Admin/AddProjectModal';
import EditMilestoneModal from '../../components/Admin/EditMilestoneModal';

const { Text, Title } = Typography;

const ProjectUpdates: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isMilestoneModalVisible, setIsMilestoneModalVisible] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const fetchProjects = useCallback(async () => {
    
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectsApi();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to fetch projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  },[]);
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'IN_PROGRESS':
        return 'blue';
      case 'PLANNING':
        return 'processing';
      case 'ON_HOLD':
        return 'warning';
      case 'DELAYED':
        return 'orange';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteProjectApi(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      message.success('Project deleted successfully!');
    } catch (err) {
      setError("Failed to delete project. Please try again later.");
    } finally {
      setDeletingId(null);
    }
  };
  const handleAddModal = () => {
    setIsModalVisible(true);
  };
  const handleAddCancel = () => {
    setIsModalVisible(false);
  };
  const handleAddSuccess = () => {
    setIsModalVisible(false);
    message.success('Project added successfully!');
    fetchProjects();
  };
  const handleEditMilestone = (projectId: number) => {
    setSelectedProjectId(projectId);
    setIsMilestoneModalVisible(true);
  };
  const handleMilestoneModalClose = () => {
    setIsMilestoneModalVisible(false);
    setSelectedProjectId(null);
  };
  const handleMilestoneSuccess = () => {
    setIsMilestoneModalVisible(false);
    setSelectedProjectId(null);
    fetchProjects(); // Refresh project data
  };

  if (loading && projects.length === 0) {
    return (
      <Card>
        <Title level={5}>Project Updates</Title>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }
  if (error && projects.length === 0) {
    return (
      <Card>
        <Title level={5}>Project Updates</Title>
        <Alert message="error" description={error} type="error" showIcon />
      </Card>
    );
  }
  return (
    <>
    <Card
      title={<Title level={5}>Project Updates</Title>}
      extra={
      <Button 
        type="primary" 
        icon={<PlusOutlined/>} 
        onClick={handleAddModal}
      >
          Add Project
      </Button>
      }
    >
    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={projects}
        renderItem={(item: Project) => (
          <List.Item
            key={item.id}
            style={{
              background: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '16px',
              padding: '16px'
            }}
            actions={[
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
                // Add onClick handler for editing project details if needed
              />,
              // Conditional button based on project type
              item.type === 'FIXED_PRICE' && (
                <Button
                  key="edit-milestone"
                  type="text"
                  icon={<FlagOutlined />}
                  onClick={() => handleEditMilestone(item.id)}
                >
                  Edit Milestone
                </Button>
              ),
              item.type === 'LABOR' && (
                <Button
                  key="edit-timelog"
                  type="text"
                  icon={<ClockCircleOutlined />}
                  // Add onClick handler for editing timelogs
                >
                  Edit Timelog
                </Button>
              ),
              <Button
                key="delete"
                type="text"
                icon={<DeleteOutlined />}
                danger
                loading={deletingId === item.id}
                onClick={() => handleDelete(item.id)}
              />
            ].filter(Boolean)} // Filter out null/false values from conditional rendering
          >
            <Row justify="space-between" align="top">
              <Space direction="vertical" size={2} style={{ flex: 1 }}>
                <Space size={8} wrap> {/* Added wrap for better responsiveness */}
                  <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                  <Tag>{item.type}</Tag> {/* Display project type */}
                </Space>

                <Text strong>{item.name}</Text>
                <Text type="secondary">{item.description}</Text>

                <Space size={16} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                  <Space>
                    <UserOutlined />
                    <Text type="secondary">{item.clientName}</Text>
                  </Space>
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">{item.startDate}</Text>
                  </Space>
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">{item.plannedEndDate}</Text>
                  </Space>
                </Space>
              </Space>
            </Row>
          </List.Item>
        )}
      />
    </Card>
    <AddProjectModal
        visible={isModalVisible}
        onClose={handleAddCancel}
        onSuccess={handleAddSuccess}
      />
    {selectedProjectId && (
      <EditMilestoneModal
        visible={isMilestoneModalVisible}
        projectId={selectedProjectId}
        onClose={handleMilestoneModalClose}
        onSuccess={handleMilestoneSuccess}
      />
    )}
    </>
  );
};

export default ProjectUpdates;