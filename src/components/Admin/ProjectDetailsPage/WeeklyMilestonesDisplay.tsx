import React, { useState } from "react";
import { Card, List, Tag, Progress, Typography, Empty, Space, Button, Row, Col } from "antd";
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { MilestoneResponseDto } from "../../../types/project";

const { Text } = Typography;

interface WeeklyMilestonesDisplayProps {
  milestones: MilestoneResponseDto[];
  onViewAll?: () => void;
  showViewAllButton?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "TODO":
      return "default";
    case "DOING":
      return "processing";
    case "PENDING":
      return "warning";
    case "COMPLETED":
      return "success";
    default:
      return "default";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "TODO":
      return <ClockCircleOutlined />;
    case "DOING":
      return <PlayCircleOutlined />;
    case "PENDING":
      return <ExclamationCircleOutlined />;
    case "COMPLETED":
      return <CheckCircleOutlined />;
    default:
      return <ClockCircleOutlined />;
  }
};

const WeeklyMilestonesDisplay: React.FC<WeeklyMilestonesDisplayProps> = ({
  milestones,
  onViewAll,
  showViewAllButton = false,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const renderMilestoneCard = (milestone: MilestoneResponseDto) => (
    <Card 
      size="small" 
      style={{ height: '100%' }}
      styles={{ body: { padding: '12px' } }}
    >
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <Space direction="vertical" size={4} style={{ flex: 1 }}>
            <Space>
              {getStatusIcon(milestone.status)}
              <Text strong style={{ fontSize: '13px' }}>{milestone.name}</Text>
            </Space>
          </Space>
          <Tag color={getStatusColor(milestone.status)} style={{ margin: 0 }}>
            {milestone.status}
          </Tag>
        </div>
        
        {/* Circular Progress for Grid View */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Progress 
            type="circle"
            size={32}
            percent={milestone.completionPercentage} 
            strokeWidth={6}
            format={(percent) => <span style={{ fontSize: '10px' }}>{percent}%</span>}
          />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {milestone.completionPercentage}% complete
          </Text>
        </div>
        
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          {milestone.deadlineDate && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              📅 Due: {new Date(milestone.deadlineDate).toLocaleDateString()}
            </Text>
          )}
          
          {milestone.notes && (
            <Text type="secondary" style={{ fontSize: "10px", fontStyle: 'italic' }}>
              💡 {milestone.notes}
            </Text>
          )}
        </Space>
      </div>
    </Card>
  );

  const renderMilestoneListItem = (milestone: MilestoneResponseDto) => (
    <List.Item style={{ padding: '8px 0' }}>
      <div style={{ width: '100%' }}>
        {/* Header with name and status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <Space>
            {getStatusIcon(milestone.status)}
            <Text strong style={{ fontSize: '14px' }}>{milestone.name}</Text>
          </Space>
          <Tag color={getStatusColor(milestone.status)}>
            {milestone.status}
          </Tag>
        </div>
        
        {/* Progress bar */}
        <Progress 
          percent={milestone.completionPercentage} 
          size="small"
          status={milestone.completionPercentage === 100 ? "success" : "active"}
          showInfo={false}
          style={{ marginBottom: 4 }}
        />
        
        {/* Dates and completion info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={16}>
            {milestone.deadlineDate && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Due: {new Date(milestone.deadlineDate).toLocaleDateString()}
              </Text>
            )}
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {milestone.completionPercentage}% complete
            </Text>
          </Space>
        </div>
        
        {/* Notes if available */}
        {milestone.notes && (
          <Text type="secondary" style={{ fontSize: "11px", display: "block", marginTop: 4, fontStyle: 'italic' }}>
            💡 {milestone.notes}
          </Text>
        )}
      </div>
    </List.Item>
  );

  if (milestones.length === 0) {
    return (
      <Card 
        title="📅 This Week's Milestones" 
        size="small"
        extra={
          <Space>
            {showViewAllButton && (
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={onViewAll}
                size="small"
              >
                View All
              </Button>
            )}
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode('list')}
              size="small"
            />
            <Button
              type={viewMode === 'grid' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('grid')}
              size="small"
            />
          </Space>
        }
      >
        <Empty 
          description="No milestones scheduled for this week"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card 
      title="📅 This Week's Milestones" 
      size="small"
      extra={
        <Space>
          {showViewAllButton && (
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={onViewAll}
              size="small"
            >
              View All
            </Button>
          )}
          <Button
            type={viewMode === 'list' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode('list')}
            size="small"
            title="List View"
          />
          <Button
            type={viewMode === 'grid' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode('grid')}
            size="small"
            title="Grid View"
          />
        </Space>
      }
    >
      {viewMode === 'list' ? (
        <List
          size="small"
          dataSource={milestones}
          renderItem={renderMilestoneListItem}
        />
      ) : (
        <Row gutter={[12, 12]}>
          {milestones.map((milestone) => (
            <Col xs={24} sm={12} md={8} lg={6} key={milestone.id}>
              {renderMilestoneCard(milestone)}
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};

export default WeeklyMilestonesDisplay;
