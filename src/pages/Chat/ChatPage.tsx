import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Typography, Button, List, Input, Avatar, Badge, Spin, Empty, Modal } from 'antd';
import { PlusOutlined, SendOutlined, PaperClipOutlined, UserOutlined, CheckOutlined, CheckCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateChatRoomModal from './CreateChatRoomModal';
import { ChatMessage } from '../../api/chatApi';
import './ChatPage.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Khai báo interface cho thông tin người dùng đang gõ
interface TypingUserInfo {
  userId: number;
  userName?: string;
}

// Thêm helper function để xác định trạng thái tin nhắn
// Cập nhật hàm getMessageStatus để sử dụng seenCount, deliveredCount, và sentCount
const getMessageStatus = (message: ChatMessage, userDetails: any): { status: 'SENT' | 'DELIVERED' | 'SEEN' | null, text: string } => {
  if (!userDetails || message.senderId !== userDetails.id) {
    return { status: null, text: '' };
  }

  // Ưu tiên sử dụng các trường đếm nếu có
  if (message.seenCount !== undefined && message.deliveredCount !== undefined && message.sentCount !== undefined) {
    // Nếu seenCount > 1, tức là có người khác ngoài người gửi đã xem tin nhắn
    if (message.seenCount > 1) {
      return { status: 'SEEN', text: `Seen by ${message.seenCount - 1} user` };
    }
    
    // Kiểm tra nếu có messageStatus khác là SEEN ngoài messageStatus của người gửi
    const otherUserSeen = Object.entries(message.messageStatus).some(([userId, status]) => {
      return userId !== userDetails.id.toString() && status === 'SEEN';
    });
    
    if (otherUserSeen) {
      return { status: 'SEEN', text: 'Seen' };
    }
    
    // Nếu không ai xem nhưng có người đã nhận được tin nhắn
    if (message.deliveredCount > 0) {
      return { status: 'DELIVERED', text: 'Delivered' };
    }
    
    // Nếu tin nhắn đã được gửi nhưng không ai nhận
    if (message.sentCount > 0) {
      return { status: 'SENT', text: 'Sent' };
    }

    // Trường hợp mặc định
    return { status: 'SENT', text: 'Sent' };
  }

  // Fallback vào cách cũ nếu không có các trường đếm
  // Lọc ra các messageStatus của người khác (không phải người gửi)
  const otherUserStatuses = Object.entries(message.messageStatus)
    .filter(([userId, _]) => userId !== userDetails.id.toString())
    .map(([_, status]) => status);

  if (otherUserStatuses.includes('SEEN')) {
    return { status: 'SEEN', text: 'Seen' };
  }

  if (otherUserStatuses.includes('DELIVERED')) {
    return { status: 'DELIVERED', text: 'Delivered' };
  }

  return { status: 'SENT', text: 'Sent' };
};

// Thêm component hiển thị trạng thái tin nhắn
const MessageStatusIndicator: React.FC<{ status: 'SENT' | 'DELIVERED' | 'SEEN' | null, text: string }> = ({ status, text }) => {
  if (!status) return null;

  return (
    <div className="message-status">
      {status === 'SENT' && (
        <>
          <CheckOutlined className="status-icon" />
          <span className="status-text">{text}</span>
        </>
      )}
      {status === 'DELIVERED' && (
        <>
          <CheckCircleOutlined className="status-icon" />
          <span className="status-text">{text}</span>
        </>
      )}
      {status === 'SEEN' && (
        <>
          <CheckCircleFilled className="status-icon seen" />
          <span className="status-text">{text}</span>
        </>
      )}
    </div>
  );
};

const ChatPage: React.FC = () => {
  const { state, loadChatRooms, selectRoom, sendMessage, markMessagesAsRead, setTyping } = useChat();
  const { userDetails } = useAuth();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gọi loadChatRooms với tham số phân trang mặc định
    loadChatRooms(0, 20, 'createdAt,desc');
  }, [loadChatRooms]);
  
  useEffect(() => {
    // Theo dõi vị trí cuộn để xác định người dùng có đang ở gần cuối không
    const checkIfNearBottom = () => {
      const chatContainer = chatMessagesRef.current;
      if (!chatContainer) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      // Coi người dùng đang ở gần cuối nếu khoảng cách đến cuối < 150px
      const scrollThreshold = 150;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      
      setIsNearBottom(distanceFromBottom < scrollThreshold);
    };
    
    const chatContainer = chatMessagesRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', checkIfNearBottom);
      // Kiểm tra ban đầu
      checkIfNearBottom();
      
      return () => {
        chatContainer.removeEventListener('scroll', checkIfNearBottom);
      };
    }
  }, [state.selectedRoomId]);

  useEffect(() => {
    // Scroll to bottom when messages change or new messages arrive
    if (messagesEndRef.current && isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages, state.selectedRoomId, isNearBottom]);
  
  // Thêm useEffect mới để theo dõi typingUsers và tự động cuộn xuống
  useEffect(() => {
    // Nếu có người đang gõ trong phòng hiện tại và người dùng đang ở gần cuối, cuộn xuống để hiển thị
    if (state.selectedRoomId && 
        state.typingUsers[state.selectedRoomId] && 
        state.typingUsers[state.selectedRoomId].size > 0 &&
        messagesEndRef.current && 
        isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.typingUsers, state.selectedRoomId, isNearBottom]);

  // Thêm useEffect để tự động đánh dấu tin nhắn đã đọc khi nhận tin nhắn mới
  useEffect(() => {
    if (!state.selectedRoomId || !userDetails) return;

    // Lấy danh sách tin nhắn trong phòng chat hiện tại
    const currentRoomMessages = state.messages[state.selectedRoomId] || [];
    
    // Lọc ra các tin nhắn chưa đọc (không phải do mình gửi và chưa được đánh dấu là SEEN)
    const unreadMessages = currentRoomMessages
      .filter(msg => 
        msg.senderId !== userDetails.id && 
        (!msg.messageStatus[userDetails.id] || msg.messageStatus[userDetails.id] !== 'SEEN')
      )
      .map(msg => msg.id);

    // Nếu có tin nhắn chưa đọc và tab đang được hiển thị
    if (unreadMessages.length > 0 && document.visibilityState === 'visible') {
      // Tự động đánh dấu tin nhắn đã đọc
      markMessagesAsRead(state.selectedRoomId, unreadMessages);
    }
  }, [state.messages, state.selectedRoomId, userDetails, markMessagesAsRead]);

  // Thêm useEffect để theo dõi trạng thái hiển thị của tab/cửa sổ
  useEffect(() => {
    // Hàm xử lý khi tab/cửa sổ được hiển thị
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.selectedRoomId && userDetails) {
        // Khi người dùng quay lại tab, đánh dấu tất cả tin nhắn chưa đọc
        const currentRoomMessages = state.messages[state.selectedRoomId] || [];
        const unreadMessages = currentRoomMessages
          .filter(msg => 
            msg.senderId !== userDetails.id && 
            (!msg.messageStatus[userDetails.id] || msg.messageStatus[userDetails.id] !== 'SEEN')
          )
          .map(msg => msg.id);
        
        if (unreadMessages.length > 0) {
          markMessagesAsRead(state.selectedRoomId, unreadMessages);
        }
      }
    };

    // Đăng ký lắng nghe sự kiện visibilitychange
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.selectedRoomId, state.messages, userDetails, markMessagesAsRead]);

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
  
  // Hàm lấy tên người dùng từ ID
  // Cập nhật hàm getUserName để sử dụng senderName từ tin nhắn
  const getUserName = (userId: number, senderName?: string): string => {
    // Ưu tiên sử dụng senderName nếu được cung cấp
    if (senderName) {
      return senderName;
    }
    
    // Ưu tiên sử dụng userName từ typing status nếu có
    let typingUserName: string | undefined;
    
    if (state.selectedRoomId && state.typingUsers[state.selectedRoomId]) {
      state.typingUsers[state.selectedRoomId].forEach((user) => {
        if (user.userId === userId && user.userName) {
          typingUserName = user.userName;
        }
      });
    }
    
    if (typingUserName) {
      return typingUserName;
    }
    
    // Fallback vào user ID
    return `User ${userId}`;
  };

  const renderChatSidebar = () => (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <Title level={5}>Chat Rooms</Title>
        {/* <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="small"
          onClick={handleCreateRoom}
        >
          New
          </Button> */}
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
        
        <div className="chat-messages" ref={chatMessagesRef}>
          {messages.length === 0 ? (
            <Empty 
              description="No messages yet" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            messages.map((message, index) => {
              const isSelf = message.senderId === userDetails?.id;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              
              // Xác định xem có hiển thị thời gian không
              const showTime = !prevMessage || 
                (new Date(message.sentAt).getTime() - new Date(prevMessage.sentAt).getTime() > 10 * 60 * 1000);
              
              // Xác định nếu tin nhắn này là từ cùng người gửi với tin nhắn trước đó
              const isFromSameSender = prevMessage && prevMessage.senderId === message.senderId;
              
              // Xác định nếu tin nhắn này là tin nhắn đầu tiên trong một nhóm
              const isFirstInGroup = !isFromSameSender || showTime;
              
              // Lấy tên người gửi (chỉ khi không phải là tin nhắn của chính mình)
              const senderName = !isSelf ? getUserName(message.senderId, message.senderName) : '';
              
              // Xác định xem đây có phải là tin nhắn cuối cùng của người dùng không
              const isLastMessageFromUser = isSelf && (
                index === messages.length - 1 || 
                messages.slice(index + 1).every(msg => msg.senderId !== userDetails?.id)
              );
              
              // Lấy trạng thái tin nhắn (chỉ cho tin nhắn cuối cùng của chính mình)
              const messageStatus = isLastMessageFromUser 
                ? getMessageStatus(message, userDetails) 
                : { status: null, text: '' };
              
              return (
                <div key={message.id} className="message-group-container">
                  {showTime && (
                    <div className="message-time-separator">
                      <span>{new Date(message.sentAt).toLocaleString([], { 
                        hour: '2-digit',
                        minute: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                        year: '2-digit'
                      })}</span>
                    </div>
                  )}
                  
                  <div 
                    className={`chat-message ${isSelf ? 'self' : ''} ${isFirstInGroup ? 'first-in-group' : ''}`}
                  >
                    {!isSelf && isFirstInGroup && (
                      <Avatar icon={<UserOutlined />} className="chat-message-avatar" />
                    )}
                    {!isSelf && !isFirstInGroup && <div className="chat-message-avatar-placeholder"></div>}
                    
                    <div className="chat-message-content">
                      {!isSelf && isFirstInGroup && (
                        <div className="chat-message-sender">{senderName}</div>
                      )}
                      <div className="chat-message-bubble">
                        {message.content}
                      </div>
                      <div className="chat-message-info">
                        {showTime && (
                          <div className="chat-message-time">
                            {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        {isLastMessageFromUser && (
                          <MessageStatusIndicator status={messageStatus.status} text={messageStatus.text} />
                        )}
                      </div>
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
              // Lấy danh sách người đang gõ
              const typingUsers = Array.from(userIds);
              let typingText = '';
              
              if (typingUsers.length === 1) {
                typingText = `${typingUsers[0].userName || `User ${typingUsers[0].userId}`} typing`;
              } else if (typingUsers.length === 2) {
                typingText = `${typingUsers[0].userName || `User ${typingUsers[0].userId}`} and ${typingUsers[1].userName || `User ${typingUsers[1].userId}`} typing`;
              } else {
                typingText = 'some people are typing';
              }
              
              return (
                <div key="typing" className="chat-message typing-message">
                  <Avatar icon={<UserOutlined />} className="chat-message-avatar" />
                  <div className="chat-message-content">
                    <div className="typing-indicator-bubble">
                      <span className="typing-text">{typingText}</span>
                      <div className="typing-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  </div>
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