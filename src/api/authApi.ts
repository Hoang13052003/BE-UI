import axiosClient from "./axiosClient";

export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  image: string;
  note: string;
  role: string;
}

export interface LoginResponse {
  jwt: string;
  jwtRefreshToken: string;
}

export interface AuthResponse {
  message: string;
}

export interface ChangePasswordData {
  token?: string;
  newPassword?: string;
}

export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<LoginResponse>("/api/auth/login", {
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

export const logoutApi = async (): Promise<AuthResponse> => {
  const { data } = await axiosClient.delete<AuthResponse>("/api/auth/logout");
  return data;
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
