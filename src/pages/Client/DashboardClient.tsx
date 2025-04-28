import React from "react";
import { Layout, Menu} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Link,Outlet } from "react-router-dom";

const { Sider, Content } = Layout;

const DashboardClient: React.FC = () => {
  return (
    <Layout className="app-main-content">
        <Sider width={250} className="app-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-title">PROJECT</div>
            <Menu mode="inline" defaultSelectedKeys={["dashboard"]}>
              <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                <Link to="/client/overview">Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="messages" icon={<MessageOutlined />}>
                <Link to="/client/projects/messages">Messages / Notes</Link>
              </Menu.Item>
              <div className="sidebar-section-title">ACCOUNT</div>
              <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to="/client/profiles">Profile</Link>
              </Menu.Item>  
            </Menu>
          </div>
        </Sider>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
  );
};

export default DashboardClient;
