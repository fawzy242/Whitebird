// File: EmployeeService.cs
using Mapster;
using MapsterMapper;
using Whitebird.App.Features.Common.Service;
using Whitebird.App.Features.Employee.Interfaces;
using Whitebird.Domain.Features.Employee.Entities;
using Whitebird.Domain.Features.Employee.View;
using Whitebird.Infra.Features.Common;

namespace Whitebird.App.Features.Employee.Service
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IGenericRepository<EmployeeEntity> _repository;
        private readonly IMapper _mapper;

        public EmployeeService(IGenericRepository<EmployeeEntity> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Result<EmployeeDetailViewModel>> GetByIdAsync(int id)
        {
            try
            {
                var employee = await _repository.GetByIdAsync(id);
                if (employee == null)
                    return Result<EmployeeDetailViewModel>.Failure("Employee not found");

                var viewModel = _mapper.Map<EmployeeDetailViewModel>(employee);
                return Result<EmployeeDetailViewModel>.Success(viewModel);
            }
            catch (Exception ex)
            {
                return Result<EmployeeDetailViewModel>.Failure($"Failed to get employee: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<EmployeeListViewModel>>> GetAllAsync()
        {
            try
            {
                var employees = await _repository.GetAllAsync();
                var viewModels = _mapper.Map<IEnumerable<EmployeeListViewModel>>(employees);
                return Result<IEnumerable<EmployeeListViewModel>>.Success(viewModels);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<EmployeeListViewModel>>.Failure($"Failed to get employees: {ex.Message}");
            }
        }

        public async Task<Result<EmployeeDetailViewModel>> CreateAsync(EmployeeCreateViewModel employee)
        {
            try
            {
                var entity = _mapper.Map<EmployeeEntity>(employee);

                // Generate EmployeeCode if not provided
                if (string.IsNullOrEmpty(entity.EmployeeCode))
                {
                    entity.EmployeeCode = GenerateEmployeeCode();
                }

                // Set default values
                entity.IsActive = true;
                entity.CreatedDate = DateTime.UtcNow;
                entity.CreatedBy = "System"; // TODO: Replace with actual user from context

                var id = await _repository.InsertAsync(entity);
                var createdEmployee = await _repository.GetByIdAsync(id);

                if (createdEmployee == null)
                    return Result<EmployeeDetailViewModel>.Failure("Failed to retrieve created employee");

                var viewModel = _mapper.Map<EmployeeDetailViewModel>(createdEmployee);
                return Result<EmployeeDetailViewModel>.Success(viewModel, "Employee created successfully");
            }
            catch (Exception ex)
            {
                return Result<EmployeeDetailViewModel>.Failure($"Failed to create employee: {ex.Message}");
            }
        }

        public async Task<Result<EmployeeDetailViewModel>> UpdateAsync(int id, EmployeeUpdateViewModel employee)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    return Result<EmployeeDetailViewModel>.Failure("Employee not found");

                // Update properties
                _mapper.Map(employee, existing);

                var affectedRows = await _repository.UpdateAsync(existing);
                if (affectedRows <= 0)
                    return Result<EmployeeDetailViewModel>.Failure("Failed to update employee");

                var viewModel = _mapper.Map<EmployeeDetailViewModel>(existing);
                return Result<EmployeeDetailViewModel>.Success(viewModel, "Employee updated successfully");
            }
            catch (Exception ex)
            {
                return Result<EmployeeDetailViewModel>.Failure($"Failed to update employee: {ex.Message}");
            }
        }

        public async Task<Result> DeleteAsync(int id)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                    return Result.Failure("Employee not found");

                // Check if employee is used as current holder before deletion
                // TODO: Implement CheckIfEmployeeUsed method
                // var isUsed = await CheckIfEmployeeUsed(id);
                // if (isUsed) return Result.Failure("Employee is in use and cannot be deleted");

                // Soft delete
                existing.IsActive = false;
                await _repository.UpdateAsync(existing);

                return Result.Success("Employee deleted successfully");
            }
            catch (Exception ex)
            {
                return Result.Failure($"Failed to delete employee: {ex.Message}");
            }
        }

        public async Task<Result<IEnumerable<EmployeeListViewModel>>> GetActiveEmployeesAsync()
        {
            try
            {
                var employees = await _repository.GetAllAsync();
                var activeEmployees = employees.Where(e => e.IsActive);
                var viewModels = _mapper.Map<IEnumerable<EmployeeListViewModel>>(activeEmployees);
                return Result<IEnumerable<EmployeeListViewModel>>.Success(viewModels);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<EmployeeListViewModel>>.Failure($"Failed to get active employees: {ex.Message}");
            }
        }

        public async Task<PaginatedResult<EmployeeListViewModel>> GetGridDataAsync(int page, int pageSize, string? search = null)
        {
            try
            {
                var employees = await _repository.GetAllAsync();

                // Filter active employees
                var query = employees.Where(e => e.IsActive);

                // Apply search filter
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(e =>
                        e.FullName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        e.EmployeeCode.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        (e.Department != null && e.Department.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                        (e.Position != null && e.Position.Contains(search, StringComparison.OrdinalIgnoreCase))
                    );
                }

                var totalCount = query.Count();
                var pagedData = query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var viewModels = _mapper.Map<IEnumerable<EmployeeListViewModel>>(pagedData);
                return PaginatedResult<EmployeeListViewModel>.Success(viewModels, totalCount, page, pageSize);
            }
            catch (Exception ex)
            {
                return PaginatedResult<EmployeeListViewModel>.Failure($"Failed to get grid data: {ex.Message}");
            }
        }

        private string GenerateEmployeeCode()
        {
            return $"EMP-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        }

        // TODO: Implement this method to check if employee is used by assets
        // private async Task<bool> CheckIfEmployeeUsed(int employeeId)
        // {
        //     // Query assets that use this employee as current holder
        //     // Return true if any asset uses this employee
        //     return false;
        // }
    }
}