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
  Spin,
  message as antdMessage,
  Modal,
  Select,
  Tooltip,
  Empty,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  PaperClipOutlined,
  MoreOutlined,
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileOutlined,
  WifiOutlined,
  DisconnectOutlined,
  MessageOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useChat } from "../../../contexts/ChatContext";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ChatRoomResponse,
  createGroupChatRoom,
  ChatMessageRequest,
  ChatMessageType,
  ChatRoomType,
} from "../../../api/chatApi";
import { useDebouncedCallback } from "use-debounce";
import { useAttachmentUpload } from "../../../hooks/useAttachmentUpload";
import MessageList from "./components/MessageList";
import TypingIndicator from "./components/TypingIndicator";

const { Title, Text } = Typography;
const { Search } = Input;

import type {
  UploadFile,
  UploadFileStatus,
  RcFile,
} from "antd/es/upload/interface";
const TypingDots: React.FC = () => (
  <span className="typing-dots" style={{ marginLeft: "4px" }}>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <style>{`
      .typing-dots span {
        animation: blink 1.4s infinite both;
        font-size: 20px;
        line-height: 1;
      }
      .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }
      .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes blink {
        0% { opacity: 0.2; }
        20% { opacity: 1; }
        100% { opacity: 0.2; }
      }
    `}</style>
  </span>
);

