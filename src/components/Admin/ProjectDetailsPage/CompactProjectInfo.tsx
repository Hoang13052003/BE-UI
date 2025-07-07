import React from "react";
import { Space, Tag, Typography, Avatar, Row, Col, Progress } from "antd";
import { 
  UserOutlined, 
  FlagOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { ProjectFixedPriceDetailsResponse, UserBasicResponseDto } from "../../../types/project";

const { Text } = Typography;

interface CompactProjectInfoProps {
  project: ProjectFixedPriceDetailsResponse;
  theme?: string;
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

const CompactProjectInfo: React.FC<CompactProjectInfoProps> = ({
  project,
  theme,
}) => {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Not set";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const renderUserAvatars = () => {
    if (!project.users || project.users.length === 0) {
      return <Text type="secondary">No users assigned</Text>;
    }

    const visibleUsers = project.users.slice(0, 4);
    const remainingCount = project.users.length - 4;

    return (
      <Space wrap>
        <Avatar.Group maxCount={4} size="small">
          {visibleUsers.map((user: UserBasicResponseDto) => (
            <Avatar
              key={user.id}
              size="small"
              src={user.image}
              icon={!user.image && <UserOutlined />}
            >
              {!user.image && user.fullName ? user.fullName.charAt(0).toUpperCase() : null}
            </Avatar>
          ))}
        </Avatar.Group>
        {remainingCount > 0 && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            +{remainingCount} more
          </Text>
        )}
      </Space>
    );
  };

  return (
    <div>
      {/* Status and Type */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Tag color={getStatusColor(project.status)} style={{ fontWeight: "bold" }}>
          <CheckCircleOutlined style={{ marginRight: 4 }} />
          {project.status}
        </Tag>
        <Tag style={{ background: theme === "dark" ? "#262626" : "#f6f6f6" }}>
          <FlagOutlined style={{ marginRight: 4 }} />
          FIXED PRICE
        </Tag>
        {project.isActive && (
          <Tag color="green" style={{ fontSize: '11px' }}>
            ACTIVE
          </Tag>
        )}
      </Space>

      {/* Project Name & Description */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: 4 }}>
          {project.name}
        </Text>
        {project.description && (
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {project.description}
          </Text>
        )}
      </div>

      {/* Key Info Grid */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              Start Date
            </Text>
            <Text style={{ fontSize: '12px' }}>{formatDate(project.startDate)}</Text>
          </div>
        </Col>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              Deadline
            </Text>
            <Text style={{ fontSize: '12px' }}>{formatDate(project.plannedEndDate)}</Text>
          </div>
        </Col>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
              <DollarOutlined style={{ marginRight: 4 }} />
              Budget
            </Text>
            <Text style={{ fontSize: '12px' }}>{formatCurrency(project.totalBudget)}</Text>
          </div>
        </Col>
        <Col span={12}>
          <div>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: 4 }}>
              Progress
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Progress
                type="circle"
                size={28}
                percent={Math.round(project.overallProcess || 0)}
                strokeWidth={8}
                format={(percent) => <span style={{ fontSize: '10px' }}>{percent}%</span>}
              />
              <Text style={{ fontSize: '12px' }}>Overall Progress</Text>
            </div>
          </div>
        </Col>
      </Row>

      {/* Team Members */}
      <div>
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: 8 }}>
          <UserOutlined style={{ marginRight: 4 }} />
          Team Members ({project.users.length})
        </Text>
        {renderUserAvatars()}
      </div>

      {/* Footer info */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${theme === "dark" ? "#303030" : "#f0f0f0"}` }}>
        <Text type="secondary" style={{ fontSize: '11px' }}>
          Created: {formatDate(project.createdAt)} | Updated: {formatDate(project.updatedAt)}
        </Text>
      </div>
    </div>
  );
};

export default CompactProjectInfo;
