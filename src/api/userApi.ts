import { UpdateUserPayload, User, UserManager } from "../types/User";
import axiosClient from "./axiosClient";

export const filterUsers = async (
  criteria: { fullName?: string; email?: string; role?: string },
  page: number,
  size: number
) => {
  try {
    const params: Record<string, string | number> = {
      page,
      size,
    };

    if (criteria.fullName) {
      params["fullName.contains"] = criteria.fullName;
    }

    if (criteria.email) {
      params["email.contains"] = criteria.email;
    }

    if (criteria.role) {
      params["role.equals"] = criteria.role;
    }

    const response = await axiosClient.get("/api/private/admin/user", {
      params,
    });

    const { data, headers } = response;
    const totalCount = headers["x-total-count"];
    const links = headers["x-link"];

    return { users: data, totalCount, links };
  } catch (error) {
    console.error("Error fetching filtered users:", error);
    throw error;
  }
};

export const getUserManager = async (): Promise<UserManager> => {
  const { data } = await axiosClient.get<UserManager>(
    "/api/private/admin/user-manager"
  );
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
  id: number,
  data: UpdateUserPayload
): Promise<User> => {
  return axiosClient.put(`/api/private/admin/update-user/${id}`, data);
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
