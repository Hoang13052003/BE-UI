import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  Select,
  message,
  Spin,
  List,
  Popconfirm,
  Space,
  Typography,
  Tag,
} from "antd";
import { filterProjects } from "../../../api/projectApi";
import {
  assignProjectToUser,
  removeProjectFromUser,
} from "../../../api/userApi";
import { Project } from "../../../types/project";
import { DeleteOutlined } from "@ant-design/icons";
import { createNotification } from "../../../api/apiNotification";
import { MessageType, NotificationPriority } from "../../../types/Notification";
import { useAlert } from "../../../contexts/AlertContext";

const { Option } = Select;
const { Title, Text } = Typography;

interface AddAssignProjectsProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
  projects: Project[];
}

const AddAssignProjects: React.FC<AddAssignProjectsProps> = ({
  visible,
  onClose,
  onSuccess,
  userId,
  projects,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedProjects, setSearchedProjects] = useState<Project[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<Project[]>([]);
  const { addAlert } = useAlert();

  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        setLoading(true);
        setAssignedProjects(projects);
      } catch (error) {
        console.error("Error fetching assigned projects:", error);
        message.error("Failed to load assigned projects");
      } finally {
        setLoading(false);
      }
    };

    if (visible && userId) {
      fetchAssignedProjects();
    }
  }, [visible, userId]);

  useEffect(() => {
    if (!visible) {
      setSearchedProjects([]);
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await assignProjectToUser(userId, values.projectId);
      addAlert("Project assigned successfully", "success");

      await createNotification({
        userId,
        title: "Cập nhật dự án",
        content: "Bạn mới vừa được thêm vào dự án!",
        type: MessageType.PROJECT_ASSIGN,
        priority: NotificationPriority.MEDIUM,
        metadata: { projectId: values.projectId },
      });

      form.resetFields();
      onSuccess();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      addAlert(`Failed to assign project: ${errMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSearch = async (
    value: string,
    page: number = 0,
    size: number = 10
  ) => {
    if (!value.trim()) {
      setSearchedProjects([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await filterProjects(
        {
          name: value,
          status: undefined,
          startDate: undefined,
          endDate: undefined,
        },
        page,
        size
      );
      setSearchedProjects(response.projects);
      // console.log("data project: " + JSON.stringify(searchedProjects));
    } catch (error) {
      console.error("Error searching projects:", error);
      message.error("Failed to search projects");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRemoveProject = async (projectId: number) => {
    try {
      setLoading(true);
      await removeProjectFromUser(userId, projectId);
      addAlert("Project removed successfully", "success");

      onClose();
    } catch (error) {
      if (error instanceof Error) {
        addAlert("Failed to remove project", "error", error.message);
      } else {
        addAlert("Failed to remove project", "error", String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderProjectOptions = () => {
    const renderedOptions = new Set<number>();

    assignedProjects.forEach((project) => renderedOptions.add(project.id));

    return (
      <>
        {searchedProjects.map((project) => {
          if (!renderedOptions.has(project.id)) {
            return (
              <Option key={`searched-${project.id}`} value={project.id}>
                {project.name}
              </Option>
            );
          }
          return null;
        })}
      </>
    );
  };

  return (
    <Modal
      title="Assign Project"
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
          Assign
        </Button>,
      ]}
      width={800}
      destroyOnClose
    >
      {loading ? (
        <Spin size="large" />
      ) : (
        <Form form={form} layout="vertical" preserve={false}>
          <List
            header={
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Title level={5} style={{ margin: 0 }}>
                  Your Projects
                </Title>
              </Space>
            }
            bordered
            dataSource={projects}
            renderItem={(project) => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="Are you sure you want to remove this project?"
                    onConfirm={() => handleRemoveProject(project.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <Space
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Title level={5} style={{ margin: 0 }}>
                      {project.name}
                    </Title>
                    <Tag
                      color={project.type === "FIXED_PRICE" ? "blue" : "green"}
                    >
                      {project.type}
                    </Tag>
                  </Space>

                  <Text type="secondary">{project.description}</Text>
                </Space>
              </List.Item>
            )}
          />

          <Form.Item
            name="projectId"
            label="Select Project"
            rules={[{ required: true, message: "Please select a project" }]}
          >
            <Select
              showSearch
              placeholder="Search for projects"
              filterOption={false}
              onSearch={handleProjectSearch}
              loading={searchLoading}
              notFoundContent={
                searchLoading ? <Spin size="small" /> : "No projects found"
              }
            >
              {renderProjectOptions()}
            </Select>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default AddAssignProjects;
