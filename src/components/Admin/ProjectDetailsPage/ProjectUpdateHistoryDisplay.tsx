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
  Spin,
  Empty,
  Card
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
import { ProjectUpdateHistoryItem, ProjectUpdateHistoryMilestoneItem } from "../../../types/project";
import { getProjectUpdateHistoryEnhanced } from '../../../api/projectUpdateHistoryApi';

const { Text, Title } = Typography;

interface ProjectUpdateHistoryDisplayProps {
  historyId: string;
  projectType: "LABOR" | "FIXED_PRICE";
}

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
    width: 180,
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
        <Text>{description}</Text>
      </Tooltip>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (status: string) => (
      <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
        {status}
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

const renderSection = (title: string, data: any, type: 'timelog' | 'milestone') => (
  <Card title={<Title level={5} style={{ margin: 0 }}>{title}</Title>} style={{ marginBottom: 24 }}>
    <div style={{ margin: '12px 0' }}>
      <Tag color="blue">Total: {data?.totalCount || 0}</Tag>
    </div>
    {type === 'timelog' ? (
      data?.timeLogs && data.timeLogs.length > 0 ? (
        <Table
          dataSource={data.timeLogs}
          rowKey="id"
          pagination={false}
          columns={timelogColumns}
          bordered
          size="middle"
        />
      ) : <Empty description="No time logs" />
    ) : (
      data?.milestones && data.milestones.length > 0 ? (
        <Table
          dataSource={data.milestones}
          rowKey="id"
          pagination={false}
          columns={milestoneColumns}
          bordered
          size="middle"
        />
      ) : <Empty description="No milestones" />
    )}
  </Card>
);

const ProjectUpdateHistoryDisplay: React.FC<ProjectUpdateHistoryDisplayProps> = ({
  historyId,
  projectType,
}) => {
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getProjectUpdateHistoryEnhanced(historyId);
        setHistoryData(response);
      } catch (error) {
        setHistoryData(null);
        message.error("Failed to load project update history");
      } finally {
        setLoading(false);
      }
    };
    if (historyId) fetchData();
  }, [historyId]);

  if (loading) return <Spin size="large" tip="Loading project update history..." />;
  if (!historyData) return <Empty description="No history data found" />;

  // Xác định loại dữ liệu để render
  const type = projectType === 'LABOR' ? 'timelog' : 'milestone';

  return (
    <div>
      {renderSection(
        type === 'timelog' ? 'All Time Logs' : 'All Milestones',
        historyData.allData,
        type
      )}
      {renderSection(
        type === 'timelog' ? 'Current Week Time Logs' : 'Current Week Milestones',
        historyData.currentWeekData,
        type
      )}
      {renderSection(
        type === 'timelog' ? 'Completed Previous Week Time Logs' : 'Completed Previous Week Milestones',
        historyData.completedPreviousWeekData,
        type
      )}
    </div>
  );
};

export default ProjectUpdateHistoryDisplay; 