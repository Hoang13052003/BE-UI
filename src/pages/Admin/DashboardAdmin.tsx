import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  // ProjectOutlined,
  EditOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Sider, Content } = Layout;

const DashboardAdmin: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout className="app-main-content">
      <Sider width={250} className="app-sidebar">
        <div className="sidebar-section">
          <div className="sidebar-section-title">MANAGEMENT</div>
          <Menu
            mode="inline"
            defaultSelectedKeys={[
              localStorage.getItem("selectedKey") || "adminDashboard",
            ]}
            onClick={({ key }) => {
              localStorage.setItem("selectedKey", key);
            }}
          >
            <Menu.Item key="adminDashboard" icon={<DashboardOutlined />}>
              <Link to="/admin/overview">{t("adminPages.dashboard")}</Link>
            </Menu.Item>
            <Menu.Item key="manageUsers" icon={<UserOutlined />}>
              <Link to="/admin/users">{t("adminPages.userManagement")}</Link>
            </Menu.Item>
            <Menu.Item key="manageProjects" icon={<ProjectOutlined />}>
              <Link to="/admin/updates">
                {t("adminPages.projectManagement")}
              </Link>
            </Menu.Item>
            <Menu.Item key="manageProjectUpdates" icon={<EditOutlined />}>
              <Link to="/admin/project-progress">
                {/* {t("adminPages.projectManagement")} */}
                Projects Update
              </Link>
            </Menu.Item>
            <Menu.Item key="notifications" icon={<BellOutlined />}>
              <Link to="/admin/notifications">
                {t("adminPages.notifications")}
              </Link>
            </Menu.Item>
            <div className="sidebar-section-title">SYSTEM</div>
            <Menu.Item key="settings" icon={<SettingOutlined />}>
              <Link to="/admin/settings">{t("adminPages.systemSettings")}</Link>
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

export default DashboardAdmin;
