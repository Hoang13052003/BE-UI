import React, { useState } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
} from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import CreateOvertimeRequestModal from "./CreateOvertimeRequestModal";
import OvertimeRequestList from "./OvertimeRequestList";
import { OvertimeRequest } from "../../../types/overtimeRequest";
import dayjs from "dayjs";
import { useAuth } from "../../../contexts/AuthContext";
import UnauthorizedPage from "../../../pages/UnauthorizedPage";

const { Title, Text } = Typography;

const OvertimeRequestManager: React.FC = () => {
  const { userRole } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Security: Only MANAGER can access this component
  if (userRole !== "MANAGER") {
    return <UnauthorizedPage />;
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewDetails = (request: OvertimeRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "#faad14";
      case "APPROVED":
        return "#52c41a";
      case "REJECTED":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  const renderDetailsModal = () => {
    if (!selectedRequest) return null;

    const daysExtension = dayjs(selectedRequest.requestedPlannedEndDate)
      .diff(dayjs(selectedRequest.currentPlannedEndDate), "day");

    return (
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: "#1890ff" }} />
            <Title level={4} style={{ margin: 0 }}>
              Overtime Request Details #{selectedRequest.id}
            </Title>
          </Space>
        }
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>,
        ]}
      >
        <div style={{ marginTop: 24 }}>
          {/* Status and Basic Info */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Status"
                  value={selectedRequest.status}
                  valueStyle={{ color: getStatusColor(selectedRequest.status) }}
                  prefix={
                    selectedRequest.status === "PENDING" ? (
                      <ClockCircleOutlined />
                    ) : selectedRequest.status === "APPROVED" ? (
                      <CheckCircleOutlined />
                    ) : (
                      <ExclamationCircleOutlined />
                    )
                  }
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Project Type"
                  value={selectedRequest.projectType}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Extension Days"
                  value={daysExtension}
                  suffix="days"
                  valueStyle={{ color: daysExtension > 0 ? "#722ed1" : "#52c41a" }}
                />
              </Col>
            </Row>
          </Card>

          {/* Project and Dates */}
          <Card size="small" title="Project Information" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Text strong>Project ID: </Text>
                <Text>{selectedRequest.projectId}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Current End Date: </Text>
                <br />
                <Text>{dayjs(selectedRequest.currentPlannedEndDate).format("MMMM DD, YYYY")}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Requested End Date: </Text>
                <br />
                <Text style={{ color: "#52c41a", fontWeight: 600 }}>
                  {dayjs(selectedRequest.requestedPlannedEndDate).format("MMMM DD, YYYY")}
                </Text>
              </Col>
            </Row>
          </Card>

          {/* Reason */}
          <Card size="small" title="Reason for Extension" style={{ marginBottom: 16 }}>
            <Text>{selectedRequest.reason}</Text>
          </Card>

          {/* Request Information */}
          <Card size="small" title="Request Information" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Requested by: </Text>
                <br />
                <Text>{selectedRequest.requestedBy}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Requested on: </Text>
                <br />
                <Text>{dayjs(selectedRequest.requestedDate).format("MMMM DD, YYYY HH:mm")}</Text>
              </Col>
            </Row>
          </Card>

          {/* Review Information (if available) */}
          {(selectedRequest.reviewedBy || selectedRequest.reviewNote) && (
            <Card size="small" title="Review Information">
              <Row gutter={[16, 16]}>
                {selectedRequest.reviewedBy && (
                  <Col span={12}>
                    <Text strong>Reviewed by: </Text>
                    <br />
                    <Text>{selectedRequest.reviewedBy}</Text>
                  </Col>
                )}
                {selectedRequest.reviewedDate && (
                  <Col span={12}>
                    <Text strong>Reviewed on: </Text>
                    <br />
                    <Text>{dayjs(selectedRequest.reviewedDate).format("MMMM DD, YYYY HH:mm")}</Text>
                  </Col>
                )}
              </Row>
              {selectedRequest.reviewNote && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Review Note: </Text>
                  <br />
                  <div
                    style={{
                      background: "#fafafa",
                      padding: 12,
                      borderRadius: 6,
                      marginTop: 8,
                      borderLeft: `4px solid ${getStatusColor(selectedRequest.status)}`,
                    }}
                  >
                    <Text>{selectedRequest.reviewNote}</Text>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={3} style={{ margin: 0 }}>
                Overtime Request Management
              </Title>
              <Text type="secondary">
                Manage your project deadline extension requests
              </Text>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setShowCreateModal(true)}
              style={{ borderRadius: 8 }}
            >
              New Request
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Overtime Request List */}
      <OvertimeRequestList
        refreshTrigger={refreshTrigger}
        onViewDetails={handleViewDetails}
      />

      {/* Create Modal */}
      <CreateOvertimeRequestModal
        visible={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Details Modal */}
      {renderDetailsModal()}
    </div>
  );
};

export default OvertimeRequestManager; 