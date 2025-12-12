using Whitebird.Domain.Common.Entities;
namespace Whitebird.Domain.Features.Employee.Entities
{
    public class EmployeeEntity : AuditableEntity
    {
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public bool IsActive { get; set; }
    }
}