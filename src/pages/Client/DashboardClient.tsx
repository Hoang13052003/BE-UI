import React from "react";
import { Button, Layout, Menu} from "antd";
import {
  DashboardOutlined,
  LockOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ToolOutlined,
  UserOutlined,
  CalendarOutlined,
  BellOutlined,
  ContactsOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  AppstoreOutlined,
  GiftOutlined,
  MenuFoldOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Link,Outlet } from "react-router-dom";

const { Sider, Content } = Layout;

const DashboardClient: React.FC = () => {
  return (
    <Layout className="app-main-content">
        <Sider width={250} className="app-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-title">MAIN</div>
            <Menu mode="inline" defaultSelectedKeys={["errorPage"]}>
              <Menu.Item key="dashboards" icon={<DashboardOutlined />}>
                Dashboards
              </Menu.Item>
            </Menu>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">PAGES</div>
            <Menu mode="inline" defaultSelectedKeys={["errorPage"]}>
              <Menu.Item key="authentication" icon={<LockOutlined />}>
                Authentication
              </Menu.Item>
              <Menu.SubMenu key="sub2" icon={<LockOutlined />} title="Authentication">
                <Menu.Item key="Login"><Link to="/login">Login</Link></Menu.Item>
                <Menu.Item key="Register"><Link to="/register">Register</Link></Menu.Item>
                <Menu.Item key="88">Read</Menu.Item>
              </Menu.SubMenu>
              <Menu.Item key="errorPage" icon={<CloseCircleOutlined />}>
                Error Page
              </Menu.Item>
              <Menu.Item key="comingSoon" icon={<ClockCircleOutlined />}>
                Coming Soon
              </Menu.Item>
              <Menu.SubMenu key="sub1" icon={<MailOutlined />} title="Email">
                <Menu.Item key="6">Inbox</Menu.Item>
                <Menu.Item key="7">Compose</Menu.Item>
                <Menu.Item key="8">Read</Menu.Item>
              </Menu.SubMenu>
              <Menu.Item key="notFound" icon={<StopOutlined />}>
                Not Found
              </Menu.Item>
              <Menu.Item key="underMaintenance" icon={<ToolOutlined />}>
                Under Maintenance
              </Menu.Item>
              <Menu.Item key="userProfile" icon={<UserOutlined />}>
                User Profile
              </Menu.Item>
              <Menu.Item key="userTimeline" icon={<CalendarOutlined />}>
                User Timeline
              </Menu.Item>
              <Menu.Item key="notifications" icon={<BellOutlined />}>
                Notifications
              </Menu.Item>
              <Menu.Item key="contacts" icon={<ContactsOutlined />}>
                Contacts
              </Menu.Item>
              <Menu.Item key="faq" icon={<QuestionCircleOutlined />}>
                Faq
              </Menu.Item>
              <Menu.Item key="accountSettings" icon={<SettingOutlined />}>
                Account settings
              </Menu.Item>
            </Menu>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">GENERAL</div>
            <Menu mode="inline">
              <Menu.Item key="uiKits" icon={<AppstoreOutlined />}>
                UI Kits
              </Menu.Item>
              <Menu.Item key="bonusUi" icon={<GiftOutlined />}>
                Bonus UI
              </Menu.Item>
            </Menu>
          </div>

          <div className="sidebar-footer">
            <Button type="text" icon={<MenuFoldOutlined />} />
          </div>
        </Sider>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
  );
};

export default DashboardClient;
