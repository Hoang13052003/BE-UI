import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Alert, Typography, Button, Row, Col, message } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
// removed react-grid-layout in favor of static Ant Design grid

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
    <div>
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

      {/* Static Layout using Ant Design Grid */}
      <Row gutter={[16, 16]}>
        {/* Overview: full width on xs, sm, md; half width on lg and xl */}{" "}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Card
            title="Project Overview"
            style={{ border: "none" }}
            styles={{ body: { padding: 16 } }}
          >
            <ProjectDetailsDisplay
              project={project as any}
              theme={theme}
              onRefreshProgress={fetchProjectData} // Thêm callback để refresh project data
            />
          </Card>
        </Col>
        {/* Milestones/Time Logs: full width on xs, sm, md; half width on lg and xl */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Card
            title={
              project.type === "FIXED_PRICE"
                ? "Project Milestones"
                : "Time Logs"
            }
            style={{ border: "none" }}
            styles={{ body: { padding: 16 } }}
          >
            {project.type === "FIXED_PRICE" ? (
              <ProjectMilestonesTab projectId={project.id} />
            ) : (
              <ProjectTimeLogsTab projectId={project.id} />
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title="Project Updates Timeline"
            style={{ border: "none" }}
            styles={{ body: { padding: 16 } }}
          >
            <ProjectUpdatesTab projectId={project.id} theme={theme} />
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
