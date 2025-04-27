import React, { useEffect, useState } from "react";
import { Button, Layout, Dropdown, Avatar, Tooltip, Select } from "antd";
import {
  CloseCircleOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ProfileOutlined,
  InboxOutlined,
  ScheduleOutlined,
  SunOutlined,
  MoonOutlined,
  LoginOutlined,
  BellFilled,
  GlobalOutlined,
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
      key: "inbox",
      icon: <InboxOutlined />,
      label: "Inbox",
    },
    {
      key: "taskManager",
      icon: <ScheduleOutlined />,
      label: "Task Manager",
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



  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">Spark</span>
            <span className="logo-text">Minds</span>
          </div>
        </div>
        <div className="header-right">
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
          <Tooltip title="Toggle theme">
            <Button
              type="text"
              icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
              className="theme-toggle"
              onClick={toggleTheme}
            />
          </Tooltip>
          
          {isAuthenticated?(
            <React.Fragment>
              <Tooltip title="Notifications">
                <Button
                  type="text"
                  icon={<BellFilled />}
                  className="notification-btn"
                />
              </Tooltip>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
                className="user-dropdown"
              >
                <div className="user-profile">
                  <Avatar className="user-avatar">JT</Avatar>
                  <div className="user-info">
                    <div className="user-name">{userDetails?.fullName}</div>
                    {/* <div className="user-role">Web Designer</div> */}
                  </div>
                </div>
              </Dropdown>
            </React.Fragment>
          ): (
            <Tooltip title="Login">
            <Button 
            type="text" 
            icon={<LoginOutlined />} 
            onClick={() => {navigate('/login')}}
            className="login-btn" 
            >Login now</Button>
            </Tooltip>
          )}
          <Button
            type="text"
            icon={<SettingOutlined />}
            className="settings-btn"
          />
        </div>
      </Header>
      <Outlet />
    </Layout>
  );
};

export default LayoutShare;
