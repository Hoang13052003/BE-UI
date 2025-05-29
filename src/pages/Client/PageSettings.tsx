import React from "react";
import { Card, Avatar, Typography, Menu, Button, Row, Col } from "antd";
import {
  UserOutlined,
  // HistoryOutlined,
  // ProjectOutlined,
  SettingOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const PageSettings: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => {
        navigate("/client/settings/profile");
      },
    },
    // {
    //   key: "activity",
    //   icon: <HistoryOutlined />,
    //   label: "Activity",
    // },
    // {
    //   key: "projects",
    //   icon: <ProjectOutlined />,
    //   label: "Projects",
    // },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => {
        navigate("/client/settings");
      },
    },
  ];

  return (
    <Card style={{ height: "100%", padding: "20px" }}>
      <Row gutter={24}>
        {/* Left Sidebar */}
        <Col span={6}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Avatar size={96} icon={<UserOutlined />} />
            <Title level={5} style={{ margin: "12px 0 4px" }}>
              John Smith
            </Title>
            <Text type="secondary">Project Manager</Text>
          </div>

          <Menu
            mode="vertical"
            defaultSelectedKeys={["settings"]}
            items={menuItems}
            style={{ border: "none" }}
          />
        </Col>

        <Col span={18}>
          <Outlet />
        </Col>
      </Row>
    </Card>
  );
};

export default PageSettings;
