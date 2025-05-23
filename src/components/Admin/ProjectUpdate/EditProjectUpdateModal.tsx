// src/components/Admin/ProjectProgress/EditProjectUpdateModal.tsx
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
  Divider,
  message,
  Typography,
  Row,
  Col,
  List,
  Popconfirm,
} from "antd";
import {
  InboxOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Project } from "../../../types/project";
import {
  ProjectUpdate,
  ProjectUpdateEditRequest,
  updateProjectUpdateApi,
  uploadAttachmentApi,
  deleteAttachmentApi,
  getProjectStatusesApi,
} from "../../../api/projectUpdateApi";
import dayjs from "dayjs";
import { values } from "lodash";

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;
const { Title, Text } = Typography;

interface EditProjectUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  updateData: ProjectUpdate;
  projects: Project[];
}

const EditProjectUpdateModal: React.FC<EditProjectUpdateModalProps> = ({
  visible,
  onClose,
  onSuccess,
  updateData,
  projects,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

  console.log("publish: " + JSON.stringify(updateData));
  // Fetch status options and initialize form when modal opens
  useEffect(() => {
    if (visible && updateData) {
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

      // Initialize form values
      form.setFieldsValue({
        projectId: updateData.projectId,
        updateDate: updateData.updateDate ? dayjs(updateData.updateDate) : null,
        summary: updateData.summary,
        details: updateData.details,
        statusAtUpdate: updateData.statusAtUpdate,
        completionPercentage: updateData.completionPercentage,
        isPublished: updateData.published,
        internalNotes: updateData.internalNotes,
      });

      // Set existing attachments if any
      if (updateData.attachments && updateData.attachments.length > 0) {
        setExistingAttachments(updateData.attachments);
      } else {
        setExistingAttachments([]);
      }
    } else {
      // Reset form and file lists when modal closes
      form.resetFields();
      setFileList([]);
      setExistingAttachments([]);
    }
  }, [visible, form, updateData]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Prepare update data
      const editData: ProjectUpdateEditRequest = {
        id: updateData.id,
        projectId: values.projectId,
        updateDate: values.updateDate.format("YYYY-MM-DD"),
        summary: values.summary,
        details: values.details,
        statusAtUpdate: values.statusAtUpdate,
        completionPercentage: values.completionPercentage,
        published: values.isPublished,
        internalNotes: values.internalNotes,
      };

      // Update the project update
      await updateProjectUpdateApi(updateData.id, editData);

      // Upload new attachments if any
      if (fileList.length > 0) {
        const uploadPromises = fileList.map((file) =>
          uploadAttachmentApi(updateData.id, file.originFileObj)
        );

        await Promise.all(uploadPromises);
      }

      message.success("Project update modified successfully");
      onSuccess();
    } catch (error) {
      console.error("Failed to update project update:", error);
      message.error("Failed to update project update");
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = ({ fileList }: any) => {
    setFileList(fileList);
  };

  // Handle attachment deletion
  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await deleteAttachmentApi(attachmentId);
      setExistingAttachments(
        existingAttachments.filter((att) => att.id !== attachmentId)
      );
      message.success("Attachment deleted successfully");
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      message.error("Failed to delete attachment");
    }
  };

  return (
    <Modal
      title="Edit Project Update"
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
          Save Changes
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
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
                disabled={true}
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
          <Switch
            checkedChildren="Published"
            unCheckedChildren="Draft"
            checked={updateData.published}
          />
        </Form.Item>

        <Divider />
        <Title level={5}>Existing Attachments</Title>

        {existingAttachments.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={existingAttachments}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    href={item.storagePath}
                    target="_blank"
                  />,
                  <Popconfirm
                    title="Are you sure you want to delete this attachment?"
                    onConfirm={() => handleDeleteAttachment(item.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<PaperClipOutlined />}
                  title={item.fileName}
                  description={`${(item.fileSize / 1024).toFixed(
                    2
                  )} KB · ${new Date(item.uploadedAt).toLocaleDateString()}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">No attachments found</Text>
        )}

        <Divider />
        <Title level={5}>Add New Attachments</Title>
        <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
          Upload additional files related to this update (optional)
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
      </Form>
    </Modal>
  );
};

export default EditProjectUpdateModal;
