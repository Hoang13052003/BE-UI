import React, { useState } from "react";
import { Card, List, Avatar, Row, Col, Tag, Tooltip, Space, Typography, Button, Progress } from "antd";
import { AppstoreOutlined, BarsOutlined, ClockCircleOutlined, UserOutlined, CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { TimeLogResponseDto } from "../../../types/project";

const { Text, Title } = Typography;

interface Props {
  timeLogs: TimeLogResponseDto[];
  onViewAll?: () => void;
  showViewAllButton?: boolean;
}

const ProjectLaborRecentTimeLogs: React.FC<Props> = ({ 
  timeLogs, 
  onViewAll, 
  showViewAllButton = false 
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'to do': return 'default';
      case 'doing': return 'processing';
      case 'pending': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return '#52c41a';
    if (percentage >= 70) return '#1890ff';
    if (percentage >= 50) return '#faad14';
    return '#ff4d4f';
  };

  const renderListView = () => (
    <List
      itemLayout="vertical"
      dataSource={timeLogs}
      locale={{ emptyText: "No time logs available." }}
      renderItem={item => (
        <List.Item
          style={{
            padding: '20px 24px',
            borderRadius: '12px',
            marginBottom: '16px',
            background: '#fafafa',
            border: '1px solid #f0f0f0'
          }}
          extra={
            <div style={{ textAlign: 'center', minWidth: '80px' }}>
              <Avatar 
                size={40} 
                style={{ 
                  backgroundColor: '#1890ff',
                  marginBottom: '8px'
                }}
                icon={<UserOutlined />}
              >
                {item.performer.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                {item.performer.fullName}
              </Text>
            </div>
          }
        >
          <List.Item.Meta
            title={
              <div style={{ marginBottom: '8px' }}>
                <Text strong style={{ fontSize: '16px', color: '#262626' }}>
                  {item.taskDescription}
                </Text>
              </div>
            }
            description={
              <>
                <Space wrap style={{ width: '100%' }}>
                  <Space>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    <Text type="secondary">{item.taskDate}</Text>
                  </Space>
                  <Space>
                    <ClockCircleOutlined style={{ color: '#52c41a' }} />
                    <Text strong>{item.hoursSpent}h</Text>
                  </Space>
                  {item.computedTimelogStatus && (
                    <Tag color={getStatusColor(item.computedTimelogStatus)}>
                      {item.computedTimelogStatus}
                    </Tag>
                  )}
                </Space>
                {item.completionPercentage !== undefined && (
                  <div style={{ marginTop: 12, maxWidth: 200 }}>
                    <Progress
                      percent={item.completionPercentage}
                      size="small"
                      strokeColor={getCompletionColor(item.completionPercentage)}
                      showInfo
                    />
                  </div>
                )}
              </>
            }
          />
        </List.Item>
      )}
    />
  );

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {timeLogs.map((item, index) => (
        <Col xs={24} sm={12} lg={8} xl={8} key={index}>
          <Card
            size="small"
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0',
              height: '100%'
            }}
            styles={{ body: { padding: '16px' } }}
          >
            {/* Task Description as main content */}
            <div style={{ marginBottom: '16px' }}>
              <Tooltip title={item.taskDescription}>
                <Text 
                  strong 
                  style={{ 
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '8px',
                    minHeight: '40px',
                    lineHeight: '1.4'
                  }}
                >
                  {item.taskDescription}
                </Text>
              </Tooltip>
            </div>
            {/* User info as secondary */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px',
              padding: '8px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <Avatar 
                size={28} 
                style={{ 
                  backgroundColor: '#1890ff',
                  marginRight: '8px'
                }}
                icon={<UserOutlined />}
              >
                {item.performer.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Text style={{ fontSize: '12px' }}>
                {item.performer.fullName}
              </Text>
            </div>
            {/* Metrics */}
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="small">
                  <CalendarOutlined style={{ color: '#1890ff' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {item.taskDate}
                  </Text>
                </Space>
                <Space size="small">
                  <ClockCircleOutlined style={{ color: '#52c41a' }} />
                  <Text strong style={{ fontSize: '12px' }}>{item.hoursSpent}h</Text>
                </Space>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item.completionPercentage !== undefined && (
                  <Progress
                    type="circle"
                    percent={item.completionPercentage}
                    width={36}
                    strokeColor={getCompletionColor(item.completionPercentage)}
                    format={percent => `${percent}%`}
                    style={{ marginRight: 8 }}
                  />
                )}
                {item.computedTimelogStatus && (
                  <Tag 
                    color={getStatusColor(item.computedTimelogStatus)} 
                    style={{ fontSize: '10px', padding: '2px 6px' }}
                  >
                    {item.computedTimelogStatus}
                  </Tag>
                )}
              </div>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Recent Time Logs</Title>
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
              icon={<BarsOutlined />}
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
        </div>
      }
      style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}
      styles={{ body: { padding: '20px' } }}
    >
      {timeLogs.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 0',
          color: '#8c8c8c'
        }}>
          <ClockCircleOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
          <Text type="secondary" style={{ fontSize: '16px' }}>No time logs available</Text>
        </div>
      ) : (
        viewMode === 'list' ? renderListView() : renderGridView()
      )}
    </Card>
  );
};

export default ProjectLaborRecentTimeLogs; 