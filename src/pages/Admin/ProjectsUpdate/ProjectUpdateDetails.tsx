// src/components/Admin/ProjectProgress/ProjectUpdateDetails.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Typography,
  Space,
  Tag,
  Button,
  Divider,
  Progress,
  Row,
  Col,
  Spin,
  message,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  ProjectUpdate,
  getProjectUpdateByIdApi,
  deleteProjectUpdateApi,
} from "../../../api/projectUpdateApi";

import { getProjectById } from "../../../api/apiNotification";

import EditProjectUpdateModal from "../../../components/Admin/ProjectUpdate/EditProjectUpdateModal";
import AttachmentsTree from "../../../components/Admin/ProjectUpdate/AttachmentsTree";
import dayjs from "dayjs";
import { Project } from "../../../types/project";

// <!-- import { getProjectById } from "../../../api/dashboardAdminApi"; -->

import SendReportProjectUpdateModal from "../../../components/Admin/ProjectUpdate/SendReportProjectUpdateModal";
import { useAuth } from "../../../contexts/AuthContext";
import SendFeedbackModal from "../../Client/SendFeedbackModal";

const { Title, Paragraph } = Typography;

// Helper function to get status color
const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    NEW: "cyan",
    SENT: "volcano",
    FEEDBACK: "green",
  };
  return statusMap[status] || "default";
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
    case "CLOSED":
      return <CheckCircleOutlined />;
    case "PENDING":
    case "PROGRESS":
      return <ClockCircleOutlined />;
    case "AT_RISK":
      return <ExclamationCircleOutlined />;
    default:
      return null;
  }
};
interface ProjectUpdateDetailsProps {
  id: number | undefined;
}
const ProjectUpdateDetails: React.FC<ProjectUpdateDetailsProps> = ({ id }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [update, setUpdate] = useState<ProjectUpdate | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isSendReportModalVisible, setIsSendReportModalVisible] =
    useState<boolean>(false);
  const [isSendFeedbackModalVisible, setIsSendFeedbackModalVisible] =
    useState<boolean>(false);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  const { userRole } = useAuth();

  // Fetch update details when component mounts
  useEffect(() => {
    const fetchUpdateDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const updateData = await getProjectUpdateByIdApi(id);
        setUpdate(updateData);

        if (updateData.projectId) {
          const projectData = await getProjectById(updateData.projectId);
          setProject(projectData); // project state được set ở đây
          setAvailableProjects([projectData]);
        }
      } catch (error) {
        console.error("Failed to fetch update details:", error);
        message.error("Failed to load update details");
      } finally {
        setLoading(false);
      }
    };

    fetchUpdateDetails();
  }, [id]);

  // Handle delete update
  const handleDeleteUpdate = async () => {
    if (!update) return;

    try {
      await deleteProjectUpdateApi(update.id);
      message.success("Update deleted successfully");
      navigate("/admin/project-progress");
    } catch (error) {
      console.error("Failed to delete update:", error);
      message.error("Failed to delete update");
    }
  };

  // Handle update success (after editing)
  const handleUpdateSuccess = async () => {
    setIsEditModalVisible(false);

    // Refresh update data
    if (id) {
      try {
        setLoading(true);
        const updatedData = await getProjectUpdateByIdApi(id);
        setUpdate(updatedData);
        message.success("Update modified successfully");
      } catch (error) {
        console.error("Failed to refresh update details:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <Spin size="large" tip="Loading update details..." />
        </div>
      </Card>
    );
  }

  if (!update) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "30px" }}>
          <Title level={4}>Update not found</Title>
          {userRole === "ADMIN" ? (
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/project-progress")}
            >
              Back to Project Progress
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              Back to the previous page
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ marginBottom: 20 }}>
        {userRole === "ADMIN" && (
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/admin/project-progress")}
            >
              Back to List
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditModalVisible(true)}
            >
              Edit Update
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this update?"
              onConfirm={handleDeleteUpdate}
              okText="Yes"
              cancelText="No"
            >
              <Button danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        )}

        <Space style={{ float: "right" }}>
          {userRole === "ADMIN" ? (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => setIsSendReportModalVisible(true)}
            >
              Send Report
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => setIsSendFeedbackModalVisible(true)}
            >
              Send Feedback
            </Button>
          )}
        </Space>
      </div>

      <Title level={4}>{update.summary}</Title>

      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title="Basic Information" bordered={false}>
            <Descriptions column={2}>
              <Descriptions.Item label="Project">
                {project?.name || update.projectName}
              </Descriptions.Item>
              <Descriptions.Item label="Update Date">
                {dayjs(update.updateDate).format("YYYY-MM-DD")}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={getStatusColor(update.statusAtUpdate)}
                  icon={getStatusIcon(update.statusAtUpdate)}
                >
                  {update.statusAtUpdate.replace(/_/g, " ")}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Completion">
                <Progress
                  percent={update.completionPercentage ?? 0}
                  size="small"
                  status={
                    update.completionPercentage === 100 ? "success" : "active"
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {update.email}
              </Descriptions.Item>
              <Descriptions.Item label="Is Published">
                <Tag color={update.published ? "green" : "orange"}>
                  {update.published ? "Published" : "Draft"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created At" span={2}>
                {dayjs(update.createdAt).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated" span={2}>
                {dayjs(update.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="Update Details"
            bordered={false}
            style={{ marginTop: 16 }}
          >
            <Paragraph>{update.details}</Paragraph>
          </Card>

          {update.internalNotes && userRole === "ADMIN" ? (
            <Card
              title="Internal Notes"
              bordered={false}
              style={{
                marginTop: 16,
                background: "#fffbe6",
                borderColor: "#ffe58f",
              }}
              extra={<Tag color="warning">Private</Tag>}
            >
              <Paragraph>{update.internalNotes}</Paragraph>
            </Card>
          ) : null}
        </Col>

        <Col span={8}>
          {/* Truyền projectId và projectName vào AttachmentsTree */}
          <AttachmentsTree
            projectId={update?.projectId}
            projectName={project?.name || update?.projectName}
          />

          {project && (
            <Card title="Project Information" style={{ marginTop: 16 }}>
              <Descriptions column={1}>
                <Descriptions.Item label="Project Name">
                  {project.name}
                </Descriptions.Item>
                <Descriptions.Item label="Project Status">
                  <Tag color={getStatusColor(project.status)}>
                    {project.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {project.startDate
                    ? dayjs(project.startDate).format("YYYY-MM-DD")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Planned End Date">
                  {project.plannedEndDate
                    ? dayjs(project.plannedEndDate).format("YYYY-MM-DD")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Project Type">
                  {project.type}
                </Descriptions.Item>
              </Descriptions>
              <Divider />
              <Button
                type="primary"
                onClick={() => {
                  if (userRole === "ADMIN") {
                    navigate(`/admin/projects/${project.id}/details`);
                  } else {
                    navigate(`/client/projects/${project.id}/details`);
                  }
                }}
                style={{ padding: 10 }}
              >
                View Project Details
              </Button>
            </Card>
          )}
        </Col>
      </Row>

      {update && isEditModalVisible && (
        <EditProjectUpdateModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSuccess={handleUpdateSuccess}
          updateData={update}
          projects={availableProjects}
        />
      )}

      {update && isSendReportModalVisible && (
        <SendReportProjectUpdateModal
          visible={isSendReportModalVisible}
          onClose={() => setIsSendReportModalVisible(false)}
          updateData={update}
        />
      )}

      {update && isSendFeedbackModalVisible && (
        <SendFeedbackModal
          visible={isSendFeedbackModalVisible}
          onClose={() => setIsSendFeedbackModalVisible(false)}
          updateData={update}
          onSuccess={() => {
            setIsSendFeedbackModalVisible(false);
            message.success("Feedback sent successfully!");
          }}
        />
      )}
    </Card>
  );
};

export default ProjectUpdateDetails;
