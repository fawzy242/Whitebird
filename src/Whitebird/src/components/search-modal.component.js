/**
 * Search Modal Component V2 - Quick Links on Top
 */

class SearchModalComponent {
  constructor() {
    this.recentSearches = this.loadRecentSearches();
    this.pages = [
      { name: 'Dashboard', path: '/dashboard', icon: 'home', category: 'Main' },
      { name: 'Profile', path: '/profile', icon: 'user', category: 'Main' },
      { name: 'Settings', path: '/settings', icon: 'cog', category: 'Main' },

      { name: 'Employees', path: '/employees', icon: 'users', category: 'Data' },
      { name: 'Assets', path: '/assets', icon: 'box', category: 'Data' },
      { name: 'Categories', path: '/categories', icon: 'tags', category: 'Data' },
      { name: 'Transactions', path: '/transactions', icon: 'exchange-alt', category: 'Data' },

      { name: 'Data Table', path: '/model1', icon: 'table', category: 'Pages' },
      { name: 'Forms', path: '/model2', icon: 'edit', category: 'Pages' },
      { name: 'Analytics', path: '/model3', icon: 'chart-bar', category: 'Pages' },
      { name: 'Reports', path: '/reports', icon: 'chart-line', category: 'Pages' },
      { name: 'File Upload', path: '/file-upload', icon: 'cloud-upload-alt', category: 'Pages' },

      { name: 'Components', path: '/components', icon: 'th-large', category: 'UI' },
      { name: 'Buttons', path: '/buttons', icon: 'mouse-pointer', category: 'UI' },
    ];
    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  loadRecentSearches() {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  }

  saveRecentSearches() {
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  addToRecent(search) {
    this.recentSearches = this.recentSearches.filter((s) => s !== search);
    this.recentSearches.unshift(search);
    this.recentSearches = this.recentSearches.slice(0, 5);
    this.saveRecentSearches();
  }

  createModal() {
    const modalHTML = `
      <div class="modal fade" id="searchModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content search-modal-content">
            <div class="search-modal-header">
              <h6 class="text-white mb-3 d-flex align-items-center">
                <i class="fas fa-bolt me-2"></i>Quick Links
              </h6>
              <div class="quick-links-grid mb-3">
                <a href="/dashboard" class="quick-link-item" data-page="dashboard">
                  <i class="fas fa-home"></i>
                  <span>Dashboard</span>
                </a>
                <a href="/employees" class="quick-link-item" data-page="employees">
                  <i class="fas fa-users"></i>
                  <span>Employees</span>
                </a>
                <a href="/assets" class="quick-link-item" data-page="assets">
                  <i class="fas fa-box"></i>
                  <span>Assets</span>
                </a>
                <a href="/reports" class="quick-link-item" data-page="reports">
                  <i class="fas fa-chart-line"></i>
                  <span>Reports</span>
                </a>
                <a href="/profile" class="quick-link-item" data-page="profile">
                  <i class="fas fa-user"></i>
                  <span>Profile</span>
                </a>
                <a href="/settings" class="quick-link-item" data-page="settings">
                  <i class="fas fa-cog"></i>
                  <span>Settings</span>
                </a>
              </div>
              <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  class="search-input" 
                  id="searchInput" 
                  placeholder="Search pages, menus..." 
                  autocomplete="off"
                />
                <button class="search-close" data-bs-dismiss="modal">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <div class="search-modal-body">
              <!-- Recent Searches -->
              <div class="search-section" id="recentSection" style="display: none;">
                <h6 class="search-section-title">
                  <i class="fas fa-clock me-2"></i>Recent Searches
                </h6>
                <div id="recentSearches"></div>
              </div>

              <!-- Search Results -->
              <div class="search-section" id="resultsSection" style="display: none;">
                <h6 class="search-section-title">
                  <i class="fas fa-search me-2"></i>Search Results
                </h6>
                <div id="searchResults"></div>
              </div>

              <!-- No Results -->
              <div class="search-section" id="noResults" style="display: none;">
                <div class="no-results">
                  <i class="fas fa-search fa-3x mb-3 text-muted"></i>
                  <p>No results found</p>
                </div>
              </div>
            </div>

            <div class="search-modal-footer">
              <div class="search-hints">
                <kbd>↵</kbd> to select
                <kbd>ESC</kbd> to close
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('searchModal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('searchModal');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        this.performSearch(query);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const firstResult = document.querySelector('.search-result-item');
          if (firstResult) {
            firstResult.click();
          }
        }
      });
    }

    if (modal) {
      modal.addEventListener('shown.bs.modal', () => {
        searchInput.value = '';
        searchInput.focus();
        this.showRecent();
      });

      modal.addEventListener('hidden.bs.modal', () => {
        searchInput.value = '';
        this.hideResults();
      });
    }

    // Quick links click
    document.addEventListener('click', (e) => {
      const quickLink = e.target.closest('.quick-link-item');
      if (quickLink) {
        e.preventDefault();
        const page = quickLink.dataset.page;
        if (page) {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          }
          window.location.href = quickLink.href;
        }
      }
    });

    // Search result click
    document.addEventListener('click', (e) => {
      const resultItem = e.target.closest('.search-result-item');
      if (resultItem) {
        e.preventDefault();
        const page = resultItem.dataset.page;
        if (page) {
          this.addToRecent(resultItem.textContent.trim());
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          }
          window.location.href = resultItem.dataset.path;
        }
      }
    });
  }

  performSearch(query) {
    const resultsSection = document.getElementById('resultsSection');
    const recentSection = document.getElementById('recentSection');
    const noResults = document.getElementById('noResults');

    if (!query) {
      this.showRecent();
      return;
    }

    const filtered = this.pages.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );

    recentSection.style.display = 'none';

    if (filtered.length > 0) {
      noResults.style.display = 'none';
      resultsSection.style.display = 'block';

      const resultsHTML = filtered
        .map(
          (page) => `
        <a href="${page.path}" class="search-result-item" data-page="${page.name}" data-path="${page.path}">
          <i class="fas fa-${page.icon} me-3"></i>
          <div class="result-info">
            <div class="result-name">${page.name}</div>
            <div class="result-category">${page.category}</div>
          </div>
        </a>
      `
        )
        .join('');

      document.getElementById('searchResults').innerHTML = resultsHTML;
    } else {
      resultsSection.style.display = 'none';
      noResults.style.display = 'block';
    }
  }

  showRecent() {
    const recentSection = document.getElementById('recentSection');
    const resultsSection = document.getElementById('resultsSection');
    const noResults = document.getElementById('noResults');

    resultsSection.style.display = 'none';
    noResults.style.display = 'none';

    if (this.recentSearches.length > 0) {
      recentSection.style.display = 'block';
      const recentHTML = this.recentSearches
        .map(
          (search) => `
        <div class="recent-item">
          <i class="fas fa-clock me-2"></i>
          <span>${search}</span>
        </div>
      `
        )
        .join('');
      document.getElementById('recentSearches').innerHTML = recentHTML;
    } else {
      recentSection.style.display = 'none';
    }
  }

  hideResults() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('recentSection').style.display = 'none';
  }

  show() {
    // Cache modal instance for performance
    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(document.getElementById('searchModal'), {
        backdrop: true,
        keyboard: true,
      });
    }

    // Clear search input for fresh start
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }

    // Show modal (cached instance = faster)
    this.modalInstance.show();

    // Focus input after modal is shown (better UX)
    setTimeout(() => {
      if (searchInput) searchInput.focus();
    }, 300);
  }
}

export const searchModal = new SearchModalComponent();
