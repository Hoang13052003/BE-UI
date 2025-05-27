import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Spin, Tag, message as antdMessage, Row, Col } from "antd";
import { useAddProject } from "../../hooks/useAddProject";
import { useProjectEnums } from "../../hooks/useProjectEnums";
import { useUserSearch } from "../../hooks/useUserSearch";
import { UserIdAndEmailResponse } from "../../types/User";

import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Option } = Select;
const HOURS_PER_WORK_DAY = 8;
const MIN_HOURS_PER_DAY_IF_ANY_HOURS = 1;
const MAX_HOURS_PER_DAY_ALLOWED = 24;
const MAX_ESTIMATED_HOURS_LIMIT = 10000; // Giới hạn tối đa số giờ có thể tính toán
const MAX_WORKING_DAYS_LIMIT = 365; // Giới hạn tối đa số ngày làm việc (1 năm)

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Participant {
  id: number;
  email: string;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [formInitialized, setFormInitialized] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userSearchInput, setUserSearchInput] = useState<string>(""); // State for user search input

  const { searchedUsers, searchLoading, handleUserSearch, resetSearch } = useUserSearch();
  const { typeOptions, statusOptions, loading: enumLoading, error: enumError } = useProjectEnums();
  const { submitting, handleAddProject } = useAddProject(() => {
    onSuccess();
    form.resetFields();
    setSelectedType(undefined);
    setFormInitialized(false);
    setParticipants([]);
  });

  const calculateWorkingDays = (startDate: Dayjs, endDate: Dayjs): number => {
    if (!startDate || !endDate || !startDate.isValid() || !endDate.isValid() || endDate.isBefore(startDate)) {
      return 0;
    }
    let count = 0;
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate, 'day')) { 
      const dayOfWeek = currentDate.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate = currentDate.add(1, 'day');
    }
    return count;
  };

  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    const { startDate, plannedEndDate, totalEstimatedHours } = allValues;
    const formStartDate = startDate ? dayjs(startDate) : null;
    const formPlannedEndDate = plannedEndDate ? dayjs(plannedEndDate) : null;

    // 1. Khi startDate hoặc plannedEndDate thay đổi (và type là LABOR)
    if ((changedValues.startDate !== undefined || changedValues.plannedEndDate !== undefined) && selectedType === "LABOR") {
      if (formStartDate && formPlannedEndDate && formStartDate.isValid() && formPlannedEndDate.isValid() && formPlannedEndDate.isSameOrAfter(formStartDate)) {
        const workingDays = calculateWorkingDays(formStartDate, formPlannedEndDate);
        if (workingDays > 0) {
          form.setFieldsValue({ totalEstimatedHours: workingDays * HOURS_PER_WORK_DAY });
        } else {
          form.setFieldsValue({ totalEstimatedHours: null });
        }
      } else {
         form.setFieldsValue({ totalEstimatedHours: null });
      }
    }
    // 2. Khi totalEstimatedHours thay đổi (và type là LABOR)
    else if (changedValues.totalEstimatedHours !== undefined && selectedType === "LABOR") {
      if (formStartDate && formStartDate.isValid() && typeof totalEstimatedHours === 'number' && totalEstimatedHours >= 0) {
        // Kiểm tra giới hạn số giờ
        if (totalEstimatedHours > MAX_ESTIMATED_HOURS_LIMIT) {
          antdMessage.warning(`Số giờ ước tính quá cao (tối đa ${MAX_ESTIMATED_HOURS_LIMIT.toLocaleString()} giờ). Vui lòng nhập số giờ hợp lý.`);
          form.setFieldsValue({ plannedEndDate: null });
          return;
        }

        if (totalEstimatedHours === 0) {
          form.setFieldsValue({ plannedEndDate: formStartDate });
          return;
        }
        
        let workDaysRequired = Math.ceil(totalEstimatedHours / MAX_HOURS_PER_DAY_ALLOWED);
        if (totalEstimatedHours > 0 && workDaysRequired === 0) {
          workDaysRequired = 1;
        }

        // Kiểm tra giới hạn số ngày làm việc
        if (workDaysRequired > MAX_WORKING_DAYS_LIMIT) {
          antdMessage.warning(`Số ngày làm việc cần thiết quá lớn (${workDaysRequired} ngày). Vui lòng giảm số giờ ước tính.`);
          form.setFieldsValue({ plannedEndDate: null });
          return;
        }

        let finalEndDate = formStartDate.clone();
        let workDaysCounted = 0;
        let calendarDaysPassed = 0;

        if (workDaysRequired > 0) {
          // Tối ưu hóa: Tính toán nhanh dựa trên tuần thay vì từng ngày
          const fullWeeks = Math.floor(workDaysRequired / 5);
          let remainingWorkDays = workDaysRequired % 5;
          
          // Cộng số tuần đầy đủ (5 ngày làm việc = 7 ngày lịch)
          finalEndDate = formStartDate.clone().add(fullWeeks * 7, 'day');
          workDaysCounted = fullWeeks * 5;
          
          // Xử lý số ngày làm việc còn lại
          while (workDaysCounted < workDaysRequired && calendarDaysPassed < 14) { // Giới hạn tối đa 14 ngày để tránh vòng lặp vô hạn
            const dayToConsider = finalEndDate.clone().add(calendarDaysPassed, 'day');
            if (dayToConsider.day() !== 0 && dayToConsider.day() !== 6) {
              workDaysCounted++;
              if (workDaysCounted >= workDaysRequired) {
                finalEndDate = dayToConsider;
                break;
              }
            }
            calendarDaysPassed++;
          }
          
          // Kiểm tra an toàn cuối cùng
          if (workDaysCounted < workDaysRequired) {
            antdMessage.error("Không thể tính toán ngày kết thúc chính xác. Vui lòng kiểm tra lại số giờ ước tính.");
            form.setFieldsValue({ plannedEndDate: null });
            return;
          }
          
          form.setFieldsValue({ plannedEndDate: finalEndDate });
        } else {
          form.setFieldsValue({ plannedEndDate: formStartDate });
        }

      } else if (totalEstimatedHours === null || totalEstimatedHours === undefined) {
         form.setFieldsValue({ plannedEndDate: null });
      }
    }
  };

  useEffect(() => {
    if (visible && !enumLoading && !enumError && typeOptions.length > 0 && statusOptions.length > 0 && !formInitialized) {
      const defaultType = typeOptions.find(t => t === "LABOR") || typeOptions[0];
      form.setFieldsValue({
        type: defaultType,
        status: statusOptions[0],
      });
      setSelectedType(defaultType);
      setFormInitialized(true);
    }
    // Consolidate reset logic for when modal is not visible
    if (!visible) {
      form.resetFields();
      setSelectedType(undefined);
      setFormInitialized(false);
      setParticipants([]);
      setUserSearchInput(""); // Reset search input
      resetSearch();
    }
  }, [visible, enumLoading, enumError, typeOptions, statusOptions, form, formInitialized, resetSearch]);

  const handleModalClose = () => {
    form.resetFields();
    setSelectedType(undefined);
    setFormInitialized(false);
    setParticipants([]);
    setUserSearchInput(""); // Reset search input
    resetSearch();
    onClose();
  };

  const handleFinish = (values: any) => {
    const userIds = participants.map(p => p.id);
    const formattedValues = {
      ...values,
      startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
      plannedEndDate: values.plannedEndDate ? values.plannedEndDate.format('YYYY-MM-DD') : null,
      userIds,
    };
    handleAddProject(formattedValues);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    form.setFieldsValue({ totalEstimatedHours: null, plannedEndDate: null });
    if (value === "FIXED_PRICE") {
      form.setFields([{ name: 'totalEstimatedHours', errors: [] }]);
    }
  };

  const handleAddParticipant = (user: UserIdAndEmailResponse) => {
    if (participants.some(p => p.id === user.id)) {
      antdMessage.warning(`Người dùng với email ${user.email} đã được thêm vào danh sách.`);
      return;
    }
    
    setParticipants(prev => [...prev, { id: user.id, email: user.email }]);
    // Optionally clear search input and results after adding:
    // setUserSearchInput("");
    // resetSearch(); // This would clear searchedUsers, might be too aggressive if user wants to add more from current search
    antdMessage.success(`Đã thêm người dùng: ${user.email}`);
  };

  const handleRemoveParticipant = (id: number) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  return (
    <Modal
      title="Thêm dự án mới"
      open={visible}
      onCancel={handleModalClose}
      footer={null}
      destroyOnClose
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
            <Form.Item name="name" label="Tên dự án" rules={[{ required: true, message: "Bắt buộc" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="type" label="Loại dự án" rules={[{ required: true, message: "Vui lòng chọn loại dự án" }]}>
              <Select
                loading={enumLoading}
                placeholder="Chọn loại dự án"
                onChange={handleTypeChange}
                disabled={enumLoading}
              >
                {typeOptions.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Bắt buộc" }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
              <Select loading={enumLoading} placeholder="Chọn trạng thái" disabled={enumLoading}>
                {statusOptions.map(status => <Option key={status} value={status}>{status}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="totalBudget" label="Ngân sách" rules={[{ required: true, message: "Vui lòng nhập ngân sách" }, { type: "number", min: 0, message: "Ngân sách phải là số không âm" }]}>
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string | undefined): number => {
                  if (value === undefined || value === null || value === '') return 0;
                  const cleanedValue = value.replace(/\$\s?|(,*)/g, '');
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
              label="Ngày bắt đầu"
              rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="plannedEndDate"
              label="Ngày kết thúc dự kiến"
              dependencies={['startDate']}
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc dự kiến" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue('startDate');
                    if (!value || !startDate) return Promise.resolve();
                    if (!value.isValid || !startDate.isValid || !value.isValid() || !startDate.isValid()) {
                      return Promise.reject(new Error('Ngày không hợp lệ'));
                    }
                    if (value.isBefore(startDate)) {
                      return Promise.reject(new Error('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'));
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
            label="Số giờ ước tính"
            rules={[
              {
                required: selectedType !== "FIXED_PRICE",
                message: 'Vui lòng nhập số giờ ước tính',
              },
              { 
                type: 'number', 
                min: 0, 
                max: MAX_ESTIMATED_HOURS_LIMIT,
                message: `Số giờ phải từ 0 đến ${MAX_ESTIMATED_HOURS_LIMIT.toLocaleString()}` 
              },
            ]}
          >
            <InputNumber 
              style={{ width: "100%" }} 
              min={0} 
              max={MAX_ESTIMATED_HOURS_LIMIT}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: string | undefined): number => {
                if (value === undefined || value === null || value === '') return 0;
                const cleanedValue = value.replace(/\$\s?|(,*)/g, '');
                const parsedValue = parseFloat(cleanedValue);
                return isNaN(parsedValue) ? 0 : parsedValue;
              }}
            />
          </Form.Item>
        )}

        <Form.Item label="Người tham gia dự án">
          <Select
            mode="multiple"
            placeholder="Chọn người tham gia"
            value={participants.map(p => p.id)}
            onChange={(selectedIds: number[]) => {
              // Handles deselection from the Select's UI (e.g., clicking 'x' on a tag)
              const newSelectedParticipants = participants.filter(p => selectedIds.includes(p.id));
              setParticipants(newSelectedParticipants);
            }}
            tagRender={(props) => {
              const { value, closable, onClose } = props;
              // Find the participant by ID to display their email
              const participant = participants.find(p => p.id === value);
              const label = participant ? participant.email : `ID: ${value}`; // Fallback if email not found
              return (
                <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                  {label}
                </Tag>
              );
            }}
            style={{ width: "100%" }}
            dropdownRender={menu => (
              <div>
                {menu}
                <div style={{ display: 'flex', flexDirection: 'row', padding: 8 }}>
                  <Input
                    placeholder="Nhập email để tìm kiếm"
                    value={userSearchInput}
                    onChange={e => {
                      const searchText = e.target.value;
                      setUserSearchInput(searchText);
                      handleUserSearch(searchText); // Search as user types
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
                      handleUserSearch(userSearchInput); // Use state for search text
                    }}
                    type="primary"
                    loading={searchLoading}
                  >
                    Tìm kiếm
                  </Button>
                </div>
                <div style={{ padding: '0 8px 8px', maxHeight: 150, overflowY: 'auto' }}>
                  {searchLoading && <div style={{padding: 8, textAlign: 'center'}}><Spin size="small" /></div>}
                  {!searchLoading && userSearchInput && searchedUsers.length === 0 && (
                    <div style={{ padding: 8, color: '#999', textAlign: 'center' }}>
                      Không tìm thấy người dùng nào.
                    </div>
                  )}
                  {!searchLoading && !userSearchInput && searchedUsers.length === 0 && (
                     <div style={{ padding: 8, color: '#999', textAlign: 'center' }}>
                       Nhập email để tìm kiếm người dùng.
                     </div>
                  )}
                  {searchedUsers.map(user => (
                    <Tag
                      key={user.id}
                      color={participants.some(p => p.id === user.id) ? 'green' : 'default'}
                      style={{ marginBottom: 8, cursor: 'pointer', display: 'block' }} // display: 'block' for better layout if many results
                      onClick={() => handleAddParticipant(user)}
                    >
                      {user.email}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
            // No explicit <Option> children needed here as selection is custom
          >
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ width: "100%" }}>
            Thêm dự án
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProjectModal;