/**
 * Empty State Component
 * Shows when no data is available
 */

class EmptyState {
    /**
     * Show empty state
     * @param {string} container - Container selector
     * @param {Object} options - Configuration options
     */
    show(container, options = {}) {
        const defaults = {
            icon: 'fa-inbox',
            title: 'No Data Available',
            message: 'There are no items to display',
            action: null, // { text: 'Add Item', onclick: () => {} }
        };

        const config = { ...defaults, ...options };

        const emptyStateHTML = `
            <div class="empty-state text-center py-5">
                <div class="empty-state-icon mb-3">
                    <i class="fas ${config.icon} fa-4x text-muted opacity-50"></i>
                </div>
                <h4 class="empty-state-title">${config.title}</h4>
                <p class="empty-state-message text-muted">${config.message}</p>
                ${config.action ? `
                    <button class="btn btn-primary mt-3" id="emptyStateAction">
                        <i class="fas fa-plus me-2"></i>${config.action.text}
                    </button>
                ` : ''}
            </div>
        `;

        const containerEl = document.querySelector(container);
        if (containerEl) {
            containerEl.innerHTML = emptyStateHTML;

            // Attach action handler
            if (config.action) {
                const actionBtn = document.getElementById('emptyStateAction');
                if (actionBtn) {
                    actionBtn.addEventListener('click', config.action.onclick);
                }
            }
        }
    }

    /**
     * Hide empty state
     * @param {string} container - Container selector
     */
    hide(container) {
        const containerEl = document.querySelector(container);
        if (containerEl) {
            const emptyState = containerEl.querySelector('.empty-state');
            if (emptyState) emptyState.remove();
        }
    }
}

// Export singleton
export const emptyState = new EmptyState();

// Expose to window
if (typeof window !== 'undefined') {
    window.emptyState = emptyState;
}
