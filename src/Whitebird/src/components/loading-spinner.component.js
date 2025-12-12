/**
 * Loading Spinner Component
 * Reusable loading indicator
 */

class LoadingSpinner {
  constructor() {
    this.spinner = null;
  }

  /**
   * Show loading spinner
   * @param {string} message - Optional loading message
   * @param {string} container - Optional container selector (defaults to body)
   */
  show(message = 'Loading...', container = 'body') {
    this.hide(); // Remove any existing spinner

    const spinnerHTML = `
            <div class="loading-spinner-overlay" id="loadingSpinner">
                <div class="loading-spinner-container">
                    <div class="spinner-border text-danger" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3 mb-0 text-white">${message}</p>
                </div>
            </div>
        `;

    const containerEl = document.querySelector(container);
    if (containerEl) {
      containerEl.insertAdjacentHTML('beforeend', spinnerHTML);
      this.spinner = document.getElementById('loadingSpinner');
    }
  }

  /**
   * Hide loading spinner
   */
  hide() {
    if (this.spinner) {
      this.spinner.remove();
      this.spinner = null;
    } else {
      const existing = document.getElementById('loadingSpinner');
      if (existing) existing.remove();
    }
  }

  /**
   * Show inline spinner in element
   * @param {string} selector - Element selector
   * @param {string} size - sm, md, lg
   */
  showInline(selector, size = 'sm') {
    const element = document.querySelector(selector);
    if (!element) return;

    const sizeClass = size === 'sm' ? 'spinner-border-sm' : '';
    const spinnerHTML = `
            <span class="spinner-border ${sizeClass} text-danger inline-spinner" role="status">
                <span class="visually-hidden">Loading...</span>
            </span>
        `;

    element.insertAdjacentHTML('beforeend', spinnerHTML);
  }

  /**
   * Hide inline spinner
   * @param {string} selector - Element selector
   */
  hideInline(selector) {
    const element = document.querySelector(selector);
    if (!element) return;

    const spinner = element.querySelector('.inline-spinner');
    if (spinner) spinner.remove();
  }
}

// Add CSS
const style = document.createElement('style');
style.textContent = `
    .loading-spinner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }

    .loading-spinner-container {
        text-align: center;
    }
`;
document.head.appendChild(style);

// Export singleton
export const loadingSpinner = new LoadingSpinner();

// Expose to window
if (typeof window !== 'undefined') {
  window.loadingSpinner = loadingSpinner;
}
