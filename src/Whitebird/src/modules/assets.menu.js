/**
 * Assets Menu Module
 * Manages asset inventory with tabs for Available, In Use, and Maintenance
 * Connected to Whitebird API
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import { whitebirdAPI } from '../services/api/whitebird-api.service.js';

export class AssetsMenu {
  constructor() {
    this.assets = [];
    this.categories = [];
    this.filteredData = [];
    this.currentTab = 'available';
    this.currentPage = 1;
    this.pageSize = 10;
    this.loading = false;
  }

  /**
   * Initialize assets menu
   */
  async initialize() {
    console.log('📦 Assets Menu Initializing...');
    this.setupEventListeners();
    await this.loadFromAPI();
    await this.loadCategories();
    this.populateCategories();
    this.loadAndRender();
    console.log('✅ Assets Menu Initialized!');
  }

  /**
   * Load assets from API
   */
  async loadFromAPI() {
    try {
      this.loading = true;
      this.showLoading(true);

      console.log('📡 Loading assets from API...');
      const response = await whitebirdAPI.getAssetsGrid({
        page: 1,
        pageSize: 1000, // Get all for now
      });

      if (response && response.success && response.data) {
        this.assets = response.data;
        this.filteredData = [...this.assets];
        console.log(`✅ Loaded ${this.assets.length} assets from API`);
      } else {
        console.warn('⚠️ API returned no data, using fallback');
        this.assets = this.generateSampleAssets();
        this.filteredData = [...this.assets];
      }
    } catch (error) {
      console.error('❌ Failed to load assets from API:', error);
      console.log('📦 Using sample data as fallback');
      this.assets = this.generateSampleAssets();
      this.filteredData = [...this.assets];
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
      const response = await whitebirdAPI.getActiveCategories();

      if (response && response.success && response.data) {
        this.categories = response.data.map((cat) => cat.name || cat);
        console.log(`✅ Loaded ${this.categories.length} categories from API`);
      } else {
        console.warn('⚠️ API returned no categories, using fallback');
        this.categories = ['Computer', 'Furniture', 'Vehicle', 'Equipment', 'Mobile Device'];
      }
    } catch (error) {
      console.error('❌ Failed to load categories from API:', error);
      this.categories = ['Computer', 'Furniture', 'Vehicle', 'Equipment', 'Mobile Device'];
    }
  }

  /**
   * Generate sample assets (fallback)
   */
  generateSampleAssets() {
    const assetNames = {
      Computer: [
        'Dell Laptop XPS 15',
        'MacBook Pro 16"',
        'HP Desktop Workstation',
        'Lenovo ThinkPad',
      ],
      Furniture: ['Office Desk Oak', 'Ergonomic Chair', 'Meeting Table', 'Filing Cabinet'],
      Vehicle: ['Toyota Camry 2023', 'Honda CR-V 2022', 'Ford Transit Van'],
      Equipment: ['Projector Epson', 'Printer Canon', 'Scanner HP', 'Whiteboard'],
      'Mobile Device': ['iPhone 15 Pro', 'Samsung Galaxy S24', 'iPad Pro 12.9"'],
    };

    const statuses = ['Available', 'In Use', 'Maintenance'];
    const employees = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams'];
    const issues = ['Screen broken', 'Battery replacement', 'Software update', 'Hardware check'];

    let assets = [];
    let id = 1;

    Object.keys(assetNames).forEach((category) => {
      assetNames[category].forEach((name) => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const asset = {
          id: id++,
          name: name,
          code: `AST-${String(id).padStart(4, '0')}`,
          category: category,
          status: status,
          purchaseDate: this.randomDate(),
          value: Math.floor(Math.random() * 5000) + 500,
          assignedTo:
            status === 'In Use' ? employees[Math.floor(Math.random() * employees.length)] : null,
          assignedDate: status === 'In Use' ? this.randomDate() : null,
          issue:
            status === 'Maintenance' ? issues[Math.floor(Math.random() * issues.length)] : null,
          maintenanceDate: status === 'Maintenance' ? this.randomDate() : null,
        };
        assets.push(asset);
      });
    });

    return assets;
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
   * Generate random date
   */
  randomDate() {
    const start = new Date(2022, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  }

  /**
   * Populate categories dropdown
   */
  populateCategories() {
    const select = document.getElementById('filterCategory');
    if (!select) return;

    this.categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
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
          // Reload from API
          await this.loadFromAPI();
          await this.loadCategories();
          this.loadAndRender();

          if (window.showNotification) {
            window.showNotification('success', '✅ Assets refreshed successfully from API');
          }
        } catch (error) {
          console.error('❌ Refresh failed:', error);
          if (window.showNotification) {
            window.showNotification('danger', '❌ Failed to refresh assets');
          }
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
   * Load and render
   */
  loadAndRender() {
    this.applyFilters();
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
          (asset.name.toLowerCase().includes(searchQuery) ||
            asset.code.toLowerCase().includes(searchQuery) ||
            asset.category.toLowerCase().includes(searchQuery));
      }

      // Category filter
      if (categoryFilter) {
        match = match && asset.category === categoryFilter;
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
    const total = this.assets.length;
    const available = this.assets.filter((a) => a.status === 'Available').length;
    const inUse = this.assets.filter((a) => a.status === 'In Use').length;
    const maintenance = this.assets.filter((a) => a.status === 'Maintenance').length;

    document.getElementById('totalAssets').textContent = total;
    document.getElementById('availableAssets').textContent = available;
    document.getElementById('inUseAssets').textContent = inUse;
    document.getElementById('maintenanceAssets').textContent = maintenance;
  }

  /**
   * Render current tab
   */
  renderCurrentTab() {
    const available = this.filteredData.filter((a) => a.status === 'Available');
    const inUse = this.filteredData.filter((a) => a.status === 'In Use');
    const maintenance = this.filteredData.filter((a) => a.status === 'Maintenance');

    // Update badge counts
    document.getElementById('availableCount').textContent = available.length;
    document.getElementById('inuseCount').textContent = inUse.length;
    document.getElementById('maintenanceCount').textContent = maintenance.length;

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
    document.getElementById('showingCount').textContent = currentData.length;
    document.getElementById('totalCount').textContent = this.assets.length;
  }

  /**
   * Render table
   */
  renderTable(tbodyId, emptyId, data) {
    const tbody = document.getElementById(tbodyId);
    const emptyState = document.getElementById(emptyId);

    if (!tbody) return;

    // Pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageData = data.slice(start, end);

    // Show/hide empty state
    if (pageData.length === 0) {
      tbody.closest('.table-responsive').classList.add('d-none');
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    } else {
      tbody.closest('.table-responsive').classList.remove('d-none');
      if (emptyState) emptyState.classList.add('d-none');
    }

    // Build rows
    const fragment = document.createDocumentFragment();
    pageData.forEach((asset, index) => {
      const tr = document.createElement('tr');

      if (this.currentTab === 'available') {
        tr.innerHTML = `
                    <td>${start + index + 1}</td>
                    <td><strong>${asset.name}</strong></td>
                    <td><code>${asset.code}</code></td>
                    <td><span class="badge bg-info">${asset.category}</span></td>
                    <td>${asset.purchaseDate}</td>
                    <td>$${asset.value.toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${asset.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${asset.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
      } else if (this.currentTab === 'inuse') {
        tr.innerHTML = `
                    <td>${start + index + 1}</td>
                    <td><strong>${asset.name}</strong></td>
                    <td><code>${asset.code}</code></td>
                    <td><span class="badge bg-info">${asset.category}</span></td>
                    <td>${asset.assignedTo}</td>
                    <td>${asset.assignedDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${asset.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${asset.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
      } else {
        tr.innerHTML = `
                    <td>${start + index + 1}</td>
                    <td><strong>${asset.name}</strong></td>
                    <td><code>${asset.code}</code></td>
                    <td><span class="badge bg-info">${asset.category}</span></td>
                    <td>${asset.issue}</td>
                    <td>${asset.maintenanceDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${asset.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${asset.id}">
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
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.handleDelete(id);
      });
    });
  }

  /**
   * Handle add
   */
  /**
   * Handle add
   */
  handleAdd() {
    console.log('➕ Navigating to assetscreate');

    // Use router.navigate for smooth SPA navigation
    if (window.router) {
      window.router.navigate('assetscreate');
    } else {
      window.location.href = '/assetscreate';
    }
  }

  /**
   * Handle edit
   */
  handleEdit(id) {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return;

    console.log(`✏️ Navigating to assetsupdate for ID: ${id}`);

    // Use router.navigate with ID parameter
    if (window.router) {
      window.router.navigate('assetsupdate', { id });
    } else {
      sessionStorage.setItem('crudId', id);
      window.location.href = '/assetsupdate';
    }
  }

  /**
   * Handle delete
   */
  async handleDelete(id) {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return;

    const result = await confirmModal.show({
      type: 'danger',
      title: 'Delete Asset',
      message: `Are you sure you want to delete ${asset.name}? This action cannot be undone.`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okClass: 'btn-danger',
    });

    if (result) {
      this.assets = this.assets.filter((a) => a.id !== id);
      this.applyFilters();
      this.showNotification('success', 'Asset deleted successfully');
    }
  }

  /**
   * Show notification
   */
  showNotification(type, message) {
    if (window.showNotification) {
      window.showNotification(type, message);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }
}

// Export singleton instance
export const assetsMenu = new AssetsMenu();
