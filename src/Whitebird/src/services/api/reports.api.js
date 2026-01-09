/**
 * Reports API Service
 * Simple API calls for report generation
 */

import { axiosInstance } from './axios.instance.js';
import { StorageService } from '../storage.service.js';

class ReportsAPI {
  endpoints = {
    REPORTS_EXCEL: '/api/reports/excel',
    REPORTS_DOWNLOAD: '/api/reports/excel/download',
  };

  /**
   * Generate Excel report - Method 1: Menggunakan fetch API
   * @returns {Promise<Object>} Response dengan blob dan filename
   */
  async generateExcelReport() {
    console.log('📤 Generating Excel report...');
    
    try {
      // METHOD 1: Menggunakan fetch API langsung (lebih reliable untuk file download)
      const token = StorageService.getToken();
      
      const response = await fetch(this.endpoints.REPORTS_EXCEL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        credentials: 'include',
      });

      console.log('📥 Fetch response:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Handle errors
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        
        // Coba baca error sebagai text
        try {
          const errorText = await response.text();
          if (errorText) {
            // Coba parse sebagai JSON
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorMessage;
            } catch {
              errorMessage = errorText.substring(0, 200);
            }
          }
        } catch (e) {
          // Ignore
        }
        
        throw new Error(errorMessage);
      }

      // Get blob dari response
      const blob = await response.blob();
      
      console.log('📦 Blob created:', {
        type: blob.type,
        size: blob.size,
        sizeKB: Math.round(blob.size / 1024) + ' KB',
      });

      // Validasi blob
      if (blob.size === 0) {
        throw new Error('Received empty file from server');
      }

      // Ekstrak filename dari headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = this.extractFilenameFromHeaders(contentDisposition) || 
                      `Asset_Transaction_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      console.log('✅ File ready:', filename);
      
      return {
        success: true,
        blob: blob,
        filename: filename,
        size: blob.size,
      };

    } catch (error) {
      console.error('❌ Fetch method failed:', error);
      
      // METHOD 2: Fallback ke axios
      console.log('🔄 Trying axios fallback...');
      return await this.generateExcelReportWithAxios();
    }
  }

  /**
   * Method 2: Menggunakan axios (fallback)
   */
  async generateExcelReportWithAxios() {
    try {
      console.log('📤 Trying axios download...');
      
      const response = await axiosInstance.get(this.endpoints.REPORTS_EXCEL, {
        responseType: 'blob',
      });

      console.log('📥 Axios response:', {
        status: response.status,
        headers: response.headers,
        dataType: typeof response.data,
        isBlob: response.data instanceof Blob,
      });

      // Pastikan data adalah Blob
      let blob;
      if (response.data instanceof Blob) {
        blob = response.data;
      } else if (response.data instanceof ArrayBuffer) {
        // Convert ArrayBuffer ke Blob
        blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
      } else {
        // Convert apapun ke Blob
        const dataArray = typeof response.data === 'string' 
          ? new TextEncoder().encode(response.data)
          : response.data;
        
        blob = new Blob([dataArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
      }

      // Validasi blob
      if (blob.size === 0) {
        // Coba lihat isi blob (mungkin error message)
        const text = await blob.text();
        console.error('Empty blob content:', text.substring(0, 500));
        throw new Error('Received empty file');
      }

      const filename = this.extractFilenameFromResponse(response) || 
                      `Asset_Transaction_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      return {
        success: true,
        blob: blob,
        filename: filename,
      };

    } catch (error) {
      console.error('❌ Axios method also failed:', error);
      throw error;
    }
  }

  /**
   * Download Excel report dan trigger download langsung
   */
  async downloadExcelReport() {
    try {
      console.log('⬇️ Starting Excel download...');
      
      // Dapatkan file dari server
      const result = await this.generateExcelReport();
      
      if (!result.success || !result.blob) {
        throw new Error('Failed to get file from server');
      }

      // Download file
      this.downloadBlobDirect(result.blob, result.filename);
      
      return {
        success: true,
        filename: result.filename,
        size: result.size,
      };

    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }

  /**
   * Download file dari blob
   * @param {Blob} blob - File blob
   * @param {string} filename - Nama file
   */
  downloadBlob(blob, filename) {
    if (!blob || !(blob instanceof Blob)) {
      console.error('❌ Invalid blob:', blob);
      throw new Error('Invalid file data');
    }

    try {
      console.log('💾 Saving file:', filename, blob.size + ' bytes');
      
      // Buat URL untuk blob
      const url = window.URL.createObjectURL(blob);
      
      // Buat elemen anchor untuk download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Tambahkan ke dokumen dan klik
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('✅ File download initiated');
      }, 100);

    } catch (error) {
      console.error('❌ Error downloading blob:', error);
      throw error;
    }
  }

  /**
   * Download blob langsung (versi lebih aman)
   */
  downloadBlobDirect(blob, filename) {
    try {
      // Method 1: createObjectURL
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.position = 'fixed';
      a.style.left = '-9999px';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Method 1 failed:', error);
      
      // Method 2: FileSaver.js style
      try {
        const reader = new FileReader();
        reader.onload = function(e) {
          const a = document.createElement('a');
          a.href = e.target.result;
          a.download = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
        reader.readAsDataURL(blob);
      } catch (error2) {
        console.error('All download methods failed:', error2);
        throw error2;
      }
    }
  }

  /**
   * Extract filename dari response headers (axios)
   */
  extractFilenameFromResponse(response) {
    try {
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        // Pattern: attachment; filename="report.xlsx"
        const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches && matches[1]) {
          let filename = matches[1].replace(/['"]/g, '');
          // Decode URI jika perlu
          filename = decodeURIComponent(filename);
          return filename;
        }
      }
      return null;
    } catch (error) {
      console.warn('Error extracting filename:', error);
      return null;
    }
  }

  /**
   * Extract filename dari headers (fetch API)
   */
  extractFilenameFromHeaders(contentDisposition) {
    if (!contentDisposition) return null;
    
    try {
      // Coba berbagai pattern
      const patterns = [
        /filename\*?=UTF-8''([^;]+)/i,
        /filename\*?=([^;]+)/i,
        /filename="?([^"]+)"?/i,
      ];
      
      for (const pattern of patterns) {
        const match = contentDisposition.match(pattern);
        if (match && match[1]) {
          let filename = match[1];
          // Decode URI component jika perlu
          try {
            filename = decodeURIComponent(filename);
          } catch (e) {
            // Jika decode gagal, gunakan aslinya
          }
          return filename.trim();
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Error parsing content-disposition:', error);
      return null;
    }
  }

  /**
   * Test endpoint untuk debugging
   */
  async testDownload() {
    console.group('🔍 Testing Excel Download');
    
    try {
      // Test 1: Check server connection
      console.log('1. Testing server connection...');
      const healthResponse = await axiosInstance.get('/health').catch(() => null);
      console.log('Server health:', healthResponse?.status);
      
      // Test 2: Try download
      console.log('2. Attempting download...');
      const result = await this.downloadExcelReport();
      
      console.log('✅ Test successful:', result);
      return { success: true, ...result };
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      return { success: false, error: error.message };
      
    } finally {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const reportsAPI = new ReportsAPI();
export default reportsAPI;