/**
 * RedAdmin Pro - Main Application Entry Point
 * Version 2.0.0 - Enterprise Refactored
 */

import { AuthService } from './services/auth.service.js';
import { StorageService } from './services/storage.service.js';
import { apiService } from './services/api/axios.service.js';
import { router } from './modules/router.module.js';
import { state } from './modules/state.module.js';
import { EventBus } from './utils/event-bus.js';
import { DOMUtils } from './utils/dom-utils.js';
import { notification } from './components/notification.component.js';
import { lockScreen } from './components/lock-screen.component.js';
import { inboxModal } from './components/inbox-modal.component.js';
import { searchModal } from './components/search-modal.component.js';
import { enhancedSidebar } from './modules/sidebar-enhanced.module.js';
import { notificationModal } from './components/notification-modal.component.js';
import { confirmModal } from './components/confirm-modal.component.js';
import { loadingSpinner } from './components/loading-spinner.component.js';
import { emptyState } from './components/empty-state.component.js';

// Import global utilities
import './utils/password-toggle.util.js';
import './utils/page-initializer.util.js';
import './utils/breadcrumb.util.js';

class RedAdminApp {
  constructor() {
    this.isInitialized = false;
    this.version = '2.0.0';
  }

  /**
   * Initialize application
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Show loading screen
      this.showLoadingScreen();

      // Initialize core services
      await this.initializeServices();

      // Setup global event listeners
      this.setupGlobalEvents();

      // Load layouts
      await this.loadLayouts();

      // Initialize router
      router.init();

      // Initialize theme
      this.initializeTheme();

      // Setup global UI handlers
      this.setupUIHandlers();

      this.isInitialized = true;
      
      // Hide loading screen
      this.hideLoadingScreen();

      EventBus.emit('app:initialized');
      
    } catch (error) {
      console.error('App initialization error:', error);
      this.showError('Application failed to initialize');
    }
  }

  /**
   * Initialize services
   */
  async initializeServices() {
    // Initialize Auth Service
    AuthService.init();

    // Setup auth event listeners
    EventBus.on('auth:login-success', ({ user }) => {
      state.setUser(user);
      router.navigate('dashboard');
    });

    EventBus.on('auth:logout', () => {
      state.clear(true);
      router.navigate('login');
    });

    EventBus.on('auth:session-expired', () => {
      notification.warning('Your session has expired. Please login again.');
      router.navigate('login');
    });

    // Setup notification event listeners
    EventBus.on('notification:success', (message) => {
      notification.success(message);
    });

    EventBus.on('notification:error', (message) => {
      notification.error(message);
    });

    EventBus.on('notification:warning', (message) => {
      notification.warning(message);
    });

    EventBus.on('notification:info', (message) => {
      notification.info(message);
    });
  }

