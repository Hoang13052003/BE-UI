import React from 'react';
import { Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface MilestoneItemActionsProps {
  milestoneId: number;
  projectId: number; // Cần projectId để truyền lại cho onEditMilestone
  onEdit: (milestoneId: number, projectId: number) => void; // Sửa lại để nhận projectId
  onDelete: (milestoneId: number) => void;
  disabled?: boolean; // Để disable các nút khi có hành động khác đang diễn ra (ví dụ: updating completion)
}

const MilestoneItemActions: React.FC<MilestoneItemActionsProps> = ({
  milestoneId,
  projectId,
  onEdit,
  onDelete,
  disabled,
}) => {
  return (
    <Space>
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={() => onEdit(milestoneId, projectId)}
        size="small"
        disabled={disabled}
      >
        Edit
      </Button>
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={() => onDelete(milestoneId)}
        size="small"
        disabled={disabled}
      >
        Delete
      </Button>
    </Space>
  );
};

export default MilestoneItemActions;