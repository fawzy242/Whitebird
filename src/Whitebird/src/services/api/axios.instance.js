/**
 * Axios Instance Configuration
 * Simple axios setup with interceptors
 * Synchronized with main.js environment variables
 */

import axios from 'axios';
import { StorageService } from '../storage.service.js';

// Configuration from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || '';
const TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;
const DEBUG = import.meta.env.VITE_DEBUG === 'true' || import.meta.env.DEV;

// Log configuration in development
if (DEBUG) {
  console.log('⚙️ Axios Configuration:', {
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    debugMode: DEBUG,
    environment: import.meta.env.VITE_APP_ENV || 'development',
  });
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token from StorageService
    const token = StorageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking (optional)
    config.headers['X-Request-ID'] = Date.now();

    // Debug logging
    if (DEBUG) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data || '(empty)',
        params: config.params || '(none)',
        headers: {
          ...config.headers,
          Authorization: token ? 'Bearer ***' : '(none)',
        },
      });
    }

    return config;
  },
  (error) => {
    if (DEBUG) {
      console.error('❌ Request error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log(
        `📥 ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          responseType: response.config.responseType,
        }
      );
    }

    // JANGAN modifikasi response untuk file downloads (blob/arraybuffer)
    // Cek jika ini response untuk file download
    const isFileDownload = 
      response.config.responseType === 'blob' || 
      response.config.responseType === 'arraybuffer' ||
      response.headers['content-type']?.includes('application/vnd.openxmlformats') ||
      response.headers['content-type']?.includes('application/octet-stream') ||
      response.headers['content-disposition']?.includes('attachment');

    if (isFileDownload) {
      if (DEBUG) {
        console.log('📄 File download detected, returning raw response');
      }
      return response;
    }

    // Standardize response format hanya untuk JSON responses
    return {
      ...response,
      data: {
        ...response.data,
        isSuccess: true,
        status: response.status,
      },
    };
  },
  (error) => {
    // Enhanced error logging
    if (DEBUG) {
      console.error('💥 API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
        config: {
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
        },
      });
    }

    // Auto logout on 401 Unauthorized
    if (error.response?.status === 401) {
      StorageService.clearAuth();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));

      return Promise.reject({
        message: 'Your session has expired. Please login again.',
        status: 401,
        isSuccess: false,
        requiresLogin: true,
      });
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
        isSuccess: false,
        isNetworkError: true,
      });
    }

    // Standardize error response
    return Promise.reject({
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'API request failed',
      status: error.response?.status,
      data: error.response?.data,
      isSuccess: false,
      validationErrors: error.response?.data?.errors || null,
    });
  }
);

// Helper methods for common API operations
axiosInstance.download = async (url, filename) => {
  try {
    const response = await axiosInstance.get(url, {
      responseType: 'blob',
    });

    // Validasi response
    if (!(response.data instanceof Blob)) {
      console.error('❌ Response is not a Blob:', response.data);
      throw new Error('Invalid response format');
    }

    // Download file
    const downloadUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename || 'download.xlsx');
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    }, 100);

    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error };
  }
};

axiosInstance.upload = async (url, formData, onProgress) => {
  try {
    const response = await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

// Export
export { axiosInstance };
export default axiosInstance;