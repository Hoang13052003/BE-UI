import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  List,
  Button,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Alert,
  Popconfirm,
  Pagination,
  Select,
  Input,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  ClearOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Project } from "../../types/project";
import {
  fetchProjects,
  deleteProjectByTypeApi,
  filterProjects,
} from "../../api/projectApi";
import ProjectDetailsDisplay from "../../components/Admin/ProjectDetailsDisplay";
import AddProjectModal from "../../components/Admin/AddProjectModal";
import AddMilestoneModal from "../../components/Admin/AddMilestoneModal";
import EditMilestoneModal from "../../components/Admin/EditMilestoneModal";
import EditProjectModal from "../../components/Admin/EditProjectModal";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const ProjectManager: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoadComplete, setInitialLoadComplete] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddProjectModalVisible, setIsAddProjectModalVisible] =
    useState<boolean>(false);
  const [isAddMilestoneModalVisible, setIsAddMilestoneModalVisible] =
    useState<boolean>(false);
  const [selectedProjectIdForMilestone, setSelectedProjectIdForMilestone] =
    useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null
  );
  const [expandedTimelogProjectId, setExpandedTimelogProjectId] = useState<
    string | null
  >(null);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [filterCriteria, setFilterCriteria] = useState<{
    name?: string;
    status?: string;
    projectType?: "FIXED_PRICE" | "LABOR";
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    minBudget?: number;
    maxBudget?: number;
    minProgress?: number;
    maxProgress?: number;
    isOverdue?: boolean;
    isCompleted?: boolean;
  }>({});

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(
    null
  );
  const [isEditMilestoneModalVisible, setIsEditMilestoneModalVisible] =
    useState(false);
  const [editingMilestoneProjectId, setEditingMilestoneProjectId] = useState<
    string | null
  >(null);
  const [currentMilestoneRefreshCallback, setCurrentMilestoneRefreshCallback] =
    useState<(() => void) | null>(null);
  const [isEditProjectModalVisible, setIsEditProjectModalVisible] =
    useState<boolean>(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] =
    useState<Project | null>(null);

  // Admin status check
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      console.log("ProjectManager: useEffect setting isAdmin to true");
      setCurrentUserIsAdmin(true);
    };
    checkAdminStatus();
  }, []);

  const loadProjects = useCallback(
    async (showSpinner = true) => {
      if (showSpinner && !initialLoadComplete) setLoading(true);
      setError(null);
      try {
        let result;

        if (Object.values(filterCriteria).some((value) => value)) {
          result = await filterProjects(filterCriteria, currentPage, pageSize);
          setProjects(result.projects);
          setTotalItems(result.totalCount);
        } else {
          result = await fetchProjects(currentPage, pageSize);
          setProjects(result.projects);
          setTotalItems(result.totalItems);
        }
        if (!initialLoadComplete) setInitialLoadComplete(true);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to fetch projects. Please try again later.");
      } finally {
        if (showSpinner && !initialLoadComplete) setLoading(false);
      }
    },
    [currentPage, pageSize, filterCriteria, initialLoadComplete]
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page - 1);
    if (newPageSize) setPageSize(newPageSize);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(parseInt(id));
    try {
      // Find the project to get its type
      const project = projects.find(p => p.id.toString() === id);
      
      if (project && project.projectType) {
        // Use type-specific endpoint
        await deleteProjectByTypeApi(id, project.projectType as "LABOR" | "FIXED_PRICE");
        message.success("Project deleted successfully!");
        loadProjects(false);
        if (expandedProjectId === id) setExpandedProjectId(null);
        if (expandedTimelogProjectId === id) setExpandedTimelogProjectId(null);
      } else {
        throw new Error("Project type not found or not supported");
      }
    } catch (err) {
      setError("Failed to delete project. Please try again later.");
      message.error("Failed to delete project: " + (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddProjectModalOpen = () => setIsAddProjectModalVisible(true);
  const handleAddProjectModalClose = () => setIsAddProjectModalVisible(false);
  const handleAddProjectSuccess = () => {
    setIsAddProjectModalVisible(false);
    message.success("Project added successfully!");
    loadProjects(false);
  };

  const handleAddMilestoneClick = (
    projectId: string,
    refreshCallback?: () => void
  ) => {
    setSelectedProjectIdForMilestone(projectId);
    if (refreshCallback)
      setCurrentMilestoneRefreshCallback(() => refreshCallback);
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
    if (currentMilestoneRefreshCallback) {
      currentMilestoneRefreshCallback();
      setCurrentMilestoneRefreshCallback(null);
    }
  };

  const handleEditMilestone = (
    milestoneId: number,
    projectId: string,
    refreshCallback?: () => void
  ) => {
    setSelectedMilestoneId(milestoneId);
    setEditingMilestoneProjectId(projectId);
    if (refreshCallback)
      setCurrentMilestoneRefreshCallback(() => refreshCallback);
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
    message.success("Milestone updated successfully!");
    if (currentMilestoneRefreshCallback) {
      currentMilestoneRefreshCallback();
      setCurrentMilestoneRefreshCallback(null);
    }
  };

  const toggleMilestoneDetail = (projectId: string) => {
    setExpandedProjectId((prevId) => (prevId === projectId ? null : projectId));
    if (expandedTimelogProjectId === projectId)
      setExpandedTimelogProjectId(null);
  };

  const toggleTimelogDetail = (projectId: string) => {
    setExpandedTimelogProjectId((prevId) =>
      prevId === projectId ? null : projectId
    );
    if (expandedProjectId === projectId) setExpandedProjectId(null);
  };

  const handleRefreshProjectProgress = useCallback(
    (_projectId: string) => {
      loadProjects(false);
    },
    [loadProjects]
  );

  const handleEditProject = (project: Project) => {
    setSelectedProjectForEdit(project);
    setIsEditProjectModalVisible(true);
  };

  const handleEditProjectModalClose = () => {
    setIsEditProjectModalVisible(false);
    setSelectedProjectForEdit(null);
  };

  const handleEditProjectSuccess = () => {
    setIsEditProjectModalVisible(false);
    setSelectedProjectForEdit(null);
    message.success("Project updated successfully!");
    loadProjects(false);
  };

  const handleNameSearch = (value: string) => {
    setFilterCriteria((prev) => ({ ...prev, name: value || undefined }));
    setCurrentPage(0);
  };

  const handleTypeFilter = (value: "FIXED_PRICE" | "LABOR" | undefined) => {
    setFilterCriteria((prev) => ({ ...prev, projectType: value }));
    setCurrentPage(0);
  };

  const handleStatusFilter = (value: string | undefined) => {
    setFilterCriteria((prev) => ({ ...prev, status: value }));
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setFilterCriteria({});
    setCurrentPage(0);
  };

  const hasActiveFilters = Object.values(filterCriteria).some((value) => value);

  const handleNavigateToFullDetails = (projectId: string) => {
    navigate(`/admin/projects/fixed-price/${projectId}/details`);
  };

  if (!initialLoadComplete && loading) {
    return (
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={5} style={{ margin: 0 }}>
              Project Managements
            </Title>
          </Col>
        </Row>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error && projects.length === 0 && !initialLoadComplete) {
    return (
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={5} style={{ margin: 0 }}>
              Projects Managements
            </Title>
          </Col>
        </Row>
        <Alert message="Error" description={error} type="error" showIcon />
      </Card>
    );
  }

  return (
    <>
      <Card
        style={{
          background: theme === "dark" ? "#181818" : "#fff",
          color: theme === "dark" ? "#fff" : "#000",
        }}
        title={
          <Row justify="space-between" align="middle" style={{ width: "100%" }}>
            <Col>
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: theme === "dark" ? "#fff" : undefined,
                }}
              >
                Projects Managements
              </Title>
            </Col>
            <Col>
              {currentUserIsAdmin && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddProjectModalOpen}
                >
                  Add Project
                </Button>
              )}
            </Col>
          </Row>
        }
      >
        {/* Filter Bar */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="Search by project name"
              allowClear
              onSearch={handleNameSearch}
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Filter by type"
              allowClear
              style={{ width: "100%" }}
              onChange={handleTypeFilter}
              value={filterCriteria.projectType}
            >
              <Option value="FIXED_PRICE">Fixed Price</Option>
              <Option value="LABOR">Labor</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: "100%" }}
              onChange={handleStatusFilter}
              value={filterCriteria.status}
            >
              <Option value="NEW">New</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="PROGRESS">Progress</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              style={{ width: "100%" }}
            >
              Clear Filters
            </Button>
          </Col>
          <Col span={4}>
            <div style={{ textAlign: "right", lineHeight: "32px" }}>
              {hasActiveFilters && (
                <span
                  style={{
                    fontSize: "12px",
                    color: theme === "dark" ? "#bfbfbf" : "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <FilterOutlined style={{ marginRight: 4 }} />
                  Filters active
                </span>
              )}
            </div>
          </Col>
        </Row>

        {error && !loading && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <List
          loading={loading && initialLoadComplete}
          itemLayout="vertical"
          dataSource={projects}
          locale={{
            emptyText: hasActiveFilters
              ? "No projects found matching your filters"
              : "No projects available",
          }}
          renderItem={(item: Project) => (
            <List.Item
              key={item.id}
              actions={
                currentUserIsAdmin
                  ? [
                      <Button
                        key="full-details"
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleNavigateToFullDetails(item.id)}
                      >
                        View Full Details
                      </Button>,
                      <Button
                        key="edit-project-action"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditProject(item)}
                      >
                        Edit
                      </Button>,
                      <Popconfirm
                        key="delete-project-action"
                        title="Delete this project?"
                        onConfirm={() => handleDelete(item.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          danger
                          loading={deletingId === parseInt(item.id)}
                        >
                          Delete
                        </Button>
                      </Popconfirm>,
                    ]
                  : [
                      <Button
                        key="full-details"
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleNavigateToFullDetails(item.id)}
                      >
                        View Full Details
                      </Button>,
                    ]
              }
            >
              {" "}
              <ProjectDetailsDisplay
                project={item}
                theme={theme}
                milestoneCount={item.milestoneCount}
                newMilestoneCount={item.newMilestoneCount}
                sentMilestoneCount={item.sentMilestoneCount}
                reviewedMilestoneCount={item.reviewedMilestoneCount}
                isExpanded={expandedProjectId === item.id}
                expandedTimelogProjectId={
                  expandedTimelogProjectId === item.id ? item.id : null
                }
                onToggleMilestoneDetail={toggleMilestoneDetail}
                onToggleTimelogDetail={toggleTimelogDetail}
                onAddMilestone={
                  currentUserIsAdmin ? handleAddMilestoneClick : undefined
                }
                onEditMilestone={
                  currentUserIsAdmin ? handleEditMilestone : undefined
                }
                currentUserIsAdmin={currentUserIsAdmin}
                onRefreshProgress={() => handleRefreshProjectProgress(item.id)}
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
              onShowSizeChange={(_current, size) => handlePageChange(1, size)}
              pageSizeOptions={["5", "10", "20", "50"]}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
            />
          </Row>
        )}
      </Card>

      {currentUserIsAdmin && (
        <AddProjectModal
          visible={isAddProjectModalVisible}
          onClose={handleAddProjectModalClose}
          onSuccess={handleAddProjectSuccess}
        />
      )}

      {selectedProjectIdForMilestone && currentUserIsAdmin && (
        <AddMilestoneModal
          visible={isAddMilestoneModalVisible}
          projectId={selectedProjectIdForMilestone}
          onClose={handleMilestoneModalClose}
          onSuccess={handleMilestoneSuccess}
        />
      )}

      {selectedMilestoneId !== null &&
        editingMilestoneProjectId !== null &&
        currentUserIsAdmin && (
          <EditMilestoneModal
            visible={isEditMilestoneModalVisible}
            milestoneId={selectedMilestoneId}
            projectId={editingMilestoneProjectId}
            onClose={handleEditMilestoneModalClose}
            onSuccess={handleEditMilestoneSuccess}
          />
        )}

      {isEditProjectModalVisible &&
        selectedProjectForEdit &&
        currentUserIsAdmin && (
          <EditProjectModal
            visible={isEditProjectModalVisible}
            projectId={selectedProjectForEdit.id}
            projectData={selectedProjectForEdit}
            onClose={handleEditProjectModalClose}
            onSuccess={handleEditProjectSuccess}
          />
        )}
    </>
  );
};

export default ProjectManager;
