import React from "react";
import { Typography, Breadcrumb } from "antd";
import {
  HomeOutlined,
  BarChartOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import ProjectUpdateDetails from "./ProjectUpdateDetails";
import { useAuth } from "../../../contexts/AuthContext";

const { Title } = Typography;

const ProjectUpdateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userRole } = useAuth();

  return (
    <div className="project-update-details-page">
      {userRole === "ADMIN" ? (
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link to="/admin/overview">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/admin/project-progress">
              <BarChartOutlined /> Project Progress
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <FileOutlined /> Update Details
          </Breadcrumb.Item>
        </Breadcrumb>
      ) : (
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link to="/client/overview">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <FileOutlined /> Update Details
          </Breadcrumb.Item>
        </Breadcrumb>
      )}

      <Title level={3} style={{ marginBottom: 24 }}>
        Project Update Details
      </Title>

      <ProjectUpdateDetails id={id ? parseInt(id) : undefined} />
    </div>
  );
};

export default ProjectUpdateDetailsPage;
