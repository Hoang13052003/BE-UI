import React, { useState, useEffect } from "react";
import { Card, List, Typography, Skeleton, Divider, Empty } from "antd";
import { Link } from "react-router-dom";
import { FeedbackCriteria, getAllFeedbacks } from "../../../api/feedbackApi";
import { MessageOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();

  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else if (diffDays < 30) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  } else {
    return past.toLocaleDateString();
  }
};

interface FeedbackItem {
  id: string | number;
  fullName?: string;
  email?: string;
  projectName: string;
  projectId: string; // Updated to match API response format
  updateId?: number; // Added field from API response
  userId?: number; // Added field from API response
  content: string;
  createdAt: string;
  read: boolean;
  deleted?: boolean; // Added field for soft delete support
  attachments?: any[]; // Added field for attachments
}

interface TypedPaginatedFeedbackResponse {
  content: FeedbackItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface RecentFeedbackProps {
  limit?: number;
  onViewAll?: () => void;
  useMockData?: boolean;
}

const RecentFeedback: React.FC<RecentFeedbackProps> = ({
  limit = 5,
  onViewAll = () => {},
  useMockData = true,
}) => {
  const [feedbacks, setFeedbacks] = useState<TypedPaginatedFeedbackResponse>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeedbacks = async (
      page: number = 0,
      size: number = 10,
      searchCriteria: FeedbackCriteria = {}
    ) => {
      try {
        setLoading(true);
        const response = await getAllFeedbacks(
          searchCriteria,
          page,
          size,
          "createdAt",
          "desc"
        );
        setFeedbacks(response as TypedPaginatedFeedbackResponse);
        console.log("Data feedbacks: " + JSON.stringify(feedbacks.content));
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [limit, useMockData]);
  const limitedFeedback =
    feedbacks.content.length > limit
      ? feedbacks.content.slice(0, limit)
      : feedbacks.content;

  return (
    <Card
      className="recent-feedback-card"
      title={
        <div
          className="card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 8,
          }}
        >
          <Title
            level={5}
            className="card-title"
            style={{ margin: 0, display: "flex", alignItems: "center" }}
          >
            <MessageOutlined
              style={{ color: "#1890ff", marginRight: 8, fontSize: 20 }}
            />{" "}
            Recent Feedback
          </Title>
          <Link
            to="/admin/feedbacks"
            onClick={onViewAll}
            className="view-all-link"
            style={{
              fontWeight: 500,
              color: "#1890ff",
              border: "1px solid #e6f4ff",
              borderRadius: 6,
              padding: "2px 12px",
              background: "#f0faff",
              transition: "all 0.2s",
              display: "inline-block",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#e6f4ff")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#f0faff")}
          >
            View All
          </Link>{" "}
        </div>
      }
      variant="borderless"
      style={{
        boxShadow: "0 2px 8px #f0f1f2",
        padding: 0,
        height: "420px",
      }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : limitedFeedback.length === 0 ? (
        <Empty description="No feedback available" />
      ) : (
        <List
          style={{ overflowY: "auto", maxHeight: "310px" }}
          itemLayout="vertical"
          dataSource={limitedFeedback}
          renderItem={(item, index) => (
            <React.Fragment key={item.id}>
              <div
                className={`feedback-item${item.read ? "" : " unread"}`}
                style={{
                  padding: "14px 16px",
                  cursor: "pointer",
                  background: item.read ? "#fff" : "#e6f4ff",
                  borderRadius: 8,
                  transition: "background 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: item.read ? "none" : "0 2px 8px #e6f4ff",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#f0faff")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = item.read
                    ? "#fff"
                    : "#e6f4ff")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  {!item.read && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#1890ff",
                        display: "inline-block",
                        marginRight: 8,
                      }}
                    ></span>
                  )}
                  <Title
                    level={5}
                    className={
                      item.read ? "project-title read" : "project-title"
                    }
                    style={{
                      margin: 0,
                      color: item.read ? "#222" : "#1890ff",
                      fontWeight: item.read ? 500 : 700,
                    }}
                  >
                    Project #{item.projectId} - {item.projectName}
                  </Title>
                </div>
                <Text
                  className="feedback-message"
                  style={{
                    fontSize: 15,
                    color: "#444",
                    marginBottom: 4,
                  }}
                >
                  {item.content}
                </Text>
                <div
                  className="feedback-meta"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Text
                    type="secondary"
                    className="time-ago"
                    style={{ fontSize: 13 }}
                  >
                    {getRelativeTime(item.createdAt)}
                  </Text>
                </div>
              </div>
              {index < limitedFeedback.length - 1 && (
                <Divider style={{ margin: "12px 0" }} />
              )}
            </React.Fragment>
          )}
        />
      )}
    </Card>
  );
};

export default RecentFeedback;
