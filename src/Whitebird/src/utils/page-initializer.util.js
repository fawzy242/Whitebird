/**
 * Page Initializer - Connects modules to pages after router loads them
 * This is needed because scripts in innerHTML don't execute
 */

import { dashboardMenu } from '../modules/dashboard.menu.js';
import { employeesMenu } from '../modules/employees.menu.js';
import { employeeCrudModule } from '../modules/employeecrud.module.js';
import { assetsMenu } from '../modules/assets.menu.js';
import { assetCrudModule } from '../modules/assetcrud.module.js';
import { categoriesMenu } from '../modules/categories.menu.js';
import { categoryCrudModule } from '../modules/categorycrud.module.js';
import { transactionsMenu } from '../modules/transactions.menu.js';
import { transactionCrudModule } from '../modules/transactioncrud.module.js';
import { reportsMenu } from '../modules/reports.menu.js';
import { profileMenu } from '../modules/profile.menu.js';
import { settingsMenu } from '../modules/settings.menu.js';
import { model1Manager } from '../modules/model1.module.js';
import { model2Manager } from '../modules/model2.module.js';
import { model3Manager } from '../modules/model3.module.js';

class PageInitializer {
  constructor() {
    this.initializedPages = new Set();
    this.pageInstances = {};
    this.initializeListeners();
  }

  /**
   * Listen for page loaded events
   */
  initializeListeners() {
    window.addEventListener('pageLoaded', (e) => {
      const path = e.detail.path;
      console.log('📄 Page loaded:', path);
      this.initializePage(path);
    });

    console.log('✅ Page Initializer ready with smart caching!');
  }

  /**
   * Check if page should be re-initialized
   */
  shouldReinitialize(pageName) {
    // Pages that ALWAYS re-initialize (forms, CRUD, dynamic dashboards, chart pages)
    const alwaysReinit = [
      'employeecrud',
      'assetcrud',
      'categorycrud',
      'transactioncrud',
      'dashboard',
      'model1',
      'model3',
    ];

    // Pages that only initialize once (static lists, settings)
    const initOnce = [
      'employees',
      'assets',
      'categories',
      'transactions',
      'reports',
      'model2',
      'profile',
      'settings',
      'components',
      'buttons',
    ];

    if (alwaysReinit.includes(pageName)) {
      console.log(`⚡ Page "${pageName}" set to always re-initialize (dynamic content)`);
      return true; // Always re-init for fresh data
    }

    if (initOnce.includes(pageName)) {
      const shouldInit = !this.initializedPages.has(pageName);
      if (!shouldInit) {
        console.log(`💾 Page "${pageName}" using cached version`);
      }
      return shouldInit; // Only init once, then cache
    }

    return true; // Auth pages and others: always re-init
  }

  /**
   * Initialize specific page modules
   */
  initializePage(path) {
    // Extract page name from path
    const pageName = path.split('/').pop().replace('.html', '');
    console.log(path, pageName);
    // Check if should reinitialize
    if (!this.shouldReinitialize(pageName)) {
      console.log(`⚡ Page "${pageName}" already initialized - using cached version`);
      return;
    }

    console.log('🎯 Initializing page:', pageName);

    switch (pageName) {
      case 'dashboard':
        this.initializeDashboard();
        break;
      case 'employees':
        this.initializeEmployees();
        break;
      case 'employeecrud':
        this.initializeEmployeeCrud();
        break;
      case 'assets':
        this.initializeAssets();
        break;
      case 'assetcrud':
        this.initializeAssetCrud();
        break;
      case 'categories':
        this.initializeCategories();
        break;
      case 'categorycrud':
        this.initializeCategoryCrud();
        break;
      case 'transactions':
        this.initializeTransactions();
        break;
      case 'transactioncrud':
        this.initializeTransactionCrud();
        break;
      case 'reports':
        this.initializeReports();
        break;
      case 'profile':
        this.initializeProfile();
        break;
      case 'settings':
        this.initializeSettings();
        break;
      case 'model1':
        this.initializeModel1();
        break;
      case 'model2':
        this.initializeModel2();
        break;
      case 'model3':
        this.initializeModel3();
        break;
      case 'login':
      case 'register':
      case 'forgot-password':
      case 'reset-password':
        this.initializeAuthPages();
        break;
      default:
        console.log('   No specific initializer for:', pageName);
    }

    // Mark page as initialized (for caching)
    if (!['employeecrud', 'assetcrud', 'categorycrud', 'transactioncrud'].includes(pageName)) {
      this.initializedPages.add(pageName);
      console.log(`✅ Page "${pageName}" marked as initialized (cached for next visit)`);
    }

    // Initialize password toggles on all pages
    this.initializePasswordToggles();
  }

  /**
   * Initialize Dashboard page
   */
  initializeDashboard() {
    console.log('📊 Initializing Dashboard page...');
    try {
      dashboardMenu.initialize();
      console.log('✅ Dashboard initialized!');
    } catch (error) {
      console.error('❌ Dashboard initialization error:', error);
    }
  }

  /**
   * Initialize Employees page
   */
  initializeEmployees() {
    console.log('👥 Initializing Employees page...');
    try {
      employeesMenu.initialize();
      console.log('✅ Employees initialized!');
    } catch (error) {
      console.error('❌ Employees initialization error:', error);
    }
  }

