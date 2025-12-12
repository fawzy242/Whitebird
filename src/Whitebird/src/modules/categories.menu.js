/**
 * Categories Menu Module - Simple CRUD
 * Connected to Whitebird API
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import { whitebirdAPI } from '../services/api/whitebird-api.service.js';

export class CategoriesMenu {
  constructor() {
    this.categories = [];
    this.loading = false;
  }

  async initialize() {
    console.log('🏷️ Categories Menu Initializing...');
    await this.loadFromAPI();
    this.setupEventListeners();
    this.render();
    this.renderChart();
    console.log('✅ Categories Menu Initialized!');
  }

  /**
   * Load categories from API
   */
  async loadFromAPI() {
    try {
      this.loading = true;
      console.log('📡 Loading categories from API...');

      const response = await whitebirdAPI.getCategories();

      if (response && response.success && response.data) {
        this.categories = response.data;
        console.log(`✅ Loaded ${this.categories.length} categories from API`);
      } else {
        console.warn('⚠️ API returned no data, using fallback');
        this.categories = this.generateSampleCategories();
      }
    } catch (error) {
      console.error('❌ Failed to load categories from API:', error);
      console.log('📦 Using sample data as fallback');
      this.categories = this.generateSampleCategories();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Generate sample categories (fallback)
   */
  generateSampleCategories() {
    return [
      { id: 1, name: 'Computer', description: 'Computers and laptops', items: 15 },
      { id: 2, name: 'Furniture', description: 'Office furniture', items: 8 },
      { id: 3, name: 'Vehicle', description: 'Company vehicles', items: 3 },
      { id: 4, name: 'Equipment', description: 'Office equipment', items: 12 },
      { id: 5, name: 'Mobile Device', description: 'Phones and tablets', items: 10 },
    ];
  }

  setupEventListeners() {
    const addBtn = document.getElementById('btnAddCategory');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.handleAdd());
    }

    // Refresh button
    const refreshBtn = document.getElementById('btnRefreshCategories');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        console.log('🔄 Refreshing categories from API...');
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';
        refreshBtn.disabled = true;

        try {
          await this.loadFromAPI();
          this.render();
          this.renderChart();

          if (window.showNotification) {
            window.showNotification('success', '✅ Categories refreshed successfully from API');
          }
        } catch (error) {
          console.error('❌ Refresh failed:', error);
          if (window.showNotification) {
            window.showNotification('danger', '❌ Failed to refresh categories');
          }
        } finally {
          refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh';
          refreshBtn.disabled = false;
        }
      });
    }
  }

  render() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    const html = this.categories
      .map(
        (cat, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${cat.name}</strong></td>
                <td>${cat.description}</td>
                <td><span class="badge bg-info">${cat.items}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="categoriesMenu.handleEdit(${cat.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="categoriesMenu.handleDelete(${cat.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
      )
      .join('');

    tbody.innerHTML = html;
    document.getElementById('totalCategories').textContent = this.categories.length;
  }

  renderChart() {
    const canvas = document.getElementById('categoryChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.categories.map((c) => c.name),
        datasets: [
          {
            data: this.categories.map((c) => c.items),
            backgroundColor: ['#dc2626', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      },
    });
  }

  async handleAdd() {
    console.log('➕ Navigating to categoriescreate');

    if (window.router) {
      window.router.navigate('categoriescreate');
    } else {
      window.location.href = '/categoriescreate';
    }
  }

  async handleEdit(id) {
    const category = this.categories.find((c) => c.id === id);
    if (!category) return;

    console.log(`✏️ Navigating to categoriesupdate for ID: ${id}`);

    if (window.router) {
      window.router.navigate('categoriesupdate', { id });
    } else {
      sessionStorage.setItem('crudId', id);
      window.location.href = '/categoriesupdate';
    }
  }

  async handleDelete(id) {
    const category = this.categories.find((c) => c.id === id);
    if (!category) return;
    const result = await confirmModal.show({
      type: 'danger',
      title: 'Delete Category',
      message: `Delete ${category.name}? This cannot be undone.`,
      okText: 'Delete',
      okClass: 'btn-danger',
    });
    if (result) {
      this.categories = this.categories.filter((c) => c.id !== id);
      this.render();
      this.showNotification('success', 'Category deleted successfully');
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

window.categoriesMenu = new CategoriesMenu();
export const categoriesMenu = window.categoriesMenu;
