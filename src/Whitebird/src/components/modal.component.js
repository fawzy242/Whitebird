/**
 * Modal Component
 * Enterprise-grade modal system with optimization
 */

import { DOMUtils } from '../utils/dom-utils.js';
import { EventBus } from '../utils/event-bus.js';

export class ModalComponent {
  constructor(options = {}) {
    this.options = {
      id: 'modal-' + Date.now(),
      title: '',
      content: '',
      size: 'md', // sm, md, lg, xl
      centered: true,
      backdrop: true,
      keyboard: true,
      footer: true,
      closeButton: true,
      buttons: [],
      onShow: null,
      onHide: null,
      onSubmit: null,
      ...options,
    };

    this.modal = null;
    this.bsModal = null;
    this.isVisible = false;
  }

  /**
   * Create modal element
   */
  create() {
    const modalHTML = `
      <div class="modal fade" id="${this.options.id}" tabindex="-1" 
           aria-labelledby="${this.options.id}Label" aria-hidden="true"
           data-bs-backdrop="${this.options.backdrop ? 'true' : 'static'}"
           data-bs-keyboard="${this.options.keyboard}">
        <div class="modal-dialog ${this.getSizeClass()} ${this.options.centered ? 'modal-dialog-centered' : ''} modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${this.options.id}Label">${this.options.title}</h5>
              ${
                this.options.closeButton
                  ? `
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              `
                  : ''
              }
            </div>
            <div class="modal-body">
              ${this.options.content}
            </div>
            ${this.options.footer ? this.createFooter() : ''}
          </div>
        </div>
      </div>
    `;

    const container = document.getElementById('modals-container') || document.body;
    DOMUtils.insertHTML(container, modalHTML);

    this.modal = document.getElementById(this.options.id);
    this.setupEventListeners();

    return this;
  }

  /**
   * Get size class
   */
  getSizeClass() {
    const sizeMap = {
      sm: 'modal-sm',
      md: '',
      lg: 'modal-lg',
      xl: 'modal-xl',
      fullscreen: 'modal-fullscreen',
    };
    return sizeMap[this.options.size] || '';
  }

  /**
   * Create footer
   */
  createFooter() {
    if (this.options.buttons.length === 0) {
      return `
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      `;
    }

    const buttonsHTML = this.options.buttons
      .map((btn) => {
        const classes = btn.className || 'btn-primary';
        const dismiss = btn.dismiss ? 'data-bs-dismiss="modal"' : '';
        return `
        <button type="button" class="btn ${classes}" data-action="${btn.action || ''}" ${dismiss}>
          ${btn.text}
        </button>
      `;
      })
      .join('');

    return `<div class="modal-footer">${buttonsHTML}</div>`;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Bootstrap modal events
    this.modal.addEventListener('show.bs.modal', () => {
      this.isVisible = true;
      if (this.options.onShow) {
        this.options.onShow(this);
      }
      EventBus.emit('modal:show', { id: this.options.id });
    });

    this.modal.addEventListener('hide.bs.modal', () => {
      this.isVisible = false;
      if (this.options.onHide) {
        this.options.onHide(this);
      }
      EventBus.emit('modal:hide', { id: this.options.id });
    });

    this.modal.addEventListener('hidden.bs.modal', () => {
      EventBus.emit('modal:hidden', { id: this.options.id });
    });

    // Button actions
    this.options.buttons.forEach((btn) => {
      if (btn.action && btn.onClick) {
        const button = this.modal.querySelector(`[data-action="${btn.action}"]`);
        if (button) {
          button.addEventListener('click', (e) => btn.onClick(e, this));
        }
      }
    });
  }

  /**
   * Show modal
   */
  show() {
    if (!this.modal) {
      this.create();
    }

    if (!this.bsModal) {
      this.bsModal = new bootstrap.Modal(this.modal, {
        backdrop: this.options.backdrop,
        keyboard: this.options.keyboard,
      });
    }

    this.bsModal.show();
    return this;
  }

  /**
   * Hide modal
   */
  hide() {
    if (this.bsModal) {
      this.bsModal.hide();
    }
    return this;
  }

  /**
   * Destroy modal
   */
  destroy() {
    if (this.bsModal) {
      this.bsModal.dispose();
    }
    if (this.modal) {
      this.modal.remove();
    }
    this.modal = null;
    this.bsModal = null;
    return this;
  }

  /**
   * Update modal content
   */
  updateContent(content) {
    const bodyElement = this.modal.querySelector('.modal-body');
    if (bodyElement) {
      bodyElement.innerHTML = content;
    }
    return this;
  }

  /**
   * Update modal title
   */
  updateTitle(title) {
    const titleElement = this.modal.querySelector('.modal-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
    return this;
  }

  /**
   * Toggle modal
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
    return this;
  }

  /**
   * Get modal element
   */
  getElement() {
    return this.modal;
  }

  /**
   * Get Bootstrap modal instance
   */
  getInstance() {
    return this.bsModal;
  }
}

/**
 * Modal Manager
 * Manages multiple modals
 */
export class ModalManager {
  constructor() {
    this.modals = new Map();
  }

  /**
   * Create and register modal
   */
  create(options) {
    const modal = new ModalComponent(options);
    this.modals.set(options.id || modal.options.id, modal);
    return modal;
  }

  /**
   * Get modal by ID
   */
  get(id) {
    return this.modals.get(id);
  }

  /**
   * Show modal by ID
   */
  show(id) {
    const modal = this.modals.get(id);
    if (modal) {
      modal.show();
    }
  }

  /**
   * Hide modal by ID
   */
  hide(id) {
    const modal = this.modals.get(id);
    if (modal) {
      modal.hide();
    }
  }

  /**
   * Destroy modal by ID
   */
  destroy(id) {
    const modal = this.modals.get(id);
    if (modal) {
      modal.destroy();
      this.modals.delete(id);
    }
  }

  /**
   * Destroy all modals
   */
  destroyAll() {
    this.modals.forEach((modal) => modal.destroy());
    this.modals.clear();
  }

  /**
   * Hide all modals
   */
  hideAll() {
    this.modals.forEach((modal) => modal.hide());
  }

  /**
   * Get active modal
   */
  getActive() {
    for (const [id, modal] of this.modals) {
      if (modal.isVisible) {
        return modal;
      }
    }
    return null;
  }
}

// Export singleton manager
export const modalManager = new ModalManager();
export default modalManager;
