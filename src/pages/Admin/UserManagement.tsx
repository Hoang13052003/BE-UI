// UserManagement.tsx
import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  Table,
  Tag,
  Space,
  Avatar,
  Select,
  Statistic
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface User {
  key: string;
  name: string;
  email: string;
  role: string;
  projects: string[];
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const UserManagement: React.FC = () => {
  const users: User[] = [
    {
      key: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'Client',
      projects: ['E-commerce Platform'],
      status: 'Active',
      lastLogin: '2024-01-20 14:30'
    },
    {
      key: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'Client',
      projects: ['Mobile App', 'Website Redesign'],
      status: 'Inactive',
      lastLogin: '2024-01-15 09:45'
    },
    {
      key: '3',
      name: 'Michael Brown',
      email: 'michael@example.com',
      role: 'Client',
      projects: ['CRM System'],
      status: 'Active',
      lastLogin: '2024-01-19 16:20'
    }
  ];

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_: undefined, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{record.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Projects',
      key: 'projects',
      render: (_: undefined, record: User) => (
        <Space wrap>
          {record.projects.map((project) => (
            <Tag key={project} color="blue">{project}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status: 'Active' | 'Inactive') => (
        <Tag color={status === 'Active' ? 'success' : 'error'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />}
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />}
            danger
          />
        </Space>
      ),
    },
  ];

  return (
    <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>Users</Title>
          <Text type="secondary">Manage user accounts and permissions</Text>
        </div>

        {/* Stats Cards */}
        <Row gutter={24}>
          <Col span={6}>
            <Statistic 
              title="Total Users"
              value={24}
              valueStyle={{ color: '#1677ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Active Users"
              value={18}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Inactive Users"
              value={6}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="New This Month"
              value={5}
              valueStyle={{ color: '#1677ff' }}
            />
          </Col>
        </Row>

        {/* User List */}
        <div style={{ marginTop: 32 }}>
          <Title level={5}>User List</Title>
          
          {/* Search and Filter */}
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
              />
            </Col>
            <Col>
              <Space>
                <Select 
                  defaultValue="All Roles"
                  style={{ width: 120 }}
                  options={[
                    { value: 'all', label: 'All Roles' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'client', label: 'Client' },
                  ]}
                />
                <Button type="primary" icon={<PlusOutlined />}>
                  Add User
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Users Table */}
          <Table 
            columns={columns} 
            dataSource={users}
            pagination={{ 
              total: 24,
              pageSize: 10,
              showTotal: (total) => `Total ${total} users`
            }}
          />
        </div>
      </Card>
  );
};

export default UserManagement;