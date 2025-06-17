import axios, { AxiosInstance } from "axios";
import { normalizeBaseUrl } from "../utils/urlUtils";

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined in your .env file.");
}

const normalizedBaseURL = normalizeBaseUrl(API_BASE_URL);

const axiosClient: AxiosInstance = axios.create({
  baseURL: normalizedBaseURL,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  const publicPaths = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/refresh-token",
  ];
  const isPublic = publicPaths.some((path) => config.url?.startsWith(path));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const refreshAccessToken = async (): Promise<{
  jwt: string;
  jwtRefreshToken: string;
}> => {
  const refreshToken = localStorage.getItem("tokenRefresh");
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await axios.get(
    `${normalizedBaseURL}/api/auth/refresh-token`,
    {
      headers: {
        "X-Refresh-Token": `Bearer ${refreshToken}`,
      },
    }
  );
  return response.data;
};

let isRefreshing = false;
type FailedQueueItem = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { jwt, jwtRefreshToken } = await refreshAccessToken();

        localStorage.setItem("token", jwt);
        localStorage.setItem("tokenRefresh", jwtRefreshToken);

        processQueue(null, jwt);

        originalRequest.headers.Authorization = `Bearer ${jwt}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error("Refresh token failed:", refreshError);
        alert("Your session has expired. Please log in again.");
        localStorage.clear();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
