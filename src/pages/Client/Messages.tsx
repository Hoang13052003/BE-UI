// src/pages/Client/Messages.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  List,
  Avatar,
  Badge,
  Tag,
  Row,
  Col,
  Dropdown,
  Menu,
  Spin,
  message as antdMessage,
  Modal,
  Select,  Tooltip,
  Empty,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  PaperClipOutlined,
  MoreOutlined,
  SendOutlined,
  InfoCircleOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileOutlined,
  DeleteOutlined,
  EditOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import ChatDebugComponent from "../../components/ChatDebugComponent";
import {
  ChatRoomResponse,
  createGroupChatRoom,
  ChatMessageRequest,
  ChatMessageType,
  ChatRoomType,
} from "../../api/chatApi";



const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

interface ProjectNote {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  author: string;
}

const Messages: React.FC = () => {
  const { userDetails } = useAuth();  const {
    messages,
    chatRooms,    activeChatRoom,
    unreadCount,
    onlineUsers,
    isConnected,
    loading,
    sendChatMessage,
    selectChatRoom,
    markMessageRead,
    refreshChatRooms,
  } = useChat();

  // Local state
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateRoomModalVisible, setIsCreateRoomModalVisible] =
    useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(    []
  );
  const [filteredChatRooms, setFilteredChatRooms] = useState<
    ChatRoomResponse[]
  >([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock project notes (you can replace with real API data)
  const [projectNotes] = useState<ProjectNote[]>([
    {
      id: "1",
      title: "Project Requirements",
      description: "List of key requirements and specifications",
      tags: ["important", "documentation"],
      date: "2024-02-20",
      author: "John Smith",
    },
    {
      id: "2",
      title: "Design Guidelines",
      description: "Brand colors and typography specifications",
      tags: ["design", "reference"],
      date: "2024-02-18",      author: "Sarah Johnson",
    },
  ]);

  // Filter chat rooms based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredChatRooms(chatRooms);
    } else {
      const filtered = chatRooms.filter(
        (room) =>
          room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.participants.some((p) =>
            p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredChatRooms(filtered);
    }
  }, [chatRooms, searchTerm]);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat rooms on component mount
  useEffect(() => {
    refreshChatRooms();
  }, [refreshChatRooms]);

  // Mark messages as read when they become visible
  useEffect(() => {
    if (activeChatRoom && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) => !msg.isRead && msg.senderId !== userDetails?.id
      );
      
      unreadMessages.forEach((msg) => {
        markMessageRead(msg.id);
      });
    }
  }, [messages, activeChatRoom, userDetails?.id, markMessageRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChatRoom) return;
    
    try {
      const messageRequest: ChatMessageRequest = {
        content: messageInput.trim(),
        messageType: ChatMessageType.TEXT,
      };

      // Determine message target based on room type
      if (activeChatRoom.roomType === ChatRoomType.PRIVATE) {
        const otherParticipant = activeChatRoom.participants.find(
          (p) => p.userId !== userDetails?.id
        );
        if (otherParticipant) {
          messageRequest.receiverId = otherParticipant.userId;
        }
      } else if (activeChatRoom.roomType === ChatRoomType.PROJECT_CHAT) {
        messageRequest.projectId = activeChatRoom.projectId;
      } else {
        messageRequest.topic = activeChatRoom.roomName;
      }

      await sendChatMessage(messageRequest);
      setMessageInput("");
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
      antdMessage.error("Gửi tin nhắn thất bại");
    }
  };

  // Handle Enter key for sending message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  // Handle file upload
  const handleFileUpload = async (_file: File) => {
    // if (!activeChatRoom) return;
    // try {
    //   // You can implement file upload logic here
    //   // For now, we'll just show a placeholder
    //   antdMessage.info("File upload functionality will be implemented");
    // } catch (error) {
    //   console.error("Failed to upload file:", error);
    //   antdMessage.error("Failed to upload file");
    // }
  };

  // Handle creating new chat room
  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || selectedParticipants.length === 0) {
      antdMessage.error("Please enter room name and select participants");
      return;
    }    try {
      await createGroupChatRoom({
        roomName: newRoomName,
        participantIds: selectedParticipants,
      });

      setIsCreateRoomModalVisible(false);
      setNewRoomName("");
      setSelectedParticipants([]);
      refreshChatRooms();
      antdMessage.success("Chat room created successfully");
    } catch (error) {
      console.error("Failed to create chat room:", error);
      antdMessage.error("Failed to create chat room");    }
  };

  // Get chat room icon based on type
  const getChatRoomIcon = (room: ChatRoomResponse) => {
    switch (room.roomType) {
      case ChatRoomType.PRIVATE:
        return <UserOutlined />;
      case ChatRoomType.GROUP:
        return <TeamOutlined />;
      case ChatRoomType.PROJECT_CHAT:
        return <ProjectOutlined />;
      default:
        return <UserOutlined />;
    }
  };
  // Get message time display with better formatting
  const getMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return "Vừa xong";
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  // Get participant display name
  const getParticipantNames = (room: ChatRoomResponse) => {
    if (room.roomType === ChatRoomType.PRIVATE) {
      const otherParticipant = room.participants.find(
        (p) => p.userId !== userDetails?.id
      );
      return otherParticipant?.fullName || "Private Chat";
    } else {
      return room.roomName;
    }
  };

  const moreMenu = (
    <Menu
      items={[
        { key: "1", label: "Edit", icon: <EditOutlined /> },
        { key: "2", label: "Delete", icon: <DeleteOutlined /> },
        { key: "3", label: "Archive" },
      ]}
    />
  );
  return (
    <>
      <ChatDebugComponent />
      <Card style={{ padding: 24, minHeight: "100vh" }}>
      <Row gutter={24}>
        {/* Left Sidebar - Chat Rooms */}
        <Col span={6}>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >            <Title level={5} style={{ margin: 0 }}>
              Messages
              {isConnected ? (
                <Tooltip title="Connected">
                  <WifiOutlined style={{ color: "#52c41a", marginLeft: 8 }} />
                </Tooltip>
              ) : (
                <Tooltip title="Disconnected">
                  <DisconnectOutlined
                    style={{ color: "#ff4d4f", marginLeft: 8 }}
                  />
                </Tooltip>
              )}
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateRoomModalVisible(true)}
            >
              New Chat
            </Button>
          </div>

          <Search
            placeholder="Search messages..."
            prefix={<SearchOutlined />}
            style={{ marginBottom: 16 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Unread Count Summary */}
          {unreadCount && unreadCount.totalUnreadCount > 0 && (
            <Card
              size="small"
              style={{ marginBottom: 16, backgroundColor: "#f0f5ff" }}
            >
              <Space>
                <Badge count={unreadCount.totalUnreadCount} />
                <Text>Unread messages</Text>
              </Space>
            </Card>
          )}

          <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={filteredChatRooms}
            renderItem={(room) => (
              <List.Item
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  backgroundColor:
                    activeChatRoom?.id === room.id ? "#e6f7ff" : "transparent",
                  borderRadius: "8px",
                  marginBottom: "4px",
                }}
                onClick={() => selectChatRoom(room.id)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={room.unreadCount > 0}>
                      <Avatar icon={getChatRoomIcon(room)} />
                    </Badge>
                  }
                  title={getParticipantNames(room)}
                  description={
                    <Space direction="vertical" size={4}>
                      <Text type="secondary" ellipsis>
                        {room.lastMessage?.content || "No messages yet"}
                      </Text>
                      <Space size={16}>
                        <Tag color="blue">{room.roomType}</Tag>
                        {room.lastMessageAt && (
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {getMessageTime(room.lastMessageAt)}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  }
                />
                {room.unreadCount > 0 && <Badge count={room.unreadCount} />}
              </List.Item>
            )}
          />
        </Col>

        {/* Chat Area */}
        <Col span={18}>
          {activeChatRoom ? (
            <Card style={{ marginBottom: 24 }}>
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Space>
                  <Title level={5} style={{ margin: 0 }}>
                    {getParticipantNames(activeChatRoom)}
                  </Title>
                  <Text type="secondary">
                    {activeChatRoom.participants.length} members
                  </Text>
                  {activeChatRoom.projectName && (
                    <Tag color="blue">{activeChatRoom.projectName}</Tag>
                  )}
                </Space>
                <Space>
                  <Button type="text" icon={<PaperClipOutlined />} />
                  <Button type="text" icon={<MoreOutlined />} />
                </Space>
              </div>

              <div
                style={{
                  height: 400,
                  overflowY: "auto",
                  marginBottom: 16,
                  padding: "0 8px",
                }}
              >
                {loading ? (
                  <div style={{ textAlign: "center", padding: "50px" }}>
                    <Spin size="large" />
                  </div>
                ) : messages.length === 0 ? (
                  <Empty description="No messages yet" />
                ) : (
                  <>
                    {messages.map((message) => (
                      <div key={message.id} style={{ marginBottom: 24 }}>
                        <Space align="start">                          <Avatar>
                            {message.senderImageProfile ? (
                              <img
                                src={message.senderImageProfile}
                                alt={message.senderName || 'User'}
                              />
                            ) : (
                              (message.senderName && message.senderName[0]) || 'U'
                            )}
                          </Avatar>
                          <div style={{ flex: 1 }}>                            <Space>
                              <Text strong>{message.senderName || 'Unknown User'}</Text>
                              <Text type="secondary">
                                {getMessageTime(message.timestamp)}
                              </Text>
                              {!message.isRead &&
                                message.receiverId === userDetails?.id && (
                                  <Badge status="processing" />
                                )}
                            </Space>
                            {message.content && (
                              <Paragraph
                                style={{ margin: "4px 0", cursor: "pointer" }}
                                onClick={() => markMessageRead(message.id)}
                              >
                                {message.content}
                              </Paragraph>
                            )}
                            {message.fileUrl && (
                              <Card size="small" style={{ width: 200 }}>
                                <Space>
                                  <FileOutlined />
                                  <div>
                                    <div>{message.fileName}</div>
                                    <Text type="secondary">File</Text>
                                  </div>
                                </Space>
                              </Card>
                            )}
                            {message.messageType ===
                              ChatMessageType.SYSTEM_NOTIFICATION && (
                              <Card
                                size="small"
                                style={{
                                  backgroundColor: "#fff7e6",
                                  borderColor: "#ffd591",
                                }}
                              >
                                <Space>
                                  <InfoCircleOutlined
                                    style={{ color: "#fa8c16" }}
                                  />
                                  <Text>{message.content}</Text>
                                </Space>
                              </Card>
                            )}
                          </div>
                        </Space>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>              <div style={{ display: "flex", gap: 8 }}>
                <Input.TextArea
                  placeholder="Nhập tin nhắn..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  style={{ resize: 'none' }}
                />
                <Button
                  type="text"
                  icon={<PaperClipOutlined />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isConnected}
                  title="Đính kèm file"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !isConnected}
                  title="Gửi tin nhắn (Enter)"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>
            </Card>
          ) : (
            <Card
              style={{
                marginBottom: 24,
                textAlign: "center",
                padding: "100px 0",
              }}
            >
              <Empty description="Select a chat room to start messaging" />
            </Card>
          )}

          {/* Project Notes */}
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Project Notes
            </Title>
            <Button type="primary" icon={<PlusOutlined />}>
              New Note
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            {projectNotes.map((note) => (
              <Col span={8} key={note.id}>
                <Card
                  size="small"
                  extra={
                    <Dropdown overlay={moreMenu}>
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  }
                >
                  <Title level={5}>{note.title}</Title>
                  <Paragraph type="secondary">{note.description}</Paragraph>
                  <Space wrap>
                    {note.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                  <div style={{ marginTop: 16 }}>
                    <Space>
                      <Text type="secondary">{note.date}</Text>
                      <Text type="secondary">•</Text>
                      <Text type="secondary">{note.author}</Text>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Create Chat Room Modal */}
      <Modal
        title="Create New Chat Room"
        open={isCreateRoomModalVisible}
        onOk={handleCreateRoom}        onCancel={() => {
          setIsCreateRoomModalVisible(false);
          setNewRoomName("");
          setSelectedParticipants([]);
        }}
        okText="Create"
        cancelText="Cancel"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Text>Room Name</Text>
            <Input
              placeholder="Enter room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />          </div>

          <div>
            <Text>Participants</Text>
            <Select
              mode="multiple"
              placeholder="Select participants"
              style={{ width: "100%" }}
              value={selectedParticipants}
              onChange={setSelectedParticipants}
            >
              {onlineUsers?.onlineUsers.map((user) => (
                <Option key={user.userId} value={parseInt(user.userId)}>
                  {user.fullName}
                </Option>
              ))}
            </Select>          </div>
        </Space>
      </Modal>
    </Card>
    </>
  );
};

export default Messages;