  /**
   * Load layouts (sidebar and topbar)
   */
  async loadLayouts() {
    try {
      // Load sidebar
      const sidebarResponse = await fetch('/layouts/sidebar.html');
      const sidebarHTML = await sidebarResponse.text();
      const sidebarContainer = document.getElementById('sidebar-container');
      if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHTML;
      }

      // Load topbar
      const topbarResponse = await fetch('/layouts/topbar.html');
      const topbarHTML = await topbarResponse.text();
      const topbarContainer = document.getElementById('topbar-container');
      if (topbarContainer) {
        topbarContainer.innerHTML = topbarHTML;
      }

    } catch (error) {
      console.error('Layout loading error:', error);
    }
  }

  /**
   * Setup global event listeners
   */
  setupGlobalEvents() {
    // Window resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        EventBus.emit('window:resized', {
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 250);
    });

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      EventBus.emit('page:visibility-changed', {
        hidden: document.hidden
      });
    });

    // Before unload
    window.addEventListener('beforeunload', (e) => {
      EventBus.emit('app:before-unload');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });

    // Loading state
    EventBus.on('app:loading', (isLoading) => {
      if (isLoading) {
        this.showLoading();
      } else {
        this.hideLoading();
      }
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    // Don't trigger in input fields
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
      return;
    }

    // Ctrl/Cmd + K: Quick search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.focusSearch();
    }

    // Ctrl/Cmd + B: Toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      this.toggleSidebar();
    }

    // Ctrl/Cmd + L: Lock screen
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      if (AuthService.checkAuth()) {
        AuthService.lockScreen();
      }
    }

    // Escape: Close modals/dropdowns
    if (e.key === 'Escape') {
      this.handleEscape();
    }
  }

  /**
   * Setup UI handlers
   */
  setupUIHandlers() {
    // Sidebar toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="toggle-sidebar"]')) {
        e.preventDefault();
        this.toggleSidebar();
      }
    });

    // Theme toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="toggle-theme"]')) {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    // Notifications
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="show-notifications"]')) {
        e.preventDefault();
        this.showNotifications();
      }
    });

    // Inbox
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="show-inbox"]')) {
        e.preventDefault();
        inboxModal.show();
      }
    });

    // Search modal
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="toggle-search"]')) {
        e.preventDefault();
        searchModal.show();
      }
    });

    // Fullscreen toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="toggle-fullscreen"]')) {
        e.preventDefault();
        this.toggleFullscreen();
      }
    });

    // Profile dropdown
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="lock-screen"]')) {
        e.preventDefault();
        lockScreen.lock();
      }

      if (e.target.closest('[data-action="logout"]')) {
        e.preventDefault();
        this.handleLogout();
      }
    });

    // Mobile sidebar overlay
    document.addEventListener('click', (e) => {
      if (e.target.matches('.sidebar-overlay')) {
        this.toggleSidebar();
      }
    });

    // Sidebar submenu toggle
    document.addEventListener('click', (e) => {
      const submenuToggle = e.target.closest('.submenu-toggle');
      if (submenuToggle) {
        e.preventDefault();
        const parentLi = submenuToggle.parentElement;
        const submenu = parentLi.querySelector('.submenu');
        const wasOpen = parentLi.classList.contains('open');
        
        // Close all other submenus
        document.querySelectorAll('.has-submenu.open').forEach(item => {
          item.classList.remove('open');
          const sub = item.querySelector('.submenu');
          if (sub) sub.classList.remove('show');
        });
        
        // Toggle current submenu
        if (!wasOpen) {
          parentLi.classList.add('open');
          if (submenu) submenu.classList.add('show');
        }
      }
    });
  }

  /**
   * Initialize theme
   */
  initializeTheme() {
    const savedTheme = state.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar-container');
    const overlay = document.querySelector('.sidebar-overlay');
    const body = document.body;

    if (window.innerWidth <= 1024) {
      // Mobile: toggle show/hide
      sidebar?.classList.toggle('show');
      overlay?.classList.toggle('show');
    } else {
      // Desktop: toggle collapse with fluid layout
      sidebar?.classList.toggle('collapsed');
      body.classList.toggle('sidebar-collapsed');
      state.toggleSidebar();
    }
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const currentTheme = state.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    state.setTheme(newTheme);
  }

  /**
   * Focus search
   */
  focusSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
      searchInput.focus();
    }
  }

  /**
   * Show notifications
   */
  showNotifications() {
    notificationModal.show();
  }

  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        notification.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * Handle escape key
   */
  handleEscape() {
    // Close any open Bootstrap modals
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    });

    // Close dropdowns
    const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
    openDropdowns.forEach(dropdown => {
      dropdown.classList.remove('show');
    });

    // Close mobile sidebar
    if (window.innerWidth <= 1024) {
      const sidebar = document.querySelector('.sidebar-container.show');
      if (sidebar) {
        this.toggleSidebar();
      }
    }
  }

  /**
   * Handle logout
   */
  async handleLogout() {
    try {
      await AuthService.logout();
      notification.success('Logged out successfully');
    } catch (error) {
      notification.error('Logout failed');
    }
  }

  /**
   * Show loading screen
   */
  showLoadingScreen() {
    const loadingHTML = `
      <div id="app-loading-screen" class="loading-screen">
        <div class="loading-content">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h4 class="mt-3">RedAdmin Pro</h4>
          <p class="text-muted">Loading application...</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }

  /**
   * Hide loading screen
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('app-loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => loadingScreen.remove(), 300);
    }
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    let loader = document.getElementById('page-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'page-loader';
      loader.className = 'page-loader';
      loader.innerHTML = '<div class="spinner-border text-primary" role="status"></div>';
      document.body.appendChild(loader);
    }
    loader.classList.add('show');
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.remove('show');
    }
  }

  /**
   * Show error
   */
  showError(message) {
    notification.error(message);
  }

  /**
   * Get app version
   */
  getVersion() {
    return this.version;
  }

  /**
   * Get app info
   */
  getInfo() {
    return {
      version: this.version,
      initialized: this.isInitialized,
      currentRoute: router.getCurrentRoute(),
      user: state.getUser(),
      theme: state.getTheme()
    };
  }
}

// Create and export app instance
const app = new RedAdminApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for external use
window.RedAdminApp = app;
export default app;
