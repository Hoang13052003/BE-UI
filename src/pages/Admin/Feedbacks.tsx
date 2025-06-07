import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Table,
  Tag,
  // Input,
  Select,
  DatePicker,
  Tooltip,
  Statistic,
} from "antd";
import {
  EyeOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  filter,
  type FeedbackCriteria,
  type PaginatedFeedbackResponse,
} from "../../api/feedbackApi"; // Assuming FeedbackItem has projectId and projectName
import dayjs from "dayjs";
import FeedbackDetailModal from "./FeedbackDetailModal";

const { Title, Text } = Typography;
const { Option } = Select;

interface FeedbackItem {
  id: string | number;
  fullName?: string;
  email?: string;
  projectName: string;
  projectId: number; // Assuming projectId is a number
  content: string;
  createdAt: string;
  read: boolean;
}

interface TypedPaginatedFeedbackResponse
  extends Omit<PaginatedFeedbackResponse, "content"> {
  content: FeedbackItem[];
}

const Feedbacks: React.FC = () => {
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

  const [criteria, setCriteria] = useState<FeedbackCriteria>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(
    null
  );

  const unreadCount = useMemo(
    () => feedbacks.content.filter((item) => !item.read).length,
    [feedbacks.content]
  );

  const stats = {
    totalFeedback: feedbacks.content.length || 0,
    pendingReviews: unreadCount,
    averageRating: 4.7,
    responseRate: 94,
    growthStats: {
      feedbackGrowth: "+13%",
      ratingGrowth: "+0.3",
      responseGrowth: "+5%",
    },
  };

  const fetchFeedbacks = async (
    page: number = 0,
    size: number = 10,
    searchCriteria: FeedbackCriteria = {}
  ) => {
    try {
      setLoading(true);
      const response = await filter(
        searchCriteria,
        page,
        size,
        "createdAt",
        "desc"
      );
      setFeedbacks(response as TypedPaginatedFeedbackResponse);
      setPagination((prev) => ({
        ...prev,
        total: response.totalElements,
      }));
      console.log("Data feedbacks: " + JSON.stringify(feedbacks.content));
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks(0, pagination.pageSize, criteria);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [criteria]);
  const handleViewDetails = (feedbackId: string) => {
    setSelectedFeedbackId(feedbackId);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedFeedbackId(null);
    fetchFeedbacks(0, pagination.pageSize, criteria);
  };

  const derivedProjectOptions = useMemo(() => {
    if (!feedbacks.content || feedbacks.content.length === 0) {
      return [];
    }
    const uniqueProjects = new Map<number, { label: string; value: number }>();
    feedbacks.content.forEach((feedback) => {
      if (feedback.projectId && feedback.projectName) {
        if (!uniqueProjects.has(feedback.projectId)) {
          uniqueProjects.set(feedback.projectId, {
            label: feedback.projectName,
            value: feedback.projectId,
          });
        }
      }
    });
    return Array.from(uniqueProjects.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [feedbacks.content]);

  const columns = [
    {
      title: "Client",
      dataIndex: "fullName",
      key: "user",
      render: (_: any, record: FeedbackItem) => (
        <Space direction="vertical">
          <Text strong>{record.fullName || "Client Name"}</Text>
          <Text type="secondary">{record.email || "client@email.com"}</Text>
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
              onClick={() => handleViewDetails(String(record.id))} // Pass record.id to handler
              type="text"
              icon={<EyeOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getDatePickerValue = () => {
    if (criteria.createdAt && criteria.createdAt.equals) {
      const dateObj = dayjs(criteria.createdAt.equals, "YYYY-MM-DD");
      return dateObj.isValid() ? dateObj : null;
    }
    return null; // Hoặc undefined nếu DatePicker của bạn xử lý được
  };

  return (
    <Card style={{ height: "100%" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4}>Feedback Management</Title>
          <Text type="secondary">
            Monitor and respond to client feedback across all projects
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
            placeholder="All Projects"
            style={{ width: "100%" }}
            allowClear
            onChange={(value) =>
              setCriteria((prev) => ({
                ...prev,
                projectId:
                  value === "" || value === undefined
                    ? undefined
                    : { equals: Number(value) },
              }))
            }
            value={
              criteria.projectId ? String(criteria.projectId.equals) : undefined
            }
          >
            <Option value="">All Projects</Option>
            {derivedProjectOptions.map((p) => (
              <Option key={p.value} value={String(p.value)}>
                {p.label}
              </Option>
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
            <Option value="">All Status</Option>
            <Option value="read">Reviewed</Option>
            <Option value="unread">Pending</Option>
          </Select>
        </Col>
        <Col xs={24} sm={8}>
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn ngày lọc"
            allowClear
            onChange={(date) => {
              // date là Day.js object từ DatePicker hoặc null
              if (date) {
                setCriteria((prev) => ({
                  ...prev,
                  createdAt: { equals: date.format("YYYY-MM-DD") }, // << SỬA Ở ĐÂY
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

      {/* Table */}
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

      {selectedFeedbackId && (
        <FeedbackDetailModal
          feedbackId={selectedFeedbackId}
          visible={isDetailModalVisible}
          onClose={handleCloseDetailModal}
        />
      )}
    </Card>
  );
};

export default Feedbacks;
