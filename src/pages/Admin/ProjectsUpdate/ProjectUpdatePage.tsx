import React from "react";
import { Typography, Breadcrumb } from "antd";
import { HomeOutlined, BarChartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import ProjectProgressList from "./ProjectProgressList";

const { Title } = Typography;

const ProjectProgressPage: React.FC = () => {
  return (
    <div className="project-progress-page">
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/admin/overview">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/admin/project-progress">
            <BarChartOutlined /> Project Update
          </Link>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={3} style={{ marginBottom: 24 }}>
        Project Update Management
      </Title>

      <ProjectProgressList />
    </div>
  );
};

export default ProjectProgressPage;
