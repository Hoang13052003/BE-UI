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

  const menuItems = [
    {
      type: "group" as const,
      label: "MANAGEMENT",
      children: [
        {
          key: "adminDashboard",
          icon: <DashboardOutlined />,
          label: <Link to="/admin/overview">{t("adminPages.dashboard")}</Link>,
        },
        {
          key: "manageUsers",
          icon: <UserOutlined />,
          label: (
            <Link to="/admin/users">{t("adminPages.userManagement")}</Link>
          ),
        },
        {
          key: "manageProjects",
          icon: <ProjectOutlined />,
          label: (
            <Link to="/admin/updates">{t("adminPages.projectManagement")}</Link>
          ),
        },
        {
          key: "manageProjectUpdates",
          icon: <EditOutlined />,
          label: <Link to="/admin/project-progress">Projects Update</Link>,
        },
        {
          key: "notifications",
          icon: <BellOutlined />,
          label: (
            <Link to="/admin/notifications">
              {t("adminPages.notifications")}
            </Link>
          ),
        },
        {
          key: "feedbacks",
          icon: <BellOutlined />,
          label: <Link to="/admin/feedbacks">Feedbacks</Link>,
        },
      ],
    },
    {
      type: "group" as const,
      label: "SYSTEM",
      children: [
        {
          key: "settings",
          icon: <SettingOutlined />,
          label: <Link to="/admin/settings">{t("clientPages.settings")}</Link>,
        },
      ],
    },
  ];

  return (
    <Layout className="app-main-content">
      <Sider width={250} className="app-sidebar">
        <div className="sidebar-section">
          <Menu
            mode="inline"
            defaultSelectedKeys={[
              localStorage.getItem("selectedKey") || "adminDashboard",
            ]}
            onClick={({ key }) => {
              localStorage.setItem("selectedKey", key);
            }}
            items={menuItems}
          />
        </div>
      </Sider>
      <Content className="app-content">
        <Outlet />
      </Content>
    </Layout>
  );
};

export default DashboardAdmin;
