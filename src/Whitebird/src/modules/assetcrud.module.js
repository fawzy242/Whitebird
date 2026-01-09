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

      // Tunggu DOM siap sepenuhnya
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
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        setTimeout(resolve, 100);
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

    let attempts = 0;
    const maxAttempts = 10;

    const trySetup = () => {
      attempts++;

      const form = document.getElementById('assetForm');
      const btnSave = document.getElementById('btnSaveAsset');
      const btnCancel = document.getElementById('btnCancelAsset');
      const btnBack = document.getElementById('btnBackToAssets');

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
        
        // Tampilkan field status dan isActive untuk edit mode
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
    
    if (statusField) statusField.classList.remove('d-none');
    if (isActiveField) isActiveField.classList.remove('d-none');
  }

  /**
   * Populate form with asset data
   */
  populateForm(asset) {
    console.log('Populating form with:', asset);

    // Basic fields
    const formFields = {
      assetName: asset.assetName || '',
      serialNumber: asset.serialNumber || '',
      categoryId: asset.categoryId || '',
      condition: asset.condition || '',
      purchasePrice: asset.purchasePrice || '',
    };

    // Untuk update mode
    if (this.mode === 'update') {
      formFields.status = asset.status || 'Available';
      formFields.isActive = asset.isActive || true;
    }

    // Set form values
    Object.entries(formFields).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = Boolean(value);
        } else {
          element.value = value;
        }
        console.log(`Set ${id} to:`, value);
      } else {
        console.warn(`Element #${id} not found`);
      }
    });

    // Handle date separately
    if (asset.purchaseDate) {
      const dateElement = document.getElementById('purchaseDate');
      if (dateElement) {
        try {
          const date = new Date(asset.purchaseDate);
          dateElement.value = date.toISOString().split('T')[0];
          console.log('Set purchaseDate to:', dateElement.value);
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
    const getValue = (id, defaultValue = null) => {
      const element = document.getElementById(id);
      if (!element) return defaultValue;
      
      if (element.type === 'checkbox') {
        return element.checked;
      }
      
      const value = element.value.trim();
      return value !== '' ? value : defaultValue;
    };

    const data = {
      assetName: getValue('assetName', ''),
      categoryId: parseInt(getValue('categoryId', '0')),
      serialNumber: getValue('serialNumber', null),
      condition: getValue('condition', null),
    };

    // Handle purchase date
    const purchaseDate = getValue('purchaseDate', '');
    if (purchaseDate) {
      try {
        const date = new Date(purchaseDate);
        if (!isNaN(date.getTime())) {
          data.purchaseDate = date.toISOString();
        } else {
          data.purchaseDate = null;
        }
      } catch (e) {
        data.purchaseDate = null;
      }
    } else {
      data.purchaseDate = null;
    }

    // Handle purchase price
    const purchasePrice = getValue('purchasePrice', '');
    if (purchasePrice) {
      const price = parseFloat(purchasePrice);
      if (!isNaN(price) && price >= 0) {
        data.purchasePrice = price;
      } else {
        data.purchasePrice = null;
      }
    } else {
      data.purchasePrice = null;
    }

    // Untuk update mode, tambahkan field yang diperlukan sesuai Swagger
    if (this.mode === 'update') {
      data.status = getValue('status', 'Available');
      data.isActive = getValue('isActive', true);
      
      // currentHolderId bisa diambil dari data aset jika ada
      if (this.asset && this.asset.currentHolderId) {
        data.currentHolderId = this.asset.currentHolderId;
      } else {
        data.currentHolderId = null;
      }
    }

    console.log('Form data collected:', data);
    return data;
  }

  /**
   * Validate form data
   */
  validateFormData(data) {
    console.log('Validating form data:', data);
    const errors = [];

    // Validation for both create and update
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

    // Additional validation for UPDATE mode
    if (this.mode === 'update') {
      if (!data.status || data.status.trim() === '') {
        errors.push('Status is required');
        this.highlightField('status', true);
      } else {
        this.highlightField('status', false);
      }
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

    console.log('🔄 Submitting asset form...');

    const btnSave = document.getElementById('btnSaveAsset');
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
        console.log(`📤 Updating asset ${this.assetId}...`, formData);
        response = await WhitebirdAPI.asset.updateAsset(this.assetId, formData);
      } else {
        console.log('📤 Creating new asset...', formData);
        response = await WhitebirdAPI.asset.createAsset(formData);
      }

      console.log('API Response:', response);

      if (response.isSuccess) {
        console.log('✅ Asset saved successfully:', response);
        this.showSuccess(
          this.mode === 'update' ? 'Asset updated successfully!' : 'Asset created successfully!'
        );

        // Navigate back to assets list
        setTimeout(() => {
          if (window.router) {
            window.router.navigate('assets');
          } else {
            window.location.href = '/assets';
          }
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
  handleCancel(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('🚫 Cancelling asset form...');

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
    console.log('🧹 Cleaning up asset event listeners...');

    const form = document.getElementById('assetForm');
    const btnSave = document.getElementById('btnSaveAsset');
    const btnCancel = document.getElementById('btnCancelAsset');
    const btnBack = document.getElementById('btnBackToAssets');

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
      // Remove the direct click listener (we need to track it separately)
      const newBtnSave = btnSave.cloneNode(true);
      btnSave.parentNode.replaceChild(newBtnSave, btnSave);
    }

    this.initialized = false;
    console.log('✅ Asset CRUD module cleaned up');
  }
}

// Export instance
export const assetCrudModule = new AssetCrudModule();