/**
 * Asset Transactions API Service
 */

import { axiosInstance } from './axios.instance.js';

class AssetTransactionsAPI {
  endpoints = {
    TRANSACTIONS: '/api/assettransactions',
    TRANSACTIONS_BY_ID: '/api/assettransactions/{id}',
    TRANSACTIONS_BY_ASSET: '/api/assettransactions/asset/{assetId}',
  };

  replaceParams(endpoint, params) {
    return endpoint.replace(/{(\w+)}/g, (_, key) => params[key] || '');
  }

  async getTransactions() {
    try {
      const response = await axiosInstance.get(this.endpoints.TRANSACTIONS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getTransaction(id) {
    try {
      const endpoint = this.replaceParams(this.endpoints.TRANSACTIONS_BY_ID, { id });
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getTransactionsByAsset(assetId, params = {}) {
    try {
      const endpoint = this.replaceParams(this.endpoints.TRANSACTIONS_BY_ASSET, { assetId });
      const response = await axiosInstance.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createTransaction(data) {
    try {
      const response = await axiosInstance.post(this.endpoints.TRANSACTIONS, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateTransaction(id, data) {
    try {
      const endpoint = this.replaceParams(this.endpoints.TRANSACTIONS_BY_ID, { id });
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteTransaction(id) {
    try {
      const endpoint = this.replaceParams(this.endpoints.TRANSACTIONS_BY_ID, { id });
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const assetTransactionsAPI = new AssetTransactionsAPI();
export default assetTransactionsAPI;
