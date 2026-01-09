/**
 * Employees Menu Module - Optimized with Grid View
 * Connected to Whitebird API
 */

import WhitebirdAPI from '../services/api/index.js';

export class EmployeesMenu {
  constructor() {
    this.currentTab = 'active';
    this.currentPage = 1;
    this.pageSize = 15;
    this.filteredData = [];
    this.loading = false;
    this.employees = [];
    this.totalItems = 0;
    this.totalPages = 1;
  }

  /**
   * Initialize Employees page
   */
  async initialize() {
    console.log('👥 Employees Menu Initializing...');
    this.setupEventListeners();
    await this.loadEmployees();
    this.renderCurrentTab();
    console.log('✅ Employees Menu Initialized!');
  }

  /**
   * Load employees from API
   */
  async loadEmployees() {
    try {
      this.loading = true;
      console.log('📡 Loading employees from API...');

      const response = await WhitebirdAPI.employee.getEmployeesGrid({
        page: this.currentPage,
        pageSize: 1000, // Load all for filtering
      });

      if (response.isSuccess && response.data) {
        this.employees = response.data;
        this.totalItems = response.totalCount || this.employees.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        console.log(`✅ Loaded ${this.employees.length} employees from API`);
      } else {
        console.warn('⚠️ API returned no data');
        this.employees = [];
      }
    } catch (error) {
      console.error('❌ Failed to load employees from API:', error);
      this.employees = [];
    } finally {
      this.loading = false;
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
      refreshBtn.addEventListener('click', async () => {
        console.log('🔄 Refreshing employees from API...');
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';
        refreshBtn.disabled = true;

        try {
          await this.loadEmployees();
          this.applyFilters();
          this.showNotification('success', '✅ Employees refreshed successfully');
        } catch (error) {
          console.error('❌ Refresh failed:', error);
          this.showNotification('danger', '❌ Failed to refresh employees');
        } finally {
          refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh';
          refreshBtn.disabled = false;
        }
      });
    }

    // Search
    const searchInput = document.getElementById('searchEmployee');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.applyFilters();
        }, 300);
      });
    }

    // Filters
    const filterDept = document.getElementById('filterDepartment');
    const filterStatus = document.getElementById('filterStatus');

    if (filterDept) {
      filterDept.addEventListener('change', () => this.applyFilters());
    }

    if (filterStatus) {
      filterStatus.addEventListener('change', () => this.applyFilters());
    }

    // Reset Filters
    const btnReset = document.getElementById('btnResetFilters');
    if (btnReset) {
      btnReset.addEventListener('click', () => this.resetFilters());
    }

    // Tab switching
    const activeTab = document.getElementById('active-tab');
    const inactiveTab = document.getElementById('inactive-tab');

    if (activeTab) {
      activeTab.addEventListener('shown.bs.tab', () => {
        this.currentTab = 'active';
        this.currentPage = 1;
        this.renderCurrentTab();
      });
    }

    if (inactiveTab) {
      inactiveTab.addEventListener('shown.bs.tab', () => {
        this.currentTab = 'inactive';
        this.currentPage = 1;
        this.renderCurrentTab();
      });
    }
  }

  /**
   * Apply filters
   */
  applyFilters() {
    const search = document.getElementById('searchEmployee')?.value.toLowerCase() || '';
    const department = document.getElementById('filterDepartment')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';

    this.filteredData = this.employees.filter((emp) => {
      let match = true;

      // Filter by active/inactive tab
      if (this.currentTab === 'active') {
        match = match && emp.isActive === true;
      } else {
        match = match && emp.isActive === false;
      }

      // Filter by search
      if (search) {
        match =
          match &&
          (emp.fullName?.toLowerCase().includes(search) ||
            emp.email?.toLowerCase().includes(search) ||
            emp.position?.toLowerCase().includes(search) ||
            emp.employeeCode?.toLowerCase().includes(search));
      }

      // Filter by department
      if (department) {
        match = match && emp.department === department;
      }

      // Filter by status (if implemented)
      if (statusFilter && emp.status) {
        match = match && emp.status === statusFilter;
      }

      return match;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.renderCurrentTab();
  }

  /**
   * Reset filters
   */
  resetFilters() {
    document.getElementById('searchEmployee').value = '';
    document.getElementById('filterDepartment').value = '';
    document.getElementById('filterStatus').value = '';
    this.applyFilters();
  }

  /**
   * Render current tab
   */
  renderCurrentTab() {
    // Update counts
    const activeCount = this.employees.filter((emp) => emp.isActive).length;
    const inactiveCount = this.employees.filter((emp) => !emp.isActive).length;

    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('inactiveCount').textContent = inactiveCount;

    // Render table
    if (this.currentTab === 'active') {
      this.renderTable('activeTableBody', 'activeEmpty', this.filteredData.filter(emp => emp.isActive));
    } else {
      this.renderTable('inactiveTableBody', 'inactiveEmpty', this.filteredData.filter(emp => !emp.isActive));
    }

    this.updateCounts();
  }

  /**
   * Render table
   */
  renderTable(tbodyId, emptyId, data) {
    const tbody = document.getElementById(tbodyId);
    const emptyState = document.getElementById(emptyId);

    if (!tbody) return;

    // Show/hide empty state
    if (data.length === 0) {
      emptyState?.classList.remove('d-none');
      tbody.parentElement.parentElement?.classList.add('d-none');
      return;
    } else {
      emptyState?.classList.add('d-none');
      tbody.parentElement.parentElement?.classList.remove('d-none');
    }

    // Pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageData = data.slice(start, end);

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    pageData.forEach((emp, index) => {
      if (!emp || !emp.fullName) return;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${start + index + 1}</td>
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
      fragment.appendChild(tr);
    });

    // Clear and append (single DOM operation)
    tbody.innerHTML = '';
    tbody.appendChild(fragment);

    // Attach event listeners
    this.attachRowEventListeners(tbody);

    // Render pagination
    this.renderPagination(data.length);
  }

  /**
   * Attach row event listeners
   */
  attachRowEventListeners(tbody) {
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
   * Render pagination
   */
  renderPagination(totalItems) {
    const pagination = document.getElementById('employeesPagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalItems / this.pageSize);

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
    const currentData = this.currentTab === 'active' 
      ? this.filteredData.filter(emp => emp.isActive)
      : this.filteredData.filter(emp => !emp.isActive);
    
    const totalPages = Math.ceil(currentData.length / this.pageSize);

    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    this.renderCurrentTab();
  }

  /**
   * Update counts
   */
  updateCounts() {
    const currentData = this.currentTab === 'active' 
      ? this.filteredData.filter(emp => emp.isActive)
      : this.filteredData.filter(emp => !emp.isActive);
    
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, currentData.length);

    document.getElementById('showingEmployees').textContent = currentData.length > 0 ? `${start}-${end}` : '0';
    document.getElementById('totalFilteredEmployees').textContent = currentData.length;
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
    const employee = this.employees.find((e) => e.employeeId === id);
    if (!employee) return;

    const confirmed = confirm(
      `Delete employee "${employee.fullName}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      try {
        await WhitebirdAPI.employee.deleteEmployee(id);
        await this.loadEmployees();
        this.applyFilters();
        this.showNotification('success', 'Employee deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete employee:', error);
        this.showNotification('danger', 'Failed to delete employee');
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

// Export singleton
export const employeesMenu = new EmployeesMenu();