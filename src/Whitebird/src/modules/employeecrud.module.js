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

    console.log('📝 Employee CRUD Page Initializing...');

    try {
      // Get mode from sessionStorage
      this.mode = sessionStorage.getItem('crudMode') || 'create';
      this.employeeId = sessionStorage.getItem('crudId');

      console.log(`Mode: ${this.mode}, ID: ${this.employeeId}`);

      // Wait for DOM
      await this.waitForDOM();

      this.setupEventListeners();
      this.updatePageTitle();

      if (this.mode === 'update' && this.employeeId) {
        await this.loadEmployee(parseInt(this.employeeId));
      } else {
        // Hide isActive field for create mode
        this.hideUpdateFields();
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
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(resolve, 100);
      } else {
        document.addEventListener('DOMContentLoaded', () => setTimeout(resolve, 100));
      }
    });
  }

  /**
   * Hide update-specific fields for create mode
   */
  hideUpdateFields() {
    const isActiveField = document.getElementById('isActiveField');
    if (isActiveField) {
      isActiveField.classList.add('d-none');
    }
  }

  /**
   * Show update-specific fields for edit mode
   */
  showUpdateFields() {
    const isActiveField = document.getElementById('isActiveField');
    if (isActiveField) {
      isActiveField.classList.remove('d-none');
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    console.log('🔗 Setting up event listeners...');

    const form = document.getElementById('employeeForm');
    const btnSave = document.getElementById('btnSaveEmployee');
    const btnCancel = document.getElementById('btnCancelEmployee');
    const btnBack = document.getElementById('btnBackToEmployees');

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
        titleEl.innerHTML = '<i class="fas fa-user me-2"></i>Edit Employee';
      }
      if (breadcrumbEl) {
        breadcrumbEl.textContent = 'Edit';
      }
      // Show update fields for edit mode
      this.showUpdateFields();
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
    }
  }

  /**
   * Populate form with employee data
   */
  populateForm(employee) {
    console.log('Populating form with:', employee);

    // Field mappings
    const fieldMappings = [
      { id: 'fullName', value: employee.fullName || '' },
      { id: 'email', value: employee.email || '' },
      { id: 'phoneNumber', value: employee.phoneNumber || '' },
      { id: 'department', value: employee.department || '' },
      { id: 'position', value: employee.position || '' },
    ];

    // Set form values
    fieldMappings.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    });

    // Handle isActive checkbox for update mode
    if (this.mode === 'update') {
      const isActiveCheckbox = document.getElementById('isActive');
      if (isActiveCheckbox) {
        isActiveCheckbox.checked = employee.isActive !== false; // Default to true
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
    const getValue = (id, allowNull = false) => {
      const element = document.getElementById(id);
      if (!element) return allowNull ? null : undefined;

      const value = element.value.trim();
      
      if (value === '' && allowNull) {
        return null;
      }

      if (value === '') {
        return undefined;
      }

      return value;
    };

    // Required field
    data.fullName = getValue('fullName');

    // Optional fields
    const email = getValue('email', true);
    if (email !== undefined) {
      data.email = email;
    }

    const phoneNumber = getValue('phoneNumber', true);
    if (phoneNumber !== undefined) {
      data.phoneNumber = phoneNumber;
    }

    const department = getValue('department', true);
    if (department !== undefined) {
      data.department = department;
    }

    const position = getValue('position', true);
    if (position !== undefined) {
      data.position = position;
    }

    // For update mode, add isActive
    if (this.mode === 'update') {
      const isActiveElement = document.getElementById('isActive');
      if (isActiveElement) {
        data.isActive = isActiveElement.checked;
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
    if (!data.fullName || data.fullName.trim() === '') {
      errors.push('Full Name is required');
      this.highlightField('fullName', true);
    } else if (data.fullName.length > 100) {
      errors.push('Full Name must be less than 100 characters');
      this.highlightField('fullName', true);
    } else {
      this.highlightField('fullName', false);
    }

    // Email validation
    if (data.email && data.email.length > 100) {
      errors.push('Email must be less than 100 characters');
      this.highlightField('email', true);
    } else if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
      this.highlightField('email', true);
    } else if (data.email !== undefined) {
      this.highlightField('email', false);
    }

    // Phone number validation
    if (data.phoneNumber && data.phoneNumber.length > 20) {
      errors.push('Phone Number must be less than 20 characters');
      this.highlightField('phoneNumber', true);
    } else if (data.phoneNumber !== undefined) {
      this.highlightField('phoneNumber', false);
    }

    // Department validation
    if (data.department && data.department.length > 50) {
      errors.push('Department must be less than 50 characters');
      this.highlightField('department', true);
    } else if (data.department !== undefined) {
      this.highlightField('department', false);
    }

    // Position validation
    if (data.position && data.position.length > 50) {
      errors.push('Position must be less than 50 characters');
      this.highlightField('position', true);
    } else if (data.position !== undefined) {
      this.highlightField('position', false);
    }

    if (errors.length > 0) {
      this.showError(errors.join('<br>'));
      return false;
    }

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

    console.log('🔄 Submitting employee form...');

    const btnSave = document.getElementById('btnSaveEmployee');
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
        console.log(`📤 Updating employee ${this.employeeId}...`, formData);
        response = await WhitebirdAPI.employee.updateEmployee(this.employeeId, formData);
      } else {
        console.log('📤 Creating new employee...', formData);
        response = await WhitebirdAPI.employee.createEmployee(formData);
      }

      console.log('API Response:', response);

      if (response.isSuccess) {
        const successMessage = this.mode === 'update' 
          ? 'Employee updated successfully!' 
          : 'Employee created successfully!';
        
        this.showSuccess(successMessage);

        // Navigate back to employees list after delay
        setTimeout(() => {
          this.cleanupAndNavigate();
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
  handleCancel() {
    console.log('🚫 Cancelling employee form...');
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
      window.router.navigate('employees');
    } else {
      window.location.href = '/employees';
    }
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    console.log('🧹 Cleaning up employee CRUD module...');

    if (this.handleSubmitBound) {
      const form = document.getElementById('employeeForm');
      const btnSave = document.getElementById('btnSaveEmployee');
      
      if (form) form.removeEventListener('submit', this.handleSubmitBound);
      if (btnSave) btnSave.removeEventListener('click', this.handleSubmitBound);
    }

    if (this.handleCancelBound) {
      const btnCancel = document.getElementById('btnCancelEmployee');
      const btnBack = document.getElementById('btnBackToEmployees');
      
      if (btnCancel) btnCancel.removeEventListener('click', this.handleCancelBound);
      if (btnBack) btnBack.removeEventListener('click', this.handleCancelBound);
    }

    this.handleSubmitBound = null;
    this.handleCancelBound = null;
    this.initialized = false;

    console.log('✅ Employee CRUD module cleaned up');
  }
}

// Export instance
export const employeeCrudModule = new EmployeeCrudModule();