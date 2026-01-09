/**
 * Transactions Menu Module - Fixed null status handling
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import WhitebirdAPI from '../services/api/index.js';

export class TransactionsMenu {
  constructor() {
    this.transactions = [];
    this.filteredData = [];
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalItems = 0;
    this.totalPages = 1;
    this.loading = false;
    this.searchTimeout = null;
    this.initialized = false;
  }

  /**
   * Initialize transactions menu
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('🔄 Transactions Menu Initializing...');
    
    try {
      this.setupEventListeners();
      await this.loadFromAPI();
      this.updateStats();
      this.render();
      
      this.initialized = true;
      console.log('✅ Transactions Menu Initialized!');
    } catch (error) {
      console.error('❌ Transactions Menu initialization error:', error);
      this.showErrorMessage('Failed to initialize transactions menu. Please refresh the page.');
    }
  }

  /**
   * Load transactions from API
   */
  async loadFromAPI() {
    if (this.loading) return;

    try {
      this.loading = true;
      console.log('📡 Loading transactions from API...');

      const response = await WhitebirdAPI.transactions.getTransactions();

      console.log('API Response:', response);

      if (response && response.isSuccess && response.data) {
        // Process data to handle null values
        this.transactions = this.processTransactionData(response.data);
        this.totalItems = this.transactions.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.filteredData = [...this.transactions];
        
        console.log(`✅ Loaded ${this.transactions.length} transactions from API`);
      } else {
        console.warn('⚠️ API returned no data or error');
        this.transactions = [];
        this.filteredData = [];
      }
    } catch (error) {
      console.error('❌ Failed to load transactions from API:', error);
      this.transactions = [];
      this.filteredData = [];
      this.showNotification('Failed to load transactions. Please try again.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Process transaction data to handle null values
   */
  processTransactionData(data) {
    return data.map(transaction => ({
      transactionId: transaction.transactionId || 0,
      assetId: transaction.assetId || 0,
      assetCode: transaction.assetCode || 'No Code',
      assetName: transaction.assetName || 'Unknown Asset',
      fromEmployeeName: transaction.fromEmployeeName || 'Unknown',
      toEmployeeName: transaction.toEmployeeName || 'Unknown',
      transactionDate: transaction.transactionDate || new Date().toISOString(),
      status: transaction.status || 'UNKNOWN', // Handle null status
      notes: transaction.notes || ''
    }));
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // New transaction button
    const newBtn = document.getElementById('btnNewTransaction');
    if (newBtn) {
      newBtn.addEventListener('click', () => this.handleNew());
    }

    // Refresh button
    const refreshBtn = document.getElementById('btnRefreshTransactions');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.handleRefresh());
    }

    // Search with debounce
    const searchInput = document.getElementById('searchTransactions');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.applyFilters();
        }, 300);
      });
    }

    // Status filter
    const statusFilter = document.getElementById('filterTransactionStatus');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.applyFilters());
    }

    // Date filters
    const dateFromFilter = document.getElementById('filterDateFrom');
    const dateToFilter = document.getElementById('filterDateTo');
    
    if (dateFromFilter) {
      dateFromFilter.addEventListener('change', () => this.applyFilters());
    }
    
    if (dateToFilter) {
      dateToFilter.addEventListener('change', () => this.applyFilters());
    }

    // Reset filters
    const resetBtn = document.getElementById('btnResetFilters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  /**
   * Handle refresh
   */
  async handleRefresh() {
    const refreshBtn = document.getElementById('btnRefreshTransactions');
    if (!refreshBtn) return;

    console.log('🔄 Refreshing transactions from API...');
    
    const originalText = refreshBtn.innerHTML;
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';

    try {
      await this.loadFromAPI();
      this.updateStats();
      this.render();
      this.showNotification('Transactions refreshed successfully', 'success');
    } catch (error) {
      console.error('❌ Refresh failed:', error);
      this.showNotification('Failed to refresh transactions', 'danger');
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = originalText;
    }
  }

  /**
   * Apply filters
   */
  applyFilters() {
    const searchQuery = document.getElementById('searchTransactions')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterTransactionStatus')?.value || '';
    const dateFrom = document.getElementById('filterDateFrom')?.value;
    const dateTo = document.getElementById('filterDateTo')?.value;

    this.filteredData = this.transactions.filter((transaction) => {
      let match = true;

      // Search filter
      if (searchQuery) {
        const searchableText = [
          transaction.assetName || '',
          transaction.assetCode || '',
          transaction.fromEmployeeName || '',
          transaction.toEmployeeName || '',
          transaction.status || '',
          transaction.notes || ''
        ].join(' ').toLowerCase();
        
        match = match && searchableText.includes(searchQuery);
      }

      // Status filter - handle null status
      if (statusFilter) {
        if (statusFilter === 'UNKNOWN') {
          match = match && (!transaction.status || transaction.status === 'UNKNOWN');
        } else {
          match = match && transaction.status === statusFilter;
        }
      }

      // Date filters
      if (dateFrom && transaction.transactionDate) {
        const transDate = new Date(transaction.transactionDate).toISOString().split('T')[0];
        match = match && transDate >= dateFrom;
      }

      if (dateTo && transaction.transactionDate) {
        const transDate = new Date(transaction.transactionDate).toISOString().split('T')[0];
        match = match && transDate <= dateTo;
      }

      return match;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.render();
  }

  /**
   * Reset filters
   */
  resetFilters() {
    const searchInput = document.getElementById('searchTransactions');
    const statusFilter = document.getElementById('filterTransactionStatus');
    const dateFrom = document.getElementById('filterDateFrom');
    const dateTo = document.getElementById('filterDateTo');

    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';
    
    this.applyFilters();
  }

  /**
   * Update statistics
   */
  updateStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const todayTrans = this.transactions.filter(t => 
      t.transactionDate && t.transactionDate.startsWith(today)
    ).length;
    
    const transfers = this.transactions.filter(t => t.status === 'TRANSFER').length;
    const assignments = this.transactions.filter(t => t.status === 'ASSIGN').length;
    const returns = this.transactions.filter(t => t.status === 'RETURN').length;

    // Update element text safely
    const updateElementText = (id, text) => {
      const element = document.getElementById(id);
      if (element) element.textContent = text;
    };

    updateElementText('todayTransactions', todayTrans);
    updateElementText('transferCount', transfers);
    updateElementText('assignCount', assignments);
    updateElementText('returnCount', returns);
    updateElementText('totalTransactions', this.transactions.length);
  }

  /**
   * Render transactions table
   */
  render() {
    const tbody = document.getElementById('transactionsTableBody');
    const emptyState = document.getElementById('transactionsEmpty');
    const tableContainer = tbody?.closest('.table-responsive');

    if (!tbody || !emptyState || !tableContainer) {
      console.error('Table elements not found');
      return;
    }

    // Calculate pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageData = this.filteredData.slice(start, end);

    // Show/hide empty state
    if (pageData.length === 0) {
      tableContainer.classList.add('d-none');
      emptyState.classList.remove('d-none');
      this.renderPagination();
      this.updateShowingCount();
      return;
    }

    tableContainer.classList.remove('d-none');
    emptyState.classList.add('d-none');

    // Status badge colors
    const statusColors = {
      TRANSFER: 'info',
      ASSIGN: 'primary',
      RETURN: 'success',
      REPAIR: 'warning',
      PENDING: 'secondary',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      UNKNOWN: 'secondary' // Add color for unknown status
    };

    // Build table rows
    const fragment = document.createDocumentFragment();
    pageData.forEach((trans, index) => {
      const tr = document.createElement('tr');
      
      tr.innerHTML = `
        <td>${start + index + 1}</td>
        <td>${this.formatDate(trans.transactionDate)}</td>
        <td>
          <span class="badge bg-${statusColors[trans.status] || 'secondary'}">
            ${trans.status || 'N/A'}
          </span>
        </td>
        <td>
          <strong>${trans.assetName || 'N/A'}</strong>
          <small class="text-muted d-block">${trans.assetCode || 'No Code'}</small>
        </td>
        <td>${trans.fromEmployeeName || 'N/A'}</td>
        <td>${trans.toEmployeeName || 'N/A'}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary btn-view" 
                    data-id="${trans.assetTransactionsId || trans.id}" 
                    title="View Details">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-outline-danger btn-delete" 
                    data-id="${trans.assetTransactionsId || trans.id}" 
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
    
    // Render pagination and update counts
    this.renderPagination();
    this.updateShowingCount();
  }

  /**
   * Create table row
   */
  createTableRow(transaction, rowNumber, statusColors) {
    const tr = document.createElement('tr');
    
    // Get status and color, handle null/undefined
    const status = transaction.status || 'UNKNOWN';
    const statusColor = statusColors[status] || 'secondary';
    
    tr.innerHTML = `
      <td>${rowNumber + 1}</td>
      <td>
        <div class="fw-semibold">${this.formatDate(transaction.transactionDate)}</div>
        <small class="text-muted">${this.formatTime(transaction.transactionDate)}</small>
      </td>
      <td>
        <span class="badge bg-${statusColor}">
          ${status}
        </span>
      </td>
      <td>
        <div class="fw-semibold">${this.escapeHtml(transaction.assetName)}</div>
        <small class="text-muted">${this.escapeHtml(transaction.assetCode)}</small>
      </td>
      <td>${this.escapeHtml(transaction.fromEmployeeName)}</td>
      <td>${this.escapeHtml(transaction.toEmployeeName)}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary btn-view" 
                  data-id="${transaction.transactionId}" 
                  title="View Details">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-outline-warning btn-edit" 
                  data-id="${transaction.transactionId}" 
                  title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-outline-danger btn-delete" 
                  data-id="${transaction.transactionId}" 
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
    if (text === null || text === undefined) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  /**
   * Format time for display
   */
  formatTime(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }

  /**
   * Attach event listeners to table row buttons
   */
  attachRowEventListeners(tbody) {
    // View button
    tbody.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.handleView(id);
      });
    });

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
   * Render pagination
   */
  renderPagination() {
    const pagination = document.getElementById('transactionsPagination');
    if (!pagination || this.totalPages <= 1) {
      if (pagination) pagination.innerHTML = '';
      return;
    }

    let html = '';

    // Previous button
    html += `
      <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="prev">
          <i class="fas fa-chevron-left"></i>
        </a>
      </li>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

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
    html += `
      <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="next">
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
    pagination.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
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

        if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.currentPage) {
          this.currentPage = newPage;
          this.render();
        }
      });
    });
  }

  /**
   * Update showing count
   */
  updateShowingCount() {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredData.length);
    
    const showingEl = document.getElementById('showingTransactions');
    const totalEl = document.getElementById('totalFilteredTransactions');
    
    if (showingEl) {
      showingEl.textContent = this.filteredData.length > 0 ? `${start}-${end}` : '0';
    }
    if (totalEl) {
      totalEl.textContent = this.filteredData.length;
    }
  }

  /**
   * Handle view transaction
   */
  handleView(id) {
    console.log(`👁️ Viewing transaction ${id}`);
    const transaction = this.transactions.find((t) => (t.assetTransactionsId || t.id) === id);
    if (transaction) {
      alert(
        `Transaction Details:\n\n` +
        `ID: ${transaction.assetTransactionsId}\n` +
        `Asset: ${transaction.assetName} (${transaction.assetCode})\n` +
        `Status: ${transaction.status}\n` +
        `From: ${transaction.fromEmployeeName}\n` +
        `To: ${transaction.toEmployeeName}\n` +
        `Date: ${this.formatDate(transaction.transactionDate)} ${this.formatTime(transaction.transactionDate)}\n` +
        `Notes: ${transaction.notes || 'None'}`
      );
    }
  }

  /**
   * Handle edit transaction
   */
  handleEdit(id) {
    console.log(`✏️ Navigating to transactionsupdate for ID: ${id}`);
    
    sessionStorage.setItem('crudId', id.toString());
    sessionStorage.setItem('crudMode', 'update');
    
    this.navigateTo('transactionsupdate');
  }

  /**
   * Handle delete transaction
   */
  async handleDelete(id) {
    const transaction = this.transactions.find((t) => (t.assetTransactionsId || t.id) === id);
    if (!transaction) return;

    const result = await confirmModal.show({
      type: 'danger',
      title: 'Delete Transaction',
      message: `Are you sure you want to delete this transaction?\n\nAsset: ${transaction.assetName}\nDate: ${this.formatDate(transaction.transactionDate)}`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okClass: 'btn-danger',
    });

    if (result) {
      try {
        await WhitebirdAPI.transactions.deleteTransaction(id);
        
        // Reload data
        await this.loadFromAPI();
        this.updateStats();
        this.render();
        
        this.showNotification('Transaction deleted successfully', 'success');
      } catch (error) {
        console.error('❌ Failed to delete transaction:', error);
        this.showNotification('Failed to delete transaction', 'danger');
      }
    }
  }

  /**
   * Handle new transaction
   */
  handleNew() {
    console.log('➕ Navigating to transactionscreate');
    
    // Clear any existing session storage
    sessionStorage.removeItem('crudId');
    sessionStorage.removeItem('crudMode');
    
    this.navigateTo('transactionscreate');
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
   * Show error message in UI
   */
  showErrorMessage(message) {
    // Check if error already shown
    if (document.querySelector('.transactions-error')) return;
    
    const errorContainer = document.createElement('div');
    errorContainer.className = 'alert alert-danger alert-dismissible fade show transactions-error';
    errorContainer.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the beginning of the page
    const pageContainer = document.getElementById('transactionsPage');
    if (pageContainer) {
      pageContainer.insertBefore(errorContainer, pageContainer.firstChild);
    }
  }

  /**
   * Clean up
   */
  destroy() {
    console.log('🧹 Cleaning up transactions menu...');
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.initialized = false;
    console.log('✅ Transactions menu cleaned up');
  }
}

// Export singleton instance
export const transactionsMenu = new TransactionsMenu();