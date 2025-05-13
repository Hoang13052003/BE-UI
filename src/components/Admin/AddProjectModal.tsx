import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Spin, Tag, message as antdMessage } from "antd";
import { useAddProject } from "../../hooks/useAddProject";
import { useProjectEnums } from "../../hooks/useProjectEnums";
import { useUserSearch } from "../../hooks/useUserSearch"; // Import hook tìm kiếm người dùng
import { UserIdAndEmailResponse } from "../../types/User";

const { Option } = Select;

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
  
  // Sử dụng hook tìm kiếm người dùng
  const { searchedUsers, searchLoading, handleUserSearch, resetSearch } = useUserSearch();

  const { typeOptions, statusOptions, loading: enumLoading, error: enumError } = useProjectEnums();
  const { submitting, handleAddProject } = useAddProject(() => {
    onSuccess();
    form.resetFields();
    setSelectedType(undefined);
    setFormInitialized(false);
    setParticipants([]);
  });

  useEffect(() => {
    if (visible && !enumLoading && !enumError && typeOptions.length > 0 && statusOptions.length > 0 && !formInitialized) {
      const defaultType = typeOptions[0];
      form.setFieldsValue({
        type: defaultType,
        status: statusOptions[0],
      });
      setSelectedType(defaultType);
      setFormInitialized(true);
    }
    if (!visible || enumLoading || enumError) {
      setFormInitialized(false);
    }
  }, [visible, enumLoading, enumError, typeOptions, statusOptions, form, formInitialized]);

  useEffect(() => {
    if (!visible) {
      setSelectedType(undefined);
      setParticipants([]);
      resetSearch();
    }
  }, [visible, resetSearch]);

  const handleModalClose = () => {
    form.resetFields();
    setSelectedType(undefined);
    setFormInitialized(false);
    setParticipants([]);
    onClose();
  };

  const handleFinish = (values: any) => {
    const userIds = participants.map(p => p.id);

    const finalValues = { ...values, userIds };
    handleAddProject(finalValues);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    if (value === "FIXED_PRICE") {
      form.setFieldsValue({ totalEstimatedHours: null });
      form.setFields([{ name: 'totalEstimatedHours', errors: [] }]);
    }
  };

  const handleAddParticipant = (user: UserIdAndEmailResponse) => {
    // Kiểm tra nếu người dùng đã được thêm
    if (participants.some(p => p.id === user.id)) {
      antdMessage.warning(`Người dùng với email ${user.email} đã được thêm vào danh sách.`);
      return;
    }
    
    // Thêm người dùng vào danh sách
    setParticipants(prev => [...prev, { id: user.id, email: user.email }]);
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
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item name="name" label="Tên dự án" rules={[{ required: true, message: "Bắt buộc" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Bắt buộc" }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
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
        <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
          <Select loading={enumLoading} placeholder="Chọn trạng thái" disabled={enumLoading}>
            {statusOptions.map(status => <Option key={status} value={status}>{status}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}>
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
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
        {selectedType !== "FIXED_PRICE" && (
          <Form.Item
            name="totalEstimatedHours"
            label="Số giờ ước tính"
            rules={[
              {
                required: selectedType !== "FIXED_PRICE",
                message: 'Vui lòng nhập số giờ ước tính',
              },
              { type: 'number', min: 0, message: 'Số giờ phải là số không âm' },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        )}
        <Form.Item label="Người tham gia dự án">
          {/* Search users select */}
          <Select
            showSearch
            placeholder="Tìm kiếm người dùng theo email hoặc tên"
            filterOption={false}
            onSearch={handleUserSearch}
            loading={searchLoading}
            notFoundContent={searchLoading ? <Spin size="small" /> : 'Không tìm thấy người dùng'}
            style={{ width: '100%', marginBottom: 8 }}
            onSelect={(_, option: any) => {
              const user = searchedUsers.find(u => u.id === option.value);
              if (user) handleAddParticipant(user);
            }}
          >
            {searchedUsers.map(user => (
              <Option key={user.id} value={user.id}>{user.email}</Option>
            ))}
          </Select>

          {/* Hiển thị danh sách người tham gia đã được chọn */}
          <div style={{ marginTop: 8 }}>
            {participants.map(participant => (
              <Tag
                key={participant.id}
                closable
                onClose={() => handleRemoveParticipant(participant.id)}
                color="success"
                style={{ marginBottom: 4 }}
              >
                {participant.email} (ID: {participant.id})
              </Tag>
            ))}
          </div>
        </Form.Item>
        <Form.Item style={{ marginTop: "20px" }}>
          <Button type="primary" htmlType="submit" loading={submitting} block>
            Thêm dự án
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProjectModal;