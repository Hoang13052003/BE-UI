import React, { useEffect, useState } from "react";
import { Card, Table, Row, Col, Input, Typography, Tag, List } from "antd";
import {
  getProjectUpdatesForUserApi,
  ProjectUpdate,
} from "../../api/projectUpdateApi";
import { fetchProjects } from "../../api/projectApi";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";

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

  const screens = useBreakpoint();
  const isMobile = !screens.md;

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
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1 when search/filter
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
    <Card style={{ height: "100%" }}>
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 24, flexWrap: "wrap" }}
      >
        <Col xs={24} sm={24} md={12}>
          <Title level={4} style={{ marginBottom: isMobile ? 12 : 0 }}>
            Project Updates
          </Title>
        </Col>
        <Col xs={24} sm={24} md={8} style={{ marginTop: isMobile ? 8 : 0 }}>
          <Input.Search
            placeholder="Search summary..."
            allowClear
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSearch(e.target.value);
            }}
            style={{ width: "100%" }}
            size={isMobile ? "middle" : "large"}
          />
        </Col>
      </Row>
      {isMobile ? (
        <List
          dataSource={updates}
          loading={loading}
          renderItem={(item) => (
            <Card
              key={item.id}
              style={{ marginBottom: 16, cursor: "pointer" }}
              onClick={() =>
                (window.location.href = `/client/project-updates/${item.id}`)
              }
              bodyStyle={{ padding: 16 }}
            >
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Text strong>{item.projectName}</Text>
                  <Tag
                    style={{ marginLeft: 8 }}
                    color={
                      {
                        NEW: "blue",
                        SENT: "orange",
                        FEEDBACK: "green",
                      }[item.statusAtUpdate] || "default"
                    }
                  >
                    {item.statusAtUpdate}
                  </Tag>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Update Date: </Text>
                  <Text>{dayjs(item.updateDate).format("DD/MM/YYYY")}</Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Summary: </Text>
                  <Text>{item.summary}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Overall Progress: </Text>
                  <Text>{item.overallProcess}%</Text>
                  <div style={{ width: "100%", marginTop: 4 }}>
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        background: "#f0f0f0",
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          width: `${item.overallProcess ?? 0}%`,
                          height: "100%",
                          background:
                            (item.overallProcess ?? 0) >= 100
                              ? "#52c41a"
                              : "#1890ff",
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Actual Progress: </Text>
                  <Text>{item.actualProcess}%</Text>
                  <div style={{ width: "100%", marginTop: 4 }}>
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        background: "#f0f0f0",
                        borderRadius: 4,
                      }}
                    >
                      <div
                        style={{
                          width: `${item.actualProcess ?? 0}%`,
                          height: "100%",
                          background:
                            (item.actualProcess ?? 0) >= 100
                              ? "#52c41a"
                              : "#1890ff",
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )}
        />
      ) : (
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
      )}
    </Card>
  );
};

export default ProjectUpdatesForClientPage;
