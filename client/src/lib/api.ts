import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove Content-Type for FormData requests
    if (config.data instanceof FormData) {
      if (config.headers && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};

// Convenience methods for common HTTP operations
export const apiGet = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>({ ...config, method: 'GET', url });

export const apiPost = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => apiRequest<T>({ ...config, method: 'POST', url, data });

export const apiPut = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => apiRequest<T>({ ...config, method: 'PUT', url, data });

export const apiPatch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) => apiRequest<T>({ ...config, method: 'PATCH', url, data });

export const apiDelete = <T = any>(url: string, config?: AxiosRequestConfig) =>
  apiRequest<T>({ ...config, method: 'DELETE', url });

export default api; 