import React from "react";
import { Card, Row, Col, Statistic, Tag, Typography, Progress } from "antd";
import {
  CalendarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { ProjectFixedPriceDetailsResponse } from "../../../types/project";

const { Text } = Typography;

interface ProjectMetricsDisplayProps {
  project: ProjectFixedPriceDetailsResponse;
}

const ProjectMetricsDisplay: React.FC<ProjectMetricsDisplayProps> = ({
  project,
}) => {
  return (
    <Card title="🆕 Weekly Metrics & Timeline" size="small">
      {/* Key Metrics Row 1 - Primary data */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic
            title="🌟 Completed This Week"
            value={project.milestonesCompletedThisWeek}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            suffix={`/ ${project.totalMilestoneCount}`}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Overall Process"
            value={project.overallProcess || 0}
            precision={1}
            suffix="%"
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Actual Process"
            value={project.actualProcess || 0}
            precision={1}
            suffix="%"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>

      {/* Key Metrics Row 2 - Secondary data */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {project.averageMilestoneCompletionDays !== null && (
          <Col span={12}>
            <Statistic
              title="Avg. Completion Time"
              value={project.averageMilestoneCompletionDays}
              suffix="days"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        )}
        {project.daysUntilDeadline !== null && (
          <Col span={12}>
            <Statistic
              title={project.daysUntilDeadline >= 0 ? "Days Left" : "Days Overdue"}
              value={Math.abs(project.daysUntilDeadline)}
              prefix={project.isOverdue ? <ExclamationCircleOutlined /> : <ClockCircleOutlined />}
              valueStyle={{ 
                color: project.isOverdue ? '#cf1322' : project.daysUntilDeadline <= 7 ? '#faad14' : '#3f8600' 
              }}
            />
          </Col>
        )}
      </Row>

      {/* Overall Progress Bar */}
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <div style={{ marginBottom: 8 }}>
            <Text strong>Overall Project Progress</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              ({project.milestonesCompletedThisWeek} completed this week)
            </Text>
          </div>
          <Progress 
            percent={Math.round(project.overallProcess || 0)} 
            strokeColor="#722ed1"
            format={(percent) => `${percent}% overall progress`}
          />
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[8, 8]}>
        <Col>
          <Tag color="cyan">
            <TrophyOutlined style={{ marginRight: 4 }} />
            Total Updates: {project.totalProjectUpdateCount}
          </Tag>
        </Col>
        <Col>
          <Tag color="blue">
            Team member: {project.activeUserCount}
          </Tag>
        </Col>
        <Col>
          <Tag color="purple">
            Milestones This Week: {project.milestoneInWeek.length}
          </Tag>
        </Col>
        {project.isOverdue && (
          <Col>
            <Tag color="red">
              <ExclamationCircleOutlined style={{ marginRight: 4 }} />
              OVERDUE
            </Tag>
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default ProjectMetricsDisplay;
