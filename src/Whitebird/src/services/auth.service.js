/**
 * Authentication Service
 * Complete authentication management with test account support
 */

// Import dari API service yang baru
import WhitebirdAPI from '../services/api/index.js';
import { StorageService } from './storage.service.js';

// Test credentials (sesuai dengan auth.api.js)
const TEST_CREDENTIALS = {
  email: 'test@example.com',
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

      // Emit event jika ada EventBus
      if (window.EventBus) {
        window.EventBus.emit('auth:initialized', { user });
      }

      console.log('🔐 Auth service initialized with existing session');
    }
  }

  /**
   * Login with credentials
   */
  async login(email, password, rememberMe = false) {
    try {
      console.log('🔐 Attempting login...');

      // Gunakan API service baru
      const response = await WhitebirdAPI.auth.login(email, password);

      if (response.isSuccess && response.data?.token) {
        return this.handleLoginSuccess(response.data);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);

      // Emit event jika ada EventBus
      if (window.EventBus) {
        window.EventBus.emit('auth:login-failed', error);
      }

      throw error;
    }
  }

  /**
   * Handle successful login
   */
  handleLoginSuccess(loginData) {
    const { token, user } = loginData;

    // Simpan data
    StorageService.setToken(token);
    StorageService.setUser(user);

    this.currentUser = user;
    this.isAuthenticated = true;
    this.startTokenExpiryCheck();

    console.log('✅ Login successful:', user?.email);

    // Emit event jika ada EventBus
    if (window.EventBus) {
      window.EventBus.emit('auth:login-success', { user });
    }

    return {
      isSuccess: true,
      user,
      token,
      message: 'Login successful',
    };
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Clear storage
      StorageService.clearAuth();

      this.currentUser = null;
      this.isAuthenticated = false;
      this.stopTokenExpiryCheck();

      console.log('👋 User logged out');

      // Emit event jika ada EventBus
      if (window.EventBus) {
        window.EventBus.emit('auth:logout');
      }

      return { isSuccess: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getMe() {
    try {
      const response = await WhitebirdAPI.auth.getMe();

      if (response.isSuccess && response.data) {
        // Update stored user data
        StorageService.setUser(response.data);
        this.currentUser = response.data;
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to get user data');
      }
    } catch (error) {
      console.error('❌ Failed to get user:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const response = await WhitebirdAPI.auth.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (response.isSuccess) {
        console.log('🔑 Password changed successfully');

        // Emit event jika ada EventBus
        if (window.EventBus) {
          window.EventBus.emit('auth:password-changed');
        }

        return response;
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      const response = await WhitebirdAPI.auth.forgotPassword(email);

      if (response.isSuccess) {
        console.log('📧 Forgot password request sent');

        // Emit event jika ada EventBus
        if (window.EventBus) {
          window.EventBus.emit('auth:forgot-password-sent', { email });
        }

        return response;
      } else {
        throw new Error(response.message || 'Failed to send forgot password request');
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await WhitebirdAPI.auth.resetPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.isSuccess) {
        console.log('🔑 Password reset successfully');

        // Emit event jika ada EventBus
        if (window.EventBus) {
          window.EventBus.emit('auth:password-reset-success');
        }

        return response;
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(email, resetToken, newPassword, confirmPassword) {
    try {
      const response = await WhitebirdAPI.auth.resetPasswordWithToken({
        email,
        resetToken,
        newPassword,
        confirmPassword,
      });

      if (response.isSuccess) {
        console.log('🔑 Password reset with token successfully');
        return response;
      } else {
        throw new Error(response.message || 'Failed to reset password with token');
      }
    } catch (error) {
      console.error('❌ Reset password with token error:', error);
      throw error;
    }
  }

  /**
   * Get current user from storage
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

    // Emit event jika ada EventBus
    if (window.EventBus) {
      window.EventBus.emit('auth:user-updated', this.currentUser);
    }

    console.log('👤 User data updated');
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
    return user?.email === TEST_CREDENTIALS.email;
  }

  /**
   * Check permission (role-based)
   */
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Check role-based permissions
    const userRole = user.roleId || user.role;

    // Simple role-based permission check
    const rolePermissions = {
      admin: ['*', 'create', 'read', 'update', 'delete', 'manage_users'],
      manager: ['create', 'read', 'update', 'manage_assets'],
      user: ['read'],
    };

    const permissions = rolePermissions[userRole] || ['read'];

    if (permissions.includes('*')) return true;
    return permissions.includes(permission) || false;
  }

  /**
   * Check role
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    const userRole = user?.roleId || user?.role;
    return userRole === role;
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    StorageService.clearAuth();
    this.currentUser = null;
    this.isAuthenticated = false;
    this.stopTokenExpiryCheck();

    console.log('🧹 Auth data cleared');
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
          console.log('⏰ Session expired');

          // Emit event jika ada EventBus
          if (window.EventBus) {
            window.EventBus.emit('auth:session-expired');
          }
        }
      },
      5 * 60 * 1000
    ); // 5 minutes
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
   * Validate token by checking with server
   */
  async validateToken() {
    try {
      await this.getMe();
      return true;
    } catch (error) {
      if (error.status === 401) {
        this.clearAuthData();
        return false;
      }
      throw error;
    }
  }

  /**
   * Lock screen (simulate)
   */
  lockScreen() {
    StorageService.setTempData('screen_locked', true);
    console.log('🔒 Screen locked');

    // Emit event jika ada EventBus
    if (window.EventBus) {
      window.EventBus.emit('auth:screen-locked');
    }
  }

  /**
   * Unlock screen (simulate)
   */
  async unlockScreen(password) {
    try {
      const user = this.getCurrentUser();

      // For test account
      if (this.isTestAccount() && password === TEST_CREDENTIALS.password) {
        StorageService.removeTempData('screen_locked');
        console.log('🔓 Screen unlocked (test account)');

        if (window.EventBus) {
          window.EventBus.emit('auth:screen-unlocked');
        }

        return { isSuccess: true };
      }

      // In real scenario, you might want to verify the password
      // For now, just unlock if there's a user
      if (user) {
        StorageService.removeTempData('screen_locked');
        console.log('🔓 Screen unlocked');

        if (window.EventBus) {
          window.EventBus.emit('auth:screen-unlocked');
        }

        return { isSuccess: true };
      }

      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('❌ Unlock screen error:', error);
      throw error;
    }
  }

  /**
   * Check if screen is locked
   */
  isScreenLocked() {
    return StorageService.getTempData('screen_locked') === true;
  }

  /**
   * Check if user can access route (role-based)
   */
  canAccessRoute(route) {
    const user = this.getCurrentUser();
    if (!user) return false;

    const userRole = user.roleId || user.role;

    // Route permissions mapping
    const routePermissions = {
      admin: ['*'], // Admin can access everything
      manager: ['dashboard', 'assets', 'employees', 'categories', 'transactions'],
      user: ['dashboard', 'assets'],
    };

    const allowedRoutes = routePermissions[userRole] || ['dashboard'];

    if (allowedRoutes.includes('*')) return true;
    return allowedRoutes.includes(route);
  }
}

// Export singleton instance
export const AuthService = new AuthServiceClass();

// Initialize on export
AuthService.init();

// Expose to window for debugging
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.AuthService = AuthService;
  console.log('🔧 AuthService exposed to window for debugging');
}

export default AuthService;
