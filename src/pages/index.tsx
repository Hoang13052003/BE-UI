import React, { useEffect, useState } from "react";
import { Button, Layout, Dropdown, Tooltip, Select } from "antd";
import {
  QuestionCircleOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  GlobalOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import ukicon from "../assets/uk-icon.svg";
import chinaicon from "../assets/china-flag-icon.svg";
import useLanguage, { Language } from "../hooks/useLanguage";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

const userMenuItems = [
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "Settings",
  },
  {
    key: "support",
    icon: <QuestionCircleOutlined />,
    label: "Support",
  }
];

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


const LayoutPage: React.FC = () => {
  const { language, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const navigate = useNavigate();

  const [currentLang, setCurrentLang] = useState<Language>();

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
            <span className="logo-icon">
              Progress
            </span>
            <span className="logo-text">Hub</span>
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
          <Tooltip title="Login">
            <Button 
            type="text" 
            icon={<LoginOutlined />} 
            onClick={() => {navigate('/login')}}
            className="login-btn" 
            >Login now</Button>
          </Tooltip>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
            className="user-dropdown"
          >
            <Button
            type="text"
            icon={<SettingOutlined />}
            className="settings-btn"
          />
          </Dropdown>
        </div>
      </Header>
      {/* <Layout>
       
      </Layout> */}
    </Layout>
  );
};

export default LayoutPage;
