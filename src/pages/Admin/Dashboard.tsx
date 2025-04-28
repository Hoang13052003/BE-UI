// Dashboard.tsx
  import React from 'react';
  import { 
    Card, 
    Row, 
    Col, 
    Typography, 
    Button, 
    Progress, 
    Table, 
    Tag, 
    Space,
    Statistic,
    List
  } from 'antd';
  import {
    FilterOutlined,
    PlusOutlined,
    ArrowUpOutlined,
  } from '@ant-design/icons';
  

  interface Project {
    key: string;
    name: string;
    team: string;
    type: 'Fixed Price' | 'Labor Based';
    progress: number;
    status: 'On Track' | 'Delayed' | 'At Risk';
    deadline: string;
  }
  
  interface Feedback {
    project: string;
    message: string;
    time: string;
  }

  const { Title } = Typography;
  
  const Dashboard: React.FC = () => {
    // Sample data
    const projects: Project[] = [
      {
        key: '1',
        name: 'E-commerce Platform',
        team: 'Tech Team',
        type: 'Fixed Price',
        progress: 75,
        status: 'On Track',
        deadline: '2024-03-31'
      },
      {
        key: '2',
        name: 'Mobile App Development',
        team: 'Innovation Hub',
        type: 'Labor Based',
        progress: 45,
        status: 'Delayed',
        deadline: '2024-05-31'
      },
      {
        key: '3',
        name: 'Website Redesign',
        team: 'Design Studio',
        type: 'Fixed Price',
        progress: 90,
        status: 'On Track',
        deadline: '2024-02-28'
      },
      {
        key: '4',
        name: 'CRM Integration',
        team: 'Data Team',
        type: 'Labor Based',
        progress: 30,
        status: 'At Risk',
        deadline: '2024-04-15'
      }
    ];
  
    const recentFeedback: Feedback[] = [
      {
        project: 'E-commerce Platform',
        message: 'Great progress on the checkout flow',
        time: '2h ago'
      },
      {
        project: 'Website Redesign',
        message: 'The new design looks fantastic',
        time: '4h ago'
      },
      {
        project: 'CRM Integration',
        message: 'Need to speed up development',
        time: '5d ago'
      }
    ];
  
    const columns = [
      {
        title: 'Project Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: Project) => (
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.team}</div>
          </div>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (text: string) => (
          <Tag color="blue">{text}</Tag>
        ),
      },
      {
        title: 'Progress',
        dataIndex: 'progress',
        key: 'progress',
        render: (progress: number) => (
          <div>
            <Progress percent={progress} size="small" />
          </div>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        render: (status: string) => {
          let color = 'green';
          if (status === 'Delayed') color = 'red';
          if (status === 'At Risk') color = 'orange';
          return (
            <Tag color={color}>
              {status}
            </Tag>
          );
        },
      },
      {
        title: 'Deadline',
        dataIndex: 'deadline',
        key: 'deadline',
      },
      {
        title: 'Action',
        key: 'action',
        render: () => (
          <Button type="link">View Details</Button>
        ),
      },
    ];
  
    return (
      <React.Fragment>
        {/* Header */}
        <Row className="item-header">
          <Title level={4}>Dashboard</Title>
          <Space>
            <Button icon={<FilterOutlined />}>
              Filter
            </Button>
            <Button type="primary" icon={<PlusOutlined />}>
              New Project
            </Button>
          </Space>
        </Row>
  
        {/* Stats Cards */}
        <Row gutter={16} style={{ marginBottom: 10 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Projects"
                value={12}
                suffix={<div style={{ fontSize: '14px', color: '#8c8c8c' }}>8 Active</div>}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="On Track"
                value={7}
                suffix="54%"
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Delayed"
                value={3}
                suffix="25%"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="At Risk"
                value={2}
                suffix="17%"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
  
        {/* Project Progress & Recent Feedback */}
        <Row gutter={16} style={{ marginBottom: 10 }}>
          <Col span={16}>
            <Card
              title="Project Progress"
              extra={
                <Space>
                  <Button type="text">Week</Button>
                  <Button type="link">Month</Button>
                  <Button type="text">Quarter</Button>
                </Space>
              }
            >
              <div style={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px dashed #d9d9d9',
                borderRadius: 8
              }}>
                Progress Chart Area
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title="Recent Feedback"
              extra={<Button type="link">View All</Button>}
            >
              <List
                itemLayout="vertical"
                dataSource={recentFeedback}
                renderItem={(item: Feedback) => (
                  <List.Item>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontWeight: 500 }}>{item.project}</div>
                      <div style={{ fontSize: '14px', color: '#8c8c8c' }}>{item.message}</div>
                      <div style={{ fontSize: '12px', color: '#bfbfbf', marginTop: 4 }}>{item.time}</div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
  
        {/* Active Projects Table */}
        <Card title="Active Projects">
          <Table 
            columns={columns} 
            dataSource={projects}
            pagination={false}
          />
        </Card>
      </React.Fragment>
    );
  };
  
  export default Dashboard;