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
  message} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import { getProjectsApi, deleteProjectApi } from '../../api/projectApi';
import { Project } from '../../types/project';
import AddProjectModal from '../../components/Admin/AddProjectModal';
import EditMilestoneModal from '../../components/Admin/EditMilestoneModal';
import MilestoneDetailsDisplay from '../../components/Admin/MilestoneDetailsDisplay';

const { Text, Title } = Typography;

const ProjectUpdates: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isMilestoneModalVisible, setIsMilestoneModalVisible] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);

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

  const toggleMilestoneDetail = (projectId: number) => {
    setExpandedProjectId(prevId => (prevId === projectId ? null : projectId));
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
        renderItem={(item: Project) => {
          const isExpanded = expandedProjectId === item.id;
          return (
            <List.Item
              key={item.id}
              style={{
                background: '#f9fafb',
                borderRadius: '8px',
                marginBottom: '16px',
                padding: '16px',
                transition: 'all 0.3s ease',
              }}
              actions={[
                <Button
                  key="edit"
                  type="text"
                  icon={<EditOutlined />}
                />,
                item.type === 'FIXED_PRICE' && (
                  <React.Fragment key={`fixed-price-actions-${item.id}`}>
                    <Button
                      key="edit-milestone"
                      type="text"
                      icon={<FlagOutlined />}
                      onClick={() => handleEditMilestone(item.id)}
                    >
                      Edit Milestone
                    </Button>
                    <Button
                      key="milestone-details"
                      type="text"
                      icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                      onClick={() => toggleMilestoneDetail(item.id)}
                    >
                      {isExpanded ? 'Hide Details' : 'Milestone Details'}
                    </Button>
                  </React.Fragment>
                ),
                item.type === 'LABOR' && (
                  <Button
                    key="edit-timelog"
                    type="text"
                    icon={<ClockCircleOutlined />}
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
                  <Space size={8} wrap>
                    <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                    <Tag>{item.type}</Tag>
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

              {isExpanded && item.type === 'FIXED_PRICE' && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e8e8e8' }}>
                  <Title level={5} style={{ marginBottom: '12px' }}>Milestones</Title>
                  <MilestoneDetailsDisplay projectId={item.id} />
                </div>
              )}
            </List.Item>
          );
        }}
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