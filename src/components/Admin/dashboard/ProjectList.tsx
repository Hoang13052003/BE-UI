import React, { useState, useEffect } from "react";
import { Table, Tag, Typography, message, List, Card, Grid } from "antd";
import { Link } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import { filterProjects } from "../../../api/projectApi";
import { Project } from "../../../types/project";
import { useTranslation } from "react-i18next";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const screens = useBreakpoint();
  const { t } = useTranslation();

  const fetchProjects = async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      const response = await filterProjects(
        {
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
      message.error(t("messages.fetchProjectsError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage, pageSize);
  }, [currentPage, pageSize]);

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
      title: "Overall Process",
      key: "progress",
      render: (_, record) => (
        <div className="flex items-center">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${record.overallProcess || 0}%` }}
            />
          </div>
          <span className="ml-2">{record.overallProcess || 0}%</span>
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
          to={`/admin/projects/${record.id}/details`}
          className="text-blue-600 hover:text-blue-700"
        >
          View Details
        </Link>
      ),
    },
  ];

  // Responsive: Table for md+ screens, List for sm and below
  if (!screens.md) {
    // Mobile/List/Card view
    return (
      <List
        loading={loading}
        dataSource={projects}
        pagination={{
          current: currentPage + 1,
          pageSize: pageSize,
          total: totalCount,
          onChange: (page, size) => {
            setCurrentPage(page - 1);
            setPageSize(size || 10);
          },
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} projects`,
        }}
        renderItem={(item) => (
          <Card
            key={item.id}
            style={{
              marginBottom: 20,
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid #f0f0f0",
              padding: 16,
            }}
            bodyStyle={{ padding: 0 }}
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    wordBreak: "break-word",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {item.name}
                </span>
                <Tag
                  color={statusColors[item.status] || "default"}
                  style={{ fontWeight: 500, whiteSpace: "nowrap" }}
                >
                  {item.status}
                </Tag>
              </div>
            }
          >
            <div style={{ marginBottom: 12, color: "#595959", fontSize: 14 }}>
              <Text type="secondary">{item.description}</Text>
            </div>
            <div
              style={{
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <b>Type:</b>{" "}
              <Tag color="blue" style={{ fontWeight: 500 }}>
                {item.type}
              </Tag>
            </div>
            <div style={{ marginBottom: 12 }}>
              <b>Progress:</b>{" "}
              <span style={{ fontWeight: 500 }}>
                {item.overallProcess || 0}%
              </span>
              <div
                className="progress-bar-container"
                style={{
                  background: "#f0f0f0",
                  borderRadius: 4,
                  height: 8,
                  marginTop: 6,
                  marginBottom: 2,
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${item.overallProcess || 0}%`,
                    background: "#1890ff",
                    height: 8,
                    borderRadius: 4,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <b>Deadline:</b>{" "}
              <span style={{ fontWeight: 500 }}>
                {new Date(item.plannedEndDate).toLocaleDateString("en-GB")}
              </span>
              {item.actualEndDate && (
                <Text type="secondary" className="ml-2">
                  (Actual:{" "}
                  {new Date(item.actualEndDate).toLocaleDateString("en-GB")})
                </Text>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <Link
                to={`/admin/projects/${item.id}/details`}
                style={{ color: "#9254de", fontWeight: 500, fontSize: 14 }}
              >
                View Details
              </Link>
            </div>
          </Card>
        )}
      />
    );
  }

  // Desktop/Table view
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
