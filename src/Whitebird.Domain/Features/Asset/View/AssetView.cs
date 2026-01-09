// File: AssetView.cs
using System.ComponentModel.DataAnnotations;

namespace Whitebird.Domain.Features.Asset.View
{
    public class AssetListViewModel
    {
        public int AssetId { get; set; }
        public string AssetCode { get; set; } = default!;
        public string AssetName { get; set; } = default!;
        public string CategoryName { get; set; } = "Unknown";
        public string Status { get; set; } = default!;
        public string? CurrentHolderName { get; set; }
        public string? Condition { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public decimal? PurchasePrice { get; set; }
    }

    public class AssetDetailViewModel
    {
        public int AssetId { get; set; }
        public string AssetCode { get; set; } = default!;
        public string AssetName { get; set; } = default!;
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = "Unknown";
        public string? SerialNumber { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string? Condition { get; set; }
        public string Status { get; set; } = default!;
        public int? CurrentHolderId { get; set; }
        public string? CurrentHolderName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; } = default!;
    }

    public class AssetCreateViewModel
    {
        [Required(ErrorMessage = "AssetName is required")]
        [StringLength(100, ErrorMessage = "AssetName cannot exceed 100 characters")]
        public string AssetName { get; set; } = default!;

        [Required(ErrorMessage = "CategoryId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "CategoryId must be greater than 0")]
        public int CategoryId { get; set; }

        [StringLength(50, ErrorMessage = "SerialNumber cannot exceed 50 characters")]
        public string? SerialNumber { get; set; }

        public DateTime? PurchaseDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "PurchasePrice must be positive")]
        public decimal? PurchasePrice { get; set; }

        [StringLength(20, ErrorMessage = "Condition cannot exceed 20 characters")]
        public string? Condition { get; set; } = "Good";
    }

    public class AssetUpdateViewModel
    {
        [Required(ErrorMessage = "AssetName is required")]
        [StringLength(100, ErrorMessage = "AssetName cannot exceed 100 characters")]
        public string AssetName { get; set; } = default!;

        [Required(ErrorMessage = "CategoryId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "CategoryId must be greater than 0")]
        public int CategoryId { get; set; }

        [StringLength(50, ErrorMessage = "SerialNumber cannot exceed 50 characters")]
        public string? SerialNumber { get; set; }

        public DateTime? PurchaseDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "PurchasePrice must be positive")]
        public decimal? PurchasePrice { get; set; }

        [StringLength(20, ErrorMessage = "Condition cannot exceed 20 characters")]
        public string? Condition { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
        public string Status { get; set; } = default!;

        public int? CurrentHolderId { get; set; }

        [Required(ErrorMessage = "IsActive is required")]
        public bool IsActive { get; set; }
    }
}