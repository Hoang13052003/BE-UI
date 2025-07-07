import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, Spin, Alert, Typography, Button, Row, Col, message } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined
} from "@ant-design/icons";
// removed react-grid-layout in favor of static Ant Design grid

// --- Types ---
import {ProjectFixedPriceDetailsResponse, ProjectDetail } from "../../types/project";

// --- API ---
import { getProjectFixedPriceDetailsApi, getProjectDetailsApi } from "../../api/projectApi";

// --- Components ---
import EditProjectModal from "../../components/Admin/EditProjectModal";
import ProjectUpdatesTab from "../../components/Admin/ProjectDetailsPage/ProjectUpdatesTab";
import ProjectMetricsDisplay from "../../components/Admin/ProjectDetailsPage/ProjectMetricsDisplay";
import WeeklyMilestonesDisplay from "../../components/Admin/ProjectDetailsPage/WeeklyMilestonesDisplay";
import CompactProjectInfo from "../../components/Admin/ProjectDetailsPage/CompactProjectInfo";

import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const { Title } = Typography;

// Thêm type guard để kiểm tra loại project
const isFixedPriceProject = (project: ProjectFixedPriceDetailsResponse | ProjectDetail | null): project is ProjectFixedPriceDetailsResponse => {
  return project !== null && 'completionPercentage' in project;
};

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userRole } = useAuth();
  const location = useLocation();

  // Xác định loại project từ URL
  const isLaborProject = location.pathname.includes('/labor/');
  
  // Sử dụng union type để có thể lưu cả 2 loại dữ liệu
  const [project, setProject] = useState<ProjectFixedPriceDetailsResponse | ProjectDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditProjectModalVisible, setIsEditProjectModalVisible] =
    useState<boolean>(false);

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
        const data = await getProjectDetailsApi(projectId);
        setProject(data);
      } else {
        // Gọi API cho project FIXED_PRICE
        const data = await getProjectFixedPriceDetailsApi(projectId);
        setProject(data);
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
  return (
    <Card>
      {/* Header */}
      {userRole === "ADMIN" || userRole === "MANAGER" ? (
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
        <Col xs={24} lg={16}>
          {/* Project Updates Tab */}
          <Card
            title="Project Updates"
            style={{ marginBottom: 16 }}
            bodyStyle={{ padding: 0 }}
          >
            <ProjectUpdatesTab projectId={parseInt(projectId || "0")} />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Weekly Milestones */}
          {isFixedPriceProject(project) && project.milestoneInWeek && (
            <Card title="This Week's Milestones" style={{ marginBottom: 16 }}>
              <WeeklyMilestonesDisplay milestones={project.milestoneInWeek} />
            </Card>
          )}

          {/* Project Info */}
          <Card title="Project Information">
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <Typography.Text strong>Status:</Typography.Text>{" "}
                <Typography.Text>{project.status}</Typography.Text>
              </Col>

              <Col span={24}>
                <Typography.Text strong>Start Date:</Typography.Text>{" "}
                <Typography.Text>
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "Not set"}
                </Typography.Text>
              </Col>

              <Col span={24}>
                <Typography.Text strong>Planned End Date:</Typography.Text>{" "}
                <Typography.Text>
                  {project.plannedEndDate
                    ? new Date(project.plannedEndDate).toLocaleDateString()
                    : "Not set"}
                </Typography.Text>
              </Col>

              {isFixedPriceProject(project) && (
                <>
                  <Col span={24}>
                    <Typography.Text strong>Created:</Typography.Text>{" "}
                    <Typography.Text>
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleString()
                        : "N/A"}
                    </Typography.Text>
                  </Col>

                  <Col span={24}>
                    <Typography.Text strong>Last Updated:</Typography.Text>{" "}
                    <Typography.Text>
                      {project.updatedAt
                        ? new Date(project.updatedAt).toLocaleString()
                        : "N/A"}
                    </Typography.Text>
                  </Col>

                  <Col span={24}>
                    <Typography.Text strong>Overdue:</Typography.Text>{" "}
                    <Typography.Text>
                      {project.isOverdue ? "Yes" : "No"}
                    </Typography.Text>
                  </Col>

                  <Col span={24}>
                    <Typography.Text strong>Completion:</Typography.Text>{" "}
                    <Typography.Text>
                      {project.completionPercentage}%
                    </Typography.Text>
                  </Col>

                  <Col span={24}>
                    <Typography.Text strong>Total Milestones:</Typography.Text>{" "}
                    <Typography.Text>{project.totalMilestoneCount}</Typography.Text>
                  </Col>

                  <Col span={24}>
                    <Typography.Text strong>New Milestones:</Typography.Text>{" "}
                    <Typography.Text>{project.newMilestones}</Typography.Text>
                  </Col>
                </>
              )}
            </Row>
          </Card>
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
    </Card>
  );
};

export default ProjectDetailPage;
