import axios from 'axios';

const uploadClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

uploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

uploadClient.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    if (code !== 200) {
      throw new Error(message || '上传失败');
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
);

export const uploadService = {
  uploadImage: async (file: File): Promise<{ image_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteImage: async (imageUrl: string): Promise<void> => {
    return uploadClient.delete('/upload/image', { params: { image_url: imageUrl } });
  },
};