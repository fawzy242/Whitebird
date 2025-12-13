/**
 * Auth API Service
 */

import { axiosInstance } from './axios.instance.js';
import { StorageService } from '../storage.service.js';

// Test account for development
const TEST_ACCOUNT = {
  email: 'test@example.com',
  password: 'Test@1234',
};

class AuthAPI {
  // Define endpoints
  endpoints = {
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    CHANGE_PASSWORD: '/api/auth/change-password',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    RESET_PASSWORD_WITH_TOKEN: '/api/auth/reset-password-with-token',
  };

  /**
   * Login user
   */
  async login(email, password) {
    // Test account (for development only)
    if (import.meta.env.DEV && email === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
      console.log('🔐 Using test account');

      const testUser = {
        userId: 1,
        email: TEST_ACCOUNT.email,
        fullName: 'Test User',
        roleId: 'admin',
        permissions: ['*'],
      };

      const testToken = 'test_token_' + Date.now();

      StorageService.setToken(testToken);
      StorageService.setUser(testUser);

      return {
        isSuccess: true,
        message: 'Test account login successful',
        data: {
          token: testToken,
          user: testUser,
        },
      };
    }

    // Real API login
    try {
      const response = await axiosInstance.post(this.endpoints.LOGIN, { email, password });

      if (response.data.isSuccess && response.data.data?.token) {
        StorageService.setToken(response.data.data.token);
        if (response.data.data.user) {
          StorageService.setUser(response.data.data.user);
        }
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getMe() {
    try {
      const response = await axiosInstance.get(this.endpoints.ME);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(data) {
    try {
      const response = await axiosInstance.post(this.endpoints.CHANGE_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      const response = await axiosInstance.post(this.endpoints.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data) {
    try {
      const response = await axiosInstance.post(this.endpoints.RESET_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(data) {
    try {
      const response = await axiosInstance.post(this.endpoints.RESET_PASSWORD_WITH_TOKEN, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    StorageService.clearAuth();
    return { success: true, message: 'Logged out successfully' };
  }

  /**
   * Check authentication
   */
  isAuthenticated() {
    return StorageService.isAuthenticated();
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return StorageService.getUser();
  }
}

// Export singleton
export const authAPI = new AuthAPI();
export default authAPI;
