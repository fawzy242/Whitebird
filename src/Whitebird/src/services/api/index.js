/**
 * Main API Service Export
 * Simple and clean exports
 */

import { authAPI } from './auth.api.js';
import { assetAPI } from './asset.api.js';
import { employeeAPI } from './employee.api.js';
import { categoryAPI } from './category.api.js';
import { assetTransactionsAPI } from './asset-transactions.api.js';
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

// Main API object
const WhitebirdAPI = {
  // Individual services
  auth: authAPI,
  asset: assetAPI,
  employee: employeeAPI,
  category: categoryAPI,
  transactions: assetTransactionsAPI,

  // Helper functions
  logout,
  checkHealth,
  testConnection,

  // Axios instance for advanced use
  axios: axiosInstance,

  // Storage service
  storage: StorageService,
};

// Export individual services (for direct import)
export { authAPI, assetAPI, employeeAPI, categoryAPI, assetTransactionsAPI, axiosInstance };

// Export main API object
export default WhitebirdAPI;

// Debug helpers in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.WhitebirdAPI = WhitebirdAPI;

  // Console helpers
  window.testAPI = () => WhitebirdAPI.testConnection();
  window.getToken = () => StorageService.getToken();
  window.clearAuth = () => WhitebirdAPI.logout();

  console.log('🔧 WhitebirdAPI loaded for debugging');
}
