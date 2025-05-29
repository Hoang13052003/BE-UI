// src/components/Admin/ProjectProgress/ChangePasswordModal.tsx
import React, { useEffect, useState } from "react";
import { Modal, Input, Form } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { resetPasswordApi } from "../api/authApi"; // Adjust path if needed
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { addAlert } = useAlert();
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [visible, form]);

  const handleSubmit = async () => {
    try {
      const { newPassword, confirmPassword } = await form.validateFields();

      if (newPassword !== confirmPassword) {
        addAlert("Password confirmation does not match!", "warning");
        return;
      }

      setLoading(true);
      await resetPasswordApi(token as string, newPassword);
      addAlert("Password changed successfully!", "success");
      form.resetFields();
      onSuccess();
    } catch (error) {
      addAlert(
        "An error occurred while changing the password.",
        "error",
        JSON.stringify(error)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Change Password"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Confirm"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please enter a new password!" },
            { min: 6, message: "Password must be at least 6 characters long." },
          ]}
        >
          <Input.Password
            placeholder="Enter new password"
            prefix={<LockOutlined />}
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Password confirmation does not match.")
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Confirm your password"
            prefix={<LockOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
