import React from "react";
import { Button, Popconfirm } from "antd";
import { SaveOutlined, CheckCircleOutlined, DeleteFilled, CloseOutlined } from "@ant-design/icons";

interface MilestoneBatchActionsProps {
  hasUnsavedChanges: boolean;
  batchSaving: boolean;
  batchDeleting: boolean;
  selectedRowKeys: React.Key[];
  onBatchSave: () => void;
  onMarkSelectedAsCompleted: (selected: React.Key[]) => void;
  onBatchDelete: () => void;
  onExitBatchMode: () => void;
  editedDataCount: number;
}

const MilestoneBatchActions: React.FC<MilestoneBatchActionsProps> = ({
  hasUnsavedChanges,
  batchSaving,
  batchDeleting,
  selectedRowKeys,
  onBatchSave,
  onMarkSelectedAsCompleted,
  onBatchDelete,
  onExitBatchMode,
  editedDataCount,
}) => (
  <>
    {hasUnsavedChanges && (
      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={onBatchSave}
        loading={batchSaving}
        disabled={batchDeleting}
      >
        Lưu thay đổi ({editedDataCount})
      </Button>
    )}
    <Button
      icon={<CheckCircleOutlined />}
      onClick={() => onMarkSelectedAsCompleted(selectedRowKeys)}
      disabled={batchSaving || selectedRowKeys.length === 0}
      loading={batchSaving}
    >
      Đánh dấu hoàn thành ({selectedRowKeys.length})
    </Button>
    <Popconfirm
      title={`Xóa ${selectedRowKeys.length} mục đã chọn?`}
      description="Hành động này không thể hoàn tác."
      onConfirm={onBatchDelete}
      disabled={selectedRowKeys.length === 0 || batchDeleting || batchSaving}
      okButtonProps={{ danger: true, loading: batchDeleting }}
      okText="Xóa"
      cancelText="Hủy"
    >
      <Button
        danger
        icon={<DeleteFilled />}
        disabled={selectedRowKeys.length === 0 || batchDeleting || batchSaving}
        loading={batchDeleting}
      >
        Xóa đã chọn ({selectedRowKeys.length})
      </Button>
    </Popconfirm>
    <Button
      icon={<CloseOutlined />}
      onClick={onExitBatchMode}
      disabled={batchSaving || batchDeleting}
    >
      Thoát chế độ batch
    </Button>
  </>
);

export default MilestoneBatchActions; 