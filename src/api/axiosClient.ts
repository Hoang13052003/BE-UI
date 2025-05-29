import axios, { AxiosInstance } from "axios";

const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const isPublicApi = config.url?.includes("/api/auth/");

  if (token && !isPublicApi) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hàm gọi refresh token
const refreshAccessToken = async () => {
  const tokenRefresh = localStorage.getItem("tokenRefresh");

  if (!tokenRefresh) throw new Error("No refresh token available");

  const response = await axiosClient.get("/api/auth/refresh-token", {
    headers: {
      "X-Refresh-Token": `Bearer ${tokenRefresh}`,
    },
  });

  return response.data; // { jwt, jwtRefreshToken }
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

// Response interceptor
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
