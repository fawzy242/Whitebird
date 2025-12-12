using Whitebird.Domain.Common.Entities;
namespace Whitebird.Domain.Features.Asset.Entities
{
    public class AssetEntity : AuditableEntity
    {
        public int AssetId { get; set; }
        public string AssetCode { get; set; } = default!;
        public string AssetName { get; set; } = default!;
        public int CategoryId { get; set; }
        public string? SerialNumber { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string? Condition { get; set; }
        public string Status { get; set; } = "Available";
        public int? CurrentHolderId { get; set; }
        public bool IsActive { get; set; }
    }
}