import { notification } from "antd";

export const openErrorNotification = (message: string) => {
    notification.error({
      message: "Lỗi",               // tiêu đề
      description: message,         // nội dung
      placement: "topRight",        // vị trí
      duration: 6,                  // tự đóng sau 6s
    });
  };