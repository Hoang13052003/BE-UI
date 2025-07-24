import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Card, Typography, Button, List, Input, Avatar, Badge, Spin, Empty, message } from 'antd';
import { SendOutlined, PaperClipOutlined, UserOutlined, CheckOutlined, CheckCircleOutlined, CheckCircleFilled, UpOutlined } from '@ant-design/icons';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateChatRoomModal from './CreateChatRoomModal';
import { ChatMessage } from '../../api/chatApi';
import './ChatPage.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;


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
  const { state, loadChatRooms, selectRoom, sendMessage, markMessagesAsRead, setTyping, loadMoreMessages } = useChat();
  const { userDetails } = useAuth();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const getHasMore = useCallback((roomId: string) => {
    if (!roomId) return false;
    const pagination = state.messagesPagination[roomId];
    return pagination ? pagination.hasMore : true;
  }, [state.messagesPagination]);
  
  const handleLoadMoreMessages = useCallback(async () => {
    if (!state.selectedRoomId || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const currentPagination = state.messagesPagination[state.selectedRoomId] || { page: 0, hasMore: true };
      const nextPage = currentPagination.page + 1;
      
      const hasMore = await loadMoreMessages(state.selectedRoomId, nextPage, 30);
      
      if (!hasMore) {
        message.info('No more messages');
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
      message.error('Failed to load more messages:');
      setIsLoadingMore(false);
    }
  }, [state.selectedRoomId, state.messagesPagination, isLoadingMore, loadMoreMessages]);

  useEffect(() => {
    loadChatRooms(0, 20, 'createdAt,desc');
  }, [loadChatRooms]);
  
  useEffect(() => {
    if (state.selectedRoomId) {
      setIsLoadingMore(false);
    }
  }, [state.selectedRoomId, state.selectedRoomId ? state.messages[state.selectedRoomId] : undefined]);
  
  useEffect(() => {
    if (state.selectedRoomId && 
        state.typingUsers[state.selectedRoomId] && 
        state.typingUsers[state.selectedRoomId].size > 0) {
    }
  }, [state.typingUsers, state.selectedRoomId]);

  useEffect(() => {
    if (!state.selectedRoomId || !userDetails) return;

    const currentRoomMessages = state.messages[state.selectedRoomId] || [];
    
    const unreadMessages = currentRoomMessages
      .filter(msg => 
        msg.senderId !== userDetails.id && 
        (!msg.messageStatus[userDetails.id] || msg.messageStatus[userDetails.id] !== 'SEEN')
      )
      .map(msg => msg.id);

    if (unreadMessages.length > 0 && document.visibilityState === 'visible') {
      markMessagesAsRead(state.selectedRoomId, unreadMessages);
    }
  }, [state.messages, state.selectedRoomId, userDetails, markMessagesAsRead]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.selectedRoomId && userDetails) {
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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
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
    // fileInputRef.current?.click(); // Xóa file input logic
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

  // Hoàn toàn tạo lại phương thức renderChatMessages
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
    const hasMore = getHasMore(state.selectedRoomId);
    
    return (
      <div className="chat-main">
        <div className="chat-header">
          <Title level={5}>{selectedRoom?.name}</Title>
        </div>
        
        <div className="chat-messages">
          {/* Hiển thị chỉ báo đang gõ */}
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

          {/* Danh sách tin nhắn */}
          {messages.map((message, index) => {
              const isSelf = message.senderId === userDetails?.id;
            const prevMessage = index < messages.length - 1 ? messages[index + 1] : null;
            const showTime = !prevMessage || (new Date(message.sentAt).getTime() - new Date(prevMessage.sentAt).getTime() > 10 * 60 * 1000);
              const isFromSameSender = prevMessage && prevMessage.senderId === message.senderId;
              const isFirstInGroup = !isFromSameSender || showTime;
              const isLastMessageFromUser = isSelf && (
              index === 0 ||
              messages.slice(0, index).every(msg => msg.senderId !== userDetails?.id)
              );
            const senderName = !isSelf ? getUserName(message.senderId, message.senderName) : '';
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
                  
                <div className={`chat-message ${isSelf ? 'self' : ''} ${isFirstInGroup ? 'first-in-group' : ''}`}>
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
          })}
          
          {/* Nút tải thêm tin nhắn cũ (nếu có) */}
          {hasMore && (
            <div className="load-more-container">
              <Button
                className="load-more-button"
                size="small"
                icon={<UpOutlined />}
                onClick={handleLoadMoreMessages}
                loading={isLoadingMore}
              >
                Load more messages
              </Button>
            </div>
          )}
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
            {/* <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={(e) => {
                // Handle file upload here
                console.log('File selected:', e.target.files);
              }} 
            /> */}
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