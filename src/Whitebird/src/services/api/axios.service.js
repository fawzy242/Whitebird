/**
 * Axios API Service
 * Enterprise-grade HTTP client with interceptors, error handling, and retry logic
 */

import axios from 'axios';
import { StorageService } from '../storage.service.js';
import { EventBus } from '../../utils/event-bus.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.redadmin.local/v1';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

class AxiosService {
  constructor() {
    this.axiosInstance = null;
    this.requestQueue = [];
    this.isRefreshing = false;
    this.initializeAxios();
  }

  /**
   * Initialize Axios instance with interceptors
   */
  initializeAxios() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Setup request interceptor
   */
  setupRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authentication token
        const token = StorageService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token if available
        const csrfToken = StorageService.getCsrfToken();
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }

        // Add request timestamp
        config.metadata = { startTime: Date.now() };

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Setup response interceptor
   */
  setupResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Calculate request duration
        const duration = Date.now() - response.config.metadata.startTime;
        response.duration = duration;

        // Emit success event
        EventBus.emit('api:success', {
          url: response.config.url,
          method: response.config.method,
          duration,
        });

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
          EventBus.emit('api:network-error', error);
          return Promise.reject({
            message: 'Network error. Please check your connection.',
            type: 'network',
          });
        }

        // Handle 401 Unauthorized
        if (error.response.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.requestQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.isRefreshing = false;
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.processQueue(refreshError, null);
            StorageService.clearAuth();
            EventBus.emit('auth:session-expired');
            return Promise.reject(refreshError);
          }
        }

        // Handle 403 Forbidden
        if (error.response.status === 403) {
          EventBus.emit('api:forbidden', error.response);
        }

        // Handle 404 Not Found
        if (error.response.status === 404) {
          EventBus.emit('api:not-found', error.response);
        }

        // Handle 500 Server Error
        if (error.response.status >= 500) {
          EventBus.emit('api:server-error', error.response);
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  processQueue(error, token = null) {
    this.requestQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.requestQueue = [];
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    const refreshToken = StorageService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const { token, refresh_token } = response.data;
    StorageService.setToken(token);
    StorageService.setRefreshToken(refresh_token);

    return token;
  }

  /**
   * Normalize error response
   */
  normalizeError(error) {
    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
        type: 'response',
      };
    }

    if (error.request) {
      return {
        message: 'No response received from server',
        type: 'request',
      };
    }

    return {
      message: error.message || 'Unknown error occurred',
      type: 'unknown',
    };
  }

  /**
   * GET request
   */
  async get(url, config = {}) {
    try {
      const response = await this.axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST request
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT request
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch(url, data = {}, config = {}) {
    try {
      const response = await this.axiosInstance.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    try {
      const response = await this.axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(url, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    };

    try {
      const response = await this.axiosInstance.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download file as Blob
   */
  async downloadFile(url, filename) {
    try {
      const response = await this.axiosInstance.get(url, {
        responseType: 'blob',
      });

      // Create blob link to download
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(link.href);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel pending requests
   */
  cancelPendingRequests() {
    // Implementation for canceling requests using AbortController
    EventBus.emit('api:requests-canceled');
  }

  /**
   * Get Axios instance
   */
  getInstance() {
    return this.axiosInstance;
  }
}

// Export singleton instance
export const apiService = new AxiosService();
export default apiService;
