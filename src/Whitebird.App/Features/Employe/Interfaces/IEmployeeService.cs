// File: IEmployeeService.cs
using Whitebird.App.Features.Common.Service;
using Whitebird.Domain.Features.Employee.View;

namespace Whitebird.App.Features.Employee.Interfaces
{
    public interface IEmployeeService
    {
        Task<Result<EmployeeDetailViewModel>> GetByIdAsync(int id);
        Task<Result<IEnumerable<EmployeeListViewModel>>> GetAllAsync();
        Task<Result<EmployeeDetailViewModel>> CreateAsync(EmployeeCreateViewModel employee);
        Task<Result<EmployeeDetailViewModel>> UpdateAsync(int id, EmployeeUpdateViewModel employee);
        Task<Result> DeleteAsync(int id);
        Task<Result<IEnumerable<EmployeeListViewModel>>> GetActiveEmployeesAsync();
        Task<PaginatedResult<EmployeeListViewModel>> GetGridDataAsync(int page, int pageSize, string? search = null);
    }
}