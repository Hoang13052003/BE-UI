// src/components/Admin/ProjectProgress/SendReportProjectUpdateModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, Button, message, Table, Space, Avatar, Checkbox } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ProjectUpdate,
  updateProjectUpdateStatusApi,
  UpdateStatusEnum,
} from "../../../api/projectUpdateApi";
import { getUsersByProjectId } from "../../../api/projectApi";
import { User } from "../../../types/User";
import {
  CreateNotificationRequestDto,
  MessageType,
  NotificationPriority,
} from "../../../types/Notification";
import { createNotification } from "../../../api/apiNotification";
import { SendOutlined, UserOutlined } from "@ant-design/icons";
import { useAlert } from "../../../contexts/AlertContext";
import { sendReport } from "../../../api/reportApi";

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
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
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

  const handleSelectUser = (userId: number, checked: boolean) => {
    setSelectedUserIds((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedUserIds(checked ? users.map((user) => user.id) : []);
  };

  const handleSendToSelected = async () => {
    if (selectedUserIds.length === 0) {
      addAlert("Please select at least one user", "warning");
      return;
    }

    setLoading(true);
    try {
      // Gửi notification như cũ
      await Promise.all(
        selectedUserIds.map((userId) =>
          createNotification({
            userId,
            title: "Project Update Report",
            content: updateData.summary,
            type: MessageType.PROJECT_UPDATED,
            priority: NotificationPriority.HIGH,
            metadata: {
              updateId: updateData.id,
              projectId: updateData.projectId,
            },
          } as CreateNotificationRequestDto)
        )
      );

      // Gửi email report cho các user đã chọn
      const selectedUsers = users.filter((user) =>
        selectedUserIds.includes(user.id)
      );
      await Promise.all(
        selectedUsers.map((user) =>
          sendReport({
            to: user.email,
            subject: `Project Update: ${updateData.projectName || ""}`,
            url: `${window.location.origin}/client/project-updates/${updateData.id}`,
          })
        )
      );

      await updateProjectUpdateStatusApi(updateData.id, UpdateStatusEnum.SENT);

      addAlert(
        `Report sent to ${selectedUserIds.length} users successfully`,
        "success"
      );
      onClose();
    } catch (error) {
      addAlert("Failed to send reports", "error", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: (
        <Checkbox
          indeterminate={
            selectedUserIds.length > 0 && selectedUserIds.length < users.length
          }
          checked={selectedUserIds.length === users.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: "select",
      width: "50px",
      render: (_, record) => (
        <Checkbox
          checked={selectedUserIds.includes(record.id)}
          onChange={(e) => handleSelectUser(record.id, e.target.checked)}
        />
      ),
    },
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
      title="Send Project Update"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="send"
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendToSelected}
          loading={loading}
          disabled={selectedUserIds.length === 0}
        >
          Send to Selected ({selectedUserIds.length})
        </Button>,
      ]}
      destroyOnHidden
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
