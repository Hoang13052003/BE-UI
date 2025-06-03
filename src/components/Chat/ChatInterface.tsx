import React, { useState, useEffect } from 'react';
import { Layout, Button, Drawer, Badge } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import { useChat } from '../../contexts/ChatContext';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import './ChatInterface.scss';

interface ChatInterfaceProps {
  className?: string;
  embedded?: boolean; // For embedding in other pages
  height?: string | number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className,
  embedded = false,
  height = '100vh',
}) => {
  const { unreadCount, isConnected } = useChat();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  if (embedded && isMobile && chatMinimized) {
    // Floating chat button for mobile
    return (
      <div className="chat-floating-button">
        <Badge
          count={unreadCount?.totalUnreadCount || 0}
          offset={[-8, 8]}
        >
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={() => setChatMinimized(false)}
            className={isConnected ? 'connected' : 'disconnected'}
          />
        </Badge>
      </div>
    );
  }

  const renderChatContent = () => (
    <Layout
      className={`chat-interface ${className} ${embedded ? 'embedded' : ''} ${
        isMobile ? 'mobile' : ''
      }`}
      style={{ height }}
    >
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <ChatSidebar
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />
          <Layout className="chat-main">
            <ChatWindow />
          </Layout>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          {/* Mobile Header */}
          <div className="mobile-chat-header">
            <Button
              type="text"
              icon={<MessageOutlined />}
              onClick={() => setMobileDrawerVisible(true)}
            >
              Chats
              {unreadCount && unreadCount.totalUnreadCount > 0 && (
                <Badge
                  count={unreadCount.totalUnreadCount}
                  style={{ marginLeft: 8 }}
                />
              )}
            </Button>

            {embedded && (
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setChatMinimized(true)}
              />
            )}
          </div>

          {/* Mobile Chat Window */}
          <Layout className="chat-main">
            <ChatWindow />
          </Layout>

          {/* Mobile Sidebar Drawer */}
          <Drawer
            title="Cuộc trò chuyện"
            placement="left"
            width={320}
            onClose={() => setMobileDrawerVisible(false)}
            open={mobileDrawerVisible}
            bodyStyle={{ padding: 0 }}
            headerStyle={{ background: '#fafafa' }}
          >
            <ChatSidebar collapsed={false} />
          </Drawer>
        </>
      )}
    </Layout>
  );

  if (embedded) {
    return (
      <div className="chat-embedded-container">
        {renderChatContent()}
      </div>
    );
  }

  return renderChatContent();
};

export default ChatInterface;
