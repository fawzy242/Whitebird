/**
 * Employees Menu Module - Fixed Pagination and Filtering
 */

import WhitebirdAPI from '../services/api/index.js';
import { confirmModal } from '../components/confirm-modal.component.js';

export class EmployeesMenu {
  constructor() {
    this.currentTab = 'active';
    this.currentPage = 1;
    this.pageSize = 10;
    this.filteredData = [];
    this.loading = false;
    this.employees = []; // Data dari API (current page)
    this.allEmployees = []; // Semua data untuk filtering
    this.totalItems = 0;
    this.totalPages = 1;
    this.searchTimeout = null;
    this.isFilterActive = false;
  }

  /**
   * Initialize Employees page
   */
  async initialize() {
    console.log('👥 Employees Menu Initializing...');
    
    try {
      this.setupEventListeners();
      await this.loadAllEmployees(); // Load semua data untuk filtering
      await this.loadCurrentPage(); // Load halaman saat ini
      this.updateDepartmentFilter();
      this.renderCurrentTab();
      console.log('✅ Employees Menu Initialized!');
    } catch (error) {
      console.error('❌ Employees Menu initialization error:', error);
      this.showError('Failed to initialize employees menu');
    }
  }

  /**
   * Load semua employees untuk filtering
   */
  async loadAllEmployees() {
    try {
      console.log('📡 Loading all employees for filtering...');

      // Gunakan pageSize besar untuk mendapatkan semua data
      const response = await WhitebirdAPI.employee.getEmployeesGrid({
        page: 1,
        pageSize: 1000, // Request banyak data sekaligus
      });

      if (response.isSuccess && response.data) {
        this.allEmployees = response.data;
        this.totalItems = response.totalCount || this.allEmployees.length;
        console.log(`✅ Loaded ${this.allEmployees.length} employees for filtering`);
      } else {
        console.warn('No employees data returned');
        this.allEmployees = [];
      }
    } catch (error) {
      console.error('❌ Failed to load all employees:', error);
      this.allEmployees = [];
    }
  }

