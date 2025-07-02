import React from "react";
import {
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Tooltip,
  Progress,
  Card,
  Avatar,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Project,
  ProjectDetail,
  UserSummary,
  ProjectUser,
} from "../../types/project";
import MilestoneDetailsDisplayInternal from "./MilestoneDetailsDisplay";
import TimelogDetailsDisplayInternal from "./TimelogDetailsDisplay";

const { Title, Text, Paragraph } = Typography;

interface ProjectDetailsDisplayProps {
  project: Project | ProjectDetail;
  theme?: string;

  isExpanded?: boolean;
  expandedTimelogProjectId?: string | null;
  onToggleMilestoneDetail?: (id: string) => void;
  onToggleTimelogDetail?: (id: string) => void;

  onAddMilestone?: (projectId: string, refreshCallback?: () => void) => void;
  onEditMilestone?: (
    milestoneId: number,
    projectId: string,
    refreshCallback?: () => void
  ) => void;

  milestoneCount?: number;
  newMilestoneCount?: number;
  sentMilestoneCount?: number;
  reviewedMilestoneCount?: number;

  currentUserIsAdmin?: boolean;

  onRefreshProgress?: () => void;
}

const getStatusColor = (
  status: Project["status"] | ProjectDetail["status"]
) => {
  switch (status) {
    case "NEW":
      return "cyan";
    case "PENDING":
      return "gold";
    case "PROGRESS":
      return "blue";
    case "CLOSED":
      return "green";
    default:
      return "default";
  }
};

const isProjectDetail = (
  project: Project | ProjectDetail
): project is ProjectDetail => {
  return (
    (project as ProjectDetail).users !== undefined &&
    (project.users?.length === 0 ||
      (project.users?.[0] as UserSummary).fullName !== undefined)
  );
};

const ProjectDetailsDisplay: React.FC<ProjectDetailsDisplayProps> = ({
  project,
  theme,
  isExpanded,
  expandedTimelogProjectId,
  onToggleMilestoneDetail,
  onToggleTimelogDetail,
  onAddMilestone,
  onEditMilestone,
  milestoneCount,
  newMilestoneCount,
  sentMilestoneCount,
  reviewedMilestoneCount,
  currentUserIsAdmin = false,
  onRefreshProgress,
}) => {
  const projectData = project;

  const handleRefreshWithProgress = (callback?: () => void) => {
    if (callback) callback();
    if (onRefreshProgress) onRefreshProgress();
  };
  const handleProjectCardClick = (e: React.MouseEvent) => {
    const target = e.target as Element;
    if (
      target.closest(".project-card-clickable") ||
      e.target === e.currentTarget
    ) {
      if (projectData.projectType === "FIXED_PRICE" && onToggleMilestoneDetail) {
        onToggleMilestoneDetail(projectData.id);
      } else if (projectData.projectType === "LABOR" && onToggleTimelogDetail) {
        onToggleTimelogDetail(projectData.id);
      }
    }
  };

  const createMilestoneStatusColors = () => {
    const colors = [];
    if (
      !isProjectDetail(projectData) &&
      newMilestoneCount !== undefined &&
      sentMilestoneCount !== undefined &&
      reviewedMilestoneCount !== undefined
    ) {
      for (let i = 0; i < newMilestoneCount; i++) colors.push("#1890ff"); // TODO
      for (let i = 0; i < sentMilestoneCount; i++) colors.push("#faad14"); // PENDING  
      for (let i = 0; i < reviewedMilestoneCount; i++) colors.push("#52c41a"); // COMPLETED
    }
    return colors;
  };

  const calculateLaborProgress = () => {
    if (
      projectData.projectType !== "LABOR" ||
      !projectData.totalEstimatedHours ||
      !projectData.startDate
    ) {
      return { percent: 0, totalDays: 0, currentDay: 0 };
    }

    const HOURS_PER_DAY = 8;
    const totalDays = Math.ceil(
      projectData.totalEstimatedHours / HOURS_PER_DAY
    );
    const startDate = new Date(projectData.startDate);
    const currentDate = new Date();

    const timeDiff = currentDate.getTime() - startDate.getTime();
    const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    if (currentDate < startDate) {
      return { percent: 0, totalDays, currentDay: 0 };
    }

    const currentDay = Math.max(0, Math.min(daysPassed, totalDays));
    const percent =
      totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0;

    return { percent, totalDays, currentDay };
  };

  const renderUserAvatars = () => {
    if (!projectData.users || projectData.users.length === 0) {
      return <Text type="secondary">No users assigned</Text>;
    }

    const visibleUsers = projectData.users.slice(0, 3);
    const remainingCount = projectData.users.length - 3;

    return (
      <Space>
        <Avatar.Group
          maxCount={3}
          maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
        >
          {visibleUsers.map((user) => {
            // Ưu tiên hiển thị fullName, fallback về email
            const displayName = (user as UserSummary).fullName || (user as ProjectUser).email;
            const tooltipText = (user as UserSummary).fullName 
              ? `${(user as UserSummary).fullName} (${(user as UserSummary).email})`
              : (user as ProjectUser).email;
            
            return (
              <Tooltip
                key={user.id}
                title={tooltipText}
              >
                <Avatar style={{ backgroundColor: "#87d068" }}>
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            );
          })}
        </Avatar.Group>
        {remainingCount > 0 && (
          <Text type="secondary">+{remainingCount} more</Text>
        )}
      </Space>
    );
  };

  const renderProgressSection = () => {
    const commonProgressStyle = {
      background: theme === "dark" ? "#1f1f1f" : "#fafafa",
      border: "none",
      borderRadius: "8px",
      marginBottom: "16px",
    };
    const renderOverallActualProgress = () => {
      if (
        projectData.overallProcess === undefined ||
        projectData.actualProcess === undefined
      ) {
        return null;
      }

      return (
        <Card size="small" style={commonProgressStyle}>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Text strong>Progress Overview</Text>

            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: "12px",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Overall Progress:{" "}
                {projectData.overallProcess?.toFixed(2) || "0.00"}%
              </Text>
              <Progress
                percent={Number(projectData.overallProcess)}
                strokeColor="#1890ff"
                trailColor={theme === "dark" ? "#424242" : "#f0f0f0"}
                format={() =>
                  `${Number(projectData.overallProcess)?.toFixed(2) || "0.00"}%`
                }
                size="small"
              />
            </div>

            <div>
              <Text
                type="secondary"
                style={{
                  fontSize: "12px",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                Actual Progress Today:{" "}
                {projectData.actualProcess?.toFixed(2) || "0.00"}%
              </Text>
              <Progress
                percent={Number(projectData.actualProcess)}
                strokeColor="#52c41a"
                trailColor={theme === "dark" ? "#424242" : "#f0f0f0"}
                format={() =>
                  `${Number(projectData.actualProcess)?.toFixed(2) || "0.00"}%`
                }
                size="small"
              />
            </div>
          </Space>
        </Card>
      );
    };

    if (projectData.projectType === "LABOR" && projectData.totalEstimatedHours) {
      const progress = calculateLaborProgress();
      return (
        <>
          {renderOverallActualProgress()}
          <Card size="small" style={commonProgressStyle}>
            <Row align="middle" gutter={16}>
              <Col>
                <Progress
                  type="circle"
                  size={60}
                  percent={progress.percent}
                  format={() => `${progress.currentDay}/${progress.totalDays}`}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                  strokeWidth={6}
                />
              </Col>
              <Col>
                <Space direction="vertical" size={0}>
                  <Text strong>Labor Progress</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {progress.currentDay} of {progress.totalDays} days
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {projectData.totalEstimatedHours}h estimated
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </>
      );
    }

    if (
      !isProjectDetail(projectData) &&
      projectData.projectType === "FIXED_PRICE" &&
      typeof milestoneCount === "number" &&
      milestoneCount > 0
    ) {
      return (
        <>
          {renderOverallActualProgress()}
          <Card size="small" style={commonProgressStyle}>
            <Space direction="vertical" size={4}>
              <Text strong>Milestone Progress</Text>
              <Progress
                steps={milestoneCount}
                percent={100}
                strokeColor={createMilestoneStatusColors()}
                format={() => `${milestoneCount} milestones`}
                strokeWidth={12}
                size="small"
              />
              <Space size={8}>
                <Tag color="blue" style={{ fontSize: "12px" }}>
                  New: {newMilestoneCount}
                </Tag>
                <Tag color="gold" style={{ fontSize: "12px" }}>
                  Sent: {sentMilestoneCount}
                </Tag>
                <Tag color="green" style={{ fontSize: "12px" }}>
                  Reviewed: {reviewedMilestoneCount}
                </Tag>
              </Space>
            </Space>
          </Card>
        </>
      );
    }

    if (
      projectData.overallProcess !== undefined &&
      projectData.actualProcess !== undefined
    ) {
      return renderOverallActualProgress();
    }

    return null;
  };
  return (
    <Card
      hoverable
      onClick={handleProjectCardClick}
      style={{
        borderRadius: "12px",
        boxShadow:
          theme === "dark"
            ? "0 2px 8px rgba(255,255,255,0.05)"
            : "0 2px 8px rgba(0,0,0,0.06)",
        border: theme === "dark" ? "1px solid #303030" : "1px solid #f0f0f0",
        cursor: "pointer",
      }}
      styles={{ body: { padding: "20px" } }}
    >
      <Row
        justify="space-between"
        align="top"
        style={{ marginBottom: "16px" }}
        className="project-card-clickable"
      >
        <Col flex="auto">
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {/* Status and Type Tags */}
            <Row justify="space-between" align="middle">
              <Space size={8}>
                <Tag
                  color={getStatusColor(projectData.status)}
                  style={{
                    borderRadius: "6px",
                    fontWeight: "bold",
                    border: "none",
                  }}
                >
                  {projectData.status}
                </Tag>{" "}
                <Tag
                  style={{
                    borderRadius: "6px",
                    background: theme === "dark" ? "#262626" : "#f6f6f6",
                    border: "none",
                  }}
                >
                  <FlagOutlined style={{ marginRight: "4px" }} />
                  {projectData.projectType}
                </Tag>
                {/* Expand Status Indicator */}
                {projectData.projectType === "FIXED_PRICE" && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                      fontStyle: "italic",
                    }}
                  >
                    {isExpanded
                      ? "👇 Milestones expanded"
                      : "📋 Click to view milestones"}
                  </Text>
                )}
                {projectData.projectType === "LABOR" && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                      fontStyle: "italic",
                    }}
                  >
                    {expandedTimelogProjectId === projectData.id
                      ? "👇 Timelogs expanded"
                      : "⏰ Click to view timelogs"}
                  </Text>
                )}
              </Space>
            </Row>

            {/* Project Name */}
            <Title
              level={4}
              style={{
                margin: 0,
                fontSize: "18px",
                color: theme === "dark" ? "#fff" : "#262626",
              }}
            >
              {projectData.name}
            </Title>

            {/* Description */}
            <Paragraph
              type="secondary"
              ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
              style={{ margin: 0, fontSize: "14px" }}
            >
              {projectData.description}
            </Paragraph>
          </Space>
        </Col>
      </Row>{" "}
      {/* Progress Section */}
      {renderProgressSection() && (
        <div
          style={{ marginBottom: "16px" }}
          className="project-card-clickable"
        >
          {renderProgressSection()}
        </div>
      )}
      {/* Info Section */}
      <Row gutter={[16, 8]} className="project-card-clickable">
        <Col xs={24} sm={12} md={8}>
          <Space align="center">
            <TeamOutlined style={{ color: "#1890ff" }} />
            <div>
              <Text
                type="secondary"
                style={{ fontSize: "12px", display: "block" }}
              >
                Team Members
              </Text>
              {renderUserAvatars()}
            </div>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Space align="center">
            <CalendarOutlined style={{ color: "#52c41a" }} />
            <div>
              <Text
                type="secondary"
                style={{ fontSize: "12px", display: "block" }}
              >
                Start Date
              </Text>
              <Text style={{ fontSize: "14px" }}>
                {projectData.startDate
                  ? new Date(projectData.startDate).toLocaleDateString()
                  : "Not set"}
              </Text>
            </div>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Space align="center">
            <ClockCircleOutlined style={{ color: "#faad14" }} />
            <div>
              <Text
                type="secondary"
                style={{ fontSize: "12px", display: "block" }}
              >
                Planned End
              </Text>
              <Text style={{ fontSize: "14px" }}>
                {projectData.plannedEndDate
                  ? new Date(projectData.plannedEndDate).toLocaleDateString()
                  : "Not set"}
              </Text>
            </div>
          </Space>
        </Col>{" "}
      </Row>
      {/* Expanded Sections */}
      {isExpanded &&
        onToggleMilestoneDetail &&
        projectData.projectType === "FIXED_PRICE" &&
        onAddMilestone &&
        onEditMilestone && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: "16px",
              padding: "16px",
              background: theme === "dark" ? "#1a1a1a" : "#fafafa",
              borderRadius: "8px",
              border: `1px solid ${theme === "dark" ? "#303030" : "#f0f0f0"}`,
            }}
          >
            <MilestoneDetailsDisplayInternal
              projectId={projectData.id}
              onAddMilestone={(refreshCallback) =>
                currentUserIsAdmin &&
                onAddMilestone(projectData.id, () =>
                  handleRefreshWithProgress(refreshCallback)
                )
              } // Chỉ cho admin
              onEditMilestone={
                currentUserIsAdmin
                  ? (milestoneId, projectId, refreshCallback) =>
                      onEditMilestone &&
                      onEditMilestone(milestoneId, projectId, () =>
                        handleRefreshWithProgress(refreshCallback)
                      )
                  : undefined
              } // Chỉ cho admin
              onRefreshProgress={onRefreshProgress} // Truyền callback xuống milestone
            />
          </div>
        )}
      {expandedTimelogProjectId === projectData.id &&
        onToggleTimelogDetail &&
        projectData.projectType === "LABOR" && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: "16px",
              padding: "16px",
              background: theme === "dark" ? "#1a1a1a" : "#fafafa",
              borderRadius: "8px",
              border: `1px solid ${theme === "dark" ? "#303030" : "#f0f0f0"}`,
            }}
          >
            <TimelogDetailsDisplayInternal
              projectId={projectData.id}
              theme={theme}
              isAdmin={currentUserIsAdmin}
              onRefreshProgress={onRefreshProgress}
            />
          </div>
        )}
    </Card>
  );
};

export default ProjectDetailsDisplay;
