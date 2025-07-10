import React, { useState } from "react";
import { Button, Layout, Dropdown, Avatar, Tooltip, Menu, Drawer } from "antd";
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
  MenuOutlined,
  ClockCircleOutlined,
  // MessageOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Logout from "../../components/LogoutComponent";
import NotificationBell from "../../components/Admin/Notification/NotificationBell";
import { MenuProps } from "antd/lib";

const { Header } = Layout;

const LayoutShare: React.FC = () => {
  const { isAuthenticated, userDetails } = useAuth();
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

  const menuItems = isAuthenticated
    ? [
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
      ]
    : [
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
          key: "login",
          icon: <UserOutlined />,
          label: "Login",
          onClick: () => navigate("/login"),
        },
      ];

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
          key: "overtime-requests-admin",
          icon: <ClockCircleOutlined />,
          label: <Link to="/admin/overtime-requests">Overtime Requests</Link>,
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

  const itemsManager: MenuItem[] = [
    {
      key: "dashboard",
      icon: <AppstoreOutlined />,
      label: <Link to="/manager/overview">Dashboard</Link>,
    },
    {
      key: "project-progress",
      icon: <LineChartOutlined />,
      label: <Link to="/manager/project-progress">Reports</Link>,
    },
    {
      key: "my-feedbacks",
      icon: <WechatWorkOutlined />,
      label: <Link to="/manager/my-feedbacks">My Feedbacks</Link>,
    },
    {
      key: "overtime-requests",
      icon: <ClockCircleOutlined />,
      label: <Link to="/manager/overtime-requests">Overtime Requests</Link>,
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
          label: <Link to="/manager/notifications">Notifications</Link>,
        },
      ],
    },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
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
          <div
            className="mobile-menu-icon"
            style={{ marginLeft: "auto", display: "none" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 24 }} />}
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  outline: "none",
                }}
              />
            </div>
          </div>
          <div
            className="desktop-nav"
            style={{ flex: 1, alignItems: "center", gap: 24 }}
          >
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
            ) : isAuthenticated && userDetails?.role === "USER" ? (
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
            ) : isAuthenticated && userDetails?.role === "MANAGER" ? (
              <Menu
                onClick={onClick}
                selectedKeys={[current]}
                mode="horizontal"
                defaultSelectedKeys={[
                  localStorage.getItem("selectedKey") || "managerDashboard",
                ]}
                items={itemsManager}
              />
            ) : null}
          </div>
        </div>
        {isAuthenticated ? (
          <div
            className="desktop-nav"
            style={{ alignItems: "center", gap: 16, display: "flex" }}
          >
            <NotificationBell />
            <Dropdown
              menu={{ items: menuItems }}
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
          <div
            className="desktop-nav"
            style={{ alignItems: "center", gap: 16 }}
          >
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
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
            }}
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
        }
        placement="left"
        closable={true}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
      >
        {isAuthenticated && userDetails?.role === "ADMIN" ? (
          <Menu
            onClick={(e) => {
              onClick(e);
              setMobileMenuOpen(false);
            }}
            selectedKeys={[current]}
            mode="inline"
            defaultSelectedKeys={[
              localStorage.getItem("selectedKey") || "adminDashboard",
            ]}
            items={items}
            style={{ border: "none" }}
          />
        ) : isAuthenticated && userDetails?.role === "USER" ? (
            <Menu
              onClick={(e) => {
                onClick(e);
                setMobileMenuOpen(false);
              }}
              selectedKeys={[current]}
              mode="inline"
              defaultSelectedKeys={[
                localStorage.getItem("selectedKey") || "dashboard",
              ]}
              items={itemsClient}
              style={{ border: "none" }}
            />
        ) : isAuthenticated && userDetails?.role === "MANAGER" ? (
        <Menu
          onClick={(e) => {
            onClick(e);
            setMobileMenuOpen(false);
          }}
            selectedKeys={[current]}
          mode="inline"
          defaultSelectedKeys={[
              localStorage.getItem("selectedKey") || "managerDashboard",
          ]}
            items={itemsManager}
          style={{ border: "none" }}
        />
        ) : null}
      </Drawer>
      <Outlet />
    </Layout>
  );
};

export default LayoutShare;
