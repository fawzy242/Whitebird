/**
 * Employees Menu Module - Optimized with Server-Side Grid
 * Connected to Whitebird API - REFACTORED VERSION
 */

import WhitebirdAPI from '../services/api/index.js';

export class EmployeesMenu {
  constructor() {
    this.currentTab = 'active';
    this.currentPage = 1;
    this.pageSize = 100;
    this.filteredData = [];
    this.loading = false;
    this.totalItems = 0;
    this.totalPages = 1;
    this.searchTerm = '';
    this.departmentFilter = '';
    this.statusFilter = '';
  }

  /**
   * Initialize Employees page
   */
  async initialize() {
    console.log('👥 Employees Menu Initializing...');
    this.setupEventListeners();
    await this.loadEmployees();
    console.log('✅ Employees Menu Initialized!');
  }

  /**
   * Load employees from API with pagination and filters
   */
  async loadEmployees() {
    try {
      this.loading = true;
      this.showLoading(true);
      
      // Build query params
      const params = {
        page: this.currentPage,
        pageSize: this.pageSize
      };

      // Add search filter
      if (this.searchTerm && this.searchTerm.trim()) {
        params.search = this.searchTerm.trim();
      }

      // Add department filter
      if (this.departmentFilter) {
        // Note: API mungkin tidak support department filter di endpoint grid
        // Jika tidak, kita filter di client setelah data diterima
      }

      console.log('📡 Loading employees with params:', params);

      const response = await WhitebirdAPI.employee.getEmployeesGrid(params);

      if (response.isSuccess) {
        // Handle response data based on API structure
        if (response.data && Array.isArray(response.data)) {
          this.filteredData = response.data;
          this.totalItems = response.totalCount || response.data.length;
          this.totalPages = response.totalPages || 
            Math.ceil(this.totalItems / this.pageSize);
          
          console.log(`✅ Loaded ${this.filteredData.length} employees`);
          console.log(`📊 Total: ${this.totalItems}, Pages: ${this.totalPages}`);
        } else {
          console.warn('⚠️ API returned invalid data structure:', response);
          this.filteredData = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }
        
        this.renderTable();
        this.renderPagination();
        this.updateCounts();
        
        // Update tab counts from separate API call for accuracy
        await this.updateTabCounts();
      } else {
        console.error('❌ API Error:', response.message);
        this.showError('Failed to load employees: ' + response.message);
        this.filteredData = [];
      }
    } catch (error) {
      console.error('❌ Failed to load employees:', error);
      this.showError('Network error. Please check your connection.');
      this.filteredData = [];
    } finally {
      this.loading = false;
      this.showLoading(false);
    }
  }

  /**
   * Update tab counts from API
   */
  async updateTabCounts() {
    try {
      // Load active employees count
      const activeResponse = await WhitebirdAPI.employee.getActiveEmployees();
      if (activeResponse.isSuccess && activeResponse.data) {
        const activeCount = activeResponse.data.length || 0;
        document.getElementById('activeCount').textContent = activeCount;
      }

      // Load all employees for inactive count
      const allResponse = await WhitebirdAPI.employee.getEmployees();
      if (allResponse.isSuccess && allResponse.data) {
        const totalCount = allResponse.data.length || 0;
        const activeCount = parseInt(document.getElementById('activeCount').textContent) || 0;
        const inactiveCount = totalCount - activeCount;
        document.getElementById('inactiveCount').textContent = inactiveCount > 0 ? inactiveCount : 0;
      }
    } catch (error) {
      console.warn('⚠️ Failed to update tab counts:', error);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Add Employee
    const btnAdd = document.getElementById('btnAddEmployee');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this.redirectToAdd());
    }

