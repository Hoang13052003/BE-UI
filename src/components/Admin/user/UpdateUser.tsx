import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Spin, message } from "antd";
import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { getUser, updateUser } from "../../../api/userApi";
import { UpdateUserPayload } from "../../../types/User";
import { ApiError } from "../../../types/ApiError";

interface UpdateUserProps {
  userId: number;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
  { value: "MANAGER", label: "Manager" },
];

const UpdateUser: React.FC<UpdateUserProps> = ({ userId, onSuccess }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const userData = await getUser(userId);

      form.setFieldsValue({
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        note: userData.note,
      });
    } catch (error: unknown) {
      const apiError = error as ApiError;
      message.error("Failed to fetch user details");
      console.error("Error fetching user:", apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: UpdateUserPayload) => {
    setIsSubmitting(true);
    try {
      await updateUser(userId, values);
      message.success("User updated successfully");
      onSuccess();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 409) {
        message.error("Email already exists. Please use a different email.");
      } else {
        message.error("Failed to update user");
      }
      console.error("Error updating user:", apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Form
        form={form}
        name="updateUserForm"
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
              Update User
            </Button>
            <Button onClick={onSuccess} className="border-gray-300">
              Cancel
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UpdateUser;
