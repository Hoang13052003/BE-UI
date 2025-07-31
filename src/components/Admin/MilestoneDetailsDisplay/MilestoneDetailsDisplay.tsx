import React from "react";
import { Card, Alert, Tag, Space, Row, Col, Button, Typography } from "antd";
import { TrophyOutlined, SettingOutlined, PlusOutlined } from "@ant-design/icons";
import MilestoneStats from "./MilestoneStats";
import MilestoneTable from "./MilestoneTable";
import MilestoneEmptyState from "./MilestoneEmptyState";
import MilestoneBatchActions from "./MilestoneBatchActions";
import { useMilestoneList } from "./useMilestoneList";
import { useInlineEditMilestone } from "../../../hooks/useInlineEditMilestone";
import { isMilestoneCompleted, isOverdueMilestone, calculateMilestoneStats } from "../../../utils/milestoneUtils";

const { Text, Title } = Typography;

interface MilestoneDetailsDisplayProps {
  projectId: string;
  onAddMilestone: (onSuccessRefresh?: () => void) => void;
  onEditMilestone?: (
    milestoneId: number,
    projectId: string,
    onSuccessRefresh?: () => void
  ) => void;
  milestoneCount?: number;
  theme?: string;
  onRefreshProgress?: () => void;
}

const MilestoneDetailsDisplay: React.FC<MilestoneDetailsDisplayProps> = ({
  projectId,
  onAddMilestone,
  onEditMilestone,
  theme = "light",
  onRefreshProgress,
}) => {
  // Custom hook quản lý danh sách milestone
  const {
    milestones,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    setCurrentPage,
    setPageSize,
    fetchMilestones,
    setMilestones,
  } = useMilestoneList(projectId);

  // Custom hook inline edit (giữ nguyên logic cũ)
  const {
    editedData,
    batchSaving,
    hasUnsavedChanges,
    handleBatchSave,
    handleMarkSelectedAsCompleted,
    resetEditedData,
  } = useInlineEditMilestone({
    setMilestones,
    onRefreshData: () => {
      fetchMilestones();
      if (onRefreshProgress) onRefreshProgress();
    },
  });

  // State cho batch mode
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [batchDeleting, setBatchDeleting] = React.useState<boolean>(false);
  const [isInBatchMode, setIsInBatchMode] = React.useState<boolean>(false);
  const [_viewMode, setViewMode] = React.useState<"card" | "table">("card");

  // Hàm tính toán thống kê
  // Thay thế các hàm cục bộ bằng hàm import từ utils
  // const calculateStats = () => {
  //   const total = milestones.length;
  //   const completed = milestones.filter((m) => isMilestoneCompleted(m)).length;
  //   const inProgress = milestones.filter(
  //     (m) => !isMilestoneCompleted(m) && (m.status === "TODO" || m.status === "DOING")
  //   ).length;
  //   const overdue = milestones.filter((m) => isOverdueMilestone(m)).length;
  //   return { total, completed, inProgress, overdue };
  // };

  // Hàm kiểm tra milestone hoàn thành
  // const isMilestoneCompleted = (milestone: Milestone): boolean => {
  //   return (
  //     milestone.completionDate !== null &&
  //     milestone.completionDate !== undefined &&
  //     milestone.completionDate !== ""
  //   );
  // };
  // Hàm kiểm tra milestone quá hạn
  // const isOverdueMilestone = (milestone: Milestone): boolean => {
  //   if (!milestone.deadlineDate) return false;
  //   const deadlineDate = new Date(milestone.deadlineDate);
  //   const isCompleted = isMilestoneCompleted(milestone);
  //   if (isCompleted) {
  //     const completionDate = new Date(milestone.completionDate!);
  //     const deadlineEndOfDay = new Date(deadlineDate);
  //     deadlineEndOfDay.setHours(23, 59, 59, 999);
  //     return completionDate > deadlineEndOfDay;
  //   } else {
  //     const currentDate = new Date();
  //     const deadlineEndOfDay = new Date(deadlineDate);
  //     deadlineEndOfDay.setHours(23, 59, 59, 999);
  //     return currentDate > deadlineEndOfDay;
  //   }
  // };
  // Hàm format ngày
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Xử lý phân trang
  const handlePageChange = (page: number) => setCurrentPage(page - 1);
  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  // Xử lý batch mode
  const handleToggleBatchMode = () => {
    setIsInBatchMode(!isInBatchMode);
    if (isInBatchMode) {
      setSelectedRowKeys([]);
      resetEditedData();
      setViewMode("card");
    } else {
      setViewMode("table");
    }
  };
  // Xử lý batch delete
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    setBatchDeleting(true);
    try {
      // Gọi API xóa batch (bạn có thể import lại nếu cần)
      // await batchDeleteMilestonesApi(selectedRowKeys.map(Number));
      setSelectedRowKeys([]);
      setIsInBatchMode(false);
      setViewMode("card");
      fetchMilestones();
      if (onRefreshProgress) onRefreshProgress();
    } catch (err) {
      // Xử lý lỗi
    } finally {
      setBatchDeleting(false);
    }
  };

  // Hiển thị loading
  if (loading && milestones.length === 0) {
    return (
      <Card style={{ textAlign: "center", padding: "40px", borderRadius: "12px" }}>
        <span>Đang tải dữ liệu...</span>
      </Card>
    );
  }
  // Hiển thị lỗi
  if (error && milestones.length === 0) {
    return (
      <Alert message="Lỗi tải dữ liệu Milestone" description={error} type="error" showIcon style={{ borderRadius: "8px" }} />
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: "16px", borderRadius: "12px", background: theme === "dark" ? "#1f1f1f" : "#fafafa" }} bodyStyle={{ padding: "18px" }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: "12px" }}>
          <Col>
            <Space direction="vertical" size={4}>
              <Title level={4} style={{ margin: 0, color: theme === "dark" ? "#fff" : "#262626" }}>
                <TrophyOutlined style={{ marginRight: "8px", color: "#faad14" }} />
                Project Milestones
                {isInBatchMode && <Tag color="processing">Batch Mode</Tag>}
                {hasUnsavedChanges && <Tag color="warning">Unsaved Changes</Tag>}
              </Title>
              <Text type="secondary">
                {isInBatchMode
                  ? "Click trực tiếp để chỉnh sửa, chọn mục để thao tác batch"
                  : "Quản lý các mốc dự án"}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              {isInBatchMode ? (
                <MilestoneBatchActions
                  hasUnsavedChanges={hasUnsavedChanges}
                  batchSaving={batchSaving}
                  batchDeleting={batchDeleting}
                  selectedRowKeys={selectedRowKeys}
                  onBatchSave={handleBatchSave}
                  onMarkSelectedAsCompleted={handleMarkSelectedAsCompleted}
                  onBatchDelete={handleBatchDelete}
                  onExitBatchMode={handleToggleBatchMode}
                  editedDataCount={Object.keys(editedData).length}
                />
              ) : (
                <>
                  {milestones.length > 0 && (
                    <Button icon={<SettingOutlined />} onClick={handleToggleBatchMode} loading={loading}>
                      Chế độ batch
                    </Button>
                  )}
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => onAddMilestone(fetchMilestones)} style={{ borderRadius: "6px" }}>
                    Thêm Milestone
                  </Button>
                </>
              )}
              {selectedRowKeys.length > 0 && (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  ({selectedRowKeys.length} mục đã chọn)
                </Text>
              )}
            </Space>
          </Col>
        </Row>
        {/* Thống kê */}
        {milestones.length > 0 && <MilestoneStats stats={calculateMilestoneStats(milestones)} theme={theme} />}
      </Card>
      {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: "16px", borderRadius: "8px" }} />}
      {/* Empty State */}
      {(!Array.isArray(milestones) || milestones.length === 0) && !loading && !error && (
        <MilestoneEmptyState onAddMilestone={() => onAddMilestone(fetchMilestones)} />
      )}
      {/* Milestone List */}
      {Array.isArray(milestones) && milestones.length > 0 && (
        <MilestoneTable
          milestones={milestones}
          loading={loading}
          totalItems={totalItems}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEditMilestone={onEditMilestone}
          onDeleteMilestone={() => {}}
          projectId={projectId}
          formatDate={formatDate}
          isOverdueMilestone={isOverdueMilestone}
          isMilestoneCompleted={isMilestoneCompleted}
          theme={theme}
        />
      )}
    </div>
  );
};

export default MilestoneDetailsDisplay; 