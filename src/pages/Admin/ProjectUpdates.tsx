import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Typography,
  Button,
  Row,
  Spin,
  Alert,
  message,
  Col,
  Popconfirm,
  Pagination
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined} from '@ant-design/icons';
import { fetchProjects, deleteProjectApi } from '../../api/projectApi';
import { Project } from '../../types/project';
import AddProjectModal from '../../components/Admin/AddProjectModal';
import AddMilestoneModal from '../../components/Admin/AddMilestoneModal';
import EditMilestoneModal from '../../components/Admin/EditMilestoneModal';
import EditProjectModal from '../../components/Admin/EditProjectModal';
import ProjectDetailsDisplay from '../../components/Admin/ProjectDetailsDisplay';
import { useTheme } from '../../contexts/ThemeContext';
const { Title } = Typography;

const ProjectUpdates: React.FC = () => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddProjectModalVisible, setIsAddProjectModalVisible] = useState<boolean>(false);
  const [isAddMilestoneModalVisible, setIsAddMilestoneModalVisible] = useState<boolean>(false);
  const [selectedProjectIdForMilestone, setSelectedProjectIdForMilestone] = useState<number | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const [expandedTimelogProjectId, setExpandedTimelogProjectId] = useState<number | null>(null);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // States cho EditMilestoneModal
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [isEditMilestoneModalVisible, setIsEditMilestoneModalVisible] = useState(false);
  const [editingMilestoneProjectId, setEditingMilestoneProjectId] = useState<number | null>(null);

  const [currentMilestoneRefreshCallback, setCurrentMilestoneRefreshCallback] = useState<(() => void) | null>(null);

  // Thêm các states cho EditProjectModal
  const [isEditProjectModalVisible, setIsEditProjectModalVisible] = useState<boolean>(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<number | null>(null);
  
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { projects: projectData, totalItems: total } = await fetchProjects(currentPage, pageSize);
      setProjects(projectData);
      setTotalItems(total);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to fetch projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // Chuyển từ 1-based sang 0-based index
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteProjectApi(id);
      message.success('Project deleted successfully!');
      // Tải lại dữ liệu sau khi xóa thay vì lọc mảng hiện tại
      loadProjects();
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
    loadProjects();
  };

  const handleAddMilestoneClick = (projectId: number, refreshCallback?: () => void) => {
    setSelectedProjectIdForMilestone(projectId);
    if (refreshCallback) {
      setCurrentMilestoneRefreshCallback(() => refreshCallback);
    }
    setIsAddMilestoneModalVisible(true);
  };

  const handleMilestoneModalClose = () => {
    setIsAddMilestoneModalVisible(false);
    setSelectedProjectIdForMilestone(null);
    setCurrentMilestoneRefreshCallback(null);
  };

  const handleMilestoneSuccess = () => {
    setIsAddMilestoneModalVisible(false);
    setSelectedProjectIdForMilestone(null);
    message.success('Milestone added successfully!');
    if (currentMilestoneRefreshCallback) {
      currentMilestoneRefreshCallback();
      setCurrentMilestoneRefreshCallback(null);
    }
  };

  const handleEditMilestone = (milestoneId: number, projectId: number, refreshCallback?: () => void) => {
    setSelectedMilestoneId(milestoneId);
    setEditingMilestoneProjectId(projectId);
    if (refreshCallback) {
        setCurrentMilestoneRefreshCallback(() => refreshCallback);
    }
    setIsEditMilestoneModalVisible(true);
  };

  const handleEditMilestoneModalClose = () => {
    setIsEditMilestoneModalVisible(false);
    setSelectedMilestoneId(null);
    setEditingMilestoneProjectId(null);
    setCurrentMilestoneRefreshCallback(null);
  };

  const handleEditMilestoneSuccess = () => {
    setIsEditMilestoneModalVisible(false);
    setSelectedMilestoneId(null);
    setEditingMilestoneProjectId(null);
    message.success('Milestone updated successfully!');
    if (currentMilestoneRefreshCallback) {
      currentMilestoneRefreshCallback();
      setCurrentMilestoneRefreshCallback(null);
    }
  };

  const toggleMilestoneDetail = (projectId: number) => {
    setExpandedProjectId(prevId => (prevId === projectId ? null : projectId));
  };

  const toggleTimelogDetail = (projectId: number) => {
    setExpandedTimelogProjectId(prevId => (prevId === projectId ? null : projectId));
  };

  const handleEditProject = (projectId: number) => {
    setSelectedProjectForEdit(projectId);
    setIsEditProjectModalVisible(true);
  };
  
  const handleEditProjectModalClose = () => {
    setIsEditProjectModalVisible(false);
    setSelectedProjectForEdit(null);
  };
  
  const handleEditProjectSuccess = () => {
    setIsEditProjectModalVisible(false);
    setSelectedProjectForEdit(null);
    message.success('Project updated successfully!');
    loadProjects();
  };
  
  if (loading && projects.length === 0) {
    return (
      <Card>
        <Row justify="space-between" align="middle">
          <Col><Title level={5} style={{ margin: 0 }}>Project Updates</Title></Col>
        </Row>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }
  if (error && projects.length === 0) {
    return (
      <Card>
         <Row justify="space-between" align="middle">
          <Col><Title level={5} style={{ margin: 0 }}>Project Updates</Title></Col>
        </Row>
        <Alert message="Error" description={error} type="error" showIcon />
      </Card>
    );
  }

  return (
    <>
    <Card
      style={{
        background: theme === 'dark' ? '#181818' : '#fff',
        color: theme === 'dark' ? '#fff' : '#000'
      }}
      title={
        <Row justify="space-between" align="middle" style={{ width: '100%' }}>
          <Col><Title level={5} style={{ margin: 0, color: theme === 'dark' ? '#fff' : undefined }}>Project Updates</Title></Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined/>}
              onClick={handleAddProjectModalOpen}
            >
                Add Project
            </Button>
          </Col>
        </Row>
      }
    >
    {error && !loading && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={projects}
        renderItem={(item: Project) => (
          <ProjectDetailsDisplay
            project={item}
            milestoneCount={item.milestoneCount} // Truyền milestoneCount vào đây
            isExpanded={expandedProjectId === item.id}
            expandedTimelogProjectId={expandedTimelogProjectId}
            deletingId={deletingId}
            onEditProject={handleEditProject}
            onDeleteProject={() => null}
            onToggleMilestoneDetail={toggleMilestoneDetail}
            onToggleTimelogDetail={toggleTimelogDetail}
            onAddMilestone={handleAddMilestoneClick}
            onEditMilestone={handleEditMilestone}
            theme={theme}
            deleteButton={(
              <Popconfirm
                title="Bạn có chắc muốn xóa dự án này?"
                onConfirm={() => handleDelete(item.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  loading={deletingId === item.id}
                >
                  Delete
                </Button>
              </Popconfirm>
            )}
          />
        )}
      />
      
      {/* Phân trang */}
      {totalItems > 0 && (
        <Row justify="end" style={{ marginTop: 16 }}>
          <Pagination
            current={currentPage + 1} // Chuyển từ 0-based về 1-based index cho UI
            pageSize={pageSize}
            total={totalItems}
            onChange={handlePageChange}
            showSizeChanger
            onShowSizeChange={(current, size) => {
              setPageSize(size);
              setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi kích thước
            }}
            pageSizeOptions={['5', '10', '20', '50']}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          />
        </Row>
      )}
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

    {/* Edit Milestone Modal */}
    {selectedMilestoneId !== null && editingMilestoneProjectId !== null && (
      <EditMilestoneModal
        visible={isEditMilestoneModalVisible}
        milestoneId={selectedMilestoneId}
        projectId={editingMilestoneProjectId}
        onClose={handleEditMilestoneModalClose}
        onSuccess={handleEditMilestoneSuccess}
      />
    )}

    {isEditProjectModalVisible && selectedProjectForEdit && (
      <EditProjectModal
        visible={isEditProjectModalVisible}
        projectId={selectedProjectForEdit}
        projectData={projects.find(p => p.id === selectedProjectForEdit)}
        onClose={handleEditProjectModalClose}
        onSuccess={handleEditProjectSuccess}
      />
    )}
    </>
  );
};

export default ProjectUpdates;