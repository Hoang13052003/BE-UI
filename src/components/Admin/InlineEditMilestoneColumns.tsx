import {
  Input,
  DatePicker,
  Select,
  Tag,
  Typography,
  Progress,
  InputNumber,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Milestone } from "../../types/milestone";
import { BatchUpdateMilestoneItemDTO } from "../../api/milestoneApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface InlineEditMilestoneColumnsProps {
  isInBatchMode: boolean;
  isAdmin: boolean;
  editedData: Record<number, Partial<BatchUpdateMilestoneItemDTO>>;
  batchSaving: boolean;
  batchDeleting: boolean;
  onInlineEdit: (
    milestoneId: number,
    field: keyof BatchUpdateMilestoneItemDTO,
    value: any
  ) => void;
}

export const createInlineEditMilestoneColumns = ({
  isInBatchMode,
  isAdmin,
  editedData: _editedData,
  batchSaving,
  batchDeleting,
  onInlineEdit,
}: InlineEditMilestoneColumnsProps) => {
  const formatDate = (dateString: string | null | undefined): string => {
    return dateString && dayjs(dateString).isValid()
      ? dayjs(dateString).format("MMM D, YYYY")
      : "Not set";
  };
  const getStatusColor = (status: string | null | undefined): string => {
    switch (status?.toUpperCase()) {
      case "NEW":
        return "blue";
      case "SENT":
        return "orange";
      case "REVIEWED":
        return "green";
      default:
        return "default";
    }
  };

  const isMilestoneCompleted = (milestone: Milestone): boolean => {
    return (
      milestone.completionDate !== null &&
      milestone.completionDate !== undefined &&
      milestone.completionDate !== ""
    );
  };
  const columns = [
    {
      title: "Milestone",
      key: "milestone",
      width: 280,
      render: (_: any, record: Milestone) => {
        if (isInBatchMode && isAdmin) {
          return (
            <div>
              <Input
                value={record.name || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 200) {
                    onInlineEdit(record.id, "name", value);
                  }
                }}
                placeholder="Milestone name"
                size="small"
                disabled={batchSaving || batchDeleting}
                maxLength={200}
                style={{ marginBottom: 4 }}
              />
              <TextArea
                value={record.description || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 65535) {
                    onInlineEdit(record.id, "description", value);
                  }
                }}
                placeholder="Description"
                size="small"
                disabled={batchSaving || batchDeleting}
                rows={1}
                maxLength={65535}
              />
            </div>
          );
        }
        return (
          <div>
            <Text
              strong
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 2,
              }}
            >
              <FlagOutlined style={{ color: "#1890ff" }} />
              {record.name || "Untitled Milestone"}
            </Text>
            {record.description && (
              <Text type="secondary" ellipsis={{ tooltip: record.description }}>
                {record.description.length > 60
                  ? `${record.description.substring(0, 60)}...`
                  : record.description}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Progress",
      key: "progress",
      width: 120,
      align: "center" as const,
      render: (_: any, record: Milestone) => {
        const percentage = record.completionPercentage || 0;

        if (isInBatchMode && isAdmin) {
          return (
            <InputNumber
              value={percentage}
              onChange={(val) => {
                const numVal = val || 0;
                if (numVal >= 0 && numVal <= 100) {
                  onInlineEdit(record.id, "completionPercentage", numVal);
                }
              }}
              min={0}
              max={100}
              size="small"
              disabled={batchSaving || batchDeleting}
              formatter={(val) => `${val}%`}
              parser={(val) => val?.replace("%", "") as any}
              style={{ width: "100%" }}
            />
          );
        }

        return (
          <Progress
            percent={percentage}
            size="small"
            status={percentage === 100 ? "success" : "active"}
            strokeColor={percentage === 100 ? "#52c41a" : "#1890ff"}
          />
        );
      },
    },
    {
      title: "Timeline",
      key: "timeline",
      width: 180,
      render: (_: any, record: Milestone) => {
        if (isInBatchMode && isAdmin) {
          return (
            <div>
              <DatePicker
                value={record.startDate ? dayjs(record.startDate) : null}
                onChange={(dateValue) => {
                  const formattedDate = dateValue
                    ? dateValue.format("YYYY-MM-DD")
                    : null;
                  onInlineEdit(record.id, "startDate", formattedDate);
                }}
                size="small"
                disabled={batchSaving || batchDeleting}
                format="MMM D"
                placeholder="Start"
                style={{ width: "100%", marginBottom: 4 }}
              />
              <DatePicker
                value={record.deadlineDate ? dayjs(record.deadlineDate) : null}
                onChange={(dateValue) => {
                  const formattedDate = dateValue
                    ? dateValue.format("YYYY-MM-DD")
                    : null;
                  onInlineEdit(record.id, "deadlineDate", formattedDate);
                }}
                size="small"
                disabled={batchSaving || batchDeleting}
                format="MMM D"
                placeholder="Due"
                style={{ width: "100%" }}
              />
            </div>
          );
        }

        const isOverdue =
          record.deadlineDate &&
          !isMilestoneCompleted(record) &&
          new Date(record.deadlineDate) < new Date();

        return (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 2,
              }}
            >
              <CalendarOutlined
                style={{ color: "#52c41a", fontSize: "10px" }}
              />
              <Text style={{ fontSize: "11px" }}>
                Start: {formatDate(record.startDate)}
              </Text>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 2,
              }}
            >
              <ClockCircleOutlined
                style={{
                  color: isOverdue ? "#ff4d4f" : "#faad14",
                  fontSize: "10px",
                }}
              />
              <Text
                style={{
                  fontSize: "11px",
                  color: isOverdue ? "#ff4d4f" : undefined,
                }}
              >
                Due: {formatDate(record.deadlineDate)}
              </Text>
            </div>
            {isMilestoneCompleted(record) && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: "10px" }}
                />
                <Text style={{ fontSize: "11px", color: "#52c41a" }}>
                  Done: {formatDate(record.completionDate)}
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (_: string | null, record: Milestone) => {
        if (isInBatchMode && isAdmin) {
          return (
            <Select
              value={record.status || "NEW"}
              onChange={(value) => onInlineEdit(record.id, "status", value)}
              size="small"
              disabled={batchSaving || batchDeleting}
              style={{ width: "100%" }}
            >
              <Option value="NEW">New</Option>
              <Option value="SENT">Sent</Option>
              <Option value="REVIEWED">Reviewed</Option>
            </Select>
          );
        }

        // Display mode - show actual status value from database
        let statusColor = getStatusColor(record.status);
        let statusText = record.status
          ? String(record.status).replace("_", " ")
          : "New";

        // Keep the original status color mapping
        return (
          <Tag color={statusColor} style={{ margin: 0 }}>
            {statusText}
          </Tag>
        );
      },
    },
    {
      title: "Notes",
      key: "notes",
      width: 150,
      render: (_: any, record: Milestone) => {
        if (isInBatchMode && isAdmin) {
          return (
            <TextArea
              value={record.notes || ""}
              onChange={(e) => onInlineEdit(record.id, "notes", e.target.value)}
              placeholder="Add notes..."
              size="small"
              disabled={batchSaving || batchDeleting}
              rows={2}
              style={{ width: "100%" }}
            />
          );
        }

        // Display mode - handle notes properly
        const notesText = record.notes;
        return notesText ? (
          <Text ellipsis={{ tooltip: notesText }} style={{ fontSize: "11px" }}>
            {notesText.length > 30
              ? `${notesText.substring(0, 30)}...`
              : notesText}
          </Text>
        ) : (
          <Text
            type="secondary"
            style={{ fontSize: "10px", fontStyle: "italic" }}
          >
            No notes
          </Text>
        );
      },
    },
  ];

  return columns;
};
