/**
 * Category API Service - DIPERBAIKI
 */

import { axiosInstance } from './axios.instance.js';

class CategoryAPI {
  endpoints = {
    CATEGORY: '/api/category',
    CATEGORY_BY_ID: '/api/category/{id}',
    CATEGORY_ACTIVE: '/api/category/active',
    // CATEGORY_SEARCH: '/api/category/search', // ❌ HAPUS - Tidak ada di Swagger
  };

  replaceParams(endpoint, params) {
    return endpoint.replace(/{(\w+)}/g, (_, key) => params[key] || '');
  }

  async getCategories(params = {}) { // ✅ Tambah params
    try {
      const response = await axiosInstance.get(this.endpoints.CATEGORY, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getActiveCategories() {
    try {
      const response = await axiosInstance.get(this.endpoints.CATEGORY_ACTIVE);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCategory(id) {
    try {
      const endpoint = this.replaceParams(this.endpoints.CATEGORY_BY_ID, { id });
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createCategory(data) {
    try {
      const response = await axiosInstance.post(this.endpoints.CATEGORY, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(id, data) {
    try {
      const endpoint = this.replaceParams(this.endpoints.CATEGORY_BY_ID, { id });
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      const endpoint = this.replaceParams(this.endpoints.CATEGORY_BY_ID, { id });
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // DIPERBAIKI: Gunakan endpoint utama dengan parameter
  async searchCategories(searchTerm) {
    try {
      const response = await axiosInstance.get(this.endpoints.CATEGORY, {
        params: { search: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const categoryAPI = new CategoryAPI();
export default categoryAPI;