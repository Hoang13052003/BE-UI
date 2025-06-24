import React from "react";
import { Card, Space, Tooltip, Typography, Avatar } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import FilePreview from "./FilePreview";
import { ChatMessageType } from "../../../../api/chatApi";

const { Paragraph, Text } = Typography;

interface MessageItemProps {
  message: any;
  isMyMessage: boolean;
  isFirstMessageInGroup: boolean;
  isLastMessageInGroup: boolean;
  shouldShowTimeLabel: boolean;
  getMessageTime: (timestamp: string) => string;
  formatTimeLabel: (timestamp: string) => string;
  activeChatRoom: any;
  userDetails: any;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isMyMessage,
  isFirstMessageInGroup,
  isLastMessageInGroup,
  shouldShowTimeLabel,
  getMessageTime,
  formatTimeLabel,
  activeChatRoom,
  userDetails,
}) => {
  return (
    <>
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
        activeChatRoom.roomType !== "PRIVATE" && (
          <div
            style={{
              textAlign: "left",
              paddingLeft: 40,
              marginBottom: 2,
              marginTop: shouldShowTimeLabel ? 0 : 8,
            }}
          >
            <Text strong style={{ fontSize: "13px", color: "#65676B" }}>
              {message.senderName}
            </Text>
          </div>
        )}
      <div
        style={{
          marginBottom: isLastMessageInGroup ? 12 : 2,
          display: "flex",
          justifyContent: isMyMessage ? "flex-end" : "flex-start",
          alignItems: "flex-end",
          position: "relative",
          padding: isMyMessage ? "0 0 0 40px" : "0 40px 0 0",
        }}
      >
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
              style={{ marginRight: 8, width: 32, height: 32 }}
            >
              {(message.senderName && message.senderName[0]) || "U"}
            </Avatar>
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMyMessage ? "flex-end" : "flex-start",
            maxWidth: "65%",
          }}
        >
          {message.content && (
            <Tooltip title={getMessageTime(message.timestamp)}>
              <Paragraph
                style={{
                  margin: isFirstMessageInGroup ? "4px 0 0" : "0 0 4px",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  backgroundColor: isMyMessage ? "#f5f6fa" : "#fff",
                  color: "#050505",
                  wordBreak: "break-word",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  position: "relative",
                  maxWidth: "100%",
                  border: "1px solid #f0f0f0",
                }}
              >
                {message.content}
              </Paragraph>
            </Tooltip>
          )}
          {message.fileUrl && message.messageType === ChatMessageType.FILE && (
            <Card
              size="small"
              style={{
                marginTop: 4,
                width: "auto",
                maxWidth: 200,
                borderRadius: isMyMessage
                  ? "12px 12px 4px 12px"
                  : "12px 12px 12px 4px",
                backgroundColor: isMyMessage ? "#f5f6fa" : "#E4E6EB",
                borderColor: isMyMessage ? "#f5f6fa" : "#E4E6EB",
                position: "relative",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                padding: 4,
              }}
            >
              <Space align="start" style={{ width: "100%" }}>
                <FilePreview
                  fileName={message.fileName}
                  fileUrl={message.fileUrl}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Tooltip title={message.fileName} placement="topLeft">
                    <div
                      style={{
                        color: isMyMessage ? "#050505" : "#050505",
                        fontWeight: 500,
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 120,
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
                        color: isMyMessage ? "#0A7CFF" : "#0A7CFF",
                        fontSize: 12,
                        fontWeight: 500,
                        textDecoration: "underline",
                      }}
                    >
                      Download
                    </a>
                  </div>
                </div>
              </Space>
            </Card>
          )}
          {message.messageType === ChatMessageType.SYSTEM_NOTIFICATION && (
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
                <InfoCircleOutlined style={{ color: "#fa8c16" }} />
                <Text>{message.content}</Text>
              </Space>
            </Card>
          )}
          {isMyMessage && message.isRead && isLastMessageInGroup && (
            <Avatar
              size={16}
              alt="Read"
              style={{
                marginTop: 4,
                alignSelf: "flex-end",
                border: "2px solid #fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {
                activeChatRoom.participants.find(
                  (p: any) => p.userId !== userDetails?.id
                )?.fullName[0]
              }
            </Avatar>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageItem;
