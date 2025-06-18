import React, { useState } from "react";
import { Button, Layout, Dropdown, Avatar, Tooltip, Menu } from "antd";
import {
  QuestionCircleOutlined,
  SettingOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
  LineChartOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  WechatWorkOutlined,
  BellOutlined,
  FileSearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Logout from "../../components/LogoutComponent";
import NotificationBell from "../../components/Admin/Notification/NotificationBell";
import Search from "antd/es/input/Search";
import { MenuProps } from "antd/lib";

// import ukicon from "../../assets/uk-icon.svg";
// import vietnameicon from "../../assets/vietnam-flag-icon.svg";
// import useLanguage, { Language } from "../../hooks/useLanguage";
// import { useTheme } from "../../contexts/ThemeContext";
// import { useTranslation } from "react-i18next";

const { Header } = Layout;

// const languages = [
//   {
//     code: "en",
//     name: "English",
//     flagUrl: ukicon,
//   },
//   {
//     code: "vi",
//     name: "Vietnamese",
//     flagUrl: vietnameicon,
//   },
// ];

const LayoutShare: React.FC = () => {
  // const { t } = useTranslation();
  // const { language, changeLanguage } = useLanguage();
  // const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, userDetails } = useAuth();
  // const [_currentLang, setCurrentLang] = useState<Language>();
  const navigate = useNavigate();
  const handleLogout = Logout();

  type MenuItem = Required<MenuProps>["items"][number];

  const [current, setCurrent] = useState(
    isAuthenticated && userDetails?.role === "ADMIN"
      ? localStorage.getItem("selectedKey") || "adminDashboard"
      : localStorage.getItem("selectedKey") || "dashboard"
  );

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
    localStorage.setItem("selectedKey", e.key);
  };

  const handleSettingsClick = () => {
    if (userDetails?.role === "ADMIN") {
      navigate("/admin/settings");
    } else if (userDetails?.role === "USER") {
      navigate("/client/settings");
    }
  };

  const menuItems = [
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: handleSettingsClick,
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Help",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  // const handleLanguageChange = (value: string) => {
  //   setCurrentLang(value as Language);
  //   changeLanguage(value as Language);

  //   console.log(`Language changed to: ${value}`);
  // };

  // useEffect(() => {
  //   setCurrentLang(language);
  // }, [language]);

  const items: MenuItem[] = [
    {
      key: "adminDashboard",
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/overview">Dashboard</Link>,
    },
    {
      key: "manageProjects",
      icon: <FolderOpenOutlined />,
      label: <Link to="/admin/updates">Projects</Link>,
    },
    {
      key: "manageProjectUpdates",
      icon: <LineChartOutlined />,
      label: <Link to="/admin/project-progress">Reports</Link>,
    },
    {
      key: "manageUsers",
      icon: <TeamOutlined />,
      label: <Link to="/admin/users">Users</Link>,
    },
    {
      key: "other",
      label: "Other",
      style: { fontWeight: 600 },
      icon: <UnorderedListOutlined />,
      children: [
        {
          key: "feedbacks",
          icon: <WechatWorkOutlined />,
          label: <Link to="/admin/feedbacks">Feedbacks</Link>,
        },
        {
          key: "notifications",
          icon: <BellOutlined />,
          label: <Link to="/admin/notifications">Notifications</Link>,
        },
        {
          key: "auditLogs",
          icon: <FileSearchOutlined />,
          label: <Link to="/admin/audit-logs">Logs</Link>,
        },
      ],
    },
  ];

  const itemsClient: MenuItem[] = [
    {
      key: "dashboard",
      icon: <AppstoreOutlined />,
      label: <Link to="/client/overview">Dashboard</Link>,
    },
    {
      key: "project-updates",
      icon: <LineChartOutlined />,
      label: <Link to="/client/project-updates">Project Updates</Link>,
    },
    {
      key: "my-feedbacks",
      icon: <WechatWorkOutlined />,
      label: <Link to="/client/my-feedbacks">My Feedbacks</Link>,
    },
    {
      key: "other",
      label: "Other",
      style: { fontWeight: 600 },
      icon: <UnorderedListOutlined />,
      children: [
        {
          key: "notifications-v2",
          icon: <BellOutlined />,
          label: <Link to="/client/notifications">Notifications</Link>,
        },
      ],
    },
  ];
  return (
    <Layout className="app-layout">
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 0 12px 4px rgba(255, 255, 255, 0.7)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => navigate("/")}
          >
            <Avatar
              shape="square"
              size="large"
              style={{
                background: "linear-gradient(45deg, #667EEA 30%, #764BA2 90%)",
                color: "white",
              }}
            >
              P
            </Avatar>
            <span style={{ fontSize: 16, fontWeight: 600 }}>ProgressHub</span>
          </div>

          {isAuthenticated && userDetails?.role === "ADMIN" ? (
            <Menu
              onClick={onClick}
              selectedKeys={[current]}
              mode="horizontal"
              defaultSelectedKeys={[
                localStorage.getItem("selectedKey") || "adminDashboard",
              ]}
              items={items}
            />
          ) : (
            userDetails?.role === "USER" && (
              <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode="horizontal"
                defaultSelectedKeys={[
                  localStorage.getItem("selectedKey") || "dashboard",
                ]}
                items={itemsClient}
              />
            )
          )}
        </div>
        {isAuthenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Search
              placeholder="Search projects, users..."
              style={{ width: 240 }}
              allowClear
            />

            <NotificationBell />

            {/* <Button
            style={{
              width: 40,
              height: 40,
              border: "none",
            }}
          >
            <Tooltip title="Feedback">
              <MessageOutlined style={{ fontSize: 18 }} />
            </Tooltip>
          </Button> */}

            <Dropdown
              overlay={<Menu items={menuItems} />}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Tooltip title="Settings">
                <Button
                  style={{
                    width: 40,
                    height: 40,
                    border: "none",
                    outline: "none",
                  }}
                >
                  <SettingOutlined style={{ fontSize: 18 }} />
                </Button>
              </Tooltip>
            </Dropdown>

            {isAuthenticated && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar icon={<UserOutlined />} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              type="default"
              style={{
                borderRadius: 999,
                border: "1px solid #2f54eb",
                color: "#2f54eb",
                backgroundColor: "#fff",
                fontWeight: 500,
                padding: "4px 16px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "none",
                transition: "all 0.3s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f5ff";
                e.currentTarget.style.color = "#1d39c4";
                e.currentTarget.style.border = "1px solid #1d39c4";
                e.currentTarget.style.outline = "none";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.color = "#2f54eb";
                e.currentTarget.style.border = "1px solid #2f54eb";
                e.currentTarget.style.outline = "none";
              }}
              onClick={() => navigate("/login")}
            >
              Get Started
              <span style={{ fontSize: 16, lineHeight: 1 }}>✨</span>
            </Button>
          </div>
        )}
      </Header>
      <Outlet />
    </Layout>
  );
};

export default LayoutShare;
