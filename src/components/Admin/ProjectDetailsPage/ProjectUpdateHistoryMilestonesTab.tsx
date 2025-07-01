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
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FlagOutlined,
  SyncOutlined,
  AppstoreOutlined,
  BarsOutlined,
  SearchOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { ApiPage } from "../../../types/project";
import { getProjectUpdateHistoryById } from "../../../api/projectUpdateHistoryApi";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const { Text, Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface ProjectUpdateHistoryMilestonesTabProps {
  historyId: string;
}

const getMilestoneStatusColor = (status: string | null): string => {
  if (!status) return "default";
  switch (status) {
    case "TODO":
      return "blue";
    case "DOING":
      return "processing";
    case "PENDING":
      return "warning";
    case "COMPLETED":
      return "success";
    default:
      return "default";
  }
};
const getMilestoneStatusIcon = (status: string | null) => {
  switch (status) {
    case "TODO":
      return <ClockCircleOutlined />;
    case "DOING":
      return <SyncOutlined spin />;
    case "PENDING":
      return <FileTextOutlined />;
    case "COMPLETED":
      return <CheckCircleOutlined />;
    default:
      return <FlagOutlined />;
  }
};
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return "#52c41a";
  if (percentage >= 70) return "#faad14";
  if (percentage >= 50) return "#1890ff";
  return "#ff4d4f";
};

const ProjectUpdateHistoryMilestonesTab: React.FC<
  ProjectUpdateHistoryMilestonesTabProps
