// File: AssetTransactionView.cs
using System.ComponentModel.DataAnnotations;

namespace Whitebird.Domain.Features.AssetTransactions.View
{
    public class AssetTransactionsListViewModel
    {
        public int AssetTransactionsId { get; set; }
        public int AssetId { get; set; }
        public string AssetCode { get; set; } = default!;
        public string AssetName { get; set; } = default!;
        public string? FromEmployeeName { get; set; }
        public string? ToEmployeeName { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Status { get; set; } = default!; // TAMBAHKAN INI
    }

    public class AssetTransactionsDetailViewModel
    {
        public int AssetTransactionsId { get; set; }

        [Required(ErrorMessage = "AssetId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "AssetId must be greater than 0")]
        public int AssetId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "FromEmployeeId must be greater than 0 if provided")]
        public int? FromEmployeeId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ToEmployeeId must be greater than 0 if provided")]
        public int? ToEmployeeId { get; set; }

        [Required(ErrorMessage = "TransactionDate is required")]
        public DateTime TransactionDate { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
        public string Status { get; set; } = default!; // TAMBAHKAN INI
    }

    public class AssetTransactionsCreateViewModel
    {
        [Required(ErrorMessage = "AssetId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "AssetId must be greater than 0")]
        public int AssetId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "FromEmployeeId must be greater than 0 if provided")]
        public int? FromEmployeeId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ToEmployeeId must be greater than 0 if provided")]
        public int? ToEmployeeId { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
        public string Status { get; set; } = "Pending"; // Default value
    }

    // TAMBAHKAN CLASS INI (belum ada di file Anda)
    public class AssetTransactionsUpdateViewModel
    {
        [Required(ErrorMessage = "AssetId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "AssetId must be greater than 0")]
        public int AssetId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "FromEmployeeId must be greater than 0 if provided")]
        public int? FromEmployeeId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ToEmployeeId must be greater than 0 if provided")]
        public int? ToEmployeeId { get; set; }

        [Required(ErrorMessage = "TransactionDate is required")]
        public DateTime TransactionDate { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
        public string Status { get; set; } = default!;
    }
}