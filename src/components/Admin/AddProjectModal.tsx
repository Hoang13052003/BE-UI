import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button } from "antd";
import { useAddProject } from "../../hooks/useAddProject";
import { useProjectEnums } from "../../hooks/useProjectEnums"; // Import new hook
import { useClientLookup } from "../../hooks/useClientLookup"; // Import new hook

const { Option } = Select;

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [formInitialized, setFormInitialized] = useState(false);

  // Use custom hooks
  const { typeOptions, statusOptions, loading: enumLoading, error: enumError } = useProjectEnums();
  const { loading: clientLoading, foundClientId, handleEmailBlur, resetClientLookup } = useClientLookup(form);
  const { submitting, handleAddProject } = useAddProject(() => {
    onSuccess(); // Call original onSuccess
    // Reset state managed within this component after successful submission
    form.resetFields();
    resetClientLookup(); // Reset client lookup state
    setSelectedType(undefined);
    setFormInitialized(false); // Allow re-initialization if modal reopens
  });

  // Effect to initialize form with default enum values
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
    // Reset initialization flag if modal becomes hidden or enums are loading/error
    if (!visible || enumLoading || enumError) {
        setFormInitialized(false);
    }
  }, [visible, enumLoading, enumError, typeOptions, statusOptions, form, formInitialized]);

  // Effect to reset component state when modal closes (complementary to onSuccess reset)
  useEffect(() => {
    if (!visible) {
      // Reset state that isn't reset by form.resetFields() or onSuccess callback
      resetClientLookup();
      setSelectedType(undefined);
      // formInitialized is reset in the effect above
    }
  }, [visible, resetClientLookup]);

  // Wrapper for onClose to ensure state reset
  const handleModalClose = () => {
      form.resetFields(); // Ensure form is reset
      resetClientLookup();
      setSelectedType(undefined);
      setFormInitialized(false);
      onClose(); // Call the original onClose handler
  };

  const handleFinish = (values: any) => {
    // Re-validate client ID before submitting
    if (!foundClientId) {
      // Check if email field itself is valid before setting specific error
      form.validateFields(['clientEmail']).then(() => {
          // Email is valid but no client found (e.g., user didn't blur, or lookup failed)
          form.setFields([{ name: 'clientEmail', errors: ["Vui lòng xác nhận email client hợp lệ."] }]);
      }).catch(() => {
          // Email is invalid (e.g. format), error is already shown by Form.Item rule.
      });
      form.getFieldInstance('clientEmail')?.focus();
      return;
    }

    // Ensure the correct clientId is included from the state hook
    const finalValues = { ...values, clientId: foundClientId };
    handleAddProject(finalValues); // Reset logic is now in useAddProject's success callback
  };

  // Handle type change to update state and potentially clear related fields
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    if (value === "FIXED_PRICE") {
        form.setFieldsValue({ totalEstimatedHours: null });
        // Clear validation errors if the field is now hidden/optional
        form.setFields([{ name: 'totalEstimatedHours', errors: [] }]);
    }
  };

  return (
    <Modal
      title="Thêm dự án mới"
      open={visible}
      onCancel={handleModalClose} // Use wrapper for reset logic
      footer={null}
      destroyOnClose // Recommended to ensure clean state on reopen
      forceRender // May help ensure form instance is ready, especially with conditional fields
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        // Initial values are set via useEffect
      >
        {/* --- Form Items --- */}
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
                required: selectedType !== "FIXED_PRICE", // Rule is active only when field is visible
                message: 'Vui lòng nhập số giờ ước tính',
              },
              { type: 'number', min: 0, message: 'Số giờ phải là số không âm' },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        )}
        <Form.Item
          label="Email client"
          name="clientEmail"
          rules={[
            { required: true, message: "Vui lòng nhập email client" },
            { type: 'email', message: 'Email không đúng định dạng' }
            // Custom validation errors are set via form.setFields in useClientLookup
          ]}
          help={foundClientId && !form.getFieldError('clientEmail').length ? (
            <span style={{ color: "green" }}>Đã tìm thấy client ID: {foundClientId}</span>
          ) : null}
          validateStatus={form.getFieldError('clientEmail').length ? 'error' : ''} // Reflect error status set by hook
          hasFeedback={clientLoading} // Show loading indicator as feedback icon
        >
          <Input
            placeholder="Nhập email client"
            onBlur={handleEmailBlur}
            disabled={clientLoading}
            // Suffix is handled by hasFeedback + validateStatus now
            // suffix={clientLoading ? <Spin size="small" /> : null}
            onChange={() => {
                // Reset client lookup state if user manually edits email after lookup
                if (foundClientId) {
                    resetClientLookup();
                    form.setFieldsValue({ clientId: null });
                }
            }}
          />
        </Form.Item>
        {/* Hidden field to store clientId set by the hook */}
        <Form.Item name="clientId" hidden>
          <Input type="hidden" />
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