  /**
   * Load halaman saat ini untuk display
   */
  async loadCurrentPage() {
    if (this.loading) return;

    try {
      this.loading = true;
      console.log(`📡 Loading employees page ${this.currentPage}...`);

      const response = await WhitebirdAPI.employee.getEmployeesGrid({
        page: this.currentPage,
        pageSize: this.pageSize,
      });

      if (response.isSuccess && response.data) {
        this.employees = response.data;
        this.totalPages = response.totalPages || 1;
        
        // Jika tidak ada filter aktif, gunakan data dari API
        if (!this.isFilterActive) {
          this.filteredData = [...this.employees];
        }
        
        console.log(`✅ Loaded page ${this.currentPage}/${this.totalPages} (${this.employees.length} employees)`);
      } else {
        console.warn('No employees data returned');
        this.employees = [];
      }
    } catch (error) {
      console.error('❌ Failed to load current page:', error);
      this.employees = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Update department filter dropdown dengan unique departments
   */
  updateDepartmentFilter() {
    const filterDept = document.getElementById('filterDepartment');
    if (!filterDept) return;

    // Gunakan allEmployees untuk departments
    const departments = [...new Set(this.allEmployees
      .map(emp => emp.department)
      .filter(dept => dept && dept.trim() !== '')
    )].sort();

    // Clear existing options except first
    filterDept.innerHTML = '<option value="">All Departments</option>';

    // Add department options
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = dept;
      filterDept.appendChild(option);
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Add Employee button
    const addBtn = document.getElementById('btnAddEmployee');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.handleAdd());
    }

    // Refresh button
    const refreshBtn = document.getElementById('btnRefreshEmployees');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.handleRefresh());
    }

    // Search with debounce
    const searchInput = document.getElementById('searchEmployee');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
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
    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }

    // Tab switching menggunakan Bootstrap events
    const employeeTabs = document.getElementById('employeeTabs');
    if (employeeTabs) {
      employeeTabs.addEventListener('shown.bs.tab', (e) => {
        const tabId = e.target.id;
        
        if (tabId === 'active-tab') {
          this.currentTab = 'active';
        } else if (tabId === 'inactive-tab') {
          this.currentTab = 'inactive';
        }
        
        this.currentPage = 1;
        this.renderCurrentTab();
      });
    }
  }

  /**
   * Handle refresh
   */
  async handleRefresh() {
    const refreshBtn = document.getElementById('btnRefreshEmployees');
    if (!refreshBtn) return;

    console.log('🔄 Refreshing employees from API...');
    
    const originalText = refreshBtn.innerHTML;
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';

    try {
      await this.loadAllEmployees();
      await this.loadCurrentPage();
      this.updateDepartmentFilter();
      this.renderCurrentTab();
      this.showNotification('Employees refreshed successfully', 'success');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
      this.showNotification('Failed to refresh employees', 'danger');
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = originalText;
    }
  }

  /**
   * Apply filters - FIXED: Gunakan allEmployees untuk filtering
   */
  applyFilters() {
    const searchQuery = document.getElementById('searchEmployee')?.value.toLowerCase() || '';
    const departmentFilter = document.getElementById('filterDepartment')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';

    // Cek apakah ada filter aktif
    this.isFilterActive = searchQuery !== '' || departmentFilter !== '' || statusFilter !== '';

    if (this.isFilterActive) {
      // Filter dari allEmployees
      this.filteredData = this.allEmployees.filter((employee) => {
        let match = true;

        // Filter by search
        if (searchQuery) {
          const searchableText = [
            employee.fullName,
            employee.email,
            employee.position,
            employee.department,
            employee.employeeCode
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          
          match = match && searchableText.includes(searchQuery);
        }

        // Filter by department
        if (departmentFilter && departmentFilter !== 'All Departments') {
          match = match && employee.department === departmentFilter;
        }

        // Filter by status
        if (statusFilter && statusFilter !== 'All Status') {
          if (statusFilter === 'active') {
            match = match && employee.isActive === true;
          } else if (statusFilter === 'inactive') {
            match = match && employee.isActive === false;
          }
        }

        return match;
      });
    } else {
      // Tidak ada filter, gunakan data dari API
      this.filteredData = [...this.employees];
    }

    this.currentPage = 1;
    this.renderCurrentTab();
  }

  /**
   * Reset filters
   */
  resetFilters() {
    const searchInput = document.getElementById('searchEmployee');
    const filterDept = document.getElementById('filterDepartment');
    const filterStatus = document.getElementById('filterStatus');

    if (searchInput) searchInput.value = '';
    if (filterDept) filterDept.value = '';
    if (filterStatus) filterStatus.value = '';
    
    this.isFilterActive = false;
    this.filteredData = [...this.employees];
    this.currentPage = 1;
    this.renderCurrentTab();
  }

  /**
   * Render current tab
   */
  renderCurrentTab() {
    // Get data untuk current tab dari filteredData
    let currentData = [];
    let emptyStateId = '';
    let tableBodyId = '';

    if (this.currentTab === 'active') {
      currentData = this.filteredData.filter(emp => emp.isActive === true);
      emptyStateId = 'activeEmpty';
      tableBodyId = 'activeTableBody';
    } else {
      currentData = this.filteredData.filter(emp => emp.isActive === false);
      emptyStateId = 'inactiveEmpty';
      tableBodyId = 'inactiveTableBody';
    }

    // Update badge counts
    this.updateBadgeCounts(currentData);

    // Render table dengan pagination yang benar
    this.renderTable(tableBodyId, emptyStateId, currentData);

    // Update showing count
    this.updateShowingCount(currentData.length);

    // Render pagination - Perbaikan: bedakan antara filter dan non-filter
    this.renderPagination(currentData.length);
  }

  /**
   * Update badge counts
   */
  updateBadgeCounts(currentData) {
    const activeCount = currentData.filter(emp => emp.isActive === true).length;
    const inactiveCount = currentData.filter(emp => emp.isActive === false).length;

    const updateBadge = (id, count) => {
      const badge = document.getElementById(id);
      if (badge) badge.textContent = count;
    };

    updateBadge('activeCount', activeCount);
    updateBadge('inactiveCount', inactiveCount);
  }

  /**
   * Render table dengan pagination yang benar
   */
  renderTable(tbodyId, emptyStateId, data) {
    const tbody = document.getElementById(tbodyId);
    const emptyState = document.getElementById(emptyStateId);
    const tableContainer = tbody?.closest('.table-responsive');

    if (!tbody || !emptyState || !tableContainer) return;

    // Hitung data untuk ditampilkan
    let pageData = [];
    
    if (this.isFilterActive) {
      // Jika ada filter, lakukan pagination lokal
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      pageData = data.slice(start, end);
    } else {
      // Jika tidak ada filter, gunakan data dari API
      pageData = data;
    }

    // Show/hide empty state
    if (pageData.length === 0) {
      tableContainer.classList.add('d-none');
      emptyState.classList.remove('d-none');
      return;
    }

    tableContainer.classList.remove('d-none');
    emptyState.classList.add('d-none');

    // Build table rows
    const fragment = document.createDocumentFragment();
    
    pageData.forEach((employee, index) => {
      const rowNumber = this.isFilterActive 
        ? (this.currentPage - 1) * this.pageSize + index + 1
        : index + 1;
      
      const row = this.createTableRow(employee, rowNumber);
      fragment.appendChild(row);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);

    // Attach event listeners
    this.attachRowEventListeners(tbody);
  }

  /**
   * Create table row
   */
  createTableRow(employee, rowNumber) {
    const tr = document.createElement('tr');
    
    // Get avatar initial
    const avatarInitial = employee.fullName ? employee.fullName.charAt(0).toUpperCase() : '?';
    
    tr.innerHTML = `
      <td>${rowNumber}</td>
      <td>
        <div class="d-flex align-items-center">
          <div class="avatar avatar-sm me-2 bg-primary">
            <span class="avatar-text">${avatarInitial}</span>
          </div>
          <div>
            <strong>${this.escapeHtml(employee.fullName || 'N/A')}</strong>
            <small class="text-muted d-block">${this.escapeHtml(employee.employeeCode || 'No Code')}</small>
          </div>
        </div>
      </td>
      <td>${this.escapeHtml(employee.email || 'N/A')}</td>
      <td>${this.escapeHtml(employee.position || 'N/A')}</td>
      <td><span class="badge bg-info">${this.escapeHtml(employee.department || 'N/A')}</span></td>
      <td>
        <span class="badge ${employee.isActive ? 'bg-success' : 'bg-secondary'}">
          ${employee.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary btn-edit" 
                  data-id="${employee.employeeId}" 
                  title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-outline-danger btn-delete" 
                  data-id="${employee.employeeId}" 
                  title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    return tr;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (text === null || text === undefined) return 'N/A';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Attach event listeners to table row buttons
   */
  attachRowEventListeners(tbody) {
    // Edit button
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.handleEdit(id);
      });
    });

    // Delete button
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        await this.handleDelete(id);
      });
    });
  }

  /**
   * Render pagination - FIXED VERSION
   */
  renderPagination(filteredDataLength) {
    const pagination = document.getElementById('employeesPagination');
    if (!pagination) return;

    // Tentukan totalPages berdasarkan kondisi
    let totalPages;
    
    if (this.isFilterActive) {
      // Jika ada filter, hitung dari data yang difilter
      totalPages = Math.ceil(filteredDataLength / this.pageSize);
    } else {
      // Jika tidak ada filter, gunakan totalPages dari API
      totalPages = this.totalPages;
    }

    console.log(`Pagination Debug:
      - Filter Active: ${this.isFilterActive}
      - Current Page: ${this.currentPage}
      - Total Pages: ${totalPages}
      - Filtered Data Length: ${filteredDataLength}
      - Page Size: ${this.pageSize}
    `);

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '';

    // Previous button
    const hasPrevious = this.currentPage > 1;
    html += `
      <li class="page-item ${!hasPrevious ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="prev" ${!hasPrevious ? 'tabindex="-1" aria-disabled="true"' : ''}>
          <i class="fas fa-chevron-left"></i>
        </a>
      </li>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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
    const hasNext = this.currentPage < totalPages;
    html += `
      <li class="page-item ${!hasNext ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="next" ${!hasNext ? 'tabindex="-1" aria-disabled="true"' : ''}>
          <i class="fas fa-chevron-right"></i>
        </a>
      </li>
    `;

    pagination.innerHTML = html;

    // Attach pagination event listeners
    this.attachPaginationListeners(pagination, totalPages);
  }

  /**
   * Attach pagination listeners
   */
  attachPaginationListeners(pagination, totalPages) {
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

        console.log(`Page navigation: ${this.currentPage} -> ${newPage} (totalPages: ${totalPages})`);

        if (newPage >= 1 && newPage <= totalPages && newPage !== this.currentPage) {
          this.currentPage = newPage;
          
          if (this.isFilterActive) {
            // Jika ada filter, cukup render ulang
            this.renderCurrentTab();
          } else {
            // Jika tidak ada filter, load halaman baru dari API
            await this.loadCurrentPage();
            this.renderCurrentTab();
          }
        }
      });
    });
  }

  /**
   * Update showing count
   */
  updateShowingCount(filteredDataLength) {
    let showingText = '';
    let totalText = '';
    
    if (this.isFilterActive) {
      // Jika ada filter, hitung dari data yang difilter
      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = Math.min(this.currentPage * this.pageSize, filteredDataLength);
      showingText = filteredDataLength > 0 ? `${start}-${end}` : '0';
      totalText = filteredDataLength.toString();
    } else {
      // Jika tidak ada filter, gunakan data dari API
      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
      showingText = this.totalItems > 0 ? `${start}-${end}` : '0';
      totalText = this.totalItems.toString();
    }
    
    const showingEl = document.getElementById('showingEmployees');
    const totalEl = document.getElementById('totalFilteredEmployees');
    
    if (showingEl) {
      showingEl.textContent = showingText;
    }
    if (totalEl) {
      totalEl.textContent = totalText;
    }
    
    console.log(`Showing: ${showingText} of ${totalText}`);
  }

  /**
   * Handle edit employee
   */
  handleEdit(id) {
    console.log(`✏️ Navigating to employeesupdate for ID: ${id}`);
    
    sessionStorage.setItem('crudId', id.toString());
    sessionStorage.setItem('crudMode', 'update');
    
    this.navigateTo('employeesupdate');
  }

  /**
   * Handle delete employee
   */
  async handleDelete(id) {
    const employee = this.allEmployees.find(emp => emp.employeeId === id);
    if (!employee) return;

    const result = await confirmModal.show({
      type: 'danger',
      title: 'Delete Employee',
      message: `Are you sure you want to delete "${employee.fullName}"? This action cannot be undone.`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okClass: 'btn-danger',
    });

    if (result) {
      try {
        await WhitebirdAPI.employee.deleteEmployee(id);
        
        // Reload semua data
        await this.loadAllEmployees();
        await this.loadCurrentPage();
        this.updateDepartmentFilter();
        this.renderCurrentTab();
        
        this.showNotification('Employee deleted successfully', 'success');
      } catch (error) {
        console.error('❌ Failed to delete employee:', error);
        this.showNotification('Failed to delete employee', 'danger');
      }
    }
  }

  /**
   * Handle add employee
   */
  handleAdd() {
    console.log('➕ Navigating to employeescreate');
    
    // Clear any existing session storage
    sessionStorage.removeItem('crudId');
    sessionStorage.removeItem('crudMode');
    
    this.navigateTo('employeescreate');
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
    console.log(`${type.toUpperCase()}: ${message}`);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification(type, message);
      return;
    }
    
    if (type === 'danger' || type === 'error') {
      setTimeout(() => {
        alert(`${type.toUpperCase()}: ${message}`);
      }, 100);
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
    console.log('🧹 Cleaning up employees menu...');
    
    // Clear timeouts
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    console.log('✅ Employees menu cleaned up');
  }
}

// Export singleton instance
export const employeesMenu = new EmployeesMenu();