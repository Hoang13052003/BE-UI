import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, Spin, Alert, Typography, Button, Row, Col, message } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
// removed react-grid-layout in favor of static Ant Design grid

// --- Types ---
import {
  ProjectFixedPriceDetailsResponse,
  ProjectDetail,
  ProjectLaborDetailResponse,
} from "../../types/project";

// --- API ---
import {
  getProjectFixedPriceDetailsApi,
  getProjectLaborDetailsApi,
} from "../../api/projectApi";

// --- Components ---
import EditProjectModal from "../../components/Admin/EditProjectModal";
import ProjectMetricsDisplay from "../../components/Admin/ProjectDetailsPage/ProjectMetricsDisplay";
import WeeklyMilestonesDisplay from "../../components/Admin/ProjectDetailsPage/WeeklyMilestonesDisplay";
import CompactProjectInfo from "../../components/Admin/ProjectDetailsPage/CompactProjectInfo";
import ProjectLaborMetricsDisplay from "../../components/Admin/ProjectDetailsPage/ProjectLaborMetricsDisplay";
import ProjectLaborDetail from "../../components/Admin/ProjectDetailsPage/ProjectLaborDetail";
import ProjectLaborRecentTimeLogs from "../../components/Admin/ProjectDetailsPage/ProjectLaborRecentTimeLogs";
import ProjectLaborUpdatesTimeline from "../../components/Admin/ProjectDetailsPage/ProjectLaborUpdatesTimeline";
import ProjectFixedPriceUpdatesTimeline from "../../components/Admin/ProjectDetailsPage/ProjectFixedPriceUpdatesTimeline";
import MilestoneDetailsModal from "../../components/Manager/MilestoneDetailsModal";
import TimelogDetailsModal from "../../components/Manager/TimelogDetailsModal";

import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const { Title } = Typography;

