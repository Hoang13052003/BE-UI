// src/components/Admin/ProjectProgress/SendFeedbackModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Upload,
  Divider,
} from "antd";
import { MessageOutlined, InboxOutlined } from "@ant-design/icons";
import { createFeedback, CreateFeedbackRequest } from "../../api/feedbackApi";
import {
  ProjectUpdate,
  updateProjectUpdateStatusForUserApi,
  UpdateStatusEnum,
} from "../../api/projectUpdateApi";
import { useAuth } from "../../contexts/AuthContext";
import { createNotification } from "../../api/apiNotification";
import { MessageType, NotificationPriority } from "../../types/Notification";
import { useAlert } from "../../contexts/AlertContext";
import { useAttachmentUpload } from "../../hooks/useAttachmentUpload";
import type { UploadFile, UploadChangeParam } from "antd/es/upload/interface";

const { TextArea } = Input;
const { Text } = Typography;
const { Dragger } = Upload;

interface SendFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  updateData: ProjectUpdate;
}

const SendFeedbackModal: React.FC<SendFeedbackModalProps> = ({
  visible,
  onClose,
  onSuccess,
  updateData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { userDetails } = useAuth();
  const { addAlert } = useAlert();
  const { isUploading, uploadFilesIndividually } = useAttachmentUpload();

  // Initialize form when modal opens
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        projectId: updateData.projectId || undefined,
        message: "",
      });
    } else {
      // Reset form when modal closes
      form.resetFields();
      setFileList([]); // Clear file list when modal closes
    }
  }, [visible, form, updateData]);

  const handleFileChange = (info: UploadChangeParam) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.filter((file) => {
      if (file.status === "removed") {
        return false;
      }
      return (
        !!file.originFileObj ||
        file.status === "done" ||
        file.status === "uploading"
      );
    });
    setFileList(newFileList);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const feedbackData: CreateFeedbackRequest = {
        updateId: updateData.id,
        userId: userDetails?.id || 0,
        projectId: updateData.projectId,
        content: values.message.trim(),
      };

      const feedbackResponse = await createFeedback(feedbackData);

      if (!feedbackResponse) {
        throw new Error("Failed to create feedback");
      }

      await updateProjectUpdateStatusForUserApi(
        updateData.id,
        UpdateStatusEnum.FEEDBACK
      );

      // Upload attachments if any
      if (fileList.length > 0) {
        const uploadResult = await uploadFilesIndividually(
          Number(feedbackResponse.updateId),
          feedbackResponse.id,
          fileList
        );
        if (uploadResult.failedUploads.length > 0) {
          console.warn(
            "Some attachments failed to upload:",
            uploadResult.failedUploads
          );
        }
      }

      await createNotification({
        userId: updateData.userId || 0,
        title: "Feedback Project reported",
        content: values.message.trim(),
        type: MessageType.COMMENT_ADDED,
        priority: NotificationPriority.HIGH,
        metadata: {
          updateId: updateData.id,
          projectId: updateData.projectId,
          feedbackId: feedbackResponse.id,
        },
      });

      addAlert("Feedback sent successfully!", "success");
      form.resetFields();
      setFileList([]); // Clear file list after success
      onSuccess();
    } catch (error) {
      console.error("Failed to send feedback:", error);
      addAlert("Failed to send feedback. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <MessageOutlined />
          <span>Send Feedback</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isUploading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading || isUploading}
          onClick={handleSubmit}
          icon={<MessageOutlined />}
        >
          Send Feedback
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Share your thoughts, suggestions, or concerns about the project. Your
          feedback helps us improve and deliver better results.
        </Text>
      </div>

      <Form form={form} layout="vertical" requiredMark={false}>
        {/* Project Selection - only show if projectId is not pre-selected */}
        {!updateData.projectId && (
          <Form.Item
            name="projectId"
            label="Project"
            rules={[
              {
                required: true,
                message: "Please select a project",
              },
            ]}
          ></Form.Item>
        )}

        {/* Feedback Message */}
        <Form.Item
          name="message"
          label="Your Feedback"
          rules={[
            {
              required: true,
              message: "Please enter your feedback",
            },
            {
              min: 10,
              message: "Feedback must be at least 10 characters long",
            },
            {
              max: 1000,
              message: "Feedback cannot exceed 1000 characters",
            },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Enter your detailed feedback here..."
            showCount
            maxLength={1000}
          />
        </Form.Item>

        {/* File Attachments */}
        <Divider />
        <Form.Item label="Attachments (Optional)">
          <Dragger
            multiple
            beforeUpload={() => false}
            onChange={handleFileChange}
            fileList={fileList}
            disabled={isUploading}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag files to attach to your feedback
            </p>
            <p className="ant-upload-hint">
              Support for single or bulk upload. You can attach documents,
              images, or other relevant files.
            </p>
          </Dragger>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Your feedback will be reviewed by the project team. Please be
          constructive and specific in your comments.
        </Text>
      </div>
    </Modal>
  );
};

export default SendFeedbackModal;
