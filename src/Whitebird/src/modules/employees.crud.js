/**
 * Employees CRUD Module
 * =====================
 * Handles all CRUD operations for employee management
 * - Create, Read, Update, Delete operations
 * - Data validation
 * - Connected to Whitebird API
 * - Export functionality
 *
 * @module employees.crud
 * @requires confirm-modal.component
 */

import { confirmModal } from '../components/confirm-modal.component.js';
import { whitebirdAPI } from '../services/api/whitebird-api.service.js';

export class EmployeesCRUD {
  constructor() {
    this.employees = [];
    this.apiEndpoint = '/api/employee';
    this.useAPI = true; // Toggle for API vs mock
    this.initialize();
  }

  /**
   * Initialize - Load sample data
   */
  initialize() {
    this.employees = this.loadSampleData();
  }

  /**
   * Load sample employee data
   * @returns {Array} Sample employees
   */
  loadSampleData() {
    return [
      {
        id: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        department: 'IT',
        position: 'Senior Developer',
        hireDate: '2020-01-15',
        salary: 85000,
        status: 'Active',
        address: '123 Main St, City, State',
        photo: null,
      },
      {
        id: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1234567891',
        department: 'HR',
        position: 'HR Manager',
        hireDate: '2019-03-20',
        salary: 75000,
        status: 'Active',
        address: '456 Oak Ave, City, State',
        photo: null,
      },
      {
        id: 'EMP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.j@company.com',
        phone: '+1234567892',
        department: 'Sales',
        position: 'Sales Executive',
        hireDate: '2021-06-10',
        salary: 65000,
        status: 'Active',
        address: '789 Pine Rd, City, State',
        photo: null,
      },
      {
        id: 'EMP004',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.w@company.com',
        phone: '+1234567893',
        department: 'Marketing',
        position: 'Marketing Specialist',
        hireDate: '2021-08-15',
        salary: 60000,
        status: 'Active',
        address: '321 Elm St, City, State',
        photo: null,
      },
      {
        id: 'EMP005',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.b@company.com',
        phone: '+1234567894',
        department: 'Finance',
        position: 'Financial Analyst',
        hireDate: '2020-11-01',
        salary: 70000,
        status: 'Active',
        address: '654 Maple Ave, City, State',
        photo: null,
      },
    ];
  }

  // ========================================
  // CREATE
  // ========================================

  /**
   * Create new employee
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Created employee
   */
  async create(employeeData) {
    try {
      // Validate data
      this.validate(employeeData);

      let newEmployee;

      if (this.useAPI) {
        // Real API call
        console.log('📡 Creating employee via API...');
        const response = await whitebirdAPI.createEmployee(employeeData);

        if (response && response.success && response.data) {
          newEmployee = response.data;
          this.employees.push(newEmployee);
          console.log('✅ Employee created via API');
        } else {
          throw new Error('API returned no data');
        }
      } else {
        // Fallback: Mock API call
        await this.mockApiCall();

        newEmployee = {
          id: this.generateId(),
          ...employeeData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.employees.push(newEmployee);
      }

      // Success feedback
      await confirmModal.success('Success!', 'Employee added successfully!');

      return newEmployee;
    } catch (error) {
      console.error('❌ Failed to create employee:', error);
      await confirmModal.error('Error!', error.message || 'Failed to add employee');
      throw error;
    }
  }

  // ========================================
  // READ
  // ========================================

  /**
   * Get all employees
   * @returns {Array} All employees
   */
  getAll() {
    return [...this.employees];
  }

  /**
   * Set employees from API
   * @param {Array} employees - Employees from API
   */
  setEmployees(employees) {
    if (Array.isArray(employees)) {
      this.employees = employees;
      console.log(`✅ CRUD service updated with ${employees.length} employees`);
    }
  }

  /**
   * Get employee by ID
   * @param {string} id - Employee ID
   * @returns {Object|null} Employee or null
   */
  getById(id) {
    return this.employees.find((emp) => emp.id === id) || null;
  }

  /**
   * Filter employees
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered employees
   */
  filter(filters) {
    let result = [...this.employees];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(search) ||
          emp.lastName.toLowerCase().includes(search) ||
          emp.email.toLowerCase().includes(search) ||
          emp.id.toLowerCase().includes(search) ||
          emp.department.toLowerCase().includes(search) ||
          emp.position.toLowerCase().includes(search)
      );
    }

    // Department filter
    if (filters.department) {
      result = result.filter((emp) => emp.department === filters.department);
    }

    // Status filter
    if (filters.status) {
      result = result.filter((emp) => emp.status === filters.status);
    }

    return result;
  }

  // ========================================
  // UPDATE
  // ========================================

  /**
   * Update employee
   * @param {string} id - Employee ID
   * @param {Object} employeeData - Updated data
   * @returns {Promise<Object>} Updated employee
   */
  async update(id, employeeData) {
    try {
      const index = this.employees.findIndex((emp) => emp.id === id);

      if (index === -1) {
        throw new Error('Employee not found');
      }

      // Validate data
      this.validate(employeeData);

      let updatedEmployee;

      if (this.useAPI) {
        // Real API call
        console.log(`📡 Updating employee ${id} via API...`);
        const response = await whitebirdAPI.updateEmployee(id, employeeData);

        if (response && response.success && response.data) {
          updatedEmployee = response.data;
          this.employees[index] = updatedEmployee;
          console.log('✅ Employee updated via API');
        } else {
          throw new Error('API returned no data');
        }
      } else {
        // Fallback: Mock API call
        await this.mockApiCall();

        updatedEmployee = {
          ...this.employees[index],
          ...employeeData,
          updatedAt: new Date().toISOString(),
        };

        this.employees[index] = updatedEmployee;
      }

      // Success feedback
      await confirmModal.success('Success!', 'Employee updated successfully!');

      return updatedEmployee;
    } catch (error) {
      console.error('❌ Failed to update employee:', error);
      await confirmModal.error('Error!', error.message || 'Failed to update employee');
      throw error;
    }
  }

  // ========================================
  // DELETE
  // ========================================

  /**
   * Delete employee (with confirmation)
   * @param {string} id - Employee ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const employee = this.getById(id);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Confirmation dialog
      const confirmed = await confirmModal.delete(
        'Delete Employee',
        `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`
      );

      if (!confirmed) {
        return false;
      }

      if (this.useAPI) {
        // Real API call
        console.log(`📡 Deleting employee ${id} via API...`);
        const response = await whitebirdAPI.deleteEmployee(id);

        if (response && response.success) {
          this.employees = this.employees.filter((emp) => emp.id !== id);
          console.log('✅ Employee deleted via API');
        } else {
          throw new Error('API delete failed');
        }
      } else {
        // Fallback: Mock API call
        await this.mockApiCall();
        this.employees = this.employees.filter((emp) => emp.id !== id);
      }

      // Success feedback
      await confirmModal.success('Deleted!', 'Employee deleted successfully!');

      return true;
    } catch (error) {
      console.error('❌ Failed to delete employee:', error);
      await confirmModal.error('Error!', error.message || 'Failed to delete employee');
      throw error;
    }
  }

  // ========================================
  // EXPORT
  // ========================================

  /**
   * Export employees to CSV
   * @param {Array} employees - Employees to export (optional, defaults to all)
   * @returns {Promise<void>}
   */
  async exportToCSV(employees = null) {
    try {
      const dataToExport = employees || this.employees;

      const csv = this.generateCSV(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      window.URL.revokeObjectURL(url);

      await confirmModal.success(
        'Exported!',
        `${dataToExport.length} employee(s) exported successfully!`
      );
    } catch (error) {
      await confirmModal.error('Error!', 'Failed to export employees');
      throw error;
    }
  }

  /**
   * Generate CSV from employees
   * @param {Array} employees - Employees data
   * @returns {string} CSV string
   */
  generateCSV(employees) {
    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Department',
      'Position',
      'Hire Date',
      'Salary',
      'Status',
      'Address',
    ];

    const rows = employees.map((emp) => [
      emp.id,
      emp.firstName,
      emp.lastName,
      emp.email,
      emp.phone,
      emp.department,
      emp.position,
      emp.hireDate,
      emp.salary,
      emp.status,
      emp.address || '',
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  }

  // ========================================
  // VALIDATION
  // ========================================

  /**
   * Validate employee data
   * @param {Object} data - Employee data
   * @throws {Error} Validation error
   */
  validate(data) {
    const required = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'department',
      'position',
      'hireDate',
      'salary',
      'status',
    ];

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }

    // Salary validation
    if (data.salary && (isNaN(data.salary) || data.salary < 0)) {
      throw new Error('Salary must be a positive number');
    }

    return true;
  }

  // ========================================
  // UTILITIES
  // ========================================

  /**
   * Generate unique employee ID
   * @returns {string} New ID
   */
  generateId() {
    const maxId = this.employees.reduce((max, emp) => {
      const num = parseInt(emp.id.replace('EMP', ''));
      return num > max ? num : max;
    }, 0);

    return `EMP${String(maxId + 1).padStart(3, '0')}`;
  }

  /**
   * Mock API call (simulate network delay)
   * @returns {Promise<void>}
   */
  async mockApiCall() {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }

  /**
   * Get total count
   * @returns {number} Total employees
   */
  getCount() {
    return this.employees.length;
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      total: this.employees.length,
      active: this.employees.filter((e) => e.status === 'Active').length,
      inactive: this.employees.filter((e) => e.status === 'Inactive').length,
      byDepartment: this.employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}

// Create and export singleton instance
export const employeesCrud = new EmployeesCRUD();
