import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Space,
  Button,
  List,
  Tag,
  Statistic
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface Project {
  id: string;
  name: string;
  description: string;
  type: 'Fixed Price' | 'Labor Based';
  progress: number;
  startDate: string;
  endDate: string;
  milestones?: string;
  hours?: string;
  lastUpdate: string;
}

interface Activity {
  id: string;
  type: 'completion' | 'progress' | 'review';
  title: string;
  project: string;
  time: string;
}

const Overview: React.FC = () => {
 const navigate = useNavigate();
  const projects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Custom e-commerce solution with advanced features',
      type: 'Fixed Price',
      progress: 75,
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      milestones: '6/8',
      lastUpdate: '2h ago'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android',
      type: 'Labor Based',
      progress: 45,
      startDate: '2024-02-01',
      endDate: '2024-05-31',
      hours: '120/300',
      lastUpdate: '1d ago'
    },
    {
      id: '3',
      name: 'Website Redesign',
      description: 'Complete website redesign with modern UI/UX',
      type: 'Fixed Price',
      progress: 90,
      startDate: '2024-01-15',
      endDate: '2024-02-28',
      milestones: '4/5',
      lastUpdate: '4h ago'
    }
  ];

  const recentActivity: Activity[] = [
    {
      id: '1',
      type: 'completion',
      title: 'Frontend Development Complete',
      project: 'E-commerce Platform',
      time: '2h ago'
    },
    {
      id: '2',
      type: 'progress',
      title: 'API Integration Progress',
      project: 'Mobile App Development',
      time: '4h ago'
    },
    {
      id: '3',
      type: 'review',
      title: 'Design Review Feedback',
      project: 'Website Redesign',
      time: '1d ago'
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'completion':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'progress':
        return <SyncOutlined style={{ color: '#1677ff' }} />;
      case 'review':
        return <EyeOutlined style={{ color: '#722ed1' }} />;
    }
  };

  const handleDetailsClick = (id: string) => {
    navigate(`/client/projects/details/${id}`);    
  }

  return (
    <React.Fragment>
      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Projects"
              value={3}
              suffix={
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  2 In Progress • 1 Near Completion
                </Text>
              }
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Hours"
              value="120/300"
              prefix={<ClockCircleOutlined />}
            />
            <Progress percent={40} showInfo={false} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Completed Milestones"
              value="10/13"
              prefix={<CheckCircleOutlined />}
            />
            <Progress percent={77} showInfo={false} />
          </Card>
        </Col>
      </Row>

      {/* Projects Section */}
      <Card
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={5} style={{ margin: 0 }}>Your Projects</Title>
            <Space>
              <Button type="text" icon={<AppstoreOutlined />} />
              <Button type="text" icon={<UnorderedListOutlined />} />
            </Space>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {projects.map(project => (
            <Col span={8} key={project.id}>
              <Card>
                <Space direction="vertical" style={{ width: '100%' }} size={16}>
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Title level={5} style={{ margin: 0 }}>{project.name}</Title>
                    <Tag color={project.type === 'Fixed Price' ? 'blue' : 'green'}>
                      {project.type}
                    </Tag>
                  </Space>
                  
                  <Text type="secondary">{project.description}</Text>
                  
                  <div>
                    <Text>Progress</Text>
                    <Progress percent={project.progress} />
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary">Start Date</Text>
                      <div>{project.startDate}</div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">End Date</Text>
                      <div>{project.endDate}</div>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Text type="secondary">
                        {project.milestones ? 'Milestones' : 'Hours'}
                      </Text>
                      <div>{project.milestones || project.hours}</div>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Button type="link" onClick={() => handleDetailsClick(project.id)} >View Details</Button>
                    </Col>
                  </Row>

                  <Text type="secondary">Last Update: {project.lastUpdate}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity" style={{ marginTop: 24 }}>
        <List
          itemLayout="horizontal"
          dataSource={recentActivity}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={getActivityIcon(item.type)}
                title={item.title}
                description={
                  <Space>
                    <Text type="secondary">{item.project}</Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">{item.time}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </React.Fragment>
  );
};

export default Overview;