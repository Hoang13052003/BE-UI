// src/components/layout/Notifications.tsx
import React, { useState, useEffect } from "react";
import {
  Badge,
  Button,
  List,
  Typography,
  Space,
  Tooltip,
  Empty,
  Spin,
  message,
} from "antd";
import {
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNotifications } from "../../contexts/NotificationContext";
import styled from "styled-components";
import { MessageType } from "../../types/Notification";
import NotificationDetail from "../../components/Admin/Notification/NotificationDetail";

const { Text, Title } = Typography;

// Styled Components
interface NotificationItemProps {
  $isRead: boolean;
}

const NotificationItem = styled(List.Item)<NotificationItemProps>`
  padding: 12px 16px;
  margin: 0px 10px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f5f5;
  }

  background-color: ${({ $isRead }) => ($isRead ? "white" : "#f0f7ff")};
`;

const NotificationContainer = styled.div`
  overflow-y: auto;
  height: 100%;
  pading: 10px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  border-radius: 4px;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
`;

// const NotificationFooter = styled.div`
//   display: flex;
//   justify-content: space-between;
//   padding: 8px 16px;
//   border-top: 1px solid #f0f0f0;
// `;

const EmptyContainer = styled.div`
  padding: 24px;
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled(Button)<{ $active: boolean }>`
  border-radius: 16px;
  background-color: ${(props) => (props.$active ? "#1890ff" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "inherit")};

  &:hover {
    background-color: ${(props) => (props.$active ? "#1890ff" : "#f5f5f5")};
    color: ${(props) => (props.$active ? "white" : "inherit")};
  }
`;

// Format date for notifications
const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than a minute
  if (diff < 60 * 1000) {
    return "Just now";
  }

  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  // Format as date
  return date.toLocaleDateString();
};

// Get icon based on notification type
const getNotificationIcon = (type?: MessageType) => {
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

// Get color based on notification priority
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "#ff4d4f";
    case "MEDIUM":
      return "#faad14";
    case "LOW":
      return "#52c41a";
    case "URGENT":
      return "#ff0000";
    default:
      return "#1890ff";
  }
};

const Notifications: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<MessageType | "ALL">(
    "ALL"
  );
  const {
    notifications,
    // unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearAll,
    fetchNotifications,
    deleteNotification,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // Filter notifications based on selected type
  const filteredNotifications = notifications.filter(
    (notification) =>
      currentFilter === "ALL" || notification.type === currentFilter
  );

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    handleViewDetail(id);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
      message.success("Notifications refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    message.success("All notifications marked as read");
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the notification detail
    try {
      await deleteNotification(id);
      message.success("Notification deleted");
    } catch (error) {
      message.error(
        `Failed to delete notification: ${(error as Error).message}`
      );
    }
  };

  const handleViewDetail = (id: string) => {
    setSelectedNotificationId(id);
    setDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedNotificationId(null);
    fetchNotifications();
  };

  // Load notifications when dropdown is opened
  useEffect(() => {
    fetchNotifications();
  }, [open, fetchNotifications]);

  return (
    <React.Fragment>
      <NotificationContainer>
        <NotificationHeader>
          <Title level={5} style={{ margin: 0 }}>
            Notifications
          </Title>
          <Space>
            <Tooltip>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </Button>
            </Tooltip>
            <Tooltip>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={clearAll}
              >
                Clear all
              </Button>
            </Tooltip>
            <Tooltip title="Refresh">
              <Button
                type="text"
                icon={<ReloadOutlined spin={refreshing} />}
                onClick={handleRefresh}
                size="small"
              />
            </Tooltip>
          </Space>
        </NotificationHeader>

        <FilterBar>
          <FilterButton
            size="small"
            $active={currentFilter === "ALL"}
            onClick={() => setCurrentFilter("ALL")}
          >
            All
          </FilterButton>
          <FilterButton
            size="small"
            $active={currentFilter === MessageType.PROJECT_UPDATED}
            onClick={() => setCurrentFilter(MessageType.PROJECT_UPDATED)}
          >
            Projects
          </FilterButton>
          <FilterButton
            size="small"
            $active={currentFilter === MessageType.COMMENT_ADDED}
            onClick={() => setCurrentFilter(MessageType.COMMENT_ADDED)}
          >
            Comments
          </FilterButton>
        </FilterBar>

        {loading ? (
          <LoadingContainer>
            <Spin tip="Loading notifications..." />
          </LoadingContainer>
        ) : filteredNotifications.length > 0 ? (
          <>
            <List
              dataSource={filteredNotifications}
              renderItem={(notification) => (
                <NotificationItem
                  $isRead={notification.read}
                  onClick={() => handleNotificationClick(notification.id)}
                  actions={[
                    <Tooltip title="Delete">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) =>
                          handleDeleteNotification(notification.id, e)
                        }
                      />
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: "relative" }}>
                        <Text style={{ fontSize: "20px" }}>
                          {getNotificationIcon(notification.type)}
                        </Text>
                        {notification.priority !== "MEDIUM" && (
                          <Badge
                            dot
                            style={{
                              position: "absolute",
                              right: -5,
                              top: -3,
                              backgroundColor: getPriorityColor(
                                notification.priority
                              ),
                            }}
                          />
                        )}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong={!notification.read}>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <Badge status="processing" color="#1890ff" />
                        )}
                      </Space>
                    }
                    description={
                      <>
                        <Text type="secondary">{notification.content}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {formatDate(notification.timestamp)}
                        </Text>
                      </>
                    }
                  />
                </NotificationItem>
              )}
            />
          </>
        ) : (
          <EmptyContainer>
            <Empty
              description="No notifications"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </EmptyContainer>
        )}
      </NotificationContainer>
      <NotificationDetail
        notificationId={selectedNotificationId}
        visible={detailVisible}
        onClose={handleCloseDetail}
        displayMode="drawer"
      />
    </React.Fragment>
  );
};

export default Notifications;
