import React from "react";
import { Layout, Menu, Badge, Avatar } from "antd";
import {
  DashboardOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  ContactsOutlined,
  MessageOutlined,
  MailOutlined,
  InboxOutlined,
  EditOutlined,
  ReadOutlined,
  AppstoreOutlined,
  FileOutlined,
  ShoppingCartOutlined,
  CustomerServiceOutlined,
  ProjectOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Sider, Header, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Header className="header">
        <div className="logo">
         <h5>My Dashboard</h5>
        </div>
        <div className="header-left">
          <span className="menu-collapse-icon">≡</span>
          <div className="search-box">
            <input type="text" placeholder="Search here..." />
            <SearchOutlined className="search-icon" />
          </div>
        </div>
        <div className="header-right">
          <div className="header-icon">
            <span className="icon-wrapper">
              <MailOutlined />
            </span>
          </div>
          <div className="header-icon">
            <span className="icon-wrapper">
              <Badge count={1} size="small">
                <span className="notification-icon" />
              </Badge>
            </span>
          </div>
          <div className="date">08 April 2025</div>
          <div className="language">
            <span className="flag">🇺🇸</span>
            <span>ENG</span>
          </div>
          <div className="avatar">
            <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" />
          </div>
        </div>
      </Header>
      <Layout className="main-layout">
        <Sider width={300} className="sidebar">
          <div className="menu-section" style={{ marginTop: "64px" }}>
            <div className="section-title">MAIN</div>
            <Menu mode="inline" defaultSelectedKeys={["2"]}>
              <Menu.Item key="1" icon={<DashboardOutlined />}>
                Dashboard
                <span className="item-badge">5</span>
              </Menu.Item>
            </Menu>
          </div>
          <div className="menu-section">
            <div className="section-title">APPS</div>
            <Menu mode="inline" defaultSelectedKeys={["2"]}>
              <Menu.Item key="2" icon={<CheckSquareOutlined />}>
                To Do List
              </Menu.Item>
              <Menu.Item key="3" icon={<CalendarOutlined />}>
                Calendar
              </Menu.Item>
              <Menu.Item key="4" icon={<ContactsOutlined />}>
                Contacts
              </Menu.Item>
              <Menu.Item key="5" icon={<MessageOutlined />}>
                Chat
              </Menu.Item>
              <Menu.SubMenu key="sub1" icon={<MailOutlined />} title="Email">
                <Menu.Item key="6" icon={<InboxOutlined />}>
                  Inbox
                </Menu.Item>
                <Menu.Item key="7" icon={<EditOutlined />}>
                  Compose
                </Menu.Item>
                <Menu.Item key="8" icon={<ReadOutlined />}>
                  Read
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Item key="9" icon={<AppstoreOutlined />}>
                Kanban Board
              </Menu.Item>
              <Menu.Item key="10" icon={<FileOutlined />}>
                File Manager
              </Menu.Item>
            </Menu>
          </div>
          <div className="menu-section">
            <div className="section-title">PAGES</div>
            <Menu mode="inline">
              <Menu.Item key="11" icon={<ShoppingCartOutlined />}>
                E-Commerce
              </Menu.Item>
              <Menu.Item key="12" icon={<CustomerServiceOutlined />}>
                CRM
              </Menu.Item>
              <Menu.Item key="13" icon={<ProjectOutlined />}>
                Project Management
              </Menu.Item>
              <Menu.Item key="14" icon={<BookOutlined />}>
                LMS
              </Menu.Item>
              <Menu.Item key="15" icon={<QuestionCircleOutlined />}>
                Help Desk
              </Menu.Item>
            </Menu>
          </div>
        </Sider>
        <Layout>
          <Content className="content">{children}</Content>
        </Layout>
      </Layout>
    </>
  );
};

export default MainLayout;
