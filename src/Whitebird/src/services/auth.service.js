/**
 * Authentication Service
 * Complete authentication management with test account support
 */

import { apiService } from './api/axios.service.js';
import { StorageService } from './storage.service.js';
import { EventBus } from '../utils/event-bus.js';

// Test credentials
const TEST_CREDENTIALS = {
  username: 'testuser@redadmin.local',
  password: 'Test@1234',
};

class AuthServiceClass {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.tokenExpiryTimer = null;
  }

  /**
   * Initialize auth service
   */
  init() {
    const token = StorageService.getToken();
    const user = StorageService.getUser();

    if (token && user) {
      this.currentUser = user;
      this.isAuthenticated = true;
      this.startTokenExpiryCheck();
      EventBus.emit('auth:initialized', { user });
    }
  }

  /**
   * Login with credentials
   */
  async login(username, password, rememberMe = false) {
    try {
      // Check for test account
      if (username === TEST_CREDENTIALS.username && password === TEST_CREDENTIALS.password) {
        return this.handleTestAccountLogin(rememberMe);
      }

      // Real API login
      const response = await apiService.post('/auth/login', {
        username,
        password,
        remember_me: rememberMe,
      });

      return this.handleLoginSuccess(response, rememberMe);
    } catch (error) {
      EventBus.emit('auth:login-failed', error);
      throw error;
    }
  }

  /**
   * Handle test account login
   */
  handleTestAccountLogin(rememberMe) {
    const testUser = {
      id: 1,
      username: TEST_CREDENTIALS.username,
      email: TEST_CREDENTIALS.username,
      firstName: 'Test',
      lastName: 'User',
      role: 'admin',
      avatar: null,
      permissions: ['*'],
    };

    const testToken = 'test_token_' + Date.now();
    const testRefreshToken = 'test_refresh_' + Date.now();

    StorageService.setToken(testToken);
    StorageService.setRefreshToken(testRefreshToken);
    StorageService.setUser(testUser);

    this.currentUser = testUser;
    this.isAuthenticated = true;
    this.startTokenExpiryCheck();

    EventBus.emit('auth:login-success', { user: testUser, isTestAccount: true });

    return {
      success: true,
      user: testUser,
      token: testToken,
      message: 'Test account login successful',
    };
  }

  /**
   * Handle successful login
   */
  handleLoginSuccess(response, rememberMe) {
    const { token, refresh_token, user } = response;

    StorageService.setToken(token);
    StorageService.setRefreshToken(refresh_token);
    StorageService.setUser(user);

    this.currentUser = user;
    this.isAuthenticated = true;
    this.startTokenExpiryCheck();

    EventBus.emit('auth:login-success', { user });

    return {
      success: true,
      user,
      token,
    };
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout API if not test account
      if (!this.isTestAccount()) {
        await apiService.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearAuthData();
      EventBus.emit('auth:logout');
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      EventBus.emit('auth:register-success', response);
      return response;
    } catch (error) {
      EventBus.emit('auth:register-failed', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      EventBus.emit('auth:forgot-password-sent', { email });
      return response;
    } catch (error) {
      EventBus.emit('auth:forgot-password-failed', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      EventBus.emit('auth:password-reset-success');
      return response;
    } catch (error) {
      EventBus.emit('auth:password-reset-failed', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiService.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      EventBus.emit('auth:password-changed');
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const refreshToken = StorageService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      StorageService.setToken(response.token);
      StorageService.setRefreshToken(response.refresh_token);

      return response.token;
    } catch (error) {
      this.clearAuthData();
      EventBus.emit('auth:session-expired');
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = StorageService.getUser();
    }
    return this.currentUser;
  }

  /**
   * Update current user
   */
  updateCurrentUser(userData) {
    this.currentUser = { ...this.currentUser, ...userData };
    StorageService.setUser(this.currentUser);
    EventBus.emit('auth:user-updated', this.currentUser);
  }

  /**
   * Check if user is authenticated
   */
  checkAuth() {
    const token = StorageService.getToken();
    const user = StorageService.getUser();
    this.isAuthenticated = !!(token && user);
    return this.isAuthenticated;
  }

  /**
   * Check if current account is test account
   */
  isTestAccount() {
    const user = this.getCurrentUser();
    return user?.username === TEST_CREDENTIALS.username;
  }

  /**
   * Check permission
   */
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;

    if (user.permissions?.includes('*')) return true;
    return user.permissions?.includes(permission) || false;
  }

  /**
   * Check role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    StorageService.clearAuth();
    this.currentUser = null;
    this.isAuthenticated = false;
    this.stopTokenExpiryCheck();
  }

  /**
   * Start token expiry check
   */
  startTokenExpiryCheck() {
    this.stopTokenExpiryCheck();

    // Check every 5 minutes
    this.tokenExpiryTimer = setInterval(
      () => {
        if (!this.checkAuth()) {
          this.clearAuthData();
          EventBus.emit('auth:session-expired');
        }
      },
      5 * 60 * 1000
    );
  }

  /**
   * Stop token expiry check
   */
  stopTokenExpiryCheck() {
    if (this.tokenExpiryTimer) {
      clearInterval(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
  }

  /**
   * Lock screen
   */
  lockScreen() {
    StorageService.setTempData('screen_locked', true);
    EventBus.emit('auth:screen-locked');
  }

  /**
   * Unlock screen
   */
  async unlockScreen(password) {
    try {
      const user = this.getCurrentUser();

      // For test account
      if (this.isTestAccount() && password === TEST_CREDENTIALS.password) {
        StorageService.removeTempData('screen_locked');
        EventBus.emit('auth:screen-unlocked');
        return { success: true };
      }

      // Real API unlock
      const response = await apiService.post('/auth/unlock', {
        user_id: user.id,
        password,
      });

      StorageService.removeTempData('screen_locked');
      EventBus.emit('auth:screen-unlocked');
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if screen is locked
   */
  isScreenLocked() {
    return StorageService.getTempData('screen_locked') === true;
  }
}

// Export singleton instance
export const AuthService = new AuthServiceClass();
export default AuthService;
