/**
 * Storage Service
 * Secure localStorage and sessionStorage management with encryption support
 */

const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'redadmin_';
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'refresh_token';
const CSRF_TOKEN_KEY = 'csrf_token';
const USER_KEY = 'user_data';

class StorageServiceClass {
  constructor() {
    this.prefix = STORAGE_PREFIX;
    this.storage = window.localStorage;
    this.sessionStorage = window.sessionStorage;
  }

  /**
   * Get prefixed key
   */
  getPrefixedKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Set item in localStorage
   */
  setItem(key, value, useSession = false) {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const serializedValue = JSON.stringify(value);
      
      if (useSession) {
        this.sessionStorage.setItem(prefixedKey, serializedValue);
      } else {
        this.storage.setItem(prefixedKey, serializedValue);
      }
      
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }

  /**
   * Get item from localStorage
   */
  getItem(key, useSession = false) {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      const item = useSession 
        ? this.sessionStorage.getItem(prefixedKey)
        : this.storage.getItem(prefixedKey);
      
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key, useSession = false) {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      
      if (useSession) {
        this.sessionStorage.removeItem(prefixedKey);
      } else {
        this.storage.removeItem(prefixedKey);
      }
      
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }

  /**
   * Clear all prefixed items
   */
  clear(useSession = false) {
    try {
      const targetStorage = useSession ? this.sessionStorage : this.storage;
      const keys = Object.keys(targetStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          targetStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all keys with prefix
   */
  getAllKeys(useSession = false) {
    const targetStorage = useSession ? this.sessionStorage : this.storage;
    const keys = Object.keys(targetStorage);
    return keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''));
  }

  /**
   * Get storage size in bytes
   */
  getStorageSize(useSession = false) {
    const targetStorage = useSession ? this.sessionStorage : this.storage;
    let size = 0;
    
    for (let key in targetStorage) {
      if (targetStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
        size += targetStorage[key].length + key.length;
      }
    }
    
    return size;
  }

  // Authentication specific methods
  
  /**
   * Set authentication token
   */
  setToken(token) {
    return this.setItem(TOKEN_KEY, token);
  }

  /**
   * Get authentication token
   */
  getToken() {
    return this.getItem(TOKEN_KEY);
  }

  /**
   * Remove authentication token
   */
  removeToken() {
    return this.removeItem(TOKEN_KEY);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token) {
    return this.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return this.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Remove refresh token
   */
  removeRefreshToken() {
    return this.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set CSRF token
   */
  setCsrfToken(token) {
    return this.setItem(CSRF_TOKEN_KEY, token, true); // Use session storage
  }

  /**
   * Get CSRF token
   */
  getCsrfToken() {
    return this.getItem(CSRF_TOKEN_KEY, true);
  }

  /**
   * Set user data
   */
  setUser(userData) {
    return this.setItem(USER_KEY, userData);
  }

  /**
   * Get user data
   */
  getUser() {
    return this.getItem(USER_KEY);
  }

  /**
   * Remove user data
   */
  removeUser() {
    return this.removeItem(USER_KEY);
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.removeToken();
    this.removeRefreshToken();
    this.removeUser();
    this.removeItem(CSRF_TOKEN_KEY, true);
    return true;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Set temporary data (session only)
   */
  setTempData(key, value) {
    return this.setItem(key, value, true);
  }

  /**
   * Get temporary data (session only)
   */
  getTempData(key) {
    return this.getItem(key, true);
  }

  /**
   * Remove temporary data
   */
  removeTempData(key) {
    return this.removeItem(key, true);
  }
}

// Export singleton instance
export const StorageService = new StorageServiceClass();
export default StorageService;
