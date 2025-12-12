/**
 * Searchable Dropdown Component
 * Advanced dropdown with search and filtering
 */

import { DOMUtils } from '../utils/dom-utils.js';
import { EventBus } from '../utils/event-bus.js';

export class SearchableDropdown {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      data: [],
      searchable: true,
      placeholder: 'Select an option...',
      searchPlaceholder: 'Search...',
      noResultsText: 'No results found',
      maxHeight: '300px',
      onSelect: null,
      ...options,
    };

    this.selectedValue = null;
    this.filteredData = [...this.options.data];
    this.isOpen = false;

    this.init();
  }

  /**
   * Initialize dropdown
   */
  init() {
    this.createDropdown();
    this.setupEventListeners();
  }

  /**
   * Create dropdown HTML
   */
  createDropdown() {
    const wrapper = document.createElement('div');
    wrapper.className = 'searchable-dropdown';

    wrapper.innerHTML = `
      <div class="dropdown-trigger" tabindex="0">
        <span class="dropdown-value">${this.options.placeholder}</span>
        <i class="fas fa-chevron-down dropdown-icon"></i>
      </div>
      <div class="dropdown-menu-custom">
        ${
          this.options.searchable
            ? `
          <div class="dropdown-search">
            <i class="fas fa-search"></i>
            <input type="text" class="form-control form-control-sm" 
                   placeholder="${this.options.searchPlaceholder}">
          </div>
        `
            : ''
        }
        <div class="dropdown-list" style="max-height: ${this.options.maxHeight}">
          ${this.renderOptions()}
        </div>
      </div>
    `;

    this.element.style.display = 'none';
    this.element.parentNode.insertBefore(wrapper, this.element);
    this.wrapper = wrapper;
  }

  /**
   * Render options
   */
  renderOptions() {
    if (this.filteredData.length === 0) {
      return `<div class="dropdown-no-results">${this.options.noResultsText}</div>`;
    }

    return this.filteredData
      .map((item) => {
        const value = typeof item === 'object' ? item.value : item;
        const label = typeof item === 'object' ? item.label : item;
        const selected = value === this.selectedValue ? 'selected' : '';

        return `
        <div class="dropdown-option ${selected}" data-value="${value}">
          ${label}
        </div>
      `;
      })
      .join('');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const trigger = this.wrapper.querySelector('.dropdown-trigger');
    const searchInput = this.wrapper.querySelector('.dropdown-search input');
    const menu = this.wrapper.querySelector('.dropdown-menu-custom');
    const list = this.wrapper.querySelector('.dropdown-list');

    // Toggle dropdown
    trigger.addEventListener('click', () => this.toggle());

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        DOMUtils.debounce((e) => {
          this.handleSearch(e.target.value);
        }, 300)
      );
    }

    // Option selection
    DOMUtils.on(list, 'click', '.dropdown-option', (e) => {
      const value = e.currentTarget.dataset.value;
      this.selectOption(value);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target)) {
        this.close();
      }
    });

    // Keyboard navigation
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  /**
   * Handle search
   */
  handleSearch(query) {
    const lowerQuery = query.toLowerCase();

    this.filteredData = this.options.data.filter((item) => {
      const label = typeof item === 'object' ? item.label : item;
      return label.toString().toLowerCase().includes(lowerQuery);
    });

    this.updateList();
  }

  /**
   * Update list display
   */
  updateList() {
    const list = this.wrapper.querySelector('.dropdown-list');
    list.innerHTML = this.renderOptions();
  }

  /**
   * Select option
   */
  selectOption(value) {
    this.selectedValue = value;

    // Find label
    const item = this.options.data.find((i) => {
      return (typeof i === 'object' ? i.value : i) === value;
    });
    const label = typeof item === 'object' ? item.label : item;

    // Update display
    const valueSpan = this.wrapper.querySelector('.dropdown-value');
    valueSpan.textContent = label;

    // Update original select
    this.element.value = value;

    // Trigger change event
    const event = new Event('change', { bubbles: true });
    this.element.dispatchEvent(event);

    // Callback
    if (this.options.onSelect) {
      this.options.onSelect(value, item);
    }

    EventBus.emit('dropdown:select', { value, item });
    this.close();
  }

  /**
   * Toggle dropdown
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open dropdown
   */
  open() {
    this.wrapper.classList.add('open');
    this.isOpen = true;

    const searchInput = this.wrapper.querySelector('.dropdown-search input');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
  }

  /**
   * Close dropdown
   */
  close() {
    this.wrapper.classList.remove('open');
    this.isOpen = false;

    const searchInput = this.wrapper.querySelector('.dropdown-search input');
    if (searchInput) {
      searchInput.value = '';
      this.filteredData = [...this.options.data];
      this.updateList();
    }
  }

  /**
   * Update data
   */
  updateData(data) {
    this.options.data = data;
    this.filteredData = [...data];
    this.updateList();
  }

  /**
   * Get selected value
   */
  getValue() {
    return this.selectedValue;
  }

  /**
   * Set value programmatically
   */
  setValue(value) {
    this.selectOption(value);
  }

  /**
   * Destroy dropdown
   */
  destroy() {
    if (this.wrapper) {
      this.wrapper.remove();
    }
    this.element.style.display = '';
  }
}

export default SearchableDropdown;
