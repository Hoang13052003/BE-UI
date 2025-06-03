import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  Avatar,
  Typography,
  Badge,
  Button,
  Input,
  Space,
  Tooltip,
  Empty,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  MessageOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserConnectionResponse } from '../../api/chatApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import './OnlineUsers.scss';

const { Text, Title } = Typography;

interface OnlineUsersProps {
  visible: boolean;
  onClose: () => void;
  onStartChat?: (userId: number) => void;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({
  visible,
  onClose,
  onStartChat,
}) => {
  const { userDetails } = useAuth();
  const { onlineUsers, refreshOnlineUsers } = useChat();
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserConnectionResponse[]>([]);

  useEffect(() => {
    if (visible) {
      refreshOnlineUsers();
    }
  }, [visible, refreshOnlineUsers]);

  useEffect(() => {
    if (onlineUsers) {
      filterUsers();
    }
  }, [onlineUsers, searchText]);

  const filterUsers = () => {
    if (!onlineUsers) return;

    let filtered = onlineUsers.onlineUsers.filter(
      (user) => parseInt(user.userId) !== userDetails?.id
    );

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter((user) =>
        user.fullName.toLowerCase().includes(search)
      );
    }

    // Sort by connection status (online first) and then by name
    filtered.sort((a, b) => {
      if (a.isConnected && !b.isConnected) return -1;
      if (!a.isConnected && b.isConnected) return 1;
      return a.fullName.localeCompare(b.fullName);
    });

    setFilteredUsers(filtered);
  };

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return 'Chưa xác định';
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  };

  const handleStartChat = (user: UserConnectionResponse) => {
    const userId = parseInt(user.userId);
    if (onStartChat) {
      onStartChat(userId);
    }
    onClose();
  };

  const renderUserItem = (user: UserConnectionResponse) => {
    const isOnline = user.isConnected;
    const lastSeen = formatLastSeen(user.lastConnectedTime);

    return (
      <List.Item
        key={user.userId}
        className="online-user-item"
        actions={[
          <Tooltip title="Bắt đầu trò chuyện">
            <Button
              type="text"
              size="small"
              icon={<MessageOutlined />}
              onClick={() => handleStartChat(user)}
            />
          </Tooltip>,
        ]}
      >
        <List.Item.Meta
          avatar={
            <Badge
              dot
              offset={[-8, 32]}
              color={isOnline ? 'green' : 'gray'}
            >
              <Avatar
                src={user.imageProfile}
                icon={<UserOutlined />}
                size="large"
              >
                {user.fullName.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          }
          title={
            <div className="user-info">
              <Text strong className="user-name">
                {user.fullName}
              </Text>
              <Text
                type={isOnline ? 'success' : 'secondary'}
                className="user-status"
              >
                {isOnline ? 'Đang hoạt động' : `Hoạt động ${lastSeen}`}
              </Text>
            </div>
          }
        />
      </List.Item>
    );
  };

  const onlineCount = filteredUsers.filter(user => user.isConnected).length;
  const totalUsers = filteredUsers.length;

  return (
    <Drawer
      title={
        <div className="online-users-header">
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Người dùng
            </Title>
            <Text type="secondary">
              {onlineCount} đang online / {totalUsers} tổng
            </Text>
          </div>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
          />
        </div>
      }
      placement="right"
      width={360}
      onClose={onClose}
      open={visible}
      bodyStyle={{ padding: 0 }}
      headerStyle={{ padding: '16px 20px', background: '#fafafa' }}
      closable={false}
    >
      <div className="online-users-content">
        {/* Search */}
        <div className="search-section">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm người dùng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        {/* Statistics */}
        <div className="stats-section">
          <Space>
            <Badge status="success" text={`${onlineCount} đang online`} />
            <Badge status="default" text={`${totalUsers - onlineCount} offline`} />
          </Space>
        </div>

        {/* Users List */}
        <div className="users-list">
          {filteredUsers.length > 0 ? (
            <List
              dataSource={filteredUsers}
              renderItem={renderUserItem}
              split={false}
              className="online-users-list"
            />
          ) : (
            <Empty
              description="Không tìm thấy người dùng nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default OnlineUsers;
