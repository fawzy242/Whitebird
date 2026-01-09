/**
 * Asset CRUD Module - Handles add/edit asset page
 * Matches assetcrud.html structure
 */

import WhitebirdAPI from '../services/api/index.js';

export class AssetCrudModule {
  constructor() {
    this.mode = 'create'; // 'create' or 'update'
    this.assetId = null;
    this.asset = null;
    this.categories = [];
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

    console.log('📝 Asset CRUD Page Initializing...');

    try {
      // Get mode from sessionStorage
      this.mode = sessionStorage.getItem('crudMode') || 'create';
      this.assetId = sessionStorage.getItem('crudId');

      console.log(`Mode: ${this.mode}, ID: ${this.assetId}`);

      // Wait for DOM
      await this.waitForDOM();

      // Load categories for dropdown
      await this.loadCategories();

      this.setupEventListeners();
      this.updatePageTitle();

      if (this.mode === 'update' && this.assetId) {
        await this.loadAsset(parseInt(this.assetId));
      }

      this.initialized = true;
      console.log('✅ Asset CRUD page initialized');
    } catch (error) {
      console.error('❌ Asset CRUD initialization error:', error);
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
   * Load categories for dropdown
   */
  async loadCategories() {
    try {
      const response = await WhitebirdAPI.category.getActiveCategories();

      if (response.isSuccess && response.data) {
        this.categories = response.data;
        this.populateCategoryDropdown();
      } else {
        throw new Error(response.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      this.showError('Failed to load categories');
    }
  }

  /**
   * Populate category dropdown
   */
  populateCategoryDropdown() {
    const select = document.getElementById('categoryId');
    if (!select) {
      console.warn('Category select element not found');
      return;
    }

    // Clear existing options except first
    select.innerHTML = '<option value="">Select Category</option>';

    this.categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.categoryId;
      option.textContent = cat.categoryName;
      select.appendChild(option);
    });

    console.log(`✅ Loaded ${this.categories.length} categories`);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    console.log('🔗 Setting up event listeners...');

    const form = document.getElementById('assetForm');
    const btnSave = document.getElementById('btnSaveAsset');
    const btnCancel = document.getElementById('btnCancelAsset');
    const btnBack = document.getElementById('btnBackToAssets');

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
    
    // Direct save button click (fallback)
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
        titleEl.innerHTML = '<i class="fas fa-box me-2"></i>Edit Asset';
      }
      if (breadcrumbEl) {
        breadcrumbEl.textContent = 'Edit';
      }
    } else {
      if (titleEl) {
        titleEl.innerHTML = '<i class="fas fa-box me-2"></i>Add New Asset';
      }
      if (breadcrumbEl) {
        breadcrumbEl.textContent = 'Add New';
      }
    }
  }

  /**
   * Load asset data for edit mode
   */
  async loadAsset(id) {
    try {
      console.log(`📡 Loading asset ${id} from API...`);

      const response = await WhitebirdAPI.asset.getAsset(id);

      if (response.isSuccess && response.data) {
        this.asset = response.data;
        this.populateForm(this.asset);
        this.showUpdateFields();
        console.log('✅ Asset data loaded');
      } else {
        throw new Error(response.message || 'Failed to load asset');
      }
    } catch (error) {
      console.error('❌ Failed to load asset:', error);
      this.showError('Failed to load asset data');
    }
  }

  /**
   * Show update-specific fields
   */
  showUpdateFields() {
    const statusField = document.getElementById('statusField');
    const isActiveField = document.getElementById('isActiveField');
    const statusSelect = document.getElementById('status');
    const isActiveCheckbox = document.getElementById('isActive');

    if (statusField && statusSelect) {
      statusField.classList.remove('d-none');
      // Set default status if not already set
      if (!statusSelect.value) {
        statusSelect.value = 'Available';
      }
    }
    
    if (isActiveField && isActiveCheckbox) {
      isActiveField.classList.remove('d-none');
    }
  }

