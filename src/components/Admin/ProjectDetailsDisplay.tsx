import React from 'react';
import { List, Tag, Typography, Space, Button, Row, Tooltip } from 'antd';
import {
  EditOutlined,
  CalendarOutlined,
  UserOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import MilestoneDetailsDisplay from './MilestoneDetailsDisplay';
import TimelogDetailsDisplay from './TimelogDetailsDisplay';
import { Project } from '../../types/project';

const { Text } = Typography;

interface ProjectDetailsDisplayProps {
  project: Project;
  isExpanded: boolean;
  expandedTimelogProjectId: number | null;
  deletingId: number | null;
  onEditProject: (id: number) => void;
  onDeleteProject: (id: number) => void;
  onToggleMilestoneDetail: (id: number) => void;
  onToggleTimelogDetail: (id: number) => void;
  onAddMilestone: (projectId: number, refreshCallback?: () => void) => void;
  onEditMilestone: (milestoneId: number, projectId: number, refreshCallback?: () => void) => void;
  deleteButton?: React.ReactNode;
  theme?: string; // Thêm dòng này
}

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'NEW': return 'cyan';
    case 'PENDING': return 'gold';
    case 'PROGRESS': return 'blue';
    case 'CLOSED': return 'green';
    default: return 'default';
  }
};

const ProjectDetailsDisplay: React.FC<ProjectDetailsDisplayProps> = ({
  project,
  isExpanded,
  expandedTimelogProjectId,
  onEditProject,
  onToggleMilestoneDetail,
  onToggleTimelogDetail,
  onAddMilestone,
  onEditMilestone,
  deleteButton,
  theme // Thêm dòng này
}) => {
  return (
    <List.Item
      key={project.id}
      style={{
        background: theme === 'dark' ? '#181818' : '#f9fafb', // Sử dụng theme
        borderRadius: '8px',
        marginBottom: '16px',
        padding: '16px',
        transition: 'all 0.3s ease',
        border: theme === 'dark' ? '1px solid #333' : '1px solid #e8e8e8', // Sử dụng theme
        color: theme === 'dark' ? '#fff' : undefined // Sử dụng theme
      }}
      actions={[
        <Button
          key="edit-project"
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEditProject(project.id)}
        >
          Edit Project
        </Button>,
        project.type === 'FIXED_PRICE' && (
          <Button
            key="milestone-details"
            type="text"
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            onClick={() => onToggleMilestoneDetail(project.id)}
          >
            {isExpanded ? 'Hide Milestones' : 'Show Milestones'}
          </Button>
        ),
        project.type === 'LABOR' && (
          <Button
            key="show-timelog"
            type="text"
            icon={expandedTimelogProjectId === project.id ? <UpOutlined /> : <DownOutlined />}
            onClick={() => onToggleTimelogDetail(project.id)}
          >
            {expandedTimelogProjectId === project.id ? 'Hide Timelog' : 'Show Timelog'}
          </Button>
        ),
        deleteButton // Thay vì tự tạo nút xóa, dùng prop deleteButton
      ].filter(Boolean)}
    >
      <Row justify="space-between" align="top">
        <Space direction="vertical" size={2} style={{ flex: 1 }}>
          <Space size={8} wrap>
            <Tag color={getStatusColor(project.status)}>{project.status}</Tag>
            <Tag>{project.type}</Tag>
          </Space>
          <Text strong style={{ fontSize: '16px' }}>{project.name}</Text>
          <Text type="secondary">{project.description}</Text>
          <Space size={16} style={{ marginTop: 8, flexWrap: 'wrap' }}>
            <Space>
              <UserOutlined />
              <Text type="secondary">
                {project.users && project.users.length > 0 ? (
                  project.users.length > 2 ? (
                    <Tooltip title={project.users.map(user => user.email).join(', ')}>
                      {project.users.slice(0, 2).map(user => user.email).join(', ')}
                      {`, and ${project.users.length - 2} more`}
                    </Tooltip>
                  ) : (
                    project.users.map(user => user.email).join(', ')
                  )
                ) : (
                  'N/A'
                )}
              </Text>
            </Space>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</Text>
            </Space>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">Planned End: {project.plannedEndDate ? new Date(project.plannedEndDate).toLocaleDateString() : 'N/A'}</Text>
            </Space>
          </Space>
        </Space>
      </Row>
      {isExpanded && project.type === 'FIXED_PRICE' && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e8e8e8' }}>
          <MilestoneDetailsDisplay
            projectId={project.id}
            onAddMilestone={(refreshCallback) => onAddMilestone(project.id, refreshCallback)}
            onEditMilestone={onEditMilestone}
          />
        </div>
      )}
      {expandedTimelogProjectId === project.id && project.type === 'LABOR' && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e8e8e8' }}>
          <TimelogDetailsDisplay projectId={project.id} users={[]} />
        </div>
      )}
    </List.Item>
  );
};

export default ProjectDetailsDisplay;