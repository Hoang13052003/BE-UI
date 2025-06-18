import React, { useState, useEffect } from "react";
import {
  Layout,
  List,
  Avatar,
  Badge,
  Input,
  Button,
  Modal,
  Select,
  Typography,
  Divider,
  Space,
  Tooltip,
  Empty,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  ProjectOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { ChatRoomType, ChatRoomResponse } from "../../api/chatApi";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import "./ChatSidebar.scss";

const { Sider } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

interface ChatSidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  collapsed = false,
  className,
}) => {
  const { userDetails } = useAuth();
  const {
    chatRooms,
    activeChatRoom,
    unreadCount,
    onlineUsers,
    selectChatRoom,
    refreshChatRooms,
    refreshOnlineUsers,
  } = useChat();

  const [searchText, setSearchText] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState<ChatRoomResponse[]>([]);
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("ALL");

  useEffect(() => {
    refreshChatRooms();
    refreshOnlineUsers();
  }, [refreshChatRooms, refreshOnlineUsers]);

  useEffect(() => {
    filterRooms();
  }, [chatRooms, searchText, roomTypeFilter]);

  const filterRooms = () => {
    let filtered = chatRooms;

    // Filter by room type
    if (roomTypeFilter !== "ALL") {
      filtered = filtered.filter((room) => room.roomType === roomTypeFilter);
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.roomName.toLowerCase().includes(search) ||
          room.participants.some((p) =>
            p.fullName.toLowerCase().includes(search)
          )
      );
    }

    setFilteredRooms(filtered);
  };

  const getRoomDisplayName = (room: ChatRoomResponse) => {
    if (room.roomType === ChatRoomType.PRIVATE) {
      const otherUser = room.participants.find(
        (p) => p.userId !== userDetails?.id
      );
      return otherUser?.fullName || "Unknown User";
    }
    return room.roomName;
  };

  const getRoomAvatar = (room: ChatRoomResponse) => {
    if (room.roomType === ChatRoomType.PRIVATE) {
      const otherUser = room.participants.find(
        (p) => p.userId !== userDetails?.id
      );
      return otherUser?.imageProfile;
    }
    return null;
  };

  const getRoomIcon = (roomType: ChatRoomType) => {
    switch (roomType) {
      case ChatRoomType.PRIVATE:
        return <UserOutlined />;
      case ChatRoomType.GROUP:
        return <TeamOutlined />;
      case ChatRoomType.PROJECT_CHAT:
        return <ProjectOutlined />;
      default:
        return <MessageOutlined />;
    }
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return "";
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  };

  const getUnreadCountForRoom = (room: ChatRoomResponse) => {
    return room.unreadCount || 0;
  };

  const isUserOnline = (userId: number) => {
    return onlineUsers?.onlineUsers.some(
      (user) => parseInt(user.userId) === userId && user.isConnected
    );
  };

  const renderRoomItem = (room: ChatRoomResponse) => {
    const displayName = getRoomDisplayName(room);
    const avatarSrc = getRoomAvatar(room);
    const unreadCount = getUnreadCountForRoom(room);
    const isActive = activeChatRoom?.id === room.id;
    const lastMessageTime = formatLastMessageTime(room.lastMessageAt);

    // Check if other user is online (for private chats)
    const isOnline =
      room.roomType === ChatRoomType.PRIVATE
        ? room.participants.some(
            (p) => p.userId !== userDetails?.id && isUserOnline(p.userId)
          )
        : false;

    return (
      <List.Item
        key={room.id}
        className={`chat-room-item ${isActive ? "active" : ""}`}
        onClick={() => selectChatRoom(room.id)}
      >
        <div className="room-avatar">
          <Badge dot={isOnline} offset={[-8, 32]} color="green">
            <Avatar
              src={avatarSrc}
              icon={getRoomIcon(room.roomType)}
              size="large"
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        </div>

        <div className="room-content">
          <div className="room-header">
            <Text strong className="room-name" ellipsis>
              {displayName}
            </Text>
            {lastMessageTime && (
              <Text type="secondary" className="room-time">
                {lastMessageTime}
              </Text>
            )}
          </div>

          <div className="room-footer">
            <div className="room-last-message">
              {room.lastMessage ? (
                <Text type="secondary" ellipsis>
                  {room.lastMessage.senderName}: {room.lastMessage.content}
                </Text>
              ) : (
                <Text type="secondary" italic>
                  Chưa có tin nhắn
                </Text>
              )}
            </div>

            {unreadCount > 0 && <Badge count={unreadCount} size="small" />}
          </div>
        </div>
      </List.Item>
    );
  };

  if (collapsed) {
    return (
      <Sider
        collapsed
        width={280}
        collapsedWidth={64}
        className={`chat-sidebar collapsed ${className}`}
      >
        <div className="sidebar-header-collapsed">
          <Tooltip title="Chat">
            <MessageOutlined style={{ fontSize: "20px" }} />
          </Tooltip>
          {unreadCount && unreadCount.totalUnreadCount > 0 && (
            <Badge
              count={unreadCount.totalUnreadCount}
              size="small"
              style={{ position: "absolute", top: -5, right: -5 }}
            />
          )}
        </div>

        <Divider style={{ margin: "8px 0" }} />

        <div className="collapsed-room-list">
          {filteredRooms.slice(0, 3).map((room) => (
            <Tooltip
              key={room.id}
              title={getRoomDisplayName(room)}
              placement="right"
            >
              <div
                className={`collapsed-room-item ${
                  activeChatRoom?.id === room.id ? "active" : ""
                }`}
                onClick={() => selectChatRoom(room.id)}
              >
                <Avatar
                  src={getRoomAvatar(room)}
                  icon={getRoomIcon(room.roomType)}
                  size="small"
                >
                  {getRoomDisplayName(room).charAt(0).toUpperCase()}
                </Avatar>
                {getUnreadCountForRoom(room) > 0 && (
                  <Badge
                    count={getUnreadCountForRoom(room)}
                    size="small"
                    style={{ position: "absolute", top: -5, right: -5 }}
                  />
                )}
              </div>
            </Tooltip>
          ))}
        </div>
      </Sider>
    );
  }

  return (
    <Sider width={320} className={`chat-sidebar ${className}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <Title level={4} style={{ margin: 0 }}>
            Tin nhắn
          </Title>
          {unreadCount && unreadCount.totalUnreadCount > 0 && (
            <Badge count={unreadCount.totalUnreadCount} />
          )}
        </div>

        <Tooltip title="Create new chat">
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          />
        </Tooltip>
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Search and Filter */}
      <div className="sidebar-controls">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search conversations..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Select
          value={roomTypeFilter}
          onChange={setRoomTypeFilter}
          style={{ width: "100%", marginTop: "8px" }}
          size="small"
        >
          <Option value="ALL">All</Option>
          <Option value={ChatRoomType.PRIVATE}>
            <UserOutlined /> Private
          </Option>
          <Option value={ChatRoomType.GROUP}>
            <TeamOutlined /> Group
          </Option>
          <Option value={ChatRoomType.PROJECT_CHAT}>
            <ProjectOutlined /> Project
          </Option>
        </Select>
      </div>

      {/* Chat Rooms List */}
      <div className="sidebar-content">
        {filteredRooms.length > 0 ? (
          <List
            className="chat-rooms-list"
            dataSource={filteredRooms}
            renderItem={renderRoomItem}
            split={false}
          />
        ) : (
          <Empty
            description="No conversations"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>

      {/* Create Chat Modal */}
      <Modal
        title="Create New Chat"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={480}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Button
            block
            size="large"
            icon={<UserOutlined />}
            onClick={() => {
              // Handle create private chat
              setCreateModalVisible(false);
            }}
          >
            Chat private
          </Button>

          <Button
            block
            size="large"
            icon={<TeamOutlined />}
            onClick={() => {
              // Handle create group chat
              setCreateModalVisible(false);
            }}
          >
            Create group chat
          </Button>

          <Button
            block
            size="large"
            icon={<ProjectOutlined />}
            onClick={() => {
              // Handle join project chat
              setCreateModalVisible(false);
            }}
          >
            Join project chat
          </Button>
        </Space>
      </Modal>
    </Sider>
  );
};

export default ChatSidebar;
