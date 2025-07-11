import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Statistic,
  Spin,
} from "antd";
import {
  ProjectOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../contexts/AuthContext";
import { getProjectByUserIdApi } from "../../api/userApi";
import { Project } from "../../types/project";
import ProjectCard from "../../components/Client/ProjectCard";
import SendFeedbackModal from "./SendFeedbackModal";
import { ProjectUpdate } from "../../api/projectUpdateApi";

const { Title, Text } = Typography;

// Card style consistent with other overview pages
const CardStyle = {
  minHeight: "370px",
  padding: "20px 18px 16px 18px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  background: "#fff",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
};

interface ClientSummaryStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  averageProgress: number;
  totalInvestment: number;
  upcomingDeadlines: number;
}

const OverviewClient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [summaryStats, setSummaryStats] = useState<ClientSummaryStats>({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    averageProgress: 0,
    totalInvestment: 0,
    upcomingDeadlines: 0,
  });
  const [selectedProjectForFeedback, setSelectedProjectForFeedback] = useState<Project | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { addAlert } = useAlert();
  const { userDetails } = useAuth();

  useEffect(() => {
    fetchClientProjects();
  }, []);

  const calculateSummaryStats = (projectList: Project[]): ClientSummaryStats => {
    const stats = projectList.reduce(
      (acc, project) => {
        acc.totalProjects += 1;
        
        if (project.status?.toLowerCase() === "completed") {
          acc.completedProjects += 1;
        }
        
        if (project.status?.toLowerCase() === "progress") {
          acc.inProgressProjects += 1;
        }
        
        acc.averageProgress += project.overallProcess || 0;
        
        if (project.totalBudget) {
          acc.totalInvestment += project.totalBudget;
        }
        
        // Check upcoming deadlines (within 7 days)
        if (project.plannedEndDate && project.status?.toLowerCase() !== "completed") {
          const endDate = new Date(project.plannedEndDate);
          const today = new Date();
          const diffTime = endDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 7 && diffDays >= 0) {
            acc.upcomingDeadlines += 1;
          }
        }
        
        return acc;
      },
      {
        totalProjects: 0,
        completedProjects: 0,
        inProgressProjects: 0,
        averageProgress: 0,
        totalInvestment: 0,
        upcomingDeadlines: 0,
      }
    );

    // Calculate average progress
    if (stats.totalProjects > 0) {
      stats.averageProgress = Math.round(stats.averageProgress / stats.totalProjects);
    }

    return stats;
  };

  const fetchClientProjects = async () => {
    setLoading(true);
    try {
      if (!userDetails?.id) {
        throw new Error("User ID is required");
      }

      const data = await getProjectByUserIdApi(userDetails.id);
      const projectList = Array.isArray(data.projects) ? data.projects : [];
      
      setProjects(projectList);
      const stats = calculateSummaryStats(projectList);
      setSummaryStats(stats);

      addAlert("Projects loaded successfully", "success");
    } catch (error: any) {
      addAlert(error.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (project: Project) => {
    navigate(`/client/projects/${project.projectType?.toLowerCase()}/${project.id}/details`);
  };

  const handleSendFeedback = (project: Project) => {
    setSelectedProjectForFeedback(project);
    setShowFeedbackModal(true);
  };

  const handleFeedbackModalClose = () => {
    setShowFeedbackModal(false);
    setSelectedProjectForFeedback(null);
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackModal(false);
    setSelectedProjectForFeedback(null);
    fetchClientProjects(); // Refresh data after feedback
  };

  // Create fake ProjectUpdate data for SendFeedbackModal
  const createFakeProjectUpdate = (project: Project): ProjectUpdate => ({
    id: 0, // Fake update ID for general project feedback
    projectId: project.id,
    projectName: project.name,
    projectType: project.projectType || "FIXED_PRICE",
    userId: userDetails?.id || 0,
    email: userDetails?.email || "",
    updateDate: new Date().toISOString(),
    summary: `General feedback for ${project.name}`,
    details: null,
    statusAtUpdate: project.status || "NEW",
    overallProcess: project.overallProcess || 0,
    published: false,
    internalNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });



  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: '24px' }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#1a237e' }}>
          Welcome back, {userDetails?.fullName || 'Client'}! 👋
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Here's an overview of your projects and their progress
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={summaryStats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1976d2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={summaryStats.completedProjects}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Progress"
              value={summaryStats.averageProgress}
              suffix="%"
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Upcoming Deadlines"
              value={summaryStats.upcomingDeadlines}
              prefix={<CalendarOutlined />}
              valueStyle={{ 
                color: summaryStats.upcomingDeadlines > 0 ? '#fa8c16' : '#52c41a' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Projects Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ProjectOutlined />
                <span>My Projects</span>
              </div>
            }
            extra={
              <Button type="primary" onClick={() => navigate('/client/project-progress')}>
                View All Projects
              </Button>
            }
          >
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <ProjectOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
                <Title level={4} style={{ color: '#bfbfbf' }}>No Projects Yet</Title>
                <Text type="secondary">
                  You don't have any projects assigned yet. Contact your project manager for more information.
                </Text>
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {projects.slice(0, 6).map((project) => (
                  <Col xs={24} sm={12} lg={8} key={project.id}>
                    <ProjectCard
                      project={project}
                      onViewDetails={handleViewDetails}
                      onSendFeedback={handleSendFeedback}
                      size="small"
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>
      </Row>

      {/* Feedback Modal */}
      {selectedProjectForFeedback && (
        <SendFeedbackModal
          visible={showFeedbackModal}
          onClose={handleFeedbackModalClose}
          onSuccess={handleFeedbackSuccess}
          updateData={createFakeProjectUpdate(selectedProjectForFeedback)}
        />
      )}
    </div>
  );
};

export default OverviewClient; 