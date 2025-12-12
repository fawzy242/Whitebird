/**
 * Model 3 Module - Complete Analytics & Charts
 * Features: Multiple chart types, Export, Date range, Real-time updates
 */

export class Model3Manager {
  constructor() {
    this.charts = {};
    this.realTimeInterval = null;
    this.currentData = this.generateSampleData();
  }

  /**
   * Initialize Model 3
   */
  initialize() {
    console.log('📊 Model3 Initializing...');
    this.initializeDateRange();
    this.setupEventListeners();
    this.initializeAllCharts();
    this.updateStats();
    this.startRealTimeUpdates();
    console.log('✅ Model3 Initialized!');
  }

  /**
   * Generate sample data
   */
  generateSampleData() {
    const days = 7;
    const labels = [];
    const revenue = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      revenue.push(Math.floor(Math.random() * 5000) + 10000);
    }

    return {
      labels,
      revenue,
      categories: {
        labels: ['Electronics', 'Clothing', 'Food', 'Books', 'Sports'],
        data: [35, 25, 20, 12, 8],
      },
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        thisYear: [45000, 52000, 48000, 61000, 58000, 67000],
        lastYear: [38000, 42000, 45000, 51000, 49000, 55000],
      },
      performance: {
        labels: ['Sales', 'Support', 'Marketing', 'Development', 'Quality'],
        data: [85, 92, 78, 88, 95],
      },
    };
  }

  /**
   * Initialize date range
   */
  initializeDateRange() {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');

    if (fromDate) fromDate.valueAsDate = lastWeek;
    if (toDate) toDate.valueAsDate = today;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Refresh charts
    const refreshBtn = document.getElementById('btnRefreshCharts');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshAllCharts());
    }

    // Export all charts
    const exportBtn = document.getElementById('btnExportCharts');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportAllCharts());
    }

    // Individual chart exports
    ['Line', 'Pie', 'Bar', 'Radar'].forEach((type) => {
      const btn = document.getElementById(`btnExport${type}Chart`);
      if (btn) {
        btn.addEventListener('click', () => this.exportChart(type.toLowerCase()));
      }
    });

    // Date range
    const quickRange = document.getElementById('quickDateRange');
    if (quickRange) {
      quickRange.addEventListener('change', (e) => this.handleQuickDateRange(e.target.value));
    }

    const applyBtn = document.getElementById('btnApplyDateRange');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyDateRange());
    }

    // Real-time toggle
    const realTimeToggle = document.getElementById('realTimeToggle');
    if (realTimeToggle) {
      realTimeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.startRealTimeUpdates();
        } else {
          this.stopRealTimeUpdates();
        }
      });
    }
  }

  /**
   * Initialize all charts
   */
  initializeAllCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    this.initLineChart();
    this.initPieChart();
    this.initBarChart();
    this.initRadarChart();
  }

  /**
   * Initialize line chart
   */
  initLineChart() {
    const canvas = document.getElementById('lineChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.charts.line = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.currentData.labels,
        datasets: [
          {
            label: 'Revenue',
            data: this.currentData.revenue,
            borderColor: '#dc2626',
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
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (context) => `Revenue: $${context.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value.toLocaleString(),
            },
          },
        },
      },
    });
  }

  /**
   * Initialize pie chart
   */
  initPieChart() {
    const canvas = document.getElementById('pieChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.charts.pie = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.currentData.categories.labels,
        datasets: [
          {
            data: this.currentData.categories.data,
            backgroundColor: ['#dc2626', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  /**
   * Initialize bar chart
   */
  initBarChart() {
    const canvas = document.getElementById('barChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.charts.bar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.currentData.monthly.labels,
        datasets: [
          {
            label: '2024',
            data: this.currentData.monthly.thisYear,
            backgroundColor: '#dc2626',
          },
          {
            label: '2023',
            data: this.currentData.monthly.lastYear,
            backgroundColor: '#9ca3af',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value / 1000 + 'k',
            },
          },
        },
      },
    });
  }

  /**
   * Initialize radar chart
   */
  initRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    this.charts.radar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: this.currentData.performance.labels,
        datasets: [
          {
            label: 'Performance Score',
            data: this.currentData.performance.data,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });
  }

  /**
   * Update stats
   */
  updateStats() {
    const totalRevenue = this.currentData.revenue.reduce((a, b) => a + b, 0);

    document.getElementById('statRevenue').textContent = '$' + totalRevenue.toLocaleString();
    document.getElementById('statRevenueChange').textContent = '+12.5%';
    document.getElementById('statUsers').textContent = '2,847';
    document.getElementById('statUsersChange').textContent = '+8.2%';
    document.getElementById('statConversion').textContent = '3.24%';
    document.getElementById('statConversionChange').textContent = '-0.3%';
    document.getElementById('statAvgOrder').textContent = '$' + (totalRevenue / 100).toFixed(0);
    document.getElementById('statAvgOrderChange').textContent = '+5.1%';
  }

  /**
   * Refresh all charts
   */
  refreshAllCharts() {
    console.log('🔄 Refreshing all charts...');

    // Regenerate data
    this.currentData = this.generateSampleData();

    // Update each chart
    Object.keys(this.charts).forEach((key) => {
      if (this.charts[key]) {
        this.charts[key].data.labels = this.currentData.labels || this.charts[key].data.labels;
        this.charts[key].update();
      }
    });

    this.updateStats();
    this.showNotification('success', 'Charts refreshed successfully');
  }

  /**
   * Export single chart
   */
  exportChart(type) {
    const chart = this.charts[type];
    if (!chart) return;

    const url = chart.toBase64Image();
    const link = document.createElement('a');
    link.download = `chart-${type}-${Date.now()}.png`;
    link.href = url;
    link.click();

    this.showNotification(
      'success',
      `${type.charAt(0).toUpperCase() + type.slice(1)} chart exported`
    );
  }

  /**
   * Export all charts
   */
  exportAllCharts() {
    console.log('📥 Exporting all charts...');

    Object.keys(this.charts).forEach((type) => {
      setTimeout(() => this.exportChart(type), 100 * Object.keys(this.charts).indexOf(type));
    });

    this.showNotification('success', 'All charts exported successfully');
  }

  /**
   * Handle quick date range
   */
  handleQuickDateRange(value) {
    const toDate = new Date();
    let fromDate = new Date();

    switch (value) {
      case 'today':
        fromDate = new Date();
        break;
      case 'week':
        fromDate.setDate(toDate.getDate() - 7);
        break;
      case 'month':
        fromDate.setDate(toDate.getDate() - 30);
        break;
      case 'year':
        fromDate.setFullYear(toDate.getFullYear() - 1);
        break;
      default:
        return;
    }

    document.getElementById('fromDate').valueAsDate = fromDate;
    document.getElementById('toDate').valueAsDate = toDate;
  }

  /**
   * Apply date range
   */
  applyDateRange() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!fromDate || !toDate) {
      this.showNotification('warning', 'Please select both dates');
      return;
    }

    console.log(`Applying date range: ${fromDate} to ${toDate}`);

    // Regenerate data based on date range
    this.refreshAllCharts();
    this.showNotification('success', 'Date range applied');
  }

  /**
   * Start real-time updates
   */
  startRealTimeUpdates() {
    if (this.realTimeInterval) return;

    this.realTimeInterval = setInterval(() => {
      // Update live stats with null checks
      const liveUsers = document.getElementById('liveUsers');
      const liveOrders = document.getElementById('liveOrders');
      const liveRevenue = document.getElementById('liveRevenue');

      if (liveUsers) {
        liveUsers.textContent = Math.floor(Math.random() * 100) + 150;
      }
      if (liveOrders) {
        liveOrders.textContent = Math.floor(Math.random() * 10) + 5;
      }
      if (liveRevenue) {
        liveRevenue.textContent = (Math.random() * 500 + 200).toFixed(2);
      }

      // Stop interval if elements don't exist (page navigated away)
      if (!liveUsers || !liveOrders || !liveRevenue) {
        console.log('⚠️ Model3 elements not found, stopping real-time updates');
        this.stopRealTimeUpdates();
      }
    }, 2000);

    console.log('🔴 Real-time updates started');
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates() {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
      console.log('⚫ Real-time updates stopped');
    }
  }

  /**
   * Show notification
   */
  showNotification(type, message) {
    if (window.showNotification) {
      window.showNotification(type, message);
    } else {
      console.log(`[${type}] ${message}`);
    }
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    this.stopRealTimeUpdates();
    Object.keys(this.charts).forEach((key) => {
      if (this.charts[key]) {
        this.charts[key].destroy();
      }
    });
  }
}

// Export singleton
export const model3Manager = new Model3Manager();
