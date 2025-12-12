/**
 * Notification Modal Component
 * Shows detailed notifications in a modal
 */

class NotificationModalComponent {
  constructor() {
    this.notifications = this.loadNotifications();
    this.init();
  }

  init() {
    this.createModal();
  }

  loadNotifications() {
    // Sample notifications data
    return [
      {
        id: 1,
        type: 'success',
        icon: 'check-circle',
        title: 'Task Completed',
        message: 'Your report has been successfully generated and is ready for download.',
        time: '5 minutes ago',
        read: false,
      },
      {
        id: 2,
        type: 'info',
        icon: 'info-circle',
        title: 'System Update',
        message: 'A new system update is available. Please update to get the latest features.',
        time: '1 hour ago',
        read: false,
      },
      {
        id: 3,
        type: 'warning',
        icon: 'exclamation-triangle',
        title: 'Storage Warning',
        message: 'Your storage is almost full. Consider upgrading your plan or removing old files.',
        time: '2 hours ago',
        read: true,
      },
      {
        id: 4,
        type: 'primary',
        icon: 'user-plus',
        title: 'New Team Member',
        message: 'John Doe has joined your team. Welcome them aboard!',
        time: '3 hours ago',
        read: true,
      },
      {
        id: 5,
        type: 'danger',
        icon: 'exclamation-circle',
        title: 'Security Alert',
        message:
          'Unusual login activity detected from a new device. Please verify if this was you.',
        time: '1 day ago',
        read: true,
      },
    ];
  }

  createModal() {
    const modalHTML = `
      <div class="modal fade" id="notificationModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-bell me-2"></i>Notifications
                <span class="badge bg-danger ms-2" id="notifCount">${this.getUnreadCount()}</span>
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-0">
              <div class="notification-list" id="notificationList">
                ${this.renderNotifications()}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-sm btn-outline-secondary" onclick="notificationModal.markAllRead()">
                <i class="fas fa-check-double me-1"></i>Mark All Read
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger" onclick="notificationModal.clearAll()">
                <i class="fas fa-trash me-1"></i>Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Only append if doesn't exist
    if (!document.getElementById('notificationModal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  renderNotifications() {
    if (this.notifications.length === 0) {
      return `
        <div class="text-center py-5">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">No notifications</p>
        </div>
      `;
    }

    return this.notifications
      .map(
        (notif) => `
      <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
        <div class="notif-icon bg-${notif.type}">
          <i class="fas fa-${notif.icon}"></i>
        </div>
        <div class="notif-content">
          <h6 class="notif-title">${notif.title}</h6>
          <p class="notif-message">${notif.message}</p>
          <small class="notif-time">
            <i class="fas fa-clock me-1"></i>${notif.time}
          </small>
        </div>
        <div class="notif-actions">
          <button class="btn btn-sm btn-link" onclick="notificationModal.markRead(${notif.id})" title="Mark as read">
            <i class="fas fa-check"></i>
          </button>
          <button class="btn btn-sm btn-link text-danger" onclick="notificationModal.remove(${notif.id})" title="Delete">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `
      )
      .join('');
  }

  show() {
    // Create modal only once (cached for performance)
    if (!document.getElementById('notificationModal')) {
      this.createModal();
    } else {
      // Just refresh content if modal already exists
      this.refresh();
    }

    // Cache modal instance
    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(document.getElementById('notificationModal'), {
        backdrop: true,
        keyboard: true,
      });
    }

    this.modalInstance.show();
  }

  /**
   * Refresh notification list (not recreate modal)
   */
  refresh() {
    const notifList = document.getElementById('notificationList');
    const notifCount = document.getElementById('notifCount');

    if (notifList) {
      notifList.innerHTML = this.renderNotifications();
    }

    if (notifCount) {
      notifCount.textContent = this.getUnreadCount();
    }
  }

  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  markRead(id) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.refresh();
    }
  }

  markAllRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.refresh();
  }

  remove(id) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.refresh();
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notifications = [];
      this.refresh();
    }
  }

  refresh() {
    const list = document.getElementById('notificationList');
    const count = document.getElementById('notifCount');
    if (list) {
      list.innerHTML = this.renderNotifications();
    }
    if (count) {
      const unread = this.getUnreadCount();
      count.textContent = unread;
      count.style.display = unread > 0 ? 'inline-block' : 'none';
    }

    // Update topbar badge
    const topbarBadge = document.querySelector('.topbar-icon .notification-badge');
    if (topbarBadge) {
      const unread = this.getUnreadCount();
      topbarBadge.textContent = unread;
      topbarBadge.style.display = unread > 0 ? 'flex' : 'none';
    }
  }
}

// Create singleton instance
export const notificationModal = new NotificationModalComponent();

// Expose to window for onclick handlers
if (typeof window !== 'undefined') {
  window.notificationModal = notificationModal;
}
