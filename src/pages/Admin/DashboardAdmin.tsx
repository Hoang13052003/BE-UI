import React from "react";
import { Layout, Menu} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  // ProjectOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Link,Outlet } from "react-router-dom";

const { Sider, Content } = Layout;

const DashboardAdmin: React.FC = () => {
  return (
    <Layout className="app-main-content">
       <Sider width={250} className="app-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-title">MANAGEMENT</div>
            <Menu mode="inline" defaultSelectedKeys={["adminDashboard"]}>
              <Menu.Item key="adminDashboard" icon={<DashboardOutlined />}>
                <Link to="/admin/overview">Dashboard</Link>
              </Menu.Item>
              {/* <Menu.Item key="manageProjects" icon={<ProjectOutlined />}>
                <Link to="/admin/projects">Manage Projects</Link>
              </Menu.Item> */}
              <Menu.Item key="manageUsers" icon={<UserOutlined />}>
                <Link to="/admin/users">Manage Users</Link>
              </Menu.Item>
              <Menu.Item key="manageUpdates" icon={<EditOutlined />}>
                <Link to="/admin/updates">Manage Updates</Link>
              </Menu.Item>
              <Menu.Item key="notifications" icon={<BellOutlined />}>
                <Link to="/admin/notifications">Notifications</Link>
              </Menu.Item>
              <div className="sidebar-section-title">SYSTEM</div>
              <Menu.Item key="settings" icon={<SettingOutlined />}>
                <Link to="/admin/settings">Settings</Link>
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
