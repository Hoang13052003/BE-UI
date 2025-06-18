import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

export type AlertType = "success" | "info" | "warning" | "error";

export interface AlertItem {
  key: number;
  message: string;
  description?: string;
  type: AlertType;
  createdAt: number;
}

interface AlertContextProps {
  alerts: AlertItem[];
  addAlert: (message: string, type: AlertType, description?: string) => void;
  addAlertWithDelay: (
    message: string,
    type: AlertType,
    description?: string,
    delayMs?: number
  ) => void;
  addBatchAlerts: (
    alertsData: { message: string; type: AlertType; description?: string }[],
    options?: {
      maxDisplay?: number;
      interval?: number;
      summaryMessage?: string;
    }
  ) => void;
  removeAlert: (key: number) => void;
  clearAlerts: () => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const MAX_VISIBLE_ALERTS = 5;

  const addAlert = useCallback(
    (message: string, type: AlertType, description?: string) => {
      const key = Date.now() + Math.random();
      const createdAt = Date.now();

      setAlerts((prev) => {
        const newAlerts = [
          ...prev,
          { key, message, description, type, createdAt },
        ];

        if (newAlerts.length > MAX_VISIBLE_ALERTS) {
          return newAlerts
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, MAX_VISIBLE_ALERTS);
        }

        return newAlerts;
      });

      const duration =
        type === "error" ? 7000 : type === "warning" ? 6000 : 4000;
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.key !== key));
      }, duration);
    },
    []
  );

  const addAlertWithDelay = useCallback(
    (message: string, type: AlertType, description?: string, delayMs = 300) => {
      setTimeout(() => {
        addAlert(message, type, description);
      }, delayMs);
    },
    [addAlert]
  );

  const addBatchAlerts = useCallback(
    (
      alertsData: { message: string; type: AlertType; description?: string }[],
      options?: {
        maxDisplay?: number;
        interval?: number;
        summaryMessage?: string;
      }
    ) => {
      const maxDisplay = options?.maxDisplay || 3;
      const interval = options?.interval || 300;

      const displayedAlerts = alertsData.slice(0, maxDisplay);

      displayedAlerts.forEach((alert, index) => {
        setTimeout(() => {
          addAlert(alert.message, alert.type, alert.description);
        }, interval * index);
      });

      if (alertsData.length > maxDisplay && options?.summaryMessage) {
        const summaryMessage = options.summaryMessage;
        setTimeout(() => {
          const summaryText = summaryMessage.replace(
            "{count}",
            `${alertsData.length - maxDisplay}`
          );
          addAlert(summaryText, "info");
        }, interval * maxDisplay);
      }
    },
    [addAlert]
  );

  const removeAlert = useCallback((key: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.key !== key));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        addAlert,
        addAlertWithDelay,
        addBatchAlerts,
        removeAlert,
        clearAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
