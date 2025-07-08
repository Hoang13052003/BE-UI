import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import { BarChartOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

interface MilestoneStatsProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  theme?: string;
}

const MilestoneStats: React.FC<MilestoneStatsProps> = ({ stats, theme = "light" }) => (
  <Row gutter={16} style={{ marginBottom: "12px" }}>
    <Col xs={12} sm={6}>
      <Card size="small" style={{ textAlign: "center", background: theme === "dark" ? "#262626" : "#fff", border: "none", borderRadius: "8px" }} bodyStyle={{ padding: "10px" }}>
        <Statistic title="Total" value={stats.total} valueStyle={{ color: "#1890ff", fontSize: "18px" }} prefix={<BarChartOutlined />} />
      </Card>
    </Col>
    <Col xs={12} sm={6}>
      <Card size="small" style={{ textAlign: "center", background: theme === "dark" ? "#262626" : "#fff", border: "none", borderRadius: "8px" }} bodyStyle={{ padding: "10px" }}>
        <Statistic title="Completed" value={stats.completed} valueStyle={{ color: "#52c41a", fontSize: "18px" }} prefix={<CheckCircleOutlined />} />
      </Card>
    </Col>
    <Col xs={12} sm={6}>
      <Card size="small" style={{ textAlign: "center", background: theme === "dark" ? "#262626" : "#fff", border: "none", borderRadius: "8px" }} bodyStyle={{ padding: "10px" }}>
        <Statistic title="In Progress" value={stats.inProgress} valueStyle={{ color: "#faad14", fontSize: "18px" }} prefix={<ClockCircleOutlined />} />
      </Card>
    </Col>
    <Col xs={12} sm={6}>
      <Card size="small" style={{ textAlign: "center", background: theme === "dark" ? "#262626" : "#fff", border: "none", borderRadius: "8px" }} bodyStyle={{ padding: "10px" }}>
        <Statistic title="Overdue" value={stats.overdue} valueStyle={{ color: "#ff4d4f", fontSize: "18px" }} prefix={<ExclamationCircleOutlined />} />
      </Card>
    </Col>
  </Row>
);

export default MilestoneStats; 