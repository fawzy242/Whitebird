/**
 * State Management Module
 * Global state management
 */

import { StorageService } from '../services/storage.service.js';
import { EventBus } from '../utils/event-bus.js';

class StateModule {
  constructor() {
    this.state = {
      user: null,
      theme: 'light',
      sidebarCollapsed: false,
      notifications: [],
      settings: {},
      cache: {},
    };

    this.subscribers = new Map();
    this.init();
  }

  /**
   * Initialize state
   */
  init() {
    this.loadPersistedState();
  }

  /**
   * Load persisted state from storage
   */
  loadPersistedState() {
    const user = StorageService.getUser();
    const theme = StorageService.getItem('theme') || 'light';
    const sidebarCollapsed = StorageService.getItem('sidebar_collapsed') || false;
    const settings = StorageService.getItem('settings') || {};

    this.state = {
      ...this.state,
      user,
      theme,
      sidebarCollapsed,
      settings,
    };
  }

  /**
   * Get state value
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set state value
   */
  set(key, value, persist = false) {
    const oldValue = this.state[key];
    this.state[key] = value;

    // Persist to storage if requested
    if (persist) {
      StorageService.setItem(key, value);
    }

    // Notify subscribers
    this.notify(key, value, oldValue);

    // Emit event
    EventBus.emit('state:changed', { key, value, oldValue });
  }

  /**
   * Update state (shallow merge)
   */
  update(updates, persist = false) {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key, value, persist);
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }

    this.subscribers.get(key).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify subscribers
   */
  notify(key, newValue, oldValue) {
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error(`Error in state subscriber for "${key}":`, error);
        }
      });
    }
  }

  /**
   * Clear state
   */
  clear(persist = false) {
    this.state = {
      user: null,
      theme: 'light',
      sidebarCollapsed: false,
      notifications: [],
      settings: {},
      cache: {},
    };

    if (persist) {
      StorageService.clear();
    }

    EventBus.emit('state:cleared');
  }

  /**
   * Get all state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set user
   */
  setUser(user) {
    this.set('user', user, true);
  }

  /**
   * Get user
   */
  getUser() {
    return this.get('user');
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    this.set('theme', theme, true);
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Get theme
   */
  getTheme() {
    return this.get('theme');
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    const collapsed = !this.get('sidebarCollapsed');
    this.set('sidebarCollapsed', collapsed, true);
  }

  /**
   * Add notification
   */
  addNotification(notification) {
    const notifications = this.get('notifications');
    notifications.push(notification);
    this.set('notifications', notifications);
  }

  /**
   * Remove notification
   */
  removeNotification(id) {
    const notifications = this.get('notifications').filter((n) => n.id !== id);
    this.set('notifications', notifications);
  }

  /**
   * Cache data
   */
  cacheData(key, data, ttl = 3600000) {
    // Default 1 hour
    const cache = this.get('cache');
    cache[key] = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    this.set('cache', cache);
  }

  /**
   * Get cached data
   */
  getCachedData(key) {
    const cache = this.get('cache');
    const cached = cache[key];

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      // Expired
      delete cache[key];
      this.set('cache', cache);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.set('cache', {});
  }
}

// Export singleton instance
export const state = new StateModule();
export default state;
