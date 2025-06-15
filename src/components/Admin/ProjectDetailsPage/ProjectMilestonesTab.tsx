import React, { useState, useEffect, useCallback } from "react";
import {
  Spin,
  Empty,
  Pagination,
  Tag,
  Typography,
  message,
  Row,
  Col,
  Space,
  Card,
  Progress,
  Badge,
  Divider,
  Tooltip,
  Button,
  List,
  Input,
  DatePicker,
  Select,
  Checkbox,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FlagOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { Milestone, MilestoneStatus } from "../../../types/milestone";
import { ApiPage } from "../../../types/project";
import { getProjectMilestonesOverviewApi } from "../../../api/projectApi";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface ProjectMilestonesTabProps {
  projectId: number;
}

// Hàm lấy màu cho status của milestone
const getMilestoneStatusColor = (status: MilestoneStatus | null): string => {
  if (!status) return "default";
  switch (status) {
    case "NEW":
      return "processing";
    case "SENT":
      return "warning";
    case "REVIEWED":
      return "success";
    default:
      return "default";
  }
};

// Hàm lấy icon cho status
const getMilestoneStatusIcon = (status: MilestoneStatus | null) => {
  switch (status) {
    case "NEW":
      return <ClockCircleOutlined />;
    case "SENT":
      return <FileTextOutlined />;
    case "REVIEWED":
      return <CheckCircleOutlined />;
    default:
      return <FlagOutlined />;
  }
};

// Hàm tính toán màu progress dựa trên completion percentage
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return "#52c41a"; // green
  if (percentage >= 70) return "#faad14"; // orange
  if (percentage >= 50) return "#1890ff"; // blue
  return "#ff4d4f"; // red
};

