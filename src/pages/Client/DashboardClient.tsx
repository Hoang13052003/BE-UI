import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  // UserOutlined, // Không sử dụng UserOutlined trong DashboardClient
  MessageOutlined,
  BellOutlined,
  SettingOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Sider, Content } = Layout;

const DashboardClient: React.FC = () => {
  const { t } = useTranslation();

  // Định nghĩa các mục menu
  const menuItems = [
    {
      type: "group" as const,
      label: "PROJECT", // Tiêu đề phần PROJECT
      children: [
        {
          key: "dashboard",
          icon: <DashboardOutlined />,
          label: (
            <Link to="/client/overview">{t("clientPages.dashboard")}</Link>
          ),
        },
        {
          key: "notifications",
          icon: <BellOutlined />,
          label: (
            <Link to="/client/notifications">
              {t("adminPages.notifications")}
            </Link>
          ),
        },
        {
          key: "my-feedbacks",
          icon: <MessageOutlined />,
          label: (
            <Link to="/client/my-feedbacks">
              {t("clientPages.my-feedbacks")}
            </Link>
          ),
        },
        {
          key: "project-updates",
          icon: <ProjectOutlined />,
          label: (
            <Link to="/client/project-updates">
              {t("clientPages.project-updates")}
            </Link>
          ),
        },
        // {
        //   key: "messages",
        //   icon: <MessageOutlined />,
        //   label: <Link to="/client/messages">{t("clientPages.messages")}</Link>,
        // },
      ],
    },
    {
      type: "group" as const,
      label: "ACCOUNT", // Tiêu đề phần ACCOUNT
      children: [
        {
          key: "profile", // Đổi từ "settings" sang "profile" để khớp với đường dẫn và ý nghĩa
          icon: <SettingOutlined />,
          label: <Link to="/client/settings">{t("clientPages.settings")}</Link>,
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
              localStorage.getItem("selectedClientKey") || "dashboard",
            ]}
            onClick={({ key }) => {
              localStorage.setItem("selectedClientKey", key);
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

export default DashboardClient;
