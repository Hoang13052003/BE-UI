import React from "react";
import {
  Card,
  Typography,
  Space,
  Empty,
} from "antd";
import {
  HistoryOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import ProjectUpdateHistoryDisplay from "./ProjectUpdateHistoryDisplay";

const { Title } = Typography;

interface ProjectHistoryTabProps {
  projectType: "LABOR" | "FIXED_PRICE";
  historyKey?: string; // Snapshot data key
}

const ProjectHistoryTab: React.FC<ProjectHistoryTabProps> = ({ 
  projectType,
  historyKey
}) => {
  return (
    <Card
      title={
        <Space>
          <HistoryOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {projectType === "LABOR" ? "Timelog History" : "Milestone History"}
          </Title>
        </Space>
      }
    >
      {historyKey ? (
        <ProjectUpdateHistoryDisplay historyId={historyKey} projectType={projectType} />
      ) : (
        <Empty
          description="No snapshot data available for this update"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: "40px 0" }}
        />
      )}
    </Card>
  );
};

export default ProjectHistoryTab; 