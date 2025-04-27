import React from 'react';
// import { Button, Result } from 'antd';
// import { useTheme } from "../../contexts/ThemeContext";

const Welcome: React.FC = () => {
  // const { theme } = useTheme(); // ✅ Gọi trong component

  return (
    <div className="home">
      <h1 className="welcome-text">Welcome to Progress Hub</h1>
    </div>
  );
};

export default Welcome;
