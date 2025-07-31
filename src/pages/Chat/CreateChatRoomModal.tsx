import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Spin } from 'antd';
import { UserOutlined, TeamOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useChat } from '../../contexts/ChatContext';
import { useUserSearch } from '../../hooks/useUserSearch';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectEnums } from '../../hooks/useProjectEnums';

interface CreateChatRoomModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreated: () => void;
}

const CreateChatRoomModal: React.FC<CreateChatRoomModalProps> = ({
  visible,
  onCancel,
  onCreated
}) => {
  const [form] = Form.useForm();
  const { createChatRoom, state } = useChat();
  const { userDetails } = useAuth();
  const { searchUsers, users, loading: usersLoading } = useUserSearch();
  const { projects, loading: projectsLoading } = useProjectEnums();
  const [roomType, setRoomType] = useState<string>('PRIVATE');

  useEffect(() => {
    if (visible) {
      // Load users for selection when modal is shown
      searchUsers('');
    }
  }, [visible, searchUsers]);

  const handleTypeChange = (value: string) => {
    setRoomType(value);
    form.resetFields(['projectId', 'participantIds']);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Make sure to include the current user in participants
      let participantIds = values.participantIds as number[];
      if (userDetails?.id && !participantIds.includes(userDetails.id)) {
        participantIds = [...participantIds, userDetails.id];
      }
      
      const result = await createChatRoom(
        values.roomName, 
        values.roomType, 
        participantIds,
        values.roomType === 'PROJECT' ? values.projectId : undefined
      );

      if (result) {
    form.resetFields();
    onCreated();
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
    }
  };

  return (
    <Modal
      title="Create New Chat Room"
      open={visible}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ roomType: 'PRIVATE' }}
      >
        <Form.Item
          name="roomName"
          label="Room Name"
          rules={[{ required: true, message: 'Please enter a room name' }]}
        >
          <Input prefix={<TeamOutlined />} placeholder="Chat room name" />
        </Form.Item>

        <Form.Item
          name="roomType"
          label="Room Type"
          rules={[{ required: true, message: 'Please select a room type' }]}
        >
          <Select onChange={handleTypeChange}>
            <Select.Option value="PRIVATE">
              <UserOutlined /> Private Chat
            </Select.Option>
            <Select.Option value="SUPPORT">
              <QuestionCircleOutlined /> Support Chat
            </Select.Option>
            <Select.Option value="PROJECT">
              <TeamOutlined /> Project Chat
            </Select.Option>
          </Select>
        </Form.Item>

        {roomType === 'PROJECT' && (
          <Form.Item
            name="projectId"
            label="Project"
            rules={[{ required: true, message: 'Please select a project' }]}
          >
            <Select 
              placeholder="Select project"
              loading={projectsLoading}
            >
              {projects?.map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="participantIds"
          label="Participants"
          rules={[{ required: true, message: 'Please select at least one participant' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select participants"
            style={{ width: '100%' }}
            optionFilterProp="children"
            loading={usersLoading}
            notFoundContent={usersLoading ? <Spin size="small" /> : null}
            filterOption={(input, option) =>
              option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {users?.map(user => (
              <Select.Option key={user.id} value={user.id}>
                {user.fullName || user.email}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button onClick={onCancel}>
            Cancel
          </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={state.loading}
            >
              Create
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateChatRoomModal; 