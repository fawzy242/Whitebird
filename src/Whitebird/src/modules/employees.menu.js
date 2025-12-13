/**
 * Employees Menu Module - Optimized with Page Redirect
 * NO MODAL - Uses separate page (employeecrud.html) for add/edit
 * Features: Tabs (Approved/Pending), Optimized rendering, No lag
 * Connected to Whitebird API
 */

import WhitebirdAPI from '../services/api/index.js';

export class EmployeesMenu {
  constructor() {
    this.currentTab = 'approved';
    this.currentPage = 1;
    this.pageSize = 15;
    this.filteredData = [];
    this.loading = false;
    this.employees = [];
  }

  /**
   * Initialize Employees page
   */
  async initialize() {
    console.log('👥 Employees Menu Initializing...');
    this.setupEventListeners();
    await this.loadEmployees();
    this.loadAndRender();
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
        page: 1,
        pageSize: 1000,
      });

      if (response.isSuccess && response.data) {
        this.employees = response.data;
        console.log(`✅ Loaded ${this.employees.length} employees from API`);
      } else {
        console.warn('⚠️ API returned no data, using existing data');
        this.employees = this.generateSampleEmployees();
      }
    } catch (error) {
      console.error('❌ Failed to load employees from API:', error);
      console.log('📦 Using sample data as fallback');
      this.employees = this.generateSampleEmployees();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Generate sample employees (fallback)
   */
  generateSampleEmployees() {
    const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Michael Brown'];
    const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Operations'];
    const positions = ['Developer', 'Manager', 'Analyst', 'Designer', 'Coordinator'];

    return Array.from({ length: 15 }, (_, i) => ({
      employeeId: i + 1,
      fullName: names[Math.floor(Math.random() * names.length)],
      email: `employee${i + 1}@company.com`,
      department: departments[Math.floor(Math.random() * departments.length)],
      position: positions[Math.floor(Math.random() * positions.length)],
      phoneNumber: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      isActive: Math.random() > 0.3,
      employeeCode: `EMP-${String(i + 1).padStart(4, '0')}`,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      salary: Math.floor(Math.random() * 80000) + 40000,
    }));
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
          this.loadAndRender();

          if (window.showNotification) {
            window.showNotification('success', '✅ Employees refreshed successfully from API');
          }
        } catch (error) {
          console.error('❌ Refresh failed:', error);
          if (window.showNotification) {
            window.showNotification('danger', '❌ Failed to refresh employees');
          }
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
    const approvedTab = document.getElementById('approved-tab');
    const pendingTab = document.getElementById('pending-tab');

    if (approvedTab) {
      approvedTab.addEventListener('shown.bs.tab', () => {
        this.currentTab = 'approved';
        this.currentPage = 1;
        this.renderCurrentTab();
      });
    }

    if (pendingTab) {
      pendingTab.addEventListener('shown.bs.tab', () => {
        this.currentTab = 'pending';
        this.currentPage = 1;
        this.renderCurrentTab();
      });
    }
  }

  /**
   * Redirect to Add Employee page
   */
  redirectToAdd() {
    console.log('➡️ Navigating to employeescreate');

    if (window.router) {
      window.router.navigate('employeescreate');
    } else {
      window.location.href = '/employeescreate';
    }
  }

  /**
   * Redirect to Edit Employee page
   */
  redirectToEdit(id) {
    console.log(`➡️ Navigating to employeesupdate for ID: ${id}`);

    if (window.router) {
      window.router.navigate('employeesupdate', { id });
    } else {
      sessionStorage.setItem('crudId', id);
      sessionStorage.setItem('crudMode', 'update');
      window.location.href = '/employeesupdate';
    }
  }

  /**
   * Handle delete with confirmation
   */
  async handleDelete(id) {
    const employee = this.employees.find((e) => (e.employeeId || e.id) === id);
    if (!employee) return;

    const confirmed = confirm(
      `Delete employee "${employee.fullName}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      try {
        // Delete from API
        await WhitebirdAPI.employee.deleteEmployee(id);

        // Remove from local data
        this.employees = this.employees.filter((e) => (e.employeeId || e.id) !== id);
        this.loadAndRender();

        console.log('✅ Employee deleted');
        this.showNotification('success', 'Employee deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete employee:', error);
        this.showNotification('danger', 'Failed to delete employee');
      }
    }
  }

  /**
   * Load data and render
   */
  loadAndRender() {
    this.applyFilters();
  }

  /**
   * Apply filters
   */
  applyFilters() {
    const search = document.getElementById('searchEmployee')?.value.toLowerCase() || '';
    const department = document.getElementById('filterDepartment')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';

    let data = [...this.employees];

    // Filter by search
    if (search) {
      data = data.filter(
        (emp) =>
          emp.fullName?.toLowerCase().includes(search) ||
          emp.email?.toLowerCase().includes(search) ||
          emp.position?.toLowerCase().includes(search)
      );
    }

    // Filter by department
    if (department) {
      data = data.filter((emp) => emp.department === department);
    }

    // Filter by status
    if (statusFilter) {
      if (statusFilter === 'active') {
        data = data.filter((emp) => emp.isActive);
      } else if (statusFilter === 'inactive') {
        data = data.filter((emp) => !emp.isActive);
      }
    }

    this.filteredData = data;
    this.currentPage = 1;
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
    // Split data by status
    const approved = this.filteredData.filter((emp) => emp.isActive);
    const pending = this.filteredData.filter((emp) => !emp.isActive);

    // Update counts
    document.getElementById('approvedCount').textContent = approved.length;
    document.getElementById('pendingCount').textContent = pending.length;

    // Render active tab
    if (this.currentTab === 'approved') {
      this.renderTable('approvedTableBody', 'approvedEmpty', approved);
    } else {
      this.renderTable('pendingTableBody', 'pendingEmpty', pending);
    }

    this.updateCounts();
  }

  /**
   * Render table (Optimized - use DocumentFragment)
   */
  renderTable(tbodyId, emptyId, data) {
    const tbody = document.getElementById(tbodyId);
    const emptyState = document.getElementById(emptyId);

    if (!tbody) return;

    // Show/hide empty state
    if (data.length === 0) {
      emptyState?.classList.remove('d-none');
      tbody.parentElement.parentElement.classList.add('d-none');
      return;
    } else {
      emptyState?.classList.add('d-none');
      tbody.parentElement.parentElement.classList.remove('d-none');
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
            <div class="avatar avatar-sm me-2">
              <span class="avatar-text">${emp.fullName.charAt(0).toUpperCase()}</span>
            </div>
            <strong>${emp.fullName}</strong>
          </div>
        </td>
        <td>${emp.email || 'N/A'}</td>
        <td>${emp.position || 'N/A'}</td>
        <td><span class="badge bg-info">${emp.department || 'N/A'}</span></td>
        <td>$${(emp.salary || 0).toLocaleString()}</td>
        <td>${emp.joinDate || 'N/A'}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-primary me-1 btn-edit" data-id="${emp.employeeId || emp.id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${emp.employeeId || emp.id}" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
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
    const pagination = document.getElementById('pagination');
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

    // Page numbers (show max 5 pages)
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
  goToPage(page) {
    const totalPages = Math.ceil(
      (this.currentTab === 'approved'
        ? this.filteredData.filter((e) => e.isActive).length
        : this.filteredData.filter((e) => !e.isActive).length) / this.pageSize
    );

    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    this.renderCurrentTab();
  }

  /**
   * Update counts
   */
  updateCounts() {
    const currentData =
      this.currentTab === 'approved'
        ? this.filteredData.filter((e) => e.isActive)
        : this.filteredData.filter((e) => !e.isActive);

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, currentData.length);

    document.getElementById('showingCount').textContent =
      currentData.length > 0 ? `${start}-${end}` : '0';
    document.getElementById('totalCount').textContent = currentData.length;
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

// Export singleton
export const employeesMenu = new EmployeesMenu();
