import React, { useEffect, useState } from "react";
import { Button, Layout, Dropdown, Avatar, Tooltip, Select, Menu } from "antd";
import {
  CloseCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ProfileOutlined,
  SunOutlined,
  MoonOutlined,
  LoginOutlined,
  BellFilled,
  GlobalOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import ukicon from "../../assets/uk-icon.svg";
import chinaicon from "../../assets/china-flag-icon.svg";
import useLanguage, { Language } from "../../hooks/useLanguage";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import Logout from "../../components/LogoutComponent";

const { Header } = Layout;



const languages = [
  { 
    code: 'en', 
    name: 'English', 
    flagUrl: ukicon
  },
  { 
    code: 'zh', 
    name: '中文', 
    flagUrl: chinaicon
  },
];

const LayoutShare: React.FC = () => {
  const { language, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { userDetails, isAuthenticated } = useAuth();
  const [currentLang, setCurrentLang] = useState<Language>();
  const navigate = useNavigate();
  const handleLogout = Logout();

  const userMenuItems = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      key: "support",
      icon: <QuestionCircleOutlined />,
      label: "Support",
    },
    {
      key: "logout",
      icon: <CloseCircleOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];



  const handleLanguageChange = (value: string) => {
    setCurrentLang(value as Language);
    changeLanguage(value as Language);

    console.log(`Language changed to: ${value}`);
  };

  useEffect(() => {
    setCurrentLang(language);
    
  
  }, [language]);

  const MobileMenu: React.FC = () => {
    return (
      <Menu>
        <Menu.Item key="1">
          <Select
            style={{ width: '100%' }}
            value={currentLang}
            onChange={handleLanguageChange}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            suffixIcon={<GlobalOutlined />}
          >
            {languages.map((lang) => (
              <Select.Option key={lang.code} value={lang.code}>
                <img
                  src={lang.flagUrl}
                  alt={`${lang.name} flag`}
                  style={{
                    width: "20px",
                    marginRight: "10px",
                    verticalAlign: "middle",
                  }}
                />
                {lang.name}
              </Select.Option>
            ))}
          </Select>
        </Menu.Item>
  
        <Menu.Item key="2">
          <Button
            type="text"
            icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
          />
        </Menu.Item>
  
        {isAuthenticated ? (
          <>
            <Menu.Item key="3">
              <Button
                type="text"
                icon={<BellFilled />}
              />
            </Menu.Item>
  
            <Menu.Item key="4">
              <Avatar className="user-avatar">JT</Avatar>
              <div className="user-info">
                <div className="user-name">{userDetails?.fullName}</div>
              </div>
            </Menu.Item>
          </>
        ) : (
          <Menu.Item key="5">
            <Tooltip title="Login">
              <Button
                type="text"
                icon={<LoginOutlined />}
                onClick={() => { navigate('/login') }}
              >
                Login now
              </Button>
            </Tooltip>
          </Menu.Item>
        )}
      </Menu>
    );
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">Progress</span>
            <span className="logo-text">Hub</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-content">
            <Select
              style={{ width: 150 }}
              value={currentLang}
              onChange={handleLanguageChange}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              suffixIcon={<GlobalOutlined />}
            >
              {languages.map((lang) => (
                <Select.Option key={lang.code} value={lang.code}>
                  <img
                    src={lang.flagUrl}
                    alt={`${lang.name} flag`}
                    style={{
                      width: "20px",
                      marginRight: "10px",
                      verticalAlign: "middle",
                    }}
                  />
                  {lang.name}
                </Select.Option>
              ))}
            </Select>
            <Button
              type="text"
              icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
              className="theme-toggle"
              onClick={toggleTheme}
            />
            {isAuthenticated ? (
              <React.Fragment>
                <Button
                  type="text"
                  icon={<BellFilled />}
                  className="notification-btn"
                />
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  trigger={["click"]}
                  className="user-dropdown"
                >
                  {/* Wrap Avatar and Name in a div for layout */}
                  <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <Avatar className="user-avatar" style={{ marginRight: 8 }}>
                      {userDetails?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <span className="user-name">{userDetails?.fullName}</span> {/* Display full name */}
                  </div>
                  {/* <div className="user-profile">
                    <Avatar className="user-avatar">JT</Avatar>
                    <div className="user-info">
                      <div className="user-name">{userDetails?.fullName}</div>
                    </div>
                  </div> */}
                </Dropdown>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Tooltip title="Login">
                  <Button
                    type="text"
                    icon={<LoginOutlined />}
                    onClick={() => { navigate('/login') }}
                    className="login-btn"
                  >
                    Login now
                  </Button>
                </Tooltip>
              </React.Fragment>
            )}
          </div>

          {/* Dropdown for mobile view */}
          <Dropdown
            overlay={<MobileMenu />}
            trigger={['click']}
            className="mobile-dropdown"
          >
            <Button type="text" icon={<MenuOutlined />} />
          </Dropdown>
        </div>
      </Header>
      <Outlet />
    </Layout>
  );
};

export default LayoutShare;
