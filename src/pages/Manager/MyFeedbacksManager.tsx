import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Table,
  Tag,
  Button,
  Statistic,
  Tooltip,
  Select,
  DatePicker,
} from "antd";
import {
  EyeOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getAllFeedbacks,
  type FeedbackCriteria,
  type PaginatedFeedbackResponse,
} from "../../api/feedbackApi";
import { useAuth } from "../../contexts/AuthContext";
import ClientFeedbackDetailModal from "./ClientFeedbackDetailModal";

const { Title, Text } = Typography;

interface FeedbackItem {
  id: string | number;
  fullName?: string;
  email?: string;
  projectName: string;
  projectId: number; // Changed back to number to match actual API response
  content: string;
  createdAt: string;
  read: boolean;
}

interface TypedPaginatedFeedbackResponse
  extends Omit<PaginatedFeedbackResponse, "content"> {
  content: FeedbackItem[];
}

interface FeedbackDetailModel {
  projectName: string;
  projectId: number; // Changed back to number to match actual API response
  content: string;
  createdAt: string;
  read: boolean;
}

const MyFeedbacks: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<TypedPaginatedFeedbackResponse>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackDetailModel | null>(null);
  const [criteria, setCriteria] = useState<FeedbackCriteria>({});

  const { userDetails } = useAuth();

  const unreadCount = useMemo(
    () => feedbacks.content.filter((item) => !item.read).length,
    [feedbacks.content]
  );

  const stats = {
    totalFeedback: feedbacks.totalElements || 0,
    pendingReviews: unreadCount,
    responseRate: 94,
    growthStats: {
      feedbackGrowth: "+13%",
      responseGrowth: "+5%",
    },
  };

  const fetchFeedbacks = async (
    page: number = 0,
    size: number = 10,
    searchCriteria: FeedbackCriteria = criteria
  ) => {
    try {
      setLoading(true);
      
      // Use getAllFeedbacks with enhanced security and role-based access control
      // The endpoint will automatically filter feedbacks for the current user based on their role and JWT token
      const response = await getAllFeedbacks(
        searchCriteria,
        page,
        size,
        "createdAt",
        "desc"
      );
      
      setFeedbacks(response as TypedPaginatedFeedbackResponse);
      setPagination((prev) => ({ ...prev, total: response.totalElements }));
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(0, pagination.pageSize, criteria);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [criteria]); // Removed userDetails dependency as it's handled by JWT token in the new endpoint

  const handleViewDetails = (feedback: FeedbackItem) => {
    setSelectedFeedback({ ...feedback });
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedFeedback(null);
    fetchFeedbacks(0, pagination.pageSize, criteria);
  };

  const derivedProjectOptions = useMemo(() => {
    if (!feedbacks.content || feedbacks.content.length === 0) {
      return [];
    }
    const uniqueProjects = new Map<number, { label: string; value: string }>();
    feedbacks.content.forEach((feedback) => {
      if (feedback.projectId && feedback.projectName) {
        if (!uniqueProjects.has(feedback.projectId)) {
          uniqueProjects.set(feedback.projectId, {
            label: feedback.projectName,
            value: feedback.projectId.toString(),
          });
        }
      }
    });
    return Array.from(uniqueProjects.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [feedbacks.content]);

  const getDatePickerValue = () => {
    if (criteria.createdAt && criteria.createdAt.equals) {
      const dateObj = dayjs(criteria.createdAt.equals, "YYYY-MM-DD");
      return dateObj.isValid() ? dateObj : null;
    }
    return null;
  };

  const columns = [
    {
      title: "User",
      key: "user",
      width: "20%",
      render: (_: any, record: FeedbackItem) => (
        <Space>
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
      title: "Project",
      dataIndex: "projectName",
      key: "project",
      render: (_: any, record: FeedbackItem) => (
        <Space direction="vertical">
          <Text strong>{record.projectName}</Text>
          {record.projectId && (
            <Text type="secondary">PRJ-{record.projectId}</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Feedback",
      dataIndex: "content",
      render: (content: string) => <Text>{content}</Text>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Status",
      dataIndex: "read",
      render: (read: boolean) => (
        <Tag color={read ? "green" : "blue"}>
          {read ? "Reviewed" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: FeedbackItem) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              onClick={() => handleViewDetails(record)}
              type="text"
              icon={<EyeOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ height: "100%" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4}>My Feedbacks</Title>
          <Text type="secondary">
            View the list of feedback you have submitted to projects
          </Text>
        </Col>
      </Row>
      {/* Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.24)" }}>
            <Statistic
              title="Total Feedback"
              value={stats.totalFeedback}
              prefix={<StarOutlined />}
              suffix={
                stats.growthStats.feedbackGrowth && (
                  <Text type="success">{stats.growthStats.feedbackGrowth}</Text>
                )
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.24)" }}>
            <Statistic
              title="Pending Reviews"
              value={stats.pendingReviews}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.24)" }}>
            <Statistic
              title="Response Rate"
              value={stats.responseRate}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>
      {/* Filter */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Select
            placeholder="Search Projects..."
            style={{ width: "100%" }}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            onChange={(value) =>
              setCriteria((prev) => ({
                ...prev,
                projectId:
                  value === "" || value === undefined
                    ? undefined
                    : { equals: parseInt(value, 10) }, // Convert string to number
              }))
            }
            value={
              criteria.projectId ? criteria.projectId.equals?.toString() : undefined
            }
          >
            <Select.Option value="">All Projects</Select.Option>
            {derivedProjectOptions.map((p) => (
              <Select.Option key={p.value} value={p.value}>
                {p.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <Select
            placeholder="All Status"
            style={{ width: "100%" }}
            allowClear
            onChange={(value) =>
              setCriteria((prev) => ({
                ...prev,
                read:
                  value === "" || value === undefined
                    ? undefined
                    : { equals: value === "read" },
              }))
            }
            value={
              criteria.read !== undefined
                ? criteria.read.equals
                  ? "read"
                  : "unread"
                : undefined
            }
          >
            <Select.Option value="">All Status</Select.Option>
            <Select.Option value="read">Reviewed</Select.Option>
            <Select.Option value="unread">Pending</Select.Option>
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select filter date"
            allowClear
            onChange={(date) => {
              if (date) {
                setCriteria((prev) => ({
                  ...prev,
                  createdAt: { equals: date.format("YYYY-MM-DD") },
                }));
              } else {
                setCriteria((prev) => {
                  const { createdAt, ...rest } = prev;
                  return { ...rest, createdAt: undefined };
                });
              }
            }}
            value={getDatePickerValue()}
            format="DD/MM/YYYY"
          />
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={feedbacks.content}
        rowKey="id"
        loading={loading}
        locale={{ emptyText: "No feedback data available" }}
        pagination={
          feedbacks.content.length > 0
            ? {
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: feedbacks.totalElements,
                onChange: (page, pageSize) => {
                  fetchFeedbacks(page - 1, pageSize, criteria);
                  setPagination({
                    current: page,
                    pageSize,
                    total: feedbacks.totalElements,
                  });
                },
              }
            : false
        }
      />
      {selectedFeedback && (
        <ClientFeedbackDetailModal
          feedback={selectedFeedback}
          visible={isDetailModalVisible}
          onClose={handleCloseDetailModal}
        />
      )}
    </Card>
  );
};

export default MyFeedbacks;
