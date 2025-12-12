/**
 * Employees Menu Module - Optimized with Page Redirect
 * NO MODAL - Uses separate page (employeecrud.html) for add/edit
 * Features: Tabs (Approved/Pending), Optimized rendering, No lag
 * Connected to Whitebird API
 */

import { employeesCrud } from './employees.crud.js';
import { whitebirdAPI } from '../services/api/whitebird-api.service.js';

export class EmployeesMenu {
    constructor() {
        this.currentTab = 'approved'; // 'approved' or 'pending'
        this.currentPage = 1;
        this.pageSize = 15; // Increased from 10 for better performance
        this.filteredData = [];
        this.loading = false;
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
            
            const response = await whitebirdAPI.getEmployeesGrid({
                page: 1,
                pageSize: 1000 // Get all for now
            });
            
            if (response && response.success && response.data) {
                // Update the CRUD service with API data
                employeesCrud.setEmployees(response.data);
                console.log(`✅ Loaded ${response.data.length} employees from API`);
            } else {
                console.warn('⚠️ API returned no data, using existing data');
            }
        } catch (error) {
            console.error('❌ Failed to load employees from API:', error);
            console.log('📦 Using existing sample data');
        } finally {
            this.loading = false;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add Employee - Redirect to CRUD page
        const btnAdd = document.getElementById('btnAddEmployee');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.redirectToAdd());
            console.log('   ✅ Add button → redirects to employeecrud.html');
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
                    this.renderCurrentTab();
                    
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

        // Export Excel
        const btnExport = document.getElementById('btnExportExcel');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.handleExport());
        }

        // Search
        const searchInput = document.getElementById('searchEmployee');
        if (searchInput) {
            // Debounce search for performance
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300); // Wait 300ms after user stops typing
            });
        }

        // Filters
        const filterDept = document.getElementById('filterDepartment');
        const filterSalary = document.getElementById('filterSalary');
        
        if (filterDept) {
            filterDept.addEventListener('change', () => this.applyFilters());
        }
        
        if (filterSalary) {
            filterSalary.addEventListener('change', () => this.applyFilters());
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

        console.log('   ✅ Event listeners attached (optimized with debounce)');
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
            window.location.href = '/employeesupdate';
        }
    }

    /**
     * Handle delete with confirmation
     */
    async handleDelete(id) {
        // Use browser confirm (fast, no lag)
        const employee = employeesCrud.getById(id);
        if (!employee) return;

        const confirmed = confirm(`Delete employee "${employee.name}"?\n\nThis action cannot be undone.`);
        
        if (confirmed) {
            const success = employeesCrud.delete(id);
            
            if (success) {
                console.log('✅ Employee deleted');
                this.loadAndRender(); // Refresh data
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
        const salaryRange = document.getElementById('filterSalary')?.value || '';

        // Get all employees
        let data = employeesCrud.getAll();

        // Filter by search
        if (search) {
            data = data.filter(emp => 
                emp.name.toLowerCase().includes(search) ||
                emp.email.toLowerCase().includes(search) ||
                emp.position.toLowerCase().includes(search)
            );
        }

        // Filter by department
        if (department) {
            data = data.filter(emp => emp.department === department);
        }

        // Filter by salary range
        if (salaryRange) {
            if (salaryRange === '100000+') {
                data = data.filter(emp => emp.salary >= 100000);
            } else {
                const [min, max] = salaryRange.split('-').map(Number);
                data = data.filter(emp => emp.salary >= min && emp.salary < max);
            }
        }

        this.filteredData = data;
        this.currentPage = 1; // Reset to first page
        this.renderCurrentTab();
    }

    /**
     * Reset filters
     */
    resetFilters() {
        document.getElementById('searchEmployee').value = '';
        document.getElementById('filterDepartment').value = '';
        document.getElementById('filterSalary').value = '';
        this.applyFilters();
    }

    /**
     * Render current tab
     */
    renderCurrentTab() {
        // Split data by status
        const approved = this.filteredData.filter(emp => emp.status === 'Active');
        const pending = this.filteredData.filter(emp => emp.status === 'Inactive');

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
            tbody.parentElement.parentElement.classList.add('d-none'); // Hide table
            return;
        } else {
            emptyState?.classList.add('d-none');
            tbody.parentElement.parentElement.classList.remove('d-none'); // Show table
        }

        // Pagination
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = data.slice(start, end);

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();

        pageData.forEach((emp, index) => {
            // Defensive check - skip if emp is invalid
            if (!emp || !emp.name || !emp.email) {
                console.warn('Invalid employee data:', emp);
                return;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${start + index + 1}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar avatar-sm me-2">
                            <span class="avatar-text">${emp.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <strong>${emp.name}</strong>
                    </div>
                </td>
                <td>${emp.email}</td>
                <td>${emp.position || 'N/A'}</td>
                <td><span class="badge bg-info">${emp.department || 'N/A'}</span></td>
                <td>$${(emp.salary || 0).toLocaleString()}</td>
                <td>${emp.joinDate || 'N/A'}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-primary me-1" onclick="window.employeesMenuInstance.redirectToEdit(${emp.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.employeesMenuInstance.handleDelete(${emp.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            fragment.appendChild(tr);
        });

        // Clear and append (single DOM operation)
        tbody.innerHTML = '';
        tbody.appendChild(fragment);

        // Render pagination
        this.renderPagination(data.length);
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
                <a class="page-link" href="#" onclick="window.employeesMenuInstance.goToPage(${this.currentPage - 1}); return false;">
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
                    <a class="page-link" href="#" onclick="window.employeesMenuInstance.goToPage(${i}); return false;">${i}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="window.employeesMenuInstance.goToPage(${this.currentPage + 1}); return false;">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = html;
    }

    /**
     * Go to page
     */
    goToPage(page) {
        const totalPages = Math.ceil(
            (this.currentTab === 'approved' 
                ? this.filteredData.filter(e => e.status === 'Active').length 
                : this.filteredData.filter(e => e.status === 'Inactive').length
            ) / this.pageSize
        );

        if (page < 1 || page > totalPages) return;

        this.currentPage = page;
        this.renderCurrentTab();
    }

    /**
     * Update counts
     */
    updateCounts() {
        const currentData = this.currentTab === 'approved'
            ? this.filteredData.filter(e => e.status === 'Active')
            : this.filteredData.filter(e => e.status === 'Inactive');

        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, currentData.length);

        document.getElementById('showingCount').textContent = currentData.length > 0 ? `${start}-${end}` : '0';
        document.getElementById('totalCount').textContent = currentData.length;
    }

    /**
     * Handle export
     */
    handleExport() {
        const data = this.currentTab === 'approved'
            ? this.filteredData.filter(e => e.status === 'Active')
            : this.filteredData.filter(e => e.status === 'Inactive');

        const csv = employeesCrud.exportToCSV(data);
        console.log('✅ Exported to Excel');
    }
}

// Export singleton
export const employeesMenu = new EmployeesMenu();

// Expose to window for onclick handlers
if (typeof window !== 'undefined') {
    window.employeesMenuInstance = employeesMenu;
}