  /**
   * Populate form with asset data
   */
  populateForm(asset) {
    console.log('Populating form with:', asset);

    // Field mappings
    const fieldMappings = [
      { id: 'assetName', value: asset.assetName || '' },
      { id: 'serialNumber', value: asset.serialNumber || '' },
      { id: 'categoryId', value: asset.categoryId || '' },
      { id: 'condition', value: asset.condition || '' },
      { id: 'purchasePrice', value: asset.purchasePrice || '' },
      { id: 'status', value: asset.status || 'Available' },
    ];

    // Set form values
    fieldMappings.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = Boolean(value);
        } else {
          element.value = value;
        }
      }
    });

    // Handle isActive checkbox
    const isActiveElement = document.getElementById('isActive');
    if (isActiveElement) {
      isActiveElement.checked = asset.isActive !== false; // Default to true
    }

    // Handle purchase date
    if (asset.purchaseDate) {
      const dateElement = document.getElementById('purchaseDate');
      if (dateElement) {
        try {
          const date = new Date(asset.purchaseDate);
          dateElement.value = date.toISOString().split('T')[0];
        } catch (e) {
          console.warn('Invalid purchase date:', asset.purchaseDate);
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
    const getValue = (id, isNumber = false, isFloat = false, allowNull = false) => {
      const element = document.getElementById(id);
      if (!element) return allowNull ? null : undefined;

      if (element.type === 'checkbox') {
        return element.checked;
      }

      const value = element.value.trim();
      
      if (value === '' && allowNull) {
        return null;
      }

      if (value === '') {
        return undefined;
      }

      if (isNumber || isFloat) {
        const num = isFloat ? parseFloat(value) : parseInt(value);
        return isNaN(num) ? undefined : num;
      }

      return value;
    };

    // Required fields for both create and update
    data.assetName = getValue('assetName');
    data.categoryId = getValue('categoryId', true);

    // Optional fields
    data.serialNumber = getValue('serialNumber', false, false, true);
    data.condition = getValue('condition', false, false, true);

    // Purchase date
    const purchaseDate = getValue('purchaseDate', false, false, true);
    if (purchaseDate !== undefined) {
      data.purchaseDate = purchaseDate ? new Date(purchaseDate).toISOString() : null;
    }

    // Purchase price
    const purchasePrice = getValue('purchasePrice', false, true, true);
    if (purchasePrice !== undefined) {
      data.purchasePrice = purchasePrice;
    }

    // Update mode specific fields
    if (this.mode === 'update') {
      data.status = getValue('status') || 'Available';
      data.isActive = getValue('isActive') !== false;
      
      // Get currentHolderId from loaded asset if exists
      if (this.asset?.currentHolderId) {
        data.currentHolderId = this.asset.currentHolderId;
      }
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
    if (!data.assetName || data.assetName.trim() === '') {
      errors.push('Asset Name is required');
      this.highlightField('assetName', true);
    } else {
      this.highlightField('assetName', false);
    }

    if (!data.categoryId || data.categoryId <= 0) {
      errors.push('Category is required');
      this.highlightField('categoryId', true);
    } else {
      this.highlightField('categoryId', false);
    }

    // Status validation for update mode
    if (this.mode === 'update') {
      if (!data.status || data.status.trim() === '') {
        errors.push('Status is required');
        this.highlightField('status', true);
      } else {
        this.highlightField('status', false);
      }
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

    console.log('🔄 Submitting asset form...');

    const btnSave = document.getElementById('btnSaveAsset');
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
        console.log(`📤 Updating asset ${this.assetId}...`, formData);
        response = await WhitebirdAPI.asset.updateAsset(this.assetId, formData);
      } else {
        console.log('📤 Creating new asset...', formData);
        response = await WhitebirdAPI.asset.createAsset(formData);
      }

      console.log('API Response:', response);

      if (response.isSuccess) {
        const successMessage = this.mode === 'update' 
          ? 'Asset updated successfully!' 
          : 'Asset created successfully!';
        
        this.showSuccess(successMessage);

        // Navigate back to assets list after delay
        setTimeout(() => {
          this.cleanupAndNavigate();
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to save asset');
      }
    } catch (error) {
      console.error('❌ Failed to save asset:', error);
      this.showError(error.message || 'Failed to save asset. Please try again.');
    } finally {
      // Re-enable button
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = '<i class="fas fa-save me-2"></i>Save Asset';
      }
    }
  }

  /**
   * Handle cancel
   */
  handleCancel() {
    console.log('🚫 Cancelling asset form...');
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
      window.router.navigate('assets');
    } else {
      window.location.href = '/assets';
    }
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    console.log('🧹 Cleaning up asset CRUD module...');

    if (this.handleSubmitBound) {
      const form = document.getElementById('assetForm');
      const btnSave = document.getElementById('btnSaveAsset');
      
      if (form) form.removeEventListener('submit', this.handleSubmitBound);
      if (btnSave) btnSave.removeEventListener('click', this.handleSubmitBound);
    }

    if (this.handleCancelBound) {
      const btnCancel = document.getElementById('btnCancelAsset');
      const btnBack = document.getElementById('btnBackToAssets');
      
      if (btnCancel) btnCancel.removeEventListener('click', this.handleCancelBound);
      if (btnBack) btnBack.removeEventListener('click', this.handleCancelBound);
    }

    this.handleSubmitBound = null;
    this.handleCancelBound = null;
    this.initialized = false;

    console.log('✅ Asset CRUD module cleaned up');
  }
}

// Export instance
export const assetCrudModule = new AssetCrudModule();