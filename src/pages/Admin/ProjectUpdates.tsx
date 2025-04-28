import React from 'react';
import {
  Card,
  List,
  Tag,
  Typography,
  Space,
  Button,
  Row
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  FileOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface ProjectUpdate {
  key: string;
  type: 'Milestone' | 'Progress' | 'Issue';
  status: 'Completed' | 'In-Progress' | 'Pending';
  title: string;
  description: string;
  project: string;
  date: string;
  files: number;
}

const ProjectUpdates: React.FC = () => {
  const updates: ProjectUpdate[] = [
    {
      key: '1',
      type: 'Milestone',
      status: 'Completed',
      title: 'Frontend Development Complete',
      description: 'Successfully completed all frontend components and user interfaces',
      project: 'E-commerce Platform',
      date: '2024-01-20',
      files: 2
    },
    {
      key: '2',
      type: 'Progress',
      status: 'In-Progress',
      title: 'API Integration',
      description: 'Currently working on third-party API integrations',
      project: 'Mobile App',
      date: '2024-01-19',
      files: 3
    },
    {
      key: '3',
      type: 'Issue',
      status: 'Pending',
      title: 'Performance Optimization',
      description: 'Addressing loading speed issues on mobile devices',
      project: 'Website Redesign',
      date: '2024-01-18',
      files: 0
    }
  ];

  const getTypeColor = (type: ProjectUpdate['type']) => {
    switch (type) {
      case 'Milestone':
        return 'success';
      case 'Progress':
        return 'processing';
      case 'Issue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: ProjectUpdate['status']) => {
    switch (status) {
      case 'Completed':
        return 'green';
      case 'In-Progress':
        return 'blue';
      case 'Pending':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <Card>
    <Title level={5}>Project Updates</Title>
    <List
      itemLayout="vertical"
      dataSource={updates}
      renderItem={(item) => (
        <List.Item
          style={{ 
            background: '#f9fafb', 
            borderRadius: '8px',
            marginBottom: '16px',
            padding: '16px'
          }}
          actions={[
            <Button 
              key="edit" 
              type="text" 
              icon={<EditOutlined />}
            />,
            <Button 
              key="delete" 
              type="text" 
              icon={<DeleteOutlined />}
              danger
            />
          ]}
        >
          <Row justify="space-between" align="top">
            <Space direction="vertical" size={2} style={{ flex: 1 }}>
              <Space size={8}>
                <Tag color={getTypeColor(item.type)}>{item.type}</Tag>
                <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
              </Space>
              
              <Text strong>{item.title}</Text>
              <Text type="secondary">{item.description}</Text>
              
              <Space size={16} style={{ marginTop: 8 }}>
                <Text type="secondary">{item.project}</Text>
                <Text type="secondary">{item.date}</Text>
                <Space>
                  <FileOutlined />
                  <Text type="secondary">{item.files} files</Text>
                </Space>
              </Space>
            </Space>
          </Row>
        </List.Item>
      )}
    />
  </Card>
  );
};

export default ProjectUpdates;