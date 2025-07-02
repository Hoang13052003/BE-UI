import {
  Input,
  InputNumber,
  DatePicker,
  Select,
  Tag,
  Typography,
  Space,
} from "antd";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { TimeLogResponse, BatchUpdateItem } from "../../api/timelogApi";
import { UserIdAndEmailResponse } from "../../types/User";

const { Text } = Typography;
const { Option } = Select;

interface InlineEditColumnsProps {
  isInBatchMode: boolean;
  isAdmin: boolean;
  editedData: Record<number, Partial<BatchUpdateItem>>;
  searchedUsers: (UserIdAndEmailResponse & { fullName?: string })[];
  currentPerformersMap: Record<
    number,
    UserIdAndEmailResponse & { fullName?: string }
  >;
  searchLoading: boolean;
  batchSaving: boolean;
  batchDeleting: boolean;
  onInlineEdit: (
    timelogId: number,
    field: keyof BatchUpdateItem,
    value: any
  ) => void;
  onUserSearch: (searchText: string) => void;
  onResetSearch: () => void;
}

export const createInlineEditColumns = ({
  isInBatchMode,
  isAdmin,
  editedData,
  searchedUsers,
  currentPerformersMap,
  searchLoading,
  batchSaving,
  batchDeleting,
  onInlineEdit,
  onUserSearch,
  onResetSearch,
}: InlineEditColumnsProps) => {
  const formatDate = (dateString: string | undefined): string => {
    return dateString && dayjs(dateString).isValid()
      ? dayjs(dateString).format("MMM D, YYYY")
      : "N/A";
  };

  const getTimeColor = (hours: number) => {
    if (hours >= 8) return "#52c41a";
    if (hours >= 4) return "#faad14";
    return "#1890ff";
  };

  return [
    {
      title: "Task Description",
      dataIndex: "taskDescription",
      key: "taskDescription",
      width: "30%",
      render: (text: string, record: TimeLogResponse) => {
        if (isInBatchMode && isAdmin) {
          return (
            <Input
              value={
                editedData[record.id]?.taskDescription ?? record.taskDescription
              }
              onChange={(e) =>
                onInlineEdit(record.id, "taskDescription", e.target.value)
              }
              disabled={batchSaving || batchDeleting}
              size="small"
            />
          );
        }
        return (
          <Text strong style={{ fontSize: "16px" }}>
            {text}
          </Text>
        );
      },
    },
    {
      title: "Hours",
      dataIndex: "hoursSpent",
      key: "hoursSpent",
      align: "center" as const,
      width: "10%",
      render: (hours: number, record: TimeLogResponse) => {
        if (isInBatchMode && isAdmin) {
          return (
            <InputNumber
              min={0.01}
              precision={2}
              value={editedData[record.id]?.hoursSpent ?? record.hoursSpent}
              style={{ width: "100%" }}
              onChange={(value) => onInlineEdit(record.id, "hoursSpent", value)}
              disabled={batchSaving || batchDeleting}
              size="small"
            />
          );
        }
        return (
          <Tag
            color={getTimeColor(hours)}
            style={{
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            {hours}h
          </Tag>
        );
      },
    },
    {
      title: "Performer",
      dataIndex: "performerFullName",
      key: "performer",
      width: "20%",
      render: (
        _: string,
        record: TimeLogResponse
      ) => {
        if (isInBatchMode && isAdmin) {
          const currentPerformerInfo = currentPerformersMap[record.id] || {
            id: record.performerId,
            fullName: record.performerFullName,
            email: '',
          };

          let selectOptions: (UserIdAndEmailResponse & {
            fullName?: string;
          })[] = [...searchedUsers];
          const valueToDisplay =
            editedData[record.id]?.performerId ?? record.performerId;

          if (
            !selectOptions.find((u) => u.id === valueToDisplay) &&
            currentPerformerInfo &&
            currentPerformerInfo.id === valueToDisplay
          ) {
            selectOptions = [
              currentPerformerInfo,
              ...selectOptions.filter(
                (opt) => opt.id !== currentPerformerInfo.id
              ),
            ];
          }

          return (
            <Select
              value={valueToDisplay}
              style={{ width: "100%" }}
              showSearch
              placeholder="Search performer"
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={onUserSearch}
              onChange={(selectedUserId) =>
                onInlineEdit(record.id, "performerId", selectedUserId)
              }
              onFocus={onResetSearch}
              loading={searchLoading}
              disabled={batchSaving || batchDeleting}
              size="small"
            >
              {selectOptions.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.fullName || user.email}
                </Option>
              ))}
            </Select>
          );
        }
        return (
          <Space>
            <UserOutlined style={{ color: "#1890ff" }} />
            <Text type="secondary">{record.performerFullName || "N/A"}</Text>
          </Space>
        );
      },
    },
    {
      title: "Task Date",
      dataIndex: "taskDate",
      key: "taskDate",
      width: "13%",
      render: (dateString: string, record: TimeLogResponse) => {
        if (isInBatchMode && isAdmin) {
          return (
            <DatePicker
              value={dayjs(editedData[record.id]?.taskDate ?? record.taskDate)}
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              onChange={(_date, dateStr) =>
                onInlineEdit(record.id, "taskDate", dateStr)
              }
              disabled={batchSaving || batchDeleting}
              size="small"
            />
          );
        }
        return (
          <Space>
            <CalendarOutlined style={{ color: "#52c41a" }} />{" "}
            <Text type="secondary">{formatDate(dateString)}</Text>
          </Space>
        );
      },
    },
  ];
};
