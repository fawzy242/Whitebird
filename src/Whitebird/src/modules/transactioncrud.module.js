/**
 * Transaction CRUD Module - Handles add/edit transaction page
 * Matches transactioncrud.html structure
 */

import { whitebirdAPI } from '../services/api/whitebird-api.service.js';

export class TransactionCrudModule {
  constructor() {
    this.mode = 'create'; // 'create' or 'update'
    this.transactionId = null;
    this.transaction = null;
    this.assets = [];
    this.employees = [];
  }

  /**
   * Initialize CRUD page
   */
  async initialize() {
    console.log('📝 Transaction CRUD Page Initializing...');

    try {
      // Get mode from sessionStorage
      this.mode = sessionStorage.getItem('crudMode') || 'create';
      this.transactionId = sessionStorage.getItem('crudId');

      console.log(`Mode: ${this.mode}, ID: ${this.transactionId}`);

      // Load assets and employees for dropdowns
      await Promise.all([this.loadAssets(), this.loadEmployees()]);

      this.setupEventListeners();
      this.updatePageTitle();

      if (this.mode === 'update' && this.transactionId) {
        await this.loadTransaction(parseInt(this.transactionId));
      }

      console.log('✅ Transaction CRUD page initialized');
    } catch (error) {
      console.error('❌ Transaction CRUD initialization error:', error);
    }
  }

  /**
   * Load assets for dropdown
   */
  async loadAssets() {
    try {
      const response = await whitebirdAPI.getAssets();
      if (response && response.success && response.data) {
        this.assets = response.data;
        this.populateAssetDropdown();
      }
    } catch (error) {
      console.error('❌ Failed to load assets:', error);
    }
  }

  /**
   * Load employees for dropdown
   */
  async loadEmployees() {
    try {
      const response = await whitebirdAPI.getActiveEmployees();
      if (response && response.success && response.data) {
        this.employees = response.data;
        this.populateEmployeeDropdown();
      }
    } catch (error) {
      console.error('❌ Failed to load employees:', error);
    }
  }

  /**
   * Populate asset dropdown
   */
  populateAssetDropdown() {
    const select = document.getElementById('assetId');
    if (!select) return;

    // Clear existing options except first
    select.innerHTML = '<option value="">Select Asset</option>';

    this.assets.forEach((asset) => {
      const option = document.createElement('option');
      option.value = asset.assetId;
      option.textContent = asset.assetName;
      select.appendChild(option);
    });
  }

  /**
   * Populate employee dropdown
   */
  populateEmployeeDropdown() {
    const select = document.getElementById('employeeId');
    if (!select) return;

    // Clear existing options except first
    select.innerHTML = '<option value="">Select Employee</option>';

    this.employees.forEach((emp) => {
      const option = document.createElement('option');
      option.value = emp.employeeId;
      option.textContent = emp.fullName;
      select.appendChild(option);
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const form = document.getElementById('transactionForm');
    const btnSave = document.getElementById('btnSaveTransaction');
    const btnCancel = document.getElementById('btnCancelTransaction');
    const btnBack = document.getElementById('btnBackToTransactions');

    if (!form) {
      console.error('❌ Transaction form not found!');
      return;
    }

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Cancel button
    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        this.handleCancel();
      });
    }

    // Back button
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.handleCancel();
      });
    }

    console.log('✅ Event listeners attached');
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

      const response = await whitebirdAPI.getTransaction(id);

      if (response && response.success && response.data) {
        this.transaction = response.data;
        this.populateForm(this.transaction);
        console.log('✅ Transaction data loaded');
      } else {
        throw new Error('Failed to load transaction');
      }
    } catch (error) {
      console.error('❌ Failed to load transaction:', error);
      alert('Failed to load transaction data. Please try again.');
      this.handleCancel();
    }
  }

  /**
   * Populate form with transaction data
   */
  populateForm(transaction) {
    document.getElementById('assetId').value = transaction.assetId || '';
    document.getElementById('employeeId').value = transaction.employeeId || '';
    document.getElementById('transactionType').value = transaction.transactionType || '';
    document.getElementById('notes').value = transaction.notes || '';

    if (transaction.transactionDate) {
      const date = new Date(transaction.transactionDate);
      document.getElementById('transactionDate').value = date.toISOString().slice(0, 16);
    }

    if (transaction.returnDate) {
      const date = new Date(transaction.returnDate);
      document.getElementById('returnDate').value = date.toISOString().slice(0, 16);
    }
  }

  /**
   * Get form data
   */
  getFormData() {
    const data = {
      assetId: parseInt(document.getElementById('assetId').value),
      transactionDate: new Date(document.getElementById('transactionDate').value).toISOString(),
    };

    const employeeId = document.getElementById('employeeId').value;
    if (employeeId) {
      data.employeeId = parseInt(employeeId);
    }

    const transactionType = document.getElementById('transactionType').value;
    if (transactionType) {
      data.transactionType = transactionType;
    }

    const returnDate = document.getElementById('returnDate').value;
    if (returnDate) {
      data.returnDate = new Date(returnDate).toISOString();
    }

    const notes = document.getElementById('notes').value.trim();
    if (notes) {
      data.notes = notes;
    }

    return data;
  }

  /**
   * Validate form data
   */
  validateFormData(data) {
    if (!data.assetId) {
      alert('Asset is required');
      return false;
    }

    if (!data.transactionDate) {
      alert('Transaction Date is required');
      return false;
    }

    return true;
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    const btnSave = document.getElementById('btnSaveTransaction');

    try {
      // Get form data
      const formData = this.getFormData();

      // Validate
      if (!this.validateFormData(formData)) {
        return;
      }

      // Disable button
      const originalText = btnSave.innerHTML;
      btnSave.disabled = true;
      btnSave.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';

      let response;
      if (this.mode === 'update') {
        console.log(`📤 Updating transaction ${this.transactionId}...`);
        response = await whitebirdAPI.updateTransaction(this.transactionId, formData);
      } else {
        console.log('📤 Creating new transaction...');
        response = await whitebirdAPI.createTransaction(formData);
      }

      if (response && response.success) {
        console.log('✅ Transaction saved successfully');
        alert(
          this.mode === 'update'
            ? 'Transaction updated successfully!'
            : 'Transaction created successfully!'
        );

        // Navigate back to transactions list
        if (window.router) {
          window.router.navigate('transactions');
        } else {
          window.location.href = '/transactions';
        }
      } else {
        throw new Error(response.message || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('❌ Failed to save transaction:', error);
      alert('Failed to save transaction. Please try again.');

      // Re-enable button
      btnSave.disabled = false;
      btnSave.innerHTML = '<i class="fas fa-save me-2"></i>Save Transaction';
    }
  }

  /**
   * Handle cancel
   */
  handleCancel() {
    if (window.router) {
      window.router.navigate('transactions');
    } else {
      window.location.href = '/transactions';
    }
  }
}

// Export instance
export const transactionCrudModule = new TransactionCrudModule();
