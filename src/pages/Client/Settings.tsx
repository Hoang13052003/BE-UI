// Settings.tsx
import { Card, Tabs, Typography, Button, Tag, Space } from "antd";
import {
  DeleteOutlined,
  LogoutOutlined,
  EditOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import {useState } from "react";

const { Text } = Typography;

const AccountTab = () => {
  const { userDetails } = useAuth();
  const [isChangePasswordModalVisible, setChangePasswordModalVisible] =
    useState<boolean>(false);

  const handleChangePassword = () => {
    setChangePasswordModalVisible(true);
  };
  const onClose = () => {
    setChangePasswordModalVisible(false);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <Card title="Account Information">
        <p>
          <b>Full name:</b> {userDetails?.fullName}{" "}
          <Tag color="green">Verified</Tag>
        </p>
        <p>
          <b>Email:</b> {userDetails?.email}
        </p>
        <p>
          <b>Status:</b> <Tag color="green">Active</Tag>
        </p>
        <p>
          <b>Account Type:</b> <Tag color="gold">Admin</Tag>{" "}
        </p>
      </Card>

      <Card title="Login Settings">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button icon={<EditOutlined />} onClick={handleChangePassword}>
            Change Password
          </Button>
          <Text type="secondary">Last updated: 15/05/2023</Text>
          {/* <Divider />
          <Text strong>Two-Factor Authentication (2FA)</Text>
          <Button icon={<LockOutlined />}>Enable 2FA</Button> */}
        </Space>
      </Card>

      {/* <Card title="Recent Login Activity">
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              browser: "Chrome on Windows",
              ip: "192.168.100.1",
              time: "09:30",
              active: true,
            },
            {
              browser: "Safari on iPhone",
              ip: "192.168.100.2",
              time: "11:45",
              active: false,
            },
          ]}
          renderItem={(item) => (
            <List.Item
              extra={
                item.active ? (
                  <Tag color="green">Active</Tag>
                ) : (
                  <Tag color="red">Past</Tag>
                )
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={
                      item.active ? (
                        <CheckCircleTwoTone twoToneColor="#52c41a" />
                      ) : (
                        <WarningTwoTone twoToneColor="#faad14" />
                      )
                    }
                  />
                }
                title={item.browser}
                description={`${item.ip} - ${item.time}`}
              />
            </List.Item>
          )}
        />
      </Card> */}

      <Card title="Account Actions">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button icon={<LogoutOutlined />} danger>
            Log Out
          </Button>
          <Button icon={<LockOutlined />} type="default">
            Deactivate Account
          </Button>
          <Button icon={<DeleteOutlined />} danger>
            Delete Account
          </Button>
        </Space>
      </Card>

      <ChangePasswordModal
        visible={isChangePasswordModalVisible}
        onClose={() => onClose()}
        onSuccess={() => {
          setChangePasswordModalVisible(false);
        }}
      />
    </Space>
  );
};

const Settings: React.FC = () => {
  return (
    <Card title="Account Settings" style={{ height: "100%" }}>
      <Tabs
        tabPosition="left"
        style={{ width: "100%", marginBottom: 24 }}
        defaultActiveKey="1"
        tabBarStyle={{ width: 200 }}
        tabBarGutter={0}
        items={[
          {
            label: "Account",
            key: "1",
            children: <AccountTab />,
          },
          {
            label: "Notifications",
            key: "2",
            children: <div>Configure your notifications here...</div>,
          },
          {
            label: "Security",
            key: "3",
            children: <div>Security options go here...</div>,
          },
        ]}
      />
    </Card>
  );
};

export default Settings;
