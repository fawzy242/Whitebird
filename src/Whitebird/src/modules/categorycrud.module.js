/**
 * Category CRUD Module - Handles add/edit category page
 * Matches categorycrud.html structure
 */

import { whitebirdAPI } from '../services/api/whitebird-api.service.js';

export class CategoryCrudModule {
  constructor() {
    this.mode = 'create'; // 'create' or 'update'
    this.categoryId = null;
    this.category = null;
  }

  /**
   * Initialize CRUD page
   */
  async initialize() {
    console.log('📝 Category CRUD Page Initializing...');

    try {
      // Get mode from sessionStorage
      this.mode = sessionStorage.getItem('crudMode') || 'create';
      this.categoryId = sessionStorage.getItem('crudId');

      console.log(`Mode: ${this.mode}, ID: ${this.categoryId}`);

      this.setupEventListeners();
      this.updatePageTitle();

      if (this.mode === 'update' && this.categoryId) {
        await this.loadCategory(parseInt(this.categoryId));
      }

      console.log('✅ Category CRUD page initialized');
    } catch (error) {
      console.error('❌ Category CRUD initialization error:', error);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const form = document.getElementById('categoryForm');
    const btnSave = document.getElementById('btnSaveCategory');
    const btnCancel = document.getElementById('btnCancelCategory');
    const btnBack = document.getElementById('btnBackToCategories');

    if (!form) {
      console.error('❌ Category form not found!');
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

      const response = await whitebirdAPI.getCategory(id);

      if (response && response.success && response.data) {
        this.category = response.data;
        this.populateForm(this.category);
        console.log('✅ Category data loaded');
      } else {
        throw new Error('Failed to load category');
      }
    } catch (error) {
      console.error('❌ Failed to load category:', error);
      alert('Failed to load category data. Please try again.');
      this.handleCancel();
    }
  }

  /**
   * Populate form with category data
   */
  populateForm(category) {
    document.getElementById('categoryName').value = category.categoryName || '';
    document.getElementById('description').value = category.description || '';
  }

  /**
   * Get form data
   */
  getFormData() {
    return {
      categoryName: document.getElementById('categoryName').value.trim(),
      description: document.getElementById('description').value.trim() || null,
    };
  }

  /**
   * Validate form data
   */
  validateFormData(data) {
    if (!data.categoryName) {
      alert('Category Name is required');
      return false;
    }

    return true;
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    const btnSave = document.getElementById('btnSaveCategory');

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
        console.log(`📤 Updating category ${this.categoryId}...`);
        response = await whitebirdAPI.updateCategory(this.categoryId, formData);
      } else {
        console.log('📤 Creating new category...');
        response = await whitebirdAPI.createCategory(formData);
      }

      if (response && response.success) {
        console.log('✅ Category saved successfully');
        alert(
          this.mode === 'update'
            ? 'Category updated successfully!'
            : 'Category created successfully!'
        );

        // Navigate back to categories list
        if (window.router) {
          window.router.navigate('categories');
        } else {
          window.location.href = '/categories';
        }
      } else {
        throw new Error(response.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('❌ Failed to save category:', error);
      alert('Failed to save category. Please try again.');

      // Re-enable button
      btnSave.disabled = false;
      btnSave.innerHTML = '<i class="fas fa-save me-2"></i>Save Category';
    }
  }

  /**
   * Handle cancel
   */
  handleCancel() {
    if (window.router) {
      window.router.navigate('categories');
    } else {
      window.location.href = '/categories';
    }
  }
}

// Export instance
export const categoryCrudModule = new CategoryCrudModule();
