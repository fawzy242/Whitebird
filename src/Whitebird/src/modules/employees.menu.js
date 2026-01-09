/**
<<<<<<< HEAD
 * Employees Menu Module - Fixed Pagination and Filtering
=======
 * Employees Menu Module - Optimized with Server-Side Grid
 * Connected to Whitebird API - REFACTORED VERSION
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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
<<<<<<< HEAD
    this.employees = []; // Data dari API (current page)
    this.allEmployees = []; // Semua data untuk filtering
    this.totalItems = 0;
    this.totalPages = 1;
    this.searchTimeout = null;
    this.isFilterActive = false;
=======
    this.totalItems = 0;
    this.totalPages = 1;
    this.searchTerm = '';
    this.departmentFilter = '';
    this.statusFilter = '';
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
  }

  /**
   * Initialize Employees page
   */
  async initialize() {
    console.log('👥 Employees Menu Initializing...');
<<<<<<< HEAD
    
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
=======
    this.setupEventListeners();
    await this.loadEmployees();
    console.log('✅ Employees Menu Initialized!');
  }

  /**
   * Load employees from API with pagination and filters
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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
<<<<<<< HEAD
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
=======
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
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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
<<<<<<< HEAD
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.applyFilters();
        }, 300);
=======
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchTerm = e.target.value;
          this.currentPage = 1; // Reset to first page when searching
          this.loadEmployees();
        }, 500);
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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
    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }

<<<<<<< HEAD
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
        
=======
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
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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
<<<<<<< HEAD
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
=======
   * Apply client-side filters (for status and department if API doesn't support)
   */
  applyClientSideFilters() {
    // Note: This should be called after data is loaded from API
    // For now, we'll reload from API and filter client-side
    this.loadEmployees();
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
  }

  /**
   * Reset all filters
   */
  resetFilters() {
<<<<<<< HEAD
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
=======
    document.getElementById('searchEmployee').value = '';
    document.getElementById('filterDepartment').value = '';
    document.getElementById('filterStatus').value = '';
    
    this.searchTerm = '';
    this.departmentFilter = '';
    this.statusFilter = '';
    this.currentPage = 1;
    
    this.loadEmployees();
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
  }

  /**
   * Handle refresh
   */
<<<<<<< HEAD
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
=======
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
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c

    if (!tbody || !emptyState || !tableContainer) return;

<<<<<<< HEAD
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
=======
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
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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
<<<<<<< HEAD
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
=======
   * Render pagination controls
   */
  renderPagination() {
    const pagination = document.getElementById('employeesPagination');
    if (!pagination) return;

    if (this.totalPages <= 1) {
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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

<<<<<<< HEAD
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

=======
    // Page numbers - show up to 5 pages
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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
    const hasNext = this.currentPage < totalPages;
    html += `
<<<<<<< HEAD
      <li class="page-item ${!hasNext ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="next" ${!hasNext ? 'tabindex="-1" aria-disabled="true"' : ''}>
=======
      <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${this.currentPage + 1}">
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
          <i class="fas fa-chevron-right"></i>
        </a>
      </li>
    `;

    pagination.innerHTML = html;

    // Attach pagination event listeners
<<<<<<< HEAD
    this.attachPaginationListeners(pagination, totalPages);
=======
    this.attachPaginationListeners();
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
  }

  /**
   * Attach pagination event listeners
   */
<<<<<<< HEAD
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
=======
  attachPaginationListeners() {
    const pagination = document.getElementById('employeesPagination');
    if (!pagination) return;

    pagination.querySelectorAll('.page-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = parseInt(e.currentTarget.dataset.page);
        if (!isNaN(page) && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
          this.goToPage(page);
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
        }
      });
    });
  }

  /**
<<<<<<< HEAD
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
=======
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
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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
<<<<<<< HEAD
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
=======
    // Find employee data
    const employee = this.filteredData.find(e => e.employeeId === id);
    if (!employee) return;

    const confirmed = confirm(
      `Are you sure you want to delete employee "${employee.fullName}"?\n\nThis action cannot be undone.`
    );
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c

    if (result) {
      try {
        await WhitebirdAPI.employee.deleteEmployee(id);
        
<<<<<<< HEAD
        // Reload semua data
        await this.loadAllEmployees();
        await this.loadCurrentPage();
        this.updateDepartmentFilter();
        this.renderCurrentTab();
        
        this.showNotification('Employee deleted successfully', 'success');
      } catch (error) {
        console.error('❌ Failed to delete employee:', error);
        this.showNotification('Failed to delete employee', 'danger');
=======
        // Refresh data
        await this.loadEmployees();
        
        this.showNotification('success', '✅ Employee deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete employee:', error);
        this.showNotification('danger', '❌ Failed to delete employee: ' + error.message);
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
      }
    }
  }

  /**
<<<<<<< HEAD
   * Handle add employee
   */
  handleAdd() {
    console.log('➕ Navigating to employeescreate');
    
    // Clear any existing session storage
    sessionStorage.removeItem('crudId');
    sessionStorage.removeItem('crudMode');
    
    this.navigateTo('employeescreate');
=======
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
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
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
<<<<<<< HEAD

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
=======
>>>>>>> b23c9d8f68f06041a15a05e44bd5218be6d6809c
}

// Export singleton instance
export const employeesMenu = new EmployeesMenu();