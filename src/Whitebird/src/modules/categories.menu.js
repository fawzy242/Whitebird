/**
 * Categories Menu Module - Optimized
 * Connected to Whitebird API
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import WhitebirdAPI from '../services/api/index.js';

export class CategoriesMenu {
  constructor() {
    this.categories = [];
    this.filteredData = [];
    this.currentPage = 1;
    this.pageSize = 100;
    this.totalItems = 0;
    this.loading = false;
  }

  async initialize() {
    console.log('🏷️ Categories Menu Initializing...');
    this.setupEventListeners();
    await this.loadFromAPI();
    this.render();
    this.renderChart();
    console.log('✅ Categories Menu Initialized!');
  }

  /**
   * Load categories from API
   */
  async loadFromAPI() {
    try {
      this.loading = true;
      console.log('📡 Loading categories from API...');

      const response = await WhitebirdAPI.category.getCategories();

      if (response.isSuccess && response.data) {
        this.categories = response.data;
        this.totalItems = this.categories.length;
        this.filteredData = [...this.categories];
        console.log(`✅ Loaded ${this.categories.length} categories from API`);
      } else {
        console.warn('⚠️ API returned no data');
        this.categories = [];
        this.filteredData = [];
      }
    } catch (error) {
      console.error('❌ Failed to load categories from API:', error);
      this.categories = [];
      this.filteredData = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const addBtn = document.getElementById('btnAddCategory');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.handleAdd());
    }

    // Refresh button
    const refreshBtn = document.getElementById('btnRefreshCategories');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        console.log('🔄 Refreshing categories from API...');
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';
        refreshBtn.disabled = true;

        try {
          await this.loadFromAPI();
          this.render();
          this.renderChart();
          this.showNotification('success', '✅ Categories refreshed successfully');
        } catch (error) {
          console.error('❌ Refresh failed:', error);
          this.showNotification('danger', '❌ Failed to refresh categories');
        } finally {
          refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh';
          refreshBtn.disabled = false;
        }
      });
    }

    // Search functionality
    const searchInput = document.getElementById('searchCategory');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.applyFilters();
        }, 300);
      });
    }

    // Status filter
    const statusFilter = document.getElementById('filterCategoryStatus');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.applyFilters());
    }
  }

  /**
   * Apply filters
   */
  applyFilters() {
    const searchQuery = document.getElementById('searchCategory')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterCategoryStatus')?.value || '';

    this.filteredData = this.categories.filter((cat) => {
      let match = true;

      // Search filter
      if (searchQuery) {
        match =
          match &&
          (cat.categoryName?.toLowerCase().includes(searchQuery) ||
            cat.description?.toLowerCase().includes(searchQuery));
      }

      // Status filter
      if (statusFilter === 'active') {
        match = match && cat.isActive === true;
      } else if (statusFilter === 'inactive') {
        match = match && cat.isActive === false;
      }

      return match;
    });

    this.currentPage = 1;
    this.render();
  }

  /**
   * Render categories table
   */
  render() {
    const tbody = document.getElementById('categoriesTableBody');
    const emptyState = document.getElementById('categoriesEmpty');
    if (!tbody) return;

    // Pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageData = this.filteredData.slice(start, end);

    // Show/hide empty state
    if (pageData.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      this.renderPagination();
      return;
    } else {
      if (emptyState) emptyState.classList.add('d-none');
    }

    // Build rows
    const fragment = document.createDocumentFragment();
    pageData.forEach((cat, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${start + index + 1}</td>
        <td><strong>${cat.categoryName || 'N/A'}</strong></td>
        <td>${cat.description || 'No description'}</td>
        <td>
          <span class="badge ${cat.isActive ? 'bg-success' : 'bg-secondary'}">
            ${cat.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary btn-edit" 
                    data-id="${cat.categoryId}" 
                    title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-outline-danger btn-delete" 
                    data-id="${cat.categoryId}" 
                    title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);

    // Attach event listeners
    this.attachRowEventListeners(tbody);

    // Update total count
    document.getElementById('totalCategories').textContent = this.categories.length;

    // Render pagination
    this.renderPagination();

    // Update showing count
    this.updateShowingCount();
  }

  /**
   * Render pagination
   */
  renderPagination() {
    const pagination = document.getElementById('categoriesPagination');
    if (!pagination) return;

    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);

    if (totalPages <= 1) {
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
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

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
      <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage + 1}">
          <i class="fas fa-chevron-right"></i>
        </a>
      </li>
    `;

    pagination.innerHTML = html;

    // Attach pagination listeners
    this.attachPaginationListeners(pagination);
  }

  /**
   * Update showing count
   */
  updateShowingCount() {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredData.length);
    
    const showingEl = document.getElementById('showingCategories');
    const totalEl = document.getElementById('totalFilteredCategories');
    
    if (showingEl) showingEl.textContent = `${start}-${end}`;
    if (totalEl) totalEl.textContent = this.filteredData.length;
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
  goToPage(page) {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    if (page < 1 || page > totalPages) return;
    
    this.currentPage = page;
    this.render();
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
   * Render chart
   */
  renderChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas || typeof Chart === 'undefined') {
      return;
    }

    // Destroy existing chart if it exists
    if (window.categoryChartInstance) {
      window.categoryChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    
    // Prepare data for chart
    const categories = this.categories.slice(0, 5); // Show top 5
    const labels = categories.map((c) => c.categoryName || 'Unknown');
    const data = categories.map((c) => c.items || 5); // Fallback if no items count
    
    // Color palette
    const colors = ['#dc2626', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

    window.categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 1,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed + ' items';
                return label;
              }
            }
          }
        },
      },
    });
  }

  /**
   * Handle add category
   */
  async handleAdd() {
    console.log('➕ Navigating to categoriescreate');
    this.navigateTo('categoriescreate');
  }

  /**
   * Handle edit category
   */
  async handleEdit(id) {
    const category = this.categories.find((c) => c.categoryId === id);
    if (!category) return;

    console.log(`✏️ Navigating to categoriesupdate for ID: ${id}`);
    sessionStorage.setItem('crudId', id);
    sessionStorage.setItem('crudMode', 'update');
    this.navigateTo('categoriesupdate');
  }

  /**
   * Handle delete category
   */
  async handleDelete(id) {
    const category = this.categories.find((c) => c.categoryId === id);
    if (!category) return;

    const result = await confirmModal.show({
      type: 'danger',
      title: 'Delete Category',
      message: `Delete "${category.categoryName}"? This cannot be undone.`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okClass: 'btn-danger',
    });

    if (result) {
      try {
        await WhitebirdAPI.category.deleteCategory(id);
        await this.loadFromAPI();
        this.render();
        this.renderChart();
        this.showNotification('success', 'Category deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete category:', error);
        this.showNotification('danger', 'Failed to delete category');
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
}

// Create instance
const categoriesMenuInstance = new CategoriesMenu();

// Export for module usage
export const categoriesMenu = categoriesMenuInstance;

// Expose to window for onclick handlers
if (typeof window !== 'undefined') {
  window.categoriesMenuInstance = categoriesMenuInstance;
}