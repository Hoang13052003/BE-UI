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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../contexts/AuthContext";
import { getProjectByUserIdApi } from "../../api/userApi";
import { Project } from "../../types/project";

const { Title, Text } = Typography;

const CardStyle = {
  height: "350px",
  padding: "16px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
};

interface SummaryCardProps {
  totalProjects: number;
  completedMilestones: number;
  totalMilestones: number;
  totalActualHours: number;
  totalEstimatedHours: number;
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
  });
  const { addAlert } = useAlert();
  const { userDetails } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const calculateSummaryStats = (projectList: Project[]): SummaryCardProps => {
    const stats = projectList.reduce(
      (acc, project) => {
        // Tổng số projects
        acc.totalProjects += 1;

        // Tổng milestones và completed milestones
        if (project.milestoneCount) {
          acc.totalMilestones += project.milestoneCount;
          acc.completedMilestones += project.totalMilestoneCompleted || 0;
        }

        // Tổng giờ thực tế và dự kiến
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
      const projectList = Array.isArray(data) ? data : [];

      // Cập nhật projects và tính toán thống kê
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

  const handleDetailsClick = (id: number) => {
    navigate(`/client/projects/${id}/details`);
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
      default:
        return "default";
    }
  };

  // Grid View Component
  const GridView = () => (
    <Row gutter={[16, 16]}>
      {projects.map((project) => (
        <Col span={8} key={project.id}>
          <Card style={CardStyle}>
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              <Space style={{ justifyContent: "space-between", width: "100%" }}>
                <Title level={5} style={{ margin: 0 }}>
                  {project.name}
                </Title>
                <Tag color={project.type === "FIXED_PRICE" ? "blue" : "green"}>
                  {project.type === "FIXED_PRICE" ? "Fixed Price" : "Labor"}
                </Tag>
              </Space>

              <Text type="secondary" ellipsis={true}>
                {project.description}
              </Text>

              <div>
                <Space
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <Text>Progress</Text>
                  <Text strong>{project.progress}%</Text>
                </Space>
                <Progress percent={project.progress} />
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Start Date</Text>
                  <div>{project.startDate}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">End Date</Text>
                  <div>{project.plannedEndDate}</div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">
                    {project.milestoneCount ? "Milestones" : "Hours"}
                  </Text>
                  <div>
                    {project.milestoneCount
                      ? `${project.totalMilestoneCompleted}/${project.milestoneCount}`
                      : `${project.totalActualHours}/${project.totalEstimatedHours}`}
                  </div>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleDetailsClick(project.id)}
                  >
                    View Details <ArrowRightOutlined />
                  </Button>
                </Col>
              </Row>

              <Text type="secondary" style={{ fontSize: "12px" }}>
                Last Update: {new Date(project.updatedAt).toLocaleString()}
              </Text>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // List View Component
  const ListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={projects}
      renderItem={(project) => (
        <List.Item
          actions={[
            <Button
              type="primary"
              onClick={() => handleDetailsClick(project.id)}
            >
              View Details <ArrowRightOutlined />
            </Button>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Space>
                <Progress
                  strokeLinecap="butt"
                  type="dashboard"
                  percent={project.progress}
                />
              </Space>
            }
            title={
              <Space>
                <Title level={5} style={{ margin: 0 }}>
                  {project.name}
                </Title>
                <Tag color={project.type === "FIXED_PRICE" ? "blue" : "green"}>
                  {project.type === "FIXED_PRICE" ? "Fixed Price" : "Labor"}
                </Tag>
                <Tag color={getStatusColor(project.status)}>
                  {project.status}
                </Tag>
              </Space>
            }
            description={
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="secondary">{project.description}</Text>
                <Row gutter={24}>
                  <Col span={6}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Start Date
                      </Text>
                      <Text>{project.startDate}</Text>
                    </Space>
                  </Col>
                  <Col span={6}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        End Date
                      </Text>
                      <Text>{project.plannedEndDate}</Text>
                    </Space>
                  </Col>
                  <Col span={6}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Last Update
                      </Text>
                      <Text>
                        {new Date(project.updatedAt).toLocaleString()}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={6}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {project.milestoneCount ? "Milestones" : "Est. Hours"}
                      </Text>
                      <Text>
                        {project.milestoneCount
                          ? `${project.totalMilestoneCompleted}/${project.milestoneCount}`
                          : `${project.totalActualHours}/${project.totalEstimatedHours}`}
                      </Text>
                    </Space>
                  </Col>
                </Row>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  return (
    <React.Fragment>
      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 10 }}>
        <Col span={8}>
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
        <Col span={8}>
          <Card style={{ height: "100%" }}>
            <Statistic
              title="Total Hours"
              value={`${summaryStats.totalActualHours}/${summaryStats.totalEstimatedHours}`}
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
        <Col span={8}>
          <Card style={{ height: "100%" }}>
            <Statistic
              title="Completed Milestones"
              value={`${summaryStats.completedMilestones}/${summaryStats.totalMilestones}`}
              prefix={
                <CheckCircleOutlined
                  style={{
                    color: "green",
                  }}
                />
              }
            />
            <Progress percent={77} showInfo={false} />
          </Card>
        </Col>
      </Row>

      {/* Projects Section */}
      <Card
        style={{
          height: "100%",
        }}
        title={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
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
    </React.Fragment>
  );
};

export default Overview;
