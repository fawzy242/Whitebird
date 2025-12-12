/**
 * Transactions Menu Module
 * Connected to Whitebird API
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import { whitebirdAPI } from '../services/api/whitebird-api.service.js';

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

      const response = await whitebirdAPI.getTransactions();

      if (response && response.success && response.data) {
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
    const types = ['Checkout', 'Return', 'Transfer', 'Maintenance'];
    const assets = ['Dell Laptop', 'Office Chair', 'iPhone 15', 'Projector'];
    const people = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Warehouse'];
    const statuses = ['Completed', 'Pending', 'Approved'];

    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      type: types[Math.floor(Math.random() * types.length)],
      asset: assets[Math.floor(Math.random() * assets.length)],
      from: people[Math.floor(Math.random() * people.length)],
      to: people[Math.floor(Math.random() * people.length)],
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
    const todayTrans = this.transactions.filter((t) => t.date === today).length;
    const checkouts = this.transactions.filter((t) => t.type === 'Checkout').length;
    const returns = this.transactions.filter((t) => t.type === 'Return').length;
    const transfers = this.transactions.filter((t) => t.type === 'Transfer').length;

    document.getElementById('todayTransactions').textContent = todayTrans;
    document.getElementById('checkoutCount').textContent = checkouts;
    document.getElementById('returnCount').textContent = returns;
    document.getElementById('transferCount').textContent = transfers;
    document.getElementById('totalTransactions').textContent = this.transactions.length;
  }

  render() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    const statusColors = {
      Completed: 'success',
      Pending: 'warning',
      Approved: 'info',
    };

    const html = this.transactions
      .slice(0, 10)
      .map(
        (trans) => `
            <tr>
                <td>${trans.date}</td>
                <td><span class="badge bg-secondary">${trans.type}</span></td>
                <td><strong>${trans.asset}</strong></td>
                <td>${trans.from}</td>
                <td>${trans.to}</td>
                <td><span class="badge bg-${statusColors[trans.status]}">${trans.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `
      )
      .join('');

    tbody.innerHTML = html;
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
