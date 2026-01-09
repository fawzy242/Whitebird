/**
 * Reports Menu Module
 * Simple report download functionality
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import { reportsAPI } from '../services/api/reports.api.js';

class ReportsMenu {
  constructor() {
    this.reports = [
      { id: 1, name: 'Asset Transaction Report', apiAvailable: true, format: 'excel' },
      { id: 2, name: 'Surat Serah Terima Asset', apiAvailable: false, format: 'excel' }
    ];
    this.isDownloading = false;
    this.downloadAttempts = 0;
    this.maxAttempts = 2;
  }

  initialize() {
    console.log('📊 Reports Menu Initializing...');
    this.setupEventListeners();
    this.renderReportOptions();
    console.log('✅ Reports Menu Initialized!');
  }

  setupEventListeners() {
    const btnDownloadReport = document.getElementById('btnDownloadReport');
    if (btnDownloadReport) {
      btnDownloadReport.addEventListener('click', () => this.downloadReport());
    }
    
    // Juga bisa trigger dari elemen lain
    const downloadButtons = document.querySelectorAll('[data-action="download-report"]');
    downloadButtons.forEach(button => {
      button.addEventListener('click', () => this.downloadReport());
    });
  }

  renderReportOptions() {
    const selectReport = document.getElementById('selectReport');
    if (!selectReport) return;

    // Clear existing options except the first one
    while (selectReport.options.length > 1) {
      selectReport.remove(1);
    }

    // Add report options
    this.reports.forEach(report => {
      const option = document.createElement('option');
      option.value = report.id;
      option.textContent = report.name;
      option.dataset.available = report.apiAvailable;
      
      if (!report.apiAvailable) {
        option.disabled = true;
        option.textContent += ' (Coming Soon)';
        option.style.color = '#999';
      }
      
      selectReport.appendChild(option);
    });
  }

  async downloadReport() {
    // Cegah multiple clicks
    if (this.isDownloading) {
      this.showNotification('warning', 'Download is already in progress...', 2000);
      return;
    }

    const selectReport = document.getElementById('selectReport');
    if (!selectReport) {
      this.showNotification('error', 'Report selection not found');
      return;
    }

    const reportId = parseInt(selectReport.value);
    const report = this.reports.find(r => r.id === reportId);

    if (!report) {
      this.showNotification('warning', 'Please select a report');
      return;
    }

    if (!report.apiAvailable) {
      this.showNotification('info', 'This report feature is coming soon');
      return;
    }

    try {
      // Konfirmasi download
      const confirmed = await this.showConfirmModal(
        'Download Report',
        `Download "${report.name}" in Excel format?`,
        'Download',
        'Cancel'
      );

      if (!confirmed) return;

      // Mulai download
      this.isDownloading = true;
      this.downloadAttempts = 0;
      this.updateDownloadButton(true);

      this.showNotification('info', 'Preparing your report...', 0);

      // Lakukan download dengan retry logic
      const result = await this.downloadWithRetry();

      if (result.success) {
        this.showNotification('success', 
          `✅ Report downloaded successfully!<br>
           <small>File: ${result.filename} (${Math.round(result.size / 1024)} KB)</small>`, 
          5000
        );
      } else {
        throw new Error(result.error || 'Download failed');
      }

    } catch (error) {
      console.error('❌ Download process failed:', error);
      
      let errorMessage = 'Failed to download report';
      
      if (error.message.includes('401') || error.message.includes('session')) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('empty')) {
        errorMessage = 'Server returned empty file. Please try again.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      this.showNotification('error', errorMessage, 5000);
      
    } finally {
      this.isDownloading = false;
      this.updateDownloadButton(false);
    }
  }

  async downloadWithRetry() {
    while (this.downloadAttempts < this.maxAttempts) {
      this.downloadAttempts++;
      
      try {
        console.log(`Attempt ${this.downloadAttempts}/${this.maxAttempts}...`);
        
        if (this.downloadAttempts === 1) {
          // Attempt 1: Use direct download
          return await reportsAPI.downloadExcelReport();
        } else {
          // Attempt 2: Use blob method
          const result = await reportsAPI.generateExcelReport();
          if (result.success) {
            reportsAPI.downloadBlob(result.blob, result.filename);
            return result;
          }
        }
        
      } catch (error) {
        console.log(`Attempt ${this.downloadAttempts} failed:`, error.message);
        
        if (this.downloadAttempts < this.maxAttempts) {
          this.showNotification('warning', `Retrying download (${this.downloadAttempts}/${this.maxAttempts})...`, 2000);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Tunggu 1 detik
        } else {
          throw error;
        }
      }
    }
    
    throw new Error('All download attempts failed');
  }

  updateDownloadButton(isDownloading) {
    const btnDownloadReport = document.getElementById('btnDownloadReport');
    if (!btnDownloadReport) return;

    if (isDownloading) {
      btnDownloadReport.disabled = true;
      btnDownloadReport.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Downloading...
      `;
    } else {
      btnDownloadReport.disabled = false;
      btnDownloadReport.innerHTML = 'Download Report';
    }
  }

  async showConfirmModal(title, message, okText = 'OK', cancelText = 'Cancel') {
    if (confirmModal && typeof confirmModal.show === 'function') {
      try {
        return await confirmModal.show({
          type: 'confirm',
          title: title,
          message: message,
          okText: okText,
          cancelText: cancelText
        });
      } catch (error) {
        console.warn('Confirm modal error:', error);
      }
    }
    
    // Fallback ke browser confirm
    return window.confirm(`${title}\n\n${message}`);
  }

  showNotification(type, message, duration = 3000) {
    // Cek jika ada notification system global
    if (window.showNotification && typeof window.showNotification === 'function') {
      window.showNotification(type, message, duration);
      return;
    }
    
    // Fallback notification
    this.showFallbackNotification(type, message, duration);
  }

  showFallbackNotification(type, message, duration) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.report-notification-fallback');
    existing.forEach(el => el.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `report-notification-fallback alert alert-${this.getAlertType(type)}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      max-width: 500px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease;
    `;
    
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="flex-grow-1">${message}</div>
        <button type="button" class="btn-close ms-2" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, duration);
    }
    
    // Add CSS animation
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .report-notification-fallback {
          font-size: 14px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  getAlertType(type) {
    const types = {
      'success': 'success',
      'error': 'danger',
      'warning': 'warning',
      'info': 'info'
    };
    return types[type] || 'info';
  }

  // Public method untuk diakses dari luar
  triggerDownload(reportId = 1) {
    const selectReport = document.getElementById('selectReport');
    if (selectReport) {
      selectReport.value = reportId;
    }
    this.downloadReport();
  }
}

// Export singleton
export const reportsMenu = new ReportsMenu();

// Make available globally
if (typeof window !== 'undefined') {
  window.reportsMenu = reportsMenu;
  
  // Tambah helper untuk debugging
  window.downloadTestReport = () => {
    console.group('🧪 Test Report Download');
    reportsAPI.testDownload()
      .then(result => console.log('Test result:', result))
      .catch(error => console.error('Test error:', error))
      .finally(() => console.groupEnd());
  };
  
  console.log('📊 ReportsMenu loaded. Available methods:');
  console.log('- reportsMenu.triggerDownload(1)');
  console.log('- downloadTestReport()');
}