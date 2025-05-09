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
  message,
  Tooltip
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import { getProjectsApi, deleteProjectApi } from '../../api/projectApi';
import { Project } from '../../types/project';
import AddProjectModal from '../../components/Admin/AddProjectModal';
import AddMilestoneModal from '../../components/Admin/AddMilestoneModal';
import MilestoneDetailsDisplay from '../../components/Admin/MilestoneDetailsDisplay';
//import EditMilestoneModal from '../../components/Admin/EditMilestoneModal';

const { Text, Title } = Typography;

const ProjectUpdates: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddProjectModalVisible, setIsAddProjectModalVisible] = useState<boolean>(false);
  const [isAddMilestoneModalVisible, setIsAddMilestoneModalVisible] = useState<boolean>(false);
  const [selectedProjectIdForMilestone, setSelectedProjectIdForMilestone] = useState<number | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [isEditMilestoneModalVisible, setIsEditMilestoneModalVisible] = useState(false);

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
      if (expandedProjectId === id) {
        setExpandedProjectId(null);
      }
    } catch (err) {
      setError("Failed to delete project. Please try again later.");
      message.error("Failed to delete project: " + err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddProjectModalOpen = () => {
    setIsAddProjectModalVisible(true);
  };

  const handleAddProjectModalClose = () => {
    setIsAddProjectModalVisible(false);
  };

  const handleAddProjectSuccess = () => {
    setIsAddProjectModalVisible(false);
    message.success('Project added successfully!');
    fetchProjects();
  };

  const handleAddMilestoneClick = (projectId: number) => {
    setSelectedProjectIdForMilestone(projectId);
    setIsAddMilestoneModalVisible(true);
  };

  const handleMilestoneModalClose = () => {
    setIsAddMilestoneModalVisible(false);
    setSelectedProjectIdForMilestone(null);
  };

  const handleMilestoneSuccess = () => {
    setIsAddMilestoneModalVisible(false);
    setSelectedProjectIdForMilestone(null);
    message.success('Milestone added successfully!');
    if (expandedProjectId) {
      // Logic để refresh MilestoneDetailsDisplay nếu cần
    }
  };

  const handleEditMilestone = (milestoneId: number) => {
    setSelectedMilestoneId(milestoneId);
    setIsEditMilestoneModalVisible(true);
  };

  const handleEditMilestoneModalClose = () => {
    setIsEditMilestoneModalVisible(false);
    setSelectedMilestoneId(null);
  };

  const handleEditMilestoneSuccess = () => {
    setIsEditMilestoneModalVisible(false);
    setSelectedMilestoneId(null);
    message.success('Milestone updated successfully!');
    fetchProjects();
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
        <Alert message="Error" description={error} type="error" showIcon />
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
          onClick={handleAddProjectModalOpen}
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
                border: '1px solid #e8e8e8',
              }}
              actions={[
                <Button
                  key="edit-project"
                  type="text"
                  icon={<EditOutlined />}
                > Edit Project </Button>,
                item.type === 'FIXED_PRICE' && (
                  <Button
                    key="milestone-details"
                    type="text"
                    icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                    onClick={() => toggleMilestoneDetail(item.id)}
                  >
                    {isExpanded ? 'Hide Milestones' : 'Show Milestones'}
                  </Button>
                ),
                item.type === 'LABOR' && (
                  <Button
                    key="edit-timelog"
                    type="text"
                    icon={<ClockCircleOutlined />}
                  > Edit Timelog </Button>
                ),
                <Button
                  key="delete"
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  loading={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                />
              ].filter(Boolean)}
            >
              <Row justify="space-between" align="top">
                <Space direction="vertical" size={2} style={{ flex: 1 }}>
                  <Space size={8} wrap>
                    <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                    <Tag>{item.type}</Tag>
                  </Space>

                  <Text strong style={{ fontSize: '16px' }}>{item.name}</Text>
                  <Text type="secondary">{item.description}</Text>

                  <Space size={16} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                    <Space>
                    <UserOutlined />
                  <Text type="secondary">
                    {item.users && item.users.length > 0 ? (
                      item.users.length > 2 ? (
                        <Tooltip title={item.users.map(user => user.email).join(', ')}>
                          {item.users.slice(0, 2).map(user => user.email).join(', ')}
                          {`, and ${item.users.length - 2} more`}
                        </Tooltip>
                      ) : (
                        item.users.map(user => user.email).join(', ')
                      )
                    ) : (
                      'N/A'
                    )}
                  </Text>
                    </Space>
                    <Space>
                      <CalendarOutlined />
                      <Text type="secondary">Start: {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'}</Text>
                    </Space>
                    <Space>
                      <CalendarOutlined />
                      <Text type="secondary">Planned End: {item.plannedEndDate ? new Date(item.plannedEndDate).toLocaleDateString() : 'N/A'}</Text>
                    </Space>
                  </Space>
                </Space>
              </Row>

              {isExpanded && item.type === 'FIXED_PRICE' && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e8e8e8' }}>
                  <MilestoneDetailsDisplay
                    projectId={item.id}
                    onAddMilestone={() => handleAddMilestoneClick(item.id)}
                    onEditMilestone={handleEditMilestone}
                  />
                </div>
              )}
            </List.Item>
          );
        }}
      />
    </Card>

    <AddProjectModal
        visible={isAddProjectModalVisible}
        onClose={handleAddProjectModalClose}
        onSuccess={handleAddProjectSuccess}
      />

    {selectedProjectIdForMilestone && (
      <AddMilestoneModal
        visible={isAddMilestoneModalVisible}
        projectId={selectedProjectIdForMilestone}
        onClose={handleMilestoneModalClose}
        onSuccess={handleMilestoneSuccess}
      />
    )}

    {/* {selectedMilestoneId && (
      <EditMilestoneModal
        visible={isEditMilestoneModalVisible}
        milestoneId={selectedMilestoneId}
        projectId={expandedProjectId}
        onClose={handleEditMilestoneModalClose}
        onSuccess={handleEditMilestoneSuccess}
      />
    )} */}
    </>
  );
};

export default ProjectUpdates;