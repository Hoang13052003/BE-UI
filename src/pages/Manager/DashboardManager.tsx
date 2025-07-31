import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const DashboardClient: React.FC = () => {
  return (
    <Layout className="app-main-content">
      <Content className="app-content">
        <Outlet />
      </Content>
    </Layout>
  );
};

export default DashboardClient;
