import React from 'react';
import { Card, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import ProjectFileExplorer from './ProjectFileExplorer';
const { Title } = Typography;

const AttachmentDisplay: React.FC = () => {
  // Lấy projectId từ URL params
  const { projectId: projectIdString } = useParams<{ projectId: string }>();
  const projectId = projectIdString ? parseInt(projectIdString, 10) : undefined;

  return (
    <Card style={{ width: "100%" }}>
      <Title level={3} style={{ marginBottom: '20px' }}>File Explorer for Project</Title>

      {projectId && !isNaN(projectId) ? (
        <ProjectFileExplorer projectId={projectId} />
      ) : (
        <Typography.Text type="danger">
          Invalid or missing Project ID. Cannot display file explorer.
        </Typography.Text>
      )}
    </Card>
  );
};

export default AttachmentDisplay;