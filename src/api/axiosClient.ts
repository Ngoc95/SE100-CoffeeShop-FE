import axios from 'axios';
import { refreshToken } from './authApi';

const axiosClient = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true, // 🔥 bắt buộc để gửi cookie
});

// Gắn access token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // Chỉ xử lý khi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Nếu đang refresh → đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await refreshToken();
        const newToken = res.data.metaData.accessToken;

        // Lưu token mới
        localStorage.setItem('accessToken', newToken);
        axiosClient.defaults.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return axiosClient(originalRequest);

      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
