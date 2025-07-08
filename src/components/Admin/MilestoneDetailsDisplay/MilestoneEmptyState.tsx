import React from "react";
import { Card, Empty, Button, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface MilestoneEmptyStateProps {
  onAddMilestone: () => void;
}

const MilestoneEmptyState: React.FC<MilestoneEmptyStateProps> = ({ onAddMilestone }) => (
  <Card style={{ textAlign: "center", padding: "40px", borderRadius: "12px" }}>
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <Space direction="vertical">
          <Text type="secondary">No milestones found for this project</Text>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddMilestone}>
            Create First Milestone
          </Button>
        </Space>
      }
    />
  </Card>
);

export default MilestoneEmptyState; 