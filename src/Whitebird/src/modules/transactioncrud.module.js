/**
 * Transaction CRUD Module - Handles add/edit transaction page
 * Matches transactioncrud.html structure
 */

import WhitebirdAPI from '../services/api/index.js';

export class TransactionCrudModule {
  constructor() {
    this.mode = 'create'; // 'create' or 'update'
    this.assetTransactionsId = null;
    this.transaction = null;
    this.assets = [];
    this.employees = [];
    this.initialized = false;
    this.handleSubmitBound = null;
    this.handleCancelBound = null;
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
      this.assetTransactionsId = sessionStorage.getItem('crudId');

      console.log(`Mode: ${this.mode}, ID: ${this.assetTransactionsId}`);

      // Wait for DOM
      await this.waitForDOM();

      // Load assets and employees for dropdowns
      await Promise.all([this.loadAssets(), this.loadEmployees()]);

      this.setupEventListeners();
      this.updatePageTitle();

      if (this.mode === 'update' && this.assetTransactionsId) {
        await this.loadTransaction(parseInt(this.assetTransactionsId));
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
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(resolve, 100);
      } else {
        document.addEventListener('DOMContentLoaded', () => setTimeout(resolve, 100));
      }
    });
  }

  /**
   * Set default transaction date for create mode
   */
  setDefaultTransactionDate() {
    const dateElement = document.getElementById('transactionDate');
    if (dateElement) {
      const now = new Date();
      // Format to YYYY-MM-DDThh:mm
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      dateElement.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
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
        console.warn('No assets data returned');
        this.assets = [];
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
        this.populateEmployeeDropdowns();
        console.log(`✅ Loaded ${this.employees.length} employees`);
      } else {
        console.warn('No employees data returned');
        this.employees = [];
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
      const displayText = asset.assetCode 
        ? `${asset.assetCode} - ${asset.assetName}`
        : asset.assetName || `Asset #${asset.assetId}`;
      option.textContent = displayText;
      select.appendChild(option);
    });
  }

  /**
   * Populate employee dropdowns for both from and to
   */
  populateEmployeeDropdowns() {
    const fromSelect = document.getElementById('fromEmployeeId');
    const toSelect = document.getElementById('toEmployeeId');

    // Clear existing options
    if (fromSelect) {
      fromSelect.innerHTML = '<option value="">Select Employee</option>';
    }
    if (toSelect) {
      toSelect.innerHTML = '<option value="">Select Employee</option>';
    }

    this.employees.forEach((emp) => {
      const optionText = emp.fullName || `Employee #${emp.employeeId}`;
      
      if (fromSelect) {
        const fromOption = document.createElement('option');
        fromOption.value = emp.employeeId;
        fromOption.textContent = optionText;
        fromSelect.appendChild(fromOption);
      }
      
      if (toSelect) {
        const toOption = document.createElement('option');
        toOption.value = emp.employeeId;
        toOption.textContent = optionText;
        toSelect.appendChild(toOption);
      }
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    console.log('🔗 Setting up event listeners...');

    const form = document.getElementById('transactionForm');
    const btnSave = document.getElementById('btnSaveTransaction');
    const btnCancel = document.getElementById('btnCancelTransaction');
    const btnBack = document.getElementById('btnBackToTransactions');

    console.log('Elements found:', { 
      form: !!form, 
      btnSave: !!btnSave, 
      btnCancel: !!btnCancel, 
      btnBack: !!btnBack 
    });

    if (!form || !btnSave || !btnCancel) {
      console.error('❌ Required form elements not found');
      return;
    }

    // Remove existing listeners if any
    if (this.handleSubmitBound) {
      form.removeEventListener('submit', this.handleSubmitBound);
      btnSave.removeEventListener('click', this.handleSubmitBound);
    }

    if (this.handleCancelBound) {
      btnCancel.removeEventListener('click', this.handleCancelBound);
      if (btnBack) btnBack.removeEventListener('click', this.handleCancelBound);
    }

    // Create bound methods
    this.handleSubmitBound = this.handleSubmit.bind(this);
    this.handleCancelBound = this.handleCancel.bind(this);

    // Form submit
    form.addEventListener('submit', this.handleSubmitBound);
    
    // Direct save button click
    btnSave.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSubmitBound();
    });

    // Cancel button
    btnCancel.addEventListener('click', this.handleCancelBound);

    // Back button
    if (btnBack) {
      btnBack.addEventListener('click', this.handleCancelBound);
    }

    console.log('✅ Event listeners attached successfully');
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

    // Field mappings
    const fieldMappings = [
      { id: 'assetId', value: transaction.assetId || '' },
      { id: 'fromEmployeeId', value: transaction.fromEmployeeId || '' },
      { id: 'toEmployeeId', value: transaction.toEmployeeId || '' },
      { id: 'status', value: transaction.status || '' },
      { id: 'notes', value: transaction.notes || '' },
    ];

    // Set form values
    fieldMappings.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    });

    // Handle transaction date
    if (transaction.transactionDate) {
      const dateElement = document.getElementById('transactionDate');
      if (dateElement) {
        try {
          const date = new Date(transaction.transactionDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          
          dateElement.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
          console.warn('Invalid transaction date:', transaction.transactionDate);
        }
      }
    }

    console.log('✅ Form populated');
  }

  /**
   * Get form data
   */
  getFormData() {
    const data = {};

    // Helper function to get field value
    const getValue = (id, isNumber = false, allowNull = false) => {
      const element = document.getElementById(id);
      if (!element) return allowNull ? null : undefined;

      const value = element.value.trim();
      
      if (value === '' && allowNull) {
        return null;
      }

      if (value === '') {
        return undefined;
      }

      if (isNumber) {
        const num = parseInt(value, 10);
        return isNaN(num) ? undefined : num;
      }

      return value;
    };

    // Required fields
    data.assetId = getValue('assetId', true);
    data.status = getValue('status');

    // Transaction date
    const transactionDate = getValue('transactionDate');
    if (transactionDate) {
      data.transactionDate = new Date(transactionDate).toISOString();
    } else if (this.mode === 'update' && this.transaction) {
      data.transactionDate = this.transaction.transactionDate;
    } else {
      data.transactionDate = new Date().toISOString();
    }

    // Optional employee IDs
    const fromEmployeeId = getValue('fromEmployeeId', true, true);
    if (fromEmployeeId !== undefined) {
      data.fromEmployeeId = fromEmployeeId;
    }

    const toEmployeeId = getValue('toEmployeeId', true, true);
    if (toEmployeeId !== undefined) {
      data.toEmployeeId = toEmployeeId;
    }

    // Notes
    const notes = getValue('notes', false, true);
    if (notes !== undefined) {
      data.notes = notes;
    }

    console.log('Form data collected:', data);
    return data;
  }

  /**
   * Validate form data
   */
  validateFormData(data) {
    const errors = [];

    // Required field validation
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

    // Transaction date validation
    if (!data.transactionDate) {
      errors.push('Transaction date is required');
      const dateElement = document.getElementById('transactionDate');
      if (dateElement) {
        dateElement.classList.add('is-invalid');
      }
    }

    // Notes length validation
    if (data.notes && data.notes.length > 500) {
      errors.push('Notes must be less than 500 characters');
      this.highlightField('notes', true);
    } else if (data.notes !== undefined) {
      this.highlightField('notes', false);
    }

    if (errors.length > 0) {
      this.showError(errors.join('<br>'));
      return false;
    }

    return true;
  }

  /**
   * Highlight form field
   */
  highlightField(fieldId, hasError) {
    const element = document.getElementById(fieldId);
    if (!element) return;

    const formGroup = element.closest('.mb-3');
    if (formGroup) {
      const feedback = formGroup.querySelector('.invalid-feedback');
      if (feedback && hasError) {
        feedback.style.display = 'block';
      }
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
    console.error('Error:', message);

    const toastEl = document.getElementById('errorToast');
    if (toastEl && typeof bootstrap !== 'undefined') {
      const toastBody = toastEl.querySelector('.toast-body');
      if (toastBody) {
        toastBody.innerHTML = message;
      }
      
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    } else {
      alert(message);
    }
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    console.log('Success:', message);

    const toastEl = document.getElementById('successToast');
    if (toastEl && typeof bootstrap !== 'undefined') {
      const toastBody = toastEl.querySelector('.toast-body');
      if (toastBody) {
        toastBody.textContent = message;
      }
      
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    } else {
      alert(message);
    }
  }

  /**
   * Handle form submit
   */
  async handleSubmit(e) {
    if (e) {
      e.preventDefault();
    }

    console.log('🔄 Submitting transaction form...');

    const btnSave = document.getElementById('btnSaveTransaction');
    if (!btnSave) return;

    try {
      // Get form data
      const formData = this.getFormData();

      // Validate
      if (!this.validateFormData(formData)) {
        return;
      }

      // Disable button and show loading
      const originalText = btnSave.innerHTML;
      btnSave.disabled = true;
      btnSave.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';

      let response;
      if (this.mode === 'update') {
        console.log(`📤 Updating transaction ${this.assetTransactionsId}...`, formData);
        response = await WhitebirdAPI.transactions.updateTransaction(this.assetTransactionsId, formData);
      } else {
        console.log('📤 Creating new transaction...', formData);
        response = await WhitebirdAPI.transactions.createTransaction(formData);
      }

      console.log('API Response:', response);

      if (response.isSuccess) {
        const successMessage = this.mode === 'update' 
          ? 'Transaction updated successfully!' 
          : 'Transaction created successfully!';
        
        this.showSuccess(successMessage);

        // Navigate back to transactions list after delay
        setTimeout(() => {
          this.cleanupAndNavigate();
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
  handleCancel() {
    console.log('🚫 Cancelling transaction form...');
    this.cleanupAndNavigate();
  }

  /**
   * Cleanup and navigate back
   */
  cleanupAndNavigate() {
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
    console.log('🧹 Cleaning up transaction CRUD module...');

    if (this.handleSubmitBound) {
      const form = document.getElementById('transactionForm');
      const btnSave = document.getElementById('btnSaveTransaction');
      
      if (form) form.removeEventListener('submit', this.handleSubmitBound);
      if (btnSave) btnSave.removeEventListener('click', this.handleSubmitBound);
    }

    if (this.handleCancelBound) {
      const btnCancel = document.getElementById('btnCancelTransaction');
      const btnBack = document.getElementById('btnBackToTransactions');
      
      if (btnCancel) btnCancel.removeEventListener('click', this.handleCancelBound);
      if (btnBack) btnBack.removeEventListener('click', this.handleCancelBound);
    }

    this.handleSubmitBound = null;
    this.handleCancelBound = null;
    this.initialized = false;

    console.log('✅ Transaction CRUD module cleaned up');
  }
}

// Export instance
export const transactionCrudModule = new TransactionCrudModule();