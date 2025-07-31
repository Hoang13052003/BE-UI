import React from "react";
import { Breadcrumb, Card } from "antd";
import {
  HomeOutlined,
  BarChartOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import ProjectUpdateDetails from "./ProjectUpdateDetails";
import { useAuth } from "../../contexts/AuthContext";

const ProjectUpdateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userRole } = useAuth();
  const adminBreadcrumbItems = [
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
          <BarChartOutlined /> Project Progress
        </Link>
      ),
    },
    {
      title: (
        <>
          <FileOutlined /> Update Details
        </>
      ),
    },
  ];

  const clientBreadcrumbItems = [
    {
      title: (
        <Link to="/client/overview">
          <HomeOutlined />
        </Link>
      ),
    },
    {
      title: (
        <Link to="/client/project-updates">
          <BarChartOutlined /> Project Progress
        </Link>
      ),
    },
    {
      title: (
        <>
          <FileOutlined /> Update Details
        </>
      ),
    },
  ];

  return (
    <Card style={{ width: "100%", height: "100%" }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={
          userRole === "ADMIN" ? adminBreadcrumbItems : clientBreadcrumbItems
        }
      />

      <ProjectUpdateDetails id={id ? parseInt(id) : undefined} />
    </Card>
  );
};

export default ProjectUpdateDetailsPage;
