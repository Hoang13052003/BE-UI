import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Typography,
  Spin,
  Alert,
  Space,
  Row,
  Col,
  Button,
  Popconfirm,
  message,
  Pagination,
  Card,
  Tag,
  Statistic,
  Empty,
} from "antd";
import {
  ClockCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  BarChartOutlined,
  TeamOutlined,
  DeleteFilled,
  SettingOutlined,
  CloseOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getTimeLogsByProjectIdApi,
  TimeLogResponse,
  batchDeleteTimeLogsApi,
} from "../../api/timelogApi";
import AddTimeLogModal from "./AddTimeLogModal";
import FileDropUpload from "../../components/Admin/FileDropUpload/FileDropUpload";
import { useUserSearch } from "../../hooks/useUserSearch";
import { useInlineEdit } from "../../hooks/useInlineEdit";
import { createInlineEditColumns } from "./InlineEditColumns";
import { UserIdAndEmailResponse } from "../../types/User";

const { Text, Title } = Typography;

interface TimelogDetailsDisplayProps {
  projectId: string;
  theme?: string;
  isAdmin?: boolean;
  onRefreshProgress?: () => void;
}

interface DisplayTimeLogData extends TimeLogResponse {}

const TimelogDetailsDisplay: React.FC<TimelogDetailsDisplayProps> = ({
  projectId,
  theme = "light",
  isAdmin = false,
  onRefreshProgress,
}) => {
  const [timelogs, setTimelogs] = useState<DisplayTimeLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoadComplete, setInitialLoadComplete] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchDeleting, setBatchDeleting] = useState<boolean>(false);
  const [isInBatchMode, setIsInBatchMode] = useState<boolean>(false);

  // USER SEARCH HOOK
  const { searchedUsers, searchLoading, handleUserSearch, resetSearch } =
    useUserSearch();
  const [currentPerformersMap, setCurrentPerformersMap] = useState<
    Record<number, UserIdAndEmailResponse & { fullName?: string }>
  >({});

  const fetchTimelogs = useCallback(
    async (showLoadingSpinner = true) => {
      if (showLoadingSpinner && !initialLoadComplete) setLoading(true);
      try {
        const { timelogs: timelogData, totalItems: newTotalItems } =
          await getTimeLogsByProjectIdApi(projectId, currentPage, pageSize);
        
        setTimelogs(timelogData);
        setTotalItems(newTotalItems);
        setError(null);
        if (!initialLoadComplete) setInitialLoadComplete(true);

        const performersMap: Record<
          number,
          UserIdAndEmailResponse & { fullName?: string }
        > = {};
        timelogData.forEach((tl) => {
          performersMap[tl.id] = {
            id: tl.performerId,
            email: '', // Email not provided in new endpoint
            fullName: tl.performerFullName,
          };
        });
        setCurrentPerformersMap(performersMap);
      } catch (err) {
        setError("Failed to load time logs. Please try again later.");
        console.error("Error fetching time logs:", err);
      } finally {
        if (showLoadingSpinner && !initialLoadComplete) setLoading(false);
      }
    },
    [projectId, currentPage, pageSize, initialLoadComplete]
  );
  const {
    editedData,
    batchSaving,
    hasUnsavedChanges,
    handleInlineEdit,
    handleBatchSave,
    handleMarkSelectedAsCompleted,
    resetEditedData,
  } = useInlineEdit({
    timelogs,
    setTimelogs,
    searchedUsers,
    currentPerformersMap,
    setCurrentPerformersMap,
    onRefreshData: () => {
      fetchTimelogs(false);
      if (onRefreshProgress) onRefreshProgress();
    },
  });

  useEffect(() => {
    if (projectId && projectId.trim() !== '') {
      fetchTimelogs();
    }
  }, [fetchTimelogs, projectId]);
  const handleUploadComplete = useCallback(() => {
    fetchTimelogs(false);
    message.success("Time logs uploaded successfully");
    if (onRefreshProgress) onRefreshProgress();
  }, [fetchTimelogs, onRefreshProgress]);

  const handleToggleBatchMode = () => {
    setIsInBatchMode(!isInBatchMode);
    if (isInBatchMode) {
      setSelectedRowKeys([]);
      resetEditedData();
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.info("Please select time logs to delete.");
      return;
    }
    const idsToDelete = selectedRowKeys.map((key) => Number(key));
    setBatchDeleting(true);
    try {
      await batchDeleteTimeLogsApi(idsToDelete);
      message.success(
        `${selectedRowKeys.length} time log(s) deleted successfully!`
      );
      setSelectedRowKeys([]);
      setIsInBatchMode(false);
      fetchTimelogs(false);
      // Refresh progress overview after batch delete
      if (onRefreshProgress) onRefreshProgress();
    } catch (err) {
      console.error("Error batch deleting time logs:", err);
      if (err instanceof Error && err.message) {
        message.error(err.message);
      } else {
        message.error("Failed to delete selected time logs.");
      }
    } finally {
      setBatchDeleting(false);
    }
  };

  const calculateStats = () => {
    const totalHours = timelogs.reduce((sum, log) => sum + log.hoursSpent, 0);
    const uniqueUsers = new Set(
      timelogs.map((log) => log.performerFullName || "N/A")
    ).size;
    const thisWeekLogs = timelogs.filter((log) =>
      dayjs(log.taskDate).isAfter(dayjs().startOf("week"))
    ).length;
    return { totalHours, uniqueUsers, thisWeekLogs };
  };
  const stats = calculateStats();

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

  // CREATE COLUMNS WITH INLINE EDITING
  const columns = createInlineEditColumns({
    isInBatchMode,
    isAdmin,
    editedData,
    searchedUsers,
    currentPerformersMap,
    searchLoading,
    batchSaving,
    batchDeleting,
    onInlineEdit: handleInlineEdit,
    onUserSearch: handleUserSearch,
    onResetSearch: resetSearch,
  });

  const rowSelectionConfig = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  if (!initialLoadComplete && loading) {
    return (
      <Card style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
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
        style={{ borderRadius: "8px" }}
      />
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <Card
        style={{
          marginBottom: "20px",
          borderRadius: "12px",
          background: theme === "dark" ? "#1f1f1f" : "#fafafa",
        }}
        styles={{ body: { padding: "20px" } }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "16px" }}
        >
          <Col>
            <Space direction="vertical" size={4}>
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: theme === "dark" ? "#fff" : "#262626",
                }}
              >
                <ClockCircleOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                Time Tracking{" "}
                {isInBatchMode && <Tag color="processing">Batch Mode</Tag>}
                {hasUnsavedChanges && (
                  <Tag color="warning">Unsaved Changes</Tag>
                )}
              </Title>
              <Text type="secondary">
                {isInBatchMode
                  ? "Click directly on fields to edit, select items for batch actions"
                  : "Monitor and manage project time entries"}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              {/* BATCH MODE ACTIONS */}
              {isAdmin && isInBatchMode && (
                <>
                  {hasUnsavedChanges && (
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleBatchSave}
                      loading={batchSaving}
                      disabled={batchDeleting}
                    >
                      Save Changes ({Object.keys(editedData).length})
                    </Button>
                  )}
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={() =>
                      handleMarkSelectedAsCompleted(selectedRowKeys)
                    }
                    disabled={batchSaving || selectedRowKeys.length === 0}
                    loading={batchSaving}
                  >
                    Mark as Completed ({selectedRowKeys.length})
                  </Button>
                  <Popconfirm
                    title={`Delete ${selectedRowKeys.length} selected item(s)?`}
                    description="This action cannot be undone."
                    onConfirm={handleBatchDelete}
                    disabled={
                      selectedRowKeys.length === 0 ||
                      batchDeleting ||
                      batchSaving
                    }
                    okButtonProps={{ danger: true, loading: batchDeleting }}
                    okText="Yes, Delete"
                    cancelText="No"
                  >
                    <Button
                      danger
                      icon={<DeleteFilled />}
                      disabled={
                        selectedRowKeys.length === 0 ||
                        batchDeleting ||
                        batchSaving
                      }
                      loading={batchDeleting}
                    >
                      Delete Selected ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleToggleBatchMode}
                    disabled={batchSaving || batchDeleting}
                  >
                    Exit Batch Mode
                  </Button>
                </>
              )}

              {isAdmin && !isInBatchMode && timelogs.length > 0 && (
                <Button
                  icon={<SettingOutlined />}
                  onClick={handleToggleBatchMode}
                  loading={loading}
                >
                  Enter Batch Mode
                </Button>
              )}

              {/* NORMAL MODE ACTIONS */}
              {!isInBatchMode && (
                <>
                  <Button
                    type="default"
                    icon={<UploadOutlined />}
                    onClick={() => setShowUploadArea(!showUploadArea)}
                    style={{ borderRadius: "6px" }}
                  >
                    {showUploadArea ? "Hide Upload" : "Bulk Upload"}
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddModalVisible(true)}
                    style={{ borderRadius: "6px" }}
                  >
                    Add Time Log
                  </Button>
                </>
              )}

              {!isAdmin && selectedRowKeys.length > 0 && (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  {" "}
                  ({selectedRowKeys.length} item(s) selected)
                </Text>
              )}
            </Space>
          </Col>
        </Row>

        {stats.totalHours > 0 && !isInBatchMode && (
          <Row gutter={16} style={{ marginBottom: "16px" }}>
            <Col xs={12} sm={8}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  background: theme === "dark" ? "#262626" : "#fff",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                <Statistic
                  title="Total Hours"
                  value={stats.totalHours}
                  valueStyle={{ color: "#1890ff", fontSize: "20px" }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  background: theme === "dark" ? "#262626" : "#fff",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                <Statistic
                  title="Team Members"
                  value={stats.uniqueUsers}
                  valueStyle={{ color: "#52c41a", fontSize: "20px" }}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  background: theme === "dark" ? "#262626" : "#fff",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                <Statistic
                  title="This Week"
                  value={stats.thisWeekLogs}
                  valueStyle={{ color: "#faad14", fontSize: "20px" }}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {showUploadArea && !isInBatchMode && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              background: theme === "dark" ? "#262626" : "#f8f9fa",
              borderRadius: "8px",
              border: `1px dashed ${theme === "dark" ? "#595959" : "#d9d9d9"}`,
            }}
          >
            <FileDropUpload
              projectId={projectId}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              width="100%"
            />
          </div>
        )}
      </Card>
      {timelogs.length === 0 && initialLoadComplete && !loading ? (
        <Card
          style={{ textAlign: "center", padding: "40px", borderRadius: "12px" }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical">
                <Text type="secondary">
                  No time entries found for this project
                </Text>
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
        <Card
          style={{ borderRadius: "12px" }}
          styles={{ body: { padding: "0" } }}
        >
          <Table
            rowKey="id"
            dataSource={timelogs}
            columns={columns}
            loading={loading || batchDeleting || batchSaving}
            pagination={false}
            rowSelection={
              isAdmin && isInBatchMode ? rowSelectionConfig : undefined
            }
            className="timelog-table"
            size="middle"
          />
          {totalItems > 0 && (
            <div
              style={{
                padding: "16px 20px",
                borderTop: `1px solid ${
                  theme === "dark" ? "#303030" : "#f0f0f0"
                }`,
                background: theme === "dark" ? "#1a1a1a" : "#fafafa",
              }}
            >
              <Row justify="end">
                <Pagination
                  current={currentPage + 1}
                  pageSize={pageSize}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger
                  onShowSizeChange={handlePageSizeChange}
                  pageSizeOptions={["5", "10", "20", "50"]}
                  showTotal={(total, range) => (
                    <Text type="secondary">
                      {range[0]}-{range[1]} of {total} entries
                    </Text>
                  )}
                  style={{ margin: 0 }}
                />
              </Row>
            </div>
          )}
        </Card>
      )}{" "}
      <AddTimeLogModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={() => {
          fetchTimelogs(false);
          // Refresh progress overview after adding new timelog
          if (onRefreshProgress) onRefreshProgress();
        }}
        projectId={projectId}
      />
    </div>
  );
};

export default TimelogDetailsDisplay;
