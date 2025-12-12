/**
 * Confirmation Modal Component
 * For success, error, delete confirmations
 */

class ConfirmModalComponent {
  constructor() {
    this.modal = null;
    this.resolveCallback = null;
    this.init();
  }

  init() {
    this.createModal();
  }

  createModal() {
    const modalHTML = `
      <div class="modal fade" id="confirmModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content confirm-modal-content">
            <div class="modal-body text-center p-4">
              <div class="confirm-icon mb-3" id="confirmIcon">
                <i class="fas fa-question-circle fa-4x"></i>
              </div>
              <h4 class="confirm-title mb-2" id="confirmTitle">Confirm Action</h4>
              <p class="confirm-message text-muted" id="confirmMessage">
                Are you sure you want to proceed?
              </p>
            </div>
            <div class="modal-footer justify-content-center border-0 pt-0 pb-4">
              <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal" id="confirmCancel">
                Cancel
              </button>
              <button type="button" class="btn btn-primary px-4" id="confirmOk">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('confirmModal');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = document.getElementById('confirmModal');
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');

    okBtn.addEventListener('click', () => {
      if (this.resolveCallback) {
        this.resolveCallback(true);
      }
      bootstrap.Modal.getInstance(this.modal).hide();
    });

    cancelBtn.addEventListener('click', () => {
      if (this.resolveCallback) {
        this.resolveCallback(false);
      }
    });

    this.modal.addEventListener('hidden.bs.modal', () => {
      if (this.resolveCallback) {
        this.resolveCallback(false);
        this.resolveCallback = null;
      }
    });
  }

  show(options = {}) {
    const {
      type = 'confirm',
      title = 'Confirm Action',
      message = 'Are you sure?',
      okText = 'Confirm',
      cancelText = 'Cancel',
      okClass = 'btn-primary'
    } = options;

    return new Promise((resolve) => {
      this.resolveCallback = resolve;

      // Set icon based on type
      const iconEl = document.getElementById('confirmIcon');
      const okBtn = document.getElementById('confirmOk');
      const cancelBtn = document.getElementById('confirmCancel');

      let iconHTML = '';
      let iconColor = '';

      switch (type) {
        case 'success':
          iconHTML = '<i class="fas fa-check-circle fa-4x"></i>';
          iconColor = 'text-success';
          okBtn.className = 'btn btn-success px-4';
          cancelBtn.style.display = 'none';
          break;
        case 'error':
          iconHTML = '<i class="fas fa-times-circle fa-4x"></i>';
          iconColor = 'text-danger';
          okBtn.className = 'btn btn-danger px-4';
          okBtn.textContent = 'OK';
          cancelBtn.style.display = 'none';
          break;
        case 'warning':
          iconHTML = '<i class="fas fa-exclamation-triangle fa-4x"></i>';
          iconColor = 'text-warning';
          okBtn.className = 'btn btn-warning px-4';
          cancelBtn.style.display = 'inline-block';
          break;
        case 'delete':
          iconHTML = '<i class="fas fa-trash-alt fa-4x"></i>';
          iconColor = 'text-danger';
          okBtn.className = 'btn btn-danger px-4';
          okBtn.textContent = 'Delete';
          cancelBtn.style.display = 'inline-block';
          break;
        case 'info':
          iconHTML = '<i class="fas fa-info-circle fa-4x"></i>';
          iconColor = 'text-info';
          okBtn.className = 'btn btn-info px-4';
          cancelBtn.style.display = 'none';
          break;
        default:
          iconHTML = '<i class="fas fa-question-circle fa-4x"></i>';
          iconColor = 'text-primary';
          okBtn.className = `btn ${okClass} px-4`;
          cancelBtn.style.display = 'inline-block';
      }

      iconEl.innerHTML = iconHTML;
      iconEl.className = `confirm-icon mb-3 ${iconColor}`;
      
      document.getElementById('confirmTitle').textContent = title;
      document.getElementById('confirmMessage').textContent = message;
      okBtn.textContent = okText;
      cancelBtn.textContent = cancelText;

      const modalInstance = new bootstrap.Modal(this.modal);
      modalInstance.show();
    });
  }

  // Convenience methods
  async success(title, message = 'Operation completed successfully!') {
    return await this.show({
      type: 'success',
      title,
      message,
      okText: 'OK'
    });
  }

  async error(title, message = 'An error occurred.') {
    return await this.show({
      type: 'error',
      title,
      message,
      okText: 'OK'
    });
  }

  async warning(title, message = 'Please confirm this action.') {
    return await this.show({
      type: 'warning',
      title,
      message,
      okText: 'Proceed',
      cancelText: 'Cancel'
    });
  }

  async delete(title = 'Delete Confirmation', message = 'This action cannot be undone.') {
    return await this.show({
      type: 'delete',
      title,
      message,
      okText: 'Delete',
      cancelText: 'Cancel'
    });
  }

  async confirm(title, message) {
    return await this.show({
      type: 'confirm',
      title,
      message,
      okText: 'Confirm',
      cancelText: 'Cancel'
    });
  }

  async info(title, message) {
    return await this.show({
      type: 'info',
      title,
      message,
      okText: 'OK'
    });
  }
}

// Create singleton instance
export const confirmModal = new ConfirmModalComponent();
