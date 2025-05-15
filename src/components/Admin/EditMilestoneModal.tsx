import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, DatePicker, Select, Spin, Alert, message } from 'antd';
import {
  getMilestoneByIdApi,
  updateMilestoneApi,
  MilestoneUpdateRequestData,
} from '../../api/milestoneApi';
import { Milestone, MilestoneStatus } from '../../types/milestone';
import dayjs from 'dayjs';

const { Option } = Select;

interface EditMilestoneModalProps {
  visible: boolean;
  milestoneId: number | null;
  projectId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditMilestoneModal: React.FC<EditMilestoneModalProps> = ({ visible, milestoneId, projectId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialMilestoneData, setInitialMilestoneData] = useState<Partial<Milestone> | null>(null);

  const milestoneStatusOptions: MilestoneStatus[] = ['NEW', 'SENT', 'REVIEWED'];

  useEffect(() => {
    if (visible && milestoneId) {
      setLoading(true);
      setError(null);
      getMilestoneByIdApi(milestoneId)
        .then(data => {
          setInitialMilestoneData(data);
          form.setFieldsValue({
            name: data.name,
            description: data.description,
            startDate: data.startDate ? dayjs(data.startDate) : null,
            deadlineDate: data.deadlineDate ? dayjs(data.deadlineDate) : null,
            completionDate: data.completionDate ? dayjs(data.completionDate) : null,
            status: data.status,
            notes: data.notes,
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch milestone details:", err);
          setError("Failed to load milestone details. " + (err.response?.data?.message || err.message));
          setLoading(false);
        });
    } else {
      form.resetFields();
      setInitialMilestoneData(null);
    }
  }, [visible, milestoneId, form]);

  const handleFinish = async (values: any) => {
    if (!milestoneId) {
      setError("Milestone ID is missing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const milestoneUpdateData: MilestoneUpdateRequestData = {
        name: values.name,
        description: values.description,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        deadlineDate: values.deadlineDate ? values.deadlineDate.format('YYYY-MM-DD') : null,
        completionDate: values.completionDate ? values.completionDate.format('YYYY-MM-DD') : null,
        status: values.status,
        notes: values.notes,
      };
      const filteredUpdateData = Object.entries(milestoneUpdateData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as MilestoneUpdateRequestData);

      await updateMilestoneApi(milestoneId, filteredUpdateData);
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to update milestone:", err);
      setError("Failed to update milestone. " + (err.response?.data?.message || err.message || "Unknown error"));
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Milestone"
      visible={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnClose
    >
      {loading && !error && <Spin tip="Loading milestone..."><div style={{height: '200px'}}/></Spin>}
      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {!loading && initialMilestoneData && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            name: initialMilestoneData.name,
            description: initialMilestoneData.description,
            startDate: initialMilestoneData.startDate ? dayjs(initialMilestoneData.startDate) : undefined,
            deadlineDate: initialMilestoneData.deadlineDate ? dayjs(initialMilestoneData.deadlineDate) : undefined,
            completionDate: initialMilestoneData.completionDate ? dayjs(initialMilestoneData.completionDate) : undefined,
            status: initialMilestoneData.status,
            notes: initialMilestoneData.notes,
          }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="deadlineDate" label="Deadline Date">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="completionDate" label="Completion Date">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status!' }]}
          >
            <Select placeholder="Select status">
              {milestoneStatusOptions.map(status => (
                <Option key={status} value={status}>{status.replace('_', ' ')}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Button onClick={() => { form.resetFields(); onClose();}} style={{ marginRight: 8 }} disabled={loading}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      )}
      {!loading && !initialMilestoneData && !error && visible && (
         <Alert message="No milestone data loaded or milestone ID is invalid." type="warning" showIcon />
      )}
    </Modal>
  );
};

export default EditMilestoneModal;