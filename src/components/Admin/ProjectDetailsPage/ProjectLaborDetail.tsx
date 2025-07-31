import React from "react";
import { Space, Tag, Typography, Avatar, Row, Col, Progress, Card } from "antd";
import { UserOutlined, FlagOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { ProjectLaborDetailResponse, UserBasicResponseDto } from "../../../types/project";

const { Text } = Typography;

interface Props {
  project: ProjectLaborDetailResponse;
  users: UserBasicResponseDto[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "NEW":
      return "cyan";
    case "PENDING":
      return "gold";
    case "PROGRESS":
      return "blue";
    case "COMPLETED":
      return "green";
    case "CLOSED":
      return "gray";
    default:
      return "default";
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString();
};

const ProjectLaborDetail: React.FC<Props> = ({ project, users }) => {
  const renderUserAvatars = () => {
    if (!users || users.length === 0) {
      return <Text type="secondary">No users assigned</Text>;
    }
    const visibleUsers = users.slice(0, 4);
    const remainingCount = users.length - 4;
    return (
      <Space wrap>
        <Avatar.Group max={{ count: 4 }}>
          {visibleUsers.map((user: any) => (
            <Avatar
              key={user.id}
              icon={<UserOutlined />}
            >
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : null}
            </Avatar>
          ))}
        </Avatar.Group>
        {remainingCount > 0 && (
          <Text type="secondary">
            +{remainingCount} more
          </Text>
        )}
      </Space>
    );
  };

  return (
    <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2", padding: 24 }}>
      {/* Status and Type */}
      <Space style={{ marginBottom: 20 }} wrap>
        <Tag color={getStatusColor(project.status)} style={{ fontWeight: "bold" }}>
          <CheckCircleOutlined style={{ marginRight: 6 }} />
          {project.status}
        </Tag>
        <Tag style={{ background: "#f6f6f6" }}>
          <FlagOutlined style={{ marginRight: 6 }} />
          LABOR
        </Tag>
      </Space>

      {/* Project Name & Description */}
      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ fontSize: 18, display: 'block', marginBottom: 6 }}>
          {project.projectName}
        </Text>
        {project.description && (
          <Text type="secondary" style={{ fontSize: 15 }}>
            {project.description}
          </Text>
        )}
      </div>

      {/* Key Info Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ display: 'block' }}>
              <CalendarOutlined style={{ marginRight: 6 }} />
              Start Date
            </Text>
            <Text>{formatDate(project.startDate)}</Text>
          </div>
        </Col>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ display: 'block' }}>
              <CalendarOutlined style={{ marginRight: 6 }} />
              Deadline
            </Text>
            <Text>{formatDate(project.plannedEndDate)}</Text>
          </div>
        </Col>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
              Progress
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Progress
                type="circle"
                size={40}
                percent={Math.round(project.overallProcess || 0)}
                strokeWidth={8}
                format={(percent) => <span style={{ fontSize: 13 }}>{percent}%</span>}
              />
              <Text>Overall Progress</Text>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ display: 'block' }}>
              Created At
            </Text>
            <Text>{formatDate(project.createdAt)}</Text>
          </div>
        </Col>
      </Row>

      {/* Team Members */}
      <div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 10 }}>
          <UserOutlined style={{ marginRight: 6 }} />
          Team Members ({users?.length || 0})
        </Text>
        {renderUserAvatars()}
      </div>

      {/* Footer info */}
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid #f0f0f0` }}>
        <Text type="secondary">
          Updated: {formatDate(project.updatedAt)}
        </Text>
      </div>
    </Card>
  );
};

export default ProjectLaborDetail; 