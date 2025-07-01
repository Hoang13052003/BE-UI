// File: src/components/Admin/ProjectDetailsPage/ProjectUpdatesTab.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Spin,
  Empty,
  Typography,
  Tag,
  Avatar,
  Popover,
  Progress,
  Space,
  message,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import {
  ProjectUpdateTimelineItem,
  UserSummary,
  ApiPage,
} from "../../../types/project";
import { getProjectUpdatesTimelineApi } from "../../../api/projectApi";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

const { Title, Text, Paragraph } = Typography;

interface ProjectUpdatesTabProps {
  projectId: number;
  theme?: string;
}

const getUpdateStatusStyle = (
  status: string | null | undefined,
  theme?: string
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    fontWeight: 500,
    fontSize: "0.85em",
  };
  if (!status)
    return { ...baseStyle, color: theme === "dark" ? "#a0a0a0" : "#8c8c8c" };

  switch (status.toUpperCase()) {
    case "ON_TRACK":
      return { ...baseStyle, color: theme === "dark" ? "#73d13d" : "#389e0d" };
    case "COMPLETED":
      return { ...baseStyle, color: theme === "dark" ? "#69c0ff" : "#0958d9" };
    case "AT_RISK":
      return { ...baseStyle, color: theme === "dark" ? "#ffc53d" : "#d48806" };
    case "OFF_TRACK":
      return { ...baseStyle, color: theme === "dark" ? "#ff7875" : "#cf1322" };
    case "CLOSED":
      return { ...baseStyle, color: theme === "dark" ? "#b37feb" : "#531dab" };
    default:
      return { ...baseStyle, color: theme === "dark" ? "#a0a0a0" : "#8c8c8c" };
  }
};

const renderUser = (user: UserSummary | null | undefined, theme?: string) => {
  if (!user)
    return (
      <Tag icon={<UserOutlined />} style={{ cursor: "default" }}>
        Unknown User
      </Tag>
    );
  const userInitial = user.fullName ? (
    user.fullName.charAt(0).toUpperCase()
  ) : (
    <UserOutlined />
  );
  return (
    <Popover
      content={
        <Space direction="vertical" size="small">
          <Text style={{ fontSize: "0.8em" }}>Email: {user.email}</Text>
          <Text style={{ fontSize: "0.8em" }}>User ID: {user.id}</Text>
        </Space>
      }
      title={<Text strong>Updated by</Text>}
      trigger="hover"
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 8px",
          borderRadius: "6px",
          background:
            theme === "dark"
              ? "rgba(24, 144, 255, 0.15)"
              : "rgba(24, 144, 255, 0.1)",
          border: `1px solid ${
            theme === "dark"
              ? "rgba(24, 144, 255, 0.3)"
              : "rgba(24, 144, 255, 0.2)"
          }`,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <Avatar
          size="small"
          style={{
            backgroundColor: "#1677ff",
            marginRight: 6,
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {userInitial}
        </Avatar>
        <Text
          style={{
            color:
              theme === "dark" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          {user.fullName}
        </Text>
      </div>
    </Popover>
  );
};

const ProjectUpdatesTab: React.FC<ProjectUpdatesTabProps> = ({
  projectId,
  theme,
}) => {
  const [updatesPage, setUpdatesPage] =
    useState<ApiPage<ProjectUpdateTimelineItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [allUpdatesLoaded, setAllUpdatesLoaded] = useState(false);

  const fetchUpdates = useCallback(
    async (pageToFetch: number, currentSize: number, append = false) => {
      if (!projectId || projectId <= 0) {
        setLoading(false);
        setUpdatesPage({
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
        } as ApiPage<ProjectUpdateTimelineItem>);
        setAllUpdatesLoaded(true);
        return;
      }
      setLoading(true);
      try {
        const data = await getProjectUpdatesTimelineApi(
          projectId,
          pageToFetch,
          currentSize,
          [{ property: "updateDate", direction: "desc" }]
        );

        console.log(
          "ProjectUpdatesTab - API Response Data:",
          JSON.stringify(data, null, 2)
        );

        if (append && updatesPage && updatesPage.content) {
          setUpdatesPage((prevPage) => {
            if (!prevPage) return data;
            return {
              ...data,
              content: [...prevPage.content, ...data.content],
            };
          });
        } else {
          setUpdatesPage(data);
        }

        if (data.last || (data.content.length === 0 && pageToFetch > 0)) {
          setAllUpdatesLoaded(true);
        } else {
          setAllUpdatesLoaded(false);
        }
      } catch (error) {
        console.error("Failed to fetch project updates:", error);
        message.error("Failed to load project updates.");
        setUpdatesPage(null);
        setAllUpdatesLoaded(true);
      } finally {
        setLoading(false);
      }
    },
    [projectId, updatesPage]
  );

  useEffect(() => {
    setUpdatesPage(null);
    setCurrentPage(0);
    setAllUpdatesLoaded(false);
    if (projectId && projectId > 0) {
      fetchUpdates(0, pageSize, false);
    } else {
      setLoading(false);
      setUpdatesPage({
        content: [],
        pageable: {
          pageNumber: 0,
          pageSize: pageSize,
          offset: 0,
          paged: true,
          unpaged: false,
          sort: { sorted: false, unsorted: true, empty: true },
        },
        last: true,
        totalPages: 0,
        totalElements: 0,
        size: pageSize,
        number: 0,
        sort: { sorted: false, unsorted: true, empty: true },
        first: true,
        numberOfElements: 0,
        empty: true,
      } as ApiPage<ProjectUpdateTimelineItem>);
      setAllUpdatesLoaded(true);
    }
  }, [projectId, pageSize]);

  const handleLoadMore = () => {
    if (!loading && !allUpdatesLoaded) {
      const nextPageToFetch = currentPage + 1;
      fetchUpdates(nextPageToFetch, pageSize, true);
      setCurrentPage(nextPageToFetch);
    }
  };

  const groupUpdatesByDate = (updates: ProjectUpdateTimelineItem[]) => {
    if (!updates || updates.length === 0) return {};
    return updates.reduce((acc, update) => {
      const dateStr = dayjs(update.updateDate).format("YYYY-MM-DD");
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(update);
      return acc;
    }, {} as Record<string, ProjectUpdateTimelineItem[]>);
  };

  const groupedUpdates = updatesPage
    ? groupUpdatesByDate(updatesPage.content)
    : {};
  const sortedDates = Object.keys(groupedUpdates).sort(
    (a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()
  ); // Sắp xếp ngày mới nhất trước

  if (loading && (!updatesPage || updatesPage.content.length === 0)) {
    return (
      <Spin
        tip="Loading updates..."
        style={{
          display: "block",
          textAlign: "center",
          marginTop: 40,
          marginBottom: 40,
        }}
      />
    );
  }

  if (!loading && (!updatesPage || updatesPage.content.length === 0)) {
    return (
      <Empty
        description="No updates found for this project."
        style={{ marginTop: 40, marginBottom: 40 }}
      />
    );
  }

  if (!updatesPage) {
    return (
      <Empty
        description="Could not load updates."
        style={{ marginTop: 40, marginBottom: 40 }}
      />
    );
  }

  return (
    <div>
      {sortedDates.map((dateStr) => (
        <div key={dateStr} style={{ marginBottom: "32px" }}>
          {/* Date Header */}
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              background:
                theme === "dark"
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
              borderRadius: "8px",
              border: `1px solid ${theme === "dark" ? "#303030" : "#f0f0f0"}`,
            }}
          >
            <Space align="center" size="middle">
              <CalendarOutlined
                style={{
                  color: theme === "dark" ? "#1677ff" : "#1677ff",
                  fontSize: "16px",
                }}
              />
              <Title
                level={4}
                style={{
                  margin: 0,
                  color:
                    theme === "dark"
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(0,0,0,0.88)",
                  fontWeight: 600,
                }}
              >
                {dayjs(dateStr).format("MMMM D, YYYY")}
              </Title>
              <Tag color="blue" style={{ fontSize: "11px", fontWeight: 500 }}>
                {groupedUpdates[dateStr].length} update
                {groupedUpdates[dateStr].length > 1 ? "s" : ""}
              </Tag>
            </Space>
          </div>

          {/* Updates Cards */}
          {groupedUpdates[dateStr].map((update) => (
            <div
              key={update.id}
              style={{
                border: `1px solid ${theme === "dark" ? "#303030" : "#e8e8e8"}`,
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "16px",
                background: theme === "dark" ? "#1a1a1a" : "#fff",
                boxShadow:
                  theme === "dark"
                    ? "0 2px 8px rgba(0,0,0,0.3)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
                position: "relative",
              }}
            >
              {/* Update Header */}
              <Row
                justify="space-between"
                align="top"
                style={{ marginBottom: "16px" }}
              >
                <Col xs={24} lg={16}>
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: "100%" }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: "16px",
                        color:
                          theme === "dark"
                            ? "rgba(255,255,255,0.9)"
                            : "rgba(0,0,0,0.88)",
                        lineHeight: "1.4",
                      }}
                    >
                      {update.summary || "Project Update"}
                    </Text>
                    <Space size="middle" wrap>
                      {renderUser(update.createdBy, theme)}
                      <Text type="secondary" style={{ fontSize: "13px" }}>
                        {dayjs(update.updateDate).format("h:mm A")}
                      </Text>
                    </Space>
                  </Space>
                </Col>
                <Col
                  xs={24}
                  lg={8}
                  style={{
                    textAlign: window.innerWidth >= 992 ? "right" : "left",
                  }}
                >
                  <Space
                    size="small"
                    wrap
                    style={{
                      marginTop: window.innerWidth < 992 ? "12px" : "0",
                    }}
                  >
                    <Tag
                      icon={
                        update.published ? (
                          <EyeOutlined />
                        ) : (
                          <EyeInvisibleOutlined />
                        )
                      }
                      color={update.published ? "success" : "default"}
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      {update.published ? "Published" : "Internal"}
                    </Tag>
                  </Space>
                </Col>
              </Row>

              {/* Details */}
              {update.details && (
                <div style={{ marginBottom: "16px" }}>
                  {" "}
                  <Paragraph
                    ellipsis={{
                      rows: 3,
                      expandable: true,
                      symbol: (
                        <span
                          style={{
                            color: "#1890ff",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Show more
                        </span>
                      ),
                    }}
                    style={{
                      color:
                        theme === "dark"
                          ? "rgba(255,255,255,0.75)"
                          : "rgba(0,0,0,0.75)",
                      whiteSpace: "pre-line",
                      lineHeight: "1.6",
                      fontSize: "14px",
                      margin: 0,
                      padding: "12px 16px",
                      background:
                        theme === "dark"
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.02)",
                      borderRadius: "8px",
                      border: `1px solid ${
                        theme === "dark" ? "#2a2a2a" : "#f5f5f5"
                      }`,
                    }}
                  >
                    {update.details}
                  </Paragraph>
                </div>
              )}

              {/* Status and Progress Footer */}
              {(update.statusAtUpdate ||
                (update.completionPercentage !== null &&
                  update.completionPercentage !== undefined)) && (
                <div
                  style={{
                    padding: "12px 16px",
                    background:
                      theme === "dark"
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.02)",
                    borderRadius: "8px",
                    border: `1px solid ${
                      theme === "dark" ? "#2a2a2a" : "#f5f5f5"
                    }`,
                  }}
                >
                  <Row gutter={[16, 8]} align="middle">
                    {update.statusAtUpdate && (
                      <Col xs={24} sm={12}>
                        <Space align="center" size="small">
                          <InfoCircleOutlined style={{ fontSize: "14px" }} />
                          <Text strong style={{ fontSize: "13px" }}>
                            Status:
                          </Text>
                          <Text
                            style={{
                              ...getUpdateStatusStyle(
                                update.statusAtUpdate,
                                theme
                              ),
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            {update.statusAtUpdate.replace(/_/g, " ")}
                          </Text>
                        </Space>
                      </Col>
                    )}
                    {update.completionPercentage !== null &&
                      update.completionPercentage !== undefined && (
                        <Col xs={24} sm={12}>
                          <Space
                            align="center"
                            size="small"
                            style={{ width: "100%" }}
                          >
                            <PercentageOutlined style={{ fontSize: "14px" }} />
                            <Text strong style={{ fontSize: "13px" }}>
                              Progress:
                            </Text>
                            <div style={{ flex: 1, minWidth: "120px" }}>
                              <Progress
                                percent={update.completionPercentage}
                                size="small"
                                strokeColor={{
                                  "0%": "#87d068",
                                  "100%": "#108ee9",
                                }}
                                status={
                                  update.completionPercentage === 100
                                    ? "success"
                                    : update.completionPercentage > 70
                                    ? "normal"
                                    : update.completionPercentage < 30
                                    ? "exception"
                                    : "active"
                                }
                                format={(percent) => (
                                  <Text
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {percent}%
                                  </Text>
                                )}
                              />
                            </div>
                          </Space>
                        </Col>
                      )}
                  </Row>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Load More Section */}
      <div style={{ textAlign: "center", marginTop: "32px" }}>
        {!allUpdatesLoaded &&
          !loading &&
          updatesPage &&
          updatesPage.content.length > 0 && (
            <Button
              type="primary"
              size="large"
              onClick={handleLoadMore}
              disabled={loading || allUpdatesLoaded}
              style={{
                borderRadius: "8px",
                height: "40px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontWeight: 500,
              }}
            >
              Load More Updates
            </Button>
          )}
        {!loading &&
          allUpdatesLoaded &&
          updatesPage &&
          updatesPage.content.length > 0 && (
            <Text
              type="secondary"
              style={{ fontSize: "14px", fontStyle: "italic" }}
            >
              All updates have been loaded
            </Text>
          )}
      </div>
    </div>
  );
};

export default ProjectUpdatesTab;
