import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Space,
  Button,
  Tag,
  Divider,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ProjectOutlined,
  MessageOutlined,
  EyeOutlined,
  CalendarOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { Project } from "../../types/project";

const { Title, Text } = Typography;

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
  onSendFeedback: (project: Project) => void;
  size?: "small" | "default";
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewDetails,
  onSendFeedback,
  size = "default",
}) => {
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircleOutlined />;
      case "progress":
        return <ClockCircleOutlined />;
      default:
        return <ProjectOutlined />;
    }
  };

  return (
    <Card 
      size={size}
      style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: '100%'
      }}
    >
      {/* Project Header */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <Tag 
            color={getStatusColor(project.status)} 
            icon={getStatusIcon(project.status)}
            style={{ borderRadius: 4, fontWeight: 600 }}
          >
            {project.status}
          </Tag>
          <Tag style={{ borderRadius: 4, background: '#f6f6f6', border: 'none', fontWeight: 600 }}>
            <FlagOutlined style={{ marginRight: 4 }} />
            {project.projectType === "FIXED_PRICE" ? "Fixed Price" : "Labor"}
          </Tag>
        </div>
        <Title level={5} style={{ margin: 0, color: '#1a237e', fontSize: '16px' }}>
          {project.name}
        </Title>
        <Text type="secondary" ellipsis style={{ fontSize: '14px' }}>
          {project.description}
        </Text>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <Text strong style={{ fontSize: '13px' }}>Progress</Text>
          <Text style={{ fontSize: '13px', fontWeight: 600 }}>{project.overallProcess || 0}%</Text>
        </div>
        <Progress 
          percent={project.overallProcess || 0} 
          showInfo={false} 
          strokeColor={project.projectType === "FIXED_PRICE" ? "#1976d2" : "#43a047"}
          size="small"
        />
      </div>

      {/* Project Info */}
      <div style={{ marginBottom: '12px' }}>
        <Row gutter={[8, 4]}>
          <Col span={12}>
            <Space align="center" size={4}>
              <CalendarOutlined style={{ color: "#52c41a", fontSize: '12px' }} />
              <div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>Start</Text>
                <Text style={{ fontSize: '12px' }}>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                </Text>
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Space align="center" size={4}>
              <ClockCircleOutlined style={{ color: "#faad14", fontSize: '12px' }} />
              <div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>Deadline</Text>
                <Text style={{ fontSize: '12px' }}>
                  {project.plannedEndDate ? new Date(project.plannedEndDate).toLocaleDateString() : 'Not set'}
                </Text>
              </div>
            </Space>
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button 
          type="primary" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => onViewDetails(project)}
          style={{ flex: 1, fontSize: '12px' }}
        >
          View Details
        </Button>
        <Button 
          size="small" 
          icon={<MessageOutlined />}
          onClick={() => onSendFeedback(project)}
          style={{ fontSize: '12px' }}
        >
          Feedback
        </Button>
      </div>
    </Card>
  );
};

export default ProjectCard; 