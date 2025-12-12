/**
 * Enhanced Sidebar Module - FIXED
 * - Auto-open on menu click when collapsed WITHOUT page refresh
 */

class EnhancedSidebar {
  constructor() {
    this.sidebar = null;
    this.isCollapsed = false;
    this.init();
  }

  init() {
    this.sidebar = document.querySelector('.sidebar-container');
    this.setupEventListeners();
    this.restoreSidebarState();
  }

  restoreSidebarState() {
    // Restore sidebar collapse state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
      
      if (this.sidebar) {
        if (this.isCollapsed) {
          this.sidebar.classList.add('collapsed');
          document.body.classList.add('sidebar-collapsed');
        } else {
          this.sidebar.classList.remove('collapsed');
          document.body.classList.remove('sidebar-collapsed');
        }
      }
    } else {
      this.checkInitialState();
    }
  }

  checkInitialState() {
    if (this.sidebar) {
      this.isCollapsed = this.sidebar.classList.contains('collapsed');
    }
  }

  saveSidebarState() {
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }

  setupEventListeners() {
    // Listen for sidebar toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.menu-toggle')) {
        setTimeout(() => {
          this.isCollapsed = this.sidebar.classList.contains('collapsed');
          this.saveSidebarState();
        }, 100);
      }
    });

    // Listen for menu item clicks when sidebar is collapsed
    document.addEventListener('click', (e) => {
      const menuLink = e.target.closest('.sidebar-menu a:not(.submenu-toggle)');
      
      // Only handle if:
      // 1. It's a menu link
      // 2. Sidebar is collapsed
      // 3. Desktop view (>= 1024px)
      if (menuLink && this.isCollapsed && window.innerWidth >= 1024) {
        // DON'T prevent default - let the router handle navigation
        
        // Just expand sidebar
        this.sidebar.classList.remove('collapsed');
        document.body.classList.remove('sidebar-collapsed');
        this.isCollapsed = false;
        
        // Don't do any navigation here - router will handle it
      }
    });

    // Handle submenu toggle when collapsed
    document.addEventListener('click', (e) => {
      const submenuToggle = e.target.closest('.submenu-toggle');
      
      if (submenuToggle && this.isCollapsed && window.innerWidth >= 1024) {
        e.preventDefault();
        
        // Expand sidebar first for submenu
        this.sidebar.classList.remove('collapsed');
        document.body.classList.remove('sidebar-collapsed');
        this.isCollapsed = false;
        
        // Open submenu after expansion
        setTimeout(() => {
          const parent = submenuToggle.parentElement;
          const submenu = parent.querySelector('.submenu');
          
          if (parent.classList.contains('open')) {
            parent.classList.remove('open');
            submenu.classList.remove('show');
          } else {
            // Close other submenus
            document.querySelectorAll('.sidebar-menu .has-submenu').forEach(item => {
              if (item !== parent) {
                item.classList.remove('open');
                item.querySelector('.submenu')?.classList.remove('show');
              }
            });
            
            parent.classList.add('open');
            submenu.classList.add('show');
          }
        }, 300);
      }
    });
  }
}

// Initialize enhanced sidebar
export const enhancedSidebar = new EnhancedSidebar();