    // Refresh button
    const refreshBtn = document.getElementById('btnRefreshEmployees');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.handleRefresh());
    }

    // Search with debounce
    const searchInput = document.getElementById('searchEmployee');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchTerm = e.target.value;
          this.currentPage = 1; // Reset to first page when searching
          this.loadEmployees();
        }, 500);
      });
    }

    // Department filter
    const filterDept = document.getElementById('filterDepartment');
    if (filterDept) {
      filterDept.addEventListener('change', (e) => {
        this.departmentFilter = e.target.value;
        this.currentPage = 1;
        // If API supports department filter, use it. Otherwise filter client-side
        this.loadEmployees();
      });
    }

    // Status filter
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.currentPage = 1;
        // Status filtering will be done client-side based on tab
        this.applyClientSideFilters();
      });
    }

    // Reset Filters
    const btnReset = document.getElementById('btnResetFilters');
    if (btnReset) {
      btnReset.addEventListener('click', () => this.resetFilters());
    }

    // Tab switching - IMPORTANT: Now using Bootstrap tab events
    const activeTab = document.querySelector('#active-tab');
    const inactiveTab = document.querySelector('#inactive-tab');

    if (activeTab) {
      activeTab.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentTab = 'active';
        this.currentPage = 1;
        this.applyClientSideFilters();
      });
    }

    if (inactiveTab) {
      inactiveTab.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentTab = 'inactive';
        this.currentPage = 1;
        this.applyClientSideFilters();
      });
    }

    // Initialize Bootstrap tabs if available
    if (typeof bootstrap !== 'undefined') {
      const tabEl = document.querySelector('#employeeTabs');
      if (tabEl) {
        const tab = new bootstrap.Tab(tabEl);
        tabEl.addEventListener('shown.bs.tab', (event) => {
          const target = event.target.getAttribute('data-bs-target');
          if (target === '#active-pane') {
            this.currentTab = 'active';
          } else if (target === '#inactive-pane') {
            this.currentTab = 'inactive';
          }
          this.currentPage = 1;
          this.applyClientSideFilters();
        });
      }
    }
  }

  /**
   * Apply client-side filters (for status and department if API doesn't support)
   */
  applyClientSideFilters() {
    // Note: This should be called after data is loaded from API
    // For now, we'll reload from API and filter client-side
    this.loadEmployees();
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    document.getElementById('searchEmployee').value = '';
    document.getElementById('filterDepartment').value = '';
    document.getElementById('filterStatus').value = '';
    
    this.searchTerm = '';
    this.departmentFilter = '';
    this.statusFilter = '';
    this.currentPage = 1;
    
    this.loadEmployees();
  }

  /**
   * Handle refresh
   */
  async handleRefresh() {
    const refreshBtn = document.getElementById('btnRefreshEmployees');
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';
      refreshBtn.disabled = true;
    }

    try {
      await this.loadEmployees();
      this.showNotification('success', '✅ Employees refreshed successfully');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
      this.showNotification('danger', '❌ Failed to refresh employees');
    } finally {
      if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh';
        refreshBtn.disabled = false;
      }
    }
  }

  /**
   * Render table based on current tab
   */
  renderTable() {
    // Determine which table body to render to
    const tbodyId = this.currentTab === 'active' ? 'activeTableBody' : 'inactiveTableBody';
    const emptyId = this.currentTab === 'active' ? 'activeEmpty' : 'inactiveEmpty';
    const tableContainerId = this.currentTab === 'active' ? 'activeTableContainer' : 'inactiveTableContainer';
    
    const tbody = document.getElementById(tbodyId);
    const emptyState = document.getElementById(emptyId);
    const tableContainer = document.querySelector(`#${this.currentTab === 'active' ? 'active-pane' : 'inactive-pane'} .table-responsive`);

    if (!tbody) return;

    // Show/hide empty state
    if (this.filteredData.length === 0) {
      if (emptyState) emptyState.classList.remove('d-none');
      if (tableContainer) tableContainer.classList.add('d-none');
      return;
    } else {
      if (emptyState) emptyState.classList.add('d-none');
      if (tableContainer) tableContainer.classList.remove('d-none');
    }

    // Filter data based on current tab
    let displayData = this.filteredData;
    
    // Apply tab filter (active/inactive)
    if (this.currentTab === 'active') {
      displayData = displayData.filter(emp => emp.isActive === true);
    } else {
      displayData = displayData.filter(emp => emp.isActive === false);
    }
    
    // Apply client-side department filter if needed
    if (this.departmentFilter && this.departmentFilter !== '') {
      displayData = displayData.filter(emp => emp.department === this.departmentFilter);
    }

    // Apply client-side status filter if needed
    if (this.statusFilter && this.statusFilter !== '') {
      if (this.statusFilter === 'active') {
        displayData = displayData.filter(emp => emp.isActive === true);
      } else if (this.statusFilter === 'inactive') {
        displayData = displayData.filter(emp => emp.isActive === false);
      }
    }

    // Clear table
    tbody.innerHTML = '';

    // Render rows
    displayData.forEach((emp, index) => {
      if (!emp || !emp.fullName) return;

      const row = document.createElement('tr');
      
      // Calculate display number based on pagination
      const displayNumber = (this.currentPage - 1) * this.pageSize + index + 1;
      
      row.innerHTML = `
        <td>${displayNumber}</td>
        <td>
          <div class="d-flex align-items-center">
            <div class="avatar avatar-sm me-2 bg-primary">
              <span class="avatar-text">${emp.fullName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <strong>${emp.fullName}</strong>
              <small class="text-muted d-block">${emp.employeeCode || 'No Code'}</small>
            </div>
          </div>
        </td>
        <td>${emp.email || 'N/A'}</td>
        <td>${emp.position || 'N/A'}</td>
        <td><span class="badge bg-info">${emp.department || 'N/A'}</span></td>
        <td>
          <span class="badge ${emp.isActive ? 'bg-success' : 'bg-secondary'}">
            ${emp.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary btn-edit" 
                    data-id="${emp.employeeId}" 
                    title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-outline-danger btn-delete" 
                    data-id="${emp.employeeId}" 
                    title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      tbody.appendChild(row);
    });

    // Attach event listeners to action buttons
    this.attachRowEventListeners();
  }

  /**
   * Attach event listeners to table rows
   */
  attachRowEventListeners() {
    const tbodyId = this.currentTab === 'active' ? 'activeTableBody' : 'inactiveTableBody';
    const tbody = document.getElementById(tbodyId);
    
    if (!tbody) return;

    tbody.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.redirectToEdit(id);
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
   * Render pagination controls
   */
  renderPagination() {
    const pagination = document.getElementById('employeesPagination');
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

    // Page numbers - show up to 5 pages
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      html += `
        <li class="page-item">
          <a class="page-link" href="#" data-page="1">1</a>
        </li>
        ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
      `;
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      html += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Last page
    if (endPage < this.totalPages) {
      html += `
        ${endPage < this.totalPages - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        <li class="page-item">
          <a class="page-link" href="#" data-page="${this.totalPages}">${this.totalPages}</a>
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
    this.attachPaginationListeners();
  }

  /**
   * Attach pagination event listeners
   */
  attachPaginationListeners() {
    const pagination = document.getElementById('employeesPagination');
    if (!pagination) return;

    pagination.querySelectorAll('.page-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(e.currentTarget.dataset.page);
        if (!isNaN(page) && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
          this.goToPage(page);
        }
      });
    });
  }

  /**
   * Navigate to specific page
   */
  goToPage(page) {
    this.currentPage = page;
    this.loadEmployees();
    
    // Scroll to top of table
    const tableContainer = document.querySelector('.table-responsive');
    if (tableContainer) {
      tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Update display counts
   */
  updateCounts() {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    
    document.getElementById('showingEmployees').textContent = 
      this.totalItems > 0 ? `${start}-${end}` : '0';
    document.getElementById('totalFilteredEmployees').textContent = this.totalItems;
  }

  /**
   * Show loading state
   */
  showLoading(show) {
    const loadingElement = document.getElementById('employeesLoading');
    if (!loadingElement) {
      // Create loading element if it doesn't exist
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'employeesLoading';
      loadingDiv.className = 'text-center py-5';
      loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin fa-2x text-primary"></i><p class="mt-2">Loading employees...</p>';
      
      const contentArea = document.querySelector('#employeesPage .card-body');
      if (contentArea) {
        contentArea.prepend(loadingDiv);
      }
    } else {
      loadingElement.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Redirect to Add Employee page
   */
  redirectToAdd() {
    console.log('➡️ Navigating to employeescreate');
    this.navigateTo('employeescreate');
  }

  /**
   * Redirect to Edit Employee page
   */
  redirectToEdit(id) {
    console.log(`➡️ Navigating to employeesupdate for ID: ${id}`);
    sessionStorage.setItem('crudId', id);
    sessionStorage.setItem('crudMode', 'update');
    this.navigateTo('employeesupdate');
  }

  /**
   * Handle delete with confirmation
   */
  async handleDelete(id) {
    // Find employee data
    const employee = this.filteredData.find(e => e.employeeId === id);
    if (!employee) return;

    const confirmed = confirm(
      `Are you sure you want to delete employee "${employee.fullName}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      try {
        await WhitebirdAPI.employee.deleteEmployee(id);
        
        // Refresh data
        await this.loadEmployees();
        
        this.showNotification('success', '✅ Employee deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete employee:', error);
        this.showNotification('danger', '❌ Failed to delete employee: ' + error.message);
      }
    }
  }

  /**
   * Show notification
   */
  showNotification(type, message) {
    // Try to use existing notification system
    if (window.showNotification) {
      window.showNotification(type, message);
      return;
    }
    
    // Fallback to Bootstrap toast
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const toastContainer = document.querySelector('.toast-container');
      if (!toastContainer) {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1060';
        document.body.appendChild(container);
      }
      
      const toastId = 'notification-' + Date.now();
      const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header bg-${type} text-white">
            <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
          </div>
          <div class="toast-body">${message}</div>
        </div>
      `;
      
      document.querySelector('.toast-container').insertAdjacentHTML('beforeend', toastHtml);
      
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
    console.error('Showing error:', message);
    this.showNotification('danger', message);
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
}

// Export singleton
export const employeesMenu = new EmployeesMenu();