> = ({ historyId }) => {
  const [milestonesPage, setMilestonesPage] = useState<ApiPage<any> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [uiPagination, setUiPagination] = useState({ current: 1, pageSize: 6 });

  const fetchMilestones = useCallback(async () => {
    if (!historyId) {
      setLoading(false);
      setMilestonesPage({
        content: [],
        pageable: {
          pageNumber: 0,
          pageSize: uiPagination.pageSize,
          offset: 0,
          paged: true,
          unpaged: false,
          sort: { sorted: false, unsorted: true, empty: true },
        },
        last: true,
        totalPages: 0,
        totalElements: 0,
        size: uiPagination.pageSize,
        number: 0,
        sort: { sorted: false, unsorted: true, empty: true },
        first: true,
        numberOfElements: 0,
        empty: true,
      } as ApiPage<any>);
      return;
    }
    setLoading(true);
    try {
      const res = await getProjectUpdateHistoryById(historyId);
      setMilestonesPage(res);
      setUiPagination({
        current: res.number + 1,
        pageSize: res.size,
      });
    } catch (error) {
      console.error(
        "Failed to fetch project update history milestones:",
        error
      );
      message.error("Failed to load milestones.");
      setMilestonesPage(null);
    } finally {
      setLoading(false);
    }
  }, [historyId, uiPagination.pageSize]);

  useEffect(() => {
    fetchMilestones();
    // eslint-disable-next-line
  }, [historyId, uiPagination.current, uiPagination.pageSize, fetchMilestones]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    setUiPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: newPageSize || prev.pageSize,
    }));
  };

  // Filter milestones based on search text and date range
  const filteredMilestones = milestonesPage?.content.filter(
    (milestone: any) => {
      const matchesSearch =
        !searchText ||
        (milestone.name &&
          milestone.name.toLowerCase().includes(searchText.toLowerCase())) ||
        (milestone.notes &&
          milestone.notes.toLowerCase().includes(searchText.toLowerCase()));
      const matchesDateRange =
        (!startDate && !endDate) ||
        (milestone.startDate &&
          (!startDate ||
            dayjs(milestone.startDate).isAfter(
              dayjs(startDate).subtract(1, "day")
            )) &&
          (!endDate ||
            dayjs(milestone.startDate).isBefore(dayjs(endDate).add(1, "day"))));
      return matchesSearch && matchesDateRange;
    }
  );
  const paginatedMilestones =
    filteredMilestones?.slice(
      (uiPagination.current - 1) * uiPagination.pageSize,
      uiPagination.current * uiPagination.pageSize
    ) || [];

  if (loading && !milestonesPage) {
    return (
      <Spin
        tip="Loading milestones..."
        style={{ display: "block", textAlign: "center", marginTop: 20 }}
      />
    );
  }
  if (!loading && (!milestonesPage || milestonesPage.content.length === 0)) {
    return (
      <div style={{ paddingTop: "10px" }}>
        <Empty description="No milestones found for this history." />
      </div>
    );
  }
  if (!milestonesPage) {
    return (
      <div style={{ paddingTop: "10px" }}>
        <Empty description="Could not load milestones." />
      </div>
    );
  }
  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {paginatedMilestones?.map((milestone: any) => (
        <Col xs={24} sm={24} md={12} lg={8} xl={8} key={milestone.id}>
          <Card
            hoverable
            style={{
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
              height: "100%",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <div style={{ marginBottom: "12px" }}>
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
                    />
                  </div>
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
                  </div>
                )}
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
          </Card>
        </Col>
      ))}
    </Row>
  );
  const renderListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={paginatedMilestones}
      renderItem={(milestone: any) => (
        <List.Item
          style={{
            background: "#fafafa",
            marginBottom: "12px",
            borderRadius: "8px",
            border: "1px solid #f0f0f0",
            padding: "16px",
          }}
        >
          <List.Item.Meta
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                  {milestone.name || "Untitled Milestone"}
                </Text>
                <Tag
                  icon={getMilestoneStatusIcon(milestone.status)}
                  color={getMilestoneStatusColor(milestone.status)}
                >
                  {milestone.status || "N/A"}
                </Tag>
              </div>
            }
            description={
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                {milestone.description && (
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {milestone.description}
                  </Text>
                )}
                <Row gutter={[16, 8]} align="middle">
                  {milestone.completionPercentage !== undefined &&
                    milestone.completionPercentage !== null && (
                      <Col span={8}>
                        <Space direction="vertical" size={2}>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Progress
                          </Text>
                          <Progress
                            percent={milestone.completionPercentage}
                            size="small"
                            strokeColor={getProgressColor(
                              milestone.completionPercentage
                            )}
                          />
                        </Space>
                      </Col>
                    )}
                  <Col span={16}>
                    <Space wrap>
                      {milestone.startDate && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
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
                            gap: "4px",
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
                            {new Date(
                              milestone.deadlineDate
                            ).toLocaleDateString()}
                          </Text>
                        </div>
                      )}
                      {milestone.completionDate && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <CheckCircleOutlined
                            style={{ color: "#52c41a", fontSize: "12px" }}
                          />
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Completed:{" "}
                            {new Date(
                              milestone.completionDate
                            ).toLocaleDateString()}
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Col>
                </Row>
                {milestone.notes && (
                  <Text
                    type="secondary"
                    style={{ fontSize: "12px", fontStyle: "italic" }}
                  >
                    <FileTextOutlined style={{ marginRight: "4px" }} />
                    {milestone.notes}
                  </Text>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ marginBottom: 24 }}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Space direction="vertical" size="small">
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                <FlagOutlined style={{ marginRight: 8 }} />
                Milestones (History)
              </Title>
              {milestonesPage && (
                <Space size="middle">
                  <Tag
                    color="blue"
                    style={{
                      borderRadius: 16,
                      fontSize: "14px",
                      padding: "5px 15px",
                    }}
                  >
                    <Text strong style={{ color: "#1890ff" }}>
                      {filteredMilestones?.length || 0} of{" "}
                      {milestonesPage.totalElements} milestones
                    </Text>
                  </Tag>
                </Space>
              )}
            </Space>
          </Col>
          <Col>
            <Button.Group>
              <Button
                type={viewMode === "grid" ? "primary" : "default"}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<BarsOutlined />}
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </Button.Group>
          </Col>
        </Row>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={24} md={8} lg={8}>
            <Search
              placeholder="Search by name or notes"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={24} md={10} lg={10}>
            <RangePicker
              allowClear
              onChange={(_, dateStrings) => {
                setStartDate(dateStrings[0] || undefined);
                setEndDate(dateStrings[1] || undefined);
                setUiPagination((prev) => ({ ...prev, current: 1 }));
              }}
              style={{ width: "100%" }}
              value={
                startDate && endDate
                  ? [dayjs(startDate), dayjs(endDate)]
                  : undefined
              }
              placeholder={["Start date", "End date"]}
            />
          </Col>
          <Col xs={24} sm={24} md={6} lg={6}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Tooltip title="Clear all filters">
                <Button
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                    setSearchText("");
                    setUiPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  disabled={!searchText && !startDate && !endDate}
                  style={{
                    color: "#ff4d4f",
                    borderColor: "#ff4d4f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "32px",
                    width: "32px",
                  }}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </div>
      {!loading && (!filteredMilestones || filteredMilestones.length === 0) ? (
        <Card style={{ textAlign: "center", backgroundColor: "#fafafa" }}>
          <Empty
            description={
              <span style={{ color: "#8c8c8c" }}>
                {searchText || startDate || endDate
                  ? "No milestones match your search criteria"
                  : "No milestones found for this history"}
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
      )}
      {filteredMilestones && (
        <Row justify="end" style={{ marginTop: 32 }}>
          <Pagination
            current={uiPagination.current}
            pageSize={uiPagination.pageSize}
            total={filteredMilestones.length}
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

export default ProjectUpdateHistoryMilestonesTab;
