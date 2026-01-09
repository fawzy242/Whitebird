/**
 * Asset API Service - DIPERBAIKI
 */

import { axiosInstance } from './axios.instance.js';

class AssetAPI {
  endpoints = {
    ASSET: '/api/asset',
    ASSET_BY_ID: '/api/asset/{id}',
    ASSET_GRID: '/api/asset/grid',
    ASSET_SEARCH: '/api/asset/search', // Endpoint ini TIDAK ADA di Swagger, jadi dihapus
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

  // DIPERBAIKI: Gunakan ASSET_GRID dengan parameter search
  async searchAssets(searchTerm, page = 1, pageSize = 10) {
    try {
      const response = await axiosInstance.get(this.endpoints.ASSET_GRID, {
        params: {
          search: searchTerm,
          page,
          pageSize,
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // HAPUS method ini karena tidak ada di Swagger
  // async getAssetsByCategory(categoryId) {
  //   try {
  //     const response = await axiosInstance.get(this.endpoints.ASSET, {
  //       params: { categoryId }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}

// Export singleton instance
export const assetAPI = new AssetAPI();
export default assetAPI;