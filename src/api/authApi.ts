import axiosClient from "./axiosClient";

export const KEY_TOKEN = "accessToken";

export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  image: string;
  note: string;
  role: string;
}

export const loginApi = async (email: string, password: string) => {
  const { data } = await axiosClient.post("/api/auth/login", {
    email,
    password,
  });
  return data;
};

export const forgotPasswordApi = async (email: string) => {
  const { data } = await axiosClient.post("/api/auth/forgot-password", {
    email,
  });
  return data;
};

export const resetPasswordApi = async (token: string, newPassword: string) => {
  alert("Có: " + token);
  const { data } = await axiosClient.post("/api/auth/reset-password", {
    token,
    newPassword,
  });
  return data;
};

export const logoutApi = async (): Promise<void> => {
  await axiosClient.delete("/api/auth/logout");
};

export const signupApi = async (
  email: string,
  password: string,
  fullName: string
) => {
  const response = await axiosClient.post("/api/auth/signup", {
    email,
    password,
    fullName,
  });
  return response.data;
};

export const getUserInfoApi = async (): Promise<UserInfo> => {
  const { data } = await axiosClient.get("/api/private/user/info");
  return data;
};
