import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Space, Statistic, Spin, Alert } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";

import DashboardChart from "../../components/Admin/dashboard/DashboardChart";
import ProjectList from "../../components/Admin/dashboard/ProjectList";
// import RecentFeedback from "../../components/Admin/dashboard/RecentFeedback";
import {
  DashboardSummaryFull,
  getAdminDashboardSummary,
} from "../../api/dashboardAdminApi";

const Overview: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummaryFull>({
    totalProjects: 0,
    activeProjects: 0,
    onTrackCount: 0,
    delayedCount: 0,
    atRiskCount: 0,
    projectStatus: {
      labels: [],
      data: [],
    },
    projectStatusWeek: { labels: [], data: [] },
    projectStatusMonth: { labels: [], data: [] },
    projectStatusQuarter: { labels: [], data: [] },
  });
  const [selectedRange, setSelectedRange] = useState<
    "week" | "month" | "quarter"
  >("month");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getAdminDashboardSummary();
        setDashboardData(() => ({
          ...data,
        }));
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <Spin size="large" className="center-spinner" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const calculatePercent = (value: number) => {
    return dashboardData.activeProjects
      ? Math.round((value / dashboardData.activeProjects) * 100)
      : 0;
  };

  return (
    <div className="dashboard-container">
      <Row gutter={[16, 16]} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={dashboardData.totalProjects}
              suffix={
                <div className="text-secondary">
                  {dashboardData.activeProjects} Active
                </div>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="On Track"
              value={dashboardData.onTrackCount}
              suffix={`${calculatePercent(dashboardData.onTrackCount)}%`}
              valueStyle={{ color: "#3f8600" }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Delayed"
              value={dashboardData.delayedCount}
              suffix={`${calculatePercent(dashboardData.delayedCount)}%`}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="At Risk"
              value={dashboardData.atRiskCount}
              suffix={`${calculatePercent(dashboardData.atRiskCount)}%`}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Project Progress & Recent Feedback */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col span={16}>
          <Card
            loading={loading}
            title="Project Progress"
            extra={
              <Space>
                <Button
                  type={selectedRange === "week" ? "primary" : "text"}
                  onClick={() => setSelectedRange("week")}
                  style={
                    selectedRange === "week"
                      ? { fontWeight: "bold", boxShadow: "0 2px 8px #e6f4ff" }
                      : {}
                  }
                >
                  Week
                </Button>
                <Button
                  type={selectedRange === "month" ? "primary" : "text"}
                  onClick={() => setSelectedRange("month")}
                  style={
                    selectedRange === "month"
                      ? { fontWeight: "bold", boxShadow: "0 2px 8px #e6f4ff" }
                      : {}
                  }
                >
                  Month
                </Button>
                <Button
                  type={selectedRange === "quarter" ? "primary" : "text"}
                  onClick={() => setSelectedRange("quarter")}
                  style={
                    selectedRange === "quarter"
                      ? { fontWeight: "bold", boxShadow: "0 2px 8px #e6f4ff" }
                      : {}
                  }
                >
                  Quarter
                </Button>
              </Space>
            }
          >
            <DashboardChart
              data={
                selectedRange === "week"
                  ? dashboardData.projectStatusWeek?.data || []
                  : selectedRange === "month"
                  ? dashboardData.projectStatusMonth?.data ||
                    dashboardData.projectStatus.data
                  : dashboardData.projectStatusQuarter?.data || []
              }
              labels={
                selectedRange === "week"
                  ? dashboardData.projectStatusWeek?.labels || []
                  : selectedRange === "month"
                  ? dashboardData.projectStatusMonth?.labels ||
                    dashboardData.projectStatus.labels
                  : dashboardData.projectStatusQuarter?.labels || []
              }
            />
          </Card>
        </Col>
        {/* <Col span={8}>
          <RecentFeedback limit={5} useMockData={false} />
        </Col> */}
      </Row>

      {/* Milestones Table */}
      <Card title="Projects" className="mb-4">
        <ProjectList />
      </Card>
    </div>
  );
};

export default Overview;
