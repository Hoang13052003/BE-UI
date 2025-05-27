import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  MessageOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Sider, Content } = Layout;

const DashboardClient: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout className="app-main-content">
      <Sider width={250} className="app-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-section-title">PROJECT</div>
          <Menu mode="inline" defaultSelectedKeys={["dashboard"]}>
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
              <Link to="/client/overview">{t("clientPages.dashboard")}</Link>
            </Menu.Item>
            <Menu.Item key="notifications" icon={<BellOutlined />}>
              <Link to="/client/notifications">
                {t("adminPages.notifications")}
              </Link>
            </Menu.Item>
            <Menu.Item key="messages" icon={<MessageOutlined />}>
              <Link to="/client/projects/messages">
                {t("clientPages.messages")}
              </Link>
            </Menu.Item>
            <div className="sidebar-section-title">ACCOUNT</div>
            <Menu.Item key="profile" icon={<UserOutlined />}>
              <Link to="/client/settings">{t("clientPages.profile")}</Link>
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
