// File: src/components/Admin/ProjectDetailsPage/ProjectTimeLogsTab.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  List,
  Spin,
  Empty,
  Pagination,
  Typography,
  message,
  Row,
  Col,
  Tag,
  Space,
  Avatar,
  Card,
  Input,
  DatePicker,
  Button,
  Tooltip,
  Radio,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ClearOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { ProjectContextTimeLog, ApiPage } from "../../../types/project";
import { getProjectTimeLogsListApi } from "../../../api/projectApi";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
const { Text, Paragraph, Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface ProjectTimeLogsTabProps {
  projectId: number;
}

const ProjectTimeLogsTab: React.FC<ProjectTimeLogsTabProps> = ({
  projectId,
}) => {
  const [timeLogsPage, setTimeLogsPage] =
    useState<ApiPage<ProjectContextTimeLog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [uiPagination, setUiPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchTimeLogs = useCallback(
    async (pageToFetch: number, currentSize: number) => {
      if (!projectId || projectId <= 0) {
        setLoading(false);
        setTimeLogsPage({
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
        } as ApiPage<ProjectContextTimeLog>);
        return;
      }
      setLoading(true);
      try {
        const data = await getProjectTimeLogsListApi(
          projectId,
          pageToFetch,
          currentSize,
          [{ property: "taskDate", direction: "desc" }],
          startDate,
          endDate
        );
        console.log(
          "ProjectTimeLogsTab - API Response Data:",
          JSON.stringify(data, null, 2)
        );
        setTimeLogsPage(data);
        setUiPagination({
          current: data.number + 1,
          pageSize: data.size,
        });
      } catch (error) {
        console.error("Failed to fetch project time logs:", error);
        message.error("Failed to load time logs.");
        setTimeLogsPage(null);
      } finally {
        setLoading(false);
      }
    },
    [projectId, startDate, endDate]
  );

  useEffect(() => {
    if (projectId && projectId > 0) {
      fetchTimeLogs(uiPagination.current - 1, uiPagination.pageSize);
    }
  }, [
    projectId,
    uiPagination.current,
    uiPagination.pageSize,
    startDate,
    endDate,
    fetchTimeLogs,
  ]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    setUiPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: newPageSize || prev.pageSize,
    }));
  };

  const filteredTimeLogs = timeLogsPage?.content.filter(
    (timelog) =>
      timelog.performer.fullName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      timelog.taskDescription.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours === Math.floor(hours)) {
      return `${hours}h`;
    } else {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return `${h}h ${m}m`;
    }
  };
  // Calculate total hours from filtered data
  const totalHours =
    filteredTimeLogs?.reduce((sum, timelog) => sum + timelog.hoursSpent, 0) ||
    0;
  // Grid Card Component
  const TimeLogGridCard: React.FC<{ timelog: ProjectContextTimeLog }> = ({
    timelog,
  }) => (
    <Card
      hoverable
      style={{
        height: "280px",
        borderRadius: 12,
        border: "1px solid #f0f0f0",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
      }}
      styles={{ body: { padding: "20px", flex: 1, display: "flex", flexDirection: "column", } }}
    >
      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%", flex: 1 }}
      >
        {/* User Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={52}
            style={{
              backgroundColor: "#1890ff",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            {timelog.performer.fullName &&
            timelog.performer.fullName.trim() !== "" ? (
              (timelog.performer.fullName.includes(" ")
                ? timelog.performer.fullName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .substring(0, 2)
                : timelog.performer.fullName.substring(0, 2)
              ).toUpperCase()
            ) : (
              <UserOutlined />
            )}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              strong
              style={{ display: "block", fontSize: "16px", marginBottom: 2 }}
            >
              {timelog.performer.fullName}
            </Text>
            <Text type="secondary" style={{ fontSize: "13px" }} ellipsis>
              {timelog.performer.email}
            </Text>
          </div>
        </div>

        {/* Date and Duration Tags */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag
            icon={<CalendarOutlined />}
            color="green"
            style={{ borderRadius: 16, fontSize: "12px" }}
          >
            {dayjs(timelog.taskDate).format("MMM DD, YYYY")}
          </Tag>
          <Tag
            icon={<ClockCircleOutlined />}
            color="blue"
            style={{ borderRadius: 16, fontSize: "12px" }}
          >
            {formatDuration(timelog.hoursSpent)}
          </Tag>
        </div>

        {/* Description */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Paragraph
            ellipsis={{ rows: 3, expandable: true, symbol: "Show more" }}
            style={{
              margin: 0,
              color: "#262626",
              lineHeight: "1.5",
              fontSize: "14px",
              flex: 1,
            }}
          >
            {timelog.taskDescription}
          </Paragraph>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            paddingTop: 12,
            marginTop: "auto",
          }}
        >
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Logged {dayjs(timelog.taskDate).fromNow()}
          </Text>
        </div>
      </Space>
    </Card>
  );

  if (loading && !timeLogsPage) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Spin size="large" tip="Loading time logs..." />
      </div>
    );
  }
  return (
    <div style={{ padding: "20px 0" }}>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        {/* Title and Stats Row */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Space direction="vertical" size="small">
              <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Time Logs
              </Title>
              {timeLogsPage && (
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
                      {timeLogsPage.totalElements} entries
                    </Text>
                  </Tag>
                  <Tag
                    color="green"
                    style={{
                      borderRadius: 16,
                      fontSize: "14px",
                      padding: "5px 15px",
                    }}
                  >
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    <Text strong style={{ color: "#52c41a" }}>
                      {formatDuration(totalHours)} total
                    </Text>
                  </Tag>
                </Space>
              )}
            </Space>
          </Col>
          <Col>
            {/* View Mode Toggle */}
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <Radio.Button value="list">
                <UnorderedListOutlined /> List
              </Radio.Button>
              <Radio.Button value="grid">
                <AppstoreOutlined /> Grid
              </Radio.Button>
            </Radio.Group>
          </Col>
        </Row>

        {/* Controls Row */}
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={24} md={8} lg={8}>
            <Search
              placeholder="Search by name or description"
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
              {/* Uncomment if you have add functionality */}
              {/* 
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTimeLog}>
                Add Time Log
              </Button> 
              */}
            </Space>
          </Col>
        </Row>
      </div>
      {!loading && (!timeLogsPage || timeLogsPage.content.length === 0) ? (
        <Card style={{ textAlign: "center", backgroundColor: "#fafafa" }}>
          <Empty
            description={
              <span style={{ color: "#8c8c8c" }}>
                No time logs found for this project
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : viewMode === "grid" /* Grid View */ ? (
        <Row gutter={[20, 20]}>
          {filteredTimeLogs?.map((timelog) => (
            <Col xs={24} sm={12} md={8} lg={6} key={timelog.id}>
              <TimeLogGridCard timelog={timelog} />
            </Col>
          ))}
        </Row>
      ) : (
        /* List View */
        <List
          itemLayout="vertical"
          dataSource={filteredTimeLogs}
          loading={loading}
          renderItem={(timelog) => {
            if (!timelog) return null;
            return (
              <Card
                key={timelog.id}
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.3s ease",
                }}
                hoverable
                styles={{ body: { padding: "20px" } }}
              >
                <List.Item style={{ border: "none", padding: 0 }}>
                  <Row gutter={[16, 16]} align="top">
                    {/* User Info Column */}
                    <Col xs={24} sm={6} md={6}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Avatar
                            size={40} // Prop này cũng giúp đặt line-height và font-size phù hợp
                            style={{
                              backgroundColor: "#1890ff",
                              width: "40px", // Đặt chiều rộng tường minh
                              height: "40px", // Đặt chiều cao tường minh
                              borderRadius: "50%", // Đảm bảo bo tròn thành hình tròn
                              display: "flex", // Sử dụng flex để căn giữa nội dung bên trong
                              alignItems: "center", // Căn giữa theo chiều dọc
                              justifyContent: "center", // Căn giữa theo chiều ngang
                              overflow: "hidden", // Ẩn phần nội dung tràn ra ngoài (nếu có)
                              flexShrink: 0, // Ngăn Avatar bị co lại trong layout flex
                            }}
                            // src={timelog.performer.avatarUrl} // Bỏ comment và thay thế nếu bạn có URL ảnh đại diện
                          >
                            {
                              timelog.performer.fullName &&
                              timelog.performer.fullName.trim() !== "" ? (
                                (timelog.performer.fullName.includes(" ")
                                  ? timelog.performer.fullName
                                      .split(" ")
                                      .map((name) => name[0])
                                      .join("")
                                      .substring(0, 2) // Lấy 2 chữ cái đầu nếu có nhiều từ
                                  : timelog.performer.fullName.substring(0, 2)
                                ) // Lấy 2 chữ cái đầu nếu chỉ có một từ
                                  .toUpperCase()
                              ) : (
                                <UserOutlined />
                              ) /* Icon dự phòng nếu không có tên */
                            }
                          </Avatar>
                          <div>
                            <Text
                              strong
                              style={{ display: "block", fontSize: "15px" }}
                            >
                              {timelog.performer.fullName}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "13px" }}>
                              {timelog.performer.email}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </Col>

                    {/* Content Column */}
                    <Col xs={24} sm={12} md={14}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 8,
                          }}
                        >
                          <Tag
                            icon={<CalendarOutlined />}
                            color="green"
                            style={{ margin: 0 }}
                          >
                            {dayjs(timelog.taskDate).format("MMM DD, YYYY")}
                          </Tag>
                          <Tag
                            icon={<ClockCircleOutlined />}
                            color="blue"
                            style={{ margin: 0 }}
                          >
                            {formatDuration(timelog.hoursSpent)}
                          </Tag>
                        </div>
                        <Paragraph
                          ellipsis={{
                            rows: 2,
                            expandable: true,
                            symbol: "Show more",
                          }}
                          style={{
                            margin: 0,
                            color: "#262626",
                            lineHeight: "1.5",
                          }}
                        >
                          {timelog.taskDescription}
                        </Paragraph>
                      </Space>
                    </Col>

                    {/* Actions Column */}
                    <Col xs={24} sm={6} md={4}>
                      <div style={{ textAlign: "right" }}>
                        <Space direction="vertical" size="small">
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Logged {dayjs(timelog.taskDate).fromNow()}
                          </Text>
                          {/* Uncomment if you have edit/delete functionality */}
                          {/* 
                          <Space size="small">
                            <Tooltip title="Edit time log">
                              <Button 
                                type="text" 
                                size="small" 
                                icon={<EditOutlined />}
                                onClick={() => handleEditTimeLog(timelog)}
                              />
                            </Tooltip>
                            <Popconfirm 
                              title="Delete this time log?" 
                              onConfirm={() => handleDeleteTimeLog(timelog.id)}
                            >
                              <Tooltip title="Delete time log">
                                <Button 
                                  type="text" 
                                  size="small" 
                                  danger 
                                  icon={<DeleteOutlined />}
                                />
                              </Tooltip>
                            </Popconfirm>
                          </Space>
                          */}
                        </Space>
                      </div>
                    </Col>
                  </Row>
                </List.Item>
              </Card>
            );
          }}
        />
      )}

      {/* Pagination */}
      {timeLogsPage && timeLogsPage.totalElements > uiPagination.pageSize && (
        <Card style={{ marginTop: 24, textAlign: "center" }}>
          <Pagination
            current={uiPagination.current}
            pageSize={uiPagination.pageSize}
            total={timeLogsPage.totalElements}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={["10", "20", "50", "100"]}
            showTotal={(total, range) => (
              <Text type="secondary">
                Showing {range[0]}-{range[1]} of {total} time logs
              </Text>
            )}
            style={{ margin: 0 }}
          />
        </Card>
      )}
    </div>
  );
};

export default ProjectTimeLogsTab;
