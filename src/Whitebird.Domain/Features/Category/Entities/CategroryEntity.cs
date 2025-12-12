using Whitebird.Domain.Common.Entities;
namespace Whitebird.Domain.Features.Category.Entities
{
    public class CategoryEntity : AuditableEntity
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = default!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}