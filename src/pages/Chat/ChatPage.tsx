import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Typography, Button, List, Input, Avatar, Badge, Spin, Empty, Modal } from 'antd';
import { PlusOutlined, SendOutlined, PaperClipOutlined, UserOutlined } from '@ant-design/icons';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateChatRoomModal from './CreateChatRoomModal';
import './ChatPage.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const ChatPage: React.FC = () => {
  const { state, loadChatRooms, selectRoom, sendMessage, markMessagesAsRead, setTyping } = useChat();
  const { userDetails } = useAuth();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Gọi loadChatRooms với tham số phân trang mặc định
    loadChatRooms(0, 20, 'createdAt,desc');
  }, [loadChatRooms]);

  useEffect(() => {
    // Scroll to bottom when messages change or new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages, state.selectedRoomId]);

  const handleRoomSelect = (roomId: string) => {
    selectRoom(roomId);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && state.selectedRoomId) {
      sendMessage(messageInput.trim());
      setMessageInput('');
      
      // Clear typing indicator
      if (state.selectedRoomId) {
        setTyping(state.selectedRoomId, false);
        setIsTyping(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    // Handle typing indicator
    if (state.selectedRoomId) {
      if (!isTyping) {
        setTyping(state.selectedRoomId, true);
        setIsTyping(true);
      }
      
      // Reset typing timeout
      if (typingTimeout) clearTimeout(typingTimeout);
      
      // Set typing timeout to clear typing indicator after 3 seconds
      const timeout = setTimeout(() => {
        if (state.selectedRoomId) {
          setTyping(state.selectedRoomId, false);
          setIsTyping(false);
        }
      }, 3000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreateRoom = () => {
    setIsCreateModalVisible(true);
  };

  const handleRoomCreated = () => {
    setIsCreateModalVisible(false);
    loadChatRooms();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderChatSidebar = () => (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <Title level={5}>Chat Rooms</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="small"
          onClick={handleCreateRoom}
        >
          New
          </Button>
        </div>
        
      <div className="chat-room-list">
        {state.loading ? (
          <div className="loading-container">
            <Spin size="small" />
          </div>
        ) : state.rooms.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="No chat rooms" 
            style={{ marginTop: 20 }}
          />
        ) : (
          <List
            dataSource={state.rooms}
            renderItem={(room) => {
              const isActive = room.id === state.selectedRoomId;
              // Calculate unread count
              const unreadCount = room.unreadCount || 0;
              
              return (
                <div 
                  className={`chat-room-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleRoomSelect(room.id)}
                >
                  <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                    <Avatar 
                      icon={<UserOutlined />} 
                      className="chat-avatar"
                    />
                  </Badge>
                  <div className="chat-room-info">
                    <div className="chat-room-name">
                      <Text strong>{room.name}</Text>
                      {room.lastMessage && (
                        <Text type="secondary" className="chat-last-time">
                          {new Date(room.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </div>
                    <Text type="secondary" ellipsis className="chat-last-message">
                      {room.lastMessage?.content || 'No messages'}
                    </Text>
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );

  const renderChatMessages = () => {
    if (!state.selectedRoomId) {
      return (
        <div className="chat-empty-state">
          <Empty 
            description="Select a chat or start a new conversation" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </div>
      );
    }

    const selectedRoom = state.rooms.find(room => room.id === state.selectedRoomId);
    const messages = state.messages[state.selectedRoomId] || [];
    
    return (
      <div className="chat-main">
        <div className="chat-header">
          <Title level={5}>{selectedRoom?.name}</Title>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 ? (
            <Empty 
              description="No messages yet" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            messages.map(message => {
              const isSelf = message.senderId === userDetails?.id;
              
              return (
                <div 
                  key={message.id} 
                  className={`chat-message ${isSelf ? 'self' : ''}`}
                >
                  {!isSelf && (
                    <Avatar icon={<UserOutlined />} className="chat-message-avatar" />
                  )}
                  <div className="chat-message-content">
                    <div className="chat-message-bubble">
                      {message.content}
                    </div>
                    <div className="chat-message-time">
                      {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
          
          {/* Typing indicator */}
          {Object.entries(state.typingUsers).map(([roomId, userIds]) => {
            if (roomId === state.selectedRoomId && userIds.size > 0) {
              return (
                <div key="typing" className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              );
            }
            return null;
          })}
        </div>
        
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <TextArea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              className="chat-input"
            />
            <Button 
              type="link" 
              icon={<PaperClipOutlined />} 
              onClick={handleAttachmentClick}
              className="attachment-button"
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="send-button"
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={(e) => {
                // Handle file upload here
                console.log('File selected:', e.target.files);
              }} 
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Content className="chat-page-container">
      <Card 
        bordered={false} 
        className="chat-card"
        bodyStyle={{ padding: 0, height: '100%' }}
      >
        <div className="chat-layout">
          {renderChatSidebar()}
          {renderChatMessages()}
        </div>
      </Card>
      
      <CreateChatRoomModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onCreated={handleRoomCreated}
      />
    </Content>
  );
};

export default ChatPage;