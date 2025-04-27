import axios, { AxiosInstance, AxiosResponse } from "axios";

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const isPublicApi =
    config.url?.includes("/api/auth/login") ||
    config.url?.includes("/api/auth/register") ||
    config.url?.includes("/api/auth/reset-password") ||
    config.url?.includes("/api/auth/forgot-password");

  if (token && !isPublicApi) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Perform actions on successful response
    return response;
  },
  (error) => {
    // Handle response error
    return Promise.reject(error);
  }
);

export default axiosClient;
