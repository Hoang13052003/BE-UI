import React, { useEffect, useState } from "react";
import { Card, Table, Row, Col, Input, Typography, Tag } from "antd";
import {
  getProjectUpdatesForUserApi,
  ProjectUpdate,
} from "../../api/projectUpdateApi";
import { fetchProjects } from "../../api/projectApi";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ProjectUpdatesForClientPage: React.FC = () => {
  const { userDetails } = useAuth();
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [_projects, setProjects] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedProject, _setSelectedProject] = useState<string | undefined>(
    undefined
  );
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchUserProjects = async () => {
      setLoading(true);
      try {
        const res = await fetchProjects(0, 100);
        const filtered = res.projects.filter((p: any) =>
          p.members?.some((m: any) => m.id === userDetails?.id)
        );
        setProjects(filtered);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    if (userDetails?.id) fetchUserProjects();
  }, [userDetails]);

  const fetchUpdates = async (
    page = 1,
    pageSize = 10,
    projectId?: string,
    searchText?: string
  ) => {
    setLoading(true);
    try {
      const filters: any = {};
      if (projectId) filters["projectId.equals"] = projectId;
      if (searchText) filters["summary.contains"] = searchText;
      const res = await getProjectUpdatesForUserApi(
        userDetails!.id,
        page - 1,
        pageSize,
        filters
      );
      setUpdates(res.content);
      console.log("Project updates:", JSON.stringify(res.content));
      setPagination({ current: page, pageSize, total: res.totalElements });
    } catch {
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userDetails?.id)
      fetchUpdates(1, pagination.pageSize, selectedProject, search);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi search/filter
  }, [selectedProject, search, userDetails]);

  const columns = [
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      render: (projectName: string) => <span>{projectName}</span>,
    },
    {
      title: "Update Date",
      dataIndex: "updateDate",
      key: "updateDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "statusAtUpdate",
      key: "statusAtUpdate",
      render: (status: string) => {
        const color =
          {
            NEW: "blue",
            SENT: "orange",
            FEEDBACK: "green",
          }[status] || "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Overall Progress",
      dataIndex: "overallProcess",
      key: "overallProcess",
      render: (percentage: number) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "50px",
              height: "8px",
              background: "#f0f0f0",
              borderRadius: "4px",
              marginRight: "8px",
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                background: percentage >= 100 ? "#52c41a" : "#1890ff",
                borderRadius: "4px",
              }}
            />
          </div>
          <Text>{percentage}%</Text>
        </div>
      ),
    },
    {
      title: "Actual Progress",
      dataIndex: "actualProcess",
      key: "actualProcess",
      render: (percentage: number) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "50px",
              height: "8px",
              background: "#f0f0f0",
              borderRadius: "4px",
              marginRight: "8px",
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                background: percentage >= 100 ? "#52c41a" : "#1890ff",
                borderRadius: "4px",
              }}
            />
          </div>
          <Text>{percentage}%</Text>
        </div>
      ),
    },
  ];

  return (
    <Card
      style={{
        height: "100%",
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4}>Project Updates</Title>
        </Col>
        <Col span={8}>
          <Input.Search
            placeholder="Search summary..."
            allowClear
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearch(e.target.value); // Search realtime khi thay đổi input
            }}
            style={{ width: "100%" }}
          />
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={updates}
        rowKey="id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => {
            window.location.href = `/client/project-updates/${record.id}`;
          },
          style: { cursor: "pointer" },
        })}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) =>
            fetchUpdates(page, pageSize, selectedProject, search),
        }}
      />
    </Card>
  );
};

export default ProjectUpdatesForClientPage;
