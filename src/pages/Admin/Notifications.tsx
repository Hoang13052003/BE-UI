import React from 'react';
import {
  Card,
  List,
  Tag,
  Typography,
  Space,
  Button,
  Select,
  Row,
  Col
} from 'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface Notification {
  key: string;
  type: 'milestone' | 'update' | 'comment' | 'deadline';
  title: string;
  description: string;
  project: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  read: boolean;
}

const Notifications: React.FC = () => {
  const notifications: Notification[] = [
    {
      key: '1',
      type: 'milestone',
      title: 'Project Milestone Completed',
      description: 'Frontend development phase completed for E-commerce Platform',
      project: 'E-commerce Platform',
      time: '2 minutes ago',
      priority: 'High',
      read: false
    },
    {
      key: '2',
      type: 'update',
      title: 'New Project Update',
      description: 'Sarah added new progress update for Mobile App',
      project: 'Mobile App',
      time: '1 hour ago',
      priority: 'Medium',
      read: false
    },
    {
      key: '3',
      type: 'comment',
      title: 'New Comment',
      description: 'John commented on Website Redesign progress',
      project: 'Website Redesign',
      time: '3 hours ago',
      priority: 'Low',
      read: false
    },
    {
      key: '4',
      type: 'deadline',
      title: 'Deadline Approaching',
      description: 'Project milestone deadline in 2 days',
      project: 'CRM System',
      time: '5 hours ago',
      priority: 'High',
      read: false
    }
  ];

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'milestone':
        return <CheckCircleOutlined style={{ color: '#1677ff' }} />;
      case 'update':
        return <SyncOutlined style={{ color: '#1677ff' }} />;
      case 'comment':
        return <MessageOutlined style={{ color: '#52c41a' }} />;
      case 'deadline':
        return <ClockCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'High':
        return '#ff4d4f';
      case 'Medium':
        return '#1677ff';
      case 'Low':
        return '#52c41a';
      default:
        return '#000000';
    }
  };

  return (
    <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={5} style={{ margin: 0 }}>All Notifications</Title>
              <Text type="secondary">Stay updated with project activities and updates</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button type="link">Mark all as read</Button>
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                options={[
                  { value: 'all', label: 'All Notifications' },
                  { value: 'unread', label: 'Unread' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'low', label: 'Low Priority' },
                ]}
              />
              <Button type="text" icon={<SettingOutlined />} />
              <Button type="text" icon={<GlobalOutlined />} />
            </Space>
          </Col>
        </Row>

        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{ 
                padding: '16px',
                background: item.read ? 'transparent' : '#f0f5ff',
                borderRadius: '8px',
                marginBottom: '8px'
              }}
              extra={
                <Button type="link" size="small">
                  Mark as read
                </Button>
              }
            >
              <List.Item.Meta
                avatar={getTypeIcon(item.type)}
                title={
                  <Space>
                    <Text strong>{item.title}</Text>
                    <Tag color={getPriorityColor(item.priority)} style={{ marginLeft: 8 }}>
                      {item.priority}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Text>{item.description}</Text>
                    <Space size={16}>
                      <Text type="secondary">{item.project}</Text>
                      <Text type="secondary">{item.time}</Text>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
  );
};

export default Notifications;