import React from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, message, Spin } from "antd";
import dayjs from "dayjs";
import { putUpdateTimeLogApi, TimeLogResponse } from "../../api/timelogApi";
import { searchUsersByEmailOrUsernameApi, UserSearchParams } from "../../api/userApi";

interface EditTimeLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues: TimeLogResponse | null;
  projectId: number;
  users: { id: number; name: string }[]; // Không dùng nữa, giữ để không lỗi props
}

const EditTimeLogModal: React.FC<EditTimeLogModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialValues,
  projectId,
}) => {
  const [form] = Form.useForm();
  const [userOptions, setUserOptions] = React.useState<{ id: number; name: string }[]>([]);
  const [fetching, setFetching] = React.useState(false);

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        performerId: initialValues.performerId,
        taskDate: dayjs(initialValues.taskDate),
        taskDescription: initialValues.taskDescription,
        hoursSpent: initialValues.hoursSpent,
      });
      // Load performer info nếu chưa có trong options
      setUserOptions([{ id: initialValues.performerId, name: initialValues.performerFullName }]);
    }
  }, [initialValues, form]);

  // Hàm search user
  const handleSearchUser = async (value: string) => {
    setFetching(true);
    try {
      const params: UserSearchParams = { "searchTerm.contains": value };
      const res = await searchUsersByEmailOrUsernameApi(params);
      setUserOptions(
        res.users.map((u) => ({
          id: u.id,
          name: u.email,
        }))
      );
    } catch {
      setUserOptions([]);
    }
    setFetching(false);
  };

  const handleSubmit = async (values: any) => {
    if (!initialValues) return;
    try {
      await putUpdateTimeLogApi(initialValues.id, {
        projectId,
        performerId: values.performerId,
        taskDate: values.taskDate.format("YYYY-MM-DD"),
        taskDescription: values.taskDescription,
        hoursSpent: values.hoursSpent,
      });
      message.success("Cập nhật thành công");
      onSuccess();
      form.resetFields();
    } catch (err) {
      message.error("Cập nhật thất bại");
    }
  };

  return (
    <Modal
      open={visible}
      title="Chỉnh sửa Time Log"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={
          initialValues
            ? {
                performerId: initialValues.performerId,
                taskDate: dayjs(initialValues.taskDate),
                taskDescription: initialValues.taskDescription,
                hoursSpent: initialValues.hoursSpent,
              }
            : {}
        }
      >
        <Form.Item
          name="performerId"
          label="Người thực hiện"
          rules={[{ required: true, message: "Vui lòng chọn người thực hiện" }]}
        >
          <Select
            showSearch
            placeholder="Tìm kiếm người thực hiện"
            filterOption={false}
            onSearch={handleSearchUser}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            options={userOptions.map((u) => ({
              value: u.id,
              label: u.name,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="taskDate"
          label="Ngày thực hiện"
          rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="taskDescription"
          label="Mô tả công việc"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="hoursSpent"
          label="Số giờ"
          rules={[{ required: true, message: "Vui lòng nhập số giờ" }]}
        >
          <InputNumber min={0.1} max={24} step={0.1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTimeLogModal;