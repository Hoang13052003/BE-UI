import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, message } from 'antd';
import { getMilestoneStatusesApi, addMilestoneToProjectApi, MilestoneRequest } from '../../api/projectApi';
import TextArea from 'antd/lib/input/TextArea';

interface EditMilestoneModalProps {
  visible: boolean;
  projectId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const EditMilestoneModal: React.FC<EditMilestoneModalProps> = ({
  visible,
  projectId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  // Load milestone statuses when modal opens
  useEffect(() => {
    if (visible) {
      loadMilestoneStatuses();
    }
  }, [visible]);

  const loadMilestoneStatuses = async () => {
    try {
      const statuses = await getMilestoneStatusesApi();
      setStatusOptions(statuses);
    } catch (error) {
      console.error('Failed to load milestone statuses:', error);
      message.error('Failed to load milestone statuses');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const milestoneData: MilestoneRequest = {
        name: values.name,
        description: values.description,
        startDate: values.startDate.format('YYYY-MM-DD'),
        deadlineDate: values.deadlineDate.format('YYYY-MM-DD'),
        status: values.status,
        notes: values.notes || '',
      };

      await addMilestoneToProjectApi(projectId, milestoneData);
      message.success('Milestone added successfully');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Failed to add milestone:', error);
      message.error('Failed to add milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add/Edit Milestone"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Save
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Milestone Name"
          rules={[{ required: true, message: 'Please enter milestone name' }]}
        >
          <Input placeholder="Enter milestone name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select start date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="deadlineDate"
          label="Deadline Date"
          rules={[{ required: true, message: 'Please select deadline date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select placeholder="Select status">
            {statusOptions.map(status => (
              <Select.Option key={status} value={status}>
                {status}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea rows={3} placeholder="Enter notes (optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditMilestoneModal;