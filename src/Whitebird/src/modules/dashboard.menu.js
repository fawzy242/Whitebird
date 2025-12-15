/**
 * Dashboard Module - Complete Implementation
 * Handles dashboard stats, charts, and data visualization
 */

export class DashboardMenu {
  constructor() {
    this.chartInstances = {};
    this.currentPeriod = 'week';
  }

  /**
   * Initialize dashboard
   */
  initialize() {
    console.log('🎯 Dashboard Initializing...');

    this.generateStatsCards();
    this.generateActivityTimeline();
    this.generateRecentOrders();
    this.generateTopProducts();
    this.generatePerformanceMetrics();

    // Initialize charts if Chart.js is loaded
    if (typeof Chart !== 'undefined') {
      this.initializeCharts();
    }

    this.setupEventListeners();

    console.log('✅ Dashboard Initialized!');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('btnRefreshDashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshDashboard();
      });
    }

    // Export report button
    const exportBtn = document.getElementById('btnExportReport');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportReport();
      });
    }

    // Period selector buttons
    const periodBtns = document.querySelectorAll('[data-period]');
    periodBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        // Update active state
        periodBtns.forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');

        // Update period and refresh chart
        this.currentPeriod = e.target.dataset.period;
        this.updateSalesChart();
      });
    });
  }

  /**
   * Generate statistics cards
   */
  generateStatsCards() {
    const container = document.getElementById('statsCardsContainer');
    if (!container) {
      return;
    }

    const stats = [
      {
        title: 'Total Revenue',
        value: '$54,239',
        change: '+12.5%',
        trend: 'up',
        icon: 'dollar-sign',
        color: 'primary',
      },
      {
        title: 'Total Orders',
        value: '1,847',
        change: '+8.2%',
        trend: 'up',
        icon: 'shopping-cart',
        color: 'success',
      },
      {
        title: 'New Customers',
        value: '423',
        change: '-3.1%',
        trend: 'down',
        icon: 'users',
        color: 'warning',
      },
      {
        title: 'Conversion Rate',
        value: '3.24%',
        change: '+0.8%',
        trend: 'up',
        icon: 'chart-line',
        color: 'info',
      },
    ];

    const statsHTML = stats
      .map(
        (stat) => `
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="card stat-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="stat-icon bg-${stat.color}">
                                <i class="fas fa-${stat.icon}"></i>
                            </div>
                            <span class="stat-change ${stat.trend === 'up' ? 'text-success' : 'text-danger'}">
                                <i class="fas fa-arrow-${stat.trend}"></i> ${stat.change}
                            </span>
                        </div>
                        <h6 class="text-muted mb-2">${stat.title}</h6>
                        <h3 class="mb-0">${stat.value}</h3>
                    </div>
                </div>
            </div>
        `
      )
      .join('');

    container.innerHTML = statsHTML;
  }

  /**
   * Generate activity timeline
   */
  /**
   * Generate Activity Timeline
   */
  generateActivityTimeline() {
    const container = document.getElementById('activityTimeline');
    const countBadge = document.getElementById('activityCount');

    if (!container) {
      console.warn('Activity timeline container not found');
      return;
    }

    const activities = [
      {
        icon: 'box',
        color: 'success',
        title: 'New Asset Added',
        detail: 'Laptop Dell XPS 15 has been registered',
        time: '2 mins ago',
      },
      {
        icon: 'user-check',
        color: 'primary',
        title: 'Asset Checked Out',
        detail: 'John Doe checked out Projector Epson',
        time: '15 mins ago',
      },
      {
        icon: 'tools',
        color: 'warning',
        title: 'Maintenance Scheduled',
        detail: 'AC Unit #5 maintenance tomorrow',
        time: '30 mins ago',
      },
      {
        icon: 'exchange-alt',
        color: 'info',
        title: 'Asset Transferred',
        detail: 'Monitor moved from IT to Marketing',
        time: '1 hour ago',
      },
      {
        icon: 'check-circle',
        color: 'success',
        title: 'Asset Returned',
        detail: 'Camera Canon returned by Jane Smith',
        time: '2 hours ago',
      },
      {
        icon: 'exclamation-triangle',
        color: 'danger',
        title: 'Low Stock Alert',
        detail: 'Only 3 USB cables remaining',
        time: '3 hours ago',
      },
    ];

    // Update count badge
    if (countBadge) {
      countBadge.textContent = activities.length;
    }

    // Generate timeline HTML
    let html = '';
    activities.forEach((activity, index) => {
      html += `
                <div class="timeline-item ${index === activities.length - 1 ? 'last' : ''}">
                    <div class="timeline-dot bg-${activity.color}">
                        <i class="fas fa-${activity.icon}"></i>
                    </div>
                    <div class="timeline-card">
                        <div class="timeline-header">
                            <strong class="timeline-title">${activity.title}</strong>
                            <small class="timeline-time">${activity.time}</small>
                        </div>
                        <p class="timeline-detail mb-0">${activity.detail}</p>
                    </div>
                </div>
            `;
    });

    container.innerHTML = html;
    console.log('✅ Activity timeline generated with', activities.length, 'items');
  }

  /**
   * Generate recent orders table
   */
  generateRecentOrders() {
    const tbody = document.getElementById('recentOrdersBody');
    const countBadge = document.getElementById('ordersCount');
    if (!tbody) {
      return;
    }

    const orders = [
      {
        id: '#1847',
        customer: 'John Doe',
        product: 'Laptop Pro X1',
        amount: '$1,299',
        status: 'Delivered',
        date: '2024-12-10',
      },
      {
        id: '#1846',
        customer: 'Jane Smith',
        product: 'Wireless Mouse',
        amount: '$29',
        status: 'Processing',
        date: '2024-12-10',
      },
      {
        id: '#1845',
        customer: 'Bob Johnson',
        product: 'USB-C Cable',
        amount: '$15',
        status: 'Shipped',
        date: '2024-12-09',
      },
      {
        id: '#1844',
        customer: 'Alice Brown',
        product: 'Monitor 27"',
        amount: '$399',
        status: 'Delivered',
        date: '2024-12-09',
      },
      {
        id: '#1843',
        customer: 'Charlie Wilson',
        product: 'Keyboard RGB',
        amount: '$89',
        status: 'Cancelled',
        date: '2024-12-08',
      },
    ];

    if (countBadge) {
      countBadge.textContent = orders.length;
    }

    const statusColors = {
      Delivered: 'success',
      Processing: 'warning',
      Shipped: 'info',
      Cancelled: 'danger',
    };

    const ordersHTML = orders
      .map(
        (order) => `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${order.customer}</td>
                <td>${order.product}</td>
                <td><strong>${order.amount}</strong></td>
                <td><span class="badge bg-${statusColors[order.status]}">${order.status}</span></td>
                <td>${order.date}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `
      )
      .join('');

    tbody.innerHTML = ordersHTML;
  }

  /**
   * Generate top products list
   */
  generateTopProducts() {
    const container = document.getElementById('topProductsList');
    if (!container) {
      return;
    }

    const products = [
      { name: 'Laptop Pro X1', sales: 145, revenue: '$188,355', trend: 'up' },
      { name: 'Wireless Mouse', sales: 432, revenue: '$12,528', trend: 'up' },
      { name: 'Monitor 27"', sales: 89, revenue: '$35,511', trend: 'down' },
      { name: 'USB-C Cable', sales: 567, revenue: '$8,505', trend: 'up' },
      { name: 'Keyboard RGB', sales: 234, revenue: '$20,826', trend: 'up' },
    ];

    const productsHTML = products
      .map(
        (product, index) => `
            <div class="product-item d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <div class="d-flex align-items-center">
                    <div class="product-rank me-3">
                        <span class="badge ${index === 0 ? 'bg-warning' : 'bg-secondary'}">#${index + 1}</span>
                    </div>
                    <div>
                        <h6 class="mb-0">${product.name}</h6>
                        <small class="text-muted">${product.sales} sales</small>
                    </div>
                </div>
                <div class="text-end">
                    <strong class="d-block">${product.revenue}</strong>
                    <small class="${product.trend === 'up' ? 'text-success' : 'text-danger'}">
                        <i class="fas fa-arrow-${product.trend}"></i>
                    </small>
                </div>
            </div>
        `
      )
      .join('');

    container.innerHTML = productsHTML;
  }

  /**
   * Generate performance metrics
   */
  generatePerformanceMetrics() {
    const container = document.getElementById('performanceMetrics');
    if (!container) {
      return;
    }

    const metrics = [
      { label: 'Customer Satisfaction', value: 94, color: 'success' },
      { label: 'Order Fulfillment', value: 87, color: 'info' },
      { label: 'Product Quality', value: 92, color: 'primary' },
      { label: 'Delivery Speed', value: 78, color: 'warning' },
    ];

    const metricsHTML = metrics
      .map(
        (metric) => `
            <div class="metric-item mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>${metric.label}</span>
                    <strong>${metric.value}%</strong>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-${metric.color}" role="progressbar" 
                         style="width: ${metric.value}%" 
                         aria-valuenow="${metric.value}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
            </div>
        `
      )
      .join('');

    container.innerHTML = metricsHTML;
  }

  /**
   * Initialize charts
   */
  initializeCharts() {
    this.initSalesChart();
    this.initRevenueChart();
    this.initTrafficChart();
  }

  /**
   * Initialize sales chart
   */
  initSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    this.chartInstances.sales = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Sales',
            data: [12, 19, 15, 25, 22, 30, 28],
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0,0,0,0.05)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  /**
   * Initialize revenue chart (doughnut)
   */
  initRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    this.chartInstances.revenue = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Products', 'Services', 'Subscriptions', 'Others'],
        datasets: [
          {
            data: [45, 25, 20, 10],
            backgroundColor: [
              'rgb(220, 38, 38)',
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  /**
   * Initialize traffic chart (bar)
   */
  initTrafficChart() {
    const canvas = document.getElementById('trafficChart');
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    this.chartInstances.traffic = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Direct', 'Organic', 'Social', 'Email', 'Referral'],
        datasets: [
          {
            label: 'Visitors',
            data: [1200, 1900, 800, 600, 400],
            backgroundColor: 'rgb(220, 38, 38)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  /**
   * Update sales chart based on period
   */
  updateSalesChart() {
    if (!this.chartInstances.sales) {
      return;
    }

    const data = {
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [12, 19, 15, 25, 22, 30, 28],
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [85, 110, 95, 125],
      },
      year: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        values: [450, 520, 490, 580, 610, 650, 700, 680, 720, 750, 800, 850],
      },
    };

    const periodData = data[this.currentPeriod];

    this.chartInstances.sales.data.labels = periodData.labels;
    this.chartInstances.sales.data.datasets[0].data = periodData.values;
    this.chartInstances.sales.update();
  }

  /**
   * Refresh dashboard
   */
  refreshDashboard() {
    console.log('🔄 Refreshing dashboard...');

    // Show loading state
    const refreshBtn = document.getElementById('btnRefreshDashboard');
    if (refreshBtn) {
      const originalHTML = refreshBtn.innerHTML;
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Refreshing...';
      refreshBtn.disabled = true;

      // Simulate refresh
      setTimeout(() => {
        this.generateStatsCards();
        this.generateActivityTimeline();
        this.generateRecentOrders();
        this.generateTopProducts();
        this.generatePerformanceMetrics();

        refreshBtn.innerHTML = originalHTML;
        refreshBtn.disabled = false;

        this.showNotification('success', 'Dashboard refreshed successfully!');
      }, 1000);
    }
  }

  /**
   * Export report
   */
  exportReport() {
    console.log('📥 Exporting report...');

    const exportBtn = document.getElementById('btnExportReport');
    if (exportBtn) {
      const originalHTML = exportBtn.innerHTML;
      exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Exporting...';
      exportBtn.disabled = true;

      setTimeout(() => {
        exportBtn.innerHTML = originalHTML;
        exportBtn.disabled = false;

        this.showNotification('success', 'Report exported successfully!');

        // Simulate download
        const link = document.createElement('a');
        link.href = '#';
        link.download = 'dashboard-report.pdf';
        link.click();
      }, 1500);
    }
  }

  /**
   * Show notification
   */
  showNotification(type, message) {
    // Use existing notification system if available
    if (window.showNotification) {
      window.showNotification(type, message);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }
}

// Export singleton instance
export const dashboardMenu = new DashboardMenu();
