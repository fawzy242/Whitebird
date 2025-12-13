/**
 * Categories Menu Module - Simple CRUD
 * Connected to Whitebird API
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import WhitebirdAPI from '../services/api/index.js';

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

      const response = await WhitebirdAPI.category.getCategories();

      if (response.isSuccess && response.data) {
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
      { categoryId: 1, categoryName: 'Computer', description: 'Computers and laptops', items: 15 },
      { categoryId: 2, categoryName: 'Furniture', description: 'Office furniture', items: 8 },
      { categoryId: 3, categoryName: 'Vehicle', description: 'Company vehicles', items: 3 },
      { categoryId: 4, categoryName: 'Equipment', description: 'Office equipment', items: 12 },
      {
        categoryId: 5,
        categoryName: 'Mobile Device',
        description: 'Phones and tablets',
        items: 10,
      },
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
            <td><strong>${cat.categoryName}</strong></td>
            <td>${cat.description || 'N/A'}</td>
            <td><span class="badge ${cat.isActive ? 'bg-success' : 'bg-secondary'}">${cat.isActive ? 'Active' : 'Inactive'}</span></td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="window.categoriesMenuInstance.handleEdit(${cat.categoryId || cat.id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="window.categoriesMenuInstance.handleDelete(${cat.categoryId || cat.id})">
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
        labels: this.categories.map((c) => c.categoryName),
        datasets: [
          {
            data: this.categories.map((c) => c.items || 5), // Fallback if no items count
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
    const category = this.categories.find((c) => (c.categoryId || c.id) === id);
    if (!category) return;

    console.log(`✏️ Navigating to categoriesupdate for ID: ${id}`);

    if (window.router) {
      window.router.navigate('categoriesupdate', { id });
    } else {
      sessionStorage.setItem('crudId', id);
      sessionStorage.setItem('crudMode', 'update');
      window.location.href = '/categoriesupdate';
    }
  }

  async handleDelete(id) {
    const category = this.categories.find((c) => (c.categoryId || c.id) === id);
    if (!category) return;

    const result = await confirmModal.show({
      type: 'danger',
      title: 'Delete Category',
      message: `Delete ${category.categoryName}? This cannot be undone.`,
      okText: 'Delete',
      okClass: 'btn-danger',
    });

    if (result) {
      try {
        // Delete from API
        await WhitebirdAPI.category.deleteCategory(id);

        // Remove from local data
        this.categories = this.categories.filter((c) => (c.categoryId || c.id) !== id);
        this.render();
        this.renderChart();

        this.showNotification('success', 'Category deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete category:', error);
        this.showNotification('danger', 'Failed to delete category');
      }
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

// Create instance
const categoriesMenuInstance = new CategoriesMenu();

// Export for module usage
export const categoriesMenu = categoriesMenuInstance;

// Expose to window for onclick handlers
if (typeof window !== 'undefined') {
  window.categoriesMenuInstance = categoriesMenuInstance;
}
