/**
 * Transaction CRUD Module - Handles add/edit transaction page
 * Matches transactioncrud.html structure
 */

import WhitebirdAPI from '../services/api/index.js';

export class TransactionCrudModule {
  constructor() {
    this.mode = 'create'; // 'create' or 'update'
    this.transactionId = null;
    this.transaction = null;
    this.assets = [];
    this.employees = [];
    this.initialized = false;
  }

  /**
   * Initialize CRUD page
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('📝 Transaction CRUD Page Initializing...');

    try {
      // Get mode from sessionStorage
      this.mode = sessionStorage.getItem('crudMode') || 'create';
      this.transactionId = sessionStorage.getItem('crudId');

      console.log(`Mode: ${this.mode}, ID: ${this.transactionId}`);

      // Tunggu DOM siap sepenuhnya
      await this.waitForDOM();

      // Load assets and employees for dropdowns
      await Promise.all([this.loadAssets(), this.loadEmployees()]);

      this.setupEventListeners();
      this.updatePageTitle();

      if (this.mode === 'update' && this.transactionId) {
        await this.loadTransaction(parseInt(this.transactionId));
      }

      this.initialized = true;
      console.log('✅ Transaction CRUD page initialized');
    } catch (error) {
      console.error('❌ Transaction CRUD initialization error:', error);
      this.showError('Failed to initialize page');
    }
  }

  /**
   * Wait for DOM to be fully ready
   */
  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        setTimeout(resolve, 100);
      }
    });
  }

  /**
   * Load assets for dropdown
   */
  async loadAssets() {
    try {
      const response = await WhitebirdAPI.asset.getAssets();

      if (response.isSuccess && response.data) {
        this.assets = response.data;
        this.populateAssetDropdown();
        console.log(`✅ Loaded ${this.assets.length} assets`);
      } else {
        throw new Error(response.message || 'Failed to load assets');
      }
    } catch (error) {
      console.error('❌ Failed to load assets:', error);
      this.showError('Failed to load assets');
    }
  }

  /**
   * Load employees for dropdown
   */
  async loadEmployees() {
    try {
      const response = await WhitebirdAPI.employee.getActiveEmployees();

      if (response.isSuccess && response.data) {
        this.employees = response.data;
        this.populateEmployeeDropdown('fromEmployeeId');
        this.populateEmployeeDropdown('toEmployeeId');
        console.log(`✅ Loaded ${this.employees.length} employees`);
      } else {
        throw new Error(response.message || 'Failed to load employees');
      }
    } catch (error) {
      console.error('❌ Failed to load employees:', error);
      this.showError('Failed to load employees');
    }
  }

  /**
   * Populate asset dropdown
   */
  populateAssetDropdown() {
    const select = document.getElementById('assetId');
    if (!select) {
      console.warn('Asset select element not found');
      return;
    }

    // Clear existing options except first
    select.innerHTML = '<option value="">Select Asset</option>';

    this.assets.forEach((asset) => {
      const option = document.createElement('option');
      option.value = asset.assetId;
      const displayText = `${asset.assetCode || ''} - ${asset.assetName}`.trim();
      option.textContent = displayText || `Asset #${asset.assetId}`;
      select.appendChild(option);
    });
  }

  /**
   * Populate employee dropdown (for both from and to employees)
   */
  populateEmployeeDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) {
      console.warn(`Employee select element ${selectId} not found`);
      return;
    }

    // Clear existing options except first
    select.innerHTML = '<option value="">Select Employee</option>';

    this.employees.forEach((emp) => {
      const option = document.createElement('option');
      option.value = emp.employeeId;
      option.textContent = emp.fullName || `Employee #${emp.employeeId}`;
      select.appendChild(option);
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    console.log('🔗 Setting up event listeners...');

    let attempts = 0;
    const maxAttempts = 10;

    const trySetup = () => {
      attempts++;

      const form = document.getElementById('transactionForm');
      const btnSave = document.getElementById('btnSaveTransaction');
      const btnCancel = document.getElementById('btnCancelTransaction');
      const btnBack = document.getElementById('btnBackToTransactions');

      console.log('Looking for elements...', {
        form: form?.id,
        btnSave: btnSave?.id,
        btnCancel: btnCancel?.id,
        btnBack: btnBack?.id,
      });

      if (!form || !btnSave || !btnCancel) {
        if (attempts < maxAttempts) {
          console.log(`Elements not found, retrying... (${attempts}/${maxAttempts})`);
          setTimeout(trySetup, 100);
          return;
        } else {
          console.error('❌ Form elements not found after multiple attempts!');
          this.showError('Form elements not found. Please refresh the page.');
          return;
        }
      }

      // Form submit - HAPUS event listener lama dulu
      form.removeEventListener('submit', this.handleSubmitBound);
      this.handleSubmitBound = this.handleSubmit.bind(this);
      form.addEventListener('submit', this.handleSubmitBound);

      // Cancel button
      btnCancel.removeEventListener('click', this.handleCancelBound);
      this.handleCancelBound = this.handleCancel.bind(this);
      btnCancel.addEventListener('click', this.handleCancelBound);

      // Back button
      if (btnBack) {
        btnBack.removeEventListener('click', this.handleCancelBound);
        btnBack.addEventListener('click', this.handleCancelBound);
      }

      // Tambahkan click listener langsung ke save button sebagai fallback
      btnSave.removeEventListener('click', this.handleSubmitBound);
      btnSave.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Save button clicked directly');
        this.handleSubmit();
      });

      console.log('✅ Event listeners attached successfully');
    };

    trySetup();
  }

  /**
   * Update page title and breadcrumb
   */
  updatePageTitle() {
    const titleEl = document.getElementById('crudTitle');
    const breadcrumbEl = document.getElementById('breadcrumbAction');

    if (this.mode === 'update') {
      if (titleEl) {
        titleEl.innerHTML = '<i class="fas fa-exchange-alt me-2"></i>Edit Transaction';
      }
      if (breadcrumbEl) {
        breadcrumbEl.textContent = 'Edit';
      }
    } else {
      if (titleEl) {
        titleEl.innerHTML = '<i class="fas fa-exchange-alt me-2"></i>Add New Transaction';
      }
      if (breadcrumbEl) {
        breadcrumbEl.textContent = 'Add New';
      }
    }
  }

  /**
   * Load transaction data for edit mode
   */
  async loadTransaction(id) {
    try {
      console.log(`📡 Loading transaction ${id} from API...`);

      const response = await WhitebirdAPI.transactions.getTransaction(id);

      if (response.isSuccess && response.data) {
        this.transaction = response.data;
        this.populateForm(this.transaction);
        console.log('✅ Transaction data loaded');
      } else {
        throw new Error(response.message || 'Failed to load transaction');
      }
    } catch (error) {
      console.error('❌ Failed to load transaction:', error);
      this.showError('Failed to load transaction data');
    }
  }

  /**
   * Populate form with transaction data
   */
  populateForm(transaction) {
    console.log('Populating form with:', transaction);

    const formFields = {
      assetId: transaction.assetId || '',
      fromEmployeeId: transaction.fromEmployeeId || '',
      toEmployeeId: transaction.toEmployeeId || '',
      status: transaction.status || '',
      notes: transaction.notes || '',
    };

    // Set form values
    Object.entries(formFields).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
        console.log(`Set ${id} to:`, value);
      } else {
        console.warn(`Element #${id} not found`);
      }
    });

    // Handle dates separately
    if (transaction.transactionDate) {
      const dateElement = document.getElementById('transactionDate');
      if (dateElement) {
        const date = new Date(transaction.transactionDate);
        dateElement.value = date.toISOString().slice(0, 16);
        console.log('Set transactionDate to:', dateElement.value);
      }
    }
  }

  /**
   * Get form data
   */
  getFormData() {
    const getValue = (id, defaultValue = null) => {
      const element = document.getElementById(id);
      const value = element ? element.value.trim() : defaultValue;
      console.log(`Getting ${id}:`, value);
      return value;
    };

    const data = {
      assetId: parseInt(getValue('assetId', '0')),
      status: getValue('status', ''),
    };

    // Handle transaction date
    const transactionDate = getValue('transactionDate', '');
    if (transactionDate) {
      data.transactionDate = new Date(transactionDate).toISOString();
    } else {
      if (this.mode === 'update') {
        data.transactionDate = this.transaction
          ? this.transaction.transactionDate
          : new Date().toISOString();
      } else {
        data.transactionDate = new Date().toISOString();
      }
    }

    // Handle employee IDs
    const fromEmployeeId = getValue('fromEmployeeId', '');
    if (fromEmployeeId) {
      data.fromEmployeeId = parseInt(fromEmployeeId);
    } else {
      data.fromEmployeeId = null;
    }

    const toEmployeeId = getValue('toEmployeeId', '');
    if (toEmployeeId) {
      data.toEmployeeId = parseInt(toEmployeeId);
    } else {
      data.toEmployeeId = null;
    }

    // Handle notes
    const notes = getValue('notes', '');
    data.notes = notes || null;

    console.log('Form data collected:', data);
    return data;
  }

  /**
   * Validate form data
   */
  validateFormData(data) {
    console.log('Validating form data:', data);
    const errors = [];

    if (!data.assetId || data.assetId <= 0) {
      errors.push('Asset is required');
      this.highlightField('assetId', true);
    } else {
      this.highlightField('assetId', false);
    }

    if (!data.status || data.status.trim() === '') {
      errors.push('Status is required');
      this.highlightField('status', true);
    } else {
      this.highlightField('status', false);
    }

    // Validasi transactionDate
    if (!data.transactionDate) {
      errors.push('Transaction Date is required');
    }

    if (data.notes && data.notes.length > 500) {
      errors.push('Notes must be less than 500 characters');
      this.highlightField('notes', true);
    } else if (data.notes) {
      this.highlightField('notes', false);
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      this.showError(errors.join('<br>'));
      return false;
    }

    console.log('✅ Form validation passed');
    return true;
  }

  /**
   * Highlight form field
   */
  highlightField(fieldId, hasError) {
    const element = document.getElementById(fieldId);
    if (!element) {
      console.warn(`Cannot highlight field #${fieldId} - element not found`);
      return;
    }

    if (hasError) {
      element.classList.add('is-invalid');
      element.classList.remove('is-valid');
    } else {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error('Showing error:', message);

    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const toastEl = document.getElementById('errorToast');
      if (toastEl) {
        const toastBody = toastEl.querySelector('.toast-body');
        if (toastBody) {
          toastBody.innerHTML = message;
        }

        const toast = new bootstrap.Toast(toastEl);
        toast.show();
        return;
      }
    }

    // Fallback to alert
    alert(message);
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    console.log('Showing success:', message);

    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const toastEl = document.getElementById('successToast');
      if (toastEl) {
        const toastBody = toastEl.querySelector('.toast-body');
        if (toastBody) {
          toastBody.textContent = message;
        }

        const toast = new bootstrap.Toast(toastEl);
        toast.show();
        return;
      }
    }

    // Fallback to alert
    alert(message);
  }

  /**
   * Handle form submit
   */
  async handleSubmit(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('🔄 Submitting transaction form...');

    const btnSave = document.getElementById('btnSaveTransaction');
    if (!btnSave) {
      console.error('Save button not found!');
      this.showError('Save button not found. Please refresh the page.');
      return;
    }

    try {
      // Get form data
      const formData = this.getFormData();

      // Validate
      if (!this.validateFormData(formData)) {
        console.log('Form validation failed');
        return;
      }

      // Disable button and show loading
      const originalText = btnSave.innerHTML;
      btnSave.disabled = true;
      btnSave.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';

      let response;
      if (this.mode === 'update') {
        console.log(`📤 Updating transaction ${this.transactionId}...`, formData);
        response = await WhitebirdAPI.transactions.updateTransaction(this.transactionId, formData);
      } else {
        console.log('📤 Creating new transaction...', formData);
        response = await WhitebirdAPI.transactions.createTransaction(formData);
      }

      console.log('API Response:', response);

      if (response.isSuccess) {
        console.log('✅ Transaction saved successfully:', response);
        this.showSuccess(
          this.mode === 'update'
            ? 'Transaction updated successfully!'
            : 'Transaction created successfully!'
        );

        // Navigate back to transactions list
        setTimeout(() => {
          if (window.router) {
            window.router.navigate('transactions');
          } else {
            window.location.href = '/transactions';
          }
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('❌ Failed to save transaction:', error);
      this.showError(error.message || 'Failed to save transaction. Please try again.');
    } finally {
      // Re-enable button
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = '<i class="fas fa-save me-2"></i>Save Transaction';
      }
    }
  }

  /**
   * Handle cancel
   */
  handleCancel(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('🚫 Cancelling transaction form...');

    // Clear session storage
    sessionStorage.removeItem('crudMode');
    sessionStorage.removeItem('crudId');

    // Navigate back
    if (window.router) {
      window.router.navigate('transactions');
    } else {
      window.location.href = '/transactions';
    }
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    console.log('🧹 Cleaning up transaction event listeners...');

    const form = document.getElementById('transactionForm');
    const btnSave = document.getElementById('btnSaveTransaction');
    const btnCancel = document.getElementById('btnCancelTransaction');
    const btnBack = document.getElementById('btnBackToTransactions');

    if (this.handleSubmitBound && form) {
      form.removeEventListener('submit', this.handleSubmitBound);
    }

    if (this.handleCancelBound && btnCancel) {
      btnCancel.removeEventListener('click', this.handleCancelBound);
    }

    if (this.handleCancelBound && btnBack) {
      btnBack.removeEventListener('click', this.handleCancelBound);
    }

    if (btnSave) {
      const newBtnSave = btnSave.cloneNode(true);
      btnSave.parentNode.replaceChild(newBtnSave, btnSave);
    }

    this.initialized = false;
    console.log('✅ Transaction CRUD module cleaned up');
  }
}

// Export instance
export const transactionCrudModule = new TransactionCrudModule();
