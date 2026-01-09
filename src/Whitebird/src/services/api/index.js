/**
 * Main API Service Export
 * Simple and clean exports
 */

import { authAPI } from './auth.api.js';
import { assetAPI } from './asset.api.js';
import { employeeAPI } from './employee.api.js';
import { categoryAPI } from './category.api.js';
import { assetTransactionsAPI } from './asset-transactions.api.js';
import { reportsAPI } from './reports.api.js';
import { axiosInstance } from './axios.instance.js';
import { StorageService } from '../storage.service.js';

// Helper functions
const logout = () => {
  StorageService.clearAuth();
  return { success: true, message: 'Logged out successfully' };
};

const checkHealth = async () => {
  try {
    const response = await axiosInstance.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const testConnection = async () => {
  console.log('🔍 Testing API Connection...');
  console.log('📍 Current Origin:', window.location.origin);
  console.log('🌐 Base URL:', axiosInstance.defaults.baseURL || '(relative paths)');
  console.log('🔑 Has Token:', !!StorageService.getToken());

  try {
    const health = await checkHealth();
    console.log('✅ API Connection Successful:', health);
    return { success: true, data: health };
  } catch (error) {
    console.error('❌ API Connection Failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Test khusus untuk report download
const testReportDownload = async () => {
  console.group('📊 Testing Report Download');
  try {
    console.log('1. Checking permissions...');
    const token = StorageService.getToken();
    console.log('Token available:', !!token);
    
    console.log('2. Testing endpoint...');
    const response = await axiosInstance.get('/api/reports/excel', {
      responseType: 'blob',
      validateStatus: null // Tidak throw error untuk status non-2xx
    });
    
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      dataType: typeof response.data,
    });
    
    if (response.status === 200) {
      console.log('✅ Endpoint is accessible');
      
      // Coba download kecil
      if (response.data instanceof Blob && response.data.size > 0) {
        console.log(`✅ File size: ${response.data.size} bytes`);
        
        // Simpan sample kecil untuk inspeksi
        const sample = response.data.slice(0, Math.min(100, response.data.size));
        const reader = new FileReader();
        reader.onload = () => {
          console.log('First 100 bytes:', reader.result);
        };
        reader.readAsText(sample);
        
        return { 
          success: true, 
          status: response.status,
          size: response.data.size,
          type: response.data.type
        };
      } else {
        console.warn('⚠️ Response data is not a valid blob');
        return { success: false, error: 'Invalid response format' };
      }
    } else {
      console.error('❌ Endpoint returned error:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  } finally {
    console.groupEnd();
  }
};

// Main API object
const WhitebirdAPI = {
  // Individual services
  auth: authAPI,
  asset: assetAPI,
  employee: employeeAPI,
  category: categoryAPI,
  transactions: assetTransactionsAPI,
  reports: reportsAPI,

  // Helper functions
  logout,
  checkHealth,
  testConnection,
  testReportDownload,

  // Axios instance for advanced use
  axios: axiosInstance,

  // Storage service
  storage: StorageService,
  
  // Quick download helper
  downloadReport: () => reportsAPI.downloadExcelReport(),
};

// Export individual services (for direct import)
export { 
  authAPI, 
  assetAPI, 
  employeeAPI, 
  categoryAPI, 
  assetTransactionsAPI, 
  reportsAPI, 
  axiosInstance 
};

// Export main API object
export default WhitebirdAPI;

// Debug helpers in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.WhitebirdAPI = WhitebirdAPI;

  // Console helpers
  window.testAPI = () => WhitebirdAPI.testConnection();
  window.testReport = () => WhitebirdAPI.testReportDownload();
  window.getToken = () => StorageService.getToken();
  window.clearAuth = () => WhitebirdAPI.logout();
  window.downloadNow = () => WhitebirdAPI.downloadReport();

  console.log('🔧 WhitebirdAPI loaded for debugging');
  console.log('Available test commands:');
  console.log('- testAPI() - Test connection');
  console.log('- testReport() - Test report download');
  console.log('- downloadNow() - Quick download');
}