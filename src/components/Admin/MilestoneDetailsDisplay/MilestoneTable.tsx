import React from "react";
import { Table, Pagination, Row, Typography, Space, Button, Popconfirm, Tag, Progress } from "antd";
import { FlagOutlined, CalendarOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Milestone, MilestoneStatus } from "../../../types/milestone";
import { getMilestoneStatusDisplayName, getMilestoneStatusTagColor } from "../../../utils/milestoneUtils";

const { Text } = Typography;

interface MilestoneTableProps {
  milestones: Milestone[];
  loading: boolean;
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (current: number, size: number) => void;
  onEditMilestone?: (milestoneId: number, projectId: string, onSuccessRefresh?: () => void) => void;
  onDeleteMilestone: (milestoneId: number) => void;
  projectId: string;
  formatDate: (date: string | null | undefined) => string;
  isOverdueMilestone: (milestone: Milestone) => boolean;
  isMilestoneCompleted: (milestone: Milestone) => boolean;
  theme?: string;
}

const MilestoneTable: React.FC<MilestoneTableProps> = ({
  milestones,
  loading,
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onEditMilestone,
  onDeleteMilestone,
  projectId,
  formatDate,
  isOverdueMilestone,
  isMilestoneCompleted,
  theme = "light",
}) => (
  <>
    <Table
      rowKey="id"
      dataSource={milestones}
      loading={loading && milestones.length > 0}
      pagination={false}
      size="middle"
      columns={[
        {
          title: "Milestone Name",
          dataIndex: "name",
          key: "name",
          render: (text: string) => (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FlagOutlined style={{ color: "#1890ff" }} />
              <Text strong>{text || "Untitled Milestone"}</Text>
            </div>
          ),
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
          ellipsis: true,
          render: (text: string) => <Text>{text || "-"}</Text>,
        },
        {
          title: "Notes",
          dataIndex: "notes",
          key: "notes",
          ellipsis: true,
          width: 150,
          render: (text: string) =>
            text ? (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Text style={{ color: "#666" }}>📝 {text}</Text>
              </div>
            ) : (
              <Text style={{ color: "#ccc" }}>-</Text>
            ),
        },
        {
          title: "Progress",
          dataIndex: "completionPercentage",
          key: "progress",
          width: 120,
          render: (percent: number) => (
            <Progress percent={percent || 0} status={percent === 100 ? "success" : "active"} strokeColor={percent === 100 ? "#52c41a" : "#1890ff"} />
          ),
        },
        {
          title: "Start Date",
          dataIndex: "startDate",
          key: "startDate",
          width: 120,
          render: (date: string) => (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <CalendarOutlined style={{ color: "#52c41a" }} />
              <Text>{formatDate(date)}</Text>
            </div>
          ),
        },
        {
          title: "Due Date",
          dataIndex: "deadlineDate",
          key: "deadlineDate",
          width: 120,
          render: (date: string, record: Milestone) => (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <ClockCircleOutlined style={{ color: isOverdueMilestone(record) ? "#ff4d4f" : "#faad14" }} />
              <Text style={{ color: isOverdueMilestone(record) ? "#ff4d4f" : undefined }}>{formatDate(date)}</Text>
            </div>
          ),
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
          width: 130,
          render: (status: MilestoneStatus, record: Milestone) => (
            <Space direction="vertical" size={2}>
              <Tag color={getMilestoneStatusTagColor(status || null)} style={{ padding: "2px 8px", borderRadius: "12px", margin: 0 }}>
                {status ? getMilestoneStatusDisplayName(status) : "To Do"}
              </Tag>
              {isMilestoneCompleted(record) && !isOverdueMilestone(record) && (
                <Tag color="success" style={{ padding: "1px 4px", borderRadius: "8px", margin: 0 }}>
                  Waiting Approval
                </Tag>
              )}
              {isOverdueMilestone(record) && (
                <Tag color={isMilestoneCompleted(record) ? "warning" : "error"} style={{ padding: "1px 4px", borderRadius: "8px", margin: 0 }}>
                  {isMilestoneCompleted(record) ? "Late" : "Overdue"}
                </Tag>
              )}
            </Space>
          ),
        },
        {
          title: "Actions",
          key: "actions",
          width: 80,
          render: (_: any, record: Milestone) => (
            <Space size="small">
              {onEditMilestone && (
                <Button type="text" icon={<EditOutlined />} onClick={() => onEditMilestone(record.id, projectId)} size="small" />
              )}
              <Popconfirm title="Delete this milestone?" onConfirm={() => onDeleteMilestone(record.id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                <Button type="text" icon={<DeleteOutlined />} danger size="small" />
              </Popconfirm>
            </Space>
          ),
        },
      ]}
    />
    {totalItems > pageSize && (
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${theme === "dark" ? "#303030" : "#f0f0f0"}`, background: theme === "dark" ? "#1a1a1a" : "#fafafa" }}>
        <Row justify="end">
          <Pagination
            current={currentPage + 1}
            pageSize={pageSize}
            total={totalItems}
            onChange={onPageChange}
            showSizeChanger
            onShowSizeChange={onPageSizeChange}
            pageSizeOptions={["5", "10", "20", "50"]}
            showTotal={(total, range) => (
              <Text type="secondary">{range[0]}-{range[1]} of {total} entries</Text>
            )}
            style={{ margin: 0 }}
          />
        </Row>
      </div>
    )}
  </>
);

export default MilestoneTable; 