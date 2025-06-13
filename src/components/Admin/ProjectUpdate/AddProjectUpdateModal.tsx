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
  ProjectUpdateRequestPayload,
  createProjectUpdateApi,
  getProjectStatusesApi,
} from "../../../api/projectUpdateApi";
import dayjs from "dayjs";
import { useAttachmentUpload } from "../../../hooks/useAttachmentUpload";
import type { UploadFile } from "antd/es/upload/interface";
import { FolderFileItem } from "../../../types/Attachment";

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;
const { Title, Text } = Typography;

interface AddProjectUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: Project[];
}

const AddProjectUpdateModal: React.FC<AddProjectUpdateModalProps> = ({
  visible,
  onClose,
  onSuccess,
  projects,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  // Thêm state lưu folder items
  const [folderItemsToUpload, setFolderItemsToUpload] = useState<
    FolderFileItem[]
  >([]);

  // Sử dụng hook upload
  const { isUploading, uploadFilesIndividually, uploadFolderContents } =
    useAttachmentUpload();

  // Fetch status options when modal opens
  useEffect(() => {
    if (visible) {
      const fetchStatuses = async () => {
        try {
          const statuses = await getProjectStatusesApi();
          setStatusOptions(statuses);
        } catch (error) {
          console.error("Failed to fetch project statuses:", error);
          setStatusOptions(["NEW", "PENDING", "PROGRESS", "CLOSED"]);
        }
      };

      fetchStatuses();
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form]);

  // Hàm xử lý khi người dùng chọn thư mục bằng input webkitdirectory
  const handleNativeFolderSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesFromInput: File[] = Array.from(event.target.files);
      const items: FolderFileItem[] = [];
      let rootDirName = "";

      // Cố gắng xác định tên thư mục gốc từ file đầu tiên
      if (
        filesFromInput.length > 0 &&
        (filesFromInput[0] as any).webkitRelativePath
      ) {
        const firstPath = (filesFromInput[0] as any).webkitRelativePath;
        if (firstPath.includes("/")) {
          rootDirName = firstPath.substring(0, firstPath.indexOf("/"));
        }
      }

      for (const file of filesFromInput) {
        let relativePath = (file as any).webkitRelativePath || file.name;

        // Loại bỏ tên thư mục gốc khỏi relativePath nếu có
        if (rootDirName && relativePath.startsWith(rootDirName + "/")) {
          relativePath = relativePath.substring(rootDirName.length + 1);
        }
        // Nếu sau khi loại bỏ, path rỗng (file nằm ngay thư mục gốc đã chọn), thì dùng tên file
        if (!relativePath) {
          relativePath = file.name;
        }

        items.push({
          file: file,
          relativePath: relativePath,
        });
      }
      setFolderItemsToUpload(items);
      setFileList([]); // Xóa fileList của Dragger nếu chọn folder
      message.info(`${items.length} files selected from folder.`);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const updateData: ProjectUpdateRequestPayload = {
        projectId: values.projectId,
        updateDate: values.updateDate.format("YYYY-MM-DD"),
        summary: values.summary,
        details: values.details,
        statusAtUpdate: values.statusAtUpdate,
        overallProcess: values.overallProcess,
        actualProcess: values.actualProcess,
        published: values.isPublished,
        internalNotes: values.internalNotes,
      };

      // 1. Tạo ProjectUpdate trước
      const createdUpdate = await createProjectUpdateApi(updateData);
      const projectUpdateId = createdUpdate.id;

      if (!projectUpdateId) {
        throw new Error("Failed to get ID from created project update.");
      }

      // Ưu tiên upload folder nếu có
      if (folderItemsToUpload.length > 0) {
        const folderUploadResult = await uploadFolderContents(
          projectUpdateId,
          folderItemsToUpload
        );
        if (folderUploadResult.failedUploads.length > 0) {
          console.warn(
            "Some folder files failed to upload:",
            folderUploadResult.failedUploads
          );
          if (folderUploadResult.successfulUploads.length === 0) return;
        }
      } else if (fileList.length > 0) {
        const individualUploadResult = await uploadFilesIndividually(
          projectUpdateId,
          "",
          fileList
        );
        if (individualUploadResult.failedUploads.length > 0) {
          console.warn(
            "Some attachments failed to upload:",
            individualUploadResult.failedUploads
          );
          if (individualUploadResult.successfulUploads.length === 0) return;
        }
      }

      message.success("Project update created and attachments processed.", 3);
      onSuccess();
    } catch (error: any) {
      console.error(
        "Failed to create project update or an unexpected error occurred:",
        error
      );
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Operation failed. Please try again.";
      message.error(errorMessage);
    }
  };

  const handleFileChange = (info: any) => {
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

  const handleSelectProject = (value: number) => {
    const project = projects.find((p) => p.id === value);

    form.setFieldsValue({
      projectId: value,
      overallProcess: project?.overallProcess || 0,
      actualProcess: project?.actualProcess || 0,
    });
  };

  return (
    <Modal
      title="Add Project Update"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isUploading}
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
                onChange={handleSelectProject}
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
              name="overallProcess"
              label="Overall Completion Percentage"
              rules={[
                {
                  required: true,
                  message: "Please specify overall completion percentage",
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
                // disabled={true}
              />
            </Form.Item>
            <Form.Item
              name="actualProcess"
              label="Actual Completion Percentage"
              rules={[
                {
                  required: true,
                  message: "Please specify actual completion percentage",
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
          <Switch checkedChildren="Published" unCheckedChildren="Draft" />
        </Form.Item>

        <Divider />
        <Title level={5}>Attachments</Title>
        <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
          Upload files related to this update (optional)
        </Text>

        <Form.Item name="attachments">
          <Dragger
            multiple={true}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleFileChange}
            onRemove={(file) => {
              const index = fileList.findIndex((f) => f.uid === file.uid);
              if (index > -1) {
                const newFileList = fileList.slice();
                newFileList.splice(index, 1);
                setFileList(newFileList);
              }
            }}
            showUploadList={{
              showRemoveIcon: true,
              removeIcon: <DeleteOutlined />,
            }}
            disabled={isUploading}
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

        {/* Thêm input chọn folder */}
        <Divider>Or Upload Entire Folder</Divider>
        <input
          type="file"
          onChange={handleNativeFolderSelection}
          multiple
          disabled={isUploading}
          style={{ marginTop: "10px", display: "block" }}
          {...{ webkitdirectory: "", directory: "" }}
        />
        {folderItemsToUpload.length > 0 && (
          <Text>{folderItemsToUpload.length} files selected from folder.</Text>
        )}
      </Form>
    </Modal>
  );
};

export default AddProjectUpdateModal;
