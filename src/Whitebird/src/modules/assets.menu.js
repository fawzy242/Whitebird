/**
 * Assets Menu Module - Optimized
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
  }

  /**
   * Initialize assets menu
   */
  async initialize() {
    console.log('📦 Assets Menu Initializing...');
    this.setupEventListeners();
    await this.loadCategories();
    await this.loadFromAPI();
    this.populateCategories();
    this.updateStats();
    this.renderCurrentTab();
    console.log('✅ Assets Menu Initialized!');
  }

  /**
   * Load assets from API with pagination
   */
  async loadFromAPI() {
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
        this.totalItems = response.totalCount || response.data.length;
        this.totalPages = response.totalPages || Math.ceil(this.totalItems / this.pageSize);
        this.filteredData = [...this.assets];
        console.log(`✅ Loaded ${this.assets.length} assets from API (Total: ${this.totalItems})`);
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

    // Clear and add default option
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
      refreshBtn.addEventListener('click', async () => {
        console.log('🔄 Refreshing assets from API...');
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';
        refreshBtn.disabled = true;

        try {
          await this.loadFromAPI();
          await this.loadCategories();
          this.updateStats();
          this.renderCurrentTab();

          this.showNotification('success', '✅ Assets refreshed successfully');
        } catch (error) {
          console.error('❌ Refresh failed:', error);
          this.showNotification('danger', '❌ Failed to refresh assets');
        } finally {
          refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh';
          refreshBtn.disabled = false;
        }
      });
    }

    // Search
    const searchInput = document.getElementById('searchAssets');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
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

    // Tab switching
    const availableTab = document.getElementById('availableTab');
    const inuseTab = document.getElementById('inuseTab');
    const maintenanceTab = document.getElementById('maintenanceTab');

    if (availableTab) {
      availableTab.addEventListener('shown.bs.tab', () => {
        this.currentTab = 'available';
        this.currentPage = 1;
        this.renderCurrentTab();
      });
    }

    if (inuseTab) {
      inuseTab.addEventListener('shown.bs.tab', () => {
        this.currentTab = 'inuse';
        this.currentPage = 1;
        this.renderCurrentTab();
      });
    }

    if (maintenanceTab) {
      maintenanceTab.addEventListener('shown.bs.tab', () => {
        this.currentTab = 'maintenance';
        this.currentPage = 1;
        this.renderCurrentTab();
      });
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

      // Search
      if (searchQuery) {
        match =
          match &&
          (asset.assetName?.toLowerCase().includes(searchQuery) ||
            asset.assetCode?.toLowerCase().includes(searchQuery) ||
            asset.categoryName?.toLowerCase().includes(searchQuery));
      }

      // Category filter
      if (categoryFilter) {
        match = match && asset.categoryName === categoryFilter;
      }

      // Status filter
      if (statusFilter) {
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
    document.getElementById('searchAssets').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStatus').value = '';
    this.applyFilters();
  }

  /**
   * Update stats
   */
  updateStats() {
    const total = this.totalItems;
    const available = this.assets.filter((a) => a.status === 'Available').length;
    const inUse = this.assets.filter((a) => a.status === 'In Use').length;
    const maintenance = this.assets.filter((a) => a.status === 'Maintenance').length;

    // Safe element updates
    const setTextContent = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setTextContent('totalAssets', total);
    setTextContent('availableAssets', available);
    setTextContent('inUseAssets', inUse);
    setTextContent('maintenanceAssets', maintenance);
  }

  /**
   * Render current tab
   */
  renderCurrentTab() {
    const available = this.filteredData.filter((a) => a.status === 'Available');
    const inUse = this.filteredData.filter((a) => a.status === 'In Use');
    const maintenance = this.filteredData.filter((a) => a.status === 'Maintenance');

    // Update badge counts
    const setBadgeCount = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    setBadgeCount('availableCount', available.length);
    setBadgeCount('inuseCount', inUse.length);
    setBadgeCount('maintenanceCount', maintenance.length);

    // Render appropriate tab
    if (this.currentTab === 'available') {
      this.renderTable('availableTableBody', 'availableEmpty', available);
    } else if (this.currentTab === 'inuse') {
      this.renderTable('inuseTableBody', 'inuseEmpty', inUse);
    } else if (this.currentTab === 'maintenance') {
      this.renderTable('maintenanceTableBody', 'maintenanceEmpty', maintenance);
    }

    // Update showing count
    const currentData =
      this.currentTab === 'available'
        ? available
        : this.currentTab === 'inuse'
          ? inUse
          : maintenance;
    
    setBadgeCount('showingCount', currentData.length);
    setBadgeCount('totalCount', this.totalItems);

    // Render pagination
    this.renderPagination();
  }

  /**
   * Render table with proper columns from API
   */
  renderTable(tbodyId, emptyId, data) {
    const tbody = document.getElementById(tbodyId);
    const emptyState = document.getElementById(emptyId);

    if (!tbody) return;

    // Show/hide empty state
    if (data.length === 0) {
      tbody.closest('.table-responsive')?.classList.add('d-none');
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    } else {
      tbody.closest('.table-responsive')?.classList.remove('d-none');
      if (emptyState) emptyState.classList.add('d-none');
    }

    // Build rows
    const fragment = document.createDocumentFragment();
    data.forEach((asset, index) => {
      const tr = document.createElement('tr');

      // Determine columns based on tab
      if (this.currentTab === 'available') {
        tr.innerHTML = `
          <td>${(this.currentPage - 1) * this.pageSize + index + 1}</td>
          <td><strong>${asset.assetName || 'N/A'}</strong></td>
          <td><code>${asset.assetCode || 'N/A'}</code></td>
          <td><span class="badge bg-info">${asset.categoryName || 'N/A'}</span></td>
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
      } else if (this.currentTab === 'inuse') {
        tr.innerHTML = `
          <td>${(this.currentPage - 1) * this.pageSize + index + 1}</td>
          <td><strong>${asset.assetName || 'N/A'}</strong></td>
          <td><code>${asset.assetCode || 'N/A'}</code></td>
          <td><span class="badge bg-info">${asset.categoryName || 'N/A'}</span></td>
          <td>${asset.currentHolderName || 'N/A'}</td>
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
      } else {
        tr.innerHTML = `
          <td>${(this.currentPage - 1) * this.pageSize + index + 1}</td>
          <td><strong>${asset.assetName || 'N/A'}</strong></td>
          <td><code>${asset.assetCode || 'N/A'}</code></td>
          <td><span class="badge bg-info">${asset.categoryName || 'N/A'}</span></td>
          <td>${asset.condition || 'N/A'}</td>
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
      }

      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);

    // Attach event listeners
    this.attachRowEventListeners(tbody);
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  /**
   * Format currency
   */
formatCurrency(amount) {
    if (!amount && amount !== 0) return 'N/A';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
}

  /**
   * Render pagination
   */
  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    if (this.totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '';

    // Previous button
    html += `
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage - 1}">
          <i class="fas fa-chevron-left"></i>
        </a>
      </li>
    `;

    // Page numbers
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
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
        <a class="page-link" href="#" data-page="${this.currentPage + 1}">
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
    pagination.querySelectorAll('.page-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(e.currentTarget.dataset.page);
        if (!isNaN(page)) {
          this.goToPage(page);
        }
      });
    });
  }

  /**
   * Go to page
   */
  async goToPage(page) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    await this.loadFromAPI();
    this.updateStats();
    this.renderCurrentTab();
  }

  /**
   * Attach row event listeners
   */
  attachRowEventListeners(tbody) {
    tbody.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.handleEdit(id);
      });
    });

    tbody.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        await this.handleDelete(id);
      });
    });
  }

  /**
   * Handle add
   */
  handleAdd() {
    console.log('➕ Navigating to assetscreate');
    this.navigateTo('assetscreate');
  }

  /**
   * Handle edit
   */
  handleEdit(id) {
    console.log(`✏️ Navigating to assetsupdate for ID: ${id}`);
    sessionStorage.setItem('crudId', id);
    sessionStorage.setItem('crudMode', 'update');
    this.navigateTo('assetsupdate');
  }

  /**
   * Handle delete
   */
  async handleDelete(id) {
    const asset = this.assets.find((a) => a.assetId === id);
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
        await this.loadFromAPI();
        this.showNotification('success', 'Asset deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete asset:', error);
        this.showNotification('danger', 'Failed to delete asset');
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
  showNotification(type, message) {
    if (window.showNotification) {
      window.showNotification(type, message);
    } else {
      alert(message);
    }
  }

  /**
   * Show error
   */
  showError(message) {
    console.error('Error:', message);
    this.showNotification('danger', message);
  }
}

// Export singleton instance
export const assetsMenu = new AssetsMenu();