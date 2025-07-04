import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Button,
  notification,
  Spin,
} from "antd";
import { 
  updateProjectLaborApi,
  updateProjectFixedPriceApi,
  ProjectLaborUpdateRequest,
  ProjectFixedPriceUpdateRequest
} from "../../api/projectApi";
import {
  searchUsersByEmailOrUsernameApi,
  UserSearchParams,
} from "../../api/userApi";
import { UserIdAndEmailResponse } from "../../types/User";
import { Project } from "../../types/project";
import debounce from "lodash/debounce";
import dayjs from "dayjs";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const { TextArea } = Input;
const { Option } = Select;

interface EditProjectModalProps {
  visible: boolean;
  projectId: string | null;
  onClose: () => void;
  onSuccess: () => void;
  projectData?: Project;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  visible,
  projectId,
  projectData,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isTypeChanged, setIsTypeChanged] = useState(false);
  const [currentProjectType, setCurrentProjectType] = useState<string>("");

  const [users, setUsers] = useState<UserIdAndEmailResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [, setSearchValue] = useState("");

  useEffect(() => {
    const loadProjectData = async () => {
      if (visible && projectId && !projectData) {
        setLoading(true);
        try {
        } catch (error) {
          console.error("Failed to load project data:", error);
          notification.error({
            message: "Load Error",
            description: "Failed to load project data. Please try again.",
          });
          onClose();
        } finally {
          setLoading(false);
        }
      }
    };

    if (projectData) {
      fillFormWithData(projectData);
    } else {
      loadProjectData();
    }

    return () => {
      setIsTypeChanged(false);
    };
  }, [visible, projectId, projectData, form, onClose]);

  const fillFormWithData = (data: Project) => {
    setCurrentProjectType(data.projectType);
    form.setFieldsValue({
      projectName: data.name,
      description: data.description,
      type: data.projectType, // Use projectType from Project interface
      status: data.status,
      startDate: data.startDate ? dayjs(data.startDate, "YYYY-MM-DD") : null,
      plannedEndDate: data.plannedEndDate
        ? dayjs(data.plannedEndDate, "YYYY-MM-DD")
        : null,
      // actualEndDate removed - will be used in future
      totalBudget: data.totalBudget,
      totalEstimatedHours: data.totalEstimatedHours,
      userIds: data.users?.map((user) => user.id) || [],
    });

    if (data.users && data.users.length > 0) {
      const initialUsers = data.users.map((user) => ({
        id: user.id,
        email: user.email,
      }));
      setUsers(initialUsers);
    }
  };

  const handleTypeChange = (value: string) => {
    setCurrentProjectType(value);
    if (projectData && value !== projectData.projectType) { // Use projectType from Project interface
      setIsTypeChanged(true);
    } else {
      setIsTypeChanged(false);
    }
  };

  const searchUsers = debounce(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      return;
    }

    setSearchLoading(true);
    try {
      const params: UserSearchParams = {
        "searchTerm.contains": searchTerm,
        page: 0,
        size: 10,
      };

      const result = await searchUsersByEmailOrUsernameApi(params);
      setUsers((prevUsers) => {
        const combinedUsers = [...prevUsers];

        result.users.forEach((user) => {
          if (!combinedUsers.some((u) => u.id === user.id)) {
            combinedUsers.push(user);
          }
        });

        return combinedUsers;
      });
    } catch (error) {
      console.error("Failed to search users:", error);
      notification.error({
        message: "Search Error",
        description: "Failed to search users. Please try again.",
      });
    } finally {
      setSearchLoading(false);
    }
  }, 500);

  const handleSearchUser = (value: string) => {
    setSearchValue(value);
    searchUsers(value);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (isTypeChanged) {
        confirmAlert({
          title: "Project Type Change Warning",
          message: "Changing the project type will affect the project structure. Are you sure you want to continue?",
          buttons: [
            {
              label: "Continue",
              onClick: () => submitForm(values),
            },
            {
              label: "Cancel",
              onClick: () => {},
            },
          ],
        });
      } else {
        submitForm(values);
      }
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const submitForm = async (values: any) => {
    if (!projectId) return;

    setSubmitting(true);
    try {
      // Use ORIGINAL project type to determine which API to call
      const originalProjectType = projectData?.projectType;
      const newProjectType = values.type || projectData?.projectType;
      
      console.log('Debug - Original projectType:', originalProjectType);
      console.log('Debug - New projectType from form:', newProjectType);
      console.log('Debug - Will call LABOR API?', originalProjectType === 'LABOR');
      
      if (originalProjectType === 'LABOR') {
        // Use labor-specific endpoint even if changing to FIXED_PRICE
        const updateData: ProjectLaborUpdateRequest = {
          projectName: values.projectName || values.name,
          description: values.description,
          status: values.status,
          startDate: values.startDate
            ? values.startDate.format("YYYY-MM-DD")
            : undefined,
          plannedEndDate: values.plannedEndDate
            ? values.plannedEndDate.format("YYYY-MM-DD")
            : undefined,
          // actualEndDate removed - will be used in future
          totalBudget: values.totalBudget,
          totalEstimatedHours: values.totalEstimatedHours,
          userIds: values.userIds,
          type: newProjectType, // Pass the new type to backend
        };
        console.log('Debug - Calling updateProjectLaborApi with data:', updateData);
        await updateProjectLaborApi(projectId!, updateData);
      } else {
        // Use fixed-price-specific endpoint for originally FIXED_PRICE projects
        const updateData: ProjectFixedPriceUpdateRequest = {
          name: values.projectName || values.name,
          description: values.description,
          status: values.status,
          startDate: values.startDate
            ? values.startDate.format("YYYY-MM-DD")
            : undefined,
          plannedEndDate: values.plannedEndDate
            ? values.plannedEndDate.format("YYYY-MM-DD")
            : undefined,
          totalBudget: values.totalBudget,
          userIds: values.userIds,
          type: newProjectType, // Pass the new type to backend
        };
        console.log('Debug - Calling updateProjectFixedPriceApi with data:', updateData);
        await updateProjectFixedPriceApi(projectId!, updateData);
      }
      
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error("Failed to update project:", error);
      notification.error({
        message: "Update Failed",
        description:
          error instanceof Error ? error.message : "Failed to update project. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Edit Project"
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleOk}
        >
          Save
        </Button>,
      ]}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="projectName"
            label="Project Name"
            rules={[
              { required: true, message: "Project name is required" },
              { max: 200, message: "Project name must be less than or equal to 200 characters" }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[
            { max: 65535, message: "Description is too long (maximum 65535 characters)" }
          ]}>
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Project Type"
            rules={[
              { required: true, message: "Project type is required" },
            ]}
            extra={isTypeChanged && "Changing project type will affect project structure"}
          >
            <Select onChange={handleTypeChange}>
              <Option value="FIXED_PRICE">
                Fixed Price
              </Option>
              <Option value="LABOR">Labor</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[
              { required: true, message: "Status is required" },
            ]}
          >
            <Select>
              <Option value="NEW">New</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="PROGRESS">Progress</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="startDate"
              label="Start Date"
              style={{ flex: 1 }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="plannedEndDate"
              label="Planned End Date"
              style={{ flex: 1 }}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve();
                    }
                    const startDate = getFieldValue("startDate");
                    if (!startDate) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(startDate)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "Planned end date must be after start date"
                      )
                    );
                  },
                }),
              ]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>
            {/* Actual End Date field is hidden for now - will be used in future */}
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="totalBudget"
              label="Total Budget"
              style={{ flex: 1 }}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const projectType = getFieldValue('type');
                    if (projectType === 'FIXED_PRICE') {
                      if (!value || value <= 0) {
                        return Promise.reject(new Error('Total budget must be positive for fixed price projects'));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                min={0.01} // Must be positive
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: string | undefined): string | number => {
                  return value
                    ? Number(value.replace(/\$\s?|(,*)/g, "")) || 0
                    : 0;
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.type !== currentValues.type
              }
            >
              {({ getFieldValue }) => {
                const formProjectType = getFieldValue('type');
                const showEstimatedHours = formProjectType === 'LABOR' || currentProjectType === 'LABOR';
                
                return showEstimatedHours ? (
                  <Form.Item
                    name="totalEstimatedHours"
                    label="Total Estimated Hours"
                    style={{ flex: 1 }}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const projectType = getFieldValue('type');
                          if (projectType === 'LABOR') {
                            if (!value || value <= 0) {
                              return Promise.reject(new Error('Estimated hours must be greater than 0 for labor projects'));
                            }
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <InputNumber min={0.1} step={0.5} style={{ width: "100%" }} />
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>
          </div>

          <Form.Item name="userIds" label="Team Members">
            <Select
              mode="multiple"
              placeholder="Search users by email or username"
              filterOption={false}
              onSearch={handleSearchUser}
              notFoundContent={searchLoading ? <Spin size="small" /> : null}
              style={{ width: "100%" }}
              loading={searchLoading}
              showSearch
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.email}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ color: "#888", fontSize: "12px", marginTop: "-12px" }}>
            Type at least 2 characters to search for users
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default EditProjectModal;
