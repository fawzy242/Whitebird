/**
 * Router Module - History API (Clean URLs without #)
 * Professional SPA routing with browser history
 */

import { AuthService } from '../services/auth.service.js';
import { EventBus } from '../utils/event-bus.js';
import { DOMUtils } from '../utils/dom-utils.js';

class RouterModule {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.defaultRoute = 'dashboard';
    this.authPages = ['login', 'register', 'forgot-password', 'reset-password'];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    this.registerRoutes();
    this.setupEventListeners();
    this.handleInitialRoute();
    
    this.isInitialized = true;
  }

  registerRoutes() {
    // Dashboard
    this.register('dashboard', {
      title: 'Dashboard',
      template: 'pages/dashboard.html',
      requiresAuth: true,
      onEnter: () => this.loadDashboardData()
    });

    // Profile
    this.register('profile', {
      title: 'User Profile',
      template: 'pages/profile.html',
      requiresAuth: true
    });

    // Settings
    this.register('settings', {
      title: 'Settings',
      template: 'pages/settings.html',
      requiresAuth: true
    });

    // Models/Pages
    this.register('model1', {
      title: 'Data Table',
      template: 'pages/model1.html',
      requiresAuth: true
    });

    this.register('model2', {
      title: 'Forms',
      template: 'pages/model2.html',
      requiresAuth: true
    });

    this.register('model3', {
      title: 'Analytics',
      template: 'pages/model3.html',
      requiresAuth: true
    });

    // EMPLOYEES MODULE
    this.register('employees', {
      title: 'Employees - RedAdmin Pro',
      template: 'pages/employees.html',
      requiresAuth: true
    });

    this.register('employeescreate', {
      title: 'Create Employee - RedAdmin Pro',
      template: 'pages/employeecrud.html',
      requiresAuth: true,
      onEnter: () => {
        sessionStorage.setItem('crudMode', 'create');
        sessionStorage.setItem('crudModule', 'employee');
        sessionStorage.removeItem('crudId');
      }
    });

    this.register('employeesupdate', {
      title: 'Update Employee - RedAdmin Pro',
      template: 'pages/employeecrud.html',
      requiresAuth: true,
      onEnter: () => {
        sessionStorage.setItem('crudMode', 'update');
        sessionStorage.setItem('crudModule', 'employee');
      }
    });

    // ASSETS MODULE
    this.register('assets', {
      title: 'Assets - RedAdmin Pro',
      template: 'pages/assets.html',
      requiresAuth: true
    });

    this.register('assetscreate', {
      title: 'Create Asset - RedAdmin Pro',
      template: 'pages/assetcrud.html',
      requiresAuth: true,
      onEnter: () => {
        sessionStorage.setItem('crudMode', 'create');
        sessionStorage.setItem('crudModule', 'asset');
        sessionStorage.removeItem('crudId');
      }
    });

    this.register('assetsupdate', {
      title: 'Update Asset - RedAdmin Pro',
      template: 'pages/assetcrud.html',
      requiresAuth: true,
      onEnter: () => {
        sessionStorage.setItem('crudMode', 'update');
        sessionStorage.setItem('crudModule', 'asset');
      }
    });

    // CATEGORIES MODULE
    this.register('categories', {
      title: 'Categories - RedAdmin Pro',
      template: 'pages/categories.html',
      requiresAuth: true
    });

    this.register('categoriescreate', {
      title: 'Create Category - RedAdmin Pro',
      template: 'pages/categorycrud.html',
      requiresAuth: true,
      onEnter: () => {
        sessionStorage.setItem('crudMode', 'create');
        sessionStorage.setItem('crudModule', 'category');
        sessionStorage.removeItem('crudId');
      }
    });

    this.register('categoriesupdate', {
      title: 'Update Category - RedAdmin Pro',
      template: 'pages/categorycrud.html',
      requiresAuth: true,
      onEnter: () => {
        sessionStorage.setItem('crudMode', 'update');
        sessionStorage.setItem('crudModule', 'category');
      }
    });

    // TRANSACTIONS MODULE
    this.register('transactions', {
      title: 'Transactions - RedAdmin Pro',
      template: 'pages/transactions.html',
      requiresAuth: true
    });

    this.register('transactionscreate', {
      title: 'Create Transaction - RedAdmin Pro',
      template: 'pages/transactioncrud.html',
      requiresAuth: true,
      onEnter: () => {
        sessionStorage.setItem('crudMode', 'create');
        sessionStorage.setItem('crudModule', 'transaction');
        sessionStorage.removeItem('crudId');
      }
    });

    this.register('transactionsupdate', {
      title: 'Update Transaction - RedAdmin Pro',
      template: 'pages/transactioncrud.html',
      requiresAuth: true,
      onEnter: () => {
        sessionStorage.setItem('crudMode', 'update');
        sessionStorage.setItem('crudModule', 'transaction');
      }
    });

    // Reports
    this.register('reports', {
      title: 'Reports - RedAdmin Pro',
      template: 'pages/reports.html',
      requiresAuth: true
    });

    this.register('file-upload', {
      title: 'File Upload - RedAdmin Pro',
      template: 'pages/file-upload.html',
      requiresAuth: true
    });

    // Components
    this.register('components', {
      title: 'UI Components',
      template: 'pages/components.html',
      requiresAuth: true
    });

    this.register('buttons', {
      title: 'Buttons',
      template: 'pages/buttons.html',
      requiresAuth: true
    });

    // Auth pages
    this.register('login', {
      title: 'Login',
      template: 'pages/login.html',
      requiresAuth: false,
      layout: 'auth'
    });

    this.register('register', {
      title: 'Register',
      template: 'pages/register.html',
      requiresAuth: false,
      layout: 'auth'
    });

    this.register('forgot-password', {
      title: 'Forgot Password',
      template: 'pages/forgot-password.html',
      requiresAuth: false,
      layout: 'auth'
    });

    this.register('reset-password', {
      title: 'Reset Password',
      template: 'pages/reset-password.html',
      requiresAuth: false,
      layout: 'auth'
    });

    // Lock screen
    this.register('lockscreen', {
      title: 'Lock Screen',
      template: 'pages/lockscreen.html',
      requiresAuth: false,
      layout: 'auth'
    });

    // Error pages
    this.register('error404', {
      title: '404 Not Found',
      template: 'pages/error404.html',
      requiresAuth: false,
      layout: 'auth'
    });

    this.register('error500', {
      title: '500 Server Error',
      template: 'pages/error500.html',
      requiresAuth: false,
      layout: 'auth'
    });

    this.register('maintenance', {
      title: 'Maintenance',
      template: 'pages/maintenance.html',
      requiresAuth: false,
      layout: 'auth'
    });
  }

  register(path, config) {
    this.routes.set(path, config);
  }

  setupEventListeners() {
    window.addEventListener('popstate', (e) => {
      const path = this.getPathFromUrl();
      this.loadRoute(path);
    });
    
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        const route = link.dataset.route;
        this.navigate(route);
      }
    });
  }

  getPathFromUrl() {
    const path = window.location.pathname.replace(/^\//, '');
    return path || this.defaultRoute;
  }

  handleInitialRoute() {
    const path = this.getPathFromUrl();
    
    if (this.routes.has(path)) {
      this.loadRoute(path, false);
    } else if (path === '' || path === '/') {
      this.loadRoute(this.defaultRoute, false);
    } else {
      this.loadRoute('error404', false);
    }
  }

  navigate(path, options = true) {
    let pushState = true;
    let id = null;
    
    if (typeof options === 'boolean') {
      pushState = options;
    } else if (typeof options === 'object') {
      pushState = options.pushState !== false;
      id = options.id || null;
    }
    
    if (id) {
      sessionStorage.setItem('crudId', id);
    }
    
    if (pushState) {
      window.history.pushState({ path }, '', `/${path}`);
    }
    this.loadRoute(path);
  }

  async loadRoute(path, updateHistory = true) {
    const route = this.routes.get(path);
    
    if (!route) {
      this.navigate('error404', updateHistory);
      return;
    }

    // Check authentication
    // if (route.requiresAuth && !AuthService.checkAuth()) {
    //   this.navigate('login', updateHistory);
    //   return;
    // }

    // Redirect to dashboard if already authenticated
    if (!route.requiresAuth && AuthService.checkAuth() && this.authPages.includes(path)) {
      this.navigate(this.defaultRoute, updateHistory);
      return;
    }

    // Show loading
    EventBus.emit('app:loading', true);

    try {
      // Toggle layout if needed
      if (route.layout === 'auth') {
        this.showAuthLayout();
      } else {
        this.showDefaultLayout();
      }

      // Load template
      await this.loadTemplate(route.template);

      // Update page title
      document.title = `${route.title} - RedAdmin Pro`;

      // Update active menu
      this.updateActiveMenu(path);

      // Store current route
      this.currentRoute = path;

      // Call onEnter callback
      if (route.onEnter) {
        await route.onEnter();
      }

      // Emit route change event
      EventBus.emit('route:changed', { path, route });

    } catch (error) {
      console.error('Route loading error:', error);
      EventBus.emit('app:error', error);
    } finally {
      EventBus.emit('app:loading', false);
    }
  }

  async loadTemplate(templatePath) {
    try {
      const response = await fetch(`/${templatePath}`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status}`);
      }
      
      const html = await response.text();
      const pageContent = document.getElementById('pageContent');
      
      if (pageContent) {
        pageContent.innerHTML = html;
        
        window.dispatchEvent(new CustomEvent('pageLoaded', { detail: { path: templatePath } }));
      }

    } catch (error) {
      throw error;
    }
  }

  showAuthLayout() {
    const sidebar = document.querySelector('.sidebar-container');
    const topbar = document.querySelector('.topbar');
    const mainContent = document.querySelector('.main-content');
    const footer = document.querySelector('.footer');

    if (sidebar) sidebar.style.display = 'none';
    if (topbar) topbar.style.display = 'none';
    if (mainContent) {
      mainContent.style.marginLeft = '0';
      mainContent.style.marginTop = '0';
    }
    if (footer) footer.style.display = 'none';
  }

  showDefaultLayout() {
    const sidebar = document.querySelector('.sidebar-container');
    const topbar = document.querySelector('.topbar');
    const mainContent = document.querySelector('.main-content');
    const footer = document.querySelector('.footer');

    if (sidebar) sidebar.style.display = 'flex';
    if (topbar) topbar.style.display = 'flex';
    if (mainContent) {
      mainContent.style.marginLeft = '';
      mainContent.style.marginTop = '';
    }
    if (footer) footer.style.display = 'block';
  }

  updateActiveMenu(path) {
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
      link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-route="${path}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  async loadDashboardData() {
    console.log('Loading dashboard data...');
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  hasRoute(path) {
    return this.routes.has(path);
  }
}

export const router = new RouterModule();