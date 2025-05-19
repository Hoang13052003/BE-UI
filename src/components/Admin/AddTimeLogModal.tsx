import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Button, Select, message, Spin } from 'antd';
import { createTimeLogApi, TimeLogRequest } from '../../api/timelogApi';
import { useUserSearch } from '../../hooks/useUserSearch';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface AddTimeLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  users?: { id: number; name: string }[];
}

const AddTimeLogModal: React.FC<AddTimeLogModalProps> = ({ 
  visible, 
  onClose, 
  onSuccess, 
  projectId, 
  users = []
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { searchedUsers, searchLoading, handleUserSearch, resetSearch } = useUserSearch();
  
  // Reset search results when modal closes
  useEffect(() => {
    if (!visible) {
      resetSearch();
    }
  }, [visible, resetSearch]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      setLoading(true);
      
      const payload: TimeLogRequest = {
        projectId: projectId,
        performerId: values.performerId,
        taskDate: values.taskDate.format('YYYY-MM-DD'),
        taskDescription: values.taskDescription,
        hoursSpent: values.hoursSpent
      };
      
      await createTimeLogApi(payload);
      
      message.success('Time log added successfully');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to add time log: ${error.message}`);
      } else {
        message.error('Failed to add time log');
      }
      console.error('Error adding time log:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to render user options
  const renderUserOptions = () => {
    const renderedOptions = new Set<number>();
    
    return (
      <>
        {/* Show predefined users if available */}
        {users.map(user => {
          renderedOptions.add(user.id);
          return (
            <Option key={`predefined-${user.id}`} value={user.id}>{user.name}</Option>
          );
        })}
        
        {/* Show searched users, avoiding duplicates */}
        {searchedUsers.map(user => {
          if (!renderedOptions.has(user.id)) {
            renderedOptions.add(user.id);
            return (
              <Option key={`searched-${user.id}`} value={user.id}>{user.email}</Option>
            );
          }
          return null;
        })}
      </>
    );
  };

  return (
    <Modal
      title="Add Time Log"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          Submit
        </Button>
      ]}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ 
          taskDate: dayjs(),
          hoursSpent: 1
        }}
        preserve={false}
      >
        <Form.Item
          name="performerId"
          label="Performed By"
          rules={[{ required: true, message: 'Please select a user' }]}
        >
          <Select
            showSearch
            placeholder="Search users by email or username"
            filterOption={false}
            onSearch={handleUserSearch}
            loading={searchLoading}
            notFoundContent={searchLoading ? <Spin size="small" /> : 'No users found'}
          >
            {renderUserOptions()}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="taskDate"
          label="Date"
          rules={[{ required: true, message: 'Please select a date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="taskDescription"
          label="Task Description"
          rules={[
            { required: true, message: 'Please enter task description' },
            { max: 500, message: 'Description must be less than 500 characters' }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Describe the work done..." 
            maxLength={500} 
            showCount 
          />
        </Form.Item>
        
        <Form.Item
          name="hoursSpent"
          label="Hours Spent"
          rules={[
            { required: true, message: 'Please enter hours spent' },
            { type: 'number', min: 0.01, message: 'Hours must be greater than 0' }
          ]}
        >
          <InputNumber 
            min={0.01} 
            step={0.25} 
            precision={2}
            style={{ width: '100%' }} 
            placeholder="Enter time spent on this task"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTimeLogModal;