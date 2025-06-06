// src/components/AuditLogDashboard/ErrorAlert.tsx
import React from 'react';
import { Alert, Button, Space } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  showRetry?: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  onDismiss,
  type = 'error',
  showRetry = true
}) => {
  return (
    <Alert
      message={type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Information'}
      description={error}
      type={type}
      showIcon
      icon={<WarningOutlined />}
      action={
        <Space>
          {showRetry && onRetry && (
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={onRetry}
              type="primary"
              ghost
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              size="small"
              onClick={onDismiss}
              type="text"
            >
              Dismiss
            </Button>
          )}
        </Space>
      }
      style={{ marginBottom: 16 }}
    />
  );
};

export default ErrorAlert;
