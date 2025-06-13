import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Slider,
} from "antd";
import {
  addMilestoneToProjectApi,
  MilestoneRequest,
} from "../../api/projectApi"; // Ensure this API path is correct
import TextArea from "antd/lib/input/TextArea";

interface AddMilestoneModalProps {
  // Renamed interface
  visible: boolean;
  projectId: number;
  onClose: () => void;
  onSuccess: () => void;
}

// Renamed component
const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
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
      // Reset fields when modal becomes visible and projectId is valid
      if (projectId) {
        form.resetFields();
      }
    }
  }, [visible, projectId, form]); // Added form to dependency array

  const loadMilestoneStatuses = async () => {
    try {
      setStatusOptions(["NEW", "SENT", "REVIEWED"]);
    } catch (error) {
      console.error("Failed to load milestone statuses:", error);
      message.error("Failed to load milestone statuses");
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const milestoneData: MilestoneRequest = {
        name: values.name,
        description: values.description,
        startDate: values.startDate.format("YYYY-MM-DD"),
        deadlineDate: values.deadlineDate.format("YYYY-MM-DD"),
        status: values.status,
        notes: values.notes || "",
        completionPercentage: values.completionPercentage,
      };

      // Ensure addMilestoneToProjectApi exists and works as intended
      await addMilestoneToProjectApi(projectId, milestoneData);
      message.success("Milestone added successfully");
      // form.resetFields(); // Moved reset to useEffect for better UX
      onSuccess(); // Call onSuccess which should close the modal and refresh data
    } catch (error) {
      console.error("Failed to add milestone:", error);
      // Provide more specific error feedback if possible
      const errorMessage =
        (error as any)?.response?.data?.message || "Failed to add milestone";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Milestone" // Updated title
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
          Save Milestone
        </Button>,
      ]}
      width={600}
      destroyOnClose // Add this to reset form state when modal is closed
    >
      <Form
        form={form}
        layout="vertical"
        name="add_milestone_form" // Added form name
      >
        <Form.Item
          name="name"
          label="Milestone Name"
          rules={[{ required: true, message: "Please enter milestone name" }]}
        >
          <Input placeholder="Enter milestone name" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <TextArea rows={3} placeholder="Enter description" />
        </Form.Item>
        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: "Please select start date" }]}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          name="deadlineDate"
          label="Deadline Date"
          rules={[
            { required: true, message: "Please select deadline date" },
            // Add validation rule for deadline date > start date if needed
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || !getFieldValue("startDate")) {
                  return Promise.resolve();
                }
                if (value.isBefore(getFieldValue("startDate"))) {
                  return Promise.reject(
                    new Error("Deadline date must be after start date")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select status" }]}
          initialValue="NEW" // Set a default status
        >
          <Select placeholder="Select status">
            {statusOptions.map((status) => (
              <Select.Option key={status} value={status}>
                {status.replace("_", " ")}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>{" "}
        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} placeholder="Enter notes (optional)" />
        </Form.Item>
        <Form.Item
          name="completionPercentage"
          label="Completion Percentage"
          rules={[
            {
              type: "number",
              min: 0,
              max: 100,
              message: "Completion percentage must be between 0 and 100",
            },
          ]}
        >
          <Slider
            min={0}
            max={100}
            step={1}
            tooltip={{
              formatter: (value) => `${value}%`,
              placement: "bottom",
            }}
            marks={{
              0: "0%",
              25: "25%",
              50: "50%",
              75: "75%",
              100: "100%",
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddMilestoneModal; // Export renamed component
