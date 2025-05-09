import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Spin, Tag, message as antdMessage } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { useAddProject } from "../../hooks/useAddProject";
import { useProjectEnums } from "../../hooks/useProjectEnums";
import { getClientIdByEmailApi } from "../../api/projectApi";

const { Option } = Select;

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Participant {
  email: string;
  id: number | null;
  status: 'idle' | 'loading' | 'found' | 'not_found' | 'error';
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [formInitialized, setFormInitialized] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [emailInput, setEmailInput] = useState<string>("");
  const [isLookingUpEmail, setIsLookingUpEmail] = useState<boolean>(false);

  const { typeOptions, statusOptions, loading: enumLoading, error: enumError } = useProjectEnums();
  const { submitting, handleAddProject } = useAddProject(() => {
    onSuccess();
    form.resetFields();
    setSelectedType(undefined);
    setFormInitialized(false);
    setParticipants([]);
    setEmailInput("");
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
      setEmailInput("");
    }
  }, [visible]);

  const handleModalClose = () => {
    form.resetFields();
    setSelectedType(undefined);
    setFormInitialized(false);
    setParticipants([]);
    setEmailInput("");
    onClose();
  };

  const handleFinish = (values: any) => {
    const userIds = participants
      .filter(p => p.status === 'found' && p.id !== null)
      .map(p => p.id as number);

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

  const handleAddSingleParticipant = async () => {
    if (!emailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      antdMessage.error("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    const currentEmail = emailInput.trim().toLowerCase();
    if (participants.some(p => p.email.toLowerCase() === currentEmail)) {
      antdMessage.warning("Email này đã được thêm vào danh sách.");
      setEmailInput("");
      return;
    }

    setIsLookingUpEmail(true);
    setParticipants(prev => [...prev, { email: currentEmail, id: null, status: 'loading' }]);
    setEmailInput("");

    try {
      const userId = await getClientIdByEmailApi(currentEmail);
      setParticipants(prev => prev.map(p => p.email === currentEmail ? { ...p, id: userId, status: 'found' } : p));
      antdMessage.success(`Đã tìm thấy người dùng với email: ${currentEmail} (ID: ${userId})`);
    } catch (error: any) {
      console.error("Error looking up email:", error);
      if (error.response && error.response.status === 404) {
        setParticipants(prev => prev.map(p => p.email === currentEmail ? { ...p, status: 'not_found' } : p));
        antdMessage.error(`Không tìm thấy người dùng với email: ${currentEmail}`);
      } else {
        setParticipants(prev => prev.map(p => p.email === currentEmail ? { ...p, status: 'error' } : p));
        antdMessage.error(`Lỗi khi tìm email ${currentEmail}: ${error.message || 'Lỗi không xác định'}`);
      }
    } finally {
      setIsLookingUpEmail(false);
    }
  };

  const handleRemoveParticipant = (email: string) => {
    setParticipants(prev => prev.filter(p => p.email !== email));
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
          <div style={{ display: "flex", marginBottom: 8 }}>
            <Input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Nhập email người tham gia"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSingleParticipant}
              loading={isLookingUpEmail}
            >
              Thêm
            </Button>
          </div>
          <div>
            {participants.map(p => (
              <Tag
                key={p.email}
                closable
                onClose={() => handleRemoveParticipant(p.email)}
                color={
                  p.status === 'found' ? 'success' :
                  p.status === 'not_found' ? 'error' :
                  p.status === 'loading' ? 'processing' :
                  'default'
                }
                style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 8px', minWidth: '150px' }}
              >
                <span style={{ marginRight: 'auto' }}>
                  {p.email}
                  {p.status === 'found' && ` (ID: ${p.id})`}
                </span>
                {p.status === 'loading' && <Spin size="small" style={{ marginLeft: 8 }} />}
                {p.status === 'not_found' && <span style={{ marginLeft: 8, color: '#ff4d4f' }}>(Không tìm thấy)</span>}
                {p.status === 'error' && <span style={{ marginLeft: 8, color: '#ff4d4f' }}>(Lỗi)</span>}
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