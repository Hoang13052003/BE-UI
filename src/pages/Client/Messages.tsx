import React from "react";
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
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  PaperClipOutlined,
  MoreOutlined,
  SendOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface Message {
  id: string;
  author: string;
  content: string;
  time: string;
  unread?: number;
  attachment?: {
    name: string;
    size: string;
  };
  isNote?: boolean;
}

interface ProjectNote {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  author: string;
}

const Messages: React.FC = () => {
  const messages: Message[] = [
    {
      id: "1",
      author: "John Smith",
      content: "Updated the project timeline",
      time: "2h ago",
      unread: 2,
    },
    {
      id: "2",
      author: "Sarah Johnson",
      content: "Shared new design files",
      time: "4h ago",
    },
    {
      id: "3",
      author: "Development Team",
      content: "API integration completed",
      time: "1d ago",
      unread: 5,
    },
  ];

  const chatMessages = [
    {
      id: "1",
      author: "John Smith",
      content: "Hi team, I've updated the project timeline. Please review.",
      time: "2:30 PM",
    },
    {
      id: "2",
      author: "Sarah Johnson",
      content: "",
      time: "2:35 PM",
      attachment: {
        name: "design-mockups.fig",
        size: "15.8 MB",
      },
    },
    {
      id: "3",
      author: "John Smith",
      content: "Important: Client meeting scheduled for tomorrow at 10 AM",
      time: "2:40 PM",
      isNote: true,
    },
  ];

  return (
    <Card>
      <Row gutter={24}>
        {/* Left Sidebar */}
        <Col span={6}>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Messages & Notes
            </Title>
            <Button type="primary" icon={<PlusOutlined />}>
              New Message
            </Button>
          </div>

          <Search
            placeholder="Search messages..."
            prefix={<SearchOutlined />}
            style={{ marginBottom: 16 }}
          />

          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(item) => (
              <List.Item style={{ padding: "12px", cursor: "pointer" }}>
                <List.Item.Meta
                  avatar={<Avatar>{item.author[0]}</Avatar>}
                  title={item.author}
                  description={
                    <Space>
                      <Text type="secondary">{item.content}</Text>
                      <Text type="secondary">•</Text>
                      <Text type="secondary">{item.time}</Text>
                    </Space>
                  }
                />
                {item.unread && <Badge count={item.unread} />}
              </List.Item>
            )}
          />
        </Col>

        {/* Chat Area */}
        <Col span={18}>
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
                  Development Team
                </Title>
                <Text type="secondary">5 members</Text>
              </Space>
              <Space>
                <Button type="text" icon={<PaperClipOutlined />} />
                <Button type="text" icon={<MoreOutlined />} />
              </Space>
            </div>

            <div style={{ height: 400, overflowY: "auto", marginBottom: 16 }}>
              {chatMessages.map((message) => (
                <div key={message.id} style={{ marginBottom: 24 }}>
                  <Space align="start">
                    <Avatar>{message.author[0]}</Avatar>
                    <div>
                      <Space>
                        <Text strong>{message.author}</Text>
                        <Text type="secondary">{message.time}</Text>
                      </Space>
                      {message.content && (
                        <Paragraph style={{ margin: "4px 0" }}>
                          {message.content}
                        </Paragraph>
                      )}
                      {message.attachment && (
                        <Card size="small" style={{ width: 200 }}>
                          <Space>
                            <PaperClipOutlined />
                            <div>
                              <div>{message.attachment.name}</div>
                              <Text type="secondary">
                                {message.attachment.size}
                              </Text>
                            </div>
                          </Space>
                        </Card>
                      )}
                      {message.isNote && (
                        <Card
                          size="small"
                          style={{
                            backgroundColor: "#fff7e6",
                            borderColor: "#ffd591",
                          }}
                        >
                          <Space>
                            <InfoCircleOutlined style={{ color: "#fa8c16" }} />
                            <Text>{message.content}</Text>
                          </Space>
                        </Card>
                      )}
                    </div>
                  </Space>
                </div>
              ))}
            </div>

            <Input
              placeholder="Type your message..."
              suffix={
                <Space>
                  <PaperClipOutlined />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    shape="circle"
                  />
                </Space>
              }
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default Messages;
