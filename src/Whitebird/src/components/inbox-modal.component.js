/**
 * Inbox Modal Component
 * Email/message inbox with pagination
 */

import { modalManager } from './modal.component.js';
import { DOMUtils } from '../utils/dom-utils.js';
import { EventBus } from '../utils/event-bus.js';

export class InboxModalComponent {
  constructor() {
    this.messages = [];
    this.currentPage = 1;
    this.perPage = 10;
    this.totalPages = 0;
    this.modal = null;
  }

  /**
   * Show inbox modal (optimized with caching)
   */
  show(messages = []) {
    // Only regenerate messages if not provided and not cached
    if (messages.length > 0) {
      this.messages = messages;
    } else if (this.messages.length === 0) {
      this.messages = this.generateSampleMessages();
    }
    // else: reuse existing cached messages

    this.totalPages = Math.ceil(this.messages.length / this.perPage);

    // Cache modal instance for performance
    if (!this.modal || !document.getElementById('inboxModal')) {
      this.modal = modalManager.create({
        id: 'inboxModal',
        title: 'Inbox',
        size: 'lg',
        content: this.renderInbox(),
        footer: false,
        onShow: () => {
          this.setupInboxHandlers();
        },
      });
    } else {
      // Just refresh content if modal exists
      const modalBody = document.querySelector('#inboxModal .modal-body');
      if (modalBody) {
        modalBody.innerHTML = this.renderInbox();
        this.setupInboxHandlers();
      }
    }

    this.modal.show();
  }

  /**
   * Render inbox HTML
   */
  renderInbox() {
    const start = (this.currentPage - 1) * this.perPage;
    const end = start + this.perPage;
    const pageMessages = this.messages.slice(start, end);

    return `
      <div class="inbox-container">
        <div class="inbox-header mb-3">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control" 
                   id="inboxSearch" 
                   placeholder="Search messages...">
          </div>
        </div>
        
        <div class="inbox-list">
          ${pageMessages.map((msg) => this.renderMessage(msg)).join('')}
        </div>
        
        ${this.renderPagination()}
      </div>
    `;
  }

  /**
   * Render single message
   */
  renderMessage(message) {
    const unreadClass = message.unread ? 'unread' : '';
    const avatarUrl = message.avatar || 'https://via.placeholder.com/40';

    return `
      <div class="inbox-message ${unreadClass}" data-message-id="${message.id}">
        <div class="message-avatar">
          <img src="${avatarUrl}" alt="${message.from}">
        </div>
        <div class="message-content">
          <div class="message-header">
            <strong>${message.from}</strong>
            <small class="text-muted">${message.time}</small>
          </div>
          <div class="message-subject">${message.subject}</div>
          <div class="message-preview">${message.preview}</div>
        </div>
        <div class="message-actions">
          ${message.unread ? '<span class="badge bg-primary">New</span>' : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render pagination
   */
  renderPagination() {
    if (this.totalPages <= 1) {
      return '';
    }

    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(`
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <button class="page-link" data-page="${i}">${i}</button>
        </li>
      `);
    }

    return `
      <nav class="mt-3">
        <ul class="pagination justify-content-center">
          <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" data-page="prev">Previous</button>
          </li>
          ${pages.join('')}
          <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
            <button class="page-link" data-page="next">Next</button>
          </li>
        </ul>
      </nav>
    `;
  }

  /**
   * Setup inbox handlers
   */
  setupInboxHandlers() {
    const modalElement = this.modal.getElement();

    // Search functionality
    const searchInput = modalElement.querySelector('#inboxSearch');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        DOMUtils.debounce((e) => {
          this.handleSearch(e.target.value);
        }, 300)
      );
    }

    // Message click
    DOMUtils.on(modalElement, 'click', '.inbox-message', (e) => {
      const messageId = e.currentTarget.dataset.messageId;
      this.openMessage(messageId);
    });

    // Pagination
    DOMUtils.on(modalElement, 'click', '.page-link', (e) => {
      const page = e.currentTarget.dataset.page;

      if (page === 'prev') {
        this.currentPage = Math.max(1, this.currentPage - 1);
      } else if (page === 'next') {
        this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
      } else {
        this.currentPage = parseInt(page);
      }

      this.updateInbox();
    });
  }

  /**
   * Handle search
   */
  handleSearch(query) {
    // Implement search logic
    EventBus.emit('inbox:search', { query });
  }

  /**
   * Open message
   */
  openMessage(messageId) {
    const message = this.messages.find((m) => m.id == messageId);
    if (message) {
      message.unread = false;
      EventBus.emit('inbox:message-opened', { message });
      EventBus.emit('notification:info', `Opening message from ${message.from}`);
    }
  }

  /**
   * Update inbox display
   */
  updateInbox() {
    const content = this.renderInbox();
    this.modal.updateContent(content);
    this.setupInboxHandlers();
  }

  /**
   * Generate sample messages
   */
  generateSampleMessages() {
    const sampleMessages = [];
    for (let i = 1; i <= 25; i++) {
      sampleMessages.push({
        id: i,
        from: `User ${i}`,
        subject: `Message Subject ${i}`,
        preview: `This is a preview of message ${i}...`,
        time: `${i} hours ago`,
        unread: i <= 5,
        avatar: null,
      });
    }
    return sampleMessages;
  }

  /**
   * Hide modal
   */
  hide() {
    if (this.modal) {
      this.modal.hide();
    }
  }
}

// Export singleton instance
export const inboxModal = new InboxModalComponent();
export default inboxModal;
