/**
 * Breadcrumb Navigation Utility
 * Handles smooth SPA navigation for breadcrumb links
 */

class BreadcrumbNavigator {
  constructor() {
    this.init();
  }

  /**
   * Initialize breadcrumb navigation
   */
  init() {
    // Delegate click events to all breadcrumb links
    document.addEventListener('click', (e) => {
      const breadcrumbLink = e.target.closest('.breadcrumb-item a[data-route]');

      if (breadcrumbLink) {
        e.preventDefault();
        const route = breadcrumbLink.getAttribute('data-route');

        if (window.router) {
          console.log('📍 Breadcrumb navigation to:', route);
          window.router.navigate(route);
        } else {
          // Fallback
          window.location.href = '/' + route;
        }
      }
    });

    console.log('✅ Breadcrumb Navigator initialized');
  }
}

// Initialize immediately
const breadcrumbNavigator = new BreadcrumbNavigator();

export { breadcrumbNavigator };
