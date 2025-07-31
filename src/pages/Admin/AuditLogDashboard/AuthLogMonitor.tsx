// src/pages/AuthLogMonitor.tsx

import React from "react";
import { Layout, Typography, Space, Alert, Card, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAuthLogs } from "../../../hooks/useAuthLogs";
import { AuditLog, AuditLogSeverity } from "../../../types/auditLog.types";
import { getSeverityTagColor } from "../../../utils/styleUtils";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Meta } = Card;

const AuthLogMonitor: React.FC = () => {
  const { logs, stats, loading, error } = useAuthLogs();
  const columns: ColumnsType<AuditLog> = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      render: (ts) => new Date(ts).toLocaleString(),
    },
    { title: "Username", dataIndex: "username" },
    { title: "Action", dataIndex: "actionType" },
    {
      title: "Status",
      dataIndex: "success",
      render: (s) =>
        s ? (
          <Tag color="success">Success</Tag>
        ) : (
          <Tag color="error">Failure</Tag>
        ),
      filters: [
        { text: "Success", value: true },
        { text: "Failure", value: false },
      ],
      onFilter: (value, record) => record.success === value,
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (severity: AuditLogSeverity) => (
        <Tag color={getSeverityTagColor(severity)}>{severity}</Tag>
      ),
      filters: Object.values(AuditLogSeverity).map((s) => ({
        text: s,
        value: s,
      })),
      onFilter: (value, record) => record.severity === value,
    },
    { title: "Details", dataIndex: "details", ellipsis: true },
  ];

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Header
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        <Title level={4}>Authentication Log Monitor</Title>
      </Header>
      <Content style={{ borderRadius: "8px" }}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: "24px" }}
          />
        )}

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Card loading={loading}>
            <Meta
              title="Statistics"
              description={`Total Auth Logs: ${
                stats?.total_auth_logs ?? "N/A"
              } | Today's Logs: ${stats?.today_logs ?? "N/A"}`}
            />
          </Card>

          <Card title="Recent Authentication Events">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={logs}
              loading={loading}
              pagination={{ pageSize: 20 }}
            />
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};

export default AuthLogMonitor;
