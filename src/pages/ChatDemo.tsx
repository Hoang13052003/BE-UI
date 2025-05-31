import React, { useState } from 'react';
import { Layout, Card, Button, Space, Typography, Divider, Alert } from 'antd';
import { MessageOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import ChatInterface from '../components/Chat/ChatInterface';
import OnlineUsers from '../components/Chat/OnlineUsers';
import { useChat } from '../contexts/ChatContext';
import './ChatDemo.scss';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const ChatDemo: React.FC = () => {
  const [onlineUsersVisible, setOnlineUsersVisible] = useState(false);
  const [chatEmbedded, setChatEmbedded] = useState(false);
  const { isConnected, unreadCount } = useChat();

  const handleStartChat = (userId: number) => {
    console.log('Starting chat with user:', userId);
    // Logic to create private chat or select existing chat room
  };

  return (
    <Layout className="chat-demo-page">
      <Content style={{ padding: '24px' }}>
        <div className="chat-demo-header">
          <Title level={2}>
            <MessageOutlined style={{ marginRight: '12px' }} />
            Chat System Demo
          </Title>
          
          <Paragraph>
            Hệ thống chat real-time với WebSocket hỗ trợ tin nhắn riêng tư, 
            chat nhóm và chat dự án.
          </Paragraph>

          <Alert
            message={`Trạng thái kết nối: ${isConnected ? 'Đã kết nối' : 'Chưa kết nối'}`}
            type={isConnected ? 'success' : 'warning'}
            showIcon
            style={{ marginBottom: '16px' }}
          />
        </div>

        <Divider />

        <div className="chat-demo-controls">
          <Space wrap>
            <Button
              type="primary"
              icon={<UserOutlined />}
              onClick={() => setOnlineUsersVisible(true)}
            >
              Xem người dùng online
              {unreadCount && unreadCount.totalUnreadCount > 0 && (
                ` (${unreadCount.totalUnreadCount})`
              )}
            </Button>

            <Button
              icon={<TeamOutlined />}
              onClick={() => setChatEmbedded(!chatEmbedded)}
            >
              {chatEmbedded ? 'Mở rộng' : 'Thu gọn'} Chat
            </Button>
          </Space>
        </div>

        <Divider />

        <div className="chat-demo-content">
          {chatEmbedded ? (
            <Card className="embedded-chat-card">
              <ChatInterface
                embedded
                height="500px"
                className="demo-chat"
              />
            </Card>
          ) : (
            <div className="fullscreen-chat">
              <ChatInterface
                height="calc(100vh - 200px)"
                className="demo-chat"
              />
            </div>
          )}
        </div>

        {/* Features Info */}
        <Divider />
        
        <div className="features-info">
          <Title level={3}>Tính năng</Title>
          
          <div className="feature-grid">
            <Card size="small" title="💬 Tin nhắn riêng tư">
              <Paragraph type="secondary">
                Chat 1-1 với người dùng khác trong hệ thống
              </Paragraph>
            </Card>
            
            <Card size="small" title="👥 Chat nhóm">
              <Paragraph type="secondary">
                Tạo và tham gia các nhóm chat theo chủ đề
              </Paragraph>
            </Card>
            
            <Card size="small" title="🏗️ Chat dự án">
              <Paragraph type="secondary">
                Thảo luận trong team dự án cụ thể
              </Paragraph>
            </Card>
            
            <Card size="small" title="📎 Chia sẻ file">
              <Paragraph type="secondary">
                Gửi và nhận file, hình ảnh, video
              </Paragraph>
            </Card>
            
            <Card size="small" title="🔔 Thông báo">
              <Paragraph type="secondary">
                Nhận thông báo tin nhắn mới real-time
              </Paragraph>
            </Card>
            
            <Card size="small" title="📱 Responsive">
              <Paragraph type="secondary">
                Tương thích mọi thiết bị và kích thước màn hình
              </Paragraph>
            </Card>
          </div>
        </div>

        {/* WebSocket Commands Info */}
        <Divider />
        
        <div className="commands-info">
          <Title level={3}>WebSocket Commands</Title>
          
          <Card>
            <Paragraph>
              <strong>Các lệnh WebSocket được hỗ trợ:</strong>
            </Paragraph>
            
            <ul>
              <li><code>subscribe:topic_name</code> - Subscribe vào group chat</li>
              <li><code>unsubscribe:topic_name</code> - Unsubscribe khỏi group chat</li>
              <li><code>join_project:project_id</code> - Tham gia chat dự án</li>
              <li><code>leave_project:project_id</code> - Rời khỏi chat dự án</li>
              <li><code>read:message_id</code> - Đánh dấu tin nhắn đã đọc</li>
            </ul>
            
            <Paragraph type="secondary">
              WebSocket endpoint: <code>ws://localhost:8080/ws/chat?token=YOUR_JWT_TOKEN</code>
            </Paragraph>
          </Card>
        </div>

        {/* Online Users Drawer */}
        <OnlineUsers
          visible={onlineUsersVisible}
          onClose={() => setOnlineUsersVisible(false)}
          onStartChat={handleStartChat}
        />
      </Content>
    </Layout>
  );
};

export default ChatDemo;
