import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, InputNumber, DatePicker, Select, Typography, Spin, Alert, Space, Row, Col, Button, Popconfirm, message, Pagination, Card, Tag, Statistic, Empty, Checkbox } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlusOutlined,
  UploadOutlined,
  BarChartOutlined,
  TeamOutlined,
  SaveOutlined,
  CloseCircleOutlined,
  DeleteFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getTimeLogsByProjectIdApi,
  TimeLogResponse,
  batchUpdateTimeLogsApi,
  BatchUpdateItem,
  batchDeleteTimeLogsApi
} from '../../api/timelogApi';
import AddTimeLogModal from './AddTimeLogModal';
import FileDropUpload from '../../components/Admin/FileDropUpload/FileDropUpload';

import { useUserSearch } from '../../hooks/useUserSearch';
import { UserIdAndEmailResponse } from '../../types/User';

const { Text, Title } = Typography;
const { Option } = Select;

interface TimelogDetailsDisplayProps {
  projectId: number;
  theme?: string;
}

interface EditableTimeLogData extends TimeLogResponse {
  _isEditing?: boolean;
  _originalData?: Partial<TimeLogResponse>;
}

const TimelogDetailsDisplay: React.FC<TimelogDetailsDisplayProps> = ({
  projectId,
  theme = 'light'
}) => {
  const [timelogs, setTimelogs] = useState<EditableTimeLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [isBatchEditingMode, setIsBatchEditingMode] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editedData, setEditedData] = useState<Record<number, Partial<BatchUpdateItem>>>({});

  const { searchedUsers, searchLoading, handleUserSearch, resetSearch } = useUserSearch();
  const [currentEditingPerformer, setCurrentEditingPerformer] = useState<UserIdAndEmailResponse & { fullName?: string } | null>(null);

  const [batchDeleting, setBatchDeleting] = useState<boolean>(false);

  const fetchTimelogs = useCallback(async () => {
    setLoading(true);
    try {
      const { timelogs: timelogData, totalItems: newTotalItems } = await getTimeLogsByProjectIdApi(
        projectId,
        currentPage,
        pageSize
      );
      setTimelogs(timelogData.map(tl => ({ ...tl })));
      setTotalItems(newTotalItems);
      setError(null);
    } catch (err) {
      setError('Failed to load time logs. Please try again later.');
      console.error('Error fetching time logs:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, currentPage, pageSize]);

  useEffect(() => {
    if (projectId) {
      fetchTimelogs();
    }
  }, [fetchTimelogs, projectId]);

  const handleUploadComplete = useCallback(() => {
    fetchTimelogs();
    message.success('Time logs uploaded successfully');
  }, [fetchTimelogs]);

  // Calculate statistics
  const calculateStats = () => {
    const totalHours = timelogs.reduce((sum, log) => sum + log.hoursSpent, 0);
    const uniqueUsers = new Set(timelogs.map(log => log.performerFullName)).size;
    const thisWeekLogs = timelogs.filter(log => 
      dayjs(log.taskDate).isAfter(dayjs().startOf('week'))
    ).length;
    
    return { totalHours, uniqueUsers, thisWeekLogs };
  };

  const stats = calculateStats();

  const formatDate = (dateString: string): string => {
    try {
      return dayjs(dateString).format('MMM D, YYYY');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getTimeColor = (hours: number) => {
    if (hours >= 8) return '#52c41a';
    if (hours >= 4) return '#faad14';
    return '#1890ff';
  };

  // Xử lý khi người dùng thay đổi giá trị trong input ở chế độ batch edit
  const handleBatchInputChange = (timelogId: number, field: keyof BatchUpdateItem | 'performerFullName', value: any) => {
    const currentChanges = editedData[timelogId] || { id: timelogId };
    let newTimelogStateChanges: Partial<EditableTimeLogData> = { [field as keyof EditableTimeLogData]: value };

    if (field === 'performerId') {
      const selectedUserFromSearch = searchedUsers.find(u => u.id === value);
      
      if (selectedUserFromSearch) {
        // Từ kết quả search, chúng ta chỉ có email
        newTimelogStateChanges.performerFullName = selectedUserFromSearch.email;
      } else if (currentEditingPerformer && currentEditingPerformer.id === value) {
        // Nếu user được chọn là user đang edit (có thể có fullName từ record gốc)
        newTimelogStateChanges.performerFullName = currentEditingPerformer.fullName || currentEditingPerformer.email;
      } else {
        // Fallback: cố gắng lấy từ record gốc nếu ID khớp
        const originalLog = timelogs.find(tl => tl.id === timelogId);
        if (originalLog && originalLog.performerId === value) {
          newTimelogStateChanges.performerFullName = originalLog.performerFullName;
        } else {
          newTimelogStateChanges.performerFullName = 'User ID: ' + value; // Hoặc một placeholder khác
        }
      }
      currentChanges.performerId = value as number;
    } else if (field === 'taskDate') {
      currentChanges.taskDate = value as string;
    } else if (field === 'taskDescription') {
      currentChanges.taskDescription = value as string;
    } else if (field === 'hoursSpent') {
      currentChanges.hoursSpent = value as number;
    }

    setEditedData(prev => ({
      ...prev,
      [timelogId]: currentChanges,
    }));

    setTimelogs(prevLogs =>
      prevLogs.map(log =>
        log.id === timelogId ? { ...log, ...newTimelogStateChanges } : log
      )
    );
  };

  const handleToggleBatchEditMode = () => {
    if (isBatchEditingMode) {
      setEditedData({});
    }
    setIsBatchEditingMode(!isBatchEditingMode);
    if (isBatchEditingMode) {
      setSelectedRowKeys([]);
    }
  };

  const handleSaveBatchChanges = async () => {
    const changesToSubmit: BatchUpdateItem[] = Object.values(editedData)
      .filter((item): item is BatchUpdateItem => 
        item.id !== undefined && Object.keys(item).length > 1
      );

    if (changesToSubmit.length === 0) {
      message.info('No changes to save.');
      setIsBatchEditingMode(false);
      return;
    }

    setLoading(true);
    try {
      await batchUpdateTimeLogsApi(changesToSubmit);
      message.success('Time logs updated successfully!');
      setIsBatchEditingMode(false);
      setEditedData({});
      setSelectedRowKeys([]);
      fetchTimelogs();
    } catch (err) {
      console.error('Error batch updating time logs:', err);
      message.error('Failed to update time logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.info('Please select time logs to delete.');
      return;
    }

    const idsToDelete = selectedRowKeys.map(key => Number(key));

    setBatchDeleting(true);
    try {
      await batchDeleteTimeLogsApi(idsToDelete);
      message.success(`${selectedRowKeys.length} time log(s) deleted successfully!`);
      setSelectedRowKeys([]);
      setEditedData(prevData => {
        const newData = { ...prevData };
        idsToDelete.forEach(id => delete newData[id]);
        return newData;
      });
      fetchTimelogs();
    } catch (err) {
      console.error('Error batch deleting time logs:', err);
      if (err instanceof Error && err.message) {
        message.error(err.message);
      } else {
        message.error('Failed to delete selected time logs.');
      }
    } finally {
      setBatchDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1);
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const handleUploadError = useCallback(() => {
    fetchTimelogs();
  }, [fetchTimelogs]);

  // Cấu hình cột cho Table (đã xóa cột Actions)
  const columns = [
    {
      title: 'Task Description',
      dataIndex: 'taskDescription',
      key: 'taskDescription',
      width: '40%',
      render: (text: string, record: EditableTimeLogData) => {
        if (isBatchEditingMode && selectedRowKeys.includes(record.id)) {
          return (
            <Input
              value={editedData[record.id]?.taskDescription ?? record.taskDescription}
              onChange={(e) => handleBatchInputChange(record.id, 'taskDescription', e.target.value)}
              onPressEnter={(e) => (e.target as HTMLInputElement).blur()}
            />
          );
        }
        return <Text strong style={{ fontSize: '16px' }}>{text}</Text>;
      },
    },
    {
      title: 'Hours',
      dataIndex: 'hoursSpent',
      key: 'hoursSpent',
      align: 'center' as const,
      width: '15%',
      render: (hours: number, record: EditableTimeLogData) => {
        if (isBatchEditingMode && selectedRowKeys.includes(record.id)) {
          return (
            <InputNumber
              min={0.01}
              precision={2}
              value={editedData[record.id]?.hoursSpent ?? record.hoursSpent}
              style={{ width: '100%' }}
              onChange={(value) => handleBatchInputChange(record.id, 'hoursSpent', value)}
            />
          );
        }
        return <Tag color={getTimeColor(hours)} style={{ borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}>{hours}h</Tag>;
      },
    },
    {
      title: 'Performer',
      dataIndex: 'performerFullName',
      key: 'performer',
      width: '25%',
      render: (text: string, record: EditableTimeLogData) => {
        if (isBatchEditingMode && selectedRowKeys.includes(record.id)) {
          let selectOptions: (UserIdAndEmailResponse & { fullName?: string })[] = [...searchedUsers];
          const performerInEdit = editedData[record.id]?.performerId ?? record.performerId;

          const currentRecordPerformerInfo = {
            id: record.performerId,
            email: (record as any).performerEmail || '',
            fullName: record.performerFullName
          };

          if (performerInEdit) {
            const existingOption = selectOptions.find(u => u.id === performerInEdit);
            if (!existingOption) {
              let userToAdd = currentEditingPerformer && currentEditingPerformer.id === performerInEdit ?
                currentEditingPerformer :
                (currentRecordPerformerInfo.id === performerInEdit ? currentRecordPerformerInfo : null);

              if (userToAdd) {
                selectOptions = [userToAdd, ...selectOptions.filter(u => u.id !== userToAdd!.id)];
              }
            } else {
              selectOptions = selectOptions.map(opt =>
                opt.id === performerInEdit ? { ...opt, fullName: currentRecordPerformerInfo.fullName || opt.email } : opt
              );
            }
          }

          return (
            <Select
              value={performerInEdit}
              style={{ width: '100%' }}
              showSearch
              placeholder="Search performer"
              defaultActiveFirstOption={false}
              filterOption={false}
              onSearch={handleUserSearch}
              onChange={(selectedUserId) => {
                let userToSetAsCurrent: UserIdAndEmailResponse & { fullName?: string } | null = null;
                const foundInSearch = searchedUsers.find(u => u.id === selectedUserId);
                if (foundInSearch) {
                  userToSetAsCurrent = { ...foundInSearch, fullName: (foundInSearch as any).fullName || foundInSearch.email };
                } else if (record.performerId === selectedUserId) {
                  userToSetAsCurrent = { id: record.performerId, email: (record as any).performerEmail || '', fullName: record.performerFullName };
                }
                if (userToSetAsCurrent) setCurrentEditingPerformer(userToSetAsCurrent);
                handleBatchInputChange(record.id, 'performerId', selectedUserId);
              }}
              onFocus={() => {
                setCurrentEditingPerformer({
                  id: record.performerId,
                  email: (record as any).performerEmail || '',
                  fullName: record.performerFullName
                });
              }}
              loading={searchLoading}
              notFoundContent={searchLoading ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No users found" />}
            >
              {selectOptions.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  {user.fullName || user.email}
                </Select.Option>
              ))}
            </Select>
          );
        }
        return <Space><UserOutlined style={{ color: '#1890ff' }} /> <Text type="secondary">{record.performerFullName}</Text></Space>;
      },
    },
    {
      title: 'Task Date',
      dataIndex: 'taskDate',
      key: 'taskDate',
      width: '20%',
      render: (dateString: string, record: EditableTimeLogData) => {
        if (isBatchEditingMode && selectedRowKeys.includes(record.id)) {
          return (
            <DatePicker
              value={dayjs(editedData[record.id]?.taskDate ?? record.taskDate)}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              onChange={(date, dateStr) => handleBatchInputChange(record.id, 'taskDate', dateStr)}
            />
          );
        }
        return <Space><CalendarOutlined style={{ color: '#52c41a' }} /> <Text type="secondary">{formatDate(dateString)}</Text></Space>;
      },
    },
  ];

  // Cấu hình rowSelection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  if (loading && timelogs.length === 0 && !isBatchEditingMode) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">Loading time logs...</Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert 
        message="Error Loading Timelogs" 
        description={error} 
        type="error" 
        showIcon 
        style={{ borderRadius: '8px' }}
      />
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Header Section */}
      <Card 
        style={{ 
          marginBottom: '20px',
          borderRadius: '12px',
          background: theme === 'dark' ? '#1f1f1f' : '#fafafa'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#262626' }}>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                Time Tracking
              </Title>
              <Text type="secondary">Monitor and manage project time entries</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              {isBatchEditingMode ? (
                <>
                  <Popconfirm
                    title={`Delete ${selectedRowKeys.length} selected item(s)?`}
                    description="This action cannot be undone."
                    onConfirm={handleBatchDelete}
                    okText="Yes, Delete"
                    cancelText="No"
                    disabled={selectedRowKeys.length === 0 || batchDeleting || loading}
                    okButtonProps={{ danger: true, loading: batchDeleting }}
                  >
                    <Button
                      danger
                      icon={<DeleteFilled />}
                      disabled={selectedRowKeys.length === 0 || batchDeleting || loading}
                      loading={batchDeleting}
                    >
                      Delete Selected ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>

                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveBatchChanges}
                    disabled={Object.keys(editedData).length === 0 || loading || batchDeleting}
                    loading={loading && Object.keys(editedData).length > 0 && !batchDeleting}
                  >
                    Save Changes
                  </Button>
                  <Button
                    icon={<CloseCircleOutlined />}
                    onClick={handleToggleBatchEditMode}
                    disabled={loading || batchDeleting}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="default"
                    onClick={handleToggleBatchEditMode}
                    disabled={loading || timelogs.length === 0}
                  >
                    Batch Edit/Delete
                  </Button>
                  <Button
                    type="default"
                    icon={<UploadOutlined />}
                    onClick={() => setShowUploadArea(!showUploadArea)}
                    style={{ borderRadius: '6px' }}
                  >
                    {showUploadArea ? 'Hide Upload' : 'Bulk Upload'}
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddModalVisible(true)}
                    style={{ borderRadius: '6px' }}
                  >
                    Add Time Log
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>

        {/* Statistics Cards */}
        {timelogs.length > 0 && (
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={8}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center',
                  background: theme === 'dark' ? '#262626' : '#fff',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                <Statistic
                  title="Total Hours"
                  value={stats.totalHours}
                  suffix="h"
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center',
                  background: theme === 'dark' ? '#262626' : '#fff',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                <Statistic
                  title="Contributors"
                  value={stats.uniqueUsers}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card 
                size="small" 
                style={{ 
                  textAlign: 'center',
                  background: theme === 'dark' ? '#262626' : '#fff',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                <Statistic
                  title="This Week"
                  value={stats.thisWeekLogs}
                  suffix="entries"
                  valueStyle={{ color: '#faad14' }}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Upload Area */}
        {showUploadArea && (
          <div style={{ 
            marginTop: '16px',
            padding: '16px',
            background: theme === 'dark' ? '#1a1a1a' : '#f9f9f9',
            borderRadius: '8px',
            border: `1px dashed ${theme === 'dark' ? '#434343' : '#d9d9d9'}`
          }}>
            <FileDropUpload
              projectId={projectId}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              width="100%"
            />
          </div>
        )}
      </Card>

      {/* Time Logs Table */}
      {timelogs.length === 0 && !loading && !isBatchEditingMode ? (
        <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '12px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical">
                <Text type="secondary">No time entries found for this project</Text>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalVisible(true)}
                >
                  Create First Time Log
                </Button>
              </Space>
            }
          />
        </Card>
      ) : (
        <Card style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
          <Table
            rowKey="id"
            dataSource={timelogs}
            columns={columns}
            loading={loading || batchDeleting}
            pagination={false}
            rowSelection={isBatchEditingMode ? rowSelection : undefined}
            className="timelog-table"
            size="middle"
          />

          {/* Pagination */}
          {totalItems > 0 && (
            <div style={{ 
              padding: '16px 20px',
              borderTop: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
              background: theme === 'dark' ? '#1a1a1a' : '#fafafa'
            }}>
              <Row justify="end">
                <Pagination
                  current={currentPage + 1}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger
                  onShowSizeChange={handlePageSizeChange}
                  pageSizeOptions={['5', '10', '20', '50']}
                  showTotal={(total, range) => 
                    <Text type="secondary">{range[0]}-{range[1]} of {total} entries</Text>
                  }
                  style={{ margin: 0 }}
                />
              </Row>
            </div>
          )}
        </Card>
      )}

      {/* Modals */}
      <AddTimeLogModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={fetchTimelogs}
        projectId={projectId}
      />
    </div>
  );
};

export default TimelogDetailsDisplay;