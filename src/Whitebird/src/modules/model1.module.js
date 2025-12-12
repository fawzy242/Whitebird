/**
 * Model 1 Module - Advanced Data Table Management
 * Features: Batch Operations, Advanced Filters, Sort, Export, Modal Confirmations
 */

import { confirmModal } from '../components/confirm-modal.component.js';

export class Model1Manager {
    constructor() {
        this.data = this.generateSampleData();
        this.filteredData = [...this.data];
        this.selectedIds = new Set();
        this.currentPage = 1;
        this.pageSize = 10;
        this.filters = {
            department: '',
            status: '',
            salary: ''
        };
    }

    /**
     * Initialize Model 1
     */
    initialize() {
        console.log('📊 Model1 Initializing...');
        this.setupEventListeners();
        this.render();
        console.log('✅ Model1 Initialized!');
    }

    /**
     * Generate sample data
     */
    generateSampleData() {
        const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown', 
                       'Diana Prince', 'Ethan Hunt', 'Fiona Gallagher', 'George Martin', 'Hannah Montana',
                       'Ian Fleming', 'Julia Roberts', 'Kevin Hart', 'Laura Palmer', 'Michael Scott',
                       'Nancy Drew', 'Oliver Twist', 'Peter Parker', 'Quinn Fabray', 'Rachel Green'];
        const positions = ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst', 'DevOps Engineer'];
        const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
        const statuses = ['Active', 'Inactive'];

