// src/pages/EmailVerification.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, Spin, Result, Button, Typography, Space, message } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { verifyEmailApi } from "../../api/authApi";

const { Title, Text } = Typography;

interface VerificationStatus {
  status: "verifying" | "success" | "error";
  message: string;
}

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] =
    useState<VerificationStatus>({
      status: "verifying",
      message: "",
    });
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setVerificationState({
        status: "error",
        message: "Invalid verification token",
      });
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  // Countdown timer for redirect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (verificationState.status === "success" && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (verificationState.status === "success" && countdown === 0) {
      navigate("/login");
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [verificationState.status, countdown, navigate]);

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      const response = await verifyEmailApi(token);

      setVerificationState({
        status: "success",
        message: response.message || "Email has been successfully verified!",
      });

      message.success("Email verification successful!");
    } catch (error: any) {
      console.error("Email verification error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "error occurred during email verification";

      setVerificationState({
        status: "error",
        message: errorMessage,
      });

      message.error("Email verification failed");
    }
  };

  const handleBackToLogin = (): void => {
    navigate("/login");
  };

  const renderContent = () => {
    switch (verificationState.status) {
      case "verifying":
        return (
          <Result
            icon={
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
              />
            }
            title="Verifying email..."
            subTitle="Please wait a moment"
          />
        );

      case "success":
        return (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            title="Verification Successful!"
            subTitle={
              <Space direction="vertical" size="small">
                <Text>{verificationState.message}</Text>
                <Text type="secondary">
                  You will be redirected to the login page in {countdown}{" "}
                  seconds...
                </Text>
              </Space>
            }
            extra={[
              <Button type="primary" key="login" onClick={handleBackToLogin}>
                Go to Login Page
              </Button>,
            ]}
          />
        );

      case "error":
        return (
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
            title="Verification Failed"
            subTitle={verificationState.message}
            extra={[
              <Button type="primary" key="login" onClick={handleBackToLogin}>
                Go to Login Page
              </Button>,
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-6">
            <Title level={2} className="mb-2">
              Email Verification
            </Title>
          </div>

          {renderContent()}
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
