// filepath: d:\labsparkmind\BE-UI\src\components\Admin\MilestoneDetailsDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { List, Typography, Spin, Alert, Tag, Space, Row, Col, Button, Checkbox, message } from 'antd'; // Removed AntModal
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css (better to import globally in App.tsx or index.tsx)
import {
  CalendarOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined, // Vẫn cần nếu dùng ở đâu đó khác, hoặc có thể bỏ nếu ActionButton đã có
  DeleteOutlined // Vẫn cần nếu dùng ở đâu đó khác, hoặc có thể bỏ nếu ActionButton đã có
} from '@ant-design/icons';
import {
  getMilestonesByProjectIdApi,
  deleteMilestoneApi,
  updateMilestoneCompletionStatusApi,
  isMilestoneCompletedApi // <<< ADD THIS IMPORT
} from '../../api/milestoneApi';
import { Milestone, MilestoneStatus } from '../../types/milestone';
import MilestoneItemActions from './MilestoneDetailsButton/MilestoneItemActions';
import MilestoneInfo from './MilestoneDetailsDisplay/MilestoneInfo'; // Import component mới

const { Text, Paragraph } = Typography;

interface MilestoneDetailsDisplayProps {
  projectId: number;
  onAddMilestone: (onSuccessRefresh?: () => void) => void;
  onEditMilestone: (milestoneId: number, projectId: number, onSuccessRefresh?: () => void) => void;
}

const MilestoneDetailsDisplay: React.FC<MilestoneDetailsDisplayProps> = ({ projectId, onAddMilestone, onEditMilestone }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingCompletionId, setUpdatingCompletionId] = useState<number | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      setError("Invalid Project ID provided.");
      setMilestones([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getMilestonesByProjectIdApi(projectId);
      setMilestones(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(`Failed to fetch milestones for project ${projectId}:`, err);
      setError(err.response?.data?.message || 'Failed to load milestone details.');
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handleDeleteMilestone = (milestoneId: number) => {
    console.log('handleDeleteMilestone called for milestoneId:', milestoneId);
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this milestone? This action cannot be undone.',
      buttons: [
        {
          label: 'Yes, delete it',
          onClick: async () => {
            try {
              await deleteMilestoneApi(milestoneId);
              setMilestones(prevMilestones => prevMilestones.filter(m => m.id !== milestoneId));
              message.success('Milestone deleted successfully!');
            } catch (err: any) {
              console.error(`Failed to delete milestone ${milestoneId}:`, err);
              message.error(err.response?.data?.message || 'Failed to delete milestone.');
            }
          }
        },
        {
          label: 'No, cancel',
          onClick: () => {}
        }
      ],
      overlayClassName: "custom-overlay-class-name" // Optional: for custom styling
    });
  };

  // Update the handleCompletionChange function to accept direct status instead of checkbox event
  const handleCompletionChange = async (item: Milestone, targetCompletedStatus: boolean) => {
    if (!item || typeof item.id === 'undefined') {
      message.error("Milestone data is invalid.");
      return;
    }

    setUpdatingCompletionId(item.id); // Indicate loading state early

    let currentServerCompletedStatus: boolean;
    try {
      currentServerCompletedStatus = await isMilestoneCompletedApi(item.id);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to verify current milestone status. Please try again.");
      console.error(`Failed to fetch isMilestoneCompleted for milestone ${item.id}:`, err);
      setUpdatingCompletionId(null);
      return;
    }

    // If local state is out of sync with server, update local state first
    // This 'item.completed' will be the most up-to-date version before attempting the change.
    let itemCompletedBeforeAttempt = item.completed;
    if (item.completed !== currentServerCompletedStatus) {
      setMilestones(prevMilestones =>
        prevMilestones.map(m => (m.id === item.id ? { ...m, completed: currentServerCompletedStatus } : m))
      );
      itemCompletedBeforeAttempt = currentServerCompletedStatus; // Update our reference
      // If after syncing, the target status is already met, no need to proceed with update
      if (currentServerCompletedStatus === targetCompletedStatus) {
        message.info(`Milestone is already ${targetCompletedStatus ? 'Done' : 'To Do'}. Refreshed status.`);
        setUpdatingCompletionId(null);
        return;
      }
    } else if (currentServerCompletedStatus === targetCompletedStatus) {
      // Local state was in sync, and it's already the target state
      message.info(`Milestone is already ${targetCompletedStatus ? 'Done' : 'To Do'}.`);
      setUpdatingCompletionId(null);
      return;
    }

    const actionText = targetCompletedStatus ? "mark as Done" : "mark as To Do";

    confirmAlert({
      title: `Confirm Action`,
      message: `Are you sure you want to ${actionText} this milestone: "${item.name || 'Unnamed Milestone'}"?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            console.log(`[HANDLE COMPLETION] User clicked Yes. Item ID: ${item.id}, Current item.completed: ${item.completed}, Target completed status: ${targetCompletedStatus}`);
            console.log(`[HANDLE COMPLETION] itemCompletedBeforeAttempt: ${itemCompletedBeforeAttempt}`);

            // 1. Optimistic UI Update: Change button state immediately
            setMilestones(prevMilestones => {
              const newMilestones = prevMilestones.map(m =>
                m.id === item.id ? { ...m, completed: targetCompletedStatus } : m
              );
              const updatedItemOptimistically = newMilestones.find(m => m.id === item.id);
              console.log("[OPTIMISTIC UPDATE] New item 'completed' status (optimistic):", updatedItemOptimistically?.completed);
              console.log("[OPTIMISTIC UPDATE] Full new milestones array (optimistic):", newMilestones);
              return newMilestones;
            });

            try {
              // 2. Call the API
              console.log(`[API CALL] Calling updateMilestoneCompletionStatusApi for ID: ${item.id} with completed: ${targetCompletedStatus}`);
              const updatedMilestone = await updateMilestoneCompletionStatusApi(item.id as number, targetCompletedStatus);
              console.log("[API CALL SUCCESS] Received updatedMilestone from API:", updatedMilestone);
              message.success(`Milestone successfully ${targetCompletedStatus ? 'marked as Done' : 'marked as To Do'}.`);
              
              // 3. Sync with the full server response
              setMilestones(prevMilestones => {
                const newMilestonesFromServer = prevMilestones.map(m => (m.id === item.id ? { ...updatedMilestone } : m));
                const finalUpdatedItem = newMilestonesFromServer.find(m => m.id === item.id);
                console.log("[SERVER SYNC] New item 'completed' status (from server):", finalUpdatedItem?.completed);
                console.log("[SERVER SYNC] Full new milestones array (from server):", newMilestonesFromServer);
                return newMilestonesFromServer;
              });

            } catch (err: any) {
              console.error("[API CALL FAILED]", err);
              message.error(`Failed to ${actionText}. ` + (err.response?.data?.message || err.message));
              // 4. Revert optimistic update on failure
              setMilestones(prevMilestones => {
                const revertedMilestones = prevMilestones.map(m =>
                  m.id === item.id ? { ...m, completed: itemCompletedBeforeAttempt } : m
                );
                const revertedItem = revertedMilestones.find(m => m.id === item.id);
                console.log("[REVERT] Reverted item 'completed' status to:", revertedItem?.completed);
                return revertedMilestones;
              });
            } finally {
              console.log("[FINALLY] Clearing updatingCompletionId");
              setUpdatingCompletionId(null);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {
            setUpdatingCompletionId(null); // Clear loading state if user cancels
          }
        }
      ],
      onClickOutside: () => {
        if (updatingCompletionId === item.id) {
          setUpdatingCompletionId(null);
        }
      },
    });
  };

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

  const getMilestoneStatusColor = (status: MilestoneStatus | null | undefined): string => {
    if (!status) return 'default'; // Handle null or undefined

    switch (String(status).toUpperCase()) { // Convert to string before uppercasing
      case 'NEW': return 'processing';
      case 'SENT': return 'blue';
      case 'REVIEWED': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: MilestoneStatus | null | undefined) => {
    if (!status) return null; // Handle null or undefined

    switch (String(status).toUpperCase()) { // Convert to string before uppercasing
      case 'NEW': return <FlagOutlined />;
      case 'SENT': return <ClockCircleOutlined />;
      case 'REVIEWED': return <CheckCircleOutlined />;
      default: return null;
    }
  };

  if (loading && milestones.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
  }

  if (error && milestones.length === 0) {
    return <Alert message="Error Loading Milestones" description={error} type="error" showIcon />;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onAddMilestone(fetchMilestones)} // Truyền fetchMilestones làm callback
          >
            Add Milestone
          </Button>
        </Col>
      </Row>
      {error && <Alert message="Error" description={error} type="error" showIcon style={{marginBottom: 10}} />}


      {(!Array.isArray(milestones) || milestones.length === 0) && !loading && !error && (
        <Text type="secondary">No milestones found for this project. Click "Add Milestone" to create one.</Text>
      )}

      {Array.isArray(milestones) && milestones.length > 0 && (
        <List
          className="milestone-list"
          itemLayout="horizontal"
          dataSource={milestones}
          loading={loading && milestones.length > 0}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              className={`milestone-item ${item.completed ? 'milestone-completed' : ''}`}
              style={{
                padding: '16px',
                borderRadius: '6px',
                background: item.completed ? '#f6ffed' : '#ffffff',
                marginBottom: '12px',
                border: `1px solid ${item.completed ? '#b7eb8f' : '#f0f0f0'}`,
                opacity: updatingCompletionId === item.id ? 0.7 : 1,
                transition: 'background 0.3s ease, border 0.3s ease, opacity 0.3s ease'
              }}
            >
              <Row gutter={[16, 16]} style={{ width: '100%' }} align="middle">
                <Col flex="none">
                  {item.completed ? (
                    <Button 
                      type="text"
                      onClick={() => handleCompletionChange(item, false)}
                      disabled={updatingCompletionId === item.id}
                      icon={<CheckCircleOutlined />}
                      style={{
                        color: '#52c41a',
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 12px'
                      }}
                    >
                      <span style={{ marginLeft: 4 }}>Done</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCompletionChange(item, true)}
                      disabled={updatingCompletionId === item.id}
                      icon={<ClockCircleOutlined />}
                      style={{
                        color: '#096dd9',
                        backgroundColor: '#e6f7ff',
                        border: '1px solid #91d5ff',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 12px'
                      }}
                    >
                      <span style={{ marginLeft: 4 }}>To Do</span>
                    </Button>
                  )}
                </Col>
                <Col flex="auto">
                  <MilestoneInfo
                    name={item.name}
                    description={item.description}
                    notes={item.notes}
                    completed={item.completed}
                  />
                </Col>

                <Col xs={24} sm={8} md={7} style={{ textAlign: 'right' }}>
                  <Space direction="vertical" size={8} align="end">
                    {item.id && ( 
                        <MilestoneItemActions
                            milestoneId={item.id}
                            projectId={projectId}
                            onEdit={(milestoneIdToEdit, projId) => onEditMilestone(milestoneIdToEdit, projId, fetchMilestones)}
                            onDelete={handleDeleteMilestone}
                            disabled={updatingCompletionId === item.id}
                        />
                    )}
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
                        <Text type="secondary">Due: {formatDate(item.deadlineDate)}</Text>
                      </Space>
                      {item.completed && item.completionDate && (
                        <Space size={4}>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <Text type="secondary">Completed: {formatDate(item.completionDate)}</Text>
                        </Space>
                      )}
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