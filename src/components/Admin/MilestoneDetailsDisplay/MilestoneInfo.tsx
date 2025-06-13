import React from "react";
import { Typography, Progress } from "antd";

interface MilestoneInfoProps {
  name: string;
  description?: string | null;
  notes?: string | null;
  completed?: boolean;
  completionPercentage?: number | null;
}

const MilestoneInfo: React.FC<MilestoneInfoProps> = ({
  name,
  description,
  notes,
  completed,
  completionPercentage,
}) => {
  // Xử lý trường hợp completionPercentage là null, mặc định là 0
  const actualCompletionPercentage =
    completionPercentage === null ? 0 : completionPercentage;

  return (
    <div className="milestone-info">
      <Typography.Title level={5} style={{ margin: "0 0 8px 0" }}>
        {name}
      </Typography.Title>

      {/* Hiển thị Progress bar với giá trị mặc định là 0 nếu completionPercentage là null */}
      {completionPercentage !== undefined && (
        <div style={{ marginBottom: "12px" }}>
          <Progress
            percent={actualCompletionPercentage}
            size="small"
            status={completed ? "success" : "active"}
            strokeColor={completed ? "#52c41a" : undefined}
          />
        </div>
      )}

      {description && (
        <Typography.Paragraph style={{ margin: "0 0 8px 0" }}>
          {description}
        </Typography.Paragraph>
      )}

      {notes && (
        <Typography.Paragraph
          type="secondary"
          style={{ margin: 0, fontSize: "0.9em" }}
        >
          <strong>Notes:</strong> {notes}
        </Typography.Paragraph>
      )}
    </div>
  );
};

export default MilestoneInfo;
