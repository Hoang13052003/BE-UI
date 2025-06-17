import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Typography,
  Dropdown,
  DatePicker,
  Select,
  message,
  Popconfirm,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FileAddOutlined,
  FilterOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  ProjectUpdate,
  getAllProjectUpdatesApi,
  deleteProjectUpdateApi,
} from "../../../api/projectUpdateApi";
import { fetchProjects } from "../../../api/projectApi";
import AddProjectUpdateModal from "../../../components/Admin/ProjectUpdate/AddProjectUpdateModal";
import EditProjectUpdateModal from "../../../components/Admin/ProjectUpdate/EditProjectUpdateModal";
import dayjs from "dayjs";
import { Project, ApiPage } from "../../../types/project";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Helper function to get status color
const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    NEW: "cyan",
    SENT: "volcano",
    FEEDBACK: "green",
  };
  return statusMap[status] || "default";
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircleOutlined />;
    case "ON_TRACK":
    case "PROGRESS":
      return <ClockCircleOutlined />;
    case "SLIGHT_DELAY":
    case "SIGNIFICANT_DELAY":
    case "AT_RISK":
      return <ExclamationCircleOutlined />;
    default:
      return null;
  }
};

const getTypeColor = (type: string): string => {
  const typeMap: Record<string, string> = {
    LABOR: "blue",
    FIXED_PRICE: "green",
  };
  return typeMap[type] || "default";
};

const ProjectProgressList: React.FC = () => {
  const navigate = useNavigate();
  const [updatesPage, setUpdatesPage] = useState<ApiPage<ProjectUpdate> | null>(
    null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [currentUpdate, setCurrentUpdate] = useState<ProjectUpdate | null>(
    null
  );

  const [tablePagination, setTablePagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch project updates
  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (selectedProject) {
        filters["projectId.equals"] = selectedProject;
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters["startDate.greaterThanOrEqual"] =
          dateRange[0].format("YYYY-MM-DD");
        filters["endDate.lessThanOrEqual"] = dateRange[1].format("YYYY-MM-DD");
      }
      if (searchText) {
        filters["search.contains"] = searchText;
      }
      if (statusFilter) {
        filters["status.equals"] = statusFilter;
      }
      // Debug: log filters to check what is sent
      console.log("Filters sent to API:", filters);

      const resultPage = await getAllProjectUpdatesApi(
        tablePagination.current - 1,
        tablePagination.pageSize,
        { property: "updateDate", direction: "desc" },
        filters
      );

      setUpdatesPage(resultPage);

      setTablePagination((prev) => ({
        ...prev,
        total: resultPage.totalElements,
        current: resultPage.number + 1,
        pageSize: resultPage.size,
      }));
    } catch (error) {
      console.error("Failed to fetch project updates:", error);
      message.error("Failed to load project updates");
      setUpdatesPage(null);
    } finally {
      setLoading(false);
    }
  }, [
    selectedProject,
    dateRange,
    searchText,
    statusFilter,
    tablePagination.current,
    tablePagination.pageSize,
  ]);

  // Fetch projects for dropdown
  const fetchProjectsList = useCallback(async () => {
    try {
      const { projects: projectList } = await fetchProjects(0, 1000); // Get all projects
      setProjects(projectList);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      message.error("Failed to load projects list");
    }
  }, []);

  useEffect(() => {
    fetchProjectsList();
  }, [fetchProjectsList]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  // Handle table pagination change
  const handleTableChange = (paginationConfig: any) => {
    setTablePagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  // Handle delete update
  const handleDeleteUpdate = async (updateId: number) => {
    try {
      await deleteProjectUpdateApi(updateId);
      message.success("Update deleted successfully");
      fetchUpdates();
    } catch (error) {
      console.error("Failed to delete update:", error);
      message.error("Failed to delete update");
    }
  };

  // Handle edit update
  const handleEditUpdate = (update: ProjectUpdate) => {
    setCurrentUpdate(update);
    setIsEditModalVisible(true);
  };

  // Define table columns
  const columns = [
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      render: (text: string, record: ProjectUpdate) => (
        <Space direction="vertical" size={0}>
          <Button
            color="default"
            variant="link"
            onClick={() =>
              navigate(`/admin/attachment-display/${record.projectId}`)
            }
            style={{ padding: 0, height: "auto", fontWeight: "bold" }}
          >
            {text.length > 20 ? `${text.substring(0, 20)}...` : text}
          </Button>
          <Text
            type="secondary"
            style={{
              fontSize: "12px",
            }}
          >
            <Tag color={getTypeColor(record.projectType)}>
              {record.projectType || "N/A"}
            </Tag>
          </Text>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "updateDate",
      key: "updateDate",
      render: (date: string) => <Text>{dayjs(date).format("YYYY-MM-DD")}</Text>,
    },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "statusAtUpdate",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace(/_/g, " ")}
        </Tag>
      ),
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
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ProjectUpdate) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                icon: <EditOutlined />,
                label: "Edit",
                onClick: () => handleEditUpdate(record),
              },
              {
                key: "view",
                icon: <EyeOutlined />,
                label: "View Details",
                onClick: () => navigate(`/admin/project-updates/${record.id}`),
              },
              {
                type: "divider",
              },
              {
                key: "delete",
                danger: true,
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title="Are you sure you want to delete this update?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteUpdate(record.id);
                    }}
                    onCancel={(e) => {
                      e?.stopPropagation();
                    }}
                    okText="Yes"
                    cancelText="No"
                    placement="left"
                  >
                    <span style={{ display: "block", width: "100%" }}>
                      Delete
                    </span>
                  </Popconfirm>
                ),
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                },
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Reset filters
  const handleResetFilters = () => {
    setSelectedProject(null);
    setDateRange(null);
    setSearchText("");
    setStatusFilter(null);
    setTablePagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <Card style={{ width: "100%" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>Project Progress Management</Title>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Add Update
            </Button>{" "}
            <Dropdown
              menu={{
                items: [
                  {
                    key: "excel",
                    icon: <FileExcelOutlined />,
                    label: "Export to Excel",
                  },
                  {
                    key: "pdf",
                    icon: <FilePdfOutlined />,
                    label: "Export to PDF",
                  },
                ],
              }}
            >
              <Button>
                Export <FilterOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Input
            placeholder="Search by summary or details"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={() => fetchUpdates()}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Select
            placeholder="Select Project"
            style={{ width: "100%" }}
            allowClear
            showSearch
            optionFilterProp="children"
            value={selectedProject}
            onChange={(value) => setSelectedProject(value)}
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {projects.map((project) => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <RangePicker
            style={{ width: "100%" }}
            value={dateRange}
            onChange={(dates) =>
              setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])
            }
            format="YYYY-MM-DD"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Space>
            <Select
              placeholder="Status"
              style={{ width: "150px" }}
              allowClear
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="NEW">New</Option>
              <Option value="SENT">Sent</Option>
              <Option value="FEEDBACK">Feedback</Option>
            </Select>
            <Tooltip title="Reset Filters">
              <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
                Reset
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      {/* Updates Table */}
      <Table
        columns={columns}
        dataSource={updatesPage?.content || []}
        rowKey="id"
        loading={loading}
        pagination={{
          current: tablePagination.current,
          pageSize: tablePagination.pageSize,
          total: tablePagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} updates`,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        onChange={handleTableChange}
      />

      {/* Add Update Modal */}
      <AddProjectUpdateModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={() => {
          setIsAddModalVisible(false);
          fetchUpdates();
        }}
        projects={projects}
      />

      {/* Edit Update Modal */}
      {currentUpdate && (
        <EditProjectUpdateModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSuccess={() => {
            setIsEditModalVisible(false);
            fetchUpdates();
          }}
          updateData={currentUpdate}
          projects={projects}
        />
      )}
    </Card>
  );
};

export default ProjectProgressList;
