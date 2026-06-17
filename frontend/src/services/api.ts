import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    if (code !== 200) {
      throw new Error(message || '请求失败');
    }
    return data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const responseData = error.response?.data as { message?: string; detail?: string } | undefined;
    const errorMessage = responseData?.message || responseData?.detail || error.message;
    throw new Error(errorMessage);
  }
);

export default apiClient;
