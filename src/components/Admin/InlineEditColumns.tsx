import { Input, InputNumber, DatePicker, Select, Tag, Typography, Space } from 'antd';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { TimeLogResponse, BatchUpdateItem } from '../../api/timelogApi';
import { UserIdAndEmailResponse } from '../../types/User';

const { Text } = Typography;
const { Option } = Select;

interface InlineEditColumnsProps {
  isInBatchMode: boolean;
  isAdmin: boolean;
  editedData: Record<number, Partial<BatchUpdateItem>>;
  searchedUsers: (UserIdAndEmailResponse & { fullName?: string })[];
  currentPerformersMap: Record<number, UserIdAndEmailResponse & { fullName?: string }>;
  searchLoading: boolean;
  batchSaving: boolean;
  batchDeleting: boolean;
  onInlineEdit: (timelogId: number, field: keyof BatchUpdateItem, value: any) => void;
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
    return dateString && dayjs(dateString).isValid() ? dayjs(dateString).format('MMM D, YYYY') : 'N/A';
  };

  const getTimeColor = (hours: number) => {
    if (hours >= 8) return '#52c41a';
    if (hours >= 4) return '#faad14';
    return '#1890ff';
  };

  const getStatusColorTag = (statusKey: string | undefined): string => {
    switch (statusKey?.toUpperCase()) {
      case 'PENDING': return 'orange';
      case 'IN_PROGRESS': return 'processing';
      case 'COMPLETED': return 'success';
      case 'DELAYED': return 'error';
      default: return 'default';
    }
  };

  return [
    {
      title: 'Task Description',
      dataIndex: 'taskDescription',
      key: 'taskDescription',
      width: '35%',
      render: (text: string, record: TimeLogResponse) => {
        if (isInBatchMode && isAdmin) {
          return (
            <Input
              value={editedData[record.id]?.taskDescription ?? record.taskDescription}
              onChange={(e) => onInlineEdit(record.id, 'taskDescription', e.target.value)}
              disabled={batchSaving || batchDeleting}
              size="small"
            />
          );
        }
        return <Text strong style={{ fontSize: '16px' }}>{text}</Text>;
      }
    },
    {
      title: 'Hours',
      dataIndex: 'hoursSpent',
      key: 'hoursSpent',
      align: 'center' as const,
      width: '10%',
      render: (hours: number, record: TimeLogResponse) => {
        if (isInBatchMode && isAdmin) {
          return (
            <InputNumber
              min={0.01}
              precision={2}
              value={editedData[record.id]?.hoursSpent ?? record.hoursSpent}
              style={{ width: '100%' }}
              onChange={(value) => onInlineEdit(record.id, 'hoursSpent', value)}
              disabled={batchSaving || batchDeleting}
              size="small"
            />
          );
        }
        return <Tag color={getTimeColor(hours)} style={{ borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}>{hours}h</Tag>;
      }
    },
    {
      title: 'Performer',
      dataIndex: 'performer',
      key: 'performer',
      width: '25%',
      render: (performerObject: { fullName: string; id: number; email: string } | undefined, record: TimeLogResponse) => {
        if (isInBatchMode && isAdmin) {
          const currentPerformerInfo = currentPerformersMap[record.id] || { 
            id: record.performer.id, 
            fullName: record.performer.fullName, 
            email: record.performer.email 
          };
          
          let selectOptions: (UserIdAndEmailResponse & { fullName?: string })[] = [...searchedUsers];
          const valueToDisplay = editedData[record.id]?.performerId ?? record.performer.id;

          if (!selectOptions.find(u => u.id === valueToDisplay) && currentPerformerInfo && currentPerformerInfo.id === valueToDisplay) {
            selectOptions = [currentPerformerInfo, ...selectOptions.filter(opt => opt.id !== currentPerformerInfo.id)];
          }

          return (
            <Select
              value={valueToDisplay}
              style={{ width: '100%' }}
              showSearch
              placeholder="Search performer"
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={onUserSearch}
              onChange={(selectedUserId) => onInlineEdit(record.id, 'performerId', selectedUserId)}
              onFocus={onResetSearch}
              loading={searchLoading}
              disabled={batchSaving || batchDeleting}
              size="small"
            >
              {selectOptions.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.fullName || user.email}
                </Option>
              ))}
            </Select>
          );
        }
        return (
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <Text type="secondary">{performerObject?.fullName || 'N/A'}</Text>
          </Space>
        );
      }
    },
    {
      title: 'Task Date',
      dataIndex: 'taskDate',
      key: 'taskDate',
      width: '15%',
      render: (dateString: string, record: TimeLogResponse) => {
        if (isInBatchMode && isAdmin) {
          return (
            <DatePicker
              value={dayjs(editedData[record.id]?.taskDate ?? record.taskDate)}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              onChange={(_date, dateStr) => onInlineEdit(record.id, 'taskDate', dateStr)}
              disabled={batchSaving || batchDeleting}
              size="small"
            />
          );
        }
        return <Space><CalendarOutlined style={{ color: '#52c41a' }} /> <Text type="secondary">{formatDate(dateString)}</Text></Space>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'computedTimelogStatus',
      key: 'status',
      align: 'center' as const,
      width: '15%',
      render: (statusText: string | undefined, record: TimeLogResponse) => {
        if (isInBatchMode && isAdmin) {
          const currentDisplayStatus = record.computedTimelogStatus || 'PENDING';
          const editedStatus = editedData[record.id]?.actualTimelogStatus;
          const statusToDisplay = editedStatus ?? currentDisplayStatus;
          
          return (
            <Select
              value={statusToDisplay}
              style={{ width: '100%' }}
              onChange={(newStatus) => onInlineEdit(record.id, 'actualTimelogStatus', newStatus)}
              disabled={batchSaving || batchDeleting}
              size="small"
            >
              <Option value="PENDING">Pending</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="DELAYED">Delayed</Option>
            </Select>
          );
        }
        return <Tag color={getStatusColorTag(statusText)}>{statusText || 'N/A'}</Tag>;
      }
    },
  ];
};