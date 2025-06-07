import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Statistic,
  // List, Typography,
  Spin,
  Alert,
} from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";

import DashboardChart from "../../components/Admin/dashboard/DashboardChart";
// import TimeLogChart from '../../components/Admin/dashboard/TimeLogChart';
import ProjectList from "../../components/Admin/dashboard/ProjectList";
import {
  DashboardSummary,
  getAdminDashboardSummary,
} from "../../api/dashboardAdminApi";

const Overview: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary>({
    totalProjects: 0,
    activeProjects: 0,
    onTrackCount: 0,
    delayedCount: 0,
    atRiskCount: 0,
    projectStatus: {
      labels: [],
      data: [],
    },
  });

  // Define columns for milestones table

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {      try {
        setLoading(true);
        const data = await getAdminDashboardSummary();
        setDashboardData(data);
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

  // Calculate percentages safely
  const calculatePercent = (value: number) => {
    return dashboardData.activeProjects
      ? Math.round((value / dashboardData.activeProjects) * 100)
      : 0;
  };

  return (
    <div className="dashboard-container">
      {/* Stats Cards */}
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
                <Button type="text">Week</Button>
                <Button type="primary">Month</Button>
                <Button type="text">Quarter</Button>
              </Space>
            }
          >
            <DashboardChart
              data={dashboardData.projectStatus.data}
              labels={dashboardData.projectStatus.labels}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            loading={loading}
            title="Recent Feedback"
            style={{
              height: "404px",
              position: "relative",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
            styles={{ body: { padding: "16px" } }}
            extra={
              <Button type="link" style={{ fontWeight: "bold" }}>
                View All
              </Button>
            }
          >
            {/* <List
              dataSource={dashboardData.recentFeedback}
              renderItem={(item: Feedback, index: number) => (
                <List.Item key={index} style={{ padding: '12px 0', borderBottom: index === dashboardData.recentFeedback.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
                <List.Item.Meta
                  title={
                  <Title level={5} style={{ marginBottom: '4px', color: '#1d1d1d' }}>
                    {item.project}
                  </Title>
                  }
                  description={
                  <>
                    <p style={{ margin: 0, color: '#595959', fontSize: '14px' }}>
                    {item.message}
                    </p>
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {item.time}
                    </span>
                  </>
                  }
                />
                </List.Item>
              )}
              /> */}
          </Card>
        </Col>
      </Row>

      {/* Milestones Table */}
      <Card title="Projects" className="mb-4">
        <ProjectList />
      </Card>
    </div>
  );
};

export default Overview;
