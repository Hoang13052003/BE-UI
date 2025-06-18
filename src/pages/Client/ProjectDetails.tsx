import React from "react";
import {
  Card,
  Progress,
  Typography,
  Button,
  Avatar,
  Space,
  Tabs,
  Row,
  Col,
  Tag,
  List,
  Descriptions,
  Tooltip,
} from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ExportOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { IoDocumentOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  type: "complete" | "progress" | "issue";
}

const ProjectDetails: React.FC = () => {
  const navigate = useNavigate();

  const updates: ProjectUpdate[] = [
    {
      id: "1",
      title: "Frontend Development Complete",
      description:
        "Successfully completed all frontend components and user interfaces",
      date: "2024-02-15",
      author: "Sarah Johnson",
      type: "complete",
    },
    {
      id: "2",
      title: "Backend API Progress",
      description: "Completed 60% of backend API integration",
      date: "2024-02-20",
      author: "Mike Wilson",
      type: "progress",
    },
    {
      id: "3",
      title: "Payment Gateway Integration",
      description: "Investigating issue with payment gateway callbacks",
      date: "2024-02-22",
      author: "David Brown",
      type: "issue",
    },
  ];

  const getUpdateIcon = (type: ProjectUpdate["type"]) => {
    switch (type) {
      case "complete":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "progress":
        return <BarChartOutlined style={{ color: "#1677ff" }} />;
      case "issue":
        return <CheckCircleOutlined style={{ color: "#ff4d4f" }} />;
    }
  };

  const handleDocumentClick = () => {
    navigate("/client/projects/documents");
  };

  return (
    <React.Fragment>
      {/* Header */}
      <div className="item-header">
        <Space className="item-left">
          <Title level={4} style={{ margin: 0 }}>
            E-commerce Platform
          </Title>
          <Text type="secondary">/ Project Details</Text>
        </Space>
        <Tooltip className="item-right">
          <Button
            type="primary"
            icon={<IoDocumentOutline />}
            onClick={handleDocumentClick}
          >
            Documents
          </Button>
          <Button type="primary" icon={<ExportOutlined />}>
            Export Report
          </Button>
        </Tooltip>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Title level={5}>Overall Progress</Title>
            <Title level={2} style={{ margin: "16px 0" }}>
              75%
            </Title>
            <Progress percent={75} />
            <Space style={{ marginTop: 16 }}>
              <Text>2024-01-01</Text>
              <Text>→</Text>
              <Text>2024-03-31</Text>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Space
              align="center"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Title level={5}>Milestones</Title>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
            </Space>
            <Title level={2} style={{ margin: "16px 0" }}>
              4/6
            </Title>
            <Space size={24}>
              <Space>
                <Text>Completed</Text>
                <Tag color="success">3</Tag>
              </Space>
              <Space>
                <Text>In Progress</Text>
                <Tag color="processing">1</Tag>
              </Space>
              <Space>
                <Text>Pending</Text>
                <Tag color="default">2</Tag>
              </Space>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Space
              align="center"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Title level={5}>Team Members</Title>
              <TeamOutlined />
            </Space>
            <Title level={2} style={{ margin: "16px 0" }}>
              3
            </Title>
            <Space>
              <Avatar.Group maxCount={3}>
                <Avatar icon={<UserOutlined />} />
                <Avatar icon={<UserOutlined />} />
                <Avatar icon={<UserOutlined />} />
              </Avatar.Group>
              <Button type="text" icon={<PlusOutlined />} />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Overview" key="overview">
            <Row gutter={24}>
              <Col span={12}>
                <Title level={5}>Project Description</Title>
                <Paragraph>
                  Custom e-commerce solution with advanced features including
                  payment integration, inventory management, and analytics
                  dashboard.
                </Paragraph>

                <Title level={5}>Project Details</Title>
                <Descriptions column={1}>
                  <Descriptions.Item label="Client">
                    Tech Corp
                  </Descriptions.Item>
                  <Descriptions.Item label="Project Manager">
                    John Smith
                  </Descriptions.Item>
                  <Descriptions.Item label="Project Type">
                    Fixed
                  </Descriptions.Item>
                  <Descriptions.Item label="Budget">$50,000</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Title level={5}>Recent Updates</Title>
                <List
                  itemLayout="horizontal"
                  dataSource={updates}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={getUpdateIcon(item.type)}
                        title={
                          <Space>
                            <Text strong>{item.title}</Text>
                            <Text type="secondary">{item.date}</Text>
                          </Space>
                        }
                        description={
                          <>
                            <div>{item.description}</div>
                            <Text type="secondary">By {item.author}</Text>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Milestones" key="milestones">
            Milestones content
          </TabPane>
          <TabPane tab="Updates" key="updates">
            Updates content
          </TabPane>
          <TabPane tab="Team" key="team">
            Team content
          </TabPane>
        </Tabs>
      </Card>
    </React.Fragment>
  );
};

export default ProjectDetails;
