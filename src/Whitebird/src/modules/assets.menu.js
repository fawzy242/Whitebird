/**
 * Assets Menu Module - Optimized and Cleaned
 * Connected to Whitebird API
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import WhitebirdAPI from '../services/api/index.js';

export class AssetsMenu {
  constructor() {
    this.assets = [];
    this.categories = [];
    this.filteredData = [];
    this.currentTab = 'available';
    this.currentPage = 1;
    this.pageSize = 10;
    this.loading = false;
    this.totalItems = 0;
    this.totalPages = 1;
    this.searchTimeout = null;
  }

  /**
   * Initialize assets menu
   */
  async initialize() {
    console.log('📦 Assets Menu Initializing...');
    
    try {
      this.setupEventListeners();
      await this.loadCategories();
      await this.loadFromAPI();
      this.populateCategories();
      this.updateStats();
      this.renderCurrentTab();
      console.log('✅ Assets Menu Initialized!');
    } catch (error) {
      console.error('❌ Assets Menu initialization error:', error);
      this.showError('Failed to initialize assets menu');
    }
  }

  /**
   * Load assets from API with pagination
   */
  async loadFromAPI() {
    if (this.loading) return;

    try {
      this.loading = true;
      this.showLoading(true);

      console.log('📡 Loading assets from API...');
      const response = await WhitebirdAPI.asset.getAssetsGrid({
        page: this.currentPage,
        pageSize: this.pageSize,
      });

      if (response.isSuccess && response.data) {
        this.assets = response.data;
        this.totalItems = response.totalCount || 0;
        this.totalPages = response.totalPages || 1;
        this.filteredData = [...this.assets];
        
        console.log(`✅ Loaded ${this.assets.length} assets from API`);
        console.log(`Total: ${this.totalItems}, Pages: ${this.totalPages}`);
      } else {
        throw new Error(response.message || 'Failed to load assets');
      }
    } catch (error) {
      console.error('❌ Failed to load assets from API:', error);
      this.showError('Failed to load assets');
    } finally {
      this.loading = false;
      this.showLoading(false);
    }
  }

  /**
   * Load categories from API
   */
  async loadCategories() {
    try {
      console.log('📡 Loading categories from API...');
      const response = await WhitebirdAPI.category.getActiveCategories();

      if (response.isSuccess && response.data) {
        this.categories = response.data;
        console.log(`✅ Loaded ${this.categories.length} categories from API`);
      } else {
        throw new Error(response.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('❌ Failed to load categories from API:', error);
      this.showError('Failed to load categories');
    }
  }

  /**
   * Show/hide loading indicator
   */
  showLoading(show) {
    const loadingEl = document.getElementById('assetsLoading');
    if (loadingEl) {
      loadingEl.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Populate categories dropdown
   */
  populateCategories() {
    const select = document.getElementById('filterCategory');
    if (!select) return;

    select.innerHTML = '<option value="">All Categories</option>';

    this.categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.categoryName || cat.name || cat;
      option.textContent = cat.categoryName || cat.name || cat;
      select.appendChild(option);
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Add button
    const addBtn = document.getElementById('btnAddAsset');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.handleAdd());
    }

    // Refresh button
    const refreshBtn = document.getElementById('btnRefreshAssets');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.handleRefresh());
    }

    // Search input with debounce
    const searchInput = document.getElementById('searchAssets');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.applyFilters();
        }, 300);
      });
    }

    // Filter dropdowns
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');

    if (filterCategory) {
      filterCategory.addEventListener('change', () => this.applyFilters());
    }

    if (filterStatus) {
      filterStatus.addEventListener('change', () => this.applyFilters());
    }

    // Reset filters
    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }

    // Tab switching using Bootstrap events
    const assetTabs = document.getElementById('assetTabs');
    if (assetTabs) {
      assetTabs.addEventListener('shown.bs.tab', (e) => {
        const tabId = e.target.id;
        
        if (tabId === 'availableTab') {
          this.currentTab = 'available';
        } else if (tabId === 'inuseTab') {
          this.currentTab = 'inuse';
        } else if (tabId === 'maintenanceTab') {
          this.currentTab = 'maintenance';
        }
        
        this.currentPage = 1;
        this.renderCurrentTab();
      });
    }
  }

  /**
   * Handle refresh button click
   */
  async handleRefresh() {
    const refreshBtn = document.getElementById('btnRefreshAssets');
    if (!refreshBtn) return;

    console.log('🔄 Refreshing assets from API...');
    
    const originalText = refreshBtn.innerHTML;
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';

    try {
      await this.loadFromAPI();
      await this.loadCategories();
      this.updateStats();
      this.renderCurrentTab();
      this.showNotification('Assets refreshed successfully', 'success');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
      this.showNotification('Failed to refresh assets', 'danger');
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = originalText;
    }
  }

  /**
   * Apply filters
   */
  applyFilters() {
    const searchQuery = document.getElementById('searchAssets')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('filterCategory')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';

    this.filteredData = this.assets.filter((asset) => {
      let match = true;

      // Search across multiple fields
      if (searchQuery) {
        const searchableFields = [
          asset.assetName,
          asset.assetCode,
          asset.categoryName,
          asset.serialNumber
        ].map(field => field?.toLowerCase() || '');
        
        match = match && searchableFields.some(field => field.includes(searchQuery));
      }

      // Category filter
      if (categoryFilter && categoryFilter !== 'All Categories') {
        match = match && asset.categoryName === categoryFilter;
      }

      // Status filter
      if (statusFilter && statusFilter !== 'All Status') {
        match = match && asset.status === statusFilter;
      }

      return match;
    });

    this.currentPage = 1;
    this.updateStats();
    this.renderCurrentTab();
  }

  /**
   * Reset filters
   */
  resetFilters() {
    const searchInput = document.getElementById('searchAssets');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');

    if (searchInput) searchInput.value = '';
    if (filterCategory) filterCategory.value = '';
    if (filterStatus) filterStatus.value = '';
    
    this.applyFilters();
  }

  /**
   * Update statistics
   */
  updateStats() {
    const total = this.assets.length;
    const available = this.assets.filter(a => a.status === 'Available').length;
    const inUse = this.assets.filter(a => a.status === 'In Use').length;
    const maintenance = this.assets.filter(a => a.status === 'Maintenance').length;

    // Update element text safely
    const updateElementText = (id, text) => {
      const element = document.getElementById(id);
      if (element) element.textContent = text;
    };

    updateElementText('totalAssets', total);
    updateElementText('availableAssets', available);
    updateElementText('inUseAssets', inUse);
    updateElementText('maintenanceAssets', maintenance);
  }

  /**
   * Render current tab content
   */
  renderCurrentTab() {
    // Get data for current tab
    let currentData = [];
    let emptyStateId = '';
    let tableBodyId = '';

    switch (this.currentTab) {
      case 'available':
        currentData = this.filteredData.filter(a => a.status === 'Available');
        emptyStateId = 'availableEmpty';
        tableBodyId = 'availableTableBody';
        break;
      case 'inuse':
        currentData = this.filteredData.filter(a => a.status === 'In Use');
        emptyStateId = 'inuseEmpty';
        tableBodyId = 'inuseTableBody';
        break;
      case 'maintenance':
        currentData = this.filteredData.filter(a => a.status === 'Maintenance');
        emptyStateId = 'maintenanceEmpty';
        tableBodyId = 'maintenanceTableBody';
        break;
    }

    // Update badge counts
    this.updateBadgeCounts();

    // Render table
    this.renderTable(tableBodyId, emptyStateId, currentData);

    // Update showing count
    const showingCountEl = document.getElementById('showingCount');
    const totalCountEl = document.getElementById('totalCount');
    
    if (showingCountEl) showingCountEl.textContent = currentData.length;
    if (totalCountEl) totalCountEl.textContent = this.assets.length;

    // Render pagination
    this.renderPagination();
  }

  /**
   * Update badge counts
   */
  updateBadgeCounts() {
    const availableCount = this.filteredData.filter(a => a.status === 'Available').length;
    const inuseCount = this.filteredData.filter(a => a.status === 'In Use').length;
    const maintenanceCount = this.filteredData.filter(a => a.status === 'Maintenance').length;

    const updateBadge = (id, count) => {
      const badge = document.getElementById(id);
      if (badge) badge.textContent = count;
    };

    updateBadge('availableCount', availableCount);
    updateBadge('inuseCount', inuseCount);
    updateBadge('maintenanceCount', maintenanceCount);
  }

  /**
   * Render table with data
   */
  renderTable(tbodyId, emptyStateId, data) {
    const tbody = document.getElementById(tbodyId);
    const emptyState = document.getElementById(emptyStateId);
    const tableContainer = tbody?.closest('.table-responsive');

    if (!tbody || !emptyState || !tableContainer) return;

    // Show/hide empty state
    if (data.length === 0) {
      tableContainer.classList.add('d-none');
      emptyState.classList.remove('d-none');
      return;
    }

    tableContainer.classList.remove('d-none');
    emptyState.classList.add('d-none');

    // Build table rows
    const fragment = document.createDocumentFragment();
    
    data.forEach((asset, index) => {
      const row = this.createTableRow(asset, index);
      fragment.appendChild(row);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);

    // Attach event listeners to action buttons
    this.attachRowEventListeners(tbody);
  }

  /**
   * Create table row based on current tab
   */
  createTableRow(asset, index) {
    const tr = document.createElement('tr');
    const rowNumber = (this.currentPage - 1) * this.pageSize + index + 1;

    let rowContent = '';

    switch (this.currentTab) {
      case 'available':
        rowContent = `
          <td>${rowNumber}</td>
          <td><strong>${this.escapeHtml(asset.assetName || 'N/A')}</strong></td>
          <td><code>${this.escapeHtml(asset.assetCode || 'N/A')}</code></td>
          <td><span class="badge bg-info">${this.escapeHtml(asset.categoryName || 'N/A')}</span></td>
          <td>${this.formatDate(asset.purchaseDate)}</td>
          <td>${this.formatCurrency(asset.purchasePrice)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${asset.assetId}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${asset.assetId}" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        break;

      case 'inuse':
        rowContent = `
          <td>${rowNumber}</td>
          <td><strong>${this.escapeHtml(asset.assetName || 'N/A')}</strong></td>
          <td><code>${this.escapeHtml(asset.assetCode || 'N/A')}</code></td>
          <td><span class="badge bg-info">${this.escapeHtml(asset.categoryName || 'N/A')}</span></td>
          <td>${this.escapeHtml(asset.currentHolderName || 'N/A')}</td>
          <td>${this.formatDate(asset.assignedDate)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${asset.assetId}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${asset.assetId}" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        break;

      case 'maintenance':
        rowContent = `
          <td>${rowNumber}</td>
          <td><strong>${this.escapeHtml(asset.assetName || 'N/A')}</strong></td>
          <td><code>${this.escapeHtml(asset.assetCode || 'N/A')}</code></td>
          <td><span class="badge bg-info">${this.escapeHtml(asset.categoryName || 'N/A')}</span></td>
          <td>${this.escapeHtml(asset.condition || 'N/A')}</td>
          <td>${this.formatDate(asset.maintenanceDate)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${asset.assetId}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${asset.assetId}" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        break;
    }

    tr.innerHTML = rowContent;
    return tr;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === '') return 'N/A';
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  }

  /**
   * Attach event listeners to table row buttons
   */
  attachRowEventListeners(tbody) {
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.handleEdit(id);
      });
    });

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        await this.handleDelete(id);
      });
    });
  }

  /**
   * Render pagination
   */
  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination || this.totalPages <= 1) {
      if (pagination) pagination.innerHTML = '';
      return;
    }

    let html = '';

    // Previous button
    html += `
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="prev">
          <i class="fas fa-chevron-left"></i>
        </a>
      </li>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Next button
    html += `
      <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="next">
          <i class="fas fa-chevron-right"></i>
        </a>
      </li>
    `;

    pagination.innerHTML = html;

    // Attach pagination event listeners
    this.attachPaginationListeners(pagination);
  }

  /**
   * Attach pagination listeners
   */
  attachPaginationListeners(pagination) {
    pagination.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const pageAction = e.currentTarget.dataset.page;
        let newPage = this.currentPage;

        if (pageAction === 'prev') {
          newPage = this.currentPage - 1;
        } else if (pageAction === 'next') {
          newPage = this.currentPage + 1;
        } else {
          newPage = parseInt(pageAction);
        }

        if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.currentPage) {
          this.currentPage = newPage;
          await this.loadFromAPI();
          this.renderCurrentTab();
        }
      });
    });
  }

  /**
   * Handle add button click
   */
  handleAdd() {
    console.log('➕ Navigating to assetscreate');
    
    // Clear any existing session storage
    sessionStorage.removeItem('crudId');
    sessionStorage.removeItem('crudMode');
    
    this.navigateTo('assetscreate');
  }

  /**
   * Handle edit button click
   */
  handleEdit(id) {
    console.log(`✏️ Navigating to assetsupdate for ID: ${id}`);
    
    sessionStorage.setItem('crudId', id.toString());
    sessionStorage.setItem('crudMode', 'update');
    
    this.navigateTo('assetsupdate');
  }

  /**
   * Handle delete button click
   */
  async handleDelete(id) {
    const asset = this.assets.find(a => a.assetId === id);
    if (!asset) return;

    const result = await confirmModal.show({
      type: 'danger',
      title: 'Delete Asset',
      message: `Are you sure you want to delete "${asset.assetName}"? This action cannot be undone.`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okClass: 'btn-danger',
    });

    if (result) {
      try {
        await WhitebirdAPI.asset.deleteAsset(id);
        
        // Reload data
        await this.loadFromAPI();
        this.updateStats();
        this.renderCurrentTab();
        
        this.showNotification('Asset deleted successfully', 'success');
      } catch (error) {
        console.error('❌ Failed to delete asset:', error);
        this.showNotification('Failed to delete asset', 'danger');
      }
    }
  }

  /**
   * Navigate helper
   */
  navigateTo(page) {
    if (window.router) {
      window.router.navigate(page);
    } else {
      window.location.href = `/${page}`;
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Try to use existing notification system
    if (window.showNotification) {
      window.showNotification(type, message);
      return;
    }

    // Fallback to toast if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const toastContainer = document.querySelector('.toast-container');
      if (!toastContainer) {
        // Create toast container if it doesn't exist
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
      }

      const toastId = `toast-${Date.now()}`;
      const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header bg-${type} text-white">
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
          </div>
          <div class="toast-body">${message}</div>
        </div>
      `;

      toastContainer.insertAdjacentHTML('beforeend', toastHtml);
      const toastEl = document.getElementById(toastId);
      const toast = new bootstrap.Toast(toastEl);
      toast.show();

      // Remove toast after it's hidden
      toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
      });
    } else {
      // Fallback to alert
      alert(message);
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showNotification(message, 'danger');
  }

  /**
   * Clean up
   */
  destroy() {
    console.log('🧹 Cleaning up assets menu...');
    
    // Clear timeouts
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    console.log('✅ Assets menu cleaned up');
  }
}

// Export singleton instance
export const assetsMenu = new AssetsMenu();