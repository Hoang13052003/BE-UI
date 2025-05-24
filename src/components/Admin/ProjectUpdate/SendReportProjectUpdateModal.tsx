// src/components/Admin/ProjectProgress/SendReportProjectUpdateModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, Button, message, Table, Space, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ProjectUpdate } from "../../../api/projectUpdateApi";
import { getUsersByProjectId } from "../../../api/projectApi";
import { User } from "../../../types/User";
import { MessageType, NotificationPriority } from "../../../types/Notification";
import { createNotification } from "../../../api/apiNotification";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { useAlert } from "../../../contexts/AlertContext";

interface SendReportProjectUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  updateData: ProjectUpdate;
}

const SendReportProjectUpdateModal: React.FC<
  SendReportProjectUpdateModalProps
> = ({ visible, onClose, updateData }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const { addAlert } = useAlert();

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (!updateData?.projectId) return;
      try {
        const users = await getUsersByProjectId(updateData.projectId);
        setUsers(users);
      } catch (error) {
        console.error("Failed to fetch users assigned to project:", error);
        message.error("Failed to load assigned users.");
      }
    };

    if (visible && updateData?.projectId) {
      fetchAssignedUsers();
    }
  }, [visible, updateData?.projectId]);

  const handleSendReport = async (userId: number) => {
    try {
      setLoading(true);

      await createNotification({
        userId: userId,
        title: "Project Update Report",
        content: updateData.summary,
        type: MessageType.PROJECT_UPDATED,
        priority: NotificationPriority.HIGH,
        metadata: {
          updateId: updateData.id,
          projectId: updateData.projectId,
        },
      });

      addAlert(`Report sent to user successfully`, "success");

      onClose();
    } catch (error) {
      addAlert("Failed to send report", "error", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "User",
      key: "user",
      width: "30%",
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.image}
            icon={!record.image && <UserOutlined />}
            className="bg-blue-500"
          />
          <div>
            <div className="font-medium">{record.fullName}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleSendReport(record.id)}
            loading={loading}
            icon={<SendOutlined />}
          >
            Send
          </Button>
        </Space>
      ),
    },
  ];

  if (users.length === 0) {
    return (
      <Modal
        title="No Users Assigned"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        <p>No users are assigned to this project.</p>
      </Modal>
    );
  }

  if (loading) {
    return (
      <Modal
        title="Loading Users"
        open={visible}
        onCancel={onClose}
        footer={null}
      >
        <p>Loading assigned users...</p>
      </Modal>
    );
  }

  return (
    <Modal
      title="Edit Project Update"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
      ]}
      destroyOnClose
    >
      <Table
        rowKey="id"
        dataSource={users}
        columns={columns}
        pagination={false}
        loading={loading}
      />
    </Modal>
  );
};

export default SendReportProjectUpdateModal;
