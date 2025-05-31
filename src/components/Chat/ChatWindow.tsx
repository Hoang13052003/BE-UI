import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Input,
  Button,
  Avatar,
  Typography,
  Badge,
  Upload,
  Modal,
  Tooltip,
  Space,
  Divider,
  Empty,
  Spin,
  message as antdMessage,
} from 'antd';
import {
  SendOutlined,
  PaperClipOutlined,
  SmileOutlined,
  FileOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  MoreOutlined,
  CheckOutlined,
  DoubleRightOutlined,
} from '@ant-design/icons';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessageType, ChatMessageRequest } from '../../api/chatApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import './ChatWindow.scss';

const { Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

interface ChatWindowProps {
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ className }) => {
  const { userDetails } = useAuth();
  const {
    messages,
    activeChatRoom,
    sendChatMessage,
    markMessageRead,
    isConnected,
    loading,
  } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto focus input when chat room changes
  useEffect(() => {
    if (activeChatRoom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChatRoom]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const unreadMessages = messages.filter(
      (msg) => !msg.isRead && msg.senderId !== userDetails?.id
    );
    
    unreadMessages.forEach((msg) => {
      markMessageRead(msg.id);
    });
  }, [messages, userDetails?.id, markMessageRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChatRoom) return;

    const messageRequest: ChatMessageRequest = {
      content: messageInput.trim(),
      messageType: ChatMessageType.TEXT,
    };

    // Add recipient based on chat room type
    if (activeChatRoom.roomType === 'PRIVATE') {
      const recipient = activeChatRoom.participants.find(
        (p) => p.userId !== userDetails?.id
      );
      if (recipient) {
        messageRequest.receiverId = recipient.userId;
      }
    } else if (activeChatRoom.roomType === 'PROJECT_CHAT') {
      messageRequest.projectId = activeChatRoom.projectId;
    } else if (activeChatRoom.roomType === 'GROUP') {
      messageRequest.topic = activeChatRoom.roomName;
    }

    try {
      await sendChatMessage(messageRequest);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      antdMessage.error('Gửi tin nhắn thất bại');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  };

  const renderMessageContent = (message: any) => {
    switch (message.messageType) {
      case ChatMessageType.FILE:
        return (
          <div className="file-message">
            <FileOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
              {message.fileName || 'Tải file'}
            </a>
          </div>
        );
      case ChatMessageType.IMAGE:
        return (
          <div className="image-message">
            <img
              src={message.fileUrl}
              alt={message.fileName}
              style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
            />
            {message.content && <div className="image-caption">{message.content}</div>}
          </div>
        );
      case ChatMessageType.VIDEO:
        return (
          <div className="video-message">
            <video  
              src={message.fileUrl}
              controls
              style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px' }}
            />
            {message.content && <div className="video-caption">{message.content}</div>}
          </div>
        );
      default:
        return <div className="text-message">{message.content}</div>;
    }
  };  const renderMessage = (message: any, index: number) => {
    const isOwnMessage = Number(message.senderId) === Number(userDetails?.id);
    console.log('Message check:', {
      messageSenderId: message.senderId,
      userDetailsId: userDetails?.id,
      isOwnMessage,
      senderName: message.senderName
    });
    const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;

    return (
      <div
        key={message.id}
        className={`message ${isOwnMessage ? 'message-own' : 'message-other'}`}
      >
        {showAvatar && !isOwnMessage && (
          <Avatar
            size="small"
            src={message.senderImageProfile}
            className="message-avatar"
          >
            {message.senderName?.charAt(0)?.toUpperCase()}
          </Avatar>
        )}
        
        <div className="message-content">
          {showAvatar && (
            <Text className={`message-sender ${isOwnMessage ? 'own-sender' : ''}`}>
              {isOwnMessage ? (userDetails?.fullName || 'You') : message.senderName}
            </Text>
          )}
          
          <div className="message-bubble">
            {renderMessageContent(message)}
            
            <div className="message-meta">
              <Text className="message-time">
                {formatMessageTime(message.timestamp)}
              </Text>
              
              {isOwnMessage && (
                <span className="message-status">
                  {message.isRead ? (
                    <DoubleRightOutlined style={{ color: '#1890ff' }} />
                  ) : message.isDelivered ? (
                    <CheckOutlined />
                  ) : (
                    <span>...</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!activeChatRoom) {
    return (
      <div className="chat-window-empty">
        <Empty
          description="Chọn một cuộc trò chuyện để bắt đầu"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <Layout className={`chat-window ${className}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <Avatar
            src={activeChatRoom.participants[0]?.imageProfile}
            size="large"
          >
            {activeChatRoom.roomName?.charAt(0)?.toUpperCase()}
          </Avatar>
          
          <div className="chat-header-text">
            <Text strong>{activeChatRoom.roomName}</Text>
            <Text type="secondary" className="chat-header-status">
              {isConnected ? (
                <Badge status="success" text="Đang kết nối" />
              ) : (
                <Badge status="error" text="Mất kết nối" />
              )}
            </Text>
          </div>
        </div>

        <Space>
          <Tooltip title="Thêm tùy chọn">
            <Button type="text" icon={<MoreOutlined />} />
          </Tooltip>
        </Space>
      </div>

      <Divider style={{ margin: 0 }} />

      {/* Messages Area */}
      <Content className="chat-messages">
        {loading ? (
          <div className="chat-loading">
            <Spin size="large" />
          </div>
        ) : messages.length > 0 ? (
          <div className="messages-list">
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <Empty
            description="Chưa có tin nhắn nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Content>

      <Divider style={{ margin: 0 }} />

      {/* Message Input */}
      <div className="chat-input">
        <Space.Compact style={{ width: '100%' }}>
          <Tooltip title="Đính kém file">
            <Button
              icon={<PaperClipOutlined />}
              onClick={() => setUploadModalVisible(true)}
            />
          </Tooltip>
          
          <TextArea
            ref={inputRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={!isConnected}
          />
          
          <Tooltip title="Emoji">
            <Button icon={<SmileOutlined />} />
          </Tooltip>
          
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !isConnected}
          />
        </Space.Compact>
      </div>

      {/* Upload Modal */}
      <Modal
        title="Đính kém file"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <div className="upload-options">
          <Upload.Dragger
            name="file"
            multiple={false}
            action="/api/upload"
            headers={{
              authorization: `Bearer ${localStorage.getItem('token')}`,
            }}
            onChange={(info) => {
              if (info.file.status === 'done') {
                // Handle successful upload
                antdMessage.success(`${info.file.name} tải lên thành công`);
                setUploadModalVisible(false);
              } else if (info.file.status === 'error') {
                antdMessage.error(`${info.file.name} tải lên thất bại`);
              }
            }}
          >
            <p className="ant-upload-drag-icon">
              <FileOutlined />
            </p>
            <p className="ant-upload-text">
              Kéo thả file vào đây hoặc click để chọn
            </p>
            <p className="ant-upload-hint">
              Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF
            </p>
          </Upload.Dragger>

          <Divider>hoặc</Divider>

          <Space direction="vertical" style={{ width: '100%' }}>            <Button
              block
              icon={<PictureOutlined />}
              onClick={() => {
                // Handle image upload
              }}
            >
              Chọn hình ảnh
            </Button>
            
            <Button
              block
              icon={<VideoCameraOutlined />}
              onClick={() => {
                // Handle video upload
              }}
            >
              Chọn video
            </Button>
            
            <Button
              block
              icon={<AudioOutlined />}
              onClick={() => {
                // Handle audio upload
              }}
            >
              Chọn âm thanh
            </Button>
          </Space>
        </div>
      </Modal>
    </Layout>
  );
};

export default ChatWindow;
