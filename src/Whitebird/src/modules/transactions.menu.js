/**
 * Transactions Menu Module - Fixed and Optimized
 * Connected to Whitebird API
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
  }

  /**
   * Initialize transactions menu
   */
  async initialize() {
    console.log('🔄 Transactions Menu Initializing...');
    this.setupEventListeners();
    await this.loadFromAPI();
    this.updateStats();
    this.render();
    console.log('✅ Transactions Menu Initialized!');
  }

  /**
   * Load transactions from API
   */
  async loadFromAPI() {
    try {
      this.loading = true;
      console.log('📡 Loading transactions from API...');

      const response = await WhitebirdAPI.transactions.getTransactions();

      if (response.isSuccess && response.data) {
        this.transactions = response.data;
        this.totalItems = this.transactions.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.filteredData = [...this.transactions];
        console.log(`✅ Loaded ${this.transactions.length} transactions from API`);
      } else {
        console.warn('⚠️ API returned no data');
        this.transactions = [];
        this.filteredData = [];
      }
    } catch (error) {
      console.error('❌ Failed to load transactions from API:', error);
      this.transactions = [];
      this.filteredData = [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const newBtn = document.getElementById('btnNewTransaction');
    if (newBtn) {
      newBtn.addEventListener('click', () => this.handleNew());
    }

    // Refresh button
    const refreshBtn = document.getElementById('btnRefreshTransactions');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        console.log('🔄 Refreshing transactions from API...');
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';
        refreshBtn.disabled = true;

        try {
          await this.loadFromAPI();
          this.updateStats();
          this.render();
          this.showNotification('success', '✅ Transactions refreshed successfully');
        } catch (error) {
          console.error('❌ Refresh failed:', error);
          this.showNotification('danger', '❌ Failed to refresh transactions');
        } finally {
          refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh';
          refreshBtn.disabled = false;
        }
      });
    }

    // Search functionality
    const searchInput = document.getElementById('searchTransactions');
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
    const statusFilter = document.getElementById('filterTransactionStatus');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.applyFilters());
    }
  }

  /**
   * Apply filters
   */
  applyFilters() {
    const searchQuery = document.getElementById('searchTransactions')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterTransactionStatus')?.value || '';

    this.filteredData = this.transactions.filter((trans) => {
      let match = true;

      // Search filter
      if (searchQuery) {
        match =
          match &&
          (trans.assetName?.toLowerCase().includes(searchQuery) ||
            trans.assetCode?.toLowerCase().includes(searchQuery) ||
            trans.fromEmployeeName?.toLowerCase().includes(searchQuery) ||
            trans.toEmployeeName?.toLowerCase().includes(searchQuery) ||
            trans.status?.toLowerCase().includes(searchQuery));
      }

      // Status filter
      if (statusFilter) {
        match = match && trans.status === statusFilter;
      }

      return match;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.render();
  }

  /**
   * Update stats - FIXED: Check if elements exist before updating
   */
  updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayTrans = this.transactions.filter((t) => 
      t.transactionDate && t.transactionDate.startsWith(today)
    ).length;
    
    const transfers = this.transactions.filter((t) => t.status === 'TRANSFER').length;
    const assignments = this.transactions.filter((t) => t.status === 'ASSIGN').length;
    const returns = this.transactions.filter((t) => t.status === 'RETURN').length;

    // Safe element updates
    const updateElement = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    };

    updateElement('todayTransactions', todayTrans);
    updateElement('transferCount', transfers);
    updateElement('assignCount', assignments);
    updateElement('returnCount', returns);
    updateElement('totalTransactions', this.transactions.length);
  }

  /**
   * Render transactions table
   */
  render() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    // Pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageData = this.filteredData.slice(start, end);

    // Status badge colors
    const statusColors = {
      TRANSFER: 'info',
      ASSIGN: 'primary',
      RETURN: 'success',
      REPAIR: 'warning',
      PENDING: 'secondary',
      COMPLETED: 'success',
      CANCELLED: 'danger'
    };

    if (pageData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <div class="text-muted">
              <i class="fas fa-inbox fa-2x mb-2"></i>
              <p>No transactions found</p>
            </div>
          </td>
        </tr>
      `;
      this.renderPagination();
      return;
    }

    // Build rows
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
    
    // Render pagination
    this.renderPagination();
    
    // Update showing count
    this.updateShowingCount();
  }

  /**
   * Format date
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  /**
   * Render pagination
   */
  renderPagination() {
    const pagination = document.getElementById('transactionsPagination');
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

    // Page numbers
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

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
      <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
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
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.render();
  }

  /**
   * Update showing count
   */
  updateShowingCount() {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.filteredData.length);
    
    const showingEl = document.getElementById('showingTransactions');
    const totalEl = document.getElementById('totalFilteredTransactions');
    
    if (showingEl) showingEl.textContent = `${start}-${end}`;
    if (totalEl) totalEl.textContent = this.filteredData.length;
  }

  /**
   * Attach row event listeners
   */
  attachRowEventListeners(tbody) {
    tbody.querySelectorAll('.btn-view').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.handleView(id);
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
        `From: ${transaction.fromEmployeeName || 'N/A'}\n` +
        `To: ${transaction.toEmployeeName || 'N/A'}\n` +
        `Date: ${this.formatDate(transaction.transactionDate)}`
      );
    }
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
        await this.loadFromAPI();
        this.updateStats();
        this.render();
        this.showNotification('success', 'Transaction deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete transaction:', error);
        this.showNotification('danger', 'Failed to delete transaction');
      }
    }
  }

  /**
   * Handle new transaction
   */
  async handleNew() {
    console.log('➕ Navigating to transactionscreate');
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
  showNotification(type, message) {
    if (window.showNotification) {
      window.showNotification(type, message);
    } else {
      alert(message);
    }
  }
}

// Export singleton instance
export const transactionsMenu = new TransactionsMenu();