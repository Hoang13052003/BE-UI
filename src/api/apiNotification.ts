import {
  CreateNotificationRequestDto,
  MessageType,
  NotificationPageResponse,
  NotificationResponse,
} from "../types/Notification";
import { Project } from "../types/project";
import axiosClient from "./axiosClient";

export const createNotification = async (
  notification: CreateNotificationRequestDto
): Promise<NotificationResponse> => {
  const response = await axiosClient.post("/api/notifications", notification);
  return response.data;
};

export const getNotificationById = async (
  notificationId: string
): Promise<NotificationResponse> => {
  const response = await axiosClient.get(
    `/api/notifications/${notificationId}`
  );
  return response.data;
};

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

export const getUnreadNotifications = async (
  userId: number
): Promise<NotificationResponse[]> => {
  const response = await axiosClient.get("/api/notifications/unread", {
    params: { userId },
  });
  return response.data;
};

export const getNotificationsByType = async (
  userId: number,
  type: MessageType
): Promise<NotificationResponse[]> => {
  const response = await axiosClient.get(`/api/notifications/type/${type}`, {
    params: { userId },
  });
  return response.data;
};

export const getLatestNotifications = async (
  userId: number
): Promise<NotificationResponse[]> => {
  const response = await axiosClient.get("/api/notifications/latest", {
    params: { userId },
  });
  return response.data;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  await axiosClient.patch(`/api/notifications/${notificationId}/read`);
};

export const markMultipleAsRead = async (
  userId: number,
  notificationIds: string[]
): Promise<void> => {
  await axiosClient.patch("/api/notifications/read/batch", notificationIds, {
    params: { userId },
  });
};

export const markAllAsRead = async (userId: number): Promise<void> => {
  const unreadNotifications = await getUnreadNotifications(userId);
  const notificationIds = unreadNotifications.map(
    (notification) => notification.id
  );

  if (notificationIds.length > 0) {
    await markMultipleAsRead(userId, notificationIds);
  }
};

export const countUnreadNotifications = async (
  userId: number
): Promise<number> => {
  const response = await axiosClient.get("/api/notifications/count/unread", {
    params: { userId },
  });
  return response.data;
};

export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  await axiosClient.delete(`/api/notifications/${notificationId}`);
};

export const deleteMultipleNotifications = async (
  notificationIds: string[]
): Promise<void> => {
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
