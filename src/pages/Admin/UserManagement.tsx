// UserManagement.tsx
import React, { useState, useEffect } from 'react';
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
  Statistic,
  message,
  Modal,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { getAllUsers } from '../../api/userApi';
import { User } from '../../types/User';
import AddUser from '../../components/Admin/user/AddUser';
import UpdateUser from '../../components/Admin/user/UpdateUser';
import DeleteUser from '../../components/Admin/user/DeleteUser';

const { Title, Text } = Typography;

interface UserTableData extends User {
  key: string;
}

// Role options defined as constants
const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'USER', label: 'User' }
];

const UserManagement: React.FC = () => {
  // State management
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filteredUsers, setFilteredUsers] = useState<UserTableData[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<'add' | 'update' | 'delete' | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Stats counters
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [inactiveUsers, setInactiveUsers] = useState<number>(0);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [searchText, roleFilter, users]);
  
  // Handler for modal close and refresh
  const handleModalClose = () => {
    setIsModalVisible(false);
    setModalContent(null);
    setSelectedUserId(null);
    fetchUsers();
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      console.log('Fetched users:', usersData);

      // Filter out users with isDeleted = false
      // const activeUsersData = usersData.filter(user => user.deleted === false);
      // console.log('Active users:', activeUsersData);
      // Transform API data to table format
      const formattedUsers = usersData.map(user => ({
        ...user,
        key: user.id.toString()
      }));
      
      setUsers(formattedUsers);
      
      // Calculate stats
      setTotalUsers(formattedUsers.length);
      const active = formattedUsers.filter(user => !user.key).length;
      setActiveUsers(active);
      setInactiveUsers(formattedUsers.length - active);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to load users');
      setLoading(false);
    }
  };
  
  // Apply filters to the user list
  const applyFilters = () => {
    let result = [...users];
    
    // Apply search filter
    if (searchText) {
      result = result.filter(
        user => 
          user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => 
        user.role?.toUpperCase() === roleFilter
      );
    }
    
    setFilteredUsers(result);
  };
  
  // Handler for search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  
  // Handler for role filter change
  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
  };
  
  // Define table columns
  const columns: ColumnsType<UserTableData> = [
    {
      title: 'User',
      key: 'user',
      width: '20%',
      render: (_: undefined, record: UserTableData) => (
        <Space>
          <Avatar 
            src={record.image} 
            icon={!record.image && <UserOutlined />} 
            className="bg-blue-500"
          />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <Text type="secondary" className="text-xs">{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      width: '6%',
      render: (_, record) => (
        <Tag color={record.role === 'ADMIN' ? 'purple' : 'blue'}>
          {record.role || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Projects',
      key: 'projects',
      width: '30%',
      render: (_, record) => (
        record.projects.map((project, index) => (
          <Tag key={index} color="geekblue" className="mr-1">
            {project.name}
          </Tag>
        ))
      ),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      width: '30%',
    },
    
    {
      title: 'Actions',
      key: 'actions',
      width: '14%',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record.id)}
          />
          <Button 
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteUser(record.id)}
          />
        </Space>
      ),
    },
  ];
  
  // Handler for edit user button
  const handleEditUser = (userId: number) => {
    setSelectedUserId(userId);
    setModalContent('update');
    setIsModalVisible(true);
  };
  
  // Handler for delete user button
  const handleDeleteUser = (userId: number) => {
    setSelectedUserId(userId);
    setModalContent('delete');
    setIsModalVisible(true);
  };
  
  // Handler for add user button
  const handleAddUser = () => {
    setModalContent('add');
    setIsModalVisible(true);
  };

  return (
    <Card className="shadow-sm">
      <div className="mb-6">
        <Title level={5}>Users</Title>
        <Text type="secondary">Manage user accounts and permissions</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={24} className="mb-8">
        <Col span={6}>
          <Statistic 
            title="Total Users"
            value={totalUsers}
            valueStyle={{ color: '#1677ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Active Users"
            value={activeUsers}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Inactive Users"
            value={inactiveUsers}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Col>
        {/* <Col span={6}>
          <Statistic
            title="New This Month"
            value={users.filter(User => {
              const oneMonthAgo = new Date();
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
              // return new Date(user.createdAt) > oneMonthAgo;
            }).length}
            valueStyle={{ color: '#1677ff' }}
          />
        </Col> */}
      </Row>

      {/* User List */}
      <div className="mt-8">
        <Title level={5}>User List</Title>
        
        {/* Search and Filter */}
        <Row justify="space-between" className="mb-4">
          <Col>
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined className="text-gray-400" />}
              style={{ width: 250 }}
              value={searchText}
              onChange={handleSearch}
              className="rounded-md"
            />
          </Col>
          <Col>
            <Space>
              <Select 
                defaultValue="all"
                style={{ width: 120 }}
                onChange={handleRoleFilter}
                options={ROLE_OPTIONS}
                className="rounded-md"
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddUser}
                className="bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Add User
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Users Table */}
        <Table 
          columns={columns} 
          dataSource={filteredUsers.length > 0 ? filteredUsers : users}
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Total ${total} users`
          }}
          className="mt-2"
          rowClassName="hover:bg-gray-50"
        />
      </div>

      {/* Modals */}
      <Modal
        title={
          modalContent === 'add'
            ? 'Add New User'
            : modalContent === 'update'
            ? 'Update User'
            : modalContent === 'delete'
            ? 'Delete User'
            : ''
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={modalContent === 'delete' ? 400 : 600}
      >
        {modalContent === 'add' && (
          <AddUser onSuccess={handleModalClose} />
        )}
        {modalContent === 'update' && selectedUserId && (
          <UpdateUser userId={selectedUserId} onSuccess={handleModalClose} />
        )}
        {modalContent === 'delete' && selectedUserId && (
          <DeleteUser userId={selectedUserId} onSuccess={handleModalClose} />
        )}
      </Modal>
    </Card>
  );
};

export default UserManagement;