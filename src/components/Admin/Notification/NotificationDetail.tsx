import React, { useEffect, useState } from "react";
import {
  Modal,
  Drawer,
  Typography,
  Space,
  Button,
  Divider,
  Tag,
  Descriptions,
  Card,
  Timeline,
  Badge,
  Spin,
} from "antd";
import { CloseOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  MessageType,
  NotificationPriority,
  NotificationResponse,
} from "../../../types/Notification";
import { getNotificationById } from "../../../api/apiNotification";
import { Project } from "../../../types/project";
import dayjs from "dayjs";
import { getProjectById } from "../../../api/projectApi";

// Styled components
const { Text } = Typography;

const DetailContainer = styled.div`
  padding: 0;
  max-height: 90vh;
  overflow-y: auto;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
`;

const ContentSection = styled.div`
  margin-bottom: 24px;
`;

// const MetadataSection = styled.div`
//   background-color: #fafafa;
//   border-radius: 8px;
//   padding: 16px;
//   margin-bottom: 16px;
// `;

// const ActionSection = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 16px 0;
//   border-top: 1px solid #f0f0f0;
// `;

const PriorityBadge = styled(Badge)<{ priority: string }>`
  .ant-badge-status-dot {
    width: 10px;
    height: 10px;
  }
`;

// Utility functions
const formatDateTime = (date: Date): string => {
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTypeColor = (type: MessageType): string => {
  switch (type) {
    case MessageType.PROJECT_ASSIGN:
      return "blue";
    case MessageType.COMMENT_ADDED:
      return "orange";
    case MessageType.USER_UPDATE:
      return "cyan";
    default:
      return "default";
  }
};

const getPriorityConfig = (priority?: NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.URGENT:
      return { color: "#ff4d4f", text: "Urgent", icon: "🚨" };
    case NotificationPriority.HIGH:
      return { color: "#fa8c16", text: "High", icon: "⚠️" };
    case NotificationPriority.MEDIUM:
      return { color: "#1890ff", text: "Medium", icon: "ℹ️" };
    case NotificationPriority.LOW:
      return { color: "#52c41a", text: "Low", icon: "✅" };
    default:
      return { color: "#d9d9d9", text: "Unknown", icon: "❓" };
  }
};

const getTypeIcon = (type: MessageType): string => {
  switch (type) {
    case MessageType.PROJECT_UPDATED:
      return "🔄";
    case MessageType.COMMENT_ADDED:
      return "💬";
    case MessageType.USER_UPDATE:
      return "👤";
    default:
      return "📣";
  }
};

const formatTypeName = (type: MessageType): string => {
  switch (type) {
    case MessageType.PROJECT_ASSIGN:
      return "Assign projects";
    case MessageType.COMMENT_ADDED:
      return "Comment";
    case MessageType.USER_UPDATE:
      return "Update users";
    default:
      return "Notifications";
  }
};

const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    NEW: "blue",
    PENDING: "orange",
    PROGRESS: "cyan",
    AT_RISK: "volcano",
    COMPLETED: "green",
    CLOSED: "purple",
  };
  return statusMap[status] || "default";
};

interface NotificationDetailProps {
  notificationId: string | null;
  visible: boolean;
  onClose: () => void;
  displayMode?: "drawer" | "modal";
}

const NotificationDetail: React.FC<NotificationDetailProps> = ({
  notificationId,
  visible,
  onClose,
  displayMode = "drawer",
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationResponse>();
  const [project, setProject] = useState<Project | null>(null);

  // Fetch data by ID
  useEffect(() => {
    const fetchNotification = async () => {
      if (!notificationId) return;
      setLoading(true);
      try {
        const data = await getNotificationById(notificationId);

        setNotification(data);

        if (data.metadata) {
          const { metadata } = data;

          const projectData = await getProjectById(
            metadata.projectId as number
          );

          setProject(projectData);
        } else {
          setProject(null); // (5) Clear project if no metadata
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [notificationId]);

  if (!notification) return null;

  const priorityConfig = getPriorityConfig(notification?.priority);

  const content = (
    <Spin spinning={loading}>
      <DetailContainer>
        <HeaderSection>
          <div style={{ flex: 1 }}>
            <Tag color={getTypeColor(notification.type)}>
              {formatTypeName(notification.type)}
            </Tag>
            <PriorityBadge
              priority={notification.priority}
              status="processing"
              color={priorityConfig.color}
              text={
                <span>
                  {priorityConfig.icon} {priorityConfig.text}
                </span>
              }
            />
            {!notification.read && (
              <Badge status="processing" text="Chưa đọc" />
            )}
          </div>
        </HeaderSection>
        <hr style={{ color: "#EAEFEF" }}></hr>
        <ContentSection>{notification.content}</ContentSection>

        <Divider />

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
              type="link"
              onClick={() => navigate(`/admin/projects/${project.id}`)}
              style={{ padding: "10px" }}
            >
              View Project Details
            </Button>
          </Card>
        )}

        <Divider />

        <ContentSection>
          <Timeline
            items={[
              {
                color: "blue",
                dot: <ClockCircleOutlined />,
                children: (
                  <>
                    <Text strong>Notification created</Text>
                    <br />
                    <Text type="secondary">
                      {formatDateTime(new Date(notification.createdAt))}
                    </Text>
                  </>
                ),
              },
            ]}
          />
        </ContentSection>
      </DetailContainer>
    </Spin>
  );

  if (displayMode === "modal") {
    return (
      <Modal
        title={
          <Space>
            <Text>{getTypeIcon(notification.type)}</Text>
            <Text>Chi tiết thông báo</Text>
          </Space>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        style={{ maxHeight: "90vh" }}
      >
        {content}
      </Modal>
    );
  }

  return (
    <Drawer
      title={
        <Space>
          <Text style={{ fontSize: "20px" }}>
            {getTypeIcon(notification.type)}
          </Text>
          <Text>Details of notifications</Text>
        </Space>
      }
      placement="right"
      closable={false}
      onClose={onClose}
      open={visible}
      width={520}
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
    >
      {content}
    </Drawer>
  );
};

export default NotificationDetail;
