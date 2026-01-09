// File: Reports.cs
using System.ComponentModel.DataAnnotations;

namespace Whitebird.Domain.Features.Reports.View;

public class ReportsAssetTransactionViewModel
{
    [Display(Name = "Employee Code")]
    public string EmployeeCode { get; set; } = default!;

    [Display(Name = "Full Name")]
    public string FullName { get; set; } = default!;

    [Display(Name = "Email")]
    public string Email { get; set; } = default!;

    [Display(Name = "Category Name")]
    public string CategoryName { get; set; } = default!;

    [Display(Name = "Category ID")]
    public int CategoryId { get; set; }

    [Display(Name = "Asset Name")]
    public string AssetName { get; set; } = default!;

    [Display(Name = "Asset Code")]
    public string AssetCode { get; set; } = default!;

    [Display(Name = "Serial Number")]
    public string? SerialNumber { get; set; }

    [Display(Name = "Condition")]
    public string? Condition { get; set; }

    [Display(Name = "Purchase Date")]
    public DateTime? PurchaseDate { get; set; }

    [Display(Name = "Transaction Date")]
    public DateTime TransactionDate { get; set; }

    [Display(Name = "Purchase Price")]
    public decimal? PurchasePrice { get; set; }

    [Display(Name = "Notes")]
    public string? Notes { get; set; }
}