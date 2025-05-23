import React from 'react';
import { Card, Typography } from 'antd';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

const AttachmentDisplay: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <Card style={{ width: "100%" }}>
      <Title level={2}>Hello World</Title>
      <p>Project ID: {projectId}</p>
    </Card>
  );
};

export default AttachmentDisplay;