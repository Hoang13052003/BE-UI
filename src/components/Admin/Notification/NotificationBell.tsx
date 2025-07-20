// src/components/layout/NotificationBell.tsx
import React, { useState, useEffect } from "react";
import {
  Badge,
  Dropdown,
  Button,
  List,
  Typography,
  Space,
  Tooltip,
  Empty,
  Spin,
  Divider,
} from "antd";
import { showNotification, showError } from "../../../utils/notificationUtils";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  FundViewOutlined,
  ReloadOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNotifications } from "../../../contexts/NotificationContext";
import styled from "styled-components";
import { MessageType } from "../../../types/Notification";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const { Text, Title } = Typography;

// Styled Components
interface NotificationItemProps {
  $isRead: boolean;
}

const NotificationItem = styled(List.Item)<NotificationItemProps>`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f5f5f5;
  }

  background-color: ${({ $isRead }) => ($isRead ? "white" : "#f0f7ff")};
`;

const NotificationContainer = styled.div`
  max-height: 450px;
  overflow-y: auto;
  width: 380px;
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

const NotificationFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
`;

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

const QuickLinks = styled.div`
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
`;

const QuickLinkButton = styled(Button)`
  width: 100%;
  text-align: left;
  margin-bottom: 8px;
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

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<MessageType | "ALL">(
    "ALL"
  );
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    // clearAll,
    fetchNotifications,
    deleteNotification,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const navigator = useNavigate();
  const { userRole } = useAuth();

  // Filter notifications based on selected type
  const filteredNotifications = notifications.filter(
    (notification) =>
      currentFilter === "ALL" || notification.type === currentFilter
  );

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
      showNotification.success("NOTIFICATIONS_REFRESHED");
    } catch (error) {
      showError(error, "NOTIFICATIONS_REFRESH_FAILED");
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    showNotification.success("ALL_MARKED_AS_READ");
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the notification detail
    try {
      await deleteNotification(id);
      showNotification.success("NOTIFICATION_DELETED");
    } catch (error) {
      showError(error, "NOTIFICATION_DELETE_FAILED");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, open]);

  const content = (
    <div>
      <NotificationContainer>
        <NotificationHeader>
          <Title level={5} style={{ margin: 0 }}>
            Notifications
          </Title>
          <Space>
            <Badge count={unreadCount} />
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
          <FilterButton
            size="small"
            $active={currentFilter === MessageType.USER_UPDATE}
            onClick={() => setCurrentFilter(MessageType.USER_UPDATE)}
          >
            Users
          </FilterButton>
        </FilterBar>

        {loading ? (
          <LoadingContainer>
            <Spin />
          </LoadingContainer>
        ) : filteredNotifications.length === 0 ? (
          <EmptyContainer>
            <Empty
              description="No notifications"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </EmptyContainer>
        ) : (
          <List
            dataSource={filteredNotifications}
            renderItem={(notification) => (
              <NotificationItem
                $isRead={notification.read}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        fontSize: "20px",
                        width: "24px",
                        textAlign: "center",
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text strong={!notification.read}>
                        {notification.title}
                      </Text>
                      <Tooltip title="Delete">
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) =>
                            handleDeleteNotification(notification.id, e)
                          }
                        />
                      </Tooltip>
                    </div>
                  }
                  description={
                    <>
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        {formatDate(new Date(notification.createdAt))}
                      </Text>
                      <div>
                        {notification.message}
                        {notification.link && (
                          <Button
                            type="link"
                            size="small"
                            icon={<FundViewOutlined />}
                            style={{ padding: "0", height: "auto" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator(notification.link || "");
                            }}
                          >
                            View details
                          </Button>
                        )}
                      </div>
                    </>
                  }
                />
              </NotificationItem>
            )}
          />
        )}

        <NotificationFooter>
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </NotificationFooter>

        <QuickLinks>
          <Divider style={{ margin: '8px 0' }} orientation="left">Quick Access</Divider>
          <QuickLinkButton 
            type="text" 
            icon={<MessageOutlined />}
            onClick={() => {
              setOpen(false);
              const basePath = userRole === 'ADMIN' 
                ? '/admin/chat' 
                : userRole === 'MANAGER' 
                  ? '/manager/chat' 
                  : '/client/chat';
              navigator(basePath);
            }}
          >
            Chat Messages
          </QuickLinkButton>
        </QuickLinks>
      </NotificationContainer>
    </div>
  );

  return (
    <Dropdown
      menu={{ items: [{ key: '1', label: content }] }}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={{ pointAtCenter: true }}
    >
      <Badge count={unreadCount} overflowCount={99}>
        <Tooltip title="Notifications">
          <Button
            style={{ height: 40, width: 40, border: "none", outline: "none" }}
          >
            <BellOutlined style={{ fontSize: "20px" }} />
          </Button>
        </Tooltip>
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
