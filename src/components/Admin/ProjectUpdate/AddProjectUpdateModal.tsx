// src/components/Admin/ProjectProgress/AddProjectUpdateModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Switch,
  Slider,
  Upload,
  Space,
  Divider,
  message,
  Typography,
  Row,
  Col,
} from "antd";
import {
  InboxOutlined,
  PaperClipOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Project } from "../../../types/project";
import {
  ProjectUpdateRequest,
  createProjectUpdateApi,
  uploadAttachmentApi,
  getProjectStatusesApi,
} from "../../../api/projectUpdateApi";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;
const { Title, Text } = Typography;

interface AddProjectUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: Project[];
  initialProjectId: number | null;
}

const AddProjectUpdateModal: React.FC<AddProjectUpdateModalProps> = ({
  visible,
  onClose,
  onSuccess,
  projects,
  initialProjectId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  // Fetch status options when modal opens
  useEffect(() => {
    if (visible) {
      const fetchStatuses = async () => {
        try {
          const statuses = await getProjectStatusesApi();
          setStatusOptions(statuses);
        } catch (error) {
          console.error("Failed to fetch project statuses:", error);
          // Fallback to default statuses
          setStatusOptions([
            "NEW",
            "PENDING",
            "PROGRESS",
            "AT_RISK",
            "COMPLETED",
            "CLOSED",
          ]);
        }
      };

      fetchStatuses();

      // Set initial form values if initialProjectId is provided
      if (initialProjectId) {
        form.setFieldsValue({
          projectId: initialProjectId,
        });
      }
    } else {
      // Reset form and file list when modal closes
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form, initialProjectId]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Prepare update data
      const updateData: ProjectUpdateRequest = {
        projectId: values.projectId,
        updateDate: values.updateDate.format("YYYY-MM-DD"),
        summary: values.summary,
        details: values.details,
        statusAtUpdate: values.statusAtUpdate,
        completionPercentage: values.completionPercentage,
        isPublished: values.isPublished,
        internalNotes: values.internalNotes,
      };

      // Create the update
      const createdUpdate = await createProjectUpdateApi(updateData);

      // Upload attachments if any
      if (fileList.length > 0) {
        const uploadPromises = fileList.map((file) =>
          uploadAttachmentApi(createdUpdate.id, file.originFileObj)
        );

        await Promise.all(uploadPromises);
      }

      message.success("Project update created successfully");
      onSuccess();
    } catch (error) {
      console.error("Failed to create project update:", error);
      message.error("Failed to create project update");
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = ({ fileList }: any) => {
    setFileList(fileList);
  };

  return (
    <Modal
      title="Add Project Update"
      open={visible}
      onCancel={onClose}
      width={800}
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
          Create Update
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          updateDate: dayjs(),
          isPublished: true,
          completionPercentage: 0,
        }}
      >
        <Title level={5}>Update Information</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="projectId"
              label="Project"
              rules={[{ required: true, message: "Please select a project" }]}
            >
              <Select
                placeholder="Select a project"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {projects.map((project) => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="updateDate"
              label="Update Date"
              rules={[{ required: true, message: "Please select a date" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="summary"
          label="Summary"
          rules={[{ required: true, message: "Please enter a summary" }]}
        >
          <Input placeholder="Enter a brief summary of this update" />
        </Form.Item>

        <Form.Item
          name="details"
          label="Details"
          rules={[{ required: true, message: "Please enter details" }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter detailed information about this update"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="statusAtUpdate"
              label="Status"
              rules={[{ required: true, message: "Please select a status" }]}
            >
              <Select placeholder="Select status">
                {statusOptions.map((status) => (
                  <Option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="completionPercentage"
              label="Completion Percentage"
              rules={[
                {
                  required: true,
                  message: "Please specify completion percentage",
                },
              ]}
            >
              <Slider
                min={0}
                max={100}
                marks={{
                  0: "0%",
                  25: "25%",
                  50: "50%",
                  75: "75%",
                  100: "100%",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="internalNotes"
          label="Internal Notes (Not visible to clients)"
        >
          <TextArea
            rows={3}
            placeholder="Enter any internal notes or comments"
          />
        </Form.Item>

        <Form.Item name="isPublished" label="Publish" valuePropName="checked">
          <Switch checkedChildren="Published" unCheckedChildren="Draft" />
        </Form.Item>

        <Divider />
        <Title level={5}>Attachments</Title>
        <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
          Upload files related to this update (optional)
        </Text>

        <Form.Item name="attachments">
          <Dragger
            multiple
            beforeUpload={() => false} // Prevent auto upload
            fileList={fileList}
            onChange={handleFileChange}
            showUploadList={{
              showRemoveIcon: true,
              removeIcon: <DeleteOutlined />,
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag files to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for single or bulk upload. Strictly prohibited from
              uploading company data or other prohibited files.
            </p>
          </Dragger>
        </Form.Item>

        {fileList.length > 0 && (
          <Space direction="vertical" style={{ width: "100%" }}>
            {fileList.map((file, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center" }}
              >
                <PaperClipOutlined style={{ marginRight: 8 }} />
                <Text ellipsis style={{ maxWidth: "90%" }}>
                  {file.name}
                </Text>
              </div>
            ))}
          </Space>
        )}
      </Form>
    </Modal>
  );
};

export default AddProjectUpdateModal;
