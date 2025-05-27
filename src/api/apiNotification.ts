// src/api/apiNotification.ts
import {
  CreateNotificationRequestDto,
  MessageType,
  NotificationPageResponse,
  NotificationResponse,
} from "../types/Notification";
import { Project } from "../types/project";
import axiosClient from "./axiosClient";

/**
 * Tạo thông báo mới
 * @param notification Thông tin thông báo cần tạo
 * @returns Promise với dữ liệu thông báo đã tạo
 */
export const createNotification = async (
  notification: CreateNotificationRequestDto
): Promise<NotificationResponse> => {
  const response = await axiosClient.post("/api/notifications", notification);
  return response.data;
};
/**
 * Lấy chi tiết thông báo theo ID
 * @param notificationId ID của thông báo
 * @returns Promise với chi tiết thông báo
 */
export const getNotificationById = async (
  notificationId: string
): Promise<NotificationResponse> => {
  const response = await axiosClient.get(
    `/api/notifications/${notificationId}`
  );
  return response.data;
};

/**
 * Lấy danh sách thông báo của người dùng (có phân trang)
 * @param userId ID của người dùng
 * @param page Số trang (bắt đầu từ 0)
 * @param size Số lượng thông báo mỗi trang
 * @returns Promise với danh sách thông báo đã phân trang
 */
export const getUserNotifications = async (
  userId: number,
  page: number = 0,
  size: number = 10
): Promise<NotificationPageResponse> => {
  const response = await axiosClient.get("/api/notifications", {
    params: {
      userId,
      page,
      size,
    },
  });
  return response.data;
};

/**
 * Lấy danh sách thông báo chưa đọc của người dùng
 * @param userId ID của người dùng
 * @returns Promise với danh sách thông báo chưa đọc
 */
export const getUnreadNotifications = async (
  userId: number
): Promise<NotificationResponse[]> => {
  const response = await axiosClient.get("/api/notifications/unread", {
    params: { userId },
  });
  return response.data;
};

/**
 * Lấy danh sách thông báo theo loại
 * @param userId ID của người dùng
 * @param type Loại thông báo
 * @returns Promise với danh sách thông báo theo loại
 */
export const getNotificationsByType = async (
  userId: number,
  type: MessageType
): Promise<NotificationResponse[]> => {
  const response = await axiosClient.get(`/api/notifications/type/${type}`, {
    params: { userId },
  });
  return response.data;
};

/**
 * Lấy 10 thông báo mới nhất của người dùng
 * @param userId ID của người dùng
 * @returns Promise với danh sách 10 thông báo mới nhất
 */
export const getLatestNotifications = async (
  userId: number
): Promise<NotificationResponse[]> => {
  const response = await axiosClient.get("/api/notifications/latest", {
    params: { userId },
  });
  return response.data;
};

/**
 * Đánh dấu một thông báo đã đọc
 * @param notificationId ID của thông báo
 * @returns Promise không có dữ liệu trả về
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  await axiosClient.patch(`/api/notifications/${notificationId}/read`);
};

/**
 * Đánh dấu nhiều thông báo đã đọc
 * @param userId ID của người dùng
 * @param notificationIds Danh sách ID các thông báo
 * @returns Promise không có dữ liệu trả về
 */
export const markMultipleAsRead = async (
  userId: number,
  notificationIds: string[]
): Promise<void> => {
  await axiosClient.patch("/api/notifications/read/batch", notificationIds, {
    params: { userId },
  });
};

/**
 * Đánh dấu tất cả thông báo của người dùng đã đọc
 * @param userId ID của người dùng
 * @returns Promise không có dữ liệu trả về
 */
export const markAllAsRead = async (userId: number): Promise<void> => {
  // Trước tiên lấy tất cả thông báo chưa đọc
  const unreadNotifications = await getUnreadNotifications(userId);
  const notificationIds = unreadNotifications.map(
    (notification) => notification.id
  );

  if (notificationIds.length > 0) {
    await markMultipleAsRead(userId, notificationIds);
  }
};

/**
 * Đếm số thông báo chưa đọc của người dùng
 * @param userId ID của người dùng
 * @returns Promise với số lượng thông báo chưa đọc
 */
export const countUnreadNotifications = async (
  userId: number
): Promise<number> => {
  const response = await axiosClient.get("/api/notifications/count/unread", {
    params: { userId },
  });
  return response.data;
};

/**
 * Xóa một thông báo
 * @param notificationId ID của thông báo
 * @returns Promise không có dữ liệu trả về
 */
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  await axiosClient.delete(`/api/notifications/${notificationId}`);
};

/**
 * Xóa nhiều thông báo
 * @param notificationIds Danh sách ID các thông báo cần xóa
 * @returns Promise không có dữ liệu trả về
 */
export const deleteMultipleNotifications = async (
  notificationIds: string[]
): Promise<void> => {
  // Lưu ý: Backend cần phải có API endpoint này
  // Giả sử backend có endpoint này, nếu không thì phải gọi delete từng cái một
  await Promise.all(notificationIds.map((id) => deleteNotification(id)));
};

export const getProjectById = async (id: number): Promise<Project> => {
  try {
    const { data } = await axiosClient.get<Project>(
      `/api/notifications/projects/${id}`
    );
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Project not found") {
        throw error;
      } else if (error.message === "Invalid project data") {
        throw error;
      }
    }
    throw error;
  }
};

const apiNotification = {
  createNotification,
  getUserNotifications,
  getUnreadNotifications,
  getNotificationsByType,
  getLatestNotifications,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  countUnreadNotifications,
  deleteNotification,
  deleteMultipleNotifications,
  getProjectById,
};

export default apiNotification;