// Thêm type guard để kiểm tra loại project
const isFixedPriceProject = (
  project: ProjectFixedPriceDetailsResponse | ProjectDetail | null
): project is ProjectFixedPriceDetailsResponse => {
  return project !== null && "completionPercentage" in project;
};

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userRole } = useAuth();
  const location = useLocation();

  // Xác định loại project từ URL
  const isLaborProject = location.pathname.includes("/labor/");

  const [project, setProject] = useState<
    ProjectFixedPriceDetailsResponse | ProjectDetail | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditProjectModalVisible, setIsEditProjectModalVisible] =
    useState<boolean>(false);
  const [isMilestoneModalVisible, setIsMilestoneModalVisible] = useState<boolean>(false);
  const [isTimelogModalVisible, setIsTimelogModalVisible] = useState<boolean>(false);

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
      if (isLaborProject) {
        // Gọi API cho project LABOR
        const data = await getProjectLaborDetailsApi(projectId);
        // Add projectType to labor project data for EditProjectModal compatibility
        const laborProjectWithType = {
          ...data,
          projectType: "LABOR" as const
        };
        setProject(laborProjectWithType as any);
      } else {
        // Gọi API cho project FIXED_PRICE
        const data = await getProjectFixedPriceDetailsApi(projectId);
        // Add projectType to fixed price project data for EditProjectModal compatibility
        const fixedPriceProjectWithType = {
          ...data,
          projectType: "FIXED_PRICE" as const
        };
        setProject(fixedPriceProjectWithType as any);
      }
    } catch (err: any) {
      console.error("Failed to fetch project details:", err);
      setError(
        err.message ||
          "Failed to load project details. The project may not exist or an error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, isLaborProject]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleBackToList = () => {
    navigate("/admin/updates");
  };
  const handleBackToHome = () => {
    navigate("/client/overview");
  };
  const handleBackToHomeManager = () => {
    navigate("/manager/overview");
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

  const handleOpenMilestoneModal = () => {
    setIsMilestoneModalVisible(true);
  };

  const handleCloseMilestoneModal = () => {
    setIsMilestoneModalVisible(false);
  };

  const handleOpenTimelogModal = () => {
    setIsTimelogModalVisible(true);
  };

  const handleCloseTimelogModal = () => {
    setIsTimelogModalVisible(false);
  };

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
        <Spin size="large" tip="Loading project details...">
          <div style={{ height: 40 }} />
        </Spin>
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

  if (error && (userRole === "ADMIN" || userRole === "MANAGER")) {
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

  if (!project && (userRole === "ADMIN" || userRole === "MANAGER")) {
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

  // Render khác nhau dựa trên loại project
  if (isLaborProject && project) {
    const laborProject = project as unknown as ProjectLaborDetailResponse;
    return (
      <Card>
        {/* Header */}
        {userRole === "ADMIN" ? (
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 20 }}
          >
            <Col>
              <Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
                Back to Projects
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
        ) : userRole === "MANAGER" ? (
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: "20px" }}
          >
            <Col>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToHomeManager}
              >
                Back to Home
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
        ) : (
          <Row justify="start" align="middle" style={{ marginBottom: "20px" }}>
            <Col>
              <Button icon={<ArrowLeftOutlined />} onClick={handleBackToHome}>
                Back to Home
              </Button>
            </Col>
          </Row>
        )}

        {/* Metrics */}
        <ProjectLaborMetricsDisplay project={laborProject} />

        {/* Row: 2 cột, trái: ProjectLaborDetail, phải: ProjectLaborRecentTimeLogs */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <ProjectLaborDetail
              project={laborProject}
              users={laborProject.users}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ProjectLaborRecentTimeLogs
              timeLogs={laborProject.recentTimeLogs}
              onViewAll={handleOpenTimelogModal}
              showViewAllButton={userRole === "MANAGER"}
            />
          </Col>
        </Row>

        {/* Row: 1 cột, ProjectLaborUpdatesTimeline */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <ProjectLaborUpdatesTimeline
              updates={laborProject.projectUpdates}
            />
          </Col>
        </Row>

        {isEditProjectModalVisible && project && (
          <EditProjectModal
            visible={isEditProjectModalVisible}
            projectId={projectId || ""}
            projectData={project as any}
            onClose={() => setIsEditProjectModalVisible(false)}
            onSuccess={handleEditProjectSuccess}
          />
        )}

        {/* Milestone Details Modal */}
        {isMilestoneModalVisible && project && (
          <MilestoneDetailsModal
            visible={isMilestoneModalVisible}
            onClose={handleCloseMilestoneModal}
            projectId={projectId || ""}
            projectName={(project as any).projectName || (project as any).name || "project"}
            onRefreshProgress={fetchProjectData}
            theme={theme}
          />
        )}

        {/* Timelog Details Modal */}
        {isTimelogModalVisible && project && isLaborProject && (
          <TimelogDetailsModal
            visible={isTimelogModalVisible}
            onClose={handleCloseTimelogModal}
            projectId={projectId || ""}
            projectName={(project as any).projectName || (project as any).name || "project"}
            onRefreshProgress={fetchProjectData}
            theme={theme}
          />
        )}
      </Card>
    );
  }

  // Render khác nhau dựa trên loại project
  return (
    <Card>
      {/* Header */}
      {userRole === "ADMIN" ? (
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
              Back to Projects
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
      ) : userRole === "MANAGER" ? (
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "20px" }}
        >
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToHomeManager}
            >
              Back to Home
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
      ) : (
        <Row justify="start" align="middle" style={{ marginBottom: "20px" }}>
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToHome}>
              Back to Home
            </Button>
          </Col>
        </Row>
      )}

      {/* Top Metrics Display */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          {/* Chỉ truyền project vào nếu nó là loại fixed price hoặc điều chỉnh component để xử lý cả 2 loại */}
          {isFixedPriceProject(project) ? (
            <ProjectMetricsDisplay project={project} />
          ) : (
            <CompactProjectInfo project={project} theme={theme} />
          )}
        </Col>
      </Row>

      {/* Main Content Layout - 2 columns */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={12}>
          {/* Project Updates Tab */}
          <Card
            title={
              <span>
                <ProjectOutlined style={{ marginRight: 8 }} />
                Project Details
              </span>
            }
            size="small"
          >
            <CompactProjectInfo project={project} theme={theme} />
          </Card>
        </Col>

        {/* Weekly Milestones */}
        <Col xs={24} lg={12}>
          <WeeklyMilestonesDisplay
            milestones={
              isFixedPriceProject(project) ? project.milestoneInWeek : []
            }
            onViewAll={handleOpenMilestoneModal}
            showViewAllButton={userRole === "MANAGER"}
          />
        </Col>
      </Row>

      {/* Project Updates - Full Width */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProjectFixedPriceUpdatesTimeline
            updates={isFixedPriceProject(project) ? project.projectUpdates : []}
          />
        </Col>
      </Row>

      {isEditProjectModalVisible && project && (
        <EditProjectModal
          visible={isEditProjectModalVisible}
          projectId={projectId || ""}
          projectData={project as any} // Casting để tránh lỗi type
          onClose={() => setIsEditProjectModalVisible(false)}
          onSuccess={handleEditProjectSuccess}
        />
      )}

      {/* Milestone Details Modal */}
      {isMilestoneModalVisible && project && (
        <MilestoneDetailsModal
          visible={isMilestoneModalVisible}
          onClose={handleCloseMilestoneModal}
          projectId={projectId || ""}
          projectName={isFixedPriceProject(project) ? project.name : (project as any).projectName || "project"}
          onRefreshProgress={fetchProjectData}
          theme={theme}
        />
      )}

      {/* Timelog Details Modal */}
      {isTimelogModalVisible && project && isLaborProject && (
        <TimelogDetailsModal
          visible={isTimelogModalVisible}
          onClose={handleCloseTimelogModal}
          projectId={projectId || ""}
          projectName={isFixedPriceProject(project) ? project.name : (project as any).projectName || "project"}
          onRefreshProgress={fetchProjectData}
          theme={theme}
        />
      )}
    </Card>
  );
};

export default ProjectDetailPage;
