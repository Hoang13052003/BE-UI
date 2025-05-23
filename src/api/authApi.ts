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
  const { data } = await axiosClient.post("/api/auth/reset-password", {
    token,
    newPassword,
  });
  return data;
};

export const logoutApi = async (token: string): Promise<AuthResponse> => {
  const { data } = await axiosClient.delete<AuthResponse>("/api/auth/logout", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const signupApi = async (
  email: string,
  password: string,
  fullName: string,
  recaptchaToken: string
) => {
  try {
    console.log("Sending signup request with token:", recaptchaToken);

    const response = await axiosClient.post("/api/auth/signup", {
      email,
      password,
      fullName,
      recaptchaToken, // Đảm bảo tên field này match với backend DTO
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Signup API Error:", error);
    throw error;
  }
};

export const getUserInfoApi = async (token: string): Promise<UserInfo> => {
  const { data } = await axiosClient.get("/api/auth/user", {
    params: { token },
  });
  return data;
};
