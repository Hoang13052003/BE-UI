// src/components/common/ResendVerificationModal.tsx
import React, { useState } from "react";
import { Modal, Button, Typography, Space, Alert, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { resendVerificationEmailApi } from "../../api/authApi";

const { Text } = Typography;

interface ResendVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
}

const ResendVerificationModal: React.FC<ResendVerificationModalProps> = ({
  visible,
  onClose,
  email,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  const handleResend = async (): Promise<void> => {
    setIsLoading(true);
    setAlertMessage("");

    try {
      const response = await resendVerificationEmailApi(email);

      setMessageType("success");
      setAlertMessage(
        response.message || "Email xác thực đã được gửi lại thành công!"
      );
      message.success("Verification email sent successfully!");
    } catch (error: any) {
      console.error("Resend verification error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi gửi email";

      setMessageType("error");
      setAlertMessage(errorMessage);
      message.error("Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    setAlertMessage("");
    setMessageType(null);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <MailOutlined />
          <span>Gửi lại email xác thực</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={480}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Đóng
        </Button>,
        <Button
          key="resend"
          type="primary"
          loading={isLoading}
          onClick={handleResend}
        >
          {isLoading ? "Đang gửi..." : "Gửi lại"}
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Text>Gửi lại email xác thực đến:</Text>
          <br />
          <Text strong style={{ fontSize: "16px" }}>
            {email}
          </Text>
        </div>

        {alertMessage && messageType && (
          <Alert
            message={alertMessage}
            type={messageType}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        <Text type="secondary" style={{ fontSize: "12px" }}>
          Nếu bạn không nhận được email, vui lòng kiểm tra thư mục spam hoặc thử
          lại sau vài phút.
        </Text>
      </Space>
    </Modal>
  );
};

export default ResendVerificationModal;