const Messages: React.FC = () => {
  const { userDetails } = useAuth();
  const {
    messages,
    chatRooms,
    activeChatRoom,
    onlineUsers,
    isConnected,
    loading,
    sendChatMessage,
    selectChatRoom,
    markMessageRead,
    refreshChatRooms,
    typingUsers,
    sendTypingActivity,
    loadChatHistory,
  } = useChat();
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateRoomModalVisible, setIsCreateRoomModalVisible] =
    useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>(
    []
  );
  const [filteredChatRooms, setFilteredChatRooms] = useState<
    ChatRoomResponse[]
  >([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesAreaRef = useRef<HTMLDivElement | null>(null);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { isUploading, uploadFilesIndividually } = useAttachmentUpload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const debouncedSendTyping = useDebouncedCallback(() => {
    if (activeChatRoom && messageInput.trim().length > 0) {
      sendTypingActivity();
    }
  }, 300);

  const handleMessageInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const currentMessage = e.target.value;
    setMessageInput(currentMessage);
    if (currentMessage.trim().length > 0) {
      debouncedSendTyping();
    }
  };

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

  useEffect(() => {
    if (messagesAreaRef.current && visibleMessages.length > 0) {
      const area = messagesAreaRef.current;
      area.scrollTop = area.scrollHeight;
    }
  }, [activeChatRoom]);

  useEffect(() => {
    refreshChatRooms();
  }, [refreshChatRooms]);

  useEffect(() => {
    if (activeChatRoom && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) =>
          !msg.isRead &&
          msg.senderId !== userDetails?.id &&
          (msg.receiverId === userDetails?.id ||
            msg.topic === activeChatRoom.roomName ||
            msg.projectId === activeChatRoom.projectId)
      );
      unreadMessages.forEach((msg) => {
        markMessageRead(msg.id);
      });
    }
  }, [messages, activeChatRoom, userDetails?.id, markMessageRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && fileList.length === 0) || !activeChatRoom)
      return;
    try {
      if (messageInput.trim()) {
        const messageRequest: ChatMessageRequest = {
          senderName: userDetails?.fullName,
          content: messageInput.trim(),
          messageType: ChatMessageType.TEXT,
        };
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
      }

      if (fileList.length > 0) {
        const uploadResult = await uploadFilesIndividually(
          undefined,
          "",
          fileList
        );
        for (const file of uploadResult.successfulUploads) {
          const fileMessage: ChatMessageRequest = {
            senderName: userDetails?.fullName,
            content: "",
            messageType: ChatMessageType.FILE,
            fileUrl: file.storagePath,
            fileName: file.fileName,
          };
          if (activeChatRoom.roomType === ChatRoomType.PRIVATE) {
            const otherParticipant = activeChatRoom.participants.find(
              (p) => p.userId !== userDetails?.id
            );
            if (otherParticipant) {
              fileMessage.receiverId = otherParticipant.userId;
            }
          } else if (activeChatRoom.roomType === ChatRoomType.PROJECT_CHAT) {
            fileMessage.projectId = activeChatRoom.projectId;
          } else {
            fileMessage.topic = activeChatRoom.roomName;
          }
          await sendChatMessage(fileMessage);
        }
      }

      setMessageInput("");
      setFileList([]);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
      antdMessage.error("Sending message failed");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || selectedParticipants.length === 0) {
      antdMessage.error("Please enter a room name and select participants");
      return;
    }
    try {
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
      antdMessage.error("Failed to create chat room");
    }
  };

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
  const getMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `${hours}:${minutes}`;
    }

    const day = date.getDay();
    const dayStr = day === 0 ? "CN" : `T${day}`;

    return `${hours}:${minutes} ${dayStr}`;
  };

  const formatTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Today ${hours}:${minutes}`;
    }

    const day = date.getDay();
    const dayStr = day === 0 ? "CN" : day.toString();

    return `${hours}:${minutes} T${dayStr}`;
  };

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

  const [visibleMessages, setVisibleMessages] = useState<any[]>([]);

  const filteredMessages = messages.filter((message) => {
    if (!activeChatRoom) return false;
    switch (activeChatRoom.roomType) {
      case ChatRoomType.PRIVATE:
        const otherUserId = activeChatRoom.participants.find(
          (p) => p.userId !== userDetails?.id
        )?.userId;
        return (
          (message.senderId === userDetails?.id &&
            message.receiverId === otherUserId) ||
          (message.receiverId === userDetails?.id &&
            message.senderId === otherUserId)
        );
      case ChatRoomType.PROJECT_CHAT:
        return message.projectId === activeChatRoom.projectId;
      case ChatRoomType.GROUP:
        return message.topic === activeChatRoom.roomName;
      default:
        return false;
    }
  });

  useEffect(() => {
    setVisibleMessages(filteredMessages);
  }, [activeChatRoom, messages]);

  const [currentPage, setCurrentPage] = useState(0);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const previousScrollHeight = useRef(0);
  const prevMessagesLength = useRef(0);

  const scrollToPreservedPosition = () => {
    const chatArea = messagesAreaRef.current;
    if (!chatArea) return;
    const scrollDiff = chatArea.scrollHeight - previousScrollHeight.current;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        chatArea.scrollTop = scrollDiff;
      });
    });
  };

  useEffect(() => {
    if (!isFetchingHistory || currentPage === 0) return;
    scrollToPreservedPosition();
    const chatArea = messagesAreaRef.current;
    if (chatArea) {
      previousScrollHeight.current = chatArea.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isFetchingHistory) return;
    if (
      currentPage === 0 &&
      visibleMessages.length > prevMessagesLength.current
    ) {
      scrollToBottom();
    }
    prevMessagesLength.current = visibleMessages.length;
  }, [visibleMessages, isFetchingHistory, currentPage]);

  const handleSelectChatRoom = (roomId: string) => {
    setCurrentPage(0);
    selectChatRoom(roomId, 0, 15);
  };

  useEffect(() => {
    const chatArea = messagesAreaRef.current;
    if (!chatArea) return;

    const handleScroll = async () => {
      if (
        chatArea.scrollTop === 0 &&
        !isFetchingHistory &&
        activeChatRoom &&
        visibleMessages.length > 0
      ) {
        previousScrollHeight.current = chatArea.scrollHeight;
        setIsFetchingHistory(true);
        const nextPage = currentPage + 1;
        await loadChatHistory(activeChatRoom.id, nextPage);
        setCurrentPage(nextPage);
        setIsFetchingHistory(false);
      }
    };

    chatArea.addEventListener("scroll", handleScroll);
    return () => chatArea.removeEventListener("scroll", handleScroll);
  }, [
    activeChatRoom,
    currentPage,
    isFetchingHistory,
    visibleMessages.length,
    loadChatHistory,
  ]);

  return (
    <>
      <Card
        style={{
          height: "100%",
          padding: 0,
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        <Row gutter={0}>
          <Col
            span={6}
            style={{
              borderRight: "1px solid #e8e8e8",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px",
                borderBottom: "1px solid #e8e8e8",
                background: "#f9f9f9",
              }}
            >
              <Title level={4} style={{ margin: 0, fontWeight: "bold" }}>
                Chat
                {isConnected ? (
                  <Tooltip title="Connected">
                    <WifiOutlined
                      style={{
                        color: "#52c41a",
                        marginLeft: 8,
                        fontSize: "14px",
                      }}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Disconnected">
                    <DisconnectOutlined
                      style={{
                        color: "#ff4d4f",
                        marginLeft: 8,
                        fontSize: "14px",
                      }}
                    />
                  </Tooltip>
                )}
              </Title>
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateRoomModalVisible(true)}
                style={{ backgroundColor: "#0A7CFF" }}
              />
            </div>

            <div style={{ padding: "10px 15px" }}>
              <Search
                placeholder="Search messages..."
                prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                style={{ marginBottom: 16, borderRadius: "20px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="chat-search-input"
              />

              <div
                style={{
                  height: "calc(100vh - 130px)",
                  overflowY: "auto",
                  padding: "0 5px",
                }}
              >
                <List
                  loading={loading}
                  itemLayout="horizontal"
                  dataSource={filteredChatRooms}
                  renderItem={(room) => {
                    const isActive = activeChatRoom?.id === room.id;
                    const hasOnlineParticipant = room.participants.some((p) =>
                      onlineUsers?.onlineUsers.some(
                        (u) => u.userId === p.userId.toString()
                      )
                    );

                    return (
                      <List.Item
                        style={{
                          padding: "12px",
                          cursor: "pointer",
                          backgroundColor: isActive ? "#E9F3FF" : "transparent",
                          borderRadius: "10px",
                          marginBottom: "4px",
                          transition: "all 0.2s ease",
                          position: "relative",
                        }}
                        onClick={() => handleSelectChatRoom(room.id)}
                        className="chat-room-item"
                      >
                        <List.Item.Meta
                          avatar={
                            <div style={{ position: "relative" }}>
                              <Avatar
                                size={50}
                                icon={getChatRoomIcon(room)}
                                style={{
                                  backgroundColor: isActive
                                    ? "#0A7CFF"
                                    : "#f0f2f5",
                                  color: isActive ? "#fff" : "#65676B",
                                }}
                              />
                              {hasOnlineParticipant && (
                                <Badge
                                  dot
                                  color="#31A24C"
                                  style={{
                                    position: "absolute",
                                    right: "2px",
                                    bottom: "2px",
                                    height: "14px",
                                    width: "14px",
                                    border: "2px solid white",
                                  }}
                                />
                              )}
                            </div>
                          }
                          title={
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "4px",
                              }}
                            >
                              <Text
                                strong={room.unreadCount > 0}
                                style={{
                                  color:
                                    room.unreadCount > 0
                                      ? "#050505"
                                      : "#65676B",
                                  fontSize: "15px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: "120px",
                                }}
                              >
                                {getParticipantNames(room)}
                              </Text>
                              {room.lastMessageAt && (
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: "12px",
                                    fontWeight:
                                      room.unreadCount > 0 ? "bold" : "normal",
                                    color:
                                      room.unreadCount > 0
                                        ? "#050505"
                                        : "#8a8d91",
                                  }}
                                >
                                  {getMessageTime(room.lastMessageAt)}
                                </Text>
                              )}
                            </div>
                          }
                          description={
                            <div style={{ width: "100%" }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  type={
                                    room.unreadCount > 0
                                      ? undefined
                                      : "secondary"
                                  }
                                  ellipsis
                                  style={{
                                    fontSize: "14px",
                                    fontWeight:
                                      room.unreadCount > 0 ? "bold" : "normal",
                                    maxWidth: "180px",
                                    color:
                                      room.unreadCount > 0
                                        ? "#050505"
                                        : "#8a8d91",
                                  }}
                                >
                                  {room.lastMessage?.content ||
                                    "No messages yet"}
                                </Text>
                                {room.unreadCount > 0 && (
                                  <Badge
                                    count={room.unreadCount}
                                    style={{
                                      backgroundColor: "#0A7CFF",
                                      fontSize: "11px",
                                      minWidth: "20px",
                                      height: "20px",
                                      borderRadius: "10px",
                                      fontWeight: "bold",
                                      padding: "0 6px",
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </div>
            </div>
          </Col>

          <Col span={18}>
            {activeChatRoom ? (
              <Card
                style={{
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  padding: 0,
                  borderRadius: 0,
                  border: "none",
                }}
                styles={{
                  body: {
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  },
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 20px",
                    borderBottom: "1px solid #e8e8e8",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Space align="center">
                    <Avatar
                      size={40}
                      icon={getChatRoomIcon(activeChatRoom)}
                      style={{ backgroundColor: "#0A7CFF", color: "#fff" }}
                    />
                    <div>
                      <Title
                        level={5}
                        style={{ margin: 0, fontWeight: "bold" }}
                      >
                        {getParticipantNames(activeChatRoom)}
                      </Title>
                      <div>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          {activeChatRoom.participants.length} members
                          {activeChatRoom.roomType !== ChatRoomType.PRIVATE &&
                            " • "}
                          {activeChatRoom.projectName && (
                            <Tag color="blue" style={{ marginLeft: 4 }}>
                              {activeChatRoom.projectName}
                            </Tag>
                          )}
                        </Text>
                      </div>
                    </div>
                  </Space>
                  <Space>
                    <Button type="text" icon={<PaperClipOutlined />} />
                    <Button type="text" icon={<MoreOutlined />} />
                  </Space>
                </div>
                <div
                  ref={messagesAreaRef}
                  style={{
                    flexGrow: 1,
                    overflowY: "auto",
                    padding: "10px 16px",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                  }}
                >
                  {loading ? (
                    <div style={{ textAlign: "center", padding: "50px" }}>
                      <Spin size="large" />
                    </div>
                  ) : visibleMessages.length === 0 ? (
                    <Empty
                      description="No messages yet"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ marginTop: "100px" }}
                    />
                  ) : (
                    <>
                      <MessageList
                        messages={visibleMessages}
                        userDetails={userDetails}
                        activeChatRoom={activeChatRoom}
                        getMessageTime={getMessageTime}
                        formatTimeLabel={formatTimeLabel}
                      />
                      <TypingIndicator
                        typingUsers={typingUsers || []}
                        currentUserId={userDetails?.id ?? ""}
                        TypingDots={TypingDots}
                      />
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "12px 16px",
                    borderTop: "1px solid #e8e8e8",
                    backgroundColor: "#fff",
                    flexDirection: "column",
                  }}
                >
                  {fileList.length > 0 && (
                    <Space
                      style={{
                        width: "100%",
                        marginBottom: 4,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {fileList.map((file, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            background: "#f5f5f5",
                            borderRadius: 6,
                            padding: "4px 10px",
                            maxWidth: 220,
                          }}
                        >
                          <FileOutlined
                            style={{ marginRight: 6, color: "#0A7CFF" }}
                          />
                          <Text ellipsis style={{ maxWidth: 200 }}>
                            {file.name.length > 20
                              ? `${file.name.slice(0, 20)}...`
                              : file.name}
                          </Text>
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              const newFileList = fileList.filter(
                                (_, i) => i !== index
                              );
                              setFileList(newFileList);
                            }}
                            style={{ marginLeft: 8 }}
                          />
                        </div>
                      ))}
                    </Space>
                  )}
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
                  >
                    <Button
                      type="text"
                      shape="circle"
                      icon={<PaperClipOutlined style={{ fontSize: 22 }} />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || !isConnected}
                      title="Attach file"
                      style={{
                        color: fileList.length > 0 ? "#0A7CFF" : undefined,
                      }}
                    />
                    <Input.TextArea
                      placeholder="Enter message..."
                      value={messageInput}
                      onChange={handleMessageInputChange}
                      onKeyPress={handleKeyPress}
                      disabled={!isConnected || isUploading}
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      style={{
                        resize: "none",
                        borderRadius: "20px",
                        padding: "10px 12px",
                        fontSize: "15px",
                        lineHeight: "1.3",
                      }}
                    />
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={
                        (!messageInput.trim() && fileList.length === 0) ||
                        !isConnected ||
                        isUploading
                      }
                      title="Send message"
                      style={{ backgroundColor: "#0A7CFF" }}
                      loading={isUploading}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files).map(
                            (file) => {
                              const rcFile = file as RcFile;
                              rcFile.uid = `${Date.now()}-${file.name}`;
                              return {
                                uid: rcFile.uid,
                                name: rcFile.name,
                                status: "done" as UploadFileStatus,
                                originFileObj: rcFile,
                              } as UploadFile;
                            }
                          );
                          setFileList((prev) => [...prev, ...files]);
                          e.target.value = ""; // reset input
                        }
                      }}
                      disabled={isUploading}
                    />
                  </div>
                </div>
              </Card>
            ) : (
              <div
                style={{
                  height: "100vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  padding: "40px",
                  backgroundColor: "f0f2f5",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    maxWidth: "400px",
                    backgroundColor: "#fff",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Avatar
                    size={64}
                    icon={<MessageOutlined />}
                    style={{
                      backgroundColor: "#0A7CFF",
                      marginBottom: "20px",
                    }}
                  />
                  <Title level={3}>Welcome to Chat</Title>
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    Select a chat room to start messaging.
                  </Text>
                </div>
              </div>
            )}
          </Col>
        </Row>

        <Modal
          title="Create New Chat Room"
          open={isCreateRoomModalVisible}
          onOk={handleCreateRoom}
          onCancel={() => {
            setIsCreateRoomModalVisible(false);
            setNewRoomName("");
            setSelectedParticipants([]);
          }}
          okText="Create"
          cancelText="Cancel"
          okButtonProps={{ style: { backgroundColor: "#0A7CFF" } }}
        >
          <Space
            direction="vertical"
            style={{ width: "100%", marginTop: "20px" }}
          >
            <div>
              <Text strong>Room Name</Text>
              <Input
                placeholder="Enter room name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                style={{ marginTop: "8px" }}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text strong>Participants</Text>
              <Select
                mode="multiple"
                placeholder="Select participants"
                style={{ width: "100%", marginTop: "8px" }}
                value={selectedParticipants}
                onChange={setSelectedParticipants}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {onlineUsers?.onlineUsers.map((user) => (
                  <Select.Option
                    key={user.userId}
                    value={parseInt(user.userId)}
                  >
                    {user.fullName}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Space>
        </Modal>
      </Card>
    </>
  );
};

export default Messages;
