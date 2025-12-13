/**
 * Axios Instance Configuration
 * Simple axios setup with interceptors
 */

import axios from 'axios';
import { StorageService } from '../storage.service.js';

// Configuration
const BASE_URL = import.meta.env.VITE_API_URL || '';
const TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = StorageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging
    if (DEBUG) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }

    return config;
  },
  (error) => {
    if (DEBUG) console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log(
        `📥 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }
    return response;
  },
  (error) => {
    if (DEBUG) {
      console.error(`💥 API Error:`, {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
      });
    }

    // Auto logout on 401
    if (error.response?.status === 401) {
      StorageService.clearAuth();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }

    return Promise.reject({
      message: error.response?.data?.message || error.message || 'API request failed',
      status: error.response?.status,
      data: error.response?.data,
      isSuccess: false,
    });
  }
);

// Export
export { axiosInstance };
export default axiosInstance;
