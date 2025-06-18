import React from "react";
import { Alert, Space } from "antd";
import { useAlert } from "../contexts/AlertContext";

const AlertContainer: React.FC = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 1000,
        width: "auto",
        maxWidth: "400px",
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {alerts.map((alert) => (
          <Alert
            key={alert.key}
            message={alert.message}
            description={alert.description}
            type={alert.type}
            showIcon
            closable
            onClose={() => removeAlert(alert.key)}
            style={{
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              borderRadius: "4px",
            }}
          />
        ))}
      </Space>
    </div>
  );
};

export default AlertContainer;
