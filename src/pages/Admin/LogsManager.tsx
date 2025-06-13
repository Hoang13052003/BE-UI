import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Select,
  Input,
  Button,
  Table,
  Space,
  DatePicker,
  Typography,
} from "antd";
import {
  ThunderboltOutlined,
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined,
  UserOutlined,
  WarningOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import StatisticCard from "../../components/common/StatisticCard";

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
//styles
// const styleCardSummary = {
//     heig
// };

// --- 1. Dữ liệu giả định (Mock Data) ---

// Dữ liệu cho phần thống kê trên cùng
const mockStats = {
  totalEvents: 15247,
  totalEventsToday: 2341,
  errorRate: 0.3, // Percentage
  errorRateChange: -0.1, // Percentage change from yesterday
  activeUsers: 127,
  activeUsersPeak: 156, // at 2PM
  responseTime: 245, // ms
  responseTimeImprovement: -15, // ms improvement
};

// Kiểu dữ liệu cho mỗi bản ghi nhật ký
interface LogEntry {
  key: string;
  level: "ERROR" | "WARN" | "INFO" | "SUCCESS" | "DEBUG";
  timestamp: string;
  category: string;
  user: {
    name: string;
    id?: string;
    email?: string;
  };
  message: string;
  ipAddress?: string;
}

// Dữ liệu cho bảng nhật ký
const mockLogData: LogEntry[] = [
  {
    key: "1",
    level: "ERROR",
    timestamp: "15:42:33",
    category: "Authentication",
    user: { name: "john", email: "john.doe@email.com" },
    message: "Failed login attempt - Invalid credentials",
    ipAddress: "192.168.1.105",
  },
  {
    key: "2",
    level: "WARN",
    timestamp: "15:41:15",
    category: "Database",
    user: { name: "System", id: "Auto Process" },
    message:
      "Database connection pool reaching capacity\nCurrent: 85/900 connections",
    ipAddress: "localhost",
  },
  {
    key: "3",
    level: "INFO",
    timestamp: "15:40:22",
    category: "Project",
    user: { name: "sarah.johnson", id: "1088" },
    message:
      "Project progress updated to 75%\nProject: E-commerce Platform (PRJ-2023-045)",
    ipAddress: "192.168.1.102",
  },
  {
    key: "4",
    level: "SUCCESS",
    timestamp: "15:39:45",
    category: "Payment",
    user: { name: "michael.chen", id: "1156" },
    message:
      "Payment processed successfully\nAmount: $1,500.00 - invoice #INV-2023-089",
    ipAddress: "192.168.1.108",
  },
  {
    key: "5",
    level: "DEBUG",
    timestamp: "15:38:12",
    category: "API",
    user: { name: "API.client", id: "External" },
    message: "Endpoint: /api/v1/projects - Response time: 245ms",
    ipAddress: "203.0.113.45",
  },
  {
    key: "6",
    level: "INFO",
    timestamp: "15:37:01",
    category: "System",
    user: { name: "Admin", id: "1001" },
    message: "Server restart scheduled for 3 AM local time.",
    ipAddress: "192.168.1.1",
  },
  {
    key: "7",
    level: "ERROR",
    timestamp: "15:35:40",
    category: "Network",
    user: { name: "System", id: "Auto Process" },
    message: "High network latency detected on primary server.",
    ipAddress: "10.0.0.5",
  },
  {
    key: "8",
    level: "SUCCESS",
    timestamp: "15:34:20",
    category: "User Management",
    user: { name: "Alice", id: "2003" },
    message: "New user account created: Bob Smith.",
    ipAddress: "192.168.1.110",
  },
  {
    key: "9",
    level: "WARN",
    timestamp: "15:33:10",
    category: "Storage",
    user: { name: "System", id: "Auto Process" },
    message: "Disk space low on secondary backup drive (80% full).",
    ipAddress: "localhost",
  },
  {
    key: "10",
    level: "DEBUG",
    timestamp: "15:32:05",
    category: "Frontend",
    user: { name: "Dev Team", id: "9001" },
    message:
      "Component render time optimization test: Home page loaded in 150ms.",
    ipAddress: "127.0.0.1",
  },
];

// --- 2. Component Chính: LogManagerPage ---

const LogManagerPage: React.FC = () => {
  const [selectedLogFilter, setSelectedLogFilter] =
    useState<string>("All Levels");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("All Categories");
  const [selectedUserFilter, _setSelectedUserFilter] =
    useState<string>("All Users");
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<string>("Last 24 hours");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTags, setActiveTags] = useState<string[]>([]); // To manage "Errors Only", "Security", "API" tags

  // Hàm để lấy màu sắc cho tag level
  const getLevelTagColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "ERROR":
        return "error";
      case "WARN":
        return "warning";
      case "INFO":
        return "processing";
      case "SUCCESS":
        return "success";
      case "DEBUG":
        return "default";
      default:
        return "default";
    }
  };

  // Cấu hình cột cho bảng Ant Design
  const columns: TableProps<LogEntry>["columns"] = [
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      render: (level: LogEntry["level"]) => (
        <Tag color={getLevelTagColor(level)}>{level}</Tag>
      ),
      width: 100,
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 120,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user: LogEntry["user"]) => (
        <div>
          {user.name && <div>{user.name}</div>}
          {user.id && (
            <div style={{ fontSize: "0.8em", color: "#999" }}>
              ID: {user.id}
            </div>
          )}
          {user.email && (
            <div style={{ fontSize: "0.8em", color: "#999" }}>{user.email}</div>
          )}
        </div>
      ),
      width: 180,
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (message: string) => (
        <div style={{ whiteSpace: "pre-wrap" }}>{message}</div>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: () => <Button type="link" icon={<EyeOutlined />} size="small" />,
      width: 80,
      align: "center",
    },
  ];

  // Logic lọc dữ liệu (đơn giản, có thể mở rộng)
  const filteredLogData = mockLogData.filter((log) => {
    // Lọc theo level
    if (selectedLogFilter !== "All Levels" && log.level !== selectedLogFilter) {
      return false;
    }

    // Lọc theo category
    if (
      selectedCategoryFilter !== "All Categories" &&
      log.category !== selectedCategoryFilter
    ) {
      return false;
    }

    // Lọc theo user (đơn giản theo tên hoặc email)
    if (selectedUserFilter !== "All Users") {
      const userMatch =
        (log.user.name &&
          log.user.name
            .toLowerCase()
            .includes(selectedUserFilter.toLowerCase())) ||
        (log.user.email &&
          log.user.email
            .toLowerCase()
            .includes(selectedUserFilter.toLowerCase()));
      if (!userMatch) {
        return false;
      }
    }

    // Lọc theo tìm kiếm
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const messageMatch = log.message.toLowerCase().includes(searchLower);
      const userMatch =
        (log.user.name && log.user.name.toLowerCase().includes(searchLower)) ||
        (log.user.email &&
          log.user.email.toLowerCase().includes(searchLower)) ||
        (log.user.id && log.user.id.toLowerCase().includes(searchLower));
      const categoryMatch = log.category.toLowerCase().includes(searchLower);
      const ipMatch = log.ipAddress && log.ipAddress.includes(searchLower);
      if (!messageMatch && !userMatch && !categoryMatch && !ipMatch) {
        return false;
      }
    }

    // Lọc theo tags (Errors Only, Security, API)
    if (activeTags.includes("Errors Only") && log.level !== "ERROR") {
      return false;
    }
    // Logic cho Security và API sẽ cần thêm trường dữ liệu hoặc quy tắc phức tạp hơn
    // Ví dụ: if (activeTags.includes('Security') && log.category !== 'Authentication') return false;
    // if (activeTags.includes('API') && log.category !== 'API') return false;

    return true;
  });

  const handleTagClick = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4}>Log Manager</Title>
          <Text type="secondary">
            Monitor system activities, user events, and application events
          </Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<DownloadOutlined />}>Export log</Button>
            <Button icon={<UserOutlined />} />{" "}
            {/* Placeholder for user settings */}
          </Space>
        </Col>
      </Row>

      {/* --- Phần thống kê --- */}
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        {/* Total Events */}
        <Col span={6}>
          <StatisticCard
            title="Total Events"
            value={mockStats.totalEvents}
            icon={<SlidersOutlined style={{ transform: "rotate(90deg)" }} />} // Icon gần giống
            subInfo={`${mockStats.totalEventsToday.toLocaleString()} hôm nay`}
            subInfoColor="#52c41a"
            iconColor="#3B82F6"
            changeDirection="up"
          />
        </Col>

        {/* Error Rate */}
        <Col span={6}>
          <StatisticCard
            title="Error Rate"
            value={mockStats.errorRate}
            valueSuffix="%"
            icon={<WarningOutlined />}
            subInfo={`${Math.abs(mockStats.errorRateChange)}% so với hôm qua`}
            subInfoColor={mockStats.errorRateChange < 0 ? "#52c41a" : "#cf1322"}
            iconColor="#EF4444"
            changeDirection={mockStats.errorRateChange < 0 ? "down" : "up"}
          />
        </Col>

        {/* Active Users */}
        <Col span={6}>
          <StatisticCard
            title="Active Users"
            value={mockStats.activeUsers}
            icon={<UserOutlined />}
            iconColor="#10B981"
            subInfo={`Đỉnh điểm: ${mockStats.activeUsersPeak} lúc 2PM`}
          />
        </Col>

        {/* Response Time */}
        <Col span={6}>
          <StatisticCard
            title="Response Time"
            value={mockStats.responseTime}
            valueSuffix="ms"
            icon={<ThunderboltOutlined />}
            iconColor="#F59E0B"
            subInfo={`${Math.abs(
              mockStats.responseTimeImprovement
            )}ms cải thiện`}
            subInfoColor={
              mockStats.responseTimeImprovement < 0 ? "#52c41a" : "#cf1322"
            }
            isImprovement={true} // Mặc định cải thiện là mũi tên xuống
          />
        </Col>
      </Row>

      {/* --- Phần bộ lọc và tìm kiếm nhật ký --- */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col>
            <div style={{ marginBottom: 4 }}>Log Level</div>
            <Select
              defaultValue="All Levels"
              style={{ width: 120 }}
              onChange={setSelectedLogFilter}
              value={selectedLogFilter}
            >
              <Option value="All Levels">Tất cả</Option>
              <Option value="ERROR">ERROR</Option>
              <Option value="WARN">WARN</Option>
              <Option value="INFO">INFO</Option>
              <Option value="SUCCESS">SUCCESS</Option>
              <Option value="DEBUG">DEBUG</Option>
            </Select>
          </Col>
          <Col>
            <div style={{ marginBottom: 4 }}>Category</div>
            <Select
              defaultValue="All Categories"
              style={{ width: 160 }}
              onChange={setSelectedCategoryFilter}
              value={selectedCategoryFilter}
            >
              <Option value="All Categories">Tất cả danh mục</Option>
              <Option value="Authentication">Authentication</Option>
              <Option value="Database">Database</Option>
              <Option value="Project">Project</Option>
              <Option value="Payment">Payment</Option>
              <Option value="API">API</Option>
              <Option value="System">System</Option>
              <Option value="Network">Network</Option>
              <Option value="User Management">User Management</Option>
              <Option value="Storage">Storage</Option>
              <Option value="Frontend">Frontend</Option>
            </Select>
          </Col>
          <Col>
            <div style={{ marginBottom: 4 }}>Time Range</div>
            <Select
              defaultValue="Last 24 hours"
              style={{ width: 150 }}
              onChange={setSelectedTimeRange}
              value={selectedTimeRange}
            >
              <Option value="Last 24 hours">24 giờ qua</Option>
              <Option value="Last 7 days">7 ngày qua</Option>
              <Option value="Last 30 days">30 ngày qua</Option>
              <Option value="Custom">Tùy chỉnh</Option>
            </Select>
          </Col>
          {selectedTimeRange === "Custom" && (
            <Col>
              <div style={{ marginBottom: 4 }}></div>{" "}
              {/* Placeholder for alignment */}
              <RangePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                onChange={(_dates, dateStrings) => console.log(dateStrings)}
              />
            </Col>
          )}
        </Row>
        <Row style={{ marginTop: 16 }} align="middle" gutter={[16, 0]}>
          <Col flex="auto">
            <Search
              placeholder="Tìm kiếm theo tin nhắn, IP, hoặc sự kiện..."
              allowClear
              onSearch={setSearchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%" }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Space>
              <Button
                type={
                  activeTags.includes("Errors Only") ? "primary" : "default"
                }
                onClick={() => handleTagClick("Errors Only")}
              >
                Chỉ lỗi
              </Button>
              <Button
                type={activeTags.includes("Security") ? "primary" : "default"}
                onClick={() => handleTagClick("Security")}
              >
                Bảo mật
              </Button>
              <Button
                type={activeTags.includes("API") ? "primary" : "default"}
                onClick={() => handleTagClick("API")}
              >
                API
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* --- Bảng nhật ký --- */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredLogData}
          pagination={{ pageSize: 10, showSizeChanger: false }} // Bạn có thể tùy chỉnh phân trang
          scroll={{ x: "max-content" }} // Để bảng cuộn ngang nếu nội dung quá dài
        />
      </Card>
    </Card>
  );
};

export default LogManagerPage;
