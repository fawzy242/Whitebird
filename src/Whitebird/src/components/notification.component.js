/**
 * Notification Component
 * Toast notification system
 */

import { DOMUtils } from '../utils/dom-utils.js';

export class NotificationComponent {
  constructor() {
    this.container = null;
    this.init();
  }

  /**
   * Initialize notification container
   */
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'position-fixed top-0 end-0 p-3';
      this.container.style.zIndex = '9999';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show notification
   */
  show(type, message, options = {}) {
    const defaultOptions = {
      duration: 5000,
      dismissible: true,
      icon: true,
      position: 'top-right',
      ...options
    };

    const id = 'toast-' + Date.now();
    const iconClass = this.getIconClass(type);
    
    const toastHTML = `
      <div class="toast align-items-center text-bg-${type} border-0" 
           id="${id}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            ${defaultOptions.icon ? `<i class="${iconClass} me-2"></i>` : ''}
            ${message}
          </div>
          ${defaultOptions.dismissible ? `
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    data-bs-dismiss="toast" aria-label="Close"></button>
          ` : ''}
        </div>
      </div>
    `;

    DOMUtils.insertHTML(this.container, toastHTML);
    
    const toastElement = document.getElementById(id);
    const toast = new bootstrap.Toast(toastElement, {
      delay: defaultOptions.duration
    });

    toast.show();

    // Remove after hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });

    return toast;
  }

  /**
   * Get icon class for type
   */
  getIconClass(type) {
    const iconMap = {
      success: 'fas fa-check-circle',
      danger: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
      primary: 'fas fa-bell'
    };
    return iconMap[type] || iconMap.info;
  }

  /**
   * Show success notification
   */
  success(message, options = {}) {
    return this.show('success', message, options);
  }

  /**
   * Show error notification
   */
  error(message, options = {}) {
    return this.show('danger', message, options);
  }

  /**
   * Show warning notification
   */
  warning(message, options = {}) {
    return this.show('warning', message, options);
  }

  /**
   * Show info notification
   */
  info(message, options = {}) {
    return this.show('info', message, options);
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Export singleton instance
export const notification = new NotificationComponent();
export default notification;
