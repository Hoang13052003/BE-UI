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
  InfoCircleOutlined,
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileOutlined,
  WifiOutlined,
  DisconnectOutlined,
  MessageOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
} from "@ant-design/icons";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  ChatRoomResponse,
  createGroupChatRoom,
  ChatMessageRequest,
  ChatMessageType,
  ChatRoomType,
} from "../../api/chatApi";
import { useDebouncedCallback } from "use-debounce"; // Thêm import này
import { useAttachmentUpload } from "../../hooks/useAttachmentUpload";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

import type {
  UploadFile,
  UploadFileStatus,
  RcFile,
} from "antd/es/upload/interface";
// Component hiển thị dấu ba chấm động
const TypingDots: React.FC = () => (
  <span className="typing-dots" style={{ marginLeft: "4px" }}>
    <span>.</span>
    <span>.</span>
    <span>.</span>
    <style>{`
      .typing-dots span {
        animation: blink 1.4s infinite both;
        font-size: 20px; /* Điều chỉnh kích thước nếu cần */
        line-height: 1; /* Căn chỉnh chiều cao */
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
    unreadCount,
    onlineUsers,
    isConnected,
    loading,
    sendChatMessage,
    selectChatRoom,
    markMessageRead,
    refreshChatRooms,
    typingUsers, // Lấy từ context
    sendTypingActivity, // Lấy từ context
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

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { isUploading, uploadFilesIndividually } = useAttachmentUpload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const debouncedSendTyping = useDebouncedCallback(() => {
    if (activeChatRoom && messageInput.trim().length > 0) {
      sendTypingActivity();
    }
  }, 300); // Gửi sự kiện sau 300ms người dùng ngừng gõ hoặc gõ liên tục

  const handleMessageInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const currentMessage = e.target.value;
    setMessageInput(currentMessage);
    if (currentMessage.trim().length > 0) {
      debouncedSendTyping();
    }
  };

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
        (msg) =>
          !msg.isRead &&
          msg.senderId !== userDetails?.id &&
          // Thêm điều kiện kiểm tra message thuộc active room
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

  // Handle sending message
  const handleSendMessage = async () => {
    if ((!messageInput.trim() && fileList.length === 0) || !activeChatRoom)
      return;
    try {
      // 1. Gửi message text (nếu có)
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

      // 2. Gửi từng file (nếu có)
      if (fileList.length > 0) {
        const uploadResult = await uploadFilesIndividually(
          undefined,
          "",
          fileList
        );
        for (const file of uploadResult.successfulUploads) {
          const fileMessage: ChatMessageRequest = {
            senderName: userDetails?.fullName,
            content: "", // hoặc để tên file nếu muốn
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
      antdMessage.error("Gửi tin nhắn thất bại");
    }
  };

  // Handle Enter key for sending message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle creating new chat room
  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || selectedParticipants.length === 0) {
      antdMessage.error("Vui lòng nhập tên phòng và chọn người tham gia");
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
      antdMessage.success("Tạo phòng chat thành công");
    } catch (error) {
      console.error("Failed to create chat room:", error);
      antdMessage.error("Tạo phòng chat thất bại");
    }
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

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `${hours}:${minutes}`;
    }

    const day = date.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
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

    const day = date.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
    const dayStr = day === 0 ? "CN" : day.toString();

    return `${hours}:${minutes} T${dayStr}`;
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

  // Hàm render icon/preview cho file đính kèm
  function renderFileIconPreview(fileName?: string, fileUrl?: string) {
    const ext = (fileName || "").split(".").pop()?.toLowerCase();
    const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    if (ext && imageExts.includes(ext) && fileUrl) {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={fileUrl}
            alt={fileName}
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#fff",
            }}
          />
        </a>
      );
    }
    if (ext === "pdf") {
      return <FilePdfOutlined style={{ fontSize: 32, color: "#e74c3c" }} />;
    }
    if (["doc", "docx"].includes(ext || "")) {
      return <FileWordOutlined style={{ fontSize: 32, color: "#2980b9" }} />;
    }
    if (["xls", "xlsx"].includes(ext || "")) {
      return <FileExcelOutlined style={{ fontSize: 32, color: "#27ae60" }} />;
    }
    if (["ppt", "pptx"].includes(ext || "")) {
      return <FilePptOutlined style={{ fontSize: 32, color: "#e67e22" }} />;
    }
    return <FileOutlined style={{ fontSize: 32 }} />;
  }

  return (
    <>
      {/* <ChatDebugComponent /> */}
      <Card
        style={{
          height: "100%",
          padding: 0,
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        <Row gutter={0}>
          {/* Left Sidebar - Chat Rooms */}
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
                  <Tooltip title="Đã kết nối">
                    <WifiOutlined
                      style={{
                        color: "#52c41a",
                        marginLeft: 8,
                        fontSize: "14px",
                      }}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Mất kết nối">
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
                placeholder="Tìm kiếm tin nhắn..."
                prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                style={{ marginBottom: 16, borderRadius: "20px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="chat-search-input"
              />

              {/* Unread Count Summary */}
              {unreadCount && unreadCount.totalUnreadCount > 0 && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: "8px 12px",
                    backgroundColor: "#E9F3FF",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Badge
                    count={unreadCount.totalUnreadCount}
                    style={{
                      backgroundColor: "#0A7CFF",
                      fontSize: "11px",
                    }}
                  />
                  <Text style={{ fontWeight: 500 }}>Tin nhắn chưa đọc</Text>
                </div>
              )}

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
                    // Check if any participant is online
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
                        onClick={() => selectChatRoom(room.id)}
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
                                    "Chưa có tin nhắn"}
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

          {/* Chat Area */}
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
                styles={{ body: {
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}}
              >
                {/* Header */}
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
                          {activeChatRoom.participants.length} thành viên
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
                </div>{" "}
                {/* Messages area */}{" "}
                <div
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
                  ) : messages.length === 0 ? (
                    <Empty
                      description="Chưa có tin nhắn"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ marginTop: "100px" }}
                    />
                  ) : (
                    <>
                      {messages
                        .filter((message) => {
                          if (!activeChatRoom) return false;

                          switch (activeChatRoom.roomType) {
                            case ChatRoomType.PRIVATE:
                              const otherUserId =
                                activeChatRoom.participants.find(
                                  (p) => p.userId !== userDetails?.id
                                )?.userId;
                              return (
                                (message.senderId === userDetails?.id &&
                                  message.receiverId === otherUserId) ||
                                (message.receiverId === userDetails?.id &&
                                  message.senderId === otherUserId)
                              );
                            case ChatRoomType.PROJECT_CHAT:
                              return (
                                message.projectId === activeChatRoom.projectId
                              );
                            case ChatRoomType.GROUP:
                              return message.topic === activeChatRoom.roomName;
                            default:
                              return false;
                          }
                        })
                        .map((message, index, arr) => {
                          const isMyMessage =
                            message.senderId === userDetails?.id;
                          const previousMessage = arr[index - 1];
                          const nextMessage = arr[index + 1];

                          const isFirstMessageInGroup = !(
                            previousMessage &&
                            previousMessage.senderId === message.senderId &&
                            Math.abs(
                              new Date(message.timestamp).getTime() -
                                new Date(previousMessage.timestamp).getTime()
                            ) <
                              60 * 1000
                          );

                          const isLastMessageInGroup = !(
                            nextMessage &&
                            nextMessage.senderId === message.senderId &&
                            Math.abs(
                              new Date(nextMessage.timestamp).getTime() -
                                new Date(message.timestamp).getTime()
                            ) <
                              60 * 1000
                          );

                          const shouldShowTimeLabel =
                            index === 0 ||
                            new Date(message.timestamp).getTime() -
                              new Date(arr[index - 1].timestamp).getTime() >
                              5 * 60 * 1000;

                          return (
                            <React.Fragment key={message.id}>
                              {shouldShowTimeLabel && (
                                <div
                                  style={{
                                    textAlign: "center",
                                    margin: "16px 0 8px",
                                    color: "#888",
                                    fontSize: "13px",
                                  }}
                                >
                                  {formatTimeLabel(message.timestamp)}
                                </div>
                              )}
                              {!isMyMessage &&
                                isFirstMessageInGroup &&
                                activeChatRoom.roomType !==
                                  ChatRoomType.PRIVATE && (
                                  <div
                                    style={{
                                      textAlign: "left",
                                      paddingLeft: 40,
                                      marginBottom: 2,
                                      marginTop: shouldShowTimeLabel ? 0 : 8,
                                    }}
                                  >
                                    <Text
                                      strong
                                      style={{
                                        fontSize: "13px",
                                        color: "#65676B",
                                      }}
                                    >
                                      {message.senderName}
                                    </Text>
                                  </div>
                                )}{" "}
                              <div
                                style={{
                                  marginBottom: isLastMessageInGroup ? 12 : 2,
                                  display: "flex",
                                  justifyContent: isMyMessage
                                    ? "flex-end"
                                    : "flex-start",
                                  alignItems: "flex-end",
                                  position: "relative",
                                  padding: isMyMessage
                                    ? "0 0 0 40px"
                                    : "0 40px 0 0",
                                }}
                              >
                                {" "}
                                {!isMyMessage && (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      opacity: isLastMessageInGroup ? 1 : 0,
                                    }}
                                  >
                                    <Avatar
                                      src={message.senderImageProfile}
                                      alt={message.senderName || "User"}
                                      style={{
                                        marginRight: 8,
                                        width: 32,
                                        height: 32,
                                      }}
                                    >
                                      {(message.senderName &&
                                        message.senderName[0]) ||
                                        "U"}
                                    </Avatar>
                                  </div>
                                )}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: isMyMessage
                                      ? "flex-end"
                                      : "flex-start",
                                    maxWidth: "65%",
                                  }}
                                >
                                  {" "}
                                  {message.content && (
                                    <Tooltip
                                      title={getMessageTime(message.timestamp)}
                                    >
                                      <Paragraph
                                        style={{
                                          margin: isFirstMessageInGroup
                                            ? "4px 0 0"
                                            : "0 0 4px",
                                          padding: "8px 12px",
                                          borderRadius: isMyMessage
                                            ? isFirstMessageInGroup &&
                                              isLastMessageInGroup
                                              ? "18px 18px 4px 18px"
                                              : isFirstMessageInGroup
                                              ? "18px 18px 4px 18px"
                                              : isLastMessageInGroup
                                              ? "18px 4px 18px 18px"
                                              : "18px 4px 4px 18px"
                                            : isFirstMessageInGroup &&
                                              isLastMessageInGroup
                                            ? "18px 18px 18px 4px"
                                            : isFirstMessageInGroup
                                            ? "18px 18px 4px 4px"
                                            : isLastMessageInGroup
                                            ? "4px 18px 18px 4px"
                                            : "4px 18px 4px 4px",
                                          backgroundColor: isMyMessage
                                            ? "#0A7CFF"
                                            : "#E4E6EB",
                                          color: isMyMessage
                                            ? "#fff"
                                            : "#050505",
                                          wordBreak: "break-word",
                                          boxShadow:
                                            "0 1px 2px rgba(0, 0, 0, 0.05)",
                                          position: "relative",
                                          maxWidth: "100%",
                                        }}
                                      >
                                        {" "}
                                        {message.content}
                                      </Paragraph>
                                    </Tooltip>
                                  )}{" "}
                                  {message.fileUrl &&
                                    message.messageType ===
                                      ChatMessageType.FILE && (
                                      <Card
                                        size="small"
                                        style={{
                                          marginTop: 4,
                                          width: "auto",
                                          maxWidth: 320,
                                          borderRadius: isMyMessage
                                            ? "18px 18px 4px 18px"
                                            : "18px 18px 18px 4px",
                                          backgroundColor: isMyMessage
                                            ? "#0A7CFF"
                                            : "#E4E6EB",
                                          borderColor: isMyMessage
                                            ? "#0A7CFF"
                                            : "#E4E6EB",
                                          position: "relative",
                                          boxShadow:
                                            "0 1px 2px rgba(0, 0, 0, 0.05)",
                                          padding: 8,
                                        }}
                                      >
                                        <Space
                                          align="start"
                                          style={{ width: "100%" }}
                                        >
                                          {/* File preview/icon */}
                                          {renderFileIconPreview(
                                            message.fileName,
                                            message.fileUrl
                                          )}
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <Tooltip
                                              title={message.fileName}
                                              placement="topLeft"
                                            >
                                              <div
                                                style={{
                                                  color: isMyMessage
                                                    ? "#fff"
                                                    : "#050505",
                                                  fontWeight: 500,
                                                  fontSize: 15,
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                  whiteSpace: "nowrap",
                                                  maxWidth: 200,
                                                }}
                                              >
                                                {message.fileName}
                                              </div>
                                            </Tooltip>
                                            <div style={{ marginTop: 2 }}>
                                              <a
                                                href={message.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                  color: isMyMessage
                                                    ? "#fff"
                                                    : "#0A7CFF",
                                                  fontSize: 13,
                                                  fontWeight: 500,
                                                  textDecoration: "underline",
                                                }}
                                              >
                                                Tải xuống
                                              </a>
                                            </div>
                                          </div>
                                        </Space>
                                      </Card>
                                    )}
                                  {message.messageType ===
                                    ChatMessageType.SYSTEM_NOTIFICATION && (
                                    <Card
                                      size="small"
                                      style={{
                                        marginTop: 4,
                                        backgroundColor: "#fff7e6",
                                        borderColor: "#ffd591",
                                        borderRadius: "10px",
                                        position: "relative",
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
                                  {isMyMessage &&
                                    message.isRead &&
                                    isLastMessageInGroup && (
                                      <Avatar
                                        size={16}
                                        alt="Read"
                                        style={{
                                          marginTop: 4,
                                          alignSelf: "flex-end",
                                          border: "2px solid #fff",
                                          boxShadow:
                                            "0 1px 3px rgba(0,0,0,0.1)",
                                        }}
                                      >
                                        {
                                          activeChatRoom.participants.find(
                                            (p) => p.userId !== userDetails?.id
                                          )?.fullName[0]
                                        }
                                      </Avatar>
                                    )}
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}

                      {/* Typing indicator: Hiển thị khi có người khác đang nhập */}
                      {typingUsers &&
                        typingUsers
                          .filter((u) => u.userId !== userDetails?.id)
                          .map((u) => (
                            <div
                              key={u.userId}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                margin: "8px 0 8px 8px",
                                color: "#888",
                                fontSize: 14,
                              }}
                            >
                              <Avatar
                                size={24}
                                style={{ marginRight: 8 }}
                                src={u.userAvatar}
                              >
                                {u.senderName ? u.senderName[0] : "U"}
                              </Avatar>
                              <span>
                                <b>{u.senderName || "User"}</b>
                              </span>
                              <TypingDots />
                            </div>
                          ))}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
                {/* Message input area */}
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
                  {/* Danh sách file đã chọn, hiển thị dưới ô nhập */}
                  {fileList.length > 0 && (
                    <Space
                      style={{
                        width: "100%",
                        marginBottom: 4,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap", // Allow wrapping to next line if needed
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
                      placeholder="Nhập tin nhắn..."
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
                      title="Gửi tin nhắn (Enter)"
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
                  backgroundColor: "#f0f2f5",
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
                  <Title level={3}>Chào mừng đến với Chat</Title>
                  <Text type="secondary" style={{ fontSize: "16px" }}>
                    Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                  </Text>
                </div>
              </div>
            )}
          </Col>
        </Row>

        {/* Create Chat Room Modal */}
        <Modal
          title="Tạo phòng chat mới"
          open={isCreateRoomModalVisible}
          onOk={handleCreateRoom}
          onCancel={() => {
            setIsCreateRoomModalVisible(false);
            setNewRoomName("");
            setSelectedParticipants([]);
          }}
          okText="Tạo"
          cancelText="Hủy"
          okButtonProps={{ style: { backgroundColor: "#0A7CFF" } }}
        >
          <Space
            direction="vertical"
            style={{ width: "100%", marginTop: "20px" }}
          >
            <div>
              <Text strong>Tên phòng</Text>
              <Input
                placeholder="Nhập tên phòng"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                style={{ marginTop: "8px" }}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <Text strong>Người tham gia</Text>
              <Select
                mode="multiple"
                placeholder="Chọn người tham gia"
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