        return Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            name: names[i % names.length],
            email: `employee${i + 1}@company.com`,
            position: positions[Math.floor(Math.random() * positions.length)],
            department: departments[Math.floor(Math.random() * departments.length)],
            salary: Math.floor(Math.random() * 80000) + 40000,
            status: statuses[Math.floor(Math.random() * statuses.length)]
        }));
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300);
            });
        }

        // Add button
        const addBtn = document.getElementById('btnAddEmployee');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.handleAdd());
        }

        // Import/Export buttons
        const importBtn = document.getElementById('btnImport');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.handleImport());
        }

        const exportBtn = document.getElementById('btnExport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }

        // Batch operations
        const batchDeleteBtn = document.getElementById('btnBatchDelete');
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', () => this.handleBatchDelete());
        }

        const batchExportBtn = document.getElementById('btnBatchExport');
        if (batchExportBtn) {
            batchExportBtn.addEventListener('click', () => this.handleBatchExport());
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => this.handleSelectAll(e.target.checked));
        }

        // Filter controls
        const applyFiltersBtn = document.getElementById('btnApplyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        const resetFiltersBtn = document.getElementById('btnResetFilters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        }
    }

    /**
     * Handle search
     */
    handleSearch(query) {
        const lowerQuery = query.toLowerCase();
        this.filteredData = this.data.filter(item => 
            item.name.toLowerCase().includes(lowerQuery) ||
            item.email.toLowerCase().includes(lowerQuery) ||
            item.position.toLowerCase().includes(lowerQuery) ||
            item.department.toLowerCase().includes(lowerQuery)
        );
        this.currentPage = 1;
        this.selectedIds.clear();
        this.render();
    }

    /**
     * Apply filters
     */
    applyFilters() {
        this.filters.department = document.getElementById('filterDepartment')?.value || '';
        this.filters.status = document.getElementById('filterStatus')?.value || '';
        this.filters.salary = document.getElementById('filterSalary')?.value || '';

        this.filteredData = this.data.filter(item => {
            let match = true;

            if (this.filters.department && item.department !== this.filters.department) {
                match = false;
            }

            if (this.filters.status && item.status !== this.filters.status) {
                match = false;
            }

            if (this.filters.salary) {
                const salary = item.salary;
                if (this.filters.salary === '0-50000') {
                    match = match && (salary >= 0 && salary <= 50000);
                } else if (this.filters.salary === '50000-80000') {
                    match = match && (salary > 50000 && salary <= 80000);
                } else if (this.filters.salary === '80000-100000') {
                    match = match && (salary > 80000 && salary <= 100000);
                } else if (this.filters.salary === '100000+') {
                    match = match && (salary > 100000);
                }
            }

            return match;
        });

        this.currentPage = 1;
        this.selectedIds.clear();
        this.render();
        this.showNotification('success', 'Filters applied successfully');
    }

    /**
     * Reset filters
     */
    resetFilters() {
        this.filters = { department: '', status: '', salary: '' };
        
        document.getElementById('filterDepartment').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterSalary').value = '';

        this.filteredData = [...this.data];
        this.currentPage = 1;
        this.selectedIds.clear();
        this.render();
        this.showNotification('info', 'Filters reset');
    }

    /**
     * Handle select all
     */
    handleSelectAll(checked) {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredData.slice(start, end);

        if (checked) {
            pageData.forEach(item => this.selectedIds.add(item.id));
        } else {
            pageData.forEach(item => this.selectedIds.delete(item.id));
        }

        this.updateBatchButtons();
        this.updateTableCheckboxes();
    }

    /**
     * Handle individual checkbox
     */
    handleCheckbox(id, checked) {
        if (checked) {
            this.selectedIds.add(id);
        } else {
            this.selectedIds.delete(id);
        }

        this.updateBatchButtons();
        this.updateSelectAllCheckbox();
    }

    /**
     * Handle add
     */
    async handleAdd() {
        const result = await confirmModal.show({
            type: 'confirm',
            title: 'Add New Employee',
            message: 'This will open the employee creation form. Continue?',
            okText: 'Continue',
            cancelText: 'Cancel'
        });

        if (result) {
            // Navigate to employee crud page
            window.location.hash = '#employeecrud';
            sessionStorage.setItem('employeeCrudMode', 'add');
        }
    }

    /**
     * Handle edit
     */
    async handleEdit(id) {
        const employee = this.data.find(e => e.id === id);
        if (!employee) return;

        const result = await confirmModal.show({
            type: 'confirm',
            title: 'Edit Employee',
            message: `Edit information for ${employee.name}?`,
            okText: 'Edit',
            cancelText: 'Cancel'
        });

        if (result) {
            // Navigate to employee crud page
            window.location.hash = '#employeecrud';
            sessionStorage.setItem('employeeCrudMode', 'edit');
            sessionStorage.setItem('employeeCrudId', id);
        }
    }

    /**
     * Handle delete
     */
    async handleDelete(id) {
        const employee = this.data.find(e => e.id === id);
        if (!employee) return;

        const result = await confirmModal.show({
            type: 'danger',
            title: 'Delete Employee',
            message: `Are you sure you want to delete ${employee.name}? This action cannot be undone.`,
            okText: 'Delete',
            cancelText: 'Cancel',
            okClass: 'btn-danger'
        });

        if (result) {
            this.data = this.data.filter(e => e.id !== id);
            this.filteredData = this.filteredData.filter(e => e.id !== id);
            this.selectedIds.delete(id);
            this.render();
            this.showNotification('success', 'Employee deleted successfully');
        }
    }

    /**
     * Handle batch delete
     */
    async handleBatchDelete() {
        if (this.selectedIds.size === 0) return;

        const result = await confirmModal.show({
            type: 'danger',
            title: 'Delete Multiple Employees',
            message: `Are you sure you want to delete ${this.selectedIds.size} employee(s)? This action cannot be undone.`,
            okText: 'Delete All',
            cancelText: 'Cancel',
            okClass: 'btn-danger'
        });

        if (result) {
            this.data = this.data.filter(e => !this.selectedIds.has(e.id));
            this.filteredData = this.filteredData.filter(e => !this.selectedIds.has(e.id));
            this.selectedIds.clear();
            this.render();
            this.showNotification('success', 'Selected employees deleted successfully');
        }
    }

    /**
     * Handle batch export
     */
    handleBatchExport() {
        const selectedData = this.data.filter(e => this.selectedIds.has(e.id));
        this.exportToCSV(selectedData);
    }

    /**
     * Handle import
     */
    handleImport() {
        this.showNotification('info', 'Import functionality - Coming soon!');
    }

    /**
     * Handle export
     */
    handleExport() {
        this.exportToCSV(this.filteredData);
    }

    /**
     * Export to CSV
     */
    exportToCSV(dataToExport = this.filteredData) {
        const headers = ['ID', 'Name', 'Email', 'Position', 'Department', 'Salary', 'Status'];
        const csv = [
            headers.join(','),
            ...dataToExport.map(item => 
                [item.id, item.name, item.email, item.position, item.department, item.salary, item.status].join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('success', 'Data exported successfully');
    }

    /**
     * Render table
     */
    render() {
        const tbody = document.getElementById('employeeTableBody');
        const emptyState = document.getElementById('emptyState');
        
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredData.slice(start, end);

        // Show/hide empty state
        if (pageData.length === 0) {
            tbody.closest('.table-responsive').classList.add('d-none');
            if (emptyState) emptyState.classList.remove('d-none');
            this.updateStats();
            return;
        } else {
            tbody.closest('.table-responsive').classList.remove('d-none');
            if (emptyState) emptyState.classList.add('d-none');
        }

        // Build table rows using DocumentFragment for performance
        const fragment = document.createDocumentFragment();
        pageData.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="form-check-input row-checkbox" 
                           data-id="${item.id}" ${this.selectedIds.has(item.id) ? 'checked' : ''}>
                </td>
                <td>${start + index + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td><a href="mailto:${item.email}">${item.email}</a></td>
                <td>${item.position}</td>
                <td><span class="badge bg-info">${item.department}</span></td>
                <td>$${item.salary.toLocaleString()}</td>
                <td><span class="badge bg-${item.status === 'Active' ? 'success' : 'secondary'}">${item.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${item.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${item.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            fragment.appendChild(tr);
        });

        tbody.innerHTML = '';
        tbody.appendChild(fragment);

        // Attach event listeners to checkboxes and buttons
        this.attachRowEventListeners();

        this.updateStats();
        this.renderPagination();
        this.updateBatchButtons();
        this.updateSelectAllCheckbox();
    }

    /**
     * Attach event listeners to table rows
     */
    attachRowEventListeners() {
        // Checkboxes
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.handleCheckbox(id, e.target.checked);
            });
        });

        // Edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.handleEdit(id);
            });
        });

        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                this.handleDelete(id);
            });
        });
    }

    /**
     * Update stats
     */
    updateStats() {
        const totalEl = document.getElementById('totalEmployees');
        const showingEl = document.getElementById('showingCount');
        const totalCountEl = document.getElementById('totalCount');

        if (totalEl) totalEl.textContent = this.data.length;
        if (showingEl) showingEl.textContent = this.filteredData.length;
        if (totalCountEl) totalCountEl.textContent = this.data.length;
    }

    /**
     * Update batch buttons
     */
    updateBatchButtons() {
        const batchDeleteBtn = document.getElementById('btnBatchDelete');
        const batchExportBtn = document.getElementById('btnBatchExport');
        const selectedCountBadge = document.getElementById('selectedCount');

        const hasSelection = this.selectedIds.size > 0;

        if (batchDeleteBtn) batchDeleteBtn.disabled = !hasSelection;
        if (batchExportBtn) batchExportBtn.disabled = !hasSelection;

        if (selectedCountBadge) {
            if (hasSelection) {
                selectedCountBadge.textContent = `${this.selectedIds.size} selected`;
                selectedCountBadge.style.display = 'inline-block';
            } else {
                selectedCountBadge.style.display = 'none';
            }
        }
    }

    /**
     * Update select all checkbox
     */
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAll');
        if (!selectAllCheckbox) return;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredData.slice(start, end);

        const allSelected = pageData.length > 0 && pageData.every(item => this.selectedIds.has(item.id));
        selectAllCheckbox.checked = allSelected;
    }

    /**
     * Update table checkboxes
     */
    updateTableCheckboxes() {
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            const id = parseInt(checkbox.dataset.id);
            checkbox.checked = this.selectedIds.has(id);
        });
    }

    /**
     * Render pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        const pagination = document.getElementById('pagination');

        if (!pagination || totalPages <= 1) {
            if (pagination) pagination.innerHTML = '';
            return;
        }

        let html = '';
        
        // Previous button
        html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" data-page="${this.currentPage - 1}">Previous</button>
        </li>`;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `<li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <button class="page-link" data-page="${i}">${i}</button>
                </li>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        html += `<li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" data-page="${this.currentPage + 1}">Next</button>
        </li>`;

        pagination.innerHTML = html;

        // Attach click handlers
        pagination.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= totalPages) {
                    this.currentPage = page;
                    this.render();
                }
            });
        });
    }

    /**
     * Show notification
     */
    showNotification(type, message) {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(type, message);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Export singleton instance
export const model1Manager = new Model1Manager();
