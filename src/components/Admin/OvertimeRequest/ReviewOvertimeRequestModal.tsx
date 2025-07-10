import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Card,
  Tag,
  Radio,
  Divider,
  Statistic,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ProjectOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { reviewOvertimeRequestApi } from "../../../api/overtimeRequestApi";
import { useAlert } from "../../../contexts/AlertContext";
import { useAuth } from "../../../contexts/AuthContext";
import { OvertimeRequest, ReviewOvertimeRequestDto } from "../../../types/overtimeRequest";

const { TextArea } = Input;
const { Text, Title } = Typography;

interface ReviewOvertimeRequestModalProps {
  visible: boolean;
  request: OvertimeRequest | null;
  onCancel: () => void;
  onSuccess: () => void;
  viewOnly?: boolean;
}

const ReviewOvertimeRequestModal: React.FC<ReviewOvertimeRequestModalProps> = ({
  visible,
  request,
  onCancel,
  onSuccess,
  viewOnly = false,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<boolean | null>(null);
  const { addAlert } = useAlert();
  const { userRole } = useAuth();

  // Security: Only ADMIN can review overtime requests
  if (userRole !== "ADMIN") {
    return null;
  }

  if (!request) return null;

  const handleSubmit = async (values: any) => {
    if (decision === null) {
      addAlert("Please select approve or reject", "warning");
      return;
    }

    setLoading(true);
    
    try {
      const reviewData: ReviewOvertimeRequestDto = {
        id: request.id,
        approved: decision,
        reviewNote: values.reviewNote || "",
      };

      await reviewOvertimeRequestApi(reviewData);
      
      addAlert(
        `Overtime request ${decision ? "approved" : "rejected"} successfully`,
        "success"
      );
      form.resetFields();
      setDecision(null);
      onSuccess();
    } catch (error: any) {
      addAlert(error.response?.data?.message || "Failed to review overtime request", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setDecision(null);
    onCancel();
  };

  const daysExtension = dayjs(request.requestedPlannedEndDate)
    .diff(dayjs(request.currentPlannedEndDate), "day");

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            {viewOnly ? "View" : "Review"} Overtime Request #{request.id}
          </Title>
          {viewOnly && (
            <Tag color="blue" icon={<EyeOutlined />}>
              View Only
            </Tag>
          )}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <div style={{ marginTop: 24 }}>
        {/* Request Summary */}
        <Card size="small" style={{ marginBottom: 20 }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Statistic
                title="Status"
                value={request.status}
                valueStyle={{ 
                  color: request.status === "PENDING" ? "#faad14" : "#d9d9d9" 
                }}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Project Type"
                value={request.projectType}
                prefix={<ProjectOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Extension Days"
                value={daysExtension}
                suffix="days"
                valueStyle={{ color: daysExtension > 0 ? "#722ed1" : "#52c41a" }}
                prefix={<CalendarOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Requested By"
                value={request.requestedBy}
                prefix={<UserOutlined />}
              />
            </Col>
          </Row>
        </Card>

        {/* Project Information */}
        <Card size="small" title="Project Information" style={{ marginBottom: 20 }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Text strong>Project ID: </Text>
              <Text>{request.projectId}</Text>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size={0}>
                <Text strong style={{ color: "#faad14" }}>Current End Date:</Text>
                <Text style={{ fontSize: 16 }}>
                  {dayjs(request.currentPlannedEndDate).format("MMMM DD, YYYY")}
                </Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space direction="vertical" size={0}>
                <Text strong style={{ color: "#52c41a" }}>Requested End Date:</Text>
                <Text style={{ fontSize: 16, fontWeight: 600, color: "#52c41a" }}>
                  {dayjs(request.requestedPlannedEndDate).format("MMMM DD, YYYY")}
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Reason */}
        <Card size="small" title="Reason for Extension" style={{ marginBottom: 20 }}>
          <div
            style={{
              background: "#fafafa",
              padding: 16,
              borderRadius: 8,
              borderLeft: "4px solid #1890ff",
            }}
          >
            <Text>{request.reason}</Text>
          </div>
        </Card>

        {/* Request Details */}
        <Card size="small" title="Request Details" style={{ marginBottom: 20 }}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text strong>Requested by: </Text>
              <br />
              <Text>{request.requestedBy}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Requested on: </Text>
              <br />
              <Text>{dayjs(request.requestedDate).format("MMMM DD, YYYY HH:mm")}</Text>
            </Col>
            <Col span={24} style={{ marginTop: 16 }}>
              <Text strong>Request ID: </Text>
              <Text>#{request.id}</Text>
            </Col>
          </Row>
        </Card>

        {/* Review Information - Only show if request has been reviewed */}
        {request.status !== 'PENDING' && request.reviewedBy && (
          <Card size="small" title="Review Information" style={{ marginBottom: 20 }}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Text strong>Reviewed by: </Text>
                <br />
                <Text>{request.reviewedBy}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Reviewed on: </Text>
                <br />
                <Text>
                  {request.reviewedDate 
                    ? dayjs(request.reviewedDate).format("MMMM DD, YYYY HH:mm")
                    : "N/A"}
                </Text>
              </Col>
              {request.reviewNote && (
                <Col span={24} style={{ marginTop: 16 }}>
                  <Text strong>Review Note: </Text>
                  <div
                    style={{
                      background: "#fafafa",
                      padding: 12,
                      borderRadius: 6,
                      borderLeft: `4px solid ${request.status === 'APPROVED' ? '#52c41a' : '#ff4d4f'}`,
                      marginTop: 8,
                    }}
                  >
                    <Text>{request.reviewNote}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        )}

        {!viewOnly && <Divider />}

        {/* Review Form - Only show in review mode */}
        {!viewOnly && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
          <Card size="small" title="Review Decision">
            <Form.Item
              label={
                <Space>
                  <Text strong>Decision</Text>
                  <Text type="secondary">(Required)</Text>
                </Space>
              }
              required
            >
              <Radio.Group
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                size="large"
              >
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Radio.Button
                      value={true}
                      style={{
                        width: "100%",
                        height: 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderColor: decision === true ? "#52c41a" : undefined,
                        color: decision === true ? "#52c41a" : undefined,
                      }}
                    >
                      <Space>
                        <CheckCircleOutlined />
                        <Text strong>Approve Request</Text>
                      </Space>
                    </Radio.Button>
                  </Col>
                  <Col span={12}>
                    <Radio.Button
                      value={false}
                      style={{
                        width: "100%",
                        height: 60,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderColor: decision === false ? "#ff4d4f" : undefined,
                        color: decision === false ? "#ff4d4f" : undefined,
                      }}
                    >
                      <Space>
                        <CloseCircleOutlined />
                        <Text strong>Reject Request</Text>
                      </Space>
                    </Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  <FileTextOutlined />
                  <Text strong>Review Note</Text>
                  <Text type="secondary">(Optional)</Text>
                </Space>
              }
              name="reviewNote"
            >
              <TextArea
                rows={4}
                placeholder={
                  decision === true
                    ? "Add approval comments (optional)..."
                    : decision === false
                    ? "Please explain the reason for rejection..."
                    : "Add your review comments..."
                }
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Card>

          <Form.Item style={{ marginBottom: 0, textAlign: "right", marginTop: 20 }}>
            <Space size="middle">
              <Button size="large" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                disabled={decision === null}
                style={{
                  background: decision === true ? "#52c41a" : decision === false ? "#ff4d4f" : undefined,
                  borderColor: decision === true ? "#52c41a" : decision === false ? "#ff4d4f" : undefined,
                }}
              >
                {decision === true ? "Approve Request" : decision === false ? "Reject Request" : "Submit Review"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
        )}

        {/* View Only Mode Footer */}
        {viewOnly && (
          <div style={{ textAlign: "right", marginTop: 20 }}>
            <Button size="large" onClick={handleCancel}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReviewOvertimeRequestModal; 