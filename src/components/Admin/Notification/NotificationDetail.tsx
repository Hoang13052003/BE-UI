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
  List,
  Tooltip,
} from "antd";
import {
  CloseOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  NotificationOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { MessageType, NotificationResponse } from "../../../types/Notification";
import { getNotificationById } from "../../../api/apiNotification";
import { Project } from "../../../types/project";
import dayjs from "dayjs";
import { getProjectById } from "../../../api/apiNotification";
import { useAuth } from "../../../contexts/AuthContext";
import { Feedback, getFeedbackById } from "../../../api/feedbackApi";

// Styled components
const { Text } = Typography;

const ContentSection = styled.div`
  margin-bottom: 24px;
`;

const PriorityBadge = styled(Badge)<{ priority: string }>`
  .ant-badge-status-dot {
    width: 10px;
    height: 10px;
  }
`;

import {
  formatDateTime,
  getPriorityConfig,
  getTypeIcon,
  getStatusColor,
} from "../../../utils/notificationUtils";

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
  displayMode,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationResponse>();
  const [project, setProject] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const { userRole } = useAuth();

  const resetData = () => {
    setNotification(undefined);
    setProject(null);
    setFeedback(null);
    setMetadata(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetData();
    onClose();
  };

  // Fetch data by ID
  useEffect(() => {
    fetchNotification();
  }, [notificationId]);
  const fetchNotification = async () => {
    if (!notificationId) return;
    setLoading(true);
    try {
      const notificationData = await getNotificationById(notificationId);
      setNotification(notificationData);

      if (notificationData.metadata) {
        const { metadata } = notificationData;
        setMetadata(metadata);

        // Parallel fetching of project and feedback data
        const fetchTasks = [];
        const projectPromise = metadata.projectId
          ? getProjectById(metadata.projectId as number)
          : null;
        const feedbackPromise = metadata.feedbackId
          ? getFeedbackById(metadata.feedbackId as string)
          : null;

        if (projectPromise) fetchTasks.push(projectPromise);
        if (feedbackPromise) fetchTasks.push(feedbackPromise);

        const results = await Promise.all(fetchTasks);

        // Set data based on what was actually fetched
        if (metadata.projectId) {
          setProject(results[0] as Project);
          if (metadata.feedbackId) {
            setFeedback(results[1] as Feedback);
          }
        } else if (metadata.feedbackId) {
          setFeedback(results[0] as Feedback);
        }
      } else {
        setProject(null);
        setFeedback(null);
      }
    } catch (error) {
      console.error("Error fetching notification data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!notification) return null;

  const priorityConfig = getPriorityConfig(notification?.priority);

  const getFileIconByExtension = (fileName: string): React.ReactNode => {
    const ext = fileName.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "pdf":
        return <FilePdfOutlined style={{ color: "#e74c3c" }} />; // Đỏ
      case "doc":
      case "docx":
        return <FileWordOutlined style={{ color: "#2e86de" }} />; // Xanh dương
      case "xls":
      case "xlsx":
        return <FileExcelOutlined style={{ color: "#27ae60" }} />; // Xanh lá
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return <FileImageOutlined style={{ color: "#f39c12" }} />; // Cam
      case "txt":
      case "md":
        return <FileTextOutlined style={{ color: "#7f8c8d" }} />; // Xám
      case "zip":
      case "rar":
        return <FileZipOutlined style={{ color: "#8e44ad" }} />; // Tím
      default:
        return <FileUnknownOutlined style={{ color: "#95a5a6" }} />; // Xám nhạt (mặc định)
    }
  };

  const content = (
    <Spin spinning={loading}>
      <Divider />

      <ContentSection>
        <Timeline
          items={[
            {
              color: "green",
              dot: <NotificationOutlined />,
              children: (
                <>
                  <Text style={{ fontSize: "16px" }} strong>
                    Notification contents:{" "}
                  </Text>
                  <br />
                  <Text style={{ fontSize: "14px" }}>
                    {notification.content ||
                      "No content available for this notification."}
                  </Text>
                </>
              ),
            },
          ]}
        />
      </ContentSection>

      {userRole === "ADMIN" && (
        <>
          <Divider />
          <ContentSection>
            <Timeline
              items={[
                {
                  color: "green",
                  dot: <FileTextOutlined />,
                  children: (
                    <>
                      <Text style={{ fontSize: "16px" }} strong>
                        Attachment:
                      </Text>
                      <div
                        style={{
                          maxHeight: "calc(100vh - 100px)",
                          overflowY: "auto",
                        }}
                      >
                        {feedback?.attachments?.length === 0 ? (
                          <Text type="secondary">No attachments found.</Text>
                        ) : (
                          <List
                            dataSource={feedback?.attachments}
                            itemLayout="horizontal"
                            renderItem={(item) => (
                              <List.Item
                                style={{ paddingLeft: 0 }}
                                actions={[
                                  <a
                                    key="download"
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Tooltip title="Download or view">
                                      <DownloadOutlined />
                                    </Tooltip>
                                  </a>,
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={getFileIconByExtension(item.fileName)}
                                  title={<Text>{item.fileName}</Text>}
                                  description={
                                    <Text type="secondary">
                                      {dayjs(item.uploadedAt).format(
                                        "YYYY-MM-DD HH:mm"
                                      )}{" "}
                                      • {(item.fileSize / 1024).toFixed(1)} KB
                                    </Text>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        )}
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </ContentSection>
        </>
      )}

      <Divider />

      {project && (
        <Card title="Project Information" style={{ marginTop: 16 }}>
          <Descriptions column={1}>
            <Descriptions.Item label="Project Name">
              {project.name}
            </Descriptions.Item>
            <Descriptions.Item label="Project Status">
              <Tag color={getStatusColor(project.status)}>{project.status}</Tag>
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

          {notification.type !== MessageType.PROJECT_UPDATED ? (
            <Button
              type="primary"
              onClick={() => {
                if (userRole === "ADMIN") {
                  navigate(`/admin/projects/${project.id}/details`);
                } else {
                  navigate(`/client/projects/${project.id}/details`);
                }
              }}
            >
              View Project Details
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => {
                if (userRole === "ADMIN") {
                  navigate(`/admin/project-updates/${metadata.updateId}`);
                } else {
                  navigate(`/client/project-updates/${metadata.updateId}`);
                }
              }}
            >
              View Report Details
            </Button>
          )}
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
    </Spin>
  );

  if (displayMode === "modal") {
    return (
      <Modal
        title={
          <Space>
            <Text>{getTypeIcon(notification.type)}</Text>
            <Text>{notification.title}</Text>
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
          </Space>
        }
        open={visible}
        onCancel={handleClose}
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
          <Text>{notification.title}</Text>
        </Space>
      }
      placement="right"
      closable={false}
      onClose={handleClose}
      open={visible}
      width={700}
      extra={
        <Button type="text" icon={<CloseOutlined />} onClick={handleClose} />
      }
      style={{ overflow: "hidden" }}
      bodyStyle={{ padding: 24, overflow: "auto" }}
    >
      {content}
    </Drawer>
  );
};

export default NotificationDetail;
