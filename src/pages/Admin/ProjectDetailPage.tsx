import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Typography, Button, Row, Col, message } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CompressOutlined,
} from "@ant-design/icons";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";

// --- Types ---
import { Project, ProjectDetail } from "../../types/project";

// --- API ---
import { getProjectDetailsApi } from "../../api/projectApi";

// --- Components ---
import ProjectDetailsDisplay from "../../components/Admin/ProjectDetailsDisplay";
import EditProjectModal from "../../components/Admin/EditProjectModal";
import ProjectMilestonesTab from "../../components/Admin/ProjectDetailsPage/ProjectMilestonesTab";
import ProjectTimeLogsTab from "../../components/Admin/ProjectDetailsPage/ProjectTimeLogsTab";
import ProjectUpdatesTab from "../../components/Admin/ProjectDetailsPage/ProjectUpdatesTab";

import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const { Title } = Typography;
const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_LAYOUTS = {
  lg: [
    { i: "overview", x: 0, y: 0, w: 6, h: 8, minW: 4, minH: 6 },
    { i: "milestones", x: 6, y: 0, w: 6, h: 8, minW: 4, minH: 6 },
    { i: "updates", x: 0, y: 8, w: 12, h: 6, minW: 8, minH: 4 },
  ],
  md: [
    { i: "overview", x: 0, y: 0, w: 6, h: 8, minW: 4, minH: 6 },
    { i: "milestones", x: 0, y: 8, w: 6, h: 8, minW: 4, minH: 6 },
    { i: "updates", x: 0, y: 16, w: 6, h: 6, minW: 4, minH: 4 },
  ],
  sm: [
    { i: "overview", x: 0, y: 0, w: 4, h: 8, minW: 4, minH: 6 },
    { i: "milestones", x: 0, y: 8, w: 4, h: 8, minW: 4, minH: 6 },
    { i: "updates", x: 0, y: 16, w: 4, h: 6, minW: 4, minH: 4 },
  ],
  xs: [
    { i: "overview", x: 0, y: 0, w: 2, h: 8, minW: 2, minH: 6 },
    { i: "milestones", x: 0, y: 8, w: 2, h: 8, minW: 2, minH: 6 },
    { i: "updates", x: 0, y: 16, w: 2, h: 6, minW: 2, minH: 4 },
  ],
};

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userRole } = useAuth();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditProjectModalVisible, setIsEditProjectModalVisible] =
    useState<boolean>(false);

  // Grid Layout state
  const [isDragging, setIsDragging] = useState(false);
  const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);

  const fetchProjectData = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is missing from URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setProject(null);
    try {
      const numericProjectId = Number(projectId);
      if (isNaN(numericProjectId)) {
        throw new Error("Invalid Project ID format.");
      }
      const data = await getProjectDetailsApi(numericProjectId);
      setProject(data);
    } catch (err: any) {
      console.error("Failed to fetch project details:", err);
      setError(
        err.message ||
          "Failed to load project details. The project may not exist or an error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleBackToList = () => {
    navigate("/admin/updates");
  };
  const handleBackToHome = () => {
    navigate("/client/overview");
  };

  const handleOpenEditProjectModal = () => {
    if (project) {
      setIsEditProjectModalVisible(true);
    }
  };

  const handleEditProjectSuccess = () => {
    setIsEditProjectModalVisible(false);
    message.success("Project updated successfully!");
    fetchProjectData();
  };

  // Grid Layout handlers
  const onLayoutChange = (_layout: Layout[], layouts: any) => {
    setLayouts(layouts);
    // Save to localStorage
    localStorage.setItem(
      `project-layout-${projectId}`,
      JSON.stringify(layouts)
    );
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragStop = () => {
    setIsDragging(false);
  };

  const resetLayout = () => {
    setLayouts(DEFAULT_LAYOUTS);
    localStorage.removeItem(`project-layout-${projectId}`);
    message.success("Layout reset to default");
  };

  // Load saved layout
  useEffect(() => {
    const savedLayouts = localStorage.getItem(`project-layout-${projectId}`);
    if (savedLayouts) {
      try {
        setLayouts(JSON.parse(savedLayouts));
      } catch (e) {
        console.error("Failed to parse saved layout:", e);
      }
    }
  }, [projectId]);

  // Card style function
  const getCardStyle = (isActive: boolean) => ({
    background: theme === "dark" ? "#181818" : "#fff",
    color: theme === "dark" ? "#fff" : undefined,
    height: "100%",
    transition: "all 0.3s ease",
    boxShadow: isActive
      ? "0 8px 24px rgba(24, 144, 255, 0.3)"
      : theme === "dark"
      ? "0 2px 8px rgba(255,255,255,0.1)"
      : "0 2px 8px rgba(0,0,0,0.1)",
    border: isActive ? "2px solid #1890ff" : "1px solid #d9d9d9",
    borderRadius: "6px",
    overflow: "hidden",
  });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 150px)",
          padding: "20px",
        }}
      >
        <Spin size="large" tip="Loading project details..." />
      </div>
    );
  }

  if (!project) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "30px" }}>
          <Title level={4}>Project not found</Title>
          {userRole === "USER" && (
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Back to the previous page
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (error && userRole === "ADMIN") {
    return (
      <div style={{ padding: "20px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToList}
          style={{ marginBottom: "20px" }}
        >
          Back to Projects
        </Button>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!project && userRole === "ADMIN") {
    return (
      <div style={{ padding: "20px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToList}
          style={{ marginBottom: "20px" }}
        >
          Back to Projects
        </Button>
        <Alert
          message="Project Not Found"
          description="The requested project could not be found."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      {userRole === "ADMIN" ? (
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "20px" }}
        >
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
              Back to Projects
            </Button>
          </Col>
          <Col>
            <Row gutter={8}>
              <Col>
                <Button icon={<CompressOutlined />} onClick={resetLayout}>
                  Reset Layout
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleOpenEditProjectModal}
                >
                  Edit Project
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      ) : (
        <Row justify="start" align="middle" style={{ marginBottom: "20px" }}>
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToHome}>
              Back to Home
            </Button>
          </Col>
        </Row>
      )}

      <Title
        level={2}
        style={{
          color: theme === "dark" ? "#fff" : undefined,
          marginBottom: "24px",
        }}
      >
        {project.name}
      </Title>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        onLayoutChange={onLayoutChange}
        onDragStart={onDragStart}
        onDragStop={onDragStop}
        onResizeStart={onDragStart}
        onResizeStop={onDragStop}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 6, sm: 4, xs: 2 }}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={true}
        isResizable={true}
        useCSSTransforms={false}
        style={{ minHeight: "800px" }}
      >
        {/* Project Overview */}
        <div key="overview" style={getCardStyle(isDragging)}>
          <Card
            title="Project Overview"
            style={{ height: "100%", border: "none" }}
            bodyStyle={{
              height: "calc(100% - 57px)",
              overflow: "auto",
              padding: "16px",
            }}
          >
            <ProjectDetailsDisplay project={project} theme={theme} />
          </Card>
        </div>

        {/* Milestones/Time Logs */}
        <div key="milestones" style={getCardStyle(isDragging)}>
          <Card
            title={
              project.type === "FIXED_PRICE"
                ? "Project Milestones"
                : "Time Logs"
            }
            style={{ height: "100%", border: "none" }}
            bodyStyle={{
              height: "calc(100% - 57px)",
              overflow: "auto",
              padding: "16px",
            }}
          >
            {project.type === "FIXED_PRICE" ? (
              <ProjectMilestonesTab projectId={project.id} />
            ) : (
              <ProjectTimeLogsTab projectId={project.id} />
            )}
          </Card>
        </div>

        {/* Updates Timeline */}
        <div key="updates" style={getCardStyle(isDragging)}>
          <Card
            title="Project Updates Timeline"
            style={{ height: "100%", border: "none" }}
            bodyStyle={{
              height: "calc(100% - 57px)",
              overflow: "auto",
              padding: "16px",
            }}
          >
            <ProjectUpdatesTab projectId={project.id} theme={theme} />
          </Card>
        </div>
      </ResponsiveGridLayout>

      {/* Edit Project Modal */}
      {isEditProjectModalVisible && project && (
        <EditProjectModal
          visible={isEditProjectModalVisible}
          projectId={project.id}
          projectData={
            {
              id: project.id,
              name: project.name,
              description: project.description || "",
              type: project.type,
              status: project.status,
              startDate: project.startDate,
              plannedEndDate: project.plannedEndDate,
              actualEndDate: project.actualEndDate,
              totalBudget: project.totalBudget || 0,
              totalEstimatedHours: project.totalEstimatedHours,
              progress: 0,
              milestoneCount: 0,
              newMilestoneCount: 0,
              sentMilestoneCount: 0,
              reviewedMilestoneCount: 0,
              users: project.users.map((user) => ({
                id: user.id,
                email: user.email,
              })),
            } as Project
          }
          onClose={() => setIsEditProjectModalVisible(false)}
          onSuccess={handleEditProjectSuccess}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
