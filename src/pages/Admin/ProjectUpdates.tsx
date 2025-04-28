import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Tag,
  Typography,
  Space,
  Button,
  Row,
  Spin,
  Alert
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { getProjectsApi, deleteProjectApi } from '../../api/projectApi';
import { Project } from '../../types/project';

const { Text, Title } = Typography;

const ProjectUpdates: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProjectsApi();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to fetch projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'IN_PROGRESS':
        return 'blue';
      case 'PLANNING':
        return 'processing';
      case 'ON_HOLD':
        return 'warning';
      case 'DELAYED':
        return 'orange';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteProjectApi(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError("Failed to delete project. Please try again later.");
    } finally {
      setDeletingId(null);
    }
  };
  if (loading) {
    return (
      <Card>
        <Title level={5}>Project Updates</Title>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <Title level={5}>Project Updates</Title>
        <Alert message={error} description={error} type="error" showIcon />
      </Card>
    );
  }
  return (
    <Card>
      <Title level={5}>Project Updates</Title>
      <List
        itemLayout="vertical"
        dataSource={projects}
        renderItem={(item: Project) => (
          <List.Item
            key={item.id}
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
                loading={deletingId === item.id}
                onClick={() => handleDelete(item.id)}
              />
            ]}
          >
            <Row justify="space-between" align="top">
              <Space direction="vertical" size={2} style={{ flex: 1 }}>
                <Space size={8}>
                  <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                </Space>

                <Text strong>{item.name}</Text>
                <Text type="secondary">{item.description}</Text>

                <Space size={16} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                  <Space>
                    <UserOutlined />
                    <Text type="secondary">{item.clientName}</Text>
                  </Space>
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">{item.startDate}</Text>
                  </Space>
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">{item.plannedEndDate}</Text>
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