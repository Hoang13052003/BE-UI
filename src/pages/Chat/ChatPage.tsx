import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Card, Typography, Button, List, Input, Avatar, Badge, Spin, Empty, message } from 'antd';
import { SendOutlined, PaperClipOutlined, UserOutlined, CheckOutlined, CheckCircleOutlined, CheckCircleFilled, UpOutlined, DeleteOutlined } from '@ant-design/icons';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateChatRoomModal from './CreateChatRoomModal';
import { ChatMessage, MessageReaction, MessageReactionResponse } from '../../api/chatApi';
import chatApi from '../../api/chatApi';
import EmojiReaction from '../../components/EmojiReaction';
import './ChatPage.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const getMessageStatus = (message: ChatMessage, userDetails: any): { status: 'SENT' | 'DELIVERED' | 'SEEN' | null, text: string } => {
  if (!userDetails || message.senderId !== userDetails.id) {
    return { status: null, text: '' };
  }

  if (message.seenCount !== undefined && message.deliveredCount !== undefined && message.sentCount !== undefined) {
    if (message.seenCount > 1) {
      return { status: 'SEEN', text: `Seen by ${message.seenCount - 1} user` };
    }
    
    const otherUserSeen = Object.entries(message.messageStatus).some(([userId, status]) => {
      return userId !== userDetails.id.toString() && status === 'SEEN';
    });
    
    if (otherUserSeen) {
      return { status: 'SEEN', text: 'Seen' };
    }
    
    if (message.deliveredCount > 0) {
      return { status: 'DELIVERED', text: 'Delivered' };
    }
    
    if (message.sentCount > 0) {
      return { status: 'SENT', text: 'Sent' };
    }

    return { status: 'SENT', text: 'Sent' };
  }

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
  // State for attachment file and upload status
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentFile(e.target.files[0]);
    }
  };

  // Remove selected file
  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Open file dialog
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  // Upload file and return attachmentId (using chatApi)
  const uploadAttachment = async (file: File): Promise<string | null> => {
    try {
      setAttachmentUploading(true);
      // Use chatApi to upload attachment
      const response = await chatApi.uploadChatAttachment(file);
      console.log('Upload response:', response.data); // Log for debugging
      setAttachmentUploading(false);
      return response.data.id; // Get id from response
    } catch (error) {
      console.error('File upload error:', error);
      setAttachmentUploading(false);
      message.error('File upload failed');
      return null;
    }
  };

  // Send message logic (with optional attachment)
  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !attachmentFile) || !state.selectedRoomId) return;
    let attachmentId: string | null = null;
    if (attachmentFile) {
      attachmentId = await uploadAttachment(attachmentFile);
      // If upload failed, do not send message
      if (!attachmentId) {
        message.error('Không thể gửi file đính kèm');
        return;
      }
    }
    // Only pass attachmentIds if valid id exists
    const attachmentIds = attachmentId ? [attachmentId] : undefined;
    sendMessage(messageInput.trim(), attachmentIds);
    setMessageInput('');
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (state.selectedRoomId) {
      setTyping(state.selectedRoomId, false);
      setIsTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    if (state.selectedRoomId) {
      if (!isTyping) {
        setTyping(state.selectedRoomId, true);
        setIsTyping(true);
      }
      
      if (typingTimeout) clearTimeout(typingTimeout);
      
      const timeout = setTimeout(() => {
        if (state.selectedRoomId) {
          setTyping(state.selectedRoomId, false);
          setIsTyping(false);
        }
      }, 3000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const getUserName = (userId: number, senderName?: string): string => {
    if (senderName) {
      return senderName;
    }
    
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
              const unreadCount = room.unreadCount || 0;
              const lastMessage = room.lastMessage;
              let lastMessageContent = 'No messages';
              if (lastMessage) {
                if (lastMessage.senderId !== userDetails?.id) {
                  lastMessageContent = `${lastMessage.senderName || 'Unknown'}: ${lastMessage.content}`;
                } else {
                  lastMessageContent = lastMessage.content;
                }
              }
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
                      {lastMessage && (
                        <Text type="secondary" className="chat-last-time">
                          {new Date(lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </div>
                    <Text type="secondary" ellipsis className="chat-last-message">
                      {lastMessageContent}
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
    const hasMore = getHasMore(state.selectedRoomId);
    
    return (
      <div className="chat-main">
        <div className="chat-header">
          <Title level={5}>{selectedRoom?.name}</Title>
        </div>
        
        <div className="chat-messages">
          {Object.entries(state.typingUsers).map(([roomId, userIds]) => {
            if (roomId === state.selectedRoomId && userIds.size > 0) {
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
                        {/* Show attachment if exists */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="chat-attachments">
                            {message.attachments.map((att: any) => (
                              <div key={att.id} className="chat-attachment-item">
                                <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                  {/* Show icon by file type, fallback to paperclip */}
                                  <PaperClipOutlined style={{ marginRight: 4 }} />
                                  <span className="attachment-name">{att.fileName}</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
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
                    
                    {/* Emoji Reactions */}
                    <EmojiReaction
                      messageId={message.id}
                      reactions={message.reactions || {
                        messageId: message.id,
                        reactionCounts: {},
                        currentUserReactions: [],
                        reactionUsers: {}
                      }}
                    />
                  </div>
                </div>
              );
          })}
          
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
              disabled={attachmentUploading}
            />
            <Button 
              type="link" 
              icon={<PaperClipOutlined />} 
              onClick={handleAttachmentClick}
              className="attachment-button"
              disabled={attachmentUploading}
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
              disabled={attachmentUploading}
              accept="*"
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleSendMessage}
              disabled={(!messageInput.trim() && !attachmentFile) || attachmentUploading}
              className="send-button"
              loading={attachmentUploading}
            />
          </div>
          {renderAttachmentPreview()}
        </div>
      </div>
    );
  };

  // UI for file attachment preview
  const renderAttachmentPreview = () => (
    attachmentFile ? (
      <div className="attachment-preview">
        <span className="attachment-file-name">{attachmentFile.name}</span>
        <Button 
          size="small" 
          onClick={handleRemoveAttachment} 
          danger 
          style={{ marginLeft: 8 }}
          icon={<DeleteOutlined />}
        />
      </div>
    ) : null
  );

  // Ensure handleRoomCreated is defined for CreateChatRoomModal
  const handleRoomCreated = () => {
    setIsCreateModalVisible(false);
    loadChatRooms();
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