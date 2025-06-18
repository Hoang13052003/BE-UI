import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Spin,
  Tag,
  message as antdMessage,
  Row,
  Col,
} from "antd";
import { useAddProject } from "../../hooks/useAddProject";
import { useProjectEnums } from "../../hooks/useProjectEnums";
import { useUserSearch } from "../../hooks/useUserSearch";
import { UserIdAndEmailResponse } from "../../types/User";

import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Option } = Select;
const HOURS_PER_WORK_DAY = 8;
const MAX_HOURS_PER_DAY_ALLOWED = 24;
const MAX_ESTIMATED_HOURS_LIMIT = 10000;
const MAX_WORKING_DAYS_LIMIT = 365;

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Participant {
  id: number;
  email: string;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );
  const [formInitialized, setFormInitialized] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userSearchInput, setUserSearchInput] = useState<string>("");

  const { searchedUsers, searchLoading, handleUserSearch, resetSearch } =
    useUserSearch();
  const {
    typeOptions,
    statusOptions,
    loading: enumLoading,
    error: enumError,
  } = useProjectEnums();
  const { submitting, handleAddProject } = useAddProject(() => {
    onSuccess();
    form.resetFields();
    setSelectedType(undefined);
    setFormInitialized(false);
    setParticipants([]);
  });

  const calculateWorkingDays = (startDate: Dayjs, endDate: Dayjs): number => {
    if (
      !startDate ||
      !endDate ||
      !startDate.isValid() ||
      !endDate.isValid() ||
      endDate.isBefore(startDate)
    ) {
      return 0;
    }
    let count = 0;
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate, "day")) {
      const dayOfWeek = currentDate.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate = currentDate.add(1, "day");
    }
    return count;
  };

  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    const { startDate, plannedEndDate, totalEstimatedHours } = allValues;
    const formStartDate = startDate ? dayjs(startDate) : null;
    const formPlannedEndDate = plannedEndDate ? dayjs(plannedEndDate) : null;

    if (
      (changedValues.startDate !== undefined ||
        changedValues.plannedEndDate !== undefined) &&
      selectedType === "LABOR"
    ) {
      if (
        formStartDate &&
        formPlannedEndDate &&
        formStartDate.isValid() &&
        formPlannedEndDate.isValid() &&
        formPlannedEndDate.isSameOrAfter(formStartDate)
      ) {
        const workingDays = calculateWorkingDays(
          formStartDate,
          formPlannedEndDate
        );
        if (workingDays > 0) {
          form.setFieldsValue({
            totalEstimatedHours: workingDays * HOURS_PER_WORK_DAY,
          });
        } else {
          form.setFieldsValue({ totalEstimatedHours: null });
        }
      } else {
        form.setFieldsValue({ totalEstimatedHours: null });
      }
    } else if (
      changedValues.totalEstimatedHours !== undefined &&
      selectedType === "LABOR"
    ) {
      if (
        formStartDate &&
        formStartDate.isValid() &&
        typeof totalEstimatedHours === "number" &&
        totalEstimatedHours >= 0
      ) {
        if (totalEstimatedHours > MAX_ESTIMATED_HOURS_LIMIT) {
          antdMessage.warning(
            `Estimated hours too high (maximum ${MAX_ESTIMATED_HOURS_LIMIT.toLocaleString()} hours). Please enter a reasonable number of hours.`
          );
          form.setFieldsValue({ plannedEndDate: null });
          return;
        }

        if (totalEstimatedHours === 0) {
          form.setFieldsValue({ plannedEndDate: formStartDate });
          return;
        }

        let workDaysRequired = Math.ceil(
          totalEstimatedHours / MAX_HOURS_PER_DAY_ALLOWED
        );
        if (totalEstimatedHours > 0 && workDaysRequired === 0) {
          workDaysRequired = 1;
        }

        if (workDaysRequired > MAX_WORKING_DAYS_LIMIT) {
          antdMessage.warning(
            `Required working days too high (${workDaysRequired} days). Please reduce estimated hours.`
          );
          form.setFieldsValue({ plannedEndDate: null });
          return;
        }

        let finalEndDate = formStartDate.clone();
        let workDaysCounted = 0;
        let calendarDaysPassed = 0;

        if (workDaysRequired > 0) {
          const fullWeeks = Math.floor(workDaysRequired / 5);

          finalEndDate = formStartDate.clone().add(fullWeeks * 7, "day");
          workDaysCounted = fullWeeks * 5;

          while (
            workDaysCounted < workDaysRequired &&
            calendarDaysPassed < 14
          ) {
            const dayToConsider = finalEndDate
              .clone()
              .add(calendarDaysPassed, "day");
            if (dayToConsider.day() !== 0 && dayToConsider.day() !== 6) {
              workDaysCounted++;
              if (workDaysCounted >= workDaysRequired) {
                finalEndDate = dayToConsider;
                break;
              }
            }
            calendarDaysPassed++;
          }

          if (workDaysCounted < workDaysRequired) {
            antdMessage.error(
              "Unable to calculate exact end date. Please check estimated hours."
            );
            form.setFieldsValue({ plannedEndDate: null });
            return;
          }

          form.setFieldsValue({ plannedEndDate: finalEndDate });
        } else {
          form.setFieldsValue({ plannedEndDate: formStartDate });
        }
      } else if (
        totalEstimatedHours === null ||
        totalEstimatedHours === undefined
      ) {
        form.setFieldsValue({ plannedEndDate: null });
      }
    }
  };

  useEffect(() => {
    if (
      visible &&
      !enumLoading &&
      !enumError &&
      typeOptions.length > 0 &&
      statusOptions.length > 0 &&
      !formInitialized
    ) {
      const defaultType =
        typeOptions.find((t) => t === "LABOR") || typeOptions[0];
      form.setFieldsValue({
        type: defaultType,
        status: statusOptions[0],
      });
      setSelectedType(defaultType);
      setFormInitialized(true);
    }
    if (!visible) {
      form.resetFields();
      setSelectedType(undefined);
      setFormInitialized(false);
      setParticipants([]);
      setUserSearchInput("");
      resetSearch();
    }
  }, [
    visible,
    enumLoading,
    enumError,
    typeOptions,
    statusOptions,
    form,
    formInitialized,
    resetSearch,
  ]);

  const handleModalClose = () => {
    form.resetFields();
    setSelectedType(undefined);
    setFormInitialized(false);
    setParticipants([]);
    setUserSearchInput("");
    resetSearch();
    onClose();
  };

  const handleFinish = (values: any) => {
    const userIds = participants.map((p) => p.id);
    const formattedValues = {
      ...values,
      startDate: values.startDate
        ? values.startDate.format("YYYY-MM-DD")
        : null,
      plannedEndDate: values.plannedEndDate
        ? values.plannedEndDate.format("YYYY-MM-DD")
        : null,
      userIds,
    };
    handleAddProject(formattedValues);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    form.setFieldsValue({ totalEstimatedHours: null, plannedEndDate: null });
    if (value === "FIXED_PRICE") {
      form.setFields([{ name: "totalEstimatedHours", errors: [] }]);
    }
  };

  const handleAddParticipant = (user: UserIdAndEmailResponse) => {
    if (participants.some((p) => p.id === user.id)) {
      antdMessage.warning(
        `User with email ${user.email} has already been added to the list.`
      );
      return;
    }

    setParticipants((prev) => [...prev, { id: user.id, email: user.email }]);
    antdMessage.success(`Added user: ${user.email}`);
  };

  return (
    <Modal
      title="Add new project"
      open={visible}
      onCancel={handleModalClose}
      footer={null}
      forceRender
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={handleFormValuesChange}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Project Name"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Project Type"
              rules={[
                { required: true, message: "Please select project type" },
              ]}
            >
              <Select
                loading={enumLoading}
                placeholder="Select project type"
                onChange={handleTypeChange}
                disabled={enumLoading}
              >
                {typeOptions.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Required" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                loading={enumLoading}
                placeholder="Select status"
                disabled={enumLoading}
              >
                {statusOptions.map((status) => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="totalBudget"
              label="Budget"
              rules={[
                { required: true, message: "Please enter budget" },
                {
                  type: "number",
                  min: 0,
                  message: "Budget must be a non-negative number",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value: string | undefined): number => {
                  if (value === undefined || value === null || value === "")
                    return 0;
                  const cleanedValue = value.replace(/\$\s?|(,*)/g, "");
                  const parsedValue = parseFloat(cleanedValue);
                  return isNaN(parsedValue) ? 0 : parsedValue;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="plannedEndDate"
              label="Planned End Date"
              dependencies={["startDate"]}
              rules={[
                {
                  required: true,
                  message: "Please select planned end date",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("startDate");
                    if (!value || !startDate) return Promise.resolve();
                    if (
                      !value.isValid ||
                      !startDate.isValid ||
                      !value.isValid() ||
                      !startDate.isValid()
                    ) {
                      return Promise.reject(new Error("Invalid date"));
                    }
                    if (value.isBefore(startDate)) {
                      return Promise.reject(
                        new Error(
                          "Planned end date must be after or equal to start date"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        {selectedType !== "FIXED_PRICE" && (
          <Form.Item
            name="totalEstimatedHours"
            label="Estimated Hours"
            rules={[
              {
                required: selectedType !== "FIXED_PRICE",
                message: "Please enter estimated hours",
              },
              {
                type: "number",
                min: 0,
                max: MAX_ESTIMATED_HOURS_LIMIT,
                message: `Estimated hours must be between 0 and ${MAX_ESTIMATED_HOURS_LIMIT.toLocaleString()}`,
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={MAX_ESTIMATED_HOURS_LIMIT}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value: string | undefined): number => {
                if (value === undefined || value === null || value === "")
                  return 0;
                const cleanedValue = value.replace(/\$\s?|(,*)/g, "");
                const parsedValue = parseFloat(cleanedValue);
                return isNaN(parsedValue) ? 0 : parsedValue;
              }}
            />
          </Form.Item>
        )}

        <Form.Item label="Project Participants">
          <Select
            mode="multiple"
            placeholder="Select participants"
            value={participants.map((p) => p.id)}
            onChange={(selectedIds: number[]) => {
              const newSelectedParticipants = participants.filter((p) =>
                selectedIds.includes(p.id)
              );
              setParticipants(newSelectedParticipants);
            }}
            tagRender={(props) => {
              const { value, closable, onClose } = props;
              const participant = participants.find((p) => p.id === value);
              const label = participant ? participant.email : `ID: ${value}`;
              return (
                <Tag
                  closable={closable}
                  onClose={onClose}
                  style={{ marginRight: 3 }}
                >
                  {label}
                </Tag>
              );
            }}
            style={{ width: "100%" }}
            dropdownRender={(menu) => (
              <div>
                {menu}
                <div
                  style={{ display: "flex", flexDirection: "row", padding: 8 }}
                >
                  <Input
                    placeholder="Input email for search..."
                    value={userSearchInput}
                    onChange={(e) => {
                      const searchText = e.target.value;
                      setUserSearchInput(searchText);
                      handleUserSearch(searchText);
                    }}
                    onPressEnter={(e) => {
                      e.preventDefault();
                      handleUserSearch(userSearchInput);
                    }}
                    style={{ flex: 1, marginRight: 8 }}
                    allowClear
                  />
                  <Button
                    onClick={() => {
                      handleUserSearch(userSearchInput);
                    }}
                    type="primary"
                    loading={searchLoading}
                  >
                    Search
                  </Button>
                </div>
                <div
                  style={{
                    padding: "0 8px 8px",
                    maxHeight: 150,
                    overflowY: "auto",
                  }}
                >
                  {searchLoading && (
                    <div style={{ padding: 8, textAlign: "center" }}>
                      <Spin size="small" />
                    </div>
                  )}
                  {!searchLoading &&
                    userSearchInput &&
                    searchedUsers.length === 0 && (
                      <div
                        style={{
                          padding: 8,
                          color: "#999",
                          textAlign: "center",
                        }}
                      >
                        No users found.
                      </div>
                    )}
                  {!searchLoading &&
                    !userSearchInput &&
                    searchedUsers.length === 0 && (
                      <div
                        style={{
                          padding: 8,
                          color: "#999",
                          textAlign: "center",
                        }}
                      >
                        Input email to search for users.
                      </div>
                    )}
                  {searchedUsers.map((user) => (
                    <Tag
                      key={user.id}
                      color={
                        participants.some((p) => p.id === user.id)
                          ? "green"
                          : "default"
                      }
                      style={{
                        marginBottom: 8,
                        cursor: "pointer",
                        display: "block",
                      }}
                      onClick={() => handleAddParticipant(user)}
                    >
                      {user.email}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          ></Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{ width: "100%" }}
          >
            Created Project
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProjectModal;
