import { notification } from "antd";

export const openErrorNotification = (message: string) => {
  notification.error({
    message: "Error",
    description: message,
    placement: "topRight",
    duration: 6,
  });
};
