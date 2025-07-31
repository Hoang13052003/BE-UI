import React from "react";
import { Card, Typography } from "antd";
import { useParams } from "react-router-dom";
import ProjectFileExplorer from "./ProjectFileExplorer";
const { Title } = Typography;

const AttachmentDisplay: React.FC = () => {
  const { projectId, projectType } = useParams<{ projectId: string; projectType: string }>();

  return (
    <Card style={{ width: "100%" }}>
      <Title level={3} style={{ marginBottom: "20px" }}>
        File Explorer for Project ({projectType === "labor" ? "Labor" : "Fixed Price"})
      </Title>

      {projectId && projectType ? (
        <ProjectFileExplorer projectId={projectId} projectType={projectType} />
      ) : (
        <Typography.Text type="danger">
          Invalid or missing Project ID or Project Type. Cannot display file explorer.
        </Typography.Text>
      )}
    </Card>
  );
};

export default AttachmentDisplay;
