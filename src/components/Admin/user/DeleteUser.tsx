import React, { useState, useEffect } from 'react';
import { Typography, Button, Space, message, Spin, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteUser, getUser } from '../../../api/userApi';
import { AxiosError } from 'axios';
import { User } from '../../../types/User';

interface DeleteUserProps {
  userId: number;
  onSuccess: () => void;
}

const { Title, Text } = Typography;

const DeleteUser: React.FC<DeleteUserProps> = ({ userId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      // Convert userId to string if your API expects a string parameter
      const user = await getUser(userId);
      setUserData(user);
    } catch (error) {
      const axiosError = error as AxiosError;
      message.error(`Failed to fetch user details: ${axiosError.message || 'Something went wrong'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await deleteUser(userId);

      alert('User deleted successfully');
      
      onSuccess();
    } catch (error) {
      const axiosError = error as AxiosError;
      message.error(`Failed to delete user: ${axiosError.message || 'Something went wrong'}`);
      console.error('Error deleting user:', error);
      setIsDeleting(false);
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
      <div className="mb-6 text-center">
        <ExclamationCircleOutlined className="text-6xl text-red-500 mb-4" />
        <Title level={4}>Delete User</Title>
        <Text className="block mb-2">
          Are you sure you want to delete this user?
        </Text>
      </div>

      <Alert
        className="my-4"
        style={{ 
            backgroundColor: '#fff3cd',
            borderColor: '#ffeeba',
            color: '#856404',
            borderRadius: '10px',
            marginTop: '16px',
            marginBottom: '16px',
            padding: '16px',
         }}
        message="This action cannot be undone"
        description={
          <div className="mt-2">
            <div className="font-medium">User details:</div>
            <div>Name: {userData?.fullName}</div>
            <div>Email: {userData?.email}</div>
            <div>Role: {userData?.role || 'N/A'}</div>
          </div>
        }
        type="warning"
        showIcon
      />

      <div className="flex justify-center mt-6">
        <Space>
          <Button
            danger
            type="primary"
            onClick={handleDelete}
            loading={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
          <Button onClick={onSuccess}>
            Cancel
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default DeleteUser;