import React, { useState } from "react";
import { Form, Input, Button, Select } from "antd";
import { showNotification } from "../../../utils/notificationUtils";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { createUser } from "../../../api/userApi";
// import { useNavigate } from 'react-router-dom';
import { UserRegister } from "../../../types/User";
import { useAlert } from "../../../contexts/AlertContext";

// Define role options as constants
const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
  { value: "MANAGER", label: "Manager" },
];

interface AddUserProps {
  onSuccess: () => void; // Thêm prop onSuccesss
}
const AddUser: React.FC<AddUserProps> = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { addAlert } = useAlert();

  const handleSubmit = async (values: UserRegister) => {
    setIsSubmitting(true);
    try {
      if (values.password !== values.confirmPassword) {
        showNotification.error("PASSWORD_MISMATCH");
        return;
      } else {
        values.confirmPassword = undefined; // Clear confirmPassword before sending
      }

      await createUser(values);

      showNotification.success("USER_CREATED");
      form.resetFields();
      window.location.pathname = "/admin/users"; // Redirect to user management page
    } catch (error: any) {
      // Handle specific error cases
      addAlert(error.response.data.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <Form
        form={form}
        name="addUserForm"
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[
            { required: true, message: "Please enter full name" },
            { min: 3, message: "Name must be at least 3 characters" },
            { max: 150, message: "Name cannot exceed 150 characters" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Enter full name"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter email address" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="Enter email address"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please select a role" }]}
        >
          <Select
            placeholder="Select role"
            className="rounded-md"
            options={ROLE_OPTIONS}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please enter password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter password"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Confirm password"
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item label="Note" name="note">
          <Input.TextArea
            placeholder="Additional notes (optional)"
            rows={4}
            className="rounded-md"
          />
        </Form.Item>

        <Form.Item className="mt-6">
          <div className="flex gap-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add User
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddUser;
