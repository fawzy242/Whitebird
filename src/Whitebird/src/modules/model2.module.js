/**
 * Model 2 Module - Advanced Form Management
 * Features: Multi-step form, validation, auto-save, file upload
 */

export class Model2Manager {
  constructor() {
    this.formData = {};
    this.currentStep = 1;
    this.validationRules = this.setupValidation();
  }

  /**
   * Initialize Model 2
   */
  initialize() {
    console.log('📝 Model2 Initializing...');
    this.setupEventListeners();
    this.loadSavedData();
    this.enableAutoSave();
    console.log('✅ Model2 Initialized!');
  }

  /**
   * Setup validation rules
   */
  setupValidation() {
    return {
      productName: { required: true, minLength: 3 },
      category: { required: true },
      price: { required: true, min: 0 },
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Get all form inputs
    const inputs = document.querySelectorAll(
      '#model2Page input, #model2Page select, #model2Page textarea'
    );

    inputs.forEach((input) => {
      // Real-time validation
      input.addEventListener('blur', (e) => this.validateField(e.target));
      input.addEventListener('input', (e) => {
        this.formData[e.target.id || e.target.name] = e.target.value;
      });
    });

    // Save Product button
    const saveBtn = document.getElementById('saveProductBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
      console.log('   ✅ Save button listener attached');
    }

    // Reset button
    const resetBtn = document.getElementById('resetFormBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleReset();
      });
      console.log('   ✅ Reset button listener attached');
    }

    // Add auto-complete functionality
    this.addAutoComplete();

    console.log('   ✅ Event listeners attached');
  }

  /**
   * Validate field
   */
  validateField(field) {
    const fieldName = field.id || field.name;
    const value = field.value;
    const rules = this.validationRules[fieldName];

    if (!rules) {
      return true;
    }

    let isValid = true;
    let errorMessage = '';

    if (rules.required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = `Minimum ${rules.minLength} characters required`;
    } else if (rules.min && parseFloat(value) < rules.min) {
      isValid = false;
      errorMessage = `Value must be at least ${rules.min}`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      errorMessage = 'Invalid format';
    }

    // Update UI
    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');

      // Show error message
      let feedback = field.nextElementSibling;
      if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentNode.appendChild(feedback);
      }
      feedback.textContent = errorMessage;
    }

    return isValid;
  }

  /**
   * Handle submit
   */
  handleSubmit() {
    console.log('📤 Submitting product form...');

    // Collect all form data from all tabs
    const productData = {
      basicInfo: {
        name: document.getElementById('productName')?.value || '',
        sku: document.getElementById('skuCode')?.value || '',
        category: document.getElementById('productCategory')?.value || '',
        brand: document.getElementById('productBrand')?.value || '',
        description: document.getElementById('productDescription')?.value || '',
      },
      details: {
        weight: document.getElementById('productWeight')?.value || '',
        dimensions: document.getElementById('productDimensions')?.value || '',
        color: document.getElementById('productColor')?.value || '',
        material: document.getElementById('productMaterial')?.value || '',
        features: {
          waterproof: document.getElementById('feature1')?.checked || false,
          ecoFriendly: document.getElementById('feature2')?.checked || false,
          premiumQuality: document.getElementById('feature3')?.checked || false,
        },
      },
      pricing: {
        costPrice: document.getElementById('costPrice')?.value || '',
        sellingPrice: document.getElementById('sellingPrice')?.value || '',
        discount: document.getElementById('discountPercentage')?.value || '',
        taxRate: document.getElementById('taxRate')?.value || '',
        available: document.getElementById('availableSwitch')?.checked || false,
      },
    };

    // Simple validation - check required fields
    if (!productData.basicInfo.name) {
      this.showErrorMessage('Product name is required');
      // Focus on Basic Info tab
      const basicTab = document.querySelector('a[href="#basicInfo"]');
      if (basicTab) {
        basicTab.click();
      }
      return;
    }

    // Show loading state
    const saveBtn = document.getElementById('saveProductBtn');
    if (saveBtn) {
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
      saveBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        console.log('✅ Product saved!');
        console.log('Product Data:', productData);

        // Restore button
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;

        // Show success
        this.showSuccessMessage('Product saved successfully!');

        // Clear auto-save
        localStorage.removeItem('model2_formData');

        // Optionally reset form
        // this.handleReset();
      }, 1500);
    }
  }

  /**
   * Handle reset
   */
  async handleReset() {
    // Import confirmModal if not already available
    const { confirmModal } = await import('../components/confirm-modal.component.js');

    const result = await confirmModal.show({
      type: 'warning',
      title: 'Reset Form',
      message: 'Are you sure you want to reset the form? All unsaved data will be lost.',
      okText: 'Reset',
      cancelText: 'Cancel',
      okClass: 'btn-warning',
    });

    if (result) {
      this.formData = {};
      localStorage.removeItem('model2_formData');

      // Clear all form inputs
      const inputs = document.querySelectorAll(
        '#model2Page input, #model2Page select, #model2Page textarea'
      );
      inputs.forEach((input) => {
        input.classList.remove('is-valid', 'is-invalid');
        if (input.type === 'checkbox') {
          input.checked = false;
        } else {
          input.value = '';
        }
      });

      // Reset selects to first option
      const selects = document.querySelectorAll('#model2Page select');
      selects.forEach((select) => {
        select.selectedIndex = 0;
      });

      this.showSuccessMessage('Form reset successfully!');
    }
  }

  /**
   * Load saved data
   */
  loadSavedData() {
    const saved = localStorage.getItem('model2_formData');
    if (saved) {
      this.formData = JSON.parse(saved);

      // Populate form
      Object.keys(this.formData).forEach((key) => {
        const field = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
        if (field) {
          field.value = this.formData[key];
        }
      });

      console.log('   ✅ Loaded saved form data');
    }
  }

  /**
   * Enable auto-save
   */
  enableAutoSave() {
    setInterval(() => {
      if (Object.keys(this.formData).length > 0) {
        localStorage.setItem('model2_formData', JSON.stringify(this.formData));
        console.log('💾 Auto-saved form data');
      }
    }, 30000); // Save every 30 seconds
  }

  /**
   * Add auto-complete
   */
  addAutoComplete() {
    const categoryInput = document.getElementById('category');
    if (categoryInput) {
      const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports'];

      categoryInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        if (value.length < 2) {
          return;
        }

        const matches = categories.filter((cat) => cat.toLowerCase().includes(value));

        // Show suggestions
        console.log('Suggestions:', matches);
      });
    }
  }

  /**
   * Show success message
   */
  showSuccessMessage(message) {
    if (typeof RedAdminUtils !== 'undefined' && RedAdminUtils.showNotification) {
      RedAdminUtils.showNotification('success', message);
    } else {
      alert(message);
    }
  }

  /**
   * Show error message
   */
  showErrorMessage(message) {
    if (typeof RedAdminUtils !== 'undefined' && RedAdminUtils.showNotification) {
      RedAdminUtils.showNotification('danger', message);
    } else {
      alert(message);
    }
  }
}

// Export singleton
export const model2Manager = new Model2Manager();

// Expose to window
if (typeof window !== 'undefined') {
  window.model2 = model2Manager;
}
