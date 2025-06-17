import React, { useEffect, useState } from "react";
import { Button, Layout, Dropdown, Avatar, Tooltip, Select } from "antd";
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
import vietnameicon from "../../assets/vietnam-flag-icon.svg";
import useLanguage, { Language } from "../../hooks/useLanguage";
// import { useTranslation } from 'react-i18next';
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import Logout from "../../components/LogoutComponent";
import { useTranslation } from "react-i18next";
import NotificationBell from "../../components/Admin/Notification/NotificationBell";

const { Header } = Layout;

const languages = [
  {
    code: "en",
    name: "English",
    flagUrl: ukicon,
  },
  {
    code: "vi",
    name: "Vietnamese",
    flagUrl: vietnameicon,
  },
];

const LayoutShare: React.FC = () => {
  const { t } = useTranslation(); // Sử dụng hook useTranslation
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
      label: t("profile.title"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: t("settings.title"),
    },
    {
      key: "support",
      icon: <QuestionCircleOutlined />,
      label: t("navigation.support"),
    },
    {
      key: "logout",
      icon: <CloseCircleOutlined />,
      label: t("auth.logout"),
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
      <Header
        className="app-header"
        style={{
          background: "#fff",
          boxShadow: "0 2px 8px #f0f1f2",
          position: "fixed",
          top: 0,
          zIndex: 10,
          padding: "0 80px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="header-left">
          <div className="logo" onClick={() => navigate("/")}>
            <span className="logo-icon">Progress</span>
            <span className="logo-text">Hub</span>
          </div>
        </div>
        <div className="header-right">
          <div className="header-content">
            {" "}
            <Select
              style={{ width: 150 }}
              value={currentLang}
              onChange={handleLanguageChange}
              popupMatchSelectWidth={false}
              listHeight={400}
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
              icon={theme === "light" ? <SunOutlined /> : <MoonOutlined />}
              className="theme-toggle"
              onClick={toggleTheme}
            />
            {isAuthenticated ? (
              <React.Fragment>
                <NotificationBell />

                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  trigger={["click"]}
                  className="user-dropdown"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Avatar className="user-avatar" style={{ marginRight: 8 }}>
                      {userDetails?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                    <span className="user-name">{userDetails?.fullName}</span>{" "}
                  </div>
                </Dropdown>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Tooltip title="Login">
                  <Button
                    type="text"
                    icon={<LoginOutlined />}
                    onClick={() => {
                      navigate("/login");
                    }}
                    className="login-btn"
                  >
                    {t("common.getStarted")}
                  </Button>
                </Tooltip>
              </React.Fragment>
            )}
          </div>

          {/* Dropdown for mobile view */}
          <Dropdown
            menu={{
              items: [
                {
                  key: "1",
                  label: (
                    <Select
                      style={{ width: "100%" }}
                      value={currentLang}
                      onChange={handleLanguageChange}
                      listHeight={400}
                      popupClassName="custom-select-dropdown"
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
                  ),
                },
                {
                  key: "2",
                  label: (
                    <Button
                      type="text"
                      icon={
                        theme === "light" ? <SunOutlined /> : <MoonOutlined />
                      }
                      onClick={toggleTheme}
                    />
                  ),
                },
                ...(isAuthenticated
                  ? [
                      {
                        key: "3",
                        label: <Button type="text" icon={<BellFilled />} />,
                      },
                      {
                        key: "4",
                        label: (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Avatar className="user-avatar">JT</Avatar>
                            <div className="user-info">
                              <div className="user-name">
                                {userDetails?.fullName}
                              </div>
                            </div>
                          </div>
                        ),
                      },
                    ]
                  : [
                      {
                        key: "5",
                        label: (
                          <Tooltip title="Login">
                            <Button
                              type="text"
                              icon={<LoginOutlined />}
                              onClick={() => {
                                navigate("/login");
                              }}
                            >
                              {t("common.getStarted")}
                            </Button>
                          </Tooltip>
                        ),
                      },
                    ]),
              ],
            }}
            trigger={["click"]}
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
