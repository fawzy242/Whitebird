/**
 * Reports Menu Module
 */

import { confirmModal } from '../components/confirm-modal.component.js';

export class ReportsMenu {
  constructor() {
    this.recentReports = [
      { name: 'Asset Inventory Q4 2024', type: 'Asset', generated: '2024-12-01', by: 'Admin' },
      {
        name: 'Employee Records Nov 2024',
        type: 'Employee',
        generated: '2024-11-30',
        by: 'HR Manager',
      },
      {
        name: 'Transaction History Q3',
        type: 'Transaction',
        generated: '2024-10-15',
        by: 'Accountant',
      },
    ];
  }

  initialize() {
    console.log('📊 Reports Menu Initializing...');
    this.setupEventListeners();
    this.render();
    console.log('✅ Reports Menu Initialized!');
  }

  setupEventListeners() {
    // Quick reports
    document
      .getElementById('btnAssetReport')
      ?.addEventListener('click', () => this.generateQuickReport('Asset Inventory'));
    document
      .getElementById('btnEmployeeReport')
      ?.addEventListener('click', () => this.generateQuickReport('Employee'));
    document
      .getElementById('btnTransactionReport')
      ?.addEventListener('click', () => this.generateQuickReport('Transaction'));
    document
      .getElementById('btnFinancialReport')
      ?.addEventListener('click', () => this.generateQuickReport('Financial'));

    // Custom report
    document
      .getElementById('btnGenerateReport')
      ?.addEventListener('click', () => this.generateCustomReport());
  }

  render() {
    const tbody = document.getElementById('recentReportsBody');
    if (!tbody) {
      return;
    }

    const html = this.recentReports
      .map(
        (report) => `
            <tr>
                <td><strong>${report.name}</strong></td>
                <td><span class="badge bg-info">${report.type}</span></td>
                <td>${report.generated}</td>
                <td>${report.by}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `
      )
      .join('');

    tbody.innerHTML = html;
  }

  async generateQuickReport(type) {
    const result = await confirmModal.show({
      type: 'confirm',
      title: 'Generate Report',
      message: `Generate ${type} Report?`,
      okText: 'Generate',
    });

    if (result) {
      // Simulate generation
      this.showNotification('success', `${type} Report generated successfully`);

      // Simulate download
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#';
        link.download = `${type}-report.pdf`;
        link.click();
      }, 500);
    }
  }

  async generateCustomReport() {
    const reportType = document.getElementById('reportType')?.value;
    const fromDate = document.getElementById('fromDate')?.value;
    const toDate = document.getElementById('toDate')?.value;

    if (!fromDate || !toDate) {
      this.showNotification('warning', 'Please select date range');
      return;
    }

    const result = await confirmModal.show({
      type: 'confirm',
      title: 'Generate Custom Report',
      message: `Generate ${reportType} from ${fromDate} to ${toDate}?`,
      okText: 'Generate',
    });

    if (result) {
      this.showNotification('success', 'Custom report generated successfully');
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

export const reportsMenu = new ReportsMenu();
