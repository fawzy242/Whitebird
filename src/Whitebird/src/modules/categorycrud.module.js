/**
 * Category CRUD Module - Handles add/edit category page
 * Matches categorycrud.html structure
 */

import WhitebirdAPI from '../services/api/index.js';

export class CategoryCrudModule {
  constructor() {
    this.mode = 'create'; // 'create' or 'update'
    this.categoryId = null;
    this.category = null;
    this.initialized = false;
  }

  /**
   * Initialize CRUD page
   */
  async initialize() {
    if (this.initialized) return;

    console.log('📝 Category CRUD Page Initializing...');

    try {
      // Get mode from sessionStorage
      this.mode = sessionStorage.getItem('crudMode') || 'create';
      this.categoryId = sessionStorage.getItem('crudId');

      console.log(`Mode: ${this.mode}, ID: ${this.categoryId}`);

      // Tunggu DOM siap sepenuhnya
      await this.waitForDOM();

      this.setupEventListeners();
      this.updatePageTitle();

      if (this.mode === 'update' && this.categoryId) {
        await this.loadCategory(parseInt(this.categoryId));
      }

      this.initialized = true;
      console.log('✅ Category CRUD page initialized');
    } catch (error) {
      console.error('❌ Category CRUD initialization error:', error);
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
   * Setup event listeners
   */
  setupEventListeners() {
    console.log('🔗 Setting up event listeners...');

    let attempts = 0;
    const maxAttempts = 10;

    const trySetup = () => {
      attempts++;

      const form = document.getElementById('categoryForm');
      const btnSave = document.getElementById('btnSaveCategory');
      const btnCancel = document.getElementById('btnCancelCategory');
      const btnBack = document.getElementById('btnBackToCategories');

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
        titleEl.innerHTML = '<i class="fas fa-tag me-2"></i>Edit Category';
      }
      if (breadcrumbEl) {
        breadcrumbEl.textContent = 'Edit';
      }
    } else {
      if (titleEl) {
        titleEl.innerHTML = '<i class="fas fa-tag me-2"></i>Add New Category';
      }
      if (breadcrumbEl) {
        breadcrumbEl.textContent = 'Add New';
      }
    }
  }

  /**
   * Load category data for edit mode
   */
  async loadCategory(id) {
    try {
      console.log(`📡 Loading category ${id} from API...`);

      const response = await WhitebirdAPI.category.getCategory(id);

      if (response.isSuccess && response.data) {
        this.category = response.data;
        this.populateForm(this.category);
        console.log('✅ Category data loaded');
      } else {
        throw new Error(response.message || 'Failed to load category');
      }
    } catch (error) {
      console.error('❌ Failed to load category:', error);
      this.showError('Failed to load category data');
    }
  }

  /**
   * Populate form with category data
   */
  populateForm(category) {
    console.log('Populating form with:', category);

    const formFields = {
      categoryName: category.categoryName || '',
      description: category.description || '',
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

    // Handle isActive checkbox
    const isActiveCheckbox = document.getElementById('isActive');
    if (isActiveCheckbox) {
      isActiveCheckbox.checked = category.isActive || false;
      console.log('Set isActive to:', category.isActive || false);
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

    const getCheckboxValue = (id) => {
      const element = document.getElementById(id);
      const value = element ? element.checked : true;
      console.log(`Getting checkbox ${id}:`, value);
      return value;
    };

    const data = {
      categoryName: getValue('categoryName', ''),
      description: getValue('description', null),
    };

    // Untuk update mode, tambahkan isActive
    if (this.mode === 'update') {
      data.isActive = getCheckboxValue('isActive');
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

    if (!data.categoryName || data.categoryName.trim() === '') {
      errors.push('Category Name is required');
      this.highlightField('categoryName', true);
    } else {
      this.highlightField('categoryName', false);
    }

    // Optional: Validate length if needed
    if (data.categoryName && data.categoryName.length > 100) {
      errors.push('Category Name must be less than 100 characters');
      this.highlightField('categoryName', true);
    }

    if (data.description && data.description.length > 500) {
      errors.push('Description must be less than 500 characters');
      this.highlightField('description', true);
    } else if (data.description) {
      this.highlightField('description', false);
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
        if (toastBody) toastBody.innerHTML = message;

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
        if (toastBody) toastBody.textContent = message;

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

    console.log('🔄 Submitting category form...');

    const btnSave = document.getElementById('btnSaveCategory');
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
        console.log(`📤 Updating category ${this.categoryId}...`, formData);
        response = await WhitebirdAPI.category.updateCategory(this.categoryId, formData);
      } else {
        console.log('📤 Creating new category...', formData);
        response = await WhitebirdAPI.category.createCategory(formData);
      }

      console.log('API Response:', response);

      if (response.isSuccess) {
        console.log('✅ Category saved successfully:', response);
        this.showSuccess(
          this.mode === 'update'
            ? 'Category updated successfully!'
            : 'Category created successfully!'
        );

        // Navigate back to categories list
        setTimeout(() => {
          if (window.router) {
            window.router.navigate('categories');
          } else {
            window.location.href = '/categories';
          }
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('❌ Failed to save category:', error);
      this.showError(error.message || 'Failed to save category. Please try again.');
    } finally {
      // Re-enable button
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = '<i class="fas fa-save me-2"></i>Save Category';
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

    console.log('🚫 Cancelling category form...');

    // Clear session storage
    sessionStorage.removeItem('crudMode');
    sessionStorage.removeItem('crudId');

    // Navigate back
    if (window.router) {
      window.router.navigate('categories');
    } else {
      window.location.href = '/categories';
    }
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    console.log('🧹 Cleaning up category event listeners...');

    const form = document.getElementById('categoryForm');
    const btnSave = document.getElementById('btnSaveCategory');
    const btnCancel = document.getElementById('btnCancelCategory');
    const btnBack = document.getElementById('btnBackToCategories');

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
    console.log('✅ Category CRUD module cleaned up');
  }
}

// Export instance
export const categoryCrudModule = new CategoryCrudModule();
