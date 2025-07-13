import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Tag,
  Space,
  message,
  Progress,
  Avatar,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { ProjectUpdateHistoryItem, ProjectUpdateHistoryMilestoneItem, ApiPage } from "../../../types/project";
import { getProjectUpdateHistoryApi } from "../../../api/projectApi";

const { Text } = Typography;

interface ProjectUpdateHistoryDisplayProps {
  historyId: string;
  projectType: "LABOR" | "FIXED_PRICE";
}

// Helper function to get status color
const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    "To Do": "default",
    "TODO": "default",
    "Doing": "processing",
    "DOING": "processing",
    "Completed": "success",
    "COMPLETED": "success",
    "On Hold": "warning",
    "At Risk": "error",
  };
  return statusMap[status] || "default";
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
    case "COMPLETED":
      return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    case "Doing":
    case "DOING":
      return <ClockCircleOutlined style={{ color: "#1890ff" }} />;
    case "At Risk":
      return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
    default:
      return <ClockCircleOutlined style={{ color: "#d9d9d9" }} />;
  }
};

const ProjectUpdateHistoryDisplay: React.FC<ProjectUpdateHistoryDisplayProps> = ({
  historyId,
  projectType,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<(ProjectUpdateHistoryItem | ProjectUpdateHistoryMilestoneItem)[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const response = await getProjectUpdateHistoryApi(
        historyId,
        page - 1,
        pageSize,
        [{ property: projectType === "LABOR" ? "taskDate" : "startDate", direction: "desc" }]
      );
      setData(response.content);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.totalElements,
      });
    } catch (error) {
      console.error("Failed to fetch project update history:", error);
      message.error("Failed to load project update history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (historyId) {
      fetchData();
    }
  }, [historyId]);

  // Timelog columns for Labor projects
  const timelogColumns: ColumnsType<ProjectUpdateHistoryItem> = [
    {
      title: "Task Date",
      dataIndex: "taskDate",
      key: "taskDate",
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <Text>{dayjs(date).format("MMM DD, YYYY")}</Text>
        </Space>
      ),
    },
    {
      title: "Performer",
      dataIndex: "performerFullName",
      key: "performerFullName",
      width: 150,
      render: (name: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Task Description",
      dataIndex: "taskDescription",
      key: "taskDescription",
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip title={description}>
          <Text>{description}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Hours Spent",
      dataIndex: "hoursSpent",
      key: "hoursSpent",
      width: 100,
      align: "center",
      render: (hours: number) => (
        <Text strong style={{ color: "#1890ff" }}>
          {hours && typeof hours === 'number' ? hours.toFixed(1) : '0.0'}h
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 130,
      render: (_, record: ProjectUpdateHistoryItem) => (
        <Tag
          color={getStatusColor(record.computedTimelogStatus)}
          icon={getStatusIcon(record.computedTimelogStatus)}
        >
          {record.computedTimelogStatus}
        </Tag>
      ),
    },
    {
      title: "Progress",
      dataIndex: "completionPercentage",
      key: "completionPercentage",
      width: 120,
      render: (percentage: number) => (
        <Progress
          percent={percentage && typeof percentage === 'number' ? percentage : 0}
          size="small"
          strokeColor={percentage >= 100 ? "#52c41a" : "#1890ff"}
          format={(percent) => `${percent}%`}
        />
      ),
    },
  ];

  // Milestone columns for Fixed Price projects
  const milestoneColumns: ColumnsType<ProjectUpdateHistoryMilestoneItem> = [
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <Text>{dayjs(date).format("MMM DD, YYYY")}</Text>
        </Space>
      ),
    },
    {
      title: "Milestone Name",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (name: string) => (
        <Text strong>{name}</Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip title={description}>
          <Text>{description || 'No description'}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Deadline",
      dataIndex: "deadlineDate",
      key: "deadlineDate",
      width: 120,
      render: (date: string) => (
        <Text>{dayjs(date).format("MMM DD, YYYY")}</Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 130,
      render: (_, record: ProjectUpdateHistoryMilestoneItem) => (
        <Tag
          color={getStatusColor(record.status)}
          icon={getStatusIcon(record.status)}
        >
          {record.status}
        </Tag>
      ),
    },
    {
      title: "Progress",
      dataIndex: "completionPercentage",
      key: "completionPercentage",
      width: 120,
      render: (percentage: number) => (
        <Progress
          percent={percentage && typeof percentage === 'number' ? percentage : 0}
          size="small"
          strokeColor={percentage >= 100 ? "#52c41a" : "#1890ff"}
          format={(percent) => `${percent}%`}
        />
      ),
    },
  ];

  const handleTableChange = (paginationInfo: any) => {
    fetchData(paginationInfo.current, paginationInfo.pageSize);
  };

  const columns = projectType === "LABOR" ? timelogColumns : milestoneColumns;

  return (
    <div>
      <Table
        columns={columns as any}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        rowKey="id"
        scroll={{ x: 800 }}
        size="small"
      />
    </div>
  );
};

export default ProjectUpdateHistoryDisplay; 