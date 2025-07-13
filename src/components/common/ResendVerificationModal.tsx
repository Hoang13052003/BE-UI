import React, { useState } from "react";
import { Modal, Button, Typography, Space, Alert } from "antd";
import { showNotification, showError } from "../../utils/notificationUtils";
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
        response.message || "Verification email has been sent successfully!"
      );
      showNotification.success("VERIFICATION_EMAIL_SENT");
    } catch (error: any) {
      console.error("Resend verification error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error occurred while sending email";

      setMessageType("error");
      setAlertMessage(errorMessage);
      showError(error, "VERIFICATION_EMAIL_FAILED");
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
          <span>Resend Verification Email</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={480}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Close
        </Button>,
        <Button
          key="resend"
          type="primary"
          loading={isLoading}
          onClick={handleResend}
        >
          {isLoading ? "Sending..." : "Resend"}
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Text>Resend verification email to:</Text>
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
          If you don't receive the email, please check your spam folder or try
          again in a few minutes.
        </Text>
      </Space>
    </Modal>
  );
};

export default ResendVerificationModal;
