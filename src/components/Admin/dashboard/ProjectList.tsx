import React, { useState, useEffect } from "react";
import { Table, Tag, Typography, message } from "antd";
import { Link } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import { filterProjects } from "../../../api/projectApi";
import { Project } from "../../../types/project";

const { Text } = Typography;

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchProjects = async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      const response = await filterProjects(
        {
          // Add any default criteria if needed
          name: undefined,
          status: undefined,
          startDate: undefined,
          endDate: undefined,
        },
        page,
        size
      );

      if (response.projects) {
        setProjects(response.projects);
        setTotalCount(response.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      message.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Status color mapping
  const statusColors: Record<string, string> = {
    NEW: "blue",
    PENDING: "orange",
    PROGRESS: "green",
    CLOSED: "gray",
  };

  const columns: ColumnsType<Project> = [
    {
      title: "Project Name",
      key: "name",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <Text type="secondary" className="text-sm">
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: "Type",
      key: "type",
      render: (_, record) => <Tag color="blue">{record.type}</Tag>,
    },
    {
      title: "Progress",
      key: "progress",
      render: (_, record) => (
        <div className="flex items-center">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${record.progress || 0}%` }}
            />
          </div>
          <span className="ml-2">{record.progress || 0}%</span>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        return (
          <Tag color={statusColors[record.status] || "default"}>
            {record.status}
          </Tag>
        );
      },
    },
    {
      title: "Deadline",
      key: "deadline",
      render: (_, record) => {
        const formatDate = (date: string) => {
          return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        };

        return (
          <div>
            <Text>{formatDate(record.plannedEndDate)}</Text>
            {record.actualEndDate && (
              <Text type="secondary" className="ml-2">
                (Actual: {formatDate(record.actualEndDate)})
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Link
          to={`/projects/${record.id}`}
          className="text-blue-600 hover:text-blue-700"
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={projects}
      loading={loading}
      rowKey="id"
      pagination={{
        current: currentPage + 1,
        pageSize: pageSize,
        total: totalCount,
        onChange: (page, size) => {
          setCurrentPage(page - 1);
          setPageSize(size);
        },
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} projects`,
      }}
      className="projects-table"
    />
  );
};

export default ProjectList;
