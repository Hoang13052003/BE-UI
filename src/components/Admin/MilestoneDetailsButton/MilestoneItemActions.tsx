import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './MilestoneItemActions.css';

interface MilestoneItemActionsProps {
  milestoneId: number;
  projectId: number;
  onEdit: (milestoneId: number, projectId: number) => void;
  onDelete: (milestoneId: number) => void;
  disabled?: boolean;
}

const MilestoneItemActions: React.FC<MilestoneItemActionsProps> = ({
  milestoneId,
  projectId,
  onEdit,
  onDelete,
  disabled,
}) => {
  return (
    <Space size="small">
      <Tooltip title="Edit milestone">
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit(milestoneId, projectId)}
          size="small"
          disabled={disabled}
          className="action-button edit-button"
          style={{
            color: '#1890ff',
            borderRadius: '6px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Edit
        </Button>
      </Tooltip>
      
      <Tooltip title="Delete milestone">
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(milestoneId)}
          size="small"
          disabled={disabled}
          className="action-button delete-button"
          style={{
            color: '#ff4d4f',
            borderRadius: '6px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Delete
        </Button>
      </Tooltip>
    </Space>
  );
};

export default MilestoneItemActions;