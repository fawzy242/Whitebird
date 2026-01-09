/**
 * Employee API Service - DIPERBAIKI
 */

import { axiosInstance } from './axios.instance.js';

class EmployeeAPI {
  endpoints = {
    EMPLOYEE: '/api/employee',
    EMPLOYEE_BY_ID: '/api/employee/{id}',
    EMPLOYEE_ACTIVE: '/api/employee/active',
    EMPLOYEE_GRID: '/api/employee/grid',
    // EMPLOYEE_SEARCH: '/api/employee/search', // ❌ HAPUS - Tidak ada di Swagger
  };

  replaceParams(endpoint, params) {
    return endpoint.replace(/{(\w+)}/g, (_, key) => params[key] || '');
  }

  async getEmployees(params = {}) { // ✅ Tambah params
    try {
      const response = await axiosInstance.get(this.endpoints.EMPLOYEE, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getActiveEmployees() {
    try {
      const response = await axiosInstance.get(this.endpoints.EMPLOYEE_ACTIVE);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEmployeesGrid(params = {}) {
    try {
      const response = await axiosInstance.get(this.endpoints.EMPLOYEE_GRID, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEmployee(id) {
    try {
      const endpoint = this.replaceParams(this.endpoints.EMPLOYEE_BY_ID, { id });
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createEmployee(data) {
    try {
      const response = await axiosInstance.post(this.endpoints.EMPLOYEE, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateEmployee(id, data) {
    try {
      const endpoint = this.replaceParams(this.endpoints.EMPLOYEE_BY_ID, { id });
      const response = await axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteEmployee(id) {
    try {
      const endpoint = this.replaceParams(this.endpoints.EMPLOYEE_BY_ID, { id });
      const response = await axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async searchEmployees(searchTerm, page = 1, pageSize = 10) {
    try {
      const response = await axiosInstance.get(this.endpoints.EMPLOYEE_GRID, {
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
  // async getEmployeesByDepartment(department) {
  //   try {
  //     const response = await axiosInstance.get(this.endpoints.EMPLOYEE, {
  //       params: { department }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}

export const employeeAPI = new EmployeeAPI();
export default employeeAPI;