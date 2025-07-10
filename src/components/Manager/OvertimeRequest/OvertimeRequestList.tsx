import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Tag,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Divider,
  Empty,
  Spin,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ProjectOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getOvertimeRequestsApi } from "../../../api/overtimeRequestApi";
import { useAlert } from "../../../contexts/AlertContext";
import { OvertimeRequest, OvertimeRequestStatus } from "../../../types/overtimeRequest";

const { Text, Title } = Typography;

interface OvertimeRequestListProps {
  refreshTrigger?: number;
  onViewDetails?: (request: OvertimeRequest) => void;
}

const OvertimeRequestList: React.FC<OvertimeRequestListProps> = ({
  refreshTrigger = 0,
  onViewDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const { addAlert } = useAlert();

  useEffect(() => {
    fetchOvertimeRequests();
  }, [refreshTrigger]);

  const fetchOvertimeRequests = async () => {
    setLoading(true);
    try {
      const data = await getOvertimeRequestsApi();
      setRequests(data);
    } catch (error: any) {
      addAlert(error.response?.data?.message || "Failed to fetch overtime requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OvertimeRequestStatus): string => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: OvertimeRequestStatus) => {
    switch (status) {
      case "PENDING":
        return <ClockCircleOutlined />;
      case "APPROVED":
        return <CheckCircleOutlined />;
      case "REJECTED":
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const calculateDaysExtension = (currentEnd: string, requestedEnd: string): number => {
    const current = dayjs(currentEnd);
    const requested = dayjs(requestedEnd);
    return requested.diff(current, "day");
  };

  const renderRequestItem = (request: OvertimeRequest) => {
    const daysExtension = calculateDaysExtension(
      request.currentPlannedEndDate,
      request.requestedPlannedEndDate
    );

    return (
      <List.Item
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: 12,
          marginBottom: 16,
          padding: 0,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ padding: "20px", width: "100%" }}>
          {/* Header */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Space>
              <Tag
                color={getStatusColor(request.status)}
                icon={getStatusIcon(request.status)}
                style={{ fontWeight: 600, borderRadius: 6 }}
              >
                {request.status}
              </Tag>
              <Tag style={{ background: "#f6f6f6", border: "none", borderRadius: 6 }}>
                <ProjectOutlined style={{ marginRight: 4 }} />
                {request.projectType}
              </Tag>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              #{request.id}
            </Text>
          </Row>

          {/* Project Info */}
          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Space>
                <ProjectOutlined style={{ color: "#1890ff" }} />
                <Text strong style={{ fontSize: 16 }}>
                  Project: {request.projectId}
                </Text>
              </Space>
            </Col>
          </Row>

          {/* Date Information */}
          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Current End Date
                </Text>
                <Space>
                  <CalendarOutlined style={{ color: "#faad14" }} />
                  <Text>{dayjs(request.currentPlannedEndDate).format("MMM DD, YYYY")}</Text>
                </Space>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Requested End Date
                </Text>
                <Space>
                  <CalendarOutlined style={{ color: "#52c41a" }} />
                  <Text>{dayjs(request.requestedPlannedEndDate).format("MMM DD, YYYY")}</Text>
                </Space>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Extension Period
                </Text>
                <Space>
                  <ClockCircleOutlined style={{ color: "#722ed1" }} />
                  <Text style={{ fontWeight: 600, color: daysExtension > 0 ? "#722ed1" : "#52c41a" }}>
                    {daysExtension > 0 ? `+${daysExtension} days` : `${daysExtension} days`}
                  </Text>
                </Space>
              </Space>
            </Col>
          </Row>

          {/* Reason */}
          <div style={{ marginBottom: 16 }}>
            <Space style={{ marginBottom: 8 }}>
              <FileTextOutlined style={{ color: "#1890ff" }} />
              <Text strong>Reason:</Text>
            </Space>
            <div
              style={{
                background: "#fafafa",
                padding: 12,
                borderRadius: 8,
                borderLeft: "4px solid #1890ff",
              }}
            >
              <Text>{request.reason}</Text>
            </div>
          </div>

          {/* Request Details */}
          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <Space>
                <UserOutlined style={{ color: "#1890ff" }} />
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Requested by
                  </Text>
                  <Text>{request.requestedBy}</Text>
                </Space>
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Requested on
                  </Text>
                  <Text>{dayjs(request.requestedDate).format("MMM DD, YYYY HH:mm")}</Text>
                </Space>
              </Space>
            </Col>
          </Row>

          {/* Review Information (if reviewed) */}
          {(request.reviewedBy || request.reviewNote) && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div style={{ background: "#f6f6f6", padding: 12, borderRadius: 8 }}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Review Information:
                </Text>
                <Row gutter={[16, 8]}>
                  {request.reviewedBy && (
                    <Col xs={24} sm={12}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Reviewed by:
                      </Text>
                      <br />
                      <Text>{request.reviewedBy}</Text>
                    </Col>
                  )}
                  {request.reviewedDate && (
                    <Col xs={24} sm={12}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Reviewed on:
                      </Text>
                      <br />
                      <Text>{dayjs(request.reviewedDate).format("MMM DD, YYYY HH:mm")}</Text>
                    </Col>
                  )}
                </Row>
                {request.reviewNote && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Review Note:
                    </Text>
                    <br />
                    <Text>{request.reviewNote}</Text>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewDetails?.(request)}
            >
              View Details
            </Button>
          </div>
        </div>
      </List.Item>
    );
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Loading overtime requests...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <Empty
          description="No overtime requests found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Text type="secondary">
            You haven't created any overtime requests yet.
          </Text>
        </Empty>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined style={{ color: "#1890ff" }} />
          <Title level={5} style={{ margin: 0 }}>
            Overtime Requests ({requests.length})
          </Title>
        </Space>
      }
    >
      <List
        dataSource={requests}
        renderItem={renderRequestItem}
        pagination={
          requests.length > 5
            ? {
                pageSize: 5,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} requests`,
              }
            : false
        }
      />
    </Card>
  );
};

export default OvertimeRequestList; 