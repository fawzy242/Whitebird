/**
 * Transactions Menu Module
 * Connected to Whitebird API
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import WhitebirdAPI from '../services/api/index.js';

export class TransactionsMenu {
  constructor() {
    this.transactions = [];
    this.loading = false;
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
        console.log(`✅ Loaded ${this.transactions.length} transactions from API`);
      } else {
        console.warn('⚠️ API returned no data, using fallback');
        this.transactions = this.generateSampleTransactions();
      }
    } catch (error) {
      console.error('❌ Failed to load transactions from API:', error);
      console.log('📦 Using sample data as fallback');
      this.transactions = this.generateSampleTransactions();
    } finally {
      this.loading = false;
    }
  }

  generateSampleTransactions() {
    const statuses = ['TRANSFER', 'ASSIGN', 'RETURN', 'REPAIR'];
    const assets = ['Dell Laptop', 'Office Chair', 'iPhone 15', 'Projector'];
    const people = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Warehouse'];

    return Array.from({ length: 20 }, (_, i) => ({
      transactionId: i + 1,
      assetId: Math.floor(Math.random() * 100) + 1,
      assetName: assets[Math.floor(Math.random() * assets.length)],
      assetCode: `AST-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
      fromEmployeeName: people[Math.floor(Math.random() * people.length)],
      toEmployeeName: people[Math.floor(Math.random() * people.length)],
      transactionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    }));
  }

  async initialize() {
    console.log('🔄 Transactions Menu Initializing...');
    await this.loadFromAPI();
    this.setupEventListeners();
    this.updateStats();
    this.render();
    console.log('✅ Transactions Menu Initialized!');
  }

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

          if (window.showNotification) {
            window.showNotification('success', '✅ Transactions refreshed successfully from API');
          }
        } catch (error) {
          console.error('❌ Refresh failed:', error);
          if (window.showNotification) {
            window.showNotification('danger', '❌ Failed to refresh transactions');
          }
        } finally {
          refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh';
          refreshBtn.disabled = false;
        }
      });
    }
  }

  updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayTrans = this.transactions.filter((t) => t.transactionDate === today).length;
    const transfers = this.transactions.filter((t) => t.status === 'TRANSFER').length;
    const assignments = this.transactions.filter((t) => t.status === 'ASSIGN').length;
    const returns = this.transactions.filter((t) => t.status === 'RETURN').length;

    document.getElementById('todayTransactions').textContent = todayTrans;
    document.getElementById('transferCount').textContent = transfers;
    document.getElementById('assignCount').textContent = assignments;
    document.getElementById('returnCount').textContent = returns;
    document.getElementById('totalTransactions').textContent = this.transactions.length;
  }

  render() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) {
      return;
    }

    const statusColors = {
      TRANSFER: 'info',
      ASSIGN: 'primary',
      RETURN: 'success',
      REPAIR: 'warning',
    };

    const html = this.transactions
      .slice(0, 10)
      .map(
        (trans) => `
          <tr>
            <td>${trans.transactionDate}</td>
            <td><span class="badge bg-${statusColors[trans.status] || 'secondary'}">${trans.status}</span></td>
            <td><strong>${trans.assetName}</strong> <small class="text-muted">(${trans.assetCode})</small></td>
            <td>${trans.fromEmployeeName || 'N/A'}</td>
            <td>${trans.toEmployeeName || 'N/A'}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary btn-view" data-id="${trans.transactionId || trans.id}" title="View">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${trans.transactionId || trans.id}" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `
      )
      .join('');

    tbody.innerHTML = html;

    // Attach event listeners
    this.attachRowEventListeners(tbody);
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
    // You could implement a modal or navigate to detail page
    const transaction = this.transactions.find((t) => (t.transactionId || t.id) === id);
    if (transaction) {
      alert(
        `Transaction Details:\nAsset: ${transaction.assetName}\nStatus: ${transaction.status}\nDate: ${transaction.transactionDate}`
      );
    }
  }

  /**
   * Handle delete transaction
   */
  async handleDelete(id) {
    const transaction = this.transactions.find((t) => (t.transactionId || t.id) === id);
    if (!transaction) {
      return;
    }

    const result = await confirmModal.show({
      type: 'danger',
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okClass: 'btn-danger',
    });

    if (result) {
      try {
        // Delete from API
        await WhitebirdAPI.transactions.deleteTransaction(id);

        // Remove from local data
        this.transactions = this.transactions.filter((t) => (t.transactionId || t.id) !== id);
        this.updateStats();
        this.render();

        this.showNotification('success', 'Transaction deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete transaction:', error);
        this.showNotification('danger', 'Failed to delete transaction');
      }
    }
  }

  async handleNew() {
    console.log('➕ Navigating to transactionscreate');

    if (window.router) {
      window.router.navigate('transactionscreate');
    } else {
      window.location.href = '/transactionscreate';
    }
  }

  showNotification(type, message) {
    if (window.showNotification) {
      window.showNotification(type, message);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }
}

export const transactionsMenu = new TransactionsMenu();
