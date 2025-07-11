import React, { useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Space,
  Button,
  Tag,
  Statistic,
  List,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../contexts/AuthContext";
import { getProjectByUserIdApi } from "../../api/userApi";
import { Project } from "../../types/project";
import CreateOvertimeRequestModal from "../../components/Manager/OvertimeRequest/CreateOvertimeRequestModal";

const { Title, Text } = Typography;

// Responsive Card Style
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

interface SummaryCardProps {
  totalProjects: number;
  completedMilestones: number;
  totalMilestones: number;
  totalActualHours: number;
  totalEstimatedHours: number;
  fixedPriceMilestoneCount: number; // tổng milestoneCount của Fixed Price
}

// Thêm hàm tính số ngày làm việc (không tính T7, CN)
function getWorkingDays(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let count = 0;
  let cur = new Date(startDate);
  while (cur <= endDate) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [summaryStats, setSummaryStats] = React.useState<SummaryCardProps>({
    totalProjects: 0,
    completedMilestones: 0,
    totalMilestones: 0,
    totalActualHours: 0,
    totalEstimatedHours: 0,
    fixedPriceMilestoneCount: 0,
  });
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [selectedProjectForOvertime, setSelectedProjectForOvertime] = React.useState<Project | null>(null);
  const { addAlert } = useAlert();
  const { userDetails, userRole } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const calculateSummaryStats = (projectList: Project[]): SummaryCardProps => {
    const stats = projectList.reduce(
      (acc, project) => {
        acc.totalProjects += 1;

        if (project.milestoneCount) {
          acc.totalMilestones += project.milestoneCount;
          acc.completedMilestones += project.totalMilestoneCompleted || 0;
        }

        if (project.projectType === "FIXED_PRICE" && project.milestoneCount) {
          acc.fixedPriceMilestoneCount += project.milestoneCount;
        }

        if (project.totalActualHours) {
          acc.totalActualHours += project.totalActualHours;
        }
        if (project.totalEstimatedHours) {
          acc.totalEstimatedHours += project.totalEstimatedHours;
        }

        return acc;
      },
      {
        totalProjects: 0,
        completedMilestones: 0,
        totalMilestones: 0,
        totalActualHours: 0,
        totalEstimatedHours: 0,
        fixedPriceMilestoneCount: 0,
      }
    );

    return stats;
  };

  const fetchProjects = async () => {
    setLoading(true);

    try {
      if (!userDetails?.id) {
        throw new Error("User ID is required");
      }

      const data = await getProjectByUserIdApi(userDetails.id);
      const projectList = Array.isArray(data.projects) ? data.projects : [];
      console.log("Fetched projects:", projectList);

      setProjects(projectList);
      const stats = calculateSummaryStats(projectList);
      setSummaryStats(stats);

      addAlert("Projects fetched successfully", "success");
    } catch (error: any) {
      addAlert(error.message || "Failed to fetch projects", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsClick = (project: Project) => {
    // Determine the correct route path based on project type
    const typePath = project.projectType === "FIXED_PRICE" ? "fixed-price" : "labor";
    
    if (userRole === "USER") {
      navigate(`/client/projects/${typePath}/${project.id}/details`);
    } else {
      navigate(`/manager/projects/${typePath}/${project.id}/details`);
    }
  };

  const handleOvertimeRequest = (project: Project) => {
    setSelectedProjectForOvertime(project);
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setSelectedProjectForOvertime(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "green";
      case "progress":
        return "blue";
      case "pending":
        return "orange";
      case "at_risk":
        return "red";
      case "new":
        return "cyan";
      case "closed":
        return "gold";
      default:
        return "default";
    }
  };

  const GridView = () => (
    <Row gutter={[20, 20]}>
      {projects.map((project) => {
        let laborHours = null;
        if (project.projectType === "LABOR" && project.startDate) {
          const today = new Date();
          const end = today < new Date(project.plannedEndDate) ? today : new Date(project.plannedEndDate);
          const workingDays = getWorkingDays(project.startDate, end.toISOString().slice(0, 10));
          laborHours = workingDays * 8;
        }
        return (
          <Col xs={24} sm={24} md={12} lg={8} xl={8} key={project.id}>
            <Card style={{ ...CardStyle, border: '1px solid #e5e7eb', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 0 }} bodyStyle={{ padding: 0 }}>
              <div style={{ padding: 20 }}>
                {/* Header Tags */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                  <Space size={8}>
                    <Tag color={getStatusColor(project.status)} style={{ borderRadius: 6, fontWeight: 600, border: 'none', fontSize: 13 }}>{project.status}</Tag>
                    <Tag style={{ borderRadius: 6, background: '#f6f6f6', border: 'none', fontWeight: 600, fontSize: 13 }}>
                      <FlagOutlined style={{ marginRight: 4 }} />
                      {project.projectType === "FIXED_PRICE" ? "Fixed Price" : "Labor"}
                    </Tag>
                  </Space>
                </Row>
                {/* Title & Description */}
                <Title level={4} style={{ margin: 0, fontSize: 18, color: '#1a237e', fontWeight: 700 }}>{project.name}</Title>
                <Text type="secondary" ellipsis={true} style={{ maxWidth: "100%", fontSize: 14, color: '#616161', marginBottom: 8, display: 'block' }}>{project.description}</Text>
                {/* Progress Section */}
                <div style={{ margin: '12px 0 12px 0', background: '#fafafa', borderRadius: 8, padding: 12 }}>
                  <Text strong style={{ fontSize: 13 }}>Progress Overview</Text>
                  <Progress percent={project.overallProcess} showInfo={false} strokeColor={project.projectType === "FIXED_PRICE" ? "#1976d2" : "#43a047"} style={{ marginTop: 4 }} />
                </div>
                {/* Info Section */}
                <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
                  <Col xs={24} sm={12} md={8}>
                    <Space align="center">
                      <CalendarOutlined style={{ color: "#52c41a" }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Start Date</Text>
                        <Text style={{ fontSize: 14 }}>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</Text>
                      </div>
                    </Space>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Space align="center">
                      <ClockCircleOutlined style={{ color: "#faad14" }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Planned End</Text>
                        <Text style={{ fontSize: 14 }}>{project.plannedEndDate ? new Date(project.plannedEndDate).toLocaleDateString() : 'Not set'}</Text>
                      </div>
                    </Space>
                  </Col>
                  {/* Hours/Milestones */}
                  {project.projectType === "LABOR" && (
                    <Col xs={24} sm={12} md={8}>
                      <Space align="center">
                        <ClockCircleOutlined style={{ color: "#43a047" }} />
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Hours</Text>
                          <Text style={{ fontWeight: 600, color: '#43a047', fontSize: 15 }}>{laborHours}</Text>
                        </div>
                      </Space>
                    </Col>
                  )}
                  {project.projectType === "FIXED_PRICE" && project.milestoneCount && (
                    <Col xs={24} sm={12} md={8}>
                      <Space align="center">
                        <FlagOutlined style={{ color: "#1976d2" }} />
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Milestones</Text>
                          <Text style={{ fontWeight: 600, color: '#1976d2', fontSize: 15 }}>{`${project.totalMilestoneCompleted || 0}/${project.milestoneCount}`}</Text>
                        </div>
                      </Space>
                    </Col>
                  )}
                </Row>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12, color: '#757575' }}>Last Update: {new Date(project.updatedAt).toLocaleString()}</Text>
                </div>
                <div style={{ marginTop: 18, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button
                    type="default"
                    size="middle"
                    style={{ borderRadius: 8, fontWeight: 600, minWidth: 110 }}
                    icon={<ClockCircleOutlined />}
                    onClick={() => handleOvertimeRequest(project)}
                  >
                    Request Overtime
                  </Button>
                  <Button type="primary" size="middle" style={{ borderRadius: 8, fontWeight: 600, minWidth: 110 }} onClick={() => handleDetailsClick(project)}>
                    View Details <ArrowRightOutlined />
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  // List View Component
  const ListView = () => (
    <List
      itemLayout="vertical"
      dataSource={projects}
      renderItem={(project) => {
        let laborHours = null;
        if (project.projectType === "LABOR" && project.startDate) {
          const today = new Date();
          const end = today < new Date(project.plannedEndDate) ? today : new Date(project.plannedEndDate);
          const workingDays = getWorkingDays(project.startDate, end.toISOString().slice(0, 10));
          laborHours = workingDays * 8;
        }
        return (
          <List.Item
            style={{ borderRadius: 16, border: '1px solid #e5e7eb', marginBottom: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', background: '#fff', padding: 0 }}
          >
            <div style={{ padding: 20 }}>
              {/* Header Tags */}
              <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                <Space size={8}>
                  <Tag color={getStatusColor(project.status)} style={{ borderRadius: 6, fontWeight: 600, border: 'none', fontSize: 13 }}>{project.status}</Tag>
                  <Tag style={{ borderRadius: 6, background: '#f6f6f6', border: 'none', fontWeight: 600, fontSize: 13 }}>
                    <FlagOutlined style={{ marginRight: 4 }} />
                    {project.projectType === "FIXED_PRICE" ? "Fixed Price" : "Labor"}
                  </Tag>
                </Space>
              </Row>
              {/* Title & Description */}
              <Title level={4} style={{ margin: 0, fontSize: 18, color: '#1a237e', fontWeight: 700 }}>{project.name}</Title>
              <Text type="secondary" ellipsis={true} style={{ maxWidth: "100%", fontSize: 14, color: '#616161', marginBottom: 8, display: 'block' }}>{project.description}</Text>
              {/* Progress Section */}
              <div style={{ margin: '12px 0 12px 0', background: '#fafafa', borderRadius: 8, padding: 12 }}>
                <Text strong style={{ fontSize: 13 }}>Progress Overview</Text>
                <Progress percent={project.overallProcess} showInfo={false} strokeColor={project.projectType === "FIXED_PRICE" ? "#1976d2" : "#43a047"} style={{ marginTop: 4 }} />
              </div>
              {/* Info Section */}
              <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
                <Col xs={24} sm={12} md={8}>
                  <Space align="center">
                    <CalendarOutlined style={{ color: "#52c41a" }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Start Date</Text>
                      <Text style={{ fontSize: 14 }}>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</Text>
                    </div>
                  </Space>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Space align="center">
                    <ClockCircleOutlined style={{ color: "#faad14" }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Planned End</Text>
                      <Text style={{ fontSize: 14 }}>{project.plannedEndDate ? new Date(project.plannedEndDate).toLocaleDateString() : 'Not set'}</Text>
                    </div>
                  </Space>
                </Col>
                {/* Hours/Milestones */}
                {project.projectType === "LABOR" && (
                  <Col xs={24} sm={12} md={8}>
                    <Space align="center">
                      <ClockCircleOutlined style={{ color: "#43a047" }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Hours</Text>
                        <Text style={{ fontWeight: 600, color: '#43a047', fontSize: 15 }}>{laborHours}</Text>
                      </div>
                    </Space>
                  </Col>
                )}
                {project.projectType === "FIXED_PRICE" && project.milestoneCount && (
                  <Col xs={24} sm={12} md={8}>
                    <Space align="center">
                      <FlagOutlined style={{ color: "#1976d2" }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Milestones</Text>
                        <Text style={{ fontWeight: 600, color: '#1976d2', fontSize: 15 }}>{`${project.totalMilestoneCompleted || 0}/${project.milestoneCount}`}</Text>
                      </div>
                    </Space>
                  </Col>
                )}
              </Row>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12, color: '#757575' }}>Last Update: {new Date(project.updatedAt).toLocaleString()}</Text>
              </div>
              <div style={{ marginTop: 18, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button
                  type="default"
                  size="middle"
                  style={{ borderRadius: 8, fontWeight: 600, minWidth: 110 }}
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleOvertimeRequest(project)}
                >
                  Request Overtime
                </Button>
                <Button type="primary" size="middle" style={{ borderRadius: 8, fontWeight: 600, minWidth: 110 }} onClick={() => handleDetailsClick(project)}>
                  View Details <ArrowRightOutlined />
                </Button>
              </div>
            </div>
          </List.Item>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 10 }}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card style={{ height: "100%" }}>
            <Statistic
              title="Total Projects"
              value={summaryStats.totalProjects}
              suffix={
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  projects
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card style={{ height: "100%" }}>
            <Statistic
              title="Total Hours"
              value={`${summaryStats.totalEstimatedHours}`}
              prefix={
                <ClockCircleOutlined
                  style={{
                    color: "#1677ff", 
                  }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Card style={{ height: "100%" }}>
            <Statistic
              title={
                summaryStats.fixedPriceMilestoneCount > 0
                  ? "Total Milestones"
                  : "Completed Milestones"
              }
              value={
                summaryStats.fixedPriceMilestoneCount > 0
                  ? summaryStats.fixedPriceMilestoneCount
                  : `${summaryStats.completedMilestones}/${summaryStats.totalMilestones}`
              }
              prefix={
                <CheckCircleOutlined
                  style={{
                    color: "green",
                  }}
                />
              }
            />
            <Progress
              percent={
                summaryStats.totalMilestones && summaryStats.fixedPriceMilestoneCount === 0
                  ? Math.round(
                      (summaryStats.completedMilestones /
                        summaryStats.totalMilestones) *
                        100
                    )
                  : 0
              }
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>
      {/* Projects Section */}
      <Card
        style={{
          height: "100%",
        }}
        title={
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Your Projects ({projects.length})
            </Title>
            <Space>
              <Button
                type={viewMode === "grid" ? "primary" : "text"}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode("grid")}
                size="small"
              >
                Grid
              </Button>
              <Button
                type={viewMode === "list" ? "primary" : "text"}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode("list")}
                size="small"
              >
                List
              </Button>
            </Space>
          </Space>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Text>Loading projects...</Text>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Text type="secondary">No projects found</Text>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            {viewMode === "grid" ? <GridView /> : <ListView />}
          </div>
        )}
      </Card>
      
      {/* Overtime Request Modal */}
      <CreateOvertimeRequestModal
        visible={showCreateModal}
        onCancel={handleModalClose}
        onSuccess={handleModalClose}
        preSelectedProject={selectedProjectForOvertime}
      />
    </React.Fragment>
  );
};

export default Overview;
