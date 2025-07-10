import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Typography,
  Space,
  Row,
  Col,
} from "antd";
import { CalendarOutlined, FileTextOutlined, ProjectOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { createOvertimeRequestApi } from "../../../api/overtimeRequestApi";
import { getProjectByUserIdApi } from "../../../api/userApi";
import { useAlert } from "../../../contexts/AlertContext";
import { useAuth } from "../../../contexts/AuthContext";
import { Project } from "../../../types/project";
import { CreateOvertimeRequestDto } from "../../../types/overtimeRequest";

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

interface CreateOvertimeRequestModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  preSelectedProject?: Project | null;
}

const CreateOvertimeRequestModal: React.FC<CreateOvertimeRequestModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  preSelectedProject,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { addAlert } = useAlert();
  const { userDetails, userRole } = useAuth();

  // Security: Only MANAGER can create overtime requests
  if (userRole !== "MANAGER") {
    return null;
  }

  useEffect(() => {
    if (visible && userDetails?.id) {
      fetchProjects();
    }
  }, [visible, userDetails]);

  // Handle pre-selected project
  useEffect(() => {
    if (visible && preSelectedProject) {
      setSelectedProject(preSelectedProject);
      form.setFieldsValue({
        projectId: preSelectedProject.id,
        projectType: preSelectedProject.projectType,
      });
    }
  }, [visible, preSelectedProject, form]);

  const fetchProjects = async () => {
    try {
      if (!userDetails?.id) return;
      
      const data = await getProjectByUserIdApi(userDetails.id);
      const projectList = Array.isArray(data.projects) ? data.projects : [];
      setProjects(projectList);
    } catch (error: any) {
      addAlert(error.message || "Failed to fetch projects", "error");
    }
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    
    if (project) {
      form.setFieldsValue({
        projectType: project.projectType,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      const requestData: CreateOvertimeRequestDto = {
        projectId: values.projectId,
        projectType: values.projectType,
        requestedPlannedEndDate: values.requestedPlannedEndDate.format("YYYY-MM-DD"),
        reason: values.reason,
      };

      await createOvertimeRequestApi(requestData);
      
      addAlert("Overtime request created successfully", "success");
      form.resetFields();
      setSelectedProject(null);
      onSuccess();
    } catch (error: any) {
      addAlert(error.response?.data?.message || "Failed to create overtime request", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedProject(null);
    onCancel();
  };

  const disabledDate = (current: Dayjs) => {
    if (!selectedProject?.plannedEndDate) return false;
    
    // Chỉ cho phép chọn ngày sau plannedEndDate hiện tại
    const currentPlannedEnd = dayjs(selectedProject.plannedEndDate);
    return current && current.isBefore(currentPlannedEnd, "day");
  };

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <Title level={4} style={{ margin: 0 }}>
            Create Overtime Request
          </Title>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 24 }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={
                <Space>
                  <ProjectOutlined />
                  <Text strong>Project</Text>
                </Space>
              }
              name="projectId"
              rules={[{ required: true, message: "Please select a project" }]}
            >
              <Select
                placeholder="Select project"
                onChange={handleProjectChange}
                showSearch
                optionFilterProp="children"
                optionLabelProp="label"
              >
                {projects.map((project) => (
                  <Option 
                    key={project.id} 
                    value={project.id}
                    label={project.name}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>
                        {project.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', lineHeight: 1.2 }}>
                        {project.projectType} • End: {project.plannedEndDate ? dayjs(project.plannedEndDate).format("MMM DD, YYYY") : "Not set"}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Project Type"
              name="projectType"
              rules={[{ required: true, message: "Project type is required" }]}
            >
              <Select disabled>
                <Option value="LABOR">Labor</Option>
                <Option value="FIXED_PRICE">Fixed Price</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Requested End Date"
              name="requestedPlannedEndDate"
              rules={[{ required: true, message: "Please select the requested end date" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabledDate={disabledDate}
                placeholder="Select new end date"
              />
            </Form.Item>
          </Col>
        </Row>

        {selectedProject && (
          <div
            style={{
              background: "#f6f6f6",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <Text strong style={{ display: "block", marginBottom: 12 }}>
              Project Information:
            </Text>
            <Row gutter={16}>
              <Col span={8}>
                <Text type="secondary">Current End Date:</Text>
                <br />
                <Text>
                  {selectedProject.plannedEndDate
                    ? dayjs(selectedProject.plannedEndDate).format("MMM DD, YYYY")
                    : "Not set"}
                </Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Progress:</Text>
                <br />
                <Text>{selectedProject.overallProcess || 0}%</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Status:</Text>
                <br />
                <Text style={{ 
                  textTransform: 'capitalize',
                  color: selectedProject.status === 'COMPLETED' ? '#52c41a' : 
                         selectedProject.status === 'PROGRESS' ? '#1890ff' : 
                         selectedProject.status === 'CLOSED' ? '#ff4d4f' : '#faad14'
                }}>
                  {selectedProject.status?.toLowerCase().replace('_', ' ') || 'Unknown'}
                </Text>
              </Col>
            </Row>
          </div>
        )}

        <Form.Item
          label={
            <Space>
              <FileTextOutlined />
              <Text strong>Reason for Extension</Text>
            </Space>
          }
          name="reason"
          rules={[
            { required: true, message: "Please provide a reason for the extension" },
            { min: 10, message: "Reason must be at least 10 characters" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Please explain why you need to extend the project deadline..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit Request
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateOvertimeRequestModal; 