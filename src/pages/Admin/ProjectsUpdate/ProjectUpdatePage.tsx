import React from "react";
import { Typography, Breadcrumb, Card } from "antd";
import { HomeOutlined, BarChartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import ProjectProgressList from "./ProjectProgressList";

const { Title } = Typography;

const ProjectProgressPage: React.FC = () => {
  const breadcrumbItems = [
    {
      title: (
        <Link to="/admin/overview">
          <HomeOutlined />
        </Link>
      ),
    },
    {
      title: (
        <Link to="/admin/project-progress">
          <BarChartOutlined /> Project Update
        </Link>
      ),
    },
  ];

  return (
    <Card style={{ height: "100%" }}>
      <Breadcrumb style={{ marginBottom: 16 }} items={breadcrumbItems} />

      <Title level={3} style={{ marginBottom: 24 }}>
        Project Update Management
      </Title>

      <ProjectProgressList />
    </Card>
  );
};

export default ProjectProgressPage;
