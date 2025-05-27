// UserManagement.tsx
import React, { useEffect, useState } from "react";
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
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
  ProjectOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { filterUsers, getUserManager } from "../../api/userApi";
import { User, UserManager } from "../../types/User";
import AddUser from "../../components/Admin/user/AddUser";
import UpdateUser from "../../components/Admin/user/UpdateUser";
import DeleteUser from "../../components/Admin/user/DeleteUser";
import AddAssignProjects from "../../components/Admin/user/AddAssignProjects";
import { Project } from "../../types/project";
const { Title, Text } = Typography;

// Role options defined as constants
const ROLE_OPTIONS = [
  { value: "ALL", label: "All Roles" },
  { value: "ADMIN", label: "Administrator" },
  { value: "USER", label: "Regular User" },
];

const UserManagement: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<UserManager>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    lockedUsers: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<
    "add" | "update" | "delete" | null
  >(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [isAssignProjectVisible, setIsAssignProjectVisible] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    fetchUserManager();
  }, []);

  // Handler for modal close and refresh
  const handleModalClose = () => {
    setIsModalVisible(false);
    setModalContent(null);
    setSelectedUserId(null);
    fetchUsers();
    fetchUserManager();
  };

  const fetchUserManager = async () => {
    try {
      setLoading(true);

      const data = await getUserManager();

      setManagers(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch manager:", error);
      message.error("Failed to load manager");
      setLoading(false);
    }
  };
  // Fetch users from API
  const fetchUsers = async (page = 0, pageSize = 10, currentRole?: string) => {
    try {
      setLoading(true);

      const criteria = {
        fullName: searchText || undefined,
        role: currentRole !== "ALL" ? currentRole : undefined,
        email: searchText || undefined,
      };

      const response = await filterUsers(criteria, page, pageSize);

      const formattedUsers = response.users.map((user: User) => ({
        ...user,
        key: user.id.toString(),
      }));

      setUsers(formattedUsers);
      setTotalCount(Number(response.totalCount));

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      message.error("Failed to load users");
      setLoading(false);
    }
  };

  // Handler for search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchUsers(0, 10);
    }
  };
  // Handler for role filter change
  const handleRoleFilter = async (value: string) => {
    fetchUsers(0, 10, value);
  };

  // Define table columns
  const columns: ColumnsType<User> = [
    {
      title: "User",
      key: "user",
      width: "20%",
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.image}
            icon={!record.image && <UserOutlined />}
            className="bg-blue-500"
          />
          <div>
            <div className="font-medium">{record.fullName}</div>
            <Text type="secondary" className="text-xs">
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      key: "role",
      width: "6%",
      render: (_, record) => (
        <Tag color={record.role === "ADMIN" ? "purple" : "blue"}>
          {record.role || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Projects",
      key: "projects",
      width: "30%",
      render: (_, record) =>
        record.projects.map((project, index) => (
          <Tag key={index} color="geekblue" className="mr-1">
            {project.name.length > 20
              ? `${project.name.substring(0, 20)}...`
              : project.name}
          </Tag>
        )),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      width: "30%",
    },

    {
      title: "Actions",
      key: "actions",
      width: "14%",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record.id)}
          />
          <Button
            onClick={() => handleAssignProject(record.id, record.projects)}
            icon={<ProjectOutlined />}
          />
          {record.role !== "ADMIN" && (
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteUser(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  // Handler for edit user button
  const handleEditUser = (userId: number) => {
    setSelectedUserId(userId);
    setModalContent("update");
    setIsModalVisible(true);
  };

  // Handler for delete user button
  const handleDeleteUser = (userId: number) => {
    setSelectedUserId(userId);
    setModalContent("delete");
    setIsModalVisible(true);
  };

  // Handler for add user button
  const handleAddUser = () => {
    setModalContent("add");
    setIsModalVisible(true);
  };

  // Handler for assign project button
  const handleAssignProject = (userId: number, projects: Project[]) => {
    setSelectedUserId(userId);
    setUserProjects(projects);
    setIsAssignProjectVisible(true);
  };

  // Handler for modal close
  const handleAssignProjectClose = () => {
    setIsAssignProjectVisible(false);
    setSelectedUserId(null);
    setUserProjects([]);
    fetchUsers(); // Refresh user list after assignment
  };

  return (
    <Card className="shadow-sm backgroud-default">
      <div className="mb-6">
        <Title level={5}>Users</Title>
        <Text type="secondary">Manage user accounts and permissions</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={24} className="mb-8">
        <Col span={6}>
          <Statistic
            title="Total Users"
            value={managers.totalUsers}
            valueStyle={{ color: "#1677ff" }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Active Users"
            value={managers.activeUsers}
            valueStyle={{ color: "#52c41a" }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Inactive Users"
            value={managers.inactiveUsers}
            valueStyle={{ color: "#ff4d4f" }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="User unpredictable"
            value={managers.lockedUsers}
            valueStyle={{ color: "#1677ff" }}
          />
        </Col>
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
              onKeyPress={handleSearchKeyPress}
              className="rounded-md"
            />
          </Col>
          <Col>
            <Space>
              <Select
                style={{ width: 130 }}
                defaultValue={"ALL"}
                onChange={(value) => handleRoleFilter(value)}
                options={ROLE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
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
          dataSource={users}
          rootClassName="backgroud-default"
          loading={loading}
          pagination={{
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
            onChange: (page, pageSize) => {
              // Convert antd's 1-based page number to 0-based for the API
              fetchUsers(page - 1, pageSize);
            },
          }}
          className="mt-2 backgroud-default"
          rowClassName="hover:bg-gray-50"
        />
      </div>

      {/* Modals */}
      <Modal
        title={
          modalContent === "add"
            ? "Add New User"
            : modalContent === "update"
            ? "Update User"
            : modalContent === "delete"
            ? "Delete User"
            : ""
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={modalContent === "delete" ? 400 : 600}
      >
        {modalContent === "add" && <AddUser onSuccess={handleModalClose} />}
        {modalContent === "update" && selectedUserId && (
          <UpdateUser userId={selectedUserId} onSuccess={handleModalClose} />
        )}
        {modalContent === "delete" && selectedUserId && (
          <DeleteUser userId={selectedUserId} onSuccess={handleModalClose} />
        )}
      </Modal>

      {/* Add AssignProject Modal */}
      <AddAssignProjects
        visible={isAssignProjectVisible}
        onClose={handleAssignProjectClose}
        onSuccess={handleAssignProjectClose}
        userId={selectedUserId || 0}
        projects={userProjects} // Pass existing projects if needed
      />
    </Card>
  );
};

export default UserManagement;