const ProjectMilestonesTab: React.FC<ProjectMilestonesTabProps> = ({
  projectId,
}) => {
  const [milestonesPage, setMilestonesPage] = useState<ApiPage<Milestone> | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [completionFilter, setCompletionFilter] = useState<boolean | undefined>(undefined);
  const [currentWeekFilter, setCurrentWeekFilter] = useState<boolean>(true);
  const [uiPagination, setUiPagination] = useState({ current: 1, pageSize: 6 });const fetchMilestones = useCallback(
    async (pageToFetch: number, currentSize: number) => {
      if (!projectId || projectId <= 0) {
        setLoading(false);
        setMilestonesPage({
          content: [],
          pageable: {
            pageNumber: 0,
            pageSize: currentSize,
            offset: 0,
            paged: true,
            unpaged: false,
            sort: { sorted: false, unsorted: true, empty: true },
          },
          last: true,
          totalPages: 0,
          totalElements: 0,
          size: currentSize,
          number: 0,
          sort: { sorted: false, unsorted: true, empty: true },
          first: true,
          numberOfElements: 0,
          empty: true,
        } as ApiPage<Milestone>);
        return;
      }
      setLoading(true);      try {
        const filterParams: Record<string, any> = {};
        
        if (searchText?.trim()) {
          filterParams.name = searchText.trim();
        }
        
        if (statusFilter) {
          filterParams.status = statusFilter;
        }
        
        if (completionFilter !== undefined) {
          filterParams.isCompleted = completionFilter;
        }
        
        if (currentWeekFilter) {
          filterParams.isCurrentWeek = true;
        }
        
        if (startDate) {
          filterParams.fromDate = startDate;
        }
        
        if (endDate) {
          filterParams.toDate = endDate;
        }

        const data = await getProjectMilestonesOverviewApi(
          projectId,
          pageToFetch,
          currentSize,
          [{ property: "startDate", direction: "asc" }],
          filterParams
        );
        
        setMilestonesPage(data);
        setUiPagination({
          current: data.number + 1,
          pageSize: data.size,
        });
      } catch (error) {
        console.error("Failed to fetch project milestones:", error);
        message.error("Failed to load milestones.");
        setMilestonesPage(null);
      } finally {
        setLoading(false);      }
    },
    [projectId, searchText, statusFilter, completionFilter, currentWeekFilter, startDate, endDate]
  );

  useEffect(() => {
    if (projectId && projectId > 0) {
      fetchMilestones(uiPagination.current - 1, uiPagination.pageSize);
    }
  }, [projectId, uiPagination.current, uiPagination.pageSize, fetchMilestones]);
  
  const handlePageChange = (page: number, newPageSize?: number) => {
    setUiPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: newPageSize || prev.pageSize,
    }));
  };
  useEffect(() => {
    setUiPagination((prev) => ({ ...prev, current: 1 }));
  }, [searchText, startDate, endDate, statusFilter, completionFilter, currentWeekFilter]);
  
  const handleViewModeChange = (newMode: "grid" | "list") => {
    setViewMode(newMode);
    const newPageSize = newMode === "grid" ? 6 : 10;
    setUiPagination((prev) => ({
      ...prev,
      current: 1,
      pageSize: newPageSize,
    }));
  };

  const paginatedMilestones = milestonesPage?.content || [];

  if (loading && !milestonesPage) {
    return (
      <Spin
        tip="Loading milestones..."
        style={{ display: "block", textAlign: "center", marginTop: 20 }}
      />
    );
  }

  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {paginatedMilestones?.map((milestone) => (        <Col xs={24} sm={24} md={12} lg={8} xl={8} key={milestone.id}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
              height: "100%",
            }}
            styles={{ body: { padding: '20px' } }}
            cover
          ><div style={{ marginBottom: "12px" }}>
              <Badge
                status={getMilestoneStatusColor(milestone.status) as any}
                text={
                  <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                    {milestone.name || "Untitled Milestone"}
                  </Text>
                }
              />
            </div>

            {milestone.description && (
              <div style={{ marginBottom: "16px" }}>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  {milestone.description}
                </Text>
              </div>
            )}

            <Divider style={{ margin: "12px 0" }} />

            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Tag
                  icon={getMilestoneStatusIcon(milestone.status)}
                  color={getMilestoneStatusColor(milestone.status)}
                  style={{ margin: 0 }}
                >
                  {milestone.status || "N/A"}
                </Tag>
              </div>

              {milestone.completionPercentage !== undefined &&
                milestone.completionPercentage !== null && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Progress
                      </Text>
                      <Text strong style={{ fontSize: "12px" }}>
                        {milestone.completionPercentage}%
                      </Text>
                    </div>
                    <Progress
                      percent={milestone.completionPercentage}
                      size="small"
                      strokeColor={getProgressColor(
                        milestone.completionPercentage
                      )}
                      showInfo={false}
                    />                  </div>
                )}

              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                {milestone.startDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <CalendarOutlined
                      style={{ color: "#52c41a", fontSize: "12px" }}
                    />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Start:{" "}
                      {new Date(milestone.startDate).toLocaleDateString()}
                    </Text>
                  </div>
                )}

                {milestone.deadlineDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <ClockCircleOutlined
                      style={{
                        color:
                          new Date(milestone.deadlineDate) < new Date()
                            ? "#ff4d4f"
                            : "#faad14",
                        fontSize: "12px",
                      }}
                    />
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "12px",
                        color:
                          new Date(milestone.deadlineDate) < new Date()
                            ? "#ff4d4f"
                            : undefined,
                      }}
                    >
                      Deadline:{" "}
                      {new Date(milestone.deadlineDate).toLocaleDateString()}
                    </Text>
                  </div>
                )}

                {milestone.completionDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ color: "#52c41a", fontSize: "12px" }}
                    />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Completed:{" "}
                      {new Date(milestone.completionDate).toLocaleDateString()}
                    </Text>
                  </div>                )}
              </Space>

              {milestone.notes && (
                <div style={{ marginTop: "8px" }}>
                  <Tooltip title={milestone.notes}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "12px",
                        fontStyle: "italic",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FileTextOutlined style={{ marginRight: "4px" }} />
                      {milestone.notes}
                    </Text>
                  </Tooltip>
                </div>
              )}
            </Space>
          </Card>        </Col>
      ))}
    </Row>
  );
  
  const renderListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={paginatedMilestones}
      renderItem={(milestone) => (
        <List.Item
          style={{
            background: "#fafafa",
            marginBottom: "8px",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            padding: "12px 16px",
          }}
        >
          <List.Item.Meta
            title={
              <Row justify="space-between" align="middle" style={{ marginBottom: "4px" }}>
                <Col flex="auto">
                  <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                    {milestone.name || "Untitled Milestone"}
                  </Text>
                </Col>
                <Col>
                  <Tag
                    icon={getMilestoneStatusIcon(milestone.status)}
                    color={getMilestoneStatusColor(milestone.status)}
                    style={{ margin: 0 }}
                  >
                    {milestone.status || "N/A"}
                  </Tag>
                </Col>
              </Row>
            }
            description={
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                {milestone.description && (
                  <Text type="secondary" style={{ fontSize: "14px", lineHeight: "1.4" }}>
                    {milestone.description}
                  </Text>
                )}

                <Row gutter={[12, 4]} align="middle">
                  {milestone.completionPercentage !== undefined &&
                    milestone.completionPercentage !== null && (
                      <Col xs={24} sm={8} md={6}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Text type="secondary" style={{ fontSize: "12px", minWidth: "50px" }}>
                            Progress:
                          </Text>
                          <Progress
                            percent={milestone.completionPercentage}
                            size="small"
                            strokeColor={getProgressColor(milestone.completionPercentage)}
                            style={{ flex: 1, minWidth: "60px" }}
                          />
                        </div>
                      </Col>
                    )}

                  <Col xs={24} sm={16} md={18}>
                    <Space wrap size={[12, 2]}>
                      {milestone.startDate && (
                        <Space size={4}>
                          <CalendarOutlined style={{ color: "#52c41a", fontSize: "12px" }} />
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Start: {new Date(milestone.startDate).toLocaleDateString()}
                          </Text>
                        </Space>
                      )}

                      {milestone.deadlineDate && (
                        <Space size={4}>
                          <ClockCircleOutlined
                            style={{
                              color: new Date(milestone.deadlineDate) < new Date() ? "#ff4d4f" : "#faad14",
                              fontSize: "12px",
                            }}
                          />
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "12px",
                              color: new Date(milestone.deadlineDate) < new Date() ? "#ff4d4f" : undefined,
                            }}
                          >
                            Deadline: {new Date(milestone.deadlineDate).toLocaleDateString()}
                          </Text>
                        </Space>
                      )}

                      {milestone.completionDate && (
                        <Space size={4}>
                          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "12px" }} />
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Completed: {new Date(milestone.completionDate).toLocaleDateString()}
                          </Text>
                        </Space>
                      )}

                      {milestone.notes && (
                        <Space size={4}>
                          <FileTextOutlined style={{ fontSize: "12px" }} />
                          <Text
                            type="secondary"
                            style={{ 
                              fontSize: "12px", 
                              fontStyle: "italic",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}
                            title={milestone.notes}
                          >
                            {milestone.notes}
                          </Text>
                        </Space>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
  return (    <div style={{ padding: "16px 0" }}>
      <div style={{ marginBottom: 24 }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            {" "}
            <Space direction="vertical" size="small">
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                <FlagOutlined style={{ marginRight: 8 }} />
                Milestones
              </Title>              {milestonesPage && (
                <Space size="middle">
                  {" "}
                  <Tag
                    color="blue"
                    style={{
                      borderRadius: 16,
                      fontSize: "14px",
                      padding: "5px 15px",
                    }}
                  >
                    <Text strong style={{ color: "#1890ff" }}>
                      {milestonesPage.totalElements} milestones
                    </Text>
                  </Tag>
                </Space>
              )}
            </Space>          </Col>
          <Col>
            <Button.Group>
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={() => handleViewModeChange("grid")}
              >
                Grid
              </Button>
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<BarsOutlined />}
                onClick={() => handleViewModeChange("list")}
              >
                List
              </Button>
            </Button.Group>
          </Col>        </Row>
        
        <Row gutter={[8, 8]} align="top">
          <Col xs={24} sm={12} md={8} lg={8}>
            <Search
              placeholder="Search by name..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
              size="small"
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Status"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              size="small"
              options={[
                { value: "NEW", label: "New" },
                { value: "SENT", label: "Sent" },
                { value: "REVIEWED", label: "Reviewed" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Select
              placeholder="Completion"
              allowClear
              value={completionFilter}
              onChange={setCompletionFilter}
              style={{ width: "100%" }}
              size="small"
              options={[
                { value: true, label: "Completed" },
                { value: false, label: "In Progress" },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4} lg={3}>
            <Checkbox
              checked={currentWeekFilter}
              onChange={(e) => setCurrentWeekFilter(e.target.checked)}
              style={{ fontSize: "12px", whiteSpace: "nowrap" }}
            >
              This Week
            </Checkbox>
          </Col>        </Row>
        
        <Row gutter={[8, 8]} align="middle" style={{ marginTop: 8 }}>
          <Col xs={24} sm={18} md={20} lg={22}>
            <RangePicker
              allowClear
              onChange={(_, dateStrings) => {
                setStartDate(dateStrings[0] || undefined);
                setEndDate(dateStrings[1] || undefined);
              }}
              style={{ width: "100%" }}
              size="small"
              value={
                startDate && endDate
                  ? [dayjs(startDate), dayjs(endDate)]
                  : undefined
              }
              placeholder={["From date", "To date"]}
            />
          </Col>
          <Col xs={24} sm={6} md={4} lg={2}>
            <Tooltip title="Clear all filters">
              <Button
                type="text"
                icon={<ClearOutlined />}                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                  setSearchText("");
                  setStatusFilter(undefined);
                  setCompletionFilter(undefined);                  setCurrentWeekFilter(true);
                }}
                disabled={!searchText && !startDate && !endDate && !statusFilter && completionFilter === undefined && currentWeekFilter}
                style={{
                  color: "#ff4d4f",
                  borderColor: "#ff4d4f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "24px",
                  width: "100%",
                }}
                size="small"
              />
            </Tooltip>
          </Col>        </Row>
      </div>
      
      {!loading && (!milestonesPage || !paginatedMilestones || paginatedMilestones.length === 0) ? (
        <Card style={{ textAlign: "center", backgroundColor: "#fafafa" }}>
          <Empty
            description={
              <span style={{ color: "#8c8c8c" }}>
                {!milestonesPage 
                  ? "Could not load milestones."
                  : (searchText || startDate || endDate || statusFilter || completionFilter !== undefined || !currentWeekFilter
                    ? "No milestones match your search criteria"
                    : "No milestones found for this project this week")
                }
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : viewMode === "grid" ? (
        renderGridView()
      ) : (
        renderListView()
      )}
      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" tip="Loading milestones..." />
        </div>
      )}{" "}
      {milestonesPage && milestonesPage.totalElements > uiPagination.pageSize && (
          <Row justify="center" style={{ marginTop: 32 }}>
            <Pagination
              current={uiPagination.current}
              pageSize={uiPagination.pageSize}
              total={milestonesPage.totalElements}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={
                viewMode === "grid"
                  ? ["6", "12", "24", "48"]
                  : ["5", "10", "20", "50"]
              }
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} milestones`
              }
              style={{
                padding: "16px",
                background: "#fafafa",
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
              }}
            />
          </Row>
        )}
    </div>
  );
};

export default ProjectMilestonesTab;
