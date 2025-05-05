// filepath: d:\labsparkmind\BE-UI\src\components\Admin\MilestoneDetailsDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { List, Typography, Spin, Alert, Tag, Space, Row, Col, Divider, Button } from 'antd'; // Import Button
import {
  CalendarOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined // Import PlusOutlined for the button icon
} from '@ant-design/icons';
import { getMilestonesByProjectIdApi } from '../../api/milestoneApi'; // Ensure this API path is correct
import { Milestone, MilestoneStatus } from '../../types/milestone'; // Ensure types path is correct

const { Text, Title, Paragraph } = Typography;

interface MilestoneDetailsDisplayProps {
  projectId: number;
  onAddMilestone: () => void; // Add prop to handle Add Milestone click
}

const MilestoneDetailsDisplay: React.FC<MilestoneDetailsDisplayProps> = ({ projectId, onAddMilestone }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch milestones function (using useCallback for potential optimization)
  const fetchMilestones = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      setError("Invalid Project ID provided.");
      setMilestones([]); // Clear milestones on invalid ID
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Ensure getMilestonesByProjectIdApi exists and works
      const data = await getMilestonesByProjectIdApi(projectId);
      // Ensure data is always an array, even if API returns null/undefined
      setMilestones(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(`Failed to fetch milestones for project ${projectId}:`, err);
      setError(err.response?.data?.message || 'Failed to load milestone details.');
      setMilestones([]); // Clear milestones on error
    } finally {
      setLoading(false);
    }
  }, [projectId]); // Dependency array includes projectId

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]); // Run effect when fetchMilestones changes (i.e., projectId changes)

  // Updated formatDate function to return "emty" for null/undefined values
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'emty'; // Return "emty" for null/undefined
    try {
      const date = new Date(dateString);
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        console.warn("Invalid Date encountered:", dateString);
        return 'emty'; // Return "emty" for invalid date
      }
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'emty'; // Return "emty" on error
    }
  };

  // Function to get status color, handles null status
  const getMilestoneStatusColor = (status: MilestoneStatus | null | undefined): string => {
    if (!status) return 'default'; // Handle null or undefined

    switch (String(status).toUpperCase()) { // Convert to string before uppercasing
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'processing';
      case 'PENDING': return 'default';
      case 'DELAYED': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  // Function to get icon based on status
  const getStatusIcon = (status: MilestoneStatus | null | undefined) => {
     if (!status) return null; // Handle null or undefined

    switch (String(status).toUpperCase()) { // Convert to string before uppercasing
      case 'COMPLETED': return <CheckCircleOutlined />;
      case 'IN_PROGRESS': return <ClockCircleOutlined />;
      case 'PENDING': return <FlagOutlined />;
      // Add icons for other statuses if desired
      case 'DELAYED': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'CANCELLED': return <FileTextOutlined style={{ color: '#f5222d' }} />; // Example icon
      default: return null;
    }
  };


  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
  }

  if (error) {
    return <Alert message="Error Loading Milestones" description={error} type="error" showIcon />;
  }

  return (
    <div> {/* Wrap content in a div */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
         <Col>
            <Title level={5} style={{ margin: 0 }}>Milestones</Title>
         </Col>
         <Col>
            {/* Add Milestone Button */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAddMilestone} // Call the passed function
            >
              Add Milestone
            </Button>
         </Col>
      </Row>

      {/* Display message if no milestones */}
      {(!Array.isArray(milestones) || milestones.length === 0) && !loading && !error && (
         <Text type="secondary">No milestones found for this project. Click "Add Milestone" to create one.</Text>
      )}

      {/* Render list only if milestones exist */}
      {Array.isArray(milestones) && milestones.length > 0 && (
        <List
          className="milestone-list"
          itemLayout="horizontal"
          dataSource={milestones}
          renderItem={(item) => (
            <List.Item
              key={item.id} // Ensure unique key
              className="milestone-item"
              style={{
                padding: '16px',
                borderRadius: '6px',
                background: '#ffffff', // Changed background slightly
                marginBottom: '12px', // Increased spacing
                border: '1px solid #f0f0f0'
              }}
            >
              <Row gutter={[16, 16]} style={{ width: '100%' }}>
                {/* Left Column: Title, Description, Notes */}
                <Col xs={24} sm={16} md={18}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Text strong style={{ fontSize: '16px' }}>
                      {item.title || 'emty'} {/* Use "emty" as fallback */}
                    </Text>
                    <Paragraph type="secondary" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                      {item.description || 'emty'} {/* Use "emty" as fallback */}
                    </Paragraph>
                    <div style={{ marginTop: 8 }}>
                      <Space align="start">
                        <FileTextOutlined style={{ color: '#8c8c8c', marginTop: '4px' }} />
                        <Paragraph type="secondary" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {item.notes || 'emty'} {/* Use "emty" as fallback */}
                        </Paragraph>
                      </Space>
                    </div>
                  </Space>
                </Col>

                {/* Right Column: Status, Dates */}
                <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
                  <Space direction="vertical" size={8} align="end">
                    <Tag
                      color={getMilestoneStatusColor(item.status)}
                      icon={getStatusIcon(item.status)}
                      style={{ padding: '2px 8px', fontSize: '13px', margin: 0 }}
                    >
                      {item.status ? String(item.status).replace('_', ' ') : 'emty'}
                    </Tag>
                    <Space direction="vertical" size={4} style={{ fontSize: '12px' }}>
                      <Space size={4}>
                        <CalendarOutlined />
                        <Text type="secondary">Start: {formatDate(item.startDate)}</Text>
                      </Space>
                      <Space size={4}>
                        <CalendarOutlined />
                        <Text type="secondary">Due: {formatDate(item.endDate)}</Text>
                      </Space>
                      <Space size={4}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <Text type="secondary">Completed: {formatDate(item.completionDate)}</Text>
                      </Space>
                    </Space>
                  </Space>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default MilestoneDetailsDisplay;