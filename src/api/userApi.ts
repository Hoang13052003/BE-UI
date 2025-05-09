import { User } from "../types/User";
import axiosClient from "./axiosClient";

export interface UpdateUserPayload {
  email?: string;
  role?: "admin" | "client";
  projects?: string[];
}

export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await axiosClient.get<User[]>("/api/private/admin/all-user");
  return data;
};

export const getUser = async (id: number): Promise<User> => {
  const { data } = await axiosClient.get<User>(`/api/private/admin/user/${id}`);
  return data;
};

export const createUser = (data: User): Promise<User> => {
  return axiosClient.post("/api/private/admin/create-user", data);
};

export const updateUser = (
  userId: string,
  data: UpdateUserPayload
): Promise<User> => {
  return axiosClient.put(`/users/${userId}`, data);
};

export const deleteUser = async (id: number): Promise<void> => {
  const { data } = await axiosClient.delete(
    `/api/private/admin/delete-user/${id}`
  );
  return data;
};

export const resetPassword = (
  userId: string,
  newPassword?: string
): Promise<void> => {
  return axiosClient.post(`/users/reset-password`, { userId, newPassword });
};

export const getUserInfoApi = async (): Promise<User> => {
  const { data } = await axiosClient.get("/api/private/user/info");
  return data;
};
