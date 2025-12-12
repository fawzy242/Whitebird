// File: EmployeeController.cs
using Microsoft.AspNetCore.Mvc;
using Whitebird.App.Features.Common.Service;
using Whitebird.App.Features.Employee.Interfaces;
using Whitebird.Domain.Features.Employee.View;
using Whitebird.Features.Common;

namespace Whitebird.Features.Employee.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Result<EmployeeDetailViewModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _employeeService.GetByIdAsync(id);
            return this.HandleResult(result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(Result<IEnumerable<EmployeeListViewModel>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _employeeService.GetAllAsync();
            return this.HandleResult(result);
        }

        [HttpGet("active")]
        [ProducesResponseType(typeof(Result<IEnumerable<EmployeeListViewModel>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActiveEmployees()
        {
            var result = await _employeeService.GetActiveEmployeesAsync();
            return this.HandleResult(result);
        }

        [HttpGet("grid")]
        [ProducesResponseType(typeof(PaginatedResult<EmployeeListViewModel>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetGridData(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var result = await _employeeService.GetGridDataAsync(page, pageSize, search);
            return this.HandleResult(result);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Result<EmployeeDetailViewModel>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] EmployeeCreateViewModel employee)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _employeeService.CreateAsync(employee);
            return this.HandleResult(result, nameof(GetById));
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(Result<EmployeeDetailViewModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(int id, [FromBody] EmployeeUpdateViewModel employee)
        {
            var validationResult = this.HandleModelState();
            if (validationResult != null)
                return validationResult;

            var result = await _employeeService.UpdateAsync(id, employee);
            return this.HandleResult(result);
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(Result), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _employeeService.DeleteAsync(id);
            return this.HandleResult(result);
        }
    }
}