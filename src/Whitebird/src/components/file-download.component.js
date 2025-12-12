/**
 * File Download Component
 * Secure file download using Blob
 */

import { apiService } from '../services/api/axios.service.js';
import { EventBus } from '../utils/event-bus.js';

export class FileDownloadComponent {
  /**
   * Download file from URL as Blob
   */
  static async downloadFile(url, filename) {
    try {
      EventBus.emit('download:start', { url, filename });

      await apiService.downloadFile(url, filename);

      EventBus.emit('download:complete', { url, filename });
      EventBus.emit('notification:success', 'File downloaded successfully');

      return true;
    } catch (error) {
      EventBus.emit('download:error', { error, url, filename });
      EventBus.emit('notification:error', 'Download failed: ' + error.message);
      throw error;
    }
  }

  /**
   * Download data as file
   */
  static downloadData(data, filename, mimeType = 'application/octet-stream') {
    try {
      const blob = new Blob([data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      EventBus.emit('download:complete', { filename });
      EventBus.emit('notification:success', 'File downloaded successfully');

      return true;
    } catch (error) {
      EventBus.emit('download:error', { error, filename });
      EventBus.emit('notification:error', 'Download failed');
      throw error;
    }
  }

  /**
   * Download JSON as file
   */
  static downloadJSON(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    return this.downloadData(jsonString, filename, 'application/json');
  }

  /**
   * Download CSV data
   */
  static downloadCSV(data, filename) {
    return this.downloadData(data, filename, 'text/csv');
  }

  /**
   * Download text file
   */
  static downloadText(text, filename) {
    return this.downloadData(text, filename, 'text/plain');
  }

  /**
   * Convert table to CSV and download
   */
  static downloadTableAsCSV(tableElement, filename = 'table.csv') {
    const rows = Array.from(tableElement.querySelectorAll('tr'));
    const csv = rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells
          .map((cell) => {
            let text = cell.textContent.trim();
            if (text.includes(',') || text.includes('"') || text.includes('\n')) {
              text = '"' + text.replace(/"/g, '""') + '"';
            }
            return text;
          })
          .join(',');
      })
      .join('\n');

    return this.downloadCSV(csv, filename);
  }
}

export default FileDownloadComponent;
