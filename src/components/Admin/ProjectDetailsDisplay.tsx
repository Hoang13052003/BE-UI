// File: src/components/Admin/ProjectDetailsDisplay.tsx

import React from 'react';
import { Tag, Typography, Space, Button, Row, Col, Tooltip, Progress, Card, Divider, Avatar } from 'antd';
import {
  EditOutlined,
  CalendarOutlined,
  DownOutlined,
  UpOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Project, ProjectDetail, UserSummary, ProjectUser } from '../../types/project';
import MilestoneDetailsDisplayInternal from './MilestoneDetailsDisplay';
import TimelogDetailsDisplayInternal from './TimelogDetailsDisplay';

const { Title, Text, Paragraph } = Typography;

interface ProjectDetailsDisplayProps {
  project: Project | ProjectDetail;
  theme?: string;
  onEditProject?: (id: number) => void;

  // Props cho logic mở rộng tại chỗ
  isExpanded?: boolean;
  expandedTimelogProjectId?: number | null;
  onToggleMilestoneDetail?: (id: number) => void;
  onToggleTimelogDetail?: (id: number) => void;
  
  onAddMilestone?: (projectId: number, refreshCallback?: () => void) => void;
  onEditMilestone?: (milestoneId: number, projectId: number, refreshCallback?: () => void) => void;
  
  milestoneCount?: number;
  newMilestoneCount?: number;
  sentMilestoneCount?: number;
  reviewedMilestoneCount?: number;

}

const getStatusColor = (status: Project['status'] | ProjectDetail['status']) => {
  switch (status) {
    case 'NEW': return 'cyan';
    case 'PENDING': return 'gold';
    case 'PROGRESS': return 'blue';
    case 'CLOSED': return 'green';
    default: return 'default';
  }
};

const isProjectDetail = (project: Project | ProjectDetail): project is ProjectDetail => {
  return (project as ProjectDetail).users !== undefined && 
         (project.users.length === 0 || (project.users[0] as UserSummary).fullName !== undefined);
};

const ProjectDetailsDisplay: React.FC<ProjectDetailsDisplayProps> = ({
  project,
  theme,
  onEditProject,
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
}) => {
  const projectData = project;

  const createMilestoneStatusColors = () => {
    const colors = [];
    // Chỉ dùng nếu projectData là kiểu Project (có các trường count) và props được truyền vào
    if (!isProjectDetail(projectData) && newMilestoneCount !== undefined && sentMilestoneCount !== undefined && reviewedMilestoneCount !== undefined) {
      for (let i = 0; i < newMilestoneCount; i++) colors.push('#1890ff');
      for (let i = 0; i < sentMilestoneCount; i++) colors.push('#faad14');
      for (let i = 0; i < reviewedMilestoneCount; i++) colors.push('#52c41a');
    }
    return colors;
  };

  const calculateLaborProgress = () => {
    if (projectData.type !== 'LABOR' || !projectData.totalEstimatedHours || !projectData.startDate) {
      return { percent: 0, totalDays: 0, currentDay: 0 };
    }
    
    const HOURS_PER_DAY = 8;
    const totalDays = Math.ceil(projectData.totalEstimatedHours / HOURS_PER_DAY);
    const startDate = new Date(projectData.startDate);
    const currentDate = new Date();
    
    // FIX 1: Cộng thêm 1 giờ để tránh timezone issue
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 vì ngày bắt đầu cũng tính
    
    // FIX 2: Kiểm tra nếu chưa bắt đầu project
    if (currentDate < startDate) {
      return { percent: 0, totalDays, currentDay: 0 };
    }
    
    const currentDay = Math.max(0, Math.min(daysPassed, totalDays));
    const percent = totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0;
    
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
        <Avatar.Group maxCount={3} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
          {visibleUsers.map((user) => (
            <Tooltip 
              key={user.id} 
              title={isProjectDetail(projectData) ? (user as UserSummary).fullName : (user as ProjectUser).email}
            >
              <Avatar style={{ backgroundColor: '#87d068' }}>
                {(isProjectDetail(projectData) ? (user as UserSummary).fullName : (user as ProjectUser).email)
                  .charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
        {remainingCount > 0 && (
          <Text type="secondary">+{remainingCount} more</Text>
        )}
      </Space>
    );
  };

  const renderProgressSection = () => {
    if (projectData.type === 'LABOR' && projectData.totalEstimatedHours) {
      const progress = calculateLaborProgress();
      return (
        <Card 
          size="small" 
          style={{ 
            background: theme === 'dark' ? '#1f1f1f' : '#fafafa',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          <Row align="middle" gutter={16}>
            <Col>
              <Progress
                type="circle"
                size={60}
                percent={progress.percent}
                format={() => `${progress.currentDay}/${progress.totalDays}`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                strokeWidth={6}
              />
            </Col>
            <Col>
              <Space direction="vertical" size={0}>
                <Text strong>Labor Progress</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {progress.currentDay} of {progress.totalDays} days
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {projectData.totalEstimatedHours}h estimated
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>
      );
    }

    if (!isProjectDetail(projectData) && projectData.type === 'FIXED_PRICE' && 
        typeof milestoneCount === 'number' && milestoneCount > 0) {
      return (
        <Card 
          size="small" 
          style={{ 
            background: theme === 'dark' ? '#1f1f1f' : '#fafafa',
            border: 'none',
            borderRadius: '8px'
          }}
        >
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
              <Tag color="blue" style={{ fontSize: '12px' }}>New: {newMilestoneCount}</Tag>
              <Tag color="gold" style={{ fontSize: '12px' }}>Sent: {sentMilestoneCount}</Tag>
              <Tag color="green" style={{ fontSize: '12px' }}>Reviewed: {reviewedMilestoneCount}</Tag>
            </Space>
          </Space>
        </Card>
      );
    }

    return null;
  };

  return (
    <Card 
      hoverable
      style={{ 
        borderRadius: '12px',
        boxShadow: theme === 'dark' 
          ? '0 2px 8px rgba(255,255,255,0.05)' 
          : '0 2px 8px rgba(0,0,0,0.06)',
        border: theme === 'dark' ? '1px solid #303030' : '1px solid #f0f0f0'
      }}
      bodyStyle={{ padding: '20px' }}
    >
      {/* Header Section */}
      <Row justify="space-between" align="top" style={{ marginBottom: '16px' }}>
        <Col flex="auto">
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {/* Status and Type Tags */}
            <Row justify="space-between" align="middle">
              <Space size={8}>
                <Tag 
                  color={getStatusColor(projectData.status)} 
                  style={{ 
                    borderRadius: '6px', 
                    fontWeight: 'bold',
                    border: 'none'
                  }}
                >
                  {projectData.status}
                </Tag>
                <Tag 
                  style={{ 
                    borderRadius: '6px',
                    background: theme === 'dark' ? '#262626' : '#f6f6f6',
                    border: 'none'
                  }}
                >
                  <FlagOutlined style={{ marginRight: '4px' }} />
                  {projectData.type}
                </Tag>
              </Space>
              {onEditProject && (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEditProject(projectData.id)}
                  style={{ 
                    borderRadius: '6px',
                    color: theme === 'dark' ? '#1890ff' : '#1890ff'
                  }}
                  size="small"
                >
                  Edit
                </Button>
              )}
            </Row>

            {/* Project Name */}
            <Title 
              level={4} 
              style={{ 
                margin: 0, 
                fontSize: '18px',
                color: theme === 'dark' ? '#fff' : '#262626'
              }}
            >
              {projectData.name}
            </Title>

            {/* Description */}
            <Paragraph 
              type="secondary" 
              ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
              style={{ margin: 0, fontSize: '14px' }}
            >
              {projectData.description}
            </Paragraph>
          </Space>
        </Col>
      </Row>

      {/* Progress Section */}
      {renderProgressSection() && (
        <div style={{ marginBottom: '16px' }}>
          {renderProgressSection()}
        </div>
      )}

      {/* Info Section */}
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={12} md={8}>
          <Space align="center">
            <TeamOutlined style={{ color: '#1890ff' }} />
            <div>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                Team Members
              </Text>
              {renderUserAvatars()}
            </div>
          </Space>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Space align="center">
            <CalendarOutlined style={{ color: '#52c41a' }} />
            <div>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                Start Date
              </Text>
              <Text style={{ fontSize: '14px' }}>
                {projectData.startDate ? new Date(projectData.startDate).toLocaleDateString() : 'Not set'}
              </Text>
            </div>
          </Space>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Space align="center">
            <ClockCircleOutlined style={{ color: '#faad14' }} />
            <div>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                Planned End
              </Text>
              <Text style={{ fontSize: '14px' }}>
                {projectData.plannedEndDate ? new Date(projectData.plannedEndDate).toLocaleDateString() : 'Not set'}
              </Text>
            </div>
          </Space>
        </Col>
      </Row>

      {/* Action Buttons */}
      {(onToggleMilestoneDetail || onToggleTimelogDetail) && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <Row justify="start">
            <Space>
              {onToggleMilestoneDetail && projectData.type === 'FIXED_PRICE' && (
                <Button
                  type="default"
                  icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                  onClick={() => onToggleMilestoneDetail(projectData.id)}
                  style={{ borderRadius: '6px' }}
                  size="small"
                >
                  {isExpanded ? 'Hide Milestones' : 'Show Milestones'}
                </Button>
              )}
              {onToggleTimelogDetail && projectData.type === 'LABOR' && (
                <Button
                  type="default"
                  icon={expandedTimelogProjectId === projectData.id ? <UpOutlined /> : <DownOutlined />}
                  onClick={() => onToggleTimelogDetail(projectData.id)}
                  style={{ borderRadius: '6px' }}
                  size="small"
                >
                  {expandedTimelogProjectId === projectData.id ? 'Hide Timelog' : 'Show Timelog'}
                </Button>
              )}
            </Space>
          </Row>
        </>
      )}

      {/* Expanded Sections */}
      {isExpanded && onToggleMilestoneDetail && projectData.type === 'FIXED_PRICE' && onAddMilestone && onEditMilestone && (
        <div style={{ 
          marginTop: '16px', 
          padding: '16px',
          background: theme === 'dark' ? '#1a1a1a' : '#fafafa',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`
        }}>
          <MilestoneDetailsDisplayInternal
            projectId={projectData.id}
            onAddMilestone={(refreshCallback) => onAddMilestone(projectData.id, refreshCallback)}
            onEditMilestone={onEditMilestone}
          />
        </div>
      )}

      {expandedTimelogProjectId === projectData.id && onToggleTimelogDetail && projectData.type === 'LABOR' && (
        <div style={{ 
          marginTop: '16px', 
          padding: '16px',
          background: theme === 'dark' ? '#1a1a1a' : '#fafafa',
          borderRadius: '8px',
          border: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`
        }}>
          <TimelogDetailsDisplayInternal
            projectId={projectData.id}
            users={(projectData.users || []).map(user => ({
              id: user.id,
              name: isProjectDetail(projectData) ? (user as UserSummary).fullName : (user as ProjectUser).email
            }))}
          />
        </div>
      )}
    </Card>
  );
};

export default ProjectDetailsDisplay;