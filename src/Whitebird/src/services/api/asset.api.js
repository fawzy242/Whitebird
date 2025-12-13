/**
 * Asset API Service
 * Asset management endpoints using axios
 */

import { axiosInstance } from './axios.instance.js';

class AssetAPI {
  endpoints = {
    ASSET: '/api/asset',
    ASSET_BY_ID: '/api/asset/{id}',
    ASSET_GRID: '/api/asset/grid',
  };

  replaceParams(endpoint, params) {
    return endpoint.replace(/{(\w+)}/g, (_, key) => params[key] || '');
  }

  async getAssets() {
    try {
      const response = await axiosInstance.get(this.endpoints.ASSET);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAssetsGrid(params = {}) {
    try {
      const response = await axiosInstance.get(this.endpoints.ASSET_GRID, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAsset(id) {
    try {
      const endpoint = this.replaceParams(this.endpoints.ASSET_BY_ID, { id });
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createAsset(data) {
    try {
      const response = await axiosInstance.post(this.endpoints.ASSET, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateAsset(id, data) {
    try {
      const endpoint = this.replaceParams(this.endpoints.ASSET_BY_ID, { id });
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteAsset(id) {
    try {
      const endpoint = this.replaceParams(this.endpoints.ASSET_BY_ID, { id });
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async searchAssets(searchTerm, page = 1, pageSize = 10) {
    return this.getAssetsGrid({
      search: searchTerm,
      page,
      pageSize,
    });
  }
}

// Export singleton instance
export const assetAPI = new AssetAPI();
export default assetAPI;
