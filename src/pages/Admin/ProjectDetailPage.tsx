import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Typography, Button, Row, Col, message } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
// removed react-grid-layout in favor of static Ant Design grid

// --- Types ---
import { Project, ProjectFixedPriceDetailsResponse } from "../../types/project";

// --- API ---
import { getProjectFixedPriceDetailsApi } from "../../api/projectApi";

// --- Components ---
import EditProjectModal from "../../components/Admin/EditProjectModal";
import ProjectUpdatesTab from "../../components/Admin/ProjectDetailsPage/ProjectUpdatesTab";
import ProjectMetricsDisplay from "../../components/Admin/ProjectDetailsPage/ProjectMetricsDisplay";
import WeeklyMilestonesDisplay from "../../components/Admin/ProjectDetailsPage/WeeklyMilestonesDisplay";
import CompactProjectInfo from "../../components/Admin/ProjectDetailsPage/CompactProjectInfo";

import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const { Title } = Typography;

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { userRole } = useAuth();

  const [project, setProject] = useState<ProjectFixedPriceDetailsResponse | null>(null);
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
      // Use the new fixed price project details API (string ID)
      const data = await getProjectFixedPriceDetailsApi(projectId);
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
          <ProjectMetricsDisplay project={project} />
        </Col>
      </Row>

      {/* Main Content Layout - 2 columns */}
      <Row gutter={[16, 16]}>
        {/* Project Basic Info - Compact */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Card
            title={
              <span>
                <ProjectOutlined style={{ marginRight: 8 }} />
                Project Details
              </span>
            }
            size="small"            >
              <CompactProjectInfo
                project={project}
                theme={theme}
              />
            </Card>
        </Col>

        {/* Weekly Milestones */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <WeeklyMilestonesDisplay milestones={project.milestoneInWeek} />
        </Col>
      </Row>
      
      {/* Project Updates - Full Width */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Project Updates Timeline">
            <ProjectUpdatesTab projectId={Number(project.id)} theme={theme} />
          </Card>
        </Col>
      </Row>

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
              projectType: "FIXED_PRICE" as const, // This API is for fixed price projects
              status: project.status,
              startDate: project.startDate || "",
              plannedEndDate: project.plannedEndDate || "",
              actualEndDate: project.actualEndDate,
              totalBudget: project.totalBudget || 0,
              totalEstimatedHours: null,
              overallProcess: project.overallProcess || 0,
              actualProcess: project.actualProcess || 0,
              deleted: project.deleted,
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
              createdBy: null,
              updatedBy: null,
              completed: project.status === "COMPLETED",
              overdue: project.isOverdue || false,
              laborProject: false,
              fixedPriceProject: true,
              progress: project.completionPercentage,
              milestoneCount: project.totalMilestoneCount,
              newMilestoneCount: project.newMilestones,
              sentMilestoneCount: project.sentMilestones,
              reviewedMilestoneCount: project.reviewedMilestones,
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
    </Card>
  );
};

export default ProjectDetailPage;