  /**
   * Initialize Employee CRUD page
   */
  initializeEmployeeCrud() {
    console.log('📝 Initializing Employee CRUD page...');
    try {
      employeeCrudModule.initialize();
      console.log('✅ Employee CRUD initialized!');
    } catch (error) {
      console.error('❌ Employee CRUD initialization error:', error);
    }
  }

  /**
   * Initialize Assets page
   */
  initializeAssets() {
    console.log('📦 Initializing Assets page...');
    try {
      assetsMenu.initialize();
      console.log('✅ Assets initialized!');
    } catch (error) {
      console.error('❌ Assets initialization error:', error);
    }
  }

  /**
   * Initialize Asset CRUD page
   */
  initializeAssetCrud() {
    console.log('📝 Initializing Asset CRUD page...');
    try {
      assetCrudModule.initialize();
      console.log('✅ Asset CRUD initialized!');
    } catch (error) {
      console.error('❌ Asset CRUD initialization error:', error);
    }
  }

  /**
   * Initialize Categories page
   */
  initializeCategories() {
    console.log('🏷️ Initializing Categories page...');
    try {
      categoriesMenu.initialize();
      console.log('✅ Categories initialized!');
    } catch (error) {
      console.error('❌ Categories initialization error:', error);
    }
  }

  /**
   * Initialize Category CRUD page
   */
  initializeCategoryCrud() {
    console.log('📝 Initializing Category CRUD page...');
    try {
      categoryCrudModule.initialize();
      console.log('✅ Category CRUD initialized!');
    } catch (error) {
      console.error('❌ Category CRUD initialization error:', error);
    }
  }

  /**
   * Initialize Transactions page
   */
  initializeTransactions() {
    console.log('🔄 Initializing Transactions page...');
    try {
      transactionsMenu.initialize();
      console.log('✅ Transactions initialized!');
    } catch (error) {
      console.error('❌ Transactions initialization error:', error);
    }
  }

  /**
   * Initialize Transaction CRUD page
   */
  initializeTransactionCrud() {
    console.log('📝 Initializing Transaction CRUD page...');
    try {
      transactionCrudModule.initialize();
      console.log('✅ Transaction CRUD initialized!');
    } catch (error) {
      console.error('❌ Transaction CRUD initialization error:', error);
    }
  }

  /**
   * Initialize Reports page
   */
  initializeReports() {
    console.log('📊 Initializing Reports page...');
    try {
      reportsMenu.initialize();
      console.log('✅ Reports initialized!');
    } catch (error) {
      console.error('❌ Reports initialization error:', error);
    }
  }

  /**
   * Initialize Profile page
   */
  initializeProfile() {
    console.log('👤 Initializing Profile page...');
    try {
      profileMenu.initialize();
      console.log('✅ Profile initialized!');
    } catch (error) {
      console.error('❌ Profile initialization error:', error);
    }
  }

  /**
   * Initialize Settings page
   */
  initializeSettings() {
    console.log('⚙️ Initializing Settings page...');
    try {
      settingsMenu.initialize();
      console.log('✅ Settings initialized!');
    } catch (error) {
      console.error('❌ Settings initialization error:', error);
    }
  }

  /**
   * Initialize Model1 page
   */
  initializeModel1() {
    console.log('📊 Initializing Model1 page...');
    try {
      model1Manager.initialize();
      console.log('✅ Model1 initialized!');
    } catch (error) {
      console.error('❌ Model1 initialization error:', error);
    }
  }

  /**
   * Initialize Model2 page
   */
  initializeModel2() {
    console.log('📈 Initializing Model2 page...');
    try {
      model2Manager.initialize();
      console.log('✅ Model2 initialized!');
    } catch (error) {
      console.error('❌ Model2 initialization error:', error);
    }
  }

  /**
   * Initialize Model3 page
   */
  initializeModel3() {
    console.log('📉 Initializing Model3 page...');
    try {
      model3Manager.initialize();
      console.log('✅ Model3 initialized!');
    } catch (error) {
      console.error('❌ Model3 initialization error:', error);
    }
  }

  /**
   * Initialize auth pages (login, register, etc)
   */
  initializeAuthPages() {
    console.log('🔐 Initializing Auth page...');
    // Password toggles will be initialized by initializePasswordToggles()
  }

  /**
   * Initialize password toggle buttons
   */
  initializePasswordToggles() {
    // Find ALL password toggle buttons
    const toggleButtons = document.querySelectorAll(
      '.password-toggle, .password-toggle-btn, [data-toggle="password"]'
    );

    if (toggleButtons.length === 0) {
      return;
    }

    console.log(`🔑 Initializing ${toggleButtons.length} password toggle(s)...`);

    toggleButtons.forEach((button) => {
      // Remove any existing listeners
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      // Add click listener
      newButton.addEventListener('click', function (e) {
        e.preventDefault();

        // Find password input (previous sibling or in same input-group)
        const inputGroup = this.closest('.form-floating, .input-group');
        const passwordInput = inputGroup
          ? inputGroup.querySelector('input[type="password"], input[type="text"]')
          : this.previousElementSibling ||
            this.parentElement.querySelector('input[type="password"], input[type="text"]');

        if (!passwordInput) {
          console.warn('Password input not found for toggle button');
          return;
        }

        // Find icon
        const icon = this.querySelector('i, .fa-eye, .fa-eye-slash');

        // Toggle visibility
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          }
        } else {
          passwordInput.type = 'password';
          if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        }
      });
    });

    console.log('✅ Password toggles initialized!');
  }
}

// Create and export singleton
export const pageInitializer = new PageInitializer();
