/**
 * Employee CRUD Module - Handles add/edit employee page
 * Matches employeecrud.html structure
 */

import { whitebirdAPI } from '../services/api/whitebird-api.service.js';

export class EmployeeCrudModule {
  constructor() {
    this.mode = 'create'; // 'create' or 'update'
    this.employeeId = null;
    this.employee = null;
  }

  /**
   * Initialize CRUD page
   */
  async initialize() {
    console.log('📝 Employee CRUD Page Initializing...');

    try {
      // Get mode from sessionStorage
      this.mode = sessionStorage.getItem('crudMode') || 'create';
      this.employeeId = sessionStorage.getItem('crudId');

      console.log(`Mode: ${this.mode}, ID: ${this.employeeId}`);

      this.setupEventListeners();
      this.updatePageTitle();

      if (this.mode === 'update' && this.employeeId) {
        await this.loadEmployee(parseInt(this.employeeId));
      }

      console.log('✅ Employee CRUD page initialized');
    } catch (error) {
      console.error('❌ Employee CRUD initialization error:', error);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const form = document.getElementById('employeeForm');
    const btnSave = document.getElementById('btnSaveEmployee');
    const btnCancel = document.getElementById('btnCancelEmployee');
    const btnBack = document.getElementById('btnBackToEmployees');

    if (!form) {
      console.error('❌ Employee form not found!');
      return;
    }

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("📤 Form submitted");
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

      const response = await whitebirdAPI.getEmployee(id);

      if (response && response.success && response.data) {
        this.employee = response.data;
        this.populateForm(this.employee);
        console.log('✅ Employee data loaded');
      } else {
        throw new Error('Failed to load employee');
      }
    } catch (error) {
      console.error('❌ Failed to load employee:', error);
      alert('Failed to load employee data. Please try again.');
      this.handleCancel();
    }
  }

  /**
   * Populate form with employee data
   */
  populateForm(employee) {
    document.getElementById('fullName').value = employee.fullName || '';
    document.getElementById('email').value = employee.email || '';
    document.getElementById('phoneNumber').value = employee.phoneNumber || '';
    document.getElementById('department').value = employee.department || '';
    document.getElementById('position').value = employee.position || '';
  }

  /**
   * Get form data
   */
  getFormData() {
    return {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim() || null,
      phoneNumber: document.getElementById('phoneNumber').value.trim() || null,
      department: document.getElementById('department').value.trim() || null,
      position: document.getElementById('position').value.trim() || null,
    };
  }

  /**
   * Validate form data
   */
  validateFormData(data) {
    if (!data.fullName) {
      alert('Full Name is required');
      return false;
    }

    if (data.email && !this.isValidEmail(data.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    return true;
  }

  /**
   * Validate email
   */
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    const btnSave = document.getElementById('btnSaveEmployee');

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
        console.log(`📤 Updating employee ${this.employeeId}...`);
        response = await whitebirdAPI.updateEmployee(this.employeeId, formData);
      } else {
        console.log('📤 Creating new employee...');
        response = await whitebirdAPI.createEmployee(formData);
      }

      if (response && response.success) {
        console.log('✅ Employee saved successfully');
        alert(
          this.mode === 'update'
            ? 'Employee updated successfully!'
            : 'Employee created successfully!'
        );

        // Navigate back to employees list
        if (window.router) {
          window.router.navigate('employees');
        } else {
          window.location.href = '/employees';
        }
      } else {
        throw new Error(response.message || 'Failed to save employee');
      }
    } catch (error) {
      console.error('❌ Failed to save employee:', error);
      alert('Failed to save employee. Please try again.');

      // Re-enable button
      btnSave.disabled = false;
      btnSave.innerHTML = '<i class="fas fa-save me-2"></i>Save Employee';
    }
  }

  /**
   * Handle cancel
   */
  handleCancel() {
    if (window.router) {
      window.router.navigate('employees');
    } else {
      window.location.href = '/employees';
    }
  }
}

// Export instance
export const employeeCrudModule = new EmployeeCrudModule();
