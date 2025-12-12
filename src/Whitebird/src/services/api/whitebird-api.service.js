/**
 * Whitebird API Service
 * Complete API integration based on swagger.json
 */

import { API_CONFIG } from '../../config/api.config.js';

class WhitebirdAPI {
  constructor() {
    // Auto-detect base URL untuk dev/prod
    this.baseURL = this.detectBaseURL();
    this.token = localStorage.getItem('authToken');
    this.debug = API_CONFIG.DEBUG;

    if (this.debug) {
      console.log('🌐 Whitebird API Service initialized');
      console.log('🌐 Base URL:', this.baseURL);
      console.log('🌐 Current Origin:', window.location.origin);
      console.log('🌐 Environment:', import.meta.env.MODE);
      console.log('🌐 Is Production:', import.meta.env.PROD);
      console.log('🌐 Is Development:', import.meta.env.DEV);
    }
  }

  /**
   * Detect base URL berdasarkan environment
   */
  detectBaseURL() {
    // 1. Priority: Environment variable dari Vite
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }

    // 2. Priority: Config file
    if (API_CONFIG.BASE_URL) {
      return API_CONFIG.BASE_URL;
    }

    // 3. Auto-detect production vs development
    if (import.meta.env.PROD) {
      // ⭐ PRODUCTION: Empty string untuk relative path
      return '';
    } else {
      // ⭐ DEVELOPMENT: Localhost dengan port 5000
      return 'http://localhost:5000';
    }
  }

  /**
   * Build complete URL untuk request
   */
  buildURL(endpoint) {
    // Pastikan endpoint dimulai dengan slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Jika baseURL ada, gabungkan
    if (this.baseURL) {
      return `${this.baseURL}${cleanEndpoint}`;
    }

    // Jika baseURL kosong (production), return endpoint saja
    return cleanEndpoint;
  }

  /**
   * Set auth token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Get auth headers
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    const url = this.buildURL(endpoint);

    if (this.debug) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    }

    const config = {
      method: options.method || 'GET',
      headers: this.getHeaders(options.auth !== false),
      credentials: 'include', // Include cookies jika ada
      ...options,
    };

    // Convert body ke JSON jika object
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
        if (this.debug) {
          console.warn('⚠️ Non-JSON response:', data.substring(0, 100));
        }
      }

      if (!response.ok) {
        // Try to get error message from response
        const errorMessage =
          data?.message || data?.error || `API request failed with status ${response.status}`;

        if (this.debug) {
          console.error(`❌ API Error [${response.status}] ${endpoint}:`, errorMessage);
          console.error('Response:', data);
        }

        throw new Error(errorMessage);
      }

      if (this.debug) {
        console.log(`✅ API Success [${response.status}] ${endpoint}`);
      }

      return data;
    } catch (error) {
      if (this.debug) {
        console.error(`💥 API Fetch Error [${options.method || 'GET'}] ${endpoint}:`, error);

        // Tambahkan info tambahan untuk debugging
        console.error('Request URL:', url);
        console.error('Request Config:', {
          method: config.method,
          headers: config.headers,
          hasBody: !!config.body,
        });
      }

      // Rethrow dengan pesan yang lebih informatif
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================

  /**
   * Login
   * POST /api/auth/login
   */
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });

    if (response.isSuccess && response.data) {
      this.setToken(response.data.token);
      if (this.debug) {
        console.log('✅ Login successful, token saved');
      }
      return response.data;
    }

    throw new Error(response.message || 'Login failed');
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getMe() {
    const response = await this.request('/api/auth/me');
    return response.data;
  }

  /**
   * Change password
   * POST /api/auth/change-password
   */
  async changePassword(currentPassword, newPassword) {
    return await this.request('/api/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
  }

  /**
   * Forgot password
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email) {
    return await this.request('/api/auth/forgot-password', {
      method: 'POST',
      auth: false,
      body: { email },
    });
  }

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  async resetPassword(email, token, newPassword) {
    return await this.request('/api/auth/reset-password', {
      method: 'POST',
      auth: false,
      body: { email, token, newPassword },
    });
  }

  // ============================================
  // ASSET ENDPOINTS
  // ============================================

  /**
   * Get assets grid (with pagination, search, filters)
   * GET /api/asset/grid
   */
  async getAssetsGrid(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await this.request(`/api/asset/grid?${query}`);
    return response.data;
  }

  /**
   * Get all assets
   * GET /api/asset
   */
  async getAssets() {
    const response = await this.request('/api/asset');
    return response.data;
  }

  /**
   * Get asset by ID
   * GET /api/asset/{id}
   */
  async getAsset(id) {
    const response = await this.request(`/api/asset/${id}`);
    return response.data;
  }

  /**
   * Create asset
   * POST /api/asset
   */
  async createAsset(assetData) {
    return await this.request('/api/asset', {
      method: 'POST',
      body: assetData,
    });
  }

  /**
   * Update asset
   * PUT /api/asset/{id}
   */
  async updateAsset(id, assetData) {
    return await this.request(`/api/asset/${id}`, {
      method: 'PUT',
      body: assetData,
    });
  }

  /**
   * Delete asset
   * DELETE /api/asset/{id}
   */
  async deleteAsset(id) {
    return await this.request(`/api/asset/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // EMPLOYEE ENDPOINTS
  // ============================================

  /**
   * Get employees grid
   * GET /api/employee/grid
   */
  async getEmployeesGrid(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await this.request(`/api/employee/grid?${query}`);
    return response.data;
  }

  /**
   * Get all employees
   * GET /api/employee
   */
  async getEmployees() {
    const response = await this.request('/api/employee');
    return response.data;
  }

  /**
   * Get active employees
   * GET /api/employee/active
   */
  async getActiveEmployees() {
    const response = await this.request('/api/employee/active');
    return response.data;
  }

  /**
   * Get employee by ID
   * GET /api/employee/{id}
   */
  async getEmployee(id) {
    const response = await this.request(`/api/employee/${id}`);
    return response.data;
  }

  /**
   * Create employee
   * POST /api/employee
   */
  async createEmployee(employeeData) {
    return await this.request('/api/employee', {
      method: 'POST',
      body: employeeData,
    });
  }

  /**
   * Update employee
   * PUT /api/employee/{id}
   */
  async updateEmployee(id, employeeData) {
    return await this.request(`/api/employee/${id}`, {
      method: 'PUT',
      body: employeeData,
    });
  }

  /**
   * Delete employee
   * DELETE /api/employee/{id}
   */
  async deleteEmployee(id) {
    return await this.request(`/api/employee/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // CATEGORY ENDPOINTS
  // ============================================

  /**
   * Get all categories
   * GET /api/category
   */
  async getCategories() {
    const response = await this.request('/api/category');
    return response.data;
  }

  /**
   * Get active categories
   * GET /api/category/active
   */
  async getActiveCategories() {
    const response = await this.request('/api/category/active');
    return response.data;
  }

  /**
   * Get category by ID
   * GET /api/category/{id}
   */
  async getCategory(id) {
    const response = await this.request(`/api/category/${id}`);
    return response.data;
  }

  /**
   * Create category
   * POST /api/category
   */
  async createCategory(categoryData) {
    return await this.request('/api/category', {
      method: 'POST',
      body: categoryData,
    });
  }

  /**
   * Update category
   * PUT /api/category/{id}
   */
  async updateCategory(id, categoryData) {
    return await this.request(`/api/category/${id}`, {
      method: 'PUT',
      body: categoryData,
    });
  }

  /**
   * Delete category
   * DELETE /api/category/{id}
   */
  async deleteCategory(id) {
    return await this.request(`/api/category/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // ASSET TRANSACTION ENDPOINTS
  // ============================================

  /**
   * Get all transactions
   * GET /api/assettransactions
   */
  async getTransactions() {
    const response = await this.request('/api/assettransactions');
    return response.data;
  }

  /**
   * Get transactions by asset ID
   * GET /api/assettransactions/asset/{assetId}
   */
  async getTransactionsByAsset(assetId) {
    const response = await this.request(`/api/assettransactions/asset/${assetId}`);
    return response.data;
  }

  /**
   * Get transaction by ID
   * GET /api/assettransactions/{id}
   */
  async getTransaction(id) {
    const response = await this.request(`/api/assettransactions/${id}`);
    return response.data;
  }

  /**
   * Create transaction
   * POST /api/assettransactions
   */
  async createTransaction(transactionData) {
    return await this.request('/api/assettransactions', {
      method: 'POST',
      body: transactionData,
    });
  }

  /**
   * Update transaction
   * PUT /api/assettransactions/{id}
   */
  async updateTransaction(id, transactionData) {
    return await this.request(`/api/assettransactions/${id}`, {
      method: 'PUT',
      body: transactionData,
    });
  }

  /**
   * Delete transaction
   * DELETE /api/assettransactions/{id}
   */
  async deleteTransaction(id) {
    return await this.request(`/api/assettransactions/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check health
   * GET /health
   */
  async checkHealth() {
    return await this.request('/health', { auth: false });
  }

  /**
   * Test connection dengan logging detail
   */
  async testConnection() {
    try {
      console.log('🔍 Testing API connection...');
      console.log('Base URL:', this.baseURL);
      console.log('Current Origin:', window.location.origin);

      const health = await this.checkHealth();
      console.log('✅ Health check successful:', health);
      return true;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }

  /**
   * Logout (clear token)
   */
  logout() {
    this.setToken(null);
    if (this.debug) {
      console.log('✅ Logged out, token cleared');
    }
  }

  /**
   * Get current base URL (untuk debugging)
   */
  getCurrentBaseURL() {
    return this.baseURL;
  }
}

// Export singleton
export const whitebirdAPI = new WhitebirdAPI();

// Expose ke window untuk debugging
if (typeof window !== 'undefined') {
  window.whitebirdAPI = whitebirdAPI;

  // Tambah helper untuk debugging
  window.debugAPI = {
    test: () => whitebirdAPI.testConnection(),
    getBaseURL: () => whitebirdAPI.getCurrentBaseURL(),
    getToken: () => whitebirdAPI.token,
    clearToken: () => whitebirdAPI.setToken(null),
    checkEnv: () => ({
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD,
      dev: import.meta.env.DEV,
      viteApiUrl: import.meta.env.VITE_API_URL,
    }),
  };
}
