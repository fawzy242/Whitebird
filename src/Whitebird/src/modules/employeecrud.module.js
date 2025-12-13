/**
 * Employee CRUD Module - Handles add/edit employee page
 * Matches employeecrud.html structure
 */

import WhitebirdAPI from '../services/api/index.js';

export class EmployeeCrudModule {
  constructor() {
    this.mode = 'create'; // 'create' or 'update'
    this.employeeId = null;
    this.employee = null;
    this.initialized = false;
  }

  /**
   * Initialize CRUD page
   */
  async initialize() {
    if (this.initialized) return;

    console.log('📝 Employee CRUD Page Initializing...');

    try {
      // Get mode from sessionStorage
      this.mode = sessionStorage.getItem('crudMode') || 'create';
      this.employeeId = sessionStorage.getItem('crudId');

      console.log(`Mode: ${this.mode}, ID: ${this.employeeId}`);

      // Tunggu DOM siap sepenuhnya
      await this.waitForDOM();

      this.setupEventListeners();
      this.updatePageTitle();

      if (this.mode === 'update' && this.employeeId) {
        await this.loadEmployee(parseInt(this.employeeId));
      }

      this.initialized = true;
      console.log('✅ Employee CRUD page initialized');
    } catch (error) {
      console.error('❌ Employee CRUD initialization error:', error);
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
        setTimeout(resolve, 100); // Tunggu sedikit untuk render
      }
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    console.log('🔗 Setting up event listeners...');

    // Coba beberapa kali jika elemen belum ada
    let attempts = 0;
    const maxAttempts = 10;

    const trySetup = () => {
      attempts++;

      const form = document.getElementById('employeeForm');
      const btnSave = document.getElementById('btnSaveEmployee');
      const btnCancel = document.getElementById('btnCancelEmployee');
      const btnBack = document.getElementById('btnBackToEmployees');

      console.log('Looking for elements...', { form, btnSave, btnCancel, btnBack });

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

      // Form submit - HAPUS event listener lama dulu untuk menghindari duplikasi
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

      // Tambahkan juga click listener langsung ke save button sebagai fallback
      btnSave.removeEventListener('click', this.handleSubmitBound);
      btnSave.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Save button clicked directly');
        this.handleSubmit();
      });

      console.log('✅ Event listeners attached successfully');
      console.log('Form elements found:', {
        form: form?.id,
        btnSave: btnSave?.id,
        btnCancel: btnCancel?.id,
        btnBack: btnBack?.id,
      });
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
        titleEl.innerHTML = '<i class="fas fa-user me-2"></i>Edit Employee';
      }
      if (breadcrumbEl) {
        breadcrumbEl.textContent = 'Edit';
      }
    } else {
      if (titleEl) {
        titleEl.innerHTML = '<i class="fas fa-user me-2"></i>Add New Employee';
      }
      if (breadcrumbEl) {
        breadcrumbEl.textContent = 'Add New';
      }
    }
  }

  /**
   * Load employee data for edit mode
   */
  async loadEmployee(id) {
    try {
      console.log(`📡 Loading employee ${id} from API...`);

      const response = await WhitebirdAPI.employee.getEmployee(id);

      if (response.isSuccess && response.data) {
        this.employee = response.data;
        this.populateForm(this.employee);
        console.log('✅ Employee data loaded');
      } else {
        throw new Error(response.message || 'Failed to load employee');
      }
    } catch (error) {
      console.error('❌ Failed to load employee:', error);
      this.showError('Failed to load employee data');
      // Jangan langsung cancel, biarkan user memutuskan
    }
  }

  /**
   * Populate form with employee data
   */
  populateForm(employee) {
    console.log('Populating form with:', employee);

    const formFields = {
      fullName: employee.fullName || '',
      email: employee.email || '',
      phoneNumber: employee.phoneNumber || '',
      department: employee.department || '',
      position: employee.position || '',
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
      isActiveCheckbox.checked = employee.isActive || false;
      console.log(`Set isActive to:`, employee.isActive || false);
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
      fullName: getValue('fullName', ''),
      email: getValue('email', null),
      phoneNumber: getValue('phoneNumber', null),
      department: getValue('department', null),
      position: getValue('position', null),
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

    if (!data.fullName || data.fullName.trim() === '') {
      errors.push('Full Name is required');
      this.highlightField('fullName', true);
    } else {
      this.highlightField('fullName', false);
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
      this.highlightField('email', true);
    } else if (data.email) {
      this.highlightField('email', false);
    }

    if (data.email && data.email.length > 100) {
      errors.push('Email must be less than 100 characters');
      this.highlightField('email', true);
    }

    if (data.fullName && data.fullName.length > 100) {
      errors.push('Full Name must be less than 100 characters');
      this.highlightField('fullName', true);
    }

    if (data.phoneNumber && data.phoneNumber.length > 20) {
      errors.push('Phone Number must be less than 20 characters');
      this.highlightField('phoneNumber', true);
    } else if (data.phoneNumber) {
      this.highlightField('phoneNumber', false);
    }

    if (data.department && data.department.length > 50) {
      errors.push('Department must be less than 50 characters');
      this.highlightField('department', true);
    } else if (data.department) {
      this.highlightField('department', false);
    }

    if (data.position && data.position.length > 50) {
      errors.push('Position must be less than 50 characters');
      this.highlightField('position', true);
    } else if (data.position) {
      this.highlightField('position', false);
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
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

    // Try to use Bootstrap toast if available
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

    // Try to use Bootstrap toast if available
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

    console.log('🔄 Submitting form...');

    const btnSave = document.getElementById('btnSaveEmployee');
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
        console.log(`📤 Updating employee ${this.employeeId}...`, formData);
        response = await WhitebirdAPI.employee.updateEmployee(this.employeeId, formData);
      } else {
        console.log('📤 Creating new employee...', formData);
        response = await WhitebirdAPI.employee.createEmployee(formData);
      }

      console.log('API Response:', response);

      if (response.isSuccess) {
        console.log('✅ Employee saved successfully:', response);
        this.showSuccess(
          this.mode === 'update'
            ? 'Employee updated successfully!'
            : 'Employee created successfully!'
        );

        // Navigate back to employees list
        setTimeout(() => {
          if (window.router) {
            window.router.navigate('employees');
          } else {
            window.location.href = '/employees';
          }
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to save employee');
      }
    } catch (error) {
      console.error('❌ Failed to save employee:', error);
      this.showError(error.message || 'Failed to save employee. Please try again.');
    } finally {
      // Re-enable button
      if (btnSave) {
        btnSave.disabled = false;
        btnSave.innerHTML = '<i class="fas fa-save me-2"></i>Save Employee';
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

    console.log('🚫 Cancelling form...');

    // Clear session storage
    sessionStorage.removeItem('crudMode');
    sessionStorage.removeItem('crudId');

    // Navigate back
    if (window.router) {
      window.router.navigate('employees');
    } else {
      window.location.href = '/employees';
    }
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    console.log('🧹 Cleaning up event listeners...');

    const form = document.getElementById('employeeForm');
    const btnSave = document.getElementById('btnSaveEmployee');
    const btnCancel = document.getElementById('btnCancelEmployee');
    const btnBack = document.getElementById('btnBackToEmployees');

    if (this.handleSubmitBound && form) {
      form.removeEventListener('submit', this.handleSubmitBound);
    }

    if (this.handleCancelBound && btnCancel) {
      btnCancel.removeEventListener('click', this.handleCancelBound);
    }

    if (this.handleCancelBound && btnBack) {
      btnBack.removeEventListener('click', this.handleCancelBound);
    }

    this.initialized = false;
    console.log('✅ Employee CRUD module cleaned up');
  }
}

// Export instance
export const employeeCrudModule = new EmployeeCrudModule();

// Auto-initialize if module is loaded standalone
if (import.meta.env.DEV) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Only initialize if we're on an employee CRUD page
      if (document.getElementById('employeeForm')) {
        console.log('Auto-initializing Employee CRUD module...');
        employeeCrudModule.initialize();
      }
    });
  } else {
    setTimeout(() => {
      if (document.getElementById('employeeForm')) {
        console.log('Auto-initializing Employee CRUD module...');
        employeeCrudModule.initialize();
      }
    }, 100);
  }
